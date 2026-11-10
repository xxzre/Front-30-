import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const MENSAGENS_ERRO = {
  "auth/invalid-email": "E-mail inválido. Verifique o formato digitado.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Não encontramos uma conta com este e-mail.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Já existe uma conta cadastrada com este e-mail.",
  "auth/weak-password": "Senha fraca: a senha precisa ter pelo menos 6 caracteres.",
  "auth/missing-password": "Digite uma senha.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns instantes antes de tentar novamente.",
  "auth/email-not-verified": "Seu endereço de e-mail ainda não foi verificado! Por favor, acesse o link enviado para o seu e-mail (verifique também a caixa de Spam).",
  "permission-denied": "Acesso negado pelo servidor: você precisa confirmar seu e-mail antes de acessar ou gravar dados.",
};

function traduzirErro(erro) {
  return MENSAGENS_ERRO[erro?.code] || erro?.message || "Não foi possível concluir. Tente novamente.";
}

export default function Login() {
  const {
    entrar,
    cadastrar,
    reenviarVerificacao,
    redefinirSenha,
    firebaseConfigurado,
    coordenadoresCadastrados,
    supervisoresCadastrados,
  } = useAuth();

  const [modo, setModo] = useState("entrar"); // "entrar" | "cadastrar"
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  // Nenhuma opção pré-selecionada! Tudo começa vazio ("")
  const [perfil, setPerfil] = useState("");
  const [coordenadorUid, setCoordenadorUid] = useState("");
  const [supervisorUid, setSupervisorUid] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [precisaVerificar, setPrecisaVerificar] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setPrecisaVerificar(false);

    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    if (modo === "cadastrar") {
      if (!nome.trim()) {
        setErro("Informe seu nome completo.");
        return;
      }
      if (!perfil) {
        setErro("Selecione sua patente (Colaborador, Gestor/Supervisor ou Coordenador Geral).");
        return;
      }
    }

    setCarregando(true);
    try {
      if (modo === "entrar") {
        await entrar(email, senha);
      } else {
        const res = await cadastrar({
          nome: nome.trim(),
          cargo: cargo.trim(),
          email: email.trim(),
          senha,
          perfil,
          coordenadorUid: perfil !== "coordenador" ? coordenadorUid : "",
          supervisorUid: perfil === "colaborador" ? supervisorUid : "",
        });
        if (res?.verificacaoEnviada) {
          setModo("entrar");
          setPrecisaVerificar(true);
          setAviso(
            `Conta criada com sucesso no banco de dados! Enviamos um link de confirmação para ${email}. Verifique sua caixa de entrada e a pasta de Spam antes de fazer login.`
          );
        }
      }
    } catch (err) {
      if (err?.code === "auth/email-not-verified") {
        setPrecisaVerificar(true);
      }
      setErro(traduzirErro(err));
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviarVerificacao() {
    setErro("");
    setAviso("");
    if (!email || !senha) {
      setErro("Mantenha seu e-mail e senha preenchidos acima para reenviar o link de confirmação.");
      return;
    }
    setReenviando(true);
    try {
      const res = await reenviarVerificacao(email, senha);
      if (res?.jaVerificado) {
        setAviso("Seu e-mail já foi verificado! Entrando...");
      } else {
        setAviso(
          `Novo link de verificação enviado para ${email}! Confira sua caixa de entrada e a pasta de Spam/Lixo Eletrônico.`
        );
      }
    } catch (err) {
      setErro(traduzirErro(err));
    } finally {
      setReenviando(false);
    }
  }

  async function esqueciSenha() {
    setErro("");
    setAviso("");
    if (!email) {
      setErro("Digite seu e-mail acima para receber o link de redefinição.");
      return;
    }
    try {
      await redefinirSenha(email);
      setAviso("Enviamos um e-mail com o link para redefinir sua senha.");
    } catch (err) {
      setErro(traduzirErro(err));
    }
  }

  return (
    <div className="f30-login-wrap">
      <div className="f30-login-card">
        <div className="f30-brand" style={{ borderBottom: "none", marginBottom: 6, padding: 0 }}>
          <div className="f30-brand-badge">F30</div>
          <div className="f30-brand-text">
            <b>Front 30'</b>
            <span>rotina de liderança</span>
          </div>
        </div>

        <h1 className="f30-login-titulo">{modo === "entrar" ? "Entrar na sua conta" : "Criar sua conta"}</h1>
        <p className="f30-login-sub">
          {modo === "entrar"
            ? "Use o e-mail e a senha cadastrados no banco de dados para acessar."
            : "Cadastre seus dados reais e selecione sua patente no sistema."}
        </p>

        <form className="f30-form" onSubmit={enviar}>
          {modo === "cadastrar" && (
            <>
              <label>Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />

              <label>Cargo / Função (opcional)</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Digite seu cargo"
              />
            </>
          )}

          <label>E-mail</label>
          <input
            type="text"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
          <label>Senha</label>
          <input
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />

          {modo === "cadastrar" && (
            <>
              <label>Patente / Nível Hierárquico</label>
              <select
                value={perfil}
                onChange={(e) => {
                  setPerfil(e.target.value);
                  setCoordenadorUid("");
                  setSupervisorUid("");
                }}
                required
              >
                <option value="">-- Selecione sua patente --</option>
                <option value="colaborador">Colaborador(a)</option>
                <option value="gestor">Gestor(a) / Supervisor(a)</option>
                <option value="coordenador">Coordenador(a) Geral</option>
              </select>

              {/* Se for Colaborador, escolhe apenas entre os Supervisores/Gestores reais cadastrados no banco */}
              {perfil === "colaborador" && (
                <>
                  <label>Quem é seu(sua) Gestor(a) / Supervisor(a)? (cadastrado no banco)</label>
                  <select value={supervisorUid} onChange={(e) => setSupervisorUid(e.target.value)}>
                    <option value="">
                      {supervisoresCadastrados.length > 0
                        ? "-- Selecione o(a) Supervisor(a) cadastrado(a) --"
                        : "-- Nenhum(a) Supervisor(a) cadastrado(a) no banco ainda --"}
                    </option>
                    {supervisoresCadastrados.map((sup) => (
                      <option key={sup.uid} value={sup.uid}>
                        {sup.nome || sup.email}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {/* Se for Gestor/Supervisor ou Colaborador, só mostra Coordenador Geral se houver algum cadastrado com essa patente no banco */}
              {(perfil === "gestor" || perfil === "colaborador") && coordenadoresCadastrados.length > 0 && (
                <>
                  <label>Quem é seu(sua) Coordenador(a) Geral? (cadastrado no banco)</label>
                  <select value={coordenadorUid} onChange={(e) => setCoordenadorUid(e.target.value)}>
                    <option value="">-- Selecione o(a) Coordenador(a) Geral cadastrado(a) --</option>
                    {coordenadoresCadastrados.map((coord) => (
                      <option key={coord.uid} value={coord.uid}>
                        {coord.nome || coord.email}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}

          {erro && <div className="f30-login-erro">{erro}</div>}
          {aviso && <div className="f30-login-aviso">{aviso}</div>}

          {precisaVerificar && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="f30-btn secundario pequeno"
                onClick={handleReenviarVerificacao}
                disabled={reenviando}
                style={{ width: "100%" }}
              >
                {reenviando ? "Reenviando link..." : "Reenviar link de confirmação de e-mail"}
              </button>
            </div>
          )}

          <div className="f30-form-actions" style={{ marginTop: 18 }}>
            <button className="f30-btn" type="submit" disabled={carregando} style={{ width: "100%" }}>
              {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </form>

        <div className="f30-login-links">
          {modo === "entrar" ? (
            <button
              type="button"
              className="f30-login-link"
              onClick={() => {
                setModo("cadastrar");
                setErro("");
                setAviso("");
                setPrecisaVerificar(false);
              }}
            >
              Não tem conta? Criar conta
            </button>
          ) : (
            <button
              type="button"
              className="f30-login-link"
              onClick={() => {
                setModo("entrar");
                setErro("");
                setAviso("");
                setPrecisaVerificar(false);
              }}
            >
              Já tem conta? Entrar
            </button>
          )}
          {modo === "entrar" && (
            <button type="button" className="f30-login-link" onClick={esqueciSenha}>
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
