import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BackButton } from "@/components/back-button";
import { Categoria, useBudget } from "@/context/budget-context";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function CategoriaDetalheScreen() {
  const params = useLocalSearchParams<{ categoria?: string }>();
  // A rota dinamica chega como string; aqui convertemos para o tipo usado pelo contexto.
  const categoria = (params.categoria ?? "Mercado") as Categoria;
  const { carregandoDados, listarItensPorCategoria, totalCategoria } = useBudget();
  const itens = listarItensPorCategoria(categoria);
  const total = totalCategoria(categoria);

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Carregando categoria...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.topBar}>
            <BackButton fallback="/(tabs)/gastos" />
          </View>

          <Text style={styles.title}>{categoria}</Text>
          <Text style={styles.subtitle}>Detalhes do que foi gasto nessa categoria</Text>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total da categoria</Text>
            <Text style={styles.summaryValue}>{formatarMoeda(total)}</Text>
          </View>

          {itens.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum item encontrado nesta categoria.</Text>
            </View>
          ) : (
            itens.map((item) => (
              <View key={item.id} style={styles.item}>
                <View>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantidade} x {formatarMoeda(item.valorUnitario ?? 0)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatarMoeda(item.subtotal ?? item.quantidade * (item.valorUnitario ?? 0))}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#e9eceb",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  topBar: {
    minHeight: 32,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f5d45",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#66766d",
    marginTop: 6,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#dce7e0",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },
  summaryLabel: {
    color: "#486756",
    fontWeight: "600",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
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
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34443c",
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#6d7c74",
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2f5d45",
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#718078",
    textAlign: "center",
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
