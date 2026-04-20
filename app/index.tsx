import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { auth } from "../firebaseConfig";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Preencha tudo");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);

      // 🔥 entra no app (tabs)
      router.replace("/(tabs)");
    } catch {
      alert("Email ou senha incorretos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smarket</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={{ color: "#fff" }}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 20 },
  input: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3a7156",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});