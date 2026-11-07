import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// As chaves vêm de variáveis de ambiente (.env local ou Vercel) ou do fallback configurado
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCHBrmr39kmk48fZj3oHA1-Y52_EJMnohI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gestao-feedback.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gestao-feedback",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gestao-feedback.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "274359550576",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:274359550576:web:9d19fffec993eed7c62ab5",
};

let app = null;
let auth = null;
let db = null;
let firebaseConfigurado = false;

try {
  if (
    firebaseConfig.apiKey &&
    typeof firebaseConfig.apiKey === "string" &&
    firebaseConfig.apiKey.trim() !== "" &&
    !firebaseConfig.apiKey.includes("AIza...") &&
    !firebaseConfig.apiKey.includes("seu-projeto")
  ) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseConfigurado = true;
  } else {
    console.warn("Front 30': Variáveis do Firebase não configuradas no .env. Inicializando em modo demonstração.");
  }
} catch (e) {
  console.warn("Front 30': Erro na inicialização do Firebase. Ativando modo demonstração.", e);
  app = null;
  auth = null;
  db = null;
  firebaseConfigurado = false;
}

export { app, auth, db, firebaseConfigurado };
export default app;
