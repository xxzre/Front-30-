import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
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

function lerPerfilLocal(uid) {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(`f30_perfil_completo_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erro ao ler perfil local:", e);
  }
  return null;
}

function salvarPerfilLocal(uid, dados) {
  if (!uid) return;
  try {
    localStorage.setItem(`f30_perfil_completo_${uid}`, JSON.stringify(dados));
    if (dados.perfil) localStorage.setItem(`f30_perfil_${uid}`, dados.perfil);
    if (dados.supervisorVinculado) localStorage.setItem(`f30_sup_${uid}`, dados.supervisorVinculado);
    if (dados.nome) localStorage.setItem(`f30_nome_${uid}`, dados.nome);
  } catch (e) {
    console.warn("Erro ao salvar perfil local:", e);
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilUsuario, setPerfilUsuario] = useState("gestor"); // "colaborador" | "gestor" | "coordenador"
  const [supervisorVinculado, setSupervisorVinculado] = useState("Jaqueline");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [dadosPerfil, setDadosPerfil] = useState({
    nome: "",
    email: "",
    cargo: "",
    perfil: "gestor",
    supervisorVinculado: "Jaqueline",
    matricula: "",
    turno: "08:00 às 17:00",
    telefone: "",
    focoIndividual: "Manter excelência em qualidade e cumprimento de metas.",
    atualizadoEm: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(!firebaseConfigurado);

  function aplicarDadosPerfilNoEstado(uid, d) {
    if (!d) return;
    const p = d.perfil || localStorage.getItem(`f30_perfil_${uid}`) || "gestor";
    const s = d.supervisorVinculado || localStorage.getItem(`f30_sup_${uid}`) || "Jaqueline";
    const n = d.nome ?? localStorage.getItem(`f30_nome_${uid}`) ?? "";

    const consolidado = {
      uid,
      email: d.email || "",
      nome: n,
      cargo:
        d.cargo ||
        (p === "coordenador"
          ? "Coordenador(a) Geral"
          : p === "gestor"
          ? "Supervisor(a) de Operações"
          : "Atendente de Relacionamento"),
      perfil: p,
      supervisorVinculado: s,
      matricula: d.matricula || "",
      turno: d.turno || "08:00 às 17:00",
      telefone: d.telefone || "",
      focoIndividual: d.focoIndividual || "Manter excelência em qualidade e cumprimento de metas.",
      atualizadoEm: Number(d.atualizadoEm || Date.now()),
    };

    setPerfilUsuario(consolidado.perfil);
    setSupervisorVinculado(consolidado.supervisorVinculado);
    setNomeUsuario(consolidado.nome);
    setDadosPerfil(consolidado);
    salvarPerfilLocal(uid, consolidado);
    return consolidado;
  }

  async function carregarPerfilFirestore(uid, emailFallback = "", dadosFallback = {}) {
    const local = lerPerfilLocal(uid);
    const base = {
      uid,
      email: emailFallback || local?.email || "",
      nome: dadosFallback.nome ?? local?.nome ?? localStorage.getItem(`f30_nome_${uid}`) ?? "",
      cargo: dadosFallback.cargo ?? local?.cargo ?? "",
      perfil: dadosFallback.perfil || local?.perfil || localStorage.getItem(`f30_perfil_${uid}`) || "gestor",
      supervisorVinculado:
        dadosFallback.supervisor ||
        local?.supervisorVinculado ||
        localStorage.getItem(`f30_sup_${uid}`) ||
        "Jaqueline",
      matricula: local?.matricula || "",
      turno: local?.turno || "08:00 às 17:00",
      telefone: local?.telefone || "",
      focoIndividual: local?.focoIndividual || "Manter excelência em qualidade e cumprimento de metas.",
      atualizadoEm: Number(local?.atualizadoEm || 0),
    };

    aplicarDadosPerfilNoEstado(uid, base);

    if (!db) return base.perfil;
    try {
      const ref = doc(db, "usuarios", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const remoto = snap.data();
        const remotoTs = Number(remoto.atualizadoEm || 0);
        const localTs = Number(base.atualizadoEm || 0);
        if (remotoTs >= localTs) {
          const atualizado = aplicarDadosPerfilNoEstado(uid, { ...base, ...remoto });
          return atualizado.perfil;
        } else {
          // Local é mais recente (ex.: editado antes do F5), sincroniza para o Firestore
          await setDoc(ref, base, { merge: true });
          return base.perfil;
        }
      } else {
        // Cria o documento no Firestore se ainda não existir
        const inicial = { ...base, atualizadoEm: Date.now() };
        aplicarDadosPerfilNoEstado(uid, inicial);
        await setDoc(ref, inicial, { merge: true });
        return inicial.perfil;
      }
    } catch (e) {
      console.warn("Aviso ao sincronizar perfil do usuário:", e);
    }
    return base.perfil;
  }

  // Assinatura em tempo real (onSnapshot) do perfil do usuário logado
  useEffect(() => {
    if (!db || !usuario?.uid || !usuario?.emailVerified) return;
    const ref = doc(db, "usuarios", usuario.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const remoto = snap.data();
          const local = lerPerfilLocal(usuario.uid);
          const remotoTs = Number(remoto.atualizadoEm || 0);
          const localTs = Number(local?.atualizadoEm || 0);
          if (remotoTs >= localTs) {
            aplicarDadosPerfilNoEstado(usuario.uid, { ...local, ...remoto });
          }
        }
      },
      (err) => {
        console.warn("Aviso listener perfil em tempo real:", err.message);
      }
    );
    return () => unsub();
  }, [usuario?.uid, usuario?.emailVerified]);

  // Atualização em tempo real do próprio perfil (salva instantaneamente no localStorage + Firestore)
  async function atualizarMeuPerfil(novosCampos) {
    const uid = usuario?.uid || "demo-user";
    const agora = Date.now();
    const atual = lerPerfilLocal(uid) || dadosPerfil;
    const novoPerfil = {
      ...atual,
      ...novosCampos,
      // Mantém o nível hierárquico original por segurança
      perfil: atual.perfil || perfilUsuario,
      uid,
      email: usuario?.email || atual.email || "",
      atualizadoEm: agora,
    };

    aplicarDadosPerfilNoEstado(uid, novoPerfil);

    if (db && usuario?.uid) {
      try {
        await setDoc(doc(db, "usuarios", usuario.uid), novoPerfil, { merge: true });
      } catch (e) {
        console.warn("Aviso ao salvar perfil no Firestore (salvo localmente com sucesso):", e);
      }
    }
    return novoPerfil;
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
              await carregarPerfilFirestore(u.uid, u.email);
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

  async function cadastrar(email, senha, perfilEscolhido = "gestor", supervisorEscolhido = "Jaqueline", nomeCompleto = "") {
    const agora = Date.now();
    const cargoPadrao =
      perfilEscolhido === "coordenador"
        ? "Coordenador(a) Geral"
        : perfilEscolhido === "gestor"
        ? "Supervisor(a) de Operações"
        : "Atendente de Relacionamento";

    if (!auth || !firebaseConfigurado) {
      const demoUid = "demo-user";
      aplicarDadosPerfilNoEstado(demoUid, {
        uid: demoUid,
        email: email || "gestora@front30.com",
        nome: nomeCompleto,
        cargo: cargoPadrao,
        perfil: perfilEscolhido,
        supervisorVinculado: supervisorEscolhido,
        atualizadoEm: agora,
      });
      setUsuario({ email: email || "gestora@front30.com", uid: demoUid, emailVerified: true });
      setModoDemo(true);
      return { verificacaoEnviada: false };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    const docPerfilInicial = {
      uid: user.uid,
      email: user.email,
      nome: nomeCompleto,
      cargo: cargoPadrao,
      perfil: perfilEscolhido,
      supervisorVinculado: supervisorEscolhido,
      matricula: "",
      turno: "08:00 às 17:00",
      telefone: "",
      focoIndividual: "Manter excelência em qualidade e cumprimento de metas.",
      emailVerificado: false,
      atualizadoEm: agora,
    };

    salvarPerfilLocal(user.uid, docPerfilInicial);

    if (db) {
      try {
        await setDoc(doc(db, "usuarios", user.uid), docPerfilInicial, { merge: true });
      } catch (err) {
        console.warn("Aviso ao criar perfil inicial no Firestore:", err);
      }
    }

    await sendEmailVerification(user);
    await signOut(auth);
    setUsuario(null);

    return { verificacaoEnviada: true, email: user.email };
  }

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
    await carregarPerfilFirestore(user.uid, user.email);
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
      await carregarPerfilFirestore(user.uid, user.email);
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
    dadosPerfil,
    atualizarMeuPerfil,
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
