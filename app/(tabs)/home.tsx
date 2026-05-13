import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useBudget } from "@/context/budget-context";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { auth } from "../../firebaseConfig";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Home() {
  const router = useRouter();
  const {
    carregandoDados,
    listaAtiva,
    orcamentoTotal,
    valorGasto,
    orcamentoRestante,
    definirOrcamentoTotal,
  } = useBudget();
  const [orcamentoInput, setOrcamentoInput] = useState(String(orcamentoTotal));
  const saindoRef = useRef(false);

  useEffect(() => {
    setOrcamentoInput(String(orcamentoTotal));
  }, [orcamentoTotal]);

  // O filtro permite visualizar todos os itens ou apenas uma categoria por vez.
  const percentualGasto = orcamentoTotal === 0 ? 0 : (valorGasto / orcamentoTotal) * 100;

  const produtosAtivos = listaAtiva?.produtos ?? [];
  const produtosPendentes = produtosAtivos.filter((item) => item.status === "pendente").length;
  const produtosConcluidos = produtosAtivos.filter((item) => item.status === "concluido").length;

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Carregando seus dados...</Text>
        </View>
      </LinearGradient>
    );
  }

  const salvarOrcamento = () => {
    const valorNormalizado = Number(orcamentoInput.replace(",", "."));

    if (Number.isNaN(valorNormalizado) || valorNormalizado <= 0) {
      alert("Orcamento invalido. Digite um valor maior que zero.");
      return;
    }

    definirOrcamentoTotal(valorNormalizado);
  };

  const sairDaConta = async () => {
    if (saindoRef.current) {
      return;
    }

    saindoRef.current = true;
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      saindoRef.current = false;
      alert("Nao foi possivel sair agora.");
    }
  };

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <BackButton fallback="/" />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={sairDaConta}
            disabled={false}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={18}
              color="#fff"
            />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

          <Text style={styles.title}>Orcamento</Text>
          <Text style={styles.month}>Janeiro 2026</Text>

        <View style={styles.orcamentoEditor}>
          <Text style={styles.orcamentoLabel}>Orcamento total</Text>
          <View style={styles.orcamentoRow}>
            <TextInput
              value={orcamentoInput}
              onChangeText={setOrcamentoInput}
              keyboardType="decimal-pad"
              style={styles.orcamentoInput}
              placeholder="Digite o valor"
              placeholderTextColor="#88958d"
            />
            <TouchableOpacity style={styles.orcamentoButton} onPress={salvarOrcamento}>
              <Text style={styles.orcamentoButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.value}>{formatarMoeda(orcamentoTotal)}</Text>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progress,
              {
                width: `${Math.min(Math.max(percentualGasto, 0), 100)}%`,
                backgroundColor: orcamentoRestante < 0 ? "#c0392b" : "#2f5d45",
              },
            ]}
          />
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Orcamento Restante</Text>
          <Text style={styles.label}>Valor Gasto</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text
            style={[
              styles.labelValue,
              orcamentoRestante < 0 && styles.labelValueNegative,
            ]}>
            {formatarMoeda(orcamentoRestante)}
          </Text>
          <Text style={styles.labelValue}>{formatarMoeda(valorGasto)}</Text>
        </View>

        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Fluxo de compras</Text>
          <Text style={styles.flowText}>
            Adicionar Produtos {">"} On Market {">"} Finalizacao {">"} Gastos
          </Text>
          <View style={styles.flowStats}>
            <View style={styles.flowStat}>
              <Text style={styles.flowStatValue}>{produtosPendentes}</Text>
              <Text style={styles.flowStatLabel}>pendentes</Text>
            </View>
            <View style={styles.flowStat}>
              <Text style={styles.flowStatValue}>{produtosConcluidos}</Text>
              <Text style={styles.flowStatLabel}>concluidos</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.onMarketButton}
          onPress={() => router.push("/(tabs)/on-market")}>
          <Text style={styles.onMarketButtonText}>Abrir On Market</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (!saindoRef.current) {
              router.push("/(tabs)/add");
            }
          }}
          activeOpacity={0.7}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    height: "88%",
    backgroundColor: "#e9eceb",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2f5d45",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2f5d45",
  },
  month: {
    textAlign: "center",
    color: "#666",
    marginBottom: 14,
    fontSize: 14,
  },
  orcamentoEditor: {
    backgroundColor: "#dce7e0",
    borderRadius: 18,
    padding: 12,
  },
  orcamentoLabel: {
    fontSize: 13,
    color: "#486756",
    marginBottom: 8,
    fontWeight: "600",
  },
  orcamentoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orcamentoInput: {
    flex: 1,
    backgroundColor: "#f7faf8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#2f5d45",
    fontSize: 16,
  },
  orcamentoButton: {
    backgroundColor: "#2f5d45",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orcamentoButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  value: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 14,
    color: "#2f5d45",
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#d3dcd7",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 15,
  },
  progress: {
    height: "100%",
    borderRadius: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  labelValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  labelValueNegative: {
    color: "#c0392b",
  },
  categoriesScroll: {
    marginTop: 20,
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 2,
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#d3dcd7",
    borderRadius: 20,
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: "#2f5d45",
  },
  categoryText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
  listaContainer: {
    marginTop: 20,
    flex: 1,
  },
  item: {
    marginBottom: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  itemTotals: {
    alignItems: "flex-end",
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: "58%",
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  itemValor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  itemUnitario: {
    fontSize: 11,
    color: "#66766d",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  btnSmall: {
    width: 32,
    height: 32,
    backgroundColor: "#cde3d7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  btnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  qty: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  delete: {
    marginLeft: 10,
    width: 32,
    height: 32,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#2f5d45",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  flowCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  flowTitle: {
    color: "#2f5d45",
    fontSize: 17,
    fontWeight: "800",
  },
  flowText: {
    color: "#62756a",
    fontSize: 13,
  },
  flowStats: {
    flexDirection: "row",
    gap: 10,
  },
  flowStat: {
    flex: 1,
    backgroundColor: "#e8f2ec",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  flowStatValue: {
    color: "#2f5d45",
    fontSize: 24,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  flowStatLabel: {
    color: "#607168",
    fontSize: 12,
    fontWeight: "700",
  },
  onMarketButton: {
    backgroundColor: "#2f5d45",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 14,
  },
  onMarketButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  loadingCard: {
    width: "84%",
    backgroundColor: "#e9eceb",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  loadingText: {
    color: "#2f5d45",
    fontSize: 16,
    fontWeight: "600",
  },
});
