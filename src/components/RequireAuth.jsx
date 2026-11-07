import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "./Login.jsx";

export default function RequireAuth({ children }) {
  const { usuario, carregando, modoDemo } = useAuth();

  if (carregando) {
    return (
      <div className="f30-login-wrap">
        <div className="f30-mono" style={{ color: "var(--ink-soft)" }}>Carregando...</div>
      </div>
    );
  }

  if (!usuario || (!modoDemo && !usuario.emailVerified)) {
    return <Login />;
  }

  return children;
}
