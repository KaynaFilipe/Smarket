import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuracao do projeto Firebase usada por autenticacao e banco de dados.
const firebaseConfig = {
  apiKey: "AIzaSyCkgt_a36ifSwsxqbkvJHo4I7TY2nPoXIA",
  authDomain: "smarket-efee5.firebaseapp.com",
  projectId: "smarket-efee5",
  storageBucket: "smarket-efee5.firebasestorage.app",
  messagingSenderId: "243702084810",
  appId: "1:243702084810:web:f0646bd405b6e24aa03033",
  measurementId: "G-7QLV8RE0HQ"
};

const app = initializeApp(firebaseConfig);

// `auth` controla login, registro e logout.
export const auth = getAuth(app);
// `db` centraliza o acesso ao Firestore em todo o app.
export const db = getFirestore(app);
