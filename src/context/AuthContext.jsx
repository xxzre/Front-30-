import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, firebaseConfigurado } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(!firebaseConfigurado);

  useEffect(() => {
    if (!auth || !firebaseConfigurado) {
      setCarregando(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          setUsuario(u);
          setCarregando(false);
        },
        (err) => {
          console.error("Erro no AuthStateChanged:", err);
          setCarregando(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error("Erro ao assinar auth:", err);
      setCarregando(false);
    }
  }, []);

  async function entrar(email, senha) {
    if (!auth || !firebaseConfigurado) {
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user" });
      setModoDemo(true);
      return;
    }
    return signInWithEmailAndPassword(auth, email, senha);
  }

  async function cadastrar(email, senha) {
    if (!auth || !firebaseConfigurado) {
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user" });
      setModoDemo(true);
      return;
    }
    return createUserWithEmailAndPassword(auth, email, senha);
  }

  async function redefinirSenha(email) {
    if (!auth || !firebaseConfigurado) {
      return;
    }
    return sendPasswordResetEmail(auth, email);
  }

  async function sair() {
    if (!auth || !firebaseConfigurado) {
      setUsuario(null);
      return;
    }
    return signOut(auth);
  }

  const valor = { usuario, carregando, modoDemo, firebaseConfigurado, entrar, cadastrar, redefinirSenha, sair };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>.");
  }
  return contexto;
}
