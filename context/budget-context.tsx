import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { auth, db } from "../firebaseConfig";

export type Categoria = "Mercado" | "Frios" | "Limpeza" | "Pets";

export type Item = {
  id: number;
  nome: string;
  cor: string;
  quantidade: number;
  categoria: Categoria;
  valorUnitario: number;
};

type NovoItem = Omit<Item, "id" | "cor">;

type GastoCategoria = {
  nome: Categoria;
  valor: number;
  percentual: number;
  cor: string;
  quantidadeItens: number;
};

type BudgetContextValue = {
  categorias: Categoria[];
  items: Item[];
  orcamentoTotal: number;
  valorGasto: number;
  orcamentoRestante: number;
  gastosPorCategoria: GastoCategoria[];
  carregandoDados: boolean;
  definirOrcamentoTotal: (valor: number) => void;
  adicionarItem: (item: NovoItem) => void;
  deletarItem: (id: number) => void;
  incrementarQuantidade: (id: number) => void;
  decrementarQuantidade: (id: number) => void;
  listarItensPorCategoria: (categoria: Categoria) => Item[];
  totalCategoria: (categoria: Categoria) => number;
};

type DadosSalvos = {
  orcamentoTotal: number;
  items: Item[];
};

const categorias: Categoria[] = ["Mercado", "Frios", "Limpeza", "Pets"];
const corCategoria: Record<Categoria, string> = {
  Mercado: "#f2c94c",
  Frios: "#6c5ce7",
  Limpeza: "#7c6df2",
  Pets: "#e17055",
};

const dadosIniciais: DadosSalvos = {
  orcamentoTotal: 0,
  items: [],
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

const calcularValorItem = (item: Pick<Item, "quantidade" | "valorUnitario">) =>
  item.quantidade * item.valorUnitario;

// Garante que as cores dos itens continuem coerentes mesmo ao recarregar dados antigos.
const normalizarItem = (item: Item): Item => ({
  ...item,
  cor: corCategoria[item.categoria],
});

const usuarioDocRef = (uid: string) => doc(db, "usuarios", uid);
const orcamentoDocRef = (uid: string) => doc(db, "usuarios", uid, "orcamento", "atual");

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [orcamentoTotal, setOrcamentoTotal] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const usuarioAtualRef = useRef<string | null>(null);
  const podeSalvarRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Evita gravar no Firestore antes de terminar a leitura inicial do usuario atual.
      podeSalvarRef.current = false;
      setCarregandoDados(true);

      if (!user) {
        usuarioAtualRef.current = null;
        setOrcamentoTotal(dadosIniciais.orcamentoTotal);
        setItems(dadosIniciais.items);
        setCarregandoDados(false);
        return;
      }

      usuarioAtualRef.current = user.uid;
      const perfilRef = usuarioDocRef(user.uid);
      const documentoRef = orcamentoDocRef(user.uid);

      try {
        const perfilSnapshot = await getDoc(perfilRef);

        // Se o perfil nao existir ainda, o app cria uma estrutura basica para contas antigas.
        if (!perfilSnapshot.exists()) {
          await setDoc(
            perfilRef,
            {
              email: user.email ?? "",
              perfil: "padrao",
              criadoEm: serverTimestamp(),
              atualizadoEm: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          await setDoc(
            perfilRef,
            {
              email: user.email ?? "",
              atualizadoEm: serverTimestamp(),
            },
            { merge: true }
          );
        }

        const snapshot = await getDoc(documentoRef);

        if (snapshot.exists()) {
          const dados = snapshot.data() as Partial<DadosSalvos>;
          setOrcamentoTotal(typeof dados.orcamentoTotal === "number" ? dados.orcamentoTotal : 0);
          setItems(Array.isArray(dados.items) ? dados.items.map((item) => normalizarItem(item as Item)) : []);
        } else {
          setOrcamentoTotal(0);
          setItems([]);
          await setDoc(documentoRef, {
            ...dadosIniciais,
            atualizadoEm: serverTimestamp(),
          });
        }
      } catch {
        setOrcamentoTotal(0);
        setItems([]);
      } finally {
        podeSalvarRef.current = true;
        setCarregandoDados(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const uid = usuarioAtualRef.current;

    if (!uid || !podeSalvarRef.current || carregandoDados) {
      return;
    }

    const salvar = async () => {
      try {
        await setDoc(orcamentoDocRef(uid), {
          orcamentoTotal,
          items,
          atualizadoEm: serverTimestamp(),
        });
      } catch {
        return;
      }
    };

    salvar();
  }, [carregandoDados, items, orcamentoTotal]);

  const valorGasto = useMemo(
    () => items.reduce((total, item) => total + calcularValorItem(item), 0),
    [items]
  );

  const orcamentoRestante = orcamentoTotal - valorGasto;

  const gastosPorCategoria = useMemo(() => {
    return categorias
      .map((categoria) => {
        // O resumo da categoria reaproveita a mesma fonte da tela principal.
        const itensDaCategoria = items.filter((item) => item.categoria === categoria);
        const valor = itensDaCategoria.reduce((total, item) => total + calcularValorItem(item), 0);
        const quantidadeItens = itensDaCategoria.reduce((total, item) => total + item.quantidade, 0);

        return {
          nome: categoria,
          valor,
          percentual: valorGasto === 0 ? 0 : (valor / valorGasto) * 100,
          cor: corCategoria[categoria],
          quantidadeItens,
        };
      })
      .filter((categoria) => categoria.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [items, valorGasto]);

  const value = useMemo<BudgetContextValue>(
    () => ({
      categorias,
      items,
      orcamentoTotal,
      valorGasto,
      orcamentoRestante,
      gastosPorCategoria,
      carregandoDados,
      definirOrcamentoTotal: (valor) => {
        setOrcamentoTotal(valor);
      },
      adicionarItem: (item) => {
        // Cada item novo recebe um id simples e a cor padrao da categoria escolhida.
        setItems((estadoAtual) => [
          ...estadoAtual,
          normalizarItem({
            ...item,
            id: Date.now(),
            cor: corCategoria[item.categoria],
          }),
        ]);
      },
      deletarItem: (id) => {
        setItems((estadoAtual) => estadoAtual.filter((item) => item.id !== id));
      },
      incrementarQuantidade: (id) => {
        setItems((estadoAtual) =>
          estadoAtual.map((item) =>
            item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
          )
        );
      },
      decrementarQuantidade: (id) => {
        setItems((estadoAtual) =>
          estadoAtual.map((item) => {
            if (item.id !== id) {
              return item;
            }

            return {
              ...item,
              quantidade: Math.max(0, item.quantidade - 1),
            };
          })
        );
      },
      listarItensPorCategoria: (categoria) =>
        items.filter((item) => item.categoria === categoria && item.quantidade > 0),
      totalCategoria: (categoria) =>
        items
          .filter((item) => item.categoria === categoria)
          .reduce((total, item) => total + calcularValorItem(item), 0),
    }),
    [carregandoDados, gastosPorCategoria, items, orcamentoRestante, orcamentoTotal, valorGasto]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget must be used within BudgetProvider");
  }

  return context;
}
