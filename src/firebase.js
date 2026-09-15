import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// As chaves vêm de variáveis de ambiente (.env local ou Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let auth = null;
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
    firebaseConfigurado = true;
  } else {
    console.warn("Front 30': Variáveis do Firebase não configuradas no .env. Inicializando em modo demonstração.");
  }
} catch (e) {
  console.warn("Front 30': Erro na inicialização do Firebase. Ativando modo demonstração.", e);
  app = null;
  auth = null;
  firebaseConfigurado = false;
}

export { app, auth, firebaseConfigurado };
export default app;
