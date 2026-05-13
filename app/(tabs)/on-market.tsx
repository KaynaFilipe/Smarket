import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProdutoCompra, useBudget } from "@/context/budget-context";

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function OnMarketScreen() {
  const router = useRouter();
  const {
    categorias,
    carregandoDados,
    listaAtiva,
    incrementarQuantidade,
    decrementarQuantidade,
    definirQuantidade,
    concluirProduto,
    reabrirProduto,
    finalizarLista,
  } = useBudget();
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoCompra | null>(null);
  const [valorUnitario, setValorUnitario] = useState("");
  const [modalNotaAberta, setModalNotaAberta] = useState(false);
  const [nomeCompra, setNomeCompra] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  const produtosAgrupados = useMemo(() => {
    const produtos = listaAtiva?.produtos ?? [];

    return categorias
      .map((categoria) => {
        const itens = produtos
          .filter((produto) => produto.categoria === categoria)
          .sort((a, b) => Number(a.status === "concluido") - Number(b.status === "concluido"));

        return { categoria, itens };
      })
      .filter((grupo) => grupo.itens.length > 0);
  }, [categorias, listaAtiva]);

  const totalParcial =
    listaAtiva?.produtos.reduce((total, produto) => total + (produto.subtotal ?? 0), 0) ?? 0;

  const abrirModalValor = (produto: ProdutoCompra) => {
    setProdutoSelecionado(produto);
    setValorUnitario(produto.valorUnitario ? String(produto.valorUnitario) : "");
  };

  const confirmarProduto = async () => {
    if (!produtoSelecionado) {
      return;
    }

    const valor = Number(valorUnitario.replace(",", "."));

    if (Number.isNaN(valor) || valor <= 0) {
      Alert.alert("Valor invalido", "Informe o valor unitario do produto.");
      return;
    }

    await concluirProduto(produtoSelecionado.id, valor);
    setProdutoSelecionado(null);
    setValorUnitario("");
  };

  const abrirFinalizacao = () => {
    setNomeCompra(listaAtiva?.nome ?? "");
    setModalNotaAberta(true);
  };

  const finalizar = async () => {
    try {
      setFinalizando(true);
      await finalizarLista(nomeCompra);
      setModalNotaAberta(false);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Falha ao finalizar", "Nao foi possivel finalizar a lista agora.");
    } finally {
      setFinalizando(false);
    }
  };

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Preparando On Market...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <BackButton fallback="/(tabs)" light />
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>On Market</Text>
          <Text style={styles.subtitle}>Lista ativa para usar durante a compra</Text>
          <Text style={styles.totalParcial}>{formatarMoeda(totalParcial)}</Text>
        </View>

        {!listaAtiva || listaAtiva.produtos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum produto pendente</Text>
            <Text style={styles.emptyText}>Adicione produtos para montar sua lista de mercado.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/(tabs)/add")}>
              <Text style={styles.primaryButtonText}>Adicionar Produtos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {produtosAgrupados.map((grupo) => (
              <View key={grupo.categoria} style={styles.section}>
                <Text style={styles.sectionTitle}>{grupo.categoria}</Text>
                {grupo.itens.map((produto) => (
                  <View
                    key={produto.id}
                    style={[
                      styles.productCard,
                      produto.status === "concluido" && styles.productCardDone,
                    ]}>
                    <View style={styles.productHeader}>
                      <View style={[styles.categoryDot, { backgroundColor: produto.cor }]} />
                      <View style={styles.productTextWrap}>
                        <Text
                          style={[
                            styles.productName,
                            produto.status === "concluido" && styles.productNameDone,
                          ]}>
                          {produto.nome}
                        </Text>
                        <Text style={styles.productMeta}>
                          {produto.status === "concluido"
                            ? `${formatarMoeda(produto.valorUnitario ?? 0)} un. - ${formatarMoeda(
                                produto.subtotal ?? 0
                              )}`
                            : "Pendente"}
                        </Text>
                      </View>
                      <View style={styles.quantityRow}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          disabled={produto.status === "concluido"}
                          onPress={() => decrementarQuantidade(produto.id)}>
                          <Text style={styles.qtyButtonText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          editable={produto.status === "pendente"}
                          keyboardType="number-pad"
                          value={String(produto.quantidade)}
                          onChangeText={(texto) => {
                            const quantidade = Number(texto);
                            if (Number.isInteger(quantidade) && quantidade > 0) {
                              void definirQuantidade(produto.id, quantidade);
                            }
                          }}
                          style={styles.qtyInput}
                        />
                        <TouchableOpacity
                          style={styles.qtyButton}
                          disabled={produto.status === "concluido"}
                          onPress={() => incrementarQuantidade(produto.id)}>
                          <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          produto.status === "concluido" && styles.checkboxDone,
                        ]}
                        onPress={() =>
                          produto.status === "concluido"
                            ? reabrirProduto(produto.id)
                            : abrirModalValor(produto)
                        }>
                        {produto.status === "concluido" ? (
                          <IconSymbol name="checkmark" size={18} color="#fff" />
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={styles.finishButton}
              onPress={abrirFinalizacao}
              disabled={finalizando}>
              <Text style={styles.finishButtonText}>
                {finalizando ? "Finalizando..." : "Finalizar Lista"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal transparent visible={!!produtoSelecionado} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Qual o valor unitario do produto?</Text>
            <Text style={styles.modalSubtitle}>{produtoSelecionado?.nome}</Text>
            <TextInput
              value={valorUnitario}
              onChangeText={setValorUnitario}
              keyboardType="decimal-pad"
              placeholder="Ex.: 8,90"
              placeholderTextColor="#8b9890"
              style={styles.modalInput}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={confirmarProduto}>
              <Text style={styles.primaryButtonText}>Salvar valor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setProdutoSelecionado(null)}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={modalNotaAberta} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Finalizar compra</Text>
            <Text style={styles.modalSubtitle}>Nome da compra</Text>
            <TextInput
              value={nomeCompra}
              onChangeText={setNomeCompra}
              placeholder="Ex.: Compra da semana"
              placeholderTextColor="#8b9890"
              style={styles.modalInput}
            />
            <Text style={styles.modalSubtitle}>Foto da nota fiscal</Text>
            <Text style={styles.futureText}>
              Recurso para atualizacoes futuras. A lista sera finalizada normalmente sem foto.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={finalizar} disabled={finalizando}>
              <Text style={styles.primaryButtonText}>
                {finalizando ? "Finalizando..." : "Finalizar sem foto"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalNotaAberta(false)}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    backgroundColor: "#e9eceb",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#2f5d45",
    fontWeight: "800",
  },
  subtitle: {
    color: "#61736a",
    marginTop: 5,
    textAlign: "center",
  },
  totalParcial: {
    color: "#2f5d45",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
    fontVariant: ["tabular-nums"],
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
  },
  productCardDone: {
    backgroundColor: "#d8ddda",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 42,
    borderRadius: 8,
  },
  productTextWrap: {
    flex: 1,
  },
  productName: {
    color: "#2c3e34",
    fontSize: 16,
    fontWeight: "800",
  },
  productNameDone: {
    color: "#78837d",
  },
  productMeta: {
    color: "#6f7d75",
    marginTop: 3,
    fontSize: 12,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2f5d45",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: "#2f5d45",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#d8eadf",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: "#2f5d45",
    fontSize: 17,
    fontWeight: "900",
  },
  qtyInput: {
    width: 38,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#eef5f1",
    textAlign: "center",
    color: "#2f5d45",
    fontWeight: "800",
  },
  finishButton: {
    backgroundColor: "#f2c94c",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#294536",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: "#e9eceb",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    color: "#2f5d45",
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    color: "#61736a",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#2f5d45",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#dce7e0",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    width: "100%",
  },
  secondaryButtonText: {
    color: "#2f5d45",
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(13, 36, 25, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#f4f7f5",
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    color: "#2f5d45",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#61736a",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#2f5d45",
    fontSize: 18,
  },
  futureText: {
    color: "#61736a",
    textAlign: "center",
    lineHeight: 20,
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
