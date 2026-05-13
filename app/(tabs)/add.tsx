import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BackButton } from "@/components/back-button";
import { Categoria, useBudget } from "@/context/budget-context";

export default function AddItemScreen() {
  const router = useRouter();
  const { carregandoDados, categorias, adicionarItem } = useBudget();
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Mercado");
  const [quantidade, setQuantidade] = useState("");

  const salvar = async () => {
    const quantidadeNumerica = Number(quantidade);

    if (!nome.trim()) {
      Alert.alert("Nome obrigatorio", "Informe o nome do item.");
      return;
    }

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica <= 0) {
      Alert.alert("Quantidade invalida", "Informe uma quantidade inteira maior que zero.");
      return;
    }

    try {
      await adicionarItem({
        nome: nome.trim(),
        categoria,
        quantidade: quantidadeNumerica,
      });

      setNome("");
      setQuantidade("");
      Alert.alert("Produto adicionado", "Ele ja esta na lista On Market.");
    } catch {
      Alert.alert("Falha ao salvar", "Nao foi possivel adicionar o produto agora.");
    }
  };

  if (carregandoDados) {
    return (
      <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Preparando formulario...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5f9f7a", "#2f5d45"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.topBar}>
            <BackButton fallback="/(tabs)" />
          </View>
          <Text style={styles.title}>Adicionar Produto</Text>
          <Text style={styles.subtitle}>Os produtos entram primeiro no On Market</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            placeholder="Ex.: Cafe"
            placeholderTextColor="#90a096"
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categories}>
            {/* As opcoes sao carregadas do contexto para manter telas e regras sincronizadas. */}
            {categorias.map((opcao) => (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.category,
                  categoria === opcao && styles.categoryActive,
                ]}
                onPress={() => setCategoria(opcao)}>
                <Text
                  style={[
                    styles.categoryText,
                    categoria === opcao && styles.categoryTextActive,
                  ]}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            value={quantidade}
            onChangeText={setQuantidade}
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Ex.: 3"
            placeholderTextColor="#90a096"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={salvar}>
            <Text style={styles.primaryButtonText}>Enviar para On Market</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.onMarketButton}
            onPress={() => router.push("/(tabs)/on-market")}>
            <Text style={styles.onMarketButtonText}>Abrir On Market</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    padding: 20,
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
    shadowOpacity: 0.22,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topBar: {
    minHeight: 32,
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2f5d45",
  },
  subtitle: {
    textAlign: "center",
    color: "#66766d",
    marginTop: 6,
    marginBottom: 22,
  },
  label: {
    color: "#486756",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#f7faf8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#2f5d45",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  category: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#d3dcd7",
  },
  categoryActive: {
    backgroundColor: "#2f5d45",
  },
  categoryText: {
    color: "#42524a",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  primaryButton: {
    backgroundColor: "#2f5d45",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#d7dfda",
  },
  onMarketButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#f2c94c",
  },
  onMarketButtonText: {
    color: "#294536",
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: "#3f5d4d",
    fontWeight: "700",
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
