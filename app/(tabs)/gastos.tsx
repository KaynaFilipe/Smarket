import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBudget } from "@/context/budget-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Gastos() {
  const router = useRouter();
  const { carregandoDados, valorGasto, gastosPorCategoria } = useBudget();
  const maiorCategoria = gastosPorCategoria[0];

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Carregando resumo...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerIcon}>
            <IconSymbol name="chart.bar.fill" size={24} color="#2f5d45" />
          </View>
          <Text style={styles.title}>Resumo do Mes</Text>
          <Text style={styles.subtitle}>Janeiro 2026</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Total Gasto</Text>
          <Text style={styles.value}>{formatarMoeda(valorGasto)}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Media diaria</Text>
              <Text style={styles.statValue}>
                {formatarMoeda(valorGasto === 0 ? 0 : valorGasto / 30)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Categorias ativas</Text>
              <Text style={styles.statValue}>{gastosPorCategoria.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Gastos por Categoria</Text>
          <Text style={styles.listSubtitle}>Toque para ver os itens de cada categoria</Text>
        </View>

        {gastosPorCategoria.map((item, index) => (
          <TouchableOpacity
            key={item.nome}
            style={[styles.item, index === 0 && styles.firstItem]}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/categoria/[categoria]",
                params: { categoria: item.nome },
              })
            }>
            <View style={styles.itemLeft}>
              <View style={[styles.badge, { backgroundColor: item.cor }]}>
                <Text style={styles.badgeText}>{item.nome.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPercentual}>{item.percentual.toFixed(1)}% do total</Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>{formatarMoeda(item.valor)}</Text>
              <Text style={styles.itemCount}>{item.quantidadeItens} unidades</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${item.percentual}%`, backgroundColor: item.cor },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Dica de economia</Text>
          <Text style={styles.tipsText}>
            {maiorCategoria
              ? `A categoria "${maiorCategoria.nome}" lidera seus gastos. Toque nela para ver exatamente onde o valor foi usado.`
              : "Adicione itens para ver um resumo detalhado dos seus gastos."}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#e9eceb",
    margin: 20,
    marginTop: 40,
    padding: 25,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2f5d45",
  },
  headerIcon: {
    alignItems: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 5,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#d3dcd7",
    marginVertical: 15,
  },
  label: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2f5d45",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#d3dcd7",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#d3dcd7",
    marginHorizontal: 10,
  },
  listHeader: {
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#d3dcd7",
    marginTop: 2,
  },
  item: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstItem: {
    borderWidth: 2,
    borderColor: "#f2c94c",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPercentual: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  itemRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f5d45",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 11,
    color: "#6c7a73",
    marginBottom: 6,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#e9eceb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  tipsCard: {
    backgroundColor: "#fff9e6",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#f2c94c",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f5d45",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  loadingCard: {
    flex: 1,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9eceb",
    borderRadius: 24,
  },
  loadingText: {
    color: "#2f5d45",
    fontSize: 16,
    fontWeight: "600",
  },
});
