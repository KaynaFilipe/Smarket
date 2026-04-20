import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  // Estados principais
  const [orcamentoTotal] = useState(1840.00);
  const [orcamentoRestante, setOrcamentoRestante] = useState(1650.00);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Tudo");
  
  // Lista de itens
  const [items, setItems] = useState([
    { id: 1, nome: "Sabão em pó", cor: "#7c6df2", quantidade: 10, categoria: "Limpeza", valorUnitario: 15.50 },
    { id: 2, nome: "Batata", cor: "#f2c94c", quantidade: 30, categoria: "Mercado", valorUnitario: 4.50 },
    { id: 3, nome: "Queijo", cor: "#6c5ce7", quantidade: 5, categoria: "Frios", valorUnitario: 12.00 },
    { id: 4, nome: "Ração", cor: "#e17055", quantidade: 8, categoria: "Pets", valorUnitario: 45.00 },
    { id: 5, nome: "Frango", cor: "#00b894", quantidade: 12, categoria: "Frios", valorUnitario: 18.90 },
  ]);

  const categorias = ["Tudo", "Mercado", "Frios", "Limpeza", "Pets"];

  // Calcular valor gasto total
  const valorGasto = orcamentoTotal - orcamentoRestante;
  const percentualGasto = (valorGasto / orcamentoTotal) * 100;

  // Filtrar itens por categoria
  const itemsFiltrados = categoriaAtiva === "Tudo" 
    ? items 
    : items.filter(item => item.categoria === categoriaAtiva);

  // Calcular valor total de cada item
  const calcularValorItem = (quantidade, valorUnitario) => {
    return quantidade * valorUnitario;
  };

  // Incrementar quantidade
  const incrementarQuantidade = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const novaQuantidade = item.quantidade + 1;
        const novoValorItem = calcularValorItem(novaQuantidade, item.valorUnitario);
        const valorAntigoItem = calcularValorItem(item.quantidade, item.valorUnitario);
        const diferenca = novoValorItem - valorAntigoItem;
        
        // Atualizar orçamento restante
        setOrcamentoRestante(prev => prev - diferenca);
        
        return { ...item, quantidade: novaQuantidade };
      }
      return item;
    }));
  };

  // Decrementar quantidade
  const decrementarQuantidade = (id) => {
    setItems(items.map(item => {
      if (item.id === id && item.quantidade > 0) {
        const novaQuantidade = item.quantidade - 1;
        const novoValorItem = calcularValorItem(novaQuantidade, item.valorUnitario);
        const valorAntigoItem = calcularValorItem(item.quantidade, item.valorUnitario);
        const diferenca = valorAntigoItem - novoValorItem;
        
        // Atualizar orçamento restante
        setOrcamentoRestante(prev => prev + diferenca);
        
        return { ...item, quantidade: novaQuantidade };
      }
      return item;
    }));
  };

  // Deletar item
  const deletarItem = (id) => {
    Alert.alert(
      "Excluir Item",
      "Tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => {
            const itemParaDeletar = items.find(item => item.id === id);
            if (itemParaDeletar) {
              const valorItem = calcularValorItem(itemParaDeletar.quantidade, itemParaDeletar.valorUnitario);
              setOrcamentoRestante(prev => prev + valorItem);
              setItems(items.filter(item => item.id !== id));
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Adicionar novo item
  const adicionarItem = () => {
    Alert.alert(
      "Adicionar Item",
      "Funcionalidade em desenvolvimento!",
      [{ text: "OK" }]
    );
  };

  // Formatar moeda
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <LinearGradient
      colors={["#5f9f7a", "#2f5d45"]}
      style={styles.container}
    >
      {/* CARD PRINCIPAL */}
      <View style={styles.card}>
        
        <Text style={styles.title}>Orçamento</Text>
        <Text style={styles.month}>Janeiro 2026</Text>

        <Text style={styles.value}>{formatarMoeda(orcamentoTotal)}</Text>

        {/* BARRA DE PROGRESSO */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progress, 
              { width: `${Math.min(percentualGasto, 100)}%` }
            ]} 
          />
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Orçamento Restante</Text>
          <Text style={styles.label}>Valor Gasto</Text>
        </View>
        
        <View style={styles.rowBetween}>
          <Text style={styles.labelValue}>{formatarMoeda(orcamentoRestante)}</Text>
          <Text style={styles.labelValue}>{formatarMoeda(valorGasto)}</Text>
        </View>

        {/* CATEGORIAS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.category,
                categoriaAtiva === categoria && styles.categoryActive
              ]}
              onPress={() => setCategoriaAtiva(categoria)}
            >
              <Text
                style={[
                  styles.categoryText,
                  categoriaAtiva === categoria && styles.categoryTextActive
                ]}
              >
                {categoria}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LISTA DE ITENS */}
        <ScrollView 
          style={styles.listaContainer}
          showsVerticalScrollIndicator={false}
        >
          {itemsFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum item encontrado nesta categoria
              </Text>
            </View>
          ) : (
            itemsFiltrados.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemInfo}>
                  <View style={[styles.badge, { backgroundColor: item.cor }]}>
                    <Text style={styles.badgeText}>{item.nome}</Text>
                  </View>
                  <Text style={styles.itemValor}>
                    {formatarMoeda(calcularValorItem(item.quantidade, item.valorUnitario))}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.btnSmall}
                    onPress={() => incrementarQuantidade(item.id)}
                  >
                    <Text style={styles.btnText}>+</Text>
                  </TouchableOpacity>

                  <Text style={styles.qty}>{item.quantidade}</Text>

                  <TouchableOpacity 
                    style={styles.btnSmall}
                    onPress={() => decrementarQuantidade(item.id)}
                  >
                    <Text style={styles.btnText}>-</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.delete}
                    onPress={() => deletarItem(item.id)}
                  >
                    <Text style={styles.deleteText}>x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* BOTÃO + */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={adicionarItem}
          activeOpacity={0.7}
        >
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
    height: "85%",
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

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2f5d45",
  },

  month: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
    fontSize: 14,
  },

  value: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
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
    backgroundColor: "#2f5d45",
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
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
});