import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfigurado } from "../firebase.js";

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
        async (u) => {
          if (u) {
            try {
              await u.reload();
            } catch (e) {
              console.warn("Aviso ao recarregar usuário:", e);
            }
            // Só libera o usuário no estado global se o e-mail estiver verificado
            if (u.emailVerified) {
              // Atualiza o token JWT para que o Firestore reconheça email_verified == true
              await u.getIdToken(true);
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
   * - Cria documento de perfil inicial em /usuarios/{uid}
   * - Dispara imediatamente sendEmailVerification(user)
   * - Desloga temporariamente com signOut(auth) para impedir acesso sem verificar
   */
  async function cadastrar(email, senha) {
    if (!auth || !firebaseConfigurado) {
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user", emailVerified: true });
      setModoDemo(true);
      return { verificacaoEnviada: false };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    // Criação opcional do perfil inicial em /usuarios/{userId} (permitido no create das rules)
    if (db) {
      try {
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          criadoEm: serverTimestamp(),
          emailVerificado: false,
        });
      } catch (err) {
        console.warn("Aviso ao criar perfil inicial no Firestore:", err);
      }
    }

    // Dispara imediatamente o e-mail de verificação
    await sendEmailVerification(user);

    // Desloga o usuário temporariamente para impedir acesso automático sem validar
    await signOut(auth);
    setUsuario(null);

    return { verificacaoEnviada: true, email: user.email };
  }

  /**
   * 2. Fluxo de Login:
   * - Faz login via signInWithEmailAndPassword
   * - Executa obrigatoriamente await user.reload()
   * - Verifica user.emailVerified:
   *   - Se false: desconecta com signOut(auth) e lança código auth/email-not-verified
   *   - Se true: atualiza o token e libera acesso ao sistema
   */
  async function entrar(email, senha) {
    if (!auth || !firebaseConfigurado) {
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user", emailVerified: true });
      setModoDemo(true);
      return { emailVerified: true };
    }

    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    // Sincroniza obrigatoriamente os dados atualizados do servidor do Firebase
    await user.reload();

    if (!user.emailVerified) {
      // Desconecta a sessão para bloquear acesso sem confirmação
      await signOut(auth);
      setUsuario(null);
      const erroNaoVerificado = new Error("Seu e-mail ainda não foi confirmado.");
      erroNaoVerificado.code = "auth/email-not-verified";
      throw erroNaoVerificado;
    }

    // Força atualização do token JWT para o Firestore validar request.auth.token.email_verified == true
    await user.getIdToken(true);
    setUsuario(auth.currentUser);
    return { emailVerified: true, user: auth.currentUser };
  }

  /**
   * Reenvia o link de confirmação de e-mail realizando login temporário,
   * disparando sendEmailVerification(user) e desconectando em seguida.
   */
  async function reenviarVerificacao(email, senha) {
    if (!auth || !firebaseConfigurado) return;
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;
    await user.reload();

    if (user.emailVerified) {
      await user.getIdToken(true);
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
