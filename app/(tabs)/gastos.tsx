import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BackButton } from "@/components/back-button";
import { ListaCompra, useBudget } from "@/context/budget-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarData = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const nomeMes = (data: Date) =>
  data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

export default function Gastos() {
  const { carregandoDados, valorGasto, gastosPorCategoria, listasFinalizadas } = useBudget();
  const [mesAtual, setMesAtual] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [listaSelecionada, setListaSelecionada] = useState<ListaCompra | null>(null);

  const listasDoMes = useMemo(() => {
    return listasFinalizadas.filter((lista) => {
      const data = new Date(lista.data);
      return data.getMonth() === mesAtual.getMonth() && data.getFullYear() === mesAtual.getFullYear();
    });
  }, [listasFinalizadas, mesAtual]);

  const diasComCompra = useMemo(
    () => new Set(listasDoMes.map((lista) => new Date(lista.data).getDate())),
    [listasDoMes]
  );

  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const listasDoDia = diaSelecionado
    ? listasDoMes.filter((lista) => new Date(lista.data).getDate() === diaSelecionado)
    : [];
  const totalMes = listasDoMes.reduce((total, lista) => total + lista.totais.totalFinal, 0);
  const maiorCategoria = gastosPorCategoria[0];

  const navegarMes = (direcao: -1 | 1) => {
    setListaSelecionada(null);
    setDiaSelecionado(null);
    setMesAtual((data) => new Date(data.getFullYear(), data.getMonth() + direcao, 1));
  };

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Carregando gastos...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (listaSelecionada) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <BackButton
            fallback="/(tabs)/gastos"
            light
            onPress={() => setListaSelecionada(null)}
            style={styles.backButton}
          />

          <View style={styles.card}>
            <Text style={styles.title}>{listaSelecionada.nome}</Text>
            <Text style={styles.subtitle}>{formatarData(listaSelecionada.data)}</Text>
            <Text style={styles.value}>{formatarMoeda(listaSelecionada.totais.totalFinal)}</Text>

            {listaSelecionada.notaFiscalImage ? (
              <Image
                source={{ uri: listaSelecionada.notaFiscalImage }}
                style={styles.receiptImage}
                contentFit="cover"
              />
            ) : null}

            {listaSelecionada.categorias.map((categoria) => (
              <View key={categoria} style={styles.detailSection}>
                <Text style={styles.detailTitle}>{categoria}</Text>
                {listaSelecionada.produtos
                  .filter((produto) => produto.categoria === categoria)
                  .map((produto) => (
                    <View key={produto.id} style={styles.detailItem}>
                      <View>
                        <Text style={styles.itemName}>{produto.nome}</Text>
                        <Text style={styles.itemMeta}>
                          {produto.quantidade} x {formatarMoeda(produto.valorUnitario ?? 0)}
                        </Text>
                      </View>
                      <Text style={styles.itemValue}>{formatarMoeda(produto.subtotal ?? 0)}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <BackButton fallback="/(tabs)" light />
        </View>
        <View style={styles.card}>
          <View style={styles.headerIcon}>
            <IconSymbol name="chart.bar.fill" size={24} color="#2f5d45" />
          </View>
          <Text style={styles.title}>Gastos</Text>
          <Text style={styles.subtitle}>Resumo do mes</Text>
          <Text style={styles.value}>{formatarMoeda(totalMes)}</Text>
          <Text style={styles.smallCenter}>Total historico: {formatarMoeda(valorGasto)}</Text>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.monthButton} onPress={() => navegarMes(-1)}>
              <Text style={styles.monthButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{nomeMes(mesAtual)}</Text>
            <TouchableOpacity style={styles.monthButton} onPress={() => navegarMes(1)}>
              <Text style={styles.monthButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {Array.from({ length: diasNoMes }, (_, index) => index + 1).map((dia) => {
              const temCompra = diasComCompra.has(dia);
              const selecionado = diaSelecionado === dia;

              return (
                <TouchableOpacity
                  key={dia}
                  style={[styles.dayCell, selecionado && styles.dayCellActive]}
                  onPress={() => setDiaSelecionado(dia)}
                  disabled={!temCompra}>
                  <Text style={[styles.dayText, selecionado && styles.dayTextActive]}>{dia}</Text>
                  {temCompra ? <View style={styles.dayDot} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {diaSelecionado ? (
          <View style={styles.listBlock}>
            <Text style={styles.listTitle}>Listas do dia {diaSelecionado}</Text>
            {listasDoDia.map((lista) => (
              <TouchableOpacity
                key={lista.id}
                style={styles.purchaseCard}
                onPress={() => setListaSelecionada(lista)}>
                {lista.notaFiscalImage ? (
                  <Image source={{ uri: lista.notaFiscalImage }} style={styles.thumbnail} contentFit="cover" />
                ) : (
                  <View style={styles.thumbnailEmpty}>
                    <Text style={styles.thumbnailText}>NF</Text>
                  </View>
                )}
                <View style={styles.purchaseInfo}>
                  <Text style={styles.purchaseName}>{lista.nome}</Text>
                  <Text style={styles.purchaseDate}>{formatarData(lista.data)}</Text>
                </View>
                <Text style={styles.purchaseValue}>{formatarMoeda(lista.totais.totalFinal)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.listBlock}>
          <Text style={styles.listTitle}>Categorias</Text>
          {gastosPorCategoria.length === 0 ? (
            <Text style={styles.emptyText}>Finalize uma lista no On Market para gerar o resumo.</Text>
          ) : (
            gastosPorCategoria.map((item, index) => (
              <View key={item.nome} style={[styles.categoryRow, index === 0 && styles.categoryRowTop]}>
                <View style={[styles.categoryBadge, { backgroundColor: item.cor }]}>
                  <Text style={styles.categoryBadgeText}>{item.nome.charAt(0)}</Text>
                </View>
                <View style={styles.purchaseInfo}>
                  <Text style={styles.purchaseName}>{item.nome}</Text>
                  <Text style={styles.purchaseDate}>{item.percentual.toFixed(1)}% do total</Text>
                </View>
                <Text style={styles.purchaseValue}>{formatarMoeda(item.valor)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Dica</Text>
          <Text style={styles.tipText}>
            {maiorCategoria
              ? `${maiorCategoria.nome} lidera seus gastos finalizados neste periodo.`
              : "O resumo aparece aqui somente depois que uma lista for finalizada."}
          </Text>
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
    padding: 20,
    paddingBottom: 110,
    gap: 16,
  },
  topBar: {
    minHeight: 32,
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#e9eceb",
    padding: 22,
    borderRadius: 26,
    gap: 8,
  },
  headerIcon: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    color: "#2f5d45",
  },
  subtitle: {
    textAlign: "center",
    color: "#66766d",
  },
  value: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    color: "#2f5d45",
    fontVariant: ["tabular-nums"],
  },
  smallCenter: {
    textAlign: "center",
    color: "#66766d",
    fontSize: 12,
  },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#dce7e0",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    color: "#2f5d45",
    fontSize: 28,
    fontWeight: "900",
  },
  monthTitle: {
    color: "#2f5d45",
    fontSize: 17,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCell: {
    width: 38,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#edf3ef",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellActive: {
    backgroundColor: "#2f5d45",
  },
  dayText: {
    color: "#6c7a73",
    fontWeight: "800",
  },
  dayTextActive: {
    color: "#fff",
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#f2c94c",
    marginTop: 3,
  },
  listBlock: {
    gap: 10,
  },
  listTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  purchaseCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#dce7e0",
  },
  thumbnailEmpty: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#dce7e0",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailText: {
    color: "#2f5d45",
    fontWeight: "900",
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    color: "#2f3f36",
    fontWeight: "900",
  },
  purchaseDate: {
    color: "#6b7a72",
    fontSize: 12,
    marginTop: 3,
  },
  purchaseValue: {
    color: "#2f5d45",
    fontWeight: "900",
  },
  categoryRow: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryRowTop: {
    borderWidth: 2,
    borderColor: "#f2c94c",
  },
  categoryBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadgeText: {
    color: "#fff",
    fontWeight: "900",
  },
  tipCard: {
    backgroundColor: "#fff9e6",
    borderRadius: 18,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#f2c94c",
  },
  tipTitle: {
    color: "#2f5d45",
    fontWeight: "900",
    marginBottom: 5,
  },
  tipText: {
    color: "#555",
    lineHeight: 20,
  },
  detailSection: {
    gap: 8,
    marginTop: 8,
  },
  detailTitle: {
    color: "#2f5d45",
    fontSize: 17,
    fontWeight: "900",
  },
  detailItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    color: "#2f3f36",
    fontWeight: "900",
  },
  itemMeta: {
    color: "#6b7a72",
    marginTop: 3,
    fontSize: 12,
  },
  itemValue: {
    color: "#2f5d45",
    fontWeight: "900",
  },
  receiptImage: {
    width: "100%",
    height: 260,
    borderRadius: 18,
    backgroundColor: "#dce7e0",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  emptyText: {
    color: "#e9eceb",
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
