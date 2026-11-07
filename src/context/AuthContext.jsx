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

export const LISTA_SUPERVISORES_HIERARQUIA = [
  { id: "Amanda", nome: "Amanda Lira" },
  { id: "Camila", nome: "Camila dos Reis" },
  { id: "Cristiane", nome: "Cristiane de Souza" },
  { id: "Julio", nome: "Julio Ortunes" },
  { id: "Luciane", nome: "Luciane Oliveira" },
  { id: "Fátima", nome: "Maria de Fátima" },
  { id: "Jaqueline", nome: "Jaqueline Rocha Lima" },
  { id: "Luciana Faiad", nome: "Luciana Faiad Labate" },
];

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilUsuario, setPerfilUsuario] = useState("gestor"); // "colaborador" | "gestor" | "coordenador"
  const [supervisorVinculado, setSupervisorVinculado] = useState("Amanda");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(!firebaseConfigurado);

  async function carregarPerfilFirestore(uid, dadosFallback = {}) {
    const salvoPerfil = localStorage.getItem(`f30_perfil_${uid}`);
    const salvoSup = localStorage.getItem(`f30_sup_${uid}`);
    const salvoNome = localStorage.getItem(`f30_nome_${uid}`);

    const padraoPerfil = dadosFallback.perfil || salvoPerfil || "gestor";
    const padraoSup = dadosFallback.supervisor || salvoSup || "Amanda";
    const padraoNome = dadosFallback.nome || salvoNome || "";

    setPerfilUsuario(padraoPerfil);
    setSupervisorVinculado(padraoSup);
    setNomeUsuario(padraoNome);

    if (!db) return padraoPerfil;
    try {
      const snap = await getDoc(doc(db, "usuarios", uid));
      if (snap.exists()) {
        const d = snap.data();
        if (d.perfil) {
          setPerfilUsuario(d.perfil);
          localStorage.setItem(`f30_perfil_${uid}`, d.perfil);
        }
        if (d.supervisorVinculado) {
          setSupervisorVinculado(d.supervisorVinculado);
          localStorage.setItem(`f30_sup_${uid}`, d.supervisorVinculado);
        }
        if (d.nome) {
          setNomeUsuario(d.nome);
          localStorage.setItem(`f30_nome_${uid}`, d.nome);
        }
        return d.perfil || padraoPerfil;
      }
    } catch (e) {
      console.warn("Aviso ao ler perfil do usuário:", e);
    }
    return padraoPerfil;
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
   * 1. Fluxo de Cadastro com Hierarquia e Isolamento de Dados:
   * - Salva cargo/perfil ("colaborador", "gestor", "coordenador"), nome e supervisorVinculado em /usuarios/{uid}
   * - Dispara sendEmailVerification(user)
   * - Desloga temporariamente com signOut(auth)
   */
  async function cadastrar(email, senha, perfilEscolhido = "gestor", supervisorEscolhido = "Amanda", nomeCompleto = "") {
    if (!auth || !firebaseConfigurado) {
      setPerfilUsuario(perfilEscolhido);
      setSupervisorVinculado(supervisorEscolhido);
      setNomeUsuario(nomeCompleto);
      setUsuario({ email: email || "gestora@front30.com", uid: "demo-user", emailVerified: true });
      setModoDemo(true);
      return { verificacaoEnviada: false };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    localStorage.setItem(`f30_perfil_${user.uid}`, perfilEscolhido);
    localStorage.setItem(`f30_sup_${user.uid}`, supervisorEscolhido);
    localStorage.setItem(`f30_nome_${user.uid}`, nomeCompleto);

    if (db) {
      try {
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          nome: nomeCompleto,
          perfil: perfilEscolhido,
          supervisorVinculado: supervisorEscolhido,
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
   * 2. Fluxo de Login Seguro:
   * - Executa await user.reload() e verifica user.emailVerified
   * - Carrega estritamente o nível hierárquico do usuário autenticado
   */
  async function entrar(email, senha) {
    if (!auth || !firebaseConfigurado) {
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
    await carregarPerfilFirestore(user.uid);
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
    supervisorVinculado,
    nomeUsuario,
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
