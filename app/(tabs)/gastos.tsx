import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Gastos() {
  // Estados
  const [totalGasto] = useState(1840.0);
  
  // Dados dos gastos por categoria
  const [gastosPorCategoria, setGastosPorCategoria] = useState([
    { id: 1, nome: "Frios e Carnes", valor: 450.0, cor: "#7c6df2", percentual: 24.5 },
    { id: 2, nome: "Limpeza", valor: 320.0, cor: "#f2c94c", percentual: 17.4 },
    { id: 3, nome: "Padaria", valor: 280.0, cor: "#6c5ce7", percentual: 15.2 },
    { id: 4, nome: "Higiene Pessoal", valor: 190.0, cor: "#e17055", percentual: 10.3 },
    { id: 5, nome: "Pets", valor: 600.0, cor: "#00b894", percentual: 32.6 },
  ]);

  // Ordenar por maior valor
  const gastosOrdenados = [...gastosPorCategoria].sort((a, b) => b.valor - a.valor);

  // Formatar valor para moeda
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CARD PRINCIPAL */}
        <View style={styles.card}>
          <Text style={styles.title}>Resumo do Mês</Text>
          <Text style={styles.subtitle}>Janeiro 2026</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Total Gasto</Text>
          <Text style={styles.value}>{formatarMoeda(totalGasto)}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Média Diária</Text>
              <Text style={styles.statValue}>{formatarMoeda(totalGasto / 30)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Previsão Mensal</Text>
              <Text style={styles.statValue}>{formatarMoeda(totalGasto)}</Text>
            </View>
          </View>
        </View>

        {/* TÍTULO DA LISTA */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Gastos por Categoria</Text>
          <Text style={styles.listSubtitle}>Maior para menor valor</Text>
        </View>

        {/* LISTA DE GASTOS */}
        {gastosOrdenados.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.item,
              index === 0 && styles.firstItem
            ]}
            activeOpacity={0.7}
            onPress={() => {
              // Aqui você pode adicionar navegação para detalhes da categoria
              console.log(`Ver detalhes de ${item.nome}`);
            }}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.badge, { backgroundColor: item.cor }]}>
                <Text style={styles.badgeText}>{item.nome.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPercentual}>{item.percentual}% do total</Text>
              </View>
            </View>
            
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>{formatarMoeda(item.valor)}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${item.percentual}%`, backgroundColor: item.cor }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* CARD DE DICAS */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dica de Economia</Text>
          <Text style={styles.tipsText}>
            A categoria "{gastosOrdenados[0]?.nome}" é onde você mais gasta. 
            Tente reduzir {gastosOrdenados[0]?.percentual}% dos gastos nessa categoria no próximo mês!
          </Text>
        </View>

        {/* ESPAÇO EXTRA PARA ROLAGEM */}
        <View style={{ height: 20 }} />
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
    marginBottom: 5,
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
});