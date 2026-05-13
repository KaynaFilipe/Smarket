import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
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
export type StatusProduto = "pendente" | "concluido";
export type StatusLista = "on_market" | "finalizada";

export type ProdutoCompra = {
  id: number;
  nome: string;
  categoria: Categoria;
  quantidade: number;
  cor: string;
  status: StatusProduto;
  valorUnitario?: number;
  subtotal?: number;
  compradoEm?: string;
};

export type ListaCompra = {
  id: string;
  nome: string;
  data: string;
  status: StatusLista;
  produtos: ProdutoCompra[];
  categorias: Categoria[];
  valores: {
    total: number;
    quantidadeProdutos: number;
  };
  totais: {
    totalFinal: number;
    porCategoria: Record<string, number>;
  };
  notaFiscalImage?: string | null;
  criadaEm?: unknown;
  atualizadaEm?: unknown;
  finalizadaEm?: unknown;
};

type NovoItem = Pick<ProdutoCompra, "nome" | "categoria" | "quantidade">;

type GastoCategoria = {
  nome: Categoria;
  valor: number;
  percentual: number;
  cor: string;
  quantidadeItens: number;
};

type BudgetContextValue = {
  categorias: Categoria[];
  items: ProdutoCompra[];
  listaAtiva: ListaCompra | null;
  listasFinalizadas: ListaCompra[];
  orcamentoTotal: number;
  valorGasto: number;
  orcamentoRestante: number;
  gastosPorCategoria: GastoCategoria[];
  carregandoDados: boolean;
  definirOrcamentoTotal: (valor: number) => void;
  adicionarItem: (item: NovoItem) => Promise<void>;
  deletarItem: (id: number) => Promise<void>;
  incrementarQuantidade: (id: number) => Promise<void>;
  decrementarQuantidade: (id: number) => Promise<void>;
  definirQuantidade: (id: number, quantidade: number) => Promise<void>;
  concluirProduto: (id: number, valorUnitario: number) => Promise<void>;
  reabrirProduto: (id: number) => Promise<void>;
  finalizarLista: (nome?: string) => Promise<void>;
  listarItensPorCategoria: (categoria: Categoria) => ProdutoCompra[];
  totalCategoria: (categoria: Categoria) => number;
};

type BudgetDoc = {
  orcamentoTotal?: number;
};

const categorias: Categoria[] = ["Mercado", "Frios", "Limpeza", "Pets"];
const corCategoria: Record<Categoria, string> = {
  Mercado: "#f2c94c",
  Frios: "#6c5ce7",
  Limpeza: "#2f9e72",
  Pets: "#e17055",
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

const usuarioDocRef = (uid: string) => doc(db, "users", uid);
const budgetDocRef = (uid: string) => doc(db, "users", uid, "budget", "current");
const shoppingListsRef = (uid: string) => collection(db, "users", uid, "shoppingLists");

const calcularTotais = (produtos: ProdutoCompra[]) => {
  const produtosComprados = produtos.filter((produto) => produto.status === "concluido");
  const porCategoria = produtosComprados.reduce<Record<string, number>>((acc, produto) => {
    acc[produto.categoria] = (acc[produto.categoria] ?? 0) + (produto.subtotal ?? 0);
    return acc;
  }, {});
  const totalFinal = produtosComprados.reduce((total, produto) => total + (produto.subtotal ?? 0), 0);

  return {
    categorias: Array.from(new Set(produtos.map((produto) => produto.categoria))),
    valores: {
      total: totalFinal,
      quantidadeProdutos: produtos.reduce((total, produto) => total + produto.quantidade, 0),
    },
    totais: {
      totalFinal,
      porCategoria,
    },
  };
};

const normalizarProduto = (produto: Partial<ProdutoCompra>): ProdutoCompra => {
  const categoria = (produto.categoria ?? "Mercado") as Categoria;
  const produtoNormalizado: ProdutoCompra = {
    id: typeof produto.id === "number" ? produto.id : Date.now(),
    nome: produto.nome ?? "",
    categoria,
    quantidade: typeof produto.quantidade === "number" ? produto.quantidade : 1,
    cor: produto.cor ?? corCategoria[categoria],
    status: produto.status ?? "pendente",
  };

  if (typeof produto.valorUnitario === "number") {
    produtoNormalizado.valorUnitario = produto.valorUnitario;
  }

  if (typeof produto.subtotal === "number") {
    produtoNormalizado.subtotal = produto.subtotal;
  }

  if (produto.compradoEm) {
    produtoNormalizado.compradoEm = produto.compradoEm;
  }

  return produtoNormalizado;
};

const normalizarLista = (id: string, dados: Partial<ListaCompra>): ListaCompra => {
  const produtos = Array.isArray(dados.produtos)
    ? dados.produtos.map((produto) => normalizarProduto(produto))
    : [];
  const totaisCalculados = calcularTotais(produtos);

  return {
    id,
    nome: dados.nome ?? "Lista do mercado",
    data: dados.data ?? new Date().toISOString(),
    status: dados.status ?? "on_market",
    produtos,
    categorias: dados.categorias ?? totaisCalculados.categorias,
    valores: dados.valores ?? totaisCalculados.valores,
    totais: dados.totais ?? totaisCalculados.totais,
    notaFiscalImage: dados.notaFiscalImage ?? null,
    criadaEm: dados.criadaEm,
    atualizadaEm: dados.atualizadaEm,
    finalizadaEm: dados.finalizadaEm,
  };
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [orcamentoTotal, setOrcamentoTotal] = useState(0);
  const [listas, setListas] = useState<ListaCompra[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const usuarioAtualRef = useRef<string | null>(null);
  const listaAtivaRef = useRef<ListaCompra | null>(null);

  const listasFinalizadas = useMemo(
    () => listas.filter((lista) => lista.status === "finalizada"),
    [listas]
  );
  const listaAtiva = useMemo(
    () => listas.find((lista) => lista.status === "on_market") ?? null,
    [listas]
  );

  useEffect(() => {
    listaAtivaRef.current = listaAtiva;
  }, [listaAtiva]);

  useEffect(() => {
    let unsubscribeBudget: (() => void) | undefined;
    let unsubscribeLists: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeBudget?.();
      unsubscribeLists?.();
      setCarregandoDados(true);

      if (!user) {
        usuarioAtualRef.current = null;
        listaAtivaRef.current = null;
        setOrcamentoTotal(0);
        setListas([]);
        setCarregandoDados(false);
        return;
      }

      usuarioAtualRef.current = user.uid;

      await setDoc(
        usuarioDocRef(user.uid),
        {
          email: user.email ?? "",
          perfil: "padrao",
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );

      unsubscribeBudget = onSnapshot(budgetDocRef(user.uid), (snapshot) => {
        const dados = snapshot.data() as BudgetDoc | undefined;
        setOrcamentoTotal(typeof dados?.orcamentoTotal === "number" ? dados.orcamentoTotal : 0);
      });

      unsubscribeLists = onSnapshot(
        query(shoppingListsRef(user.uid), orderBy("data", "desc")),
        (snapshot) => {
          setListas(
            snapshot.docs.map((documento) =>
              normalizarLista(documento.id, documento.data() as Partial<ListaCompra>)
            )
          );
          setCarregandoDados(false);
        },
        () => {
          setListas([]);
          setCarregandoDados(false);
        }
      );
    });

    return () => {
      unsubscribeBudget?.();
      unsubscribeLists?.();
      unsubscribeAuth();
    };
  }, []);

  const salvarOrcamento = async (valor: number) => {
    const uid = usuarioAtualRef.current;
    setOrcamentoTotal(valor);

    if (!uid) {
      return;
    }

    await setDoc(
      budgetDocRef(uid),
      {
        orcamentoTotal: valor,
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const criarListaSeNecessario = async () => {
    const uid = usuarioAtualRef.current;

    if (!uid) {
      throw new Error("Usuario nao autenticado.");
    }

    if (listaAtivaRef.current) {
      return listaAtivaRef.current.id;
    }

    const agora = new Date().toISOString();
    const documento = await addDoc(shoppingListsRef(uid), {
      nome: `Compra ${new Date().toLocaleDateString("pt-BR")}`,
      data: agora,
      status: "on_market",
      produtos: [],
      categorias: [],
      valores: { total: 0, quantidadeProdutos: 0 },
      totais: { totalFinal: 0, porCategoria: {} },
      notaFiscalImage: null,
      criadaEm: serverTimestamp(),
      atualizadaEm: serverTimestamp(),
    });

    return documento.id;
  };

  const atualizarProdutosListaAtiva = async (produtos: ProdutoCompra[], listaIdOverride?: string) => {
    const uid = usuarioAtualRef.current;
    const listaId = listaIdOverride ?? listaAtivaRef.current?.id;

    if (!uid || !listaId) {
      return;
    }

    const totais = calcularTotais(produtos);
    await updateDoc(doc(db, "users", uid, "shoppingLists", listaId), {
      produtos,
      categorias: totais.categorias,
      valores: totais.valores,
      totais: totais.totais,
      atualizadaEm: serverTimestamp(),
    });
  };

  const valorGasto = useMemo(
    () => listasFinalizadas.reduce((total, lista) => total + lista.totais.totalFinal, 0),
    [listasFinalizadas]
  );
  const orcamentoRestante = orcamentoTotal - valorGasto;

  const gastosPorCategoria = useMemo(() => {
    const agrupado = listasFinalizadas.reduce<Record<Categoria, { valor: number; quantidade: number }>>(
      (acc, lista) => {
        lista.produtos
          .filter((produto) => produto.status === "concluido")
          .forEach((produto) => {
            acc[produto.categoria] = acc[produto.categoria] ?? { valor: 0, quantidade: 0 };
            acc[produto.categoria].valor += produto.subtotal ?? 0;
            acc[produto.categoria].quantidade += produto.quantidade;
          });
        return acc;
      },
      {} as Record<Categoria, { valor: number; quantidade: number }>
    );

    return categorias
      .map((categoria) => {
        const item = agrupado[categoria] ?? { valor: 0, quantidade: 0 };
        return {
          nome: categoria,
          valor: item.valor,
          percentual: valorGasto === 0 ? 0 : (item.valor / valorGasto) * 100,
          cor: corCategoria[categoria],
          quantidadeItens: item.quantidade,
        };
      })
      .filter((categoria) => categoria.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [listasFinalizadas, valorGasto]);

  const value = useMemo<BudgetContextValue>(
    () => ({
      categorias,
      items: listaAtiva?.produtos ?? [],
      listaAtiva,
      listasFinalizadas,
      orcamentoTotal,
      valorGasto,
      orcamentoRestante,
      gastosPorCategoria,
      carregandoDados,
      definirOrcamentoTotal: (valor) => {
        void salvarOrcamento(valor);
      },
      adicionarItem: async (item) => {
        const listaId = await criarListaSeNecessario();
        const listaAtual = listaAtivaRef.current;
        const produtosAtuais = listaAtual?.id === listaId ? listaAtual.produtos : [];
        const produtoNovo = normalizarProduto({
          ...item,
          id: Date.now(),
          cor: corCategoria[item.categoria],
          status: "pendente",
        });

        await atualizarProdutosListaAtiva([...produtosAtuais, produtoNovo], listaId);
      },
      deletarItem: async (id) => {
        await atualizarProdutosListaAtiva((listaAtivaRef.current?.produtos ?? []).filter((item) => item.id !== id));
      },
      incrementarQuantidade: async (id) => {
        await atualizarProdutosListaAtiva(
          (listaAtivaRef.current?.produtos ?? []).map((item) =>
            item.id === id && item.status === "pendente"
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          )
        );
      },
      decrementarQuantidade: async (id) => {
        await atualizarProdutosListaAtiva(
          (listaAtivaRef.current?.produtos ?? []).map((item) =>
            item.id === id && item.status === "pendente"
              ? { ...item, quantidade: Math.max(1, item.quantidade - 1) }
              : item
          )
        );
      },
      definirQuantidade: async (id, quantidade) => {
        await atualizarProdutosListaAtiva(
          (listaAtivaRef.current?.produtos ?? []).map((item) =>
            item.id === id && item.status === "pendente"
              ? { ...item, quantidade: Math.max(1, quantidade) }
              : item
          )
        );
      },
      concluirProduto: async (id, valorUnitario) => {
        await atualizarProdutosListaAtiva(
          (listaAtivaRef.current?.produtos ?? []).map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "concluido",
                  valorUnitario,
                  subtotal: valorUnitario * item.quantidade,
                  compradoEm: new Date().toISOString(),
                }
              : item
          )
        );
      },
      reabrirProduto: async (id) => {
        await atualizarProdutosListaAtiva(
          (listaAtivaRef.current?.produtos ?? []).map((item) => {
            if (item.id !== id) {
              return item;
            }

            const { valorUnitario, subtotal, compradoEm, ...produtoPendente } = item;
            void valorUnitario;
            void subtotal;
            void compradoEm;

            return {
              ...produtoPendente,
              status: "pendente",
            };
          })
        );
      },
      finalizarLista: async (nome) => {
        const uid = usuarioAtualRef.current;
        const lista = listaAtivaRef.current;

        if (!uid || !lista) {
          return;
        }

        const totais = calcularTotais(lista.produtos);
        await updateDoc(doc(db, "users", uid, "shoppingLists", lista.id), {
          nome: nome?.trim() || lista.nome,
          status: "finalizada",
          notaFiscalImage: null,
          notaFiscalStatus: "para_atualizacoes_futuras",
          categorias: totais.categorias,
          valores: totais.valores,
          totais: totais.totais,
          finalizadaEm: serverTimestamp(),
          atualizadaEm: serverTimestamp(),
        });
      },
      listarItensPorCategoria: (categoria) =>
        listasFinalizadas.flatMap((lista) =>
          lista.produtos.filter((item) => item.categoria === categoria && item.status === "concluido")
        ),
      totalCategoria: (categoria) =>
        listasFinalizadas.reduce(
          (total, lista) =>
            total +
            lista.produtos
              .filter((item) => item.categoria === categoria && item.status === "concluido")
              .reduce((subtotal, item) => subtotal + (item.subtotal ?? 0), 0),
          0
        ),
    }),
    [
      carregandoDados,
      gastosPorCategoria,
      listaAtiva,
      listasFinalizadas,
      orcamentoRestante,
      orcamentoTotal,
      valorGasto,
    ]
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
