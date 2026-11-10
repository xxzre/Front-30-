import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { collection, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseConfigurado } from "../firebase.js";

const AuthContext = createContext(null);

const CHAVE_USUARIOS_BANCO = "f30_usuarios_banco_v4";

function lerUsuariosCache() {
  try {
    const raw = localStorage.getItem(CHAVE_USUARIOS_BANCO);
    if (raw) {
      const lista = JSON.parse(raw);
      if (Array.isArray(lista)) return lista;
    }
  } catch (e) {
    console.warn("Aviso ao ler cache de usuários:", e);
  }
  return [];
}

function gravarUsuariosCache(lista) {
  try {
    localStorage.setItem(CHAVE_USUARIOS_BANCO, JSON.stringify(lista));
  } catch (e) {
    console.warn("Aviso ao gravar cache de usuários:", e);
  }
}

function atualizarUsuarioNoCache(docUsuario) {
  if (!docUsuario || !docUsuario.uid) return lerUsuariosCache();
  const atual = lerUsuariosCache();
  const existe = atual.some((u) => u.uid === docUsuario.uid);
  const novaLista = existe
    ? atual.map((u) => (u.uid === docUsuario.uid ? { ...u, ...docUsuario } : u))
    : [...atual, docUsuario];
  gravarUsuariosCache(novaLista);
  return novaLista;
}

function removerUsuarioDoCache(uid) {
  const atual = lerUsuariosCache().filter((u) => u.uid !== uid);
  gravarUsuariosCache(atual);
  return atual;
}

function lerPerfilLocal(uid) {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(`f30_perfil_real_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erro ao ler perfil local:", e);
  }
  return null;
}

function salvarPerfilLocal(uid, dados) {
  if (!uid || !dados) return;
  try {
    localStorage.setItem(`f30_perfil_real_${uid}`, JSON.stringify(dados));
    atualizarUsuarioNoCache(dados);
  } catch (e) {
    console.warn("Erro ao salvar perfil local:", e);
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [usuariosBanco, setUsuariosBanco] = useState(() => lerUsuariosCache());
  const [carregando, setCarregando] = useState(true);
  const [modoDemo, setModoDemo] = useState(!firebaseConfigurado);

  // Escuta em TEMPO REAL toda a coleção /usuarios do banco de dados (Firestore)
  useEffect(() => {
    if (!db) return;
    const colRef = collection(db, "usuarios");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const doServidor = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && !d.excluido) {
            doServidor.push({ ...d, uid: d.uid || docSnap.id });
          }
        });
        // Mescla com eventuais registros locais mais recentes (caso offline/pendente)
        const locais = lerUsuariosCache();
        const mapa = new Map();
        locais.forEach((u) => {
          if (u && u.uid && !u.excluido) mapa.set(u.uid, u);
        });
        doServidor.forEach((remoto) => {
          const loc = mapa.get(remoto.uid);
          if (!loc || Number(remoto.atualizadoEm || 0) >= Number(loc.atualizadoEm || 0)) {
            mapa.set(remoto.uid, remoto);
          }
        });
        const consolidada = Array.from(mapa.values());
        setUsuariosBanco(consolidada);
        gravarUsuariosCache(consolidada);
      },
      (err) => {
        console.warn("Aviso ao escutar diretório de patentes (/usuarios):", err.message);
      }
    );
    return () => unsub();
  }, []);

  // Listas em tempo real filtradas estritamente pela "Patente" (perfil) cadastrada no banco de dados
  const coordenadoresCadastrados = useMemo(
    () => usuariosBanco.filter((u) => u.perfil === "coordenador" && !u.excluido),
    [usuariosBanco]
  );

  const supervisoresCadastrados = useMemo(
    () => usuariosBanco.filter((u) => u.perfil === "gestor" && !u.excluido),
    [usuariosBanco]
  );

  const colaboradoresCadastrados = useMemo(
    () => usuariosBanco.filter((u) => u.perfil === "colaborador" && !u.excluido),
    [usuariosBanco]
  );

  function aplicarDadosPerfilNoEstado(uid, d) {
    if (!d) return null;
    const consolidado = {
      uid,
      email: d.email || "",
      nome: d.nome || "",
      cargo: d.cargo || "",
      perfil: d.perfil || "", // "coordenador" | "gestor" | "colaborador"
      coordenadorUid: d.coordenadorUid || "",
      coordenadorNome: d.coordenadorNome || "",
      supervisorUid: d.supervisorUid || "",
      supervisorNome: d.supervisorNome || "",
      matricula: d.matricula || "",
      turno: d.turno || "",
      telefone: d.telefone || "",
      focoIndividual: d.focoIndividual || "",
      pontosFortes: Array.isArray(d.pontosFortes) ? d.pontosFortes : [],
      indicadores: d.indicadores || { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 },
      atualizadoEm: Number(d.atualizadoEm || Date.now()),
    };

    setDadosPerfil(consolidado);
    salvarPerfilLocal(uid, consolidado);
    setUsuariosBanco(lerUsuariosCache());
    return consolidado;
  }

  async function carregarPerfilFirestore(uid, emailFallback = "") {
    const local = lerPerfilLocal(uid);
    if (local) {
      aplicarDadosPerfilNoEstado(uid, local);
    }

    if (!db) return local?.perfil || "";
    try {
      const ref = doc(db, "usuarios", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const remoto = snap.data();
        const remotoTs = Number(remoto.atualizadoEm || 0);
        const localTs = Number(local?.atualizadoEm || 0);
        if (!local || remotoTs >= localTs) {
          const atualizado = aplicarDadosPerfilNoEstado(uid, { ...local, ...remoto, uid });
          return atualizado?.perfil || "";
        } else {
          await setDoc(ref, local, { merge: true });
          return local.perfil || "";
        }
      } else if (local) {
        await setDoc(ref, local, { merge: true });
        return local.perfil || "";
      } else {
        const minimo = {
          uid,
          email: emailFallback || "",
          nome: "",
          cargo: "",
          perfil: "",
          coordenadorUid: "",
          coordenadorNome: "",
          supervisorUid: "",
          supervisorNome: "",
          atualizadoEm: Date.now(),
        };
        aplicarDadosPerfilNoEstado(uid, minimo);
        return "";
      }
    } catch (e) {
      console.warn("Aviso ao carregar perfil do Firestore:", e);
    }
    return local?.perfil || "";
  }

  // Listener em tempo real do documento individual do usuário logado (/usuarios/{uid})
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
          if (!local || remotoTs >= localTs) {
            aplicarDadosPerfilNoEstado(usuario.uid, { ...local, ...remoto, uid: usuario.uid });
          }
        }
      },
      (err) => {
        console.warn("Aviso listener perfil individual:", err.message);
      }
    );
    return () => unsub();
  }, [usuario?.uid, usuario?.emailVerified]);

  async function atualizarMeuPerfil(novosCampos) {
    const uid = usuario?.uid;
    if (!uid) return null;
    const agora = Date.now();
    const atual = lerPerfilLocal(uid) || dadosPerfil || { uid, email: usuario?.email || "" };

    // Resolve nomes de coordenador e supervisor a partir dos UIDs selecionados no banco
    let coordNome = novosCampos.coordenadorNome ?? atual.coordenadorNome ?? "";
    if (novosCampos.coordenadorUid !== undefined) {
      const cEnc = usuariosBanco.find((u) => u.uid === novosCampos.coordenadorUid);
      coordNome = cEnc ? cEnc.nome || cEnc.email : "";
    }

    let supNome = novosCampos.supervisorNome ?? atual.supervisorNome ?? "";
    if (novosCampos.supervisorUid !== undefined) {
      const sEnc = usuariosBanco.find((u) => u.uid === novosCampos.supervisorUid);
      supNome = sEnc ? sEnc.nome || sEnc.email : "";
    }

    const novoPerfil = {
      ...atual,
      ...novosCampos,
      coordenadorNome: coordNome,
      supervisorNome: supNome,
      uid,
      email: usuario?.email || atual.email || "",
      atualizadoEm: agora,
    };

    const consolidado = aplicarDadosPerfilNoEstado(uid, novoPerfil);

    if (db) {
      try {
        await setDoc(doc(db, "usuarios", uid), consolidado, { merge: true });
      } catch (e) {
        console.warn("Aviso ao gravar perfil no Firestore (salvo localmente):", e);
      }
    }
    return consolidado;
  }

  async function removerUsuarioDoBanco(uidAlvo) {
    if (!uidAlvo) return;
    removerUsuarioDoCache(uidAlvo);
    setUsuariosBanco(lerUsuariosCache());
    if (db) {
      try {
        await deleteDoc(doc(db, "usuarios", uidAlvo));
      } catch (e) {
        try {
          await setDoc(doc(db, "usuarios", uidAlvo), { excluido: true, atualizadoEm: Date.now() }, { merge: true });
        } catch (err) {
          console.warn("Aviso ao remover usuário do Firestore:", err);
        }
      }
    }
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
            setDadosPerfil(null);
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
   * Cadastro sem dados pré-definidos:
   * - Salva estritamente a Patente (perfil) escolhida e os vínculos reais (coordenadorUid, supervisorUid) do banco
   */
  async function cadastrar({
    nome,
    email,
    senha,
    perfil,
    coordenadorUid = "",
    supervisorUid = "",
    cargo = "",
  }) {
    const agora = Date.now();
    const coordEncontrado = usuariosBanco.find((u) => u.uid === coordenadorUid);
    const supEncontrado = usuariosBanco.find((u) => u.uid === supervisorUid);

    if (!auth || !firebaseConfigurado) {
      const demoUid = `user_${agora}`;
      aplicarDadosPerfilNoEstado(demoUid, {
        uid: demoUid,
        email,
        nome,
        cargo,
        perfil,
        coordenadorUid,
        coordenadorNome: coordEncontrado?.nome || "",
        supervisorUid,
        supervisorNome: supEncontrado?.nome || "",
        atualizadoEm: agora,
      });
      setUsuario({ email, uid: demoUid, emailVerified: true });
      setModoDemo(true);
      return { verificacaoEnviada: false };
    }

    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    const docPerfilInicial = {
      uid: user.uid,
      email: user.email,
      nome: nome.trim(),
      cargo: cargo.trim(),
      perfil, // "coordenador" | "gestor" | "colaborador"
      coordenadorUid: coordenadorUid || "",
      coordenadorNome: coordEncontrado?.nome || "",
      supervisorUid: supervisorUid || "",
      supervisorNome: supEncontrado?.nome || "",
      matricula: "",
      turno: "",
      telefone: "",
      focoIndividual: "",
      pontosFortes: [],
      indicadores: { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 },
      emailVerificado: false,
      atualizadoEm: agora,
    };

    salvarPerfilLocal(user.uid, docPerfilInicial);
    setUsuariosBanco(lerUsuariosCache());

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
      setUsuario({ email, uid: "demo-user", emailVerified: true });
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
    if (!auth || !firebaseConfigurado) return;
    return sendPasswordResetEmail(auth, email);
  }

  async function sair() {
    if (!auth || !firebaseConfigurado) {
      setUsuario(null);
      setDadosPerfil(null);
      return;
    }
    setDadosPerfil(null);
    return signOut(auth);
  }

  const valor = {
    usuario,
    perfilUsuario: dadosPerfil?.perfil || "",
    nomeUsuario: dadosPerfil?.nome || "",
    dadosPerfil,
    usuariosBanco,
    coordenadoresCadastrados,
    supervisoresCadastrados,
    colaboradoresCadastrados,
    atualizarMeuPerfil,
    removerUsuarioDoBanco,
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
