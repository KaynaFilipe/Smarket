import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../firebaseConfig";

const garantirEstruturaUsuario = async (uid: string, email: string) => {
  const perfilRef = doc(db, "usuarios", uid);
  const orcamentoRef = doc(db, "usuarios", uid, "orcamento", "atual");
  const perfilSnapshot = await getDoc(perfilRef);
  const orcamentoSnapshot = await getDoc(orcamentoRef);

  // Contas antigas podem existir no Auth sem o documento de perfil no Firestore.
  if (!perfilSnapshot.exists()) {
    await setDoc(
      perfilRef,
      {
        email,
        perfil: "padrao",
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await setDoc(
      perfilRef,
      {
        email,
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // O documento de orcamento so deve ser criado na primeira vez para nao sobrescrever dados existentes.
  if (!orcamentoSnapshot.exists()) {
    await setDoc(
      orcamentoRef,
      {
        orcamentoTotal: 0,
        items: [],
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    try {
      // O login apenas autentica; a leitura do perfil e do orcamento acontece no contexto global.
      setCarregando(true);
      const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
      await garantirEstruturaUsuario(credencial.user.uid, credencial.user.email ?? email.trim());

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
      const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await garantirEstruturaUsuario(credencial.user.uid, credencial.user.email ?? email.trim());

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

  const handleEsqueciSenha = async () => {
    const emailNormalizado = email.trim();

    if (!emailNormalizado) {
      Alert.alert("Informe seu email", "Digite o email da conta para receber o link de redefinicao.");
      return;
    }

    try {
      setCarregando(true);
      await sendPasswordResetEmail(auth, emailNormalizado);
      Alert.alert(
        "Email enviado",
        "Enviamos um link para redefinir sua senha no email informado."
      );
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/user-not-found"
      ) {
        Alert.alert("Conta nao encontrada", "Nao existe usuario cadastrado com esse email.");
      } else if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/invalid-email"
      ) {
        Alert.alert("Email invalido", "Confira o email digitado e tente novamente.");
      } else {
        Alert.alert("Falha ao enviar", "Nao foi possivel enviar o email de recuperacao agora.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* A mesma tela alterna entre login e registro para simplificar a entrada no app. */}
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

      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="Senha"
          secureTextEntry={!mostrarSenha}
          style={styles.passwordInput}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setMostrarSenha((estadoAtual) => !estadoAtual)}>
          <Text style={styles.passwordToggleText}>
            {mostrarSenha ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      {modo === "registro" ? (
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Confirmar senha"
            secureTextEntry={!mostrarConfirmacao}
            style={styles.passwordInput}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setMostrarConfirmacao((estadoAtual) => !estadoAtual)}>
            <Text style={styles.passwordToggleText}>
              {mostrarConfirmacao ? "Ocultar" : "Mostrar"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {modo === "login" ? (
        <TouchableOpacity
          style={styles.resetPasswordButton}
          onPress={handleEsqueciSenha}
          disabled={carregando}>
          <Text style={styles.resetPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
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
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  passwordToggle: {
    paddingHorizontal: 14,
    paddingVertical: 15,
    backgroundColor: "#dfe7e2",
  },
  passwordToggleText: {
    color: "#3a7156",
    fontWeight: "700",
  },
  resetPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  resetPasswordText: {
    color: "#3a7156",
    fontWeight: "600",
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
