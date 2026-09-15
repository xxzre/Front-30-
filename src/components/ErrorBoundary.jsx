import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf8f5",
            color: "#1c1917",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "#ffffff",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
              border: "1px solid #e7e5e4",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: 700,
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "6px",
                marginBottom: "12px",
                letterSpacing: "0.5px",
              }}
            >
              ALERTA DE SISTEMA
            </div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700, color: "#0c0a09" }}>
              Não foi possível carregar a página
            </h2>
            <p style={{ fontSize: "14px", color: "#57534e", lineHeight: 1.5, marginBottom: "16px" }}>
              Ocorreu uma falha no carregamento. Veja os detalhes abaixo:
            </p>
            <pre
              style={{
                background: "#f5f5f4",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                overflowX: "auto",
                color: "#dc2626",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "#ea580c",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
