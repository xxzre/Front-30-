import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfigurado } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilUsuario, setPerfilUsuario] = useState("gestor"); // "colaborador" | "gestor" | "coordenador"
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(!firebaseConfigurado);

  async function carregarPerfilFirestore(uid, perfilFallback) {
    const salvoLocal = localStorage.getItem(`f30_perfil_${uid}`);
    const padrao = perfilFallback || salvoLocal || "gestor";
    setPerfilUsuario(padrao);

    if (!db) return padrao;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid));
      if (snap.exists() && snap.data()?.perfil) {
        const p = snap.data().perfil;
        setPerfilUsuario(p);
        localStorage.setItem(`f30_perfil_${uid}`, p);
        return p;
      } else if (perfilFallback) {
        await setDoc(doc(db, "usuarios", uid), { perfil: perfilFallback, emailVerificado: true }, { merge: true });
        localStorage.setItem(`f30_perfil_${uid}`, perfilFallback);
      }
    } catch (e) {
      console.warn("Aviso ao ler perfil do usuário:", e);
    }
    return padrao;
  }

  useEffect(() => {
    if (!auth || !firebaseConfigurado) {
      setCarregando(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (u) => {
          if (u) {
            try {
              await u.reload();
            } catch (e) {
              console.warn("Aviso ao recarregar usuário:", e);
            }
            if (u.emailVerified) {
              await u.getIdToken(true);
              await carregarPerfilFirestore(u.uid);
              setUsuario(u);
            } else {
              setUsuario(null);
            }
          } else {
            setUsuario(null);
          }
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

  /**
   * 1. Fluxo de Cadastro:
   * - Cria o usuário via createUserWithEmailAndPassword
   * - Salva o cargo/perfil escolhido (colaborador, gestor ou coordenador) em /usuarios/{uid}
   * - Dispara imediatamente sendEmailVerification(user)
   * - Desloga temporariamente com signOut(auth)
   */
  async function cadastrar(email, senha, perfilEscolhido = "gestor") {
    if (!auth || !firebaseConfigurado) {
      setPerfilUsuario(perfilEscolhido);
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user", emailVerified: true });
      setModoDemo(true);
      return { verificacaoEnviada: false };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    localStorage.setItem(`f30_perfil_${user.uid}`, perfilEscolhido);

    if (db) {
      try {
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          perfil: perfilEscolhido,
          criadoEm: serverTimestamp(),
          emailVerificado: false,
        });
      } catch (err) {
        console.warn("Aviso ao criar perfil inicial no Firestore:", err);
      }
    }

    await sendEmailVerification(user);
    await signOut(auth);
    setUsuario(null);

    return { verificacaoEnviada: true, email: user.email };
  }

  /**
   * 2. Fluxo de Login:
   * - Faz login via signInWithEmailAndPassword
   * - Executa obrigatoriamente await user.reload()
   * - Verifica user.emailVerified
   */
  async function entrar(email, senha, perfilEscolhido) {
    if (!auth || !firebaseConfigurado) {
      setPerfilUsuario(perfilEscolhido || "gestor");
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user", emailVerified: true });
      setModoDemo(true);
      return { emailVerified: true };
    }

    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    await user.reload();

    if (!user.emailVerified) {
      await signOut(auth);
      setUsuario(null);
      const erroNaoVerificado = new Error("Seu e-mail ainda não foi confirmado.");
      erroNaoVerificado.code = "auth/email-not-verified";
      throw erroNaoVerificado;
    }

    await user.getIdToken(true);
    await carregarPerfilFirestore(user.uid, perfilEscolhido);
    setUsuario(auth.currentUser);
    return { emailVerified: true, user: auth.currentUser };
  }

  async function reenviarVerificacao(email, senha) {
    if (!auth || !firebaseConfigurado) return;
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;
    await user.reload();

    if (user.emailVerified) {
      await user.getIdToken(true);
      await carregarPerfilFirestore(user.uid);
      setUsuario(auth.currentUser);
      return { jaVerificado: true };
    }

    await sendEmailVerification(user);
    await signOut(auth);
    setUsuario(null);
    return { reenviado: true };
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

  const valor = {
    usuario,
    perfilUsuario,
    setPerfilUsuario,
    carregando,
    modoDemo,
    firebaseConfigurado,
    entrar,
    cadastrar,
    reenviarVerificacao,
    redefinirSenha,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>.");
  }
  return contexto;
}
