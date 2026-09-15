import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const MENSAGENS_ERRO = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Não encontramos uma conta com este e-mail.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/missing-password": "Digite uma senha.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um momento e tente novamente.",
};

function traduzirErro(erro) {
  return MENSAGENS_ERRO[erro?.code] || "Não foi possível concluir. Tente novamente.";
}

export default function Login() {
  const { entrar, cadastrar, redefinirSenha, firebaseConfigurado } = useAuth();
  const [modo, setModo] = useState("entrar"); // "entrar" | "cadastrar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setAviso("");
    
    // Em modo demo (sem Firebase configurado no .env), permite login sem restrições
    if (!firebaseConfigurado) {
      setCarregando(true);
      try {
        await entrar(email || "gestora@front30.com", senha || "demo123");
      } catch (err) {
        setErro(traduzirErro(err));
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    try {
      if (modo === "entrar") {
        await entrar(email, senha);
      } else {
        await cadastrar(email, senha);
      }
    } catch (err) {
      setErro(traduzirErro(err));
    } finally {
      setCarregando(false);
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
            ? "Use o e-mail e a senha cadastrados para acessar sua rotina."
            : "Crie um acesso com e-mail e senha para começar a usar o Front 30'."}
        </p>

        {!firebaseConfigurado && (
          <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", color: "#c2410c", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.4 }}>
            💡 <b>Modo Demonstração:</b> Firebase não configurado no .env. Clique em <b>Entrar</b> para visualizar o protótipo.
          </div>
        )}

        <form className="f30-form" onSubmit={enviar}>
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

          {erro && <div className="f30-login-erro">{erro}</div>}
          {aviso && <div className="f30-login-aviso">{aviso}</div>}

          <div className="f30-form-actions" style={{ marginTop: 18 }}>
            <button className="f30-btn" type="submit" disabled={carregando} style={{ width: "100%" }}>
              {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </form>

        <div className="f30-login-links">
          {modo === "entrar" ? (
            <button type="button" className="f30-login-link" onClick={() => { setModo("cadastrar"); setErro(""); setAviso(""); }}>
              Não tem conta? Criar conta
            </button>
          ) : (
            <button type="button" className="f30-login-link" onClick={() => { setModo("entrar"); setErro(""); setAviso(""); }}>
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
