import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../firebaseConfig";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    try {
      setCarregando(true);
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/invalid-credential"
      ) {
        alert("Email ou senha incorretos");
      } else {
        alert("Nao foi possivel entrar agora");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistro = async () => {
    if (!email || !senha || !confirmarSenha) {
      alert("Preencha todos os campos");
      return;
    }

    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas nao coincidem");
      return;
    }

    try {
      setCarregando(true);
      await createUserWithEmailAndPassword(auth, email.trim(), senha);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/email-already-in-use"
      ) {
        alert("Esse email ja esta cadastrado");
      } else {
        alert("Nao foi possivel criar a conta");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smarket</Text>
      <Text style={styles.subtitle}>
        {modo === "login" ? "Entre na sua conta" : "Crie sua conta"}
      </Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton, modo === "login" && styles.switchButtonActive]}
          onPress={() => setModo("login")}>
          <Text
            style={[styles.switchText, modo === "login" && styles.switchTextActive]}>
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchButton, modo === "registro" && styles.switchButtonActive]}
          onPress={() => setModo("registro")}>
          <Text
            style={[styles.switchText, modo === "registro" && styles.switchTextActive]}>
            Registro
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      {modo === "registro" ? (
        <TextInput
          placeholder="Confirmar senha"
          secureTextEntry
          style={styles.input}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={modo === "login" ? handleLogin : handleRegistro}
        disabled={carregando}>
        <Text style={styles.buttonText}>
          {carregando
            ? "Carregando..."
            : modo === "login"
              ? "Entrar"
              : "Criar conta"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f5f4",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 8,
    color: "#2f5d45",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: "#5f6f66",
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: "#dfe7e2",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  switchButtonActive: {
    backgroundColor: "#3a7156",
  },
  switchText: {
    color: "#476355",
    fontWeight: "600",
  },
  switchTextActive: {
    color: "#fff",
  },
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
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
