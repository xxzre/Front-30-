import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  function entrar(email, senha) {
    return signInWithEmailAndPassword(auth, email, senha);
  }

  function cadastrar(email, senha) {
    return createUserWithEmailAndPassword(auth, email, senha);
  }

  function redefinirSenha(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function sair() {
    return signOut(auth);
  }

  const valor = { usuario, carregando, entrar, cadastrar, redefinirSenha, sair };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>.");
  }
  return contexto;
}
