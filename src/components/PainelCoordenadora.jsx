import React, { useState } from "react";

/* =========================================================================
   PAINEL DA COORDENAÇÃO GERAL — ONE PAGE DASHBOARDS E CONTROLES INTERNOS
   ========================================================================= */

export const SUPERVISORES_DADOS = [
  { id: "Amanda", nomeCompleto: "Amanda Lira", monitoriasMonitores: 23, monitoriasSupervisores: 21, metaMonitoria: 40, notaMonitores: 70, notaSupervisao: 97, reorientacoesOut: 0, escala: "08:00 às 17:00", suporteHorario: "09:00–12:00 / 14:00–16:00", ferias: "10/01/2027 a 29/01/2027", toFerias: "Aprovada", tmo: 318, tme: 42 },
  { id: "Camila", nomeCompleto: "Camila dos Reis", monitoriasMonitores: 3, monitoriasSupervisores: 13, metaMonitoria: 40, notaMonitores: 87, notaSupervisao: 98, reorientacoesOut: 2, escala: "09:00 às 18:00", suporteHorario: "10:00–13:00 / 15:00–17:00", ferias: "05/02/2027 a 24/02/2027", toFerias: "Em análise", tmo: 330, tme: 48 },
  { id: "Cristiane", nomeCompleto: "Cristiane de Souza", monitoriasMonitores: 22, monitoriasSupervisores: 18, metaMonitoria: 40, notaMonitores: 86, notaSupervisao: 98, reorientacoesOut: 2, escala: "07:00 às 16:00", suporteHorario: "08:00–11:00 / 13:00–15:00", ferias: "15/03/2027 a 03/04/2027", toFerias: "Aprovada", tmo: 342, tme: 55 },
  { id: "Julio", nomeCompleto: "Julio Ortunes", monitoriasMonitores: 25, monitoriasSupervisores: 10, metaMonitoria: 40, notaMonitores: 87, notaSupervisao: 95, reorientacoesOut: 1, escala: "10:00 às 19:00", suporteHorario: "11:00–14:00 / 16:00–18:00", ferias: "01/05/2027 a 20/05/2027", toFerias: "Pendente", tmo: 312, tme: 39 },
  { id: "Luciane", nomeCompleto: "Luciane Oliveira", monitoriasMonitores: 16, monitoriasSupervisores: 16, metaMonitoria: 40, notaMonitores: 77, notaSupervisao: 85, reorientacoesOut: 0, escala: "12:00 às 21:00", suporteHorario: "13:00–16:00 / 18:00–20:00", ferias: "12/06/2027 a 01/07/2027", toFerias: "Aprovada", tmo: 350, tme: 61 },
  { id: "Fátima", nomeCompleto: "Maria de Fátima", monitoriasMonitores: 14, monitoriasSupervisores: 16, metaMonitoria: 40, notaMonitores: 91, notaSupervisao: 98, reorientacoesOut: 0, escala: "14:00 às 23:00", suporteHorario: "15:00–18:00 / 19:30–21:30", ferias: "20/08/2027 a 08/09/2027", toFerias: "Em análise", tmo: 304, tme: 36 },
  { id: "Jaqueline", nomeCompleto: "Jaqueline Rocha Lima", monitoriasMonitores: 21, monitoriasSupervisores: 19, metaMonitoria: 40, notaMonitores: 92, notaSupervisao: 98, reorientacoesOut: 0, escala: "08:00 às 17:00", suporteHorario: "09:30–12:30 / 14:30–16:30", ferias: "10/09/2027 a 29/09/2027", toFerias: "Aprovada", tmo: 310, tme: 38 },
  { id: "Luciana Faiad", nomeCompleto: "Luciana Faiad Labate", monitoriasMonitores: 20, monitoriasSupervisores: 20, metaMonitoria: 40, notaMonitores: 94, notaSupervisao: 99, reorientacoesOut: 0, escala: "10:00 às 19:00", suporteHorario: "11:00–14:00 / 16:00–18:00", ferias: "04/10/2027 a 23/10/2027", toFerias: "Aprovada", tmo: 298, tme: 35 },
];

const OPERADORES_ATUAIS = [
  { nome: "DANIELA PEREIRA DOS SANTOS MORAES", sup: "Fátima", nota: 100, q: "Q1" },
  { nome: "KENIA GUILHERME LIMA", sup: "Camila", nota: 100, q: "Q1" },
  { nome: "MARCIA MARTINS DA SILVA", sup: "Cristiane", nota: 100, q: "Q1" },
  { nome: "MARIA MARCIA DA COSTA SANTOS", sup: "Julio", nota: 100, q: "Q1" },
  { nome: "WANIA IZABEL DA CRUZ", sup: "Fátima", nota: 100, q: "Q1" },
  { nome: "PATRICIA MENDONCA ROCHA", sup: "Jaqueline", nota: 100, q: "Q1" },
  { nome: "BEATRIZ LABATE NOGUEIRA", sup: "Luciana Faiad", nota: 99, q: "Q1" },
  { nome: "JONATHAN PEREIRA DE ANDRADE", sup: "Amanda", nota: 98, q: "Q1" },
  { nome: "RAQUEL MOREIRA DA SILVA", sup: "Camila", nota: 98, q: "Q1" },
  { nome: "EDILENE DAIANE DA SILVA LIBARINO", sup: "Cristiane", nota: 96, q: "Q1" },
  { nome: "ADRIANO HENRIQUE DA SILVA", sup: "Julio", nota: 95, q: "Q1" },
  { nome: "FERNANDA DE CARVALHO", sup: "Luciane", nota: 95, q: "Q1" },
  { nome: "ROGERIO DE ANDRADE LIMA", sup: "Fátima", nota: 95, q: "Q1" },
  { nome: "LUCAS ROCHA FERREIRA", sup: "Jaqueline", nota: 94, q: "Q2" },
  { nome: "CAROLINA FAIAD MARTINS", sup: "Luciana Faiad", nota: 93, q: "Q2" },
  { nome: "GISELE COCUZZI", sup: "Amanda", nota: 94, q: "Q2" },
  { nome: "JAQUELINE SOUZA DE JESUS", sup: "Camila", nota: 94, q: "Q2" },
  { nome: "ALESSANDRA ALVES MOREIRA", sup: "Cristiane", nota: 93, q: "Q2" },
  { nome: "JONATHAN DE SOUZA MULLER", sup: "Julio", nota: 92, q: "Q2" },
  { nome: "ELLEN VIEIRA DA SILVA", sup: "Luciane", nota: 92, q: "Q2" },
  { nome: "JOSE ROGERIO SANTANA TRINDADE", sup: "Fátima", nota: 92, q: "Q2" },
  { nome: "MARCIA SOARES DA SILVA", sup: "Amanda", nota: 91, q: "Q2" },
  { nome: "CAMILLA BEATRIZ MAGDALENA SANTOS", sup: "Camila", nota: 91, q: "Q2" },
  { nome: "JANAINA MENDES DE OLIVEIRA", sup: "Cristiane", nota: 90, q: "Q2" },
  { nome: "KAREN MICHELE MESSIAS DA SILVA", sup: "Julio", nota: 90, q: "Q2" },
  { nome: "VIVIANE SILVEIRA SANTOS DE MORAIS", sup: "Luciane", nota: 88, q: "Q3" },
  { nome: "GABRIELA NAVARRO SILVA", sup: "Amanda", nota: 86, q: "Q3" },
  { nome: "VIVIANE DO CARMO DA SILVA", sup: "Camila", nota: 85, q: "Q3" },
  { nome: "VIVIANE PEDRINI EMIGDIO", sup: "Cristiane", nota: 81, q: "Q3" },
  { nome: "KAMILA DE OLIVEIRA GASPAR DE LIMA", sup: "Julio", nota: 80, q: "Q3" },
  { nome: "BRUNO MARTINS DE OLIVEIRA", sup: "Luciane", nota: 79, q: "Q3" },
  { nome: "JACY LOPES GONCALVES", sup: "Amanda", nota: 67, q: "Q3" },
  { nome: "ALANA DE SOUZA DUARTE", sup: "Cristiane", nota: 65, q: "Q3" },
  { nome: "RAFAEL PEREIRA DA COSTA", sup: "Luciane", nota: 65, q: "Q3" },
  { nome: "SUSETE MARIA DA SILVA LEITE", sup: "Amanda", nota: 61, q: "Q3" },
  { nome: "DENISE QUEIROZ ALVES PINTO", sup: "Amanda", nota: 50, q: "Q4" },
];

const OPERADORES_NOVOS = [
  { nome: "VANESSA ELIZANDRA SILVA", sup: "Fátima", nota: 93, q: "Q2" },
  { nome: "THIAGO SANTOS DE SOUZA", sup: "Julio", nota: 92, q: "Q2" },
  { nome: "ERICA SOUJA JESUINO", sup: "Camila", nota: 89, q: "Q3" },
  { nome: "RENAN NUNES DA COSTA", sup: "Cristiane", nota: 65, q: "Q3" },
  { nome: "SABRINA DOS SANTOS MANFRE", sup: "Luciane", nota: 62, q: "Q3" },
  { nome: "ROSIMEIRE NASCIMENTO DA SILVA LIMA", sup: "Amanda", nota: 48, q: "Q4" },
  { nome: "MONIQUE MICHELEITE SILVA", sup: "Amanda", nota: 32, q: "Q4" },
  { nome: "MARCELLA GONCALVES AUGUSTO", sup: "Luciane", nota: 30, q: "Q4" },
];

const TABELA_CONTROLES_MESES = [
  { controle: "CCRC", mar: "-", abr: "-", mai: "-", jun: "-", jul: "1", ago: "-", set: "-", out: "-", total: 1 },
  { controle: "Invoice", mar: "1", abr: "4", mai: "1", jun: "-", jul: "-", ago: "1", set: "1", out: "-", total: 8 },
  { controle: "Moeda TC", mar: "-", abr: "1", mai: "1", jun: "-", jul: "-", ago: "-", set: "-", out: "-", total: 2 },
  { controle: "Pagamento M.", mar: "-", abr: "-", mai: "1", jun: "-", jul: "-", ago: "1", set: "1", out: "-", total: 3 },
  { controle: "Precificação M.", mar: "-", abr: "2", mai: "-", jun: "-", jul: "1", ago: "-", set: "1", out: "-", total: 4 },
  { controle: "VCR Payment TKT", mar: "-", abr: "1", mai: "-", jun: "-", jul: "-", ago: "1", set: "-", out: "-", total: 2 },
  { controle: "Waiver", mar: "3", abr: "3", mai: "5", jun: "3", jul: "10", ago: "4", set: "6", out: "5", total: 39 },
];

const REORIENTACOES_N2_INICIAIS = [
  { id: "rn1", operador: "ALANA DE SOUZA DUARTE", sup: "Cristiane", controle: "Waiver", motivo: "Erro operacional — aplicação fora de regra tarifária", atrasoSLA: "No Prazo", status: "Finalizado", data: "2026-10-18" },
  { id: "rn2", operador: "VIVIANE PEDRINI EMIGDIO", sup: "Cristiane", controle: "Waiver", motivo: "Erro operacional — ausência de carimbo no PNR", atrasoSLA: "No Prazo", status: "Finalizado", data: "2026-10-21" },
  { id: "rn3", operador: "VIVIANE DO CARMO DA SILVA", sup: "Camila", controle: "Waiver", motivo: "Pendente de Justificativa — exceção sem autorização N2", atrasoSLA: "No Prazo", status: "Finalizado", data: "2026-10-24" },
  { id: "rn4", operador: "CAMILLA BEATRIZ MAGDALENA SANTOS", sup: "Camila", controle: "Waiver", motivo: "Erro operacional — waiver duplicado", atrasoSLA: "No Prazo", status: "Finalizado", data: "2026-10-26" },
  { id: "rn5", operador: "KAMILA DE OLIVEIRA GASPAR DE LIMA", sup: "Julio", controle: "Waiver", motivo: "Erro operacional — taxa não cobrada na remarcação", atrasoSLA: "No Prazo", status: "Finalizado", data: "2026-10-28" },
];

const MEDIDAS_DISCIPLINARES_INICIAIS = [
  { id: "md1", colaborador: "DENISE QUEIROZ ALVES PINTO", sup: "Amanda", tipo: "Advertência Verbal", motivo: "Faltas injustificadas recorrentes e atraso na conexão", data: "2026-10-14", status: "Assinada" },
  { id: "md2", colaborador: "BRUNO MARTINS DE OLIVEIRA", sup: "Luciane", tipo: "Feedback Formal / Alinhamento", motivo: "Desvio de procedimento em emissão de Waiver N2", data: "2026-10-22", status: "Aplicada" },
  { id: "md3", colaborador: "SUSETE MARIA DA SILVA LEITE", sup: "Amanda", tipo: "Advertência Escrita", motivo: "Postura inadequada em atendimento monitorado", data: "2026-11-02", status: "Pendente Assinatura" },
];

const BANCO_HORAS_INICIAL = [
  { id: "bh1", colaborador: "JONATHAN PEREIRA DE ANDRADE", sup: "Amanda", saldo: "+14h 20m", vencimento: "2026-12-15", acao: "Programar folga compensatória" },
  { id: "bh2", colaborador: "EDILENE DAIANE DA SILVA LIBARINO", sup: "Cristiane", saldo: "+08h 45m", vencimento: "2026-12-20", acao: "Compensar 2h por sexta-feira" },
  { id: "bh3", colaborador: "RAFAEL PEREIRA DA COSTA", sup: "Luciane", saldo: "-05h 10m", vencimento: "2026-11-30", acao: "Reposição de horas em plantão" },
  { id: "bh4", colaborador: "KAREN MICHELE MESSIAS DA SILVA", sup: "Julio", saldo: "+18h 00m", vencimento: "2026-11-28", acao: "Prioridade de baixa (alerta >16h)" },
];

const CHAMADOS_LISTA_INICIAL = [
  { id: "chm1", codigo: "INC-908412", fila: "Remarcação / Waiver", volume: 418, tmo: 342, tme: 49, abandonos: 12, status: "Normal" },
  { id: "chm2", codigo: "INC-908530", fila: "Reembolso & Crédito", volume: 289, tmo: 375, tme: 64, abandonos: 23, status: "Ofensor TME" },
  { id: "chm3", codigo: "INC-908619", fila: "Atendimento em Libras", volume: 124, tmo: 295, tme: 28, abandonos: 3, status: "Excelente" },
  { id: "chm4", codigo: "INC-908704", fila: "Clientes Insígnia / VIP", volume: 312, tmo: 280, tme: 19, abandonos: 2, status: "Prioridade Máxima" },
  { id: "chm5", codigo: "INC-908890", fila: "Bagagem / Contingência", volume: 196, tmo: 410, tme: 72, abandonos: 31, status: "Crítico" },
];

const DETRATORES_INICIAIS = [
  { id: "det1", protocolo: "TKT-77219", operador: "DENISE QUEIROZ ALVES PINTO", sup: "Amanda", notaNPS: 2, motivo: "Demora na resolução de Waiver e falta de clareza", abandono: "Não" },
  { id: "det2", protocolo: "TKT-77304", operador: "ALANA DE SOUZA DUARTE", sup: "Cristiane", notaNPS: 3, motivo: "Cliente aguardou mais de 8 min em espera (TME alto)", abandono: "Sim (Rechamada)" },
  { id: "det3", protocolo: "TKT-77488", operador: "RAFAEL PEREIRA DA COSTA", sup: "Luciane", notaNPS: 1, motivo: "Queda de ligação sem retorno ao passageiro", abandono: "Sim" },
];

const TREINAMENTOS_ATRASO_INICIAIS = [
  { id: "tr1", treinamento: "Reciclagem Waiver & Regras Tarifárias 2026", colaborador: "ALANA DE SOUZA DUARTE", sup: "Cristiane", prazo: "2026-10-30", status: "Em Atraso (8 dias)" },
  { id: "tr2", treinamento: "Atendimento Humanizado & Libras Básico", colaborador: "BRUNO MARTINS DE OLIVEIRA", sup: "Luciane", prazo: "2026-11-01", status: "Em Atraso (6 dias)" },
  { id: "tr3", treinamento: "Procedimento de Invoice & VCR Payment", colaborador: "ROSIMEIRE NASCIMENTO DA SILVA LIMA", sup: "Amanda", prazo: "2026-11-04", status: "Em Atraso (3 dias)" },
];

const MATERIAIS_DOCUMENTOS_INICIAIS = [
  { id: "doc1", titulo: "Playbook de Monitoria & Calibração (Meta 40)", tipo: "Material Criado", data: "2026-10-05", link: "https://console.firebase.google.com", responsavel: "Coordenação Qualidade" },
  { id: "doc2", titulo: "Guia Rápido: Prevenção de Erros em Waiver e Invoice", tipo: "Material Criado", data: "2026-10-19", link: "https://console.firebase.google.com", responsavel: "Controles Internos / N2" },
  { id: "doc3", titulo: "Script de Atendimento Insígnia & Fluxo Libras", tipo: "Documento Oficial", data: "2026-09-28", link: "https://console.firebase.google.com", responsavel: "Operações GOL | Smiles" },
  { id: "doc4", titulo: "Planilha Mestra de Escalas, TO e Férias 2026/2027", tipo: "Link Útil", data: "2026-11-01", link: "https://console.firebase.google.com", responsavel: "Planejamento & Coordenação" },
];

const SUB_ABAS_COORD = [
  { id: "qualidade", rotulo: "1. Monitoria de Qualidade (Meta 40)" },
  { id: "controles", rotulo: "2. Controles Internos & N2" },
  { id: "escalas", rotulo: "3. Escalas, Férias, Banco & Disciplinar" },
  { id: "operacao", rotulo: "4. TMO/TME, Chamados, Libras, Insígnia & Detratores" },
  { id: "ciclo", rotulo: "5. Ciclo de Gestão, Treinamentos & Materiais" },
];

function corQuadrante(q) {
  if (q === "Q1") return { bg: "#15803d", color: "#fff" };
  if (q === "Q2") return { bg: "#eab308", color: "#1c1917" };
  if (q === "Q3") return { bg: "#ea580c", color: "#fff" };
  return { bg: "#dc2626", color: "#fff" };
}

export default function PainelCoordenadora({ melhorias = [], feedbacks = [], checklists = [] }) {
  const [subAba, setSubAba] = useState("qualidade");
  const [filtroSup, setFiltroSup] = useState("Todos");
  const [filtroQuadrante, setFiltroQuadrante] = useState("Todos");

  const [medidas, setMedidas] = useState(MEDIDAS_DISCIPLINARES_INICIAIS);
  const [novaMedida, setNovaMedida] = useState({ colaborador: "", sup: "Amanda", tipo: "Advertência Verbal", motivo: "" });

  const [materiais, setMateriais] = useState(MATERIAIS_DOCUMENTOS_INICIAIS);
  const [novoMaterial, setNovoMaterial] = useState({ titulo: "", tipo: "Material Criado", link: "", responsavel: "Coordenação" });

  const supervisoresFiltrados =
    filtroSup === "Todos" ? SUPERVISORES_DADOS : SUPERVISORES_DADOS.filter((s) => s.id === filtroSup);

  const operadoresFiltrados = OPERADORES_ATUAIS.filter(
    (op) => (filtroSup === "Todos" || op.sup === filtroSup) && (filtroQuadrante === "Todos" || op.q === filtroQuadrante)
  );

  const operadoresNovosFiltrados = OPERADORES_NOVOS.filter(
    (op) => (filtroSup === "Todos" || op.sup === filtroSup) && (filtroQuadrante === "Todos" || op.q === filtroQuadrante)
  );

  const totalMonitores = supervisoresFiltrados.reduce((acc, s) => acc + s.monitoriasMonitores, 0);
  const totalSupervisores = supervisoresFiltrados.reduce((acc, s) => acc + s.monitoriasSupervisores, 0);
  const mediaNotaMonitores = Math.round(
    supervisoresFiltrados.reduce((acc, s) => acc + s.notaMonitores, 0) / (supervisoresFiltrados.length || 1)
  );
  const mediaNotaSupervisao = Math.round(
    supervisoresFiltrados.reduce((acc, s) => acc + s.notaSupervisao, 0) / (supervisoresFiltrados.length || 1)
  );

  function adicionarMedida(e) {
    e.preventDefault();
    if (!novaMedida.colaborador.trim() || !novaMedida.motivo.trim()) return;
    setMedidas([
      {
        id: "md_" + Date.now(),
        ...novaMedida,
        data: new Date().toISOString().slice(0, 10),
        status: "Registrada",
      },
      ...medidas,
    ]);
    setNovaMedida({ colaborador: "", sup: "Amanda", tipo: "Advertência Verbal", motivo: "" });
  }

  function removerMedida(id) {
    setMedidas(medidas.filter((m) => m.id !== id));
  }

  function adicionarMaterial(e) {
    e.preventDefault();
    if (!novoMaterial.titulo.trim()) return;
    setMateriais([
      {
        id: "doc_" + Date.now(),
        ...novoMaterial,
        data: new Date().toISOString().slice(0, 10),
      },
      ...materiais,
    ]);
    setNovoMaterial({ titulo: "", tipo: "Material Criado", link: "", responsavel: "Coordenação" });
  }

  function removerMaterial(id) {
    setMateriais(materiais.filter((m) => m.id !== id));
  }

  return (
    <div>
      {/* BARRA DE SUB-ABAS DA COORDENAÇÃO */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {SUB_ABAS_COORD.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubAba(t.id)}
            className={`f30-btn ${subAba === t.id ? "" : "secundario"} pequeno`}
            style={{ fontWeight: 700 }}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      {/* BARRA DE FILTROS RÁPIDOS POR SUPERVISOR */}
      <div
        className="f30-card"
        style={{
          marginBottom: 18,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          background: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="f30-mono" style={{ fontSize: 11, color: "#fb923c", fontWeight: 700 }}>
            FILTRO POR SUPERVISOR:
          </span>
          {["Todos", ...SUPERVISORES_DADOS.map((s) => s.id)].map((sup) => (
            <button
              key={sup}
              onClick={() => setFiltroSup(sup)}
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                border: filtroSup === sup ? "1px solid #ea580c" : "1px solid rgba(255,255,255,0.2)",
                background: filtroSup === sup ? "#ea580c" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {sup}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="f30-mono" style={{ fontSize: 11, color: "#cbd5e1" }}>
            QUADRANTE:
          </span>
          {["Todos", "Q1", "Q2", "Q3", "Q4"].map((q) => (
            <button
              key={q}
              onClick={() => setFiltroQuadrante(q)}
              style={{
                padding: "4px 9px",
                borderRadius: 6,
                border: "none",
                background: filtroQuadrante === q ? "#f97316" : "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SUB-ABA 1: MONITORIA DE QUALIDADE (ONE PAGE)
         ===================================================================== */}
      {subAba === "qualidade" && (
        <>
          <div className="f30-grid f30-grid-4" style={{ marginBottom: 18 }}>
            <div className="f30-card" style={{ borderTop: "4px solid var(--orange)" }}>
              <div className="f30-kpi-label">MÉDIA GERAL DA MONITORIA</div>
              <div className="f30-kpi-value" style={{ color: "var(--orange)", marginTop: 6 }}>
                {mediaNotaMonitores}%
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>Nota geral de monitores</div>
            </div>

            <div className="f30-card" style={{ borderTop: "4px solid var(--orange)" }}>
              <div className="f30-kpi-label">MONITORIAS DE MONITORES</div>
              <div className="f30-kpi-value" style={{ color: "var(--orange)", marginTop: 6 }}>
                {totalMonitores}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>Quantidade realizada</div>
            </div>

            <div className="f30-card" style={{ borderTop: "4px solid var(--orange)" }}>
              <div className="f30-kpi-label">MONITORIAS DE SUPERVISORES</div>
              <div className="f30-kpi-value" style={{ color: "var(--orange)", marginTop: 6 }}>
                {totalSupervisores}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                Meta individual: <b>40 monitorias/sup</b>
              </div>
            </div>

            <div className="f30-card" style={{ borderTop: "4px solid var(--good)" }}>
              <div className="f30-kpi-label">NOTA GERAL DA SUPERVISÃO</div>
              <div className="f30-kpi-value" style={{ color: "var(--good)", marginTop: 6 }}>
                {mediaNotaSupervisao}%
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>Média consolidada da liderança</div>
            </div>
          </div>

          <div className="f30-grid f30-grid-2" style={{ marginBottom: 18 }}>
            {/* TABELA MONITORIAS POR SUPERVISOR COM META 40 */}
            <div className="f30-card">
              <div className="f30-secao-titulo" style={{ color: "var(--orange-dark)" }}>
                Monitorias por Supervisor (Meta: 40 realizadas)
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--orange)", color: "#fff", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px", borderRadius: "8px 0 0 0" }}>Supervisor</th>
                      <th style={{ padding: "8px 10px", textAlign: "center" }}>Monitores</th>
                      <th style={{ padding: "8px 10px", textAlign: "center" }}>Supervisores</th>
                      <th style={{ padding: "8px 10px", textAlign: "center" }}>Total / Meta 40</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", borderRadius: "0 8px 0 0" }}>Nota Sup.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisoresFiltrados.map((s) => {
                      const totalFeito = s.monitoriasMonitores + s.monitoriasSupervisores;
                      const bateuMeta = totalFeito >= s.metaMonitoria;
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "9px 10px", fontWeight: 700 }}>{s.id}</td>
                          <td style={{ padding: "9px 10px", textAlign: "center" }}>{s.monitoriasMonitores}</td>
                          <td style={{ padding: "9px 10px", textAlign: "center" }}>{s.monitoriasSupervisores}</td>
                          <td style={{ padding: "9px 10px", textAlign: "center" }}>
                            <span
                              className="f30-mono"
                              style={{
                                padding: "3px 8px",
                                borderRadius: 999,
                                fontSize: 11.5,
                                fontWeight: 700,
                                background: bateuMeta ? "var(--good-soft)" : "var(--warn-soft)",
                                color: bateuMeta ? "var(--good)" : "var(--warn)",
                              }}
                            >
                              {totalFeito} / 40 ({Math.round((totalFeito / 40) * 100)}%)
                            </span>
                          </td>
                          <td style={{ padding: "9px 10px", textAlign: "center", fontWeight: 800, color: s.notaSupervisao >= 95 ? "var(--good)" : "var(--orange)" }}>
                            {s.notaSupervisao}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BARRAS DE NOTA DE MONITORES E SUPERVISÃO */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 8 }}>
                  NOTA DE MONITORES POR SUPERVISÃO (%)
                </div>
                <div className="f30-grid f30-grid-3" style={{ gap: 10 }}>
                  {supervisoresFiltrados.map((s) => (
                    <div key={s.id} style={{ background: "var(--cream)", padding: "8px 10px", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700 }}>
                        <span>{s.id}</span>
                        <span style={{ color: s.notaMonitores >= 90 ? "var(--good)" : s.notaMonitores < 75 ? "var(--bad)" : "var(--orange)" }}>
                          {s.notaMonitores}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, marginTop: 5, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${s.notaMonitores}%`,
                            height: "100%",
                            background: s.notaMonitores >= 90 ? "var(--good)" : s.notaMonitores < 75 ? "var(--bad)" : "var(--orange)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISTRIBUIÇÃO DOS QUADRANTES */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-soft)", marginBottom: 10 }}>
                  DISTRIBUIÇÃO DOS QUADRANTES — OPERADORES ATUAIS (32) & NOVOS (8)
                </div>
                <div className="f30-grid f30-grid-4" style={{ gap: 8 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: "#dcfce7", borderLeft: "4px solid #15803d" }}>
                    <b style={{ color: "#15803d" }}>Q1 (Excelência)</b>
                    <div className="f30-mono" style={{ fontSize: 16, fontWeight: 800 }}>11 ops (34,4%)</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: "#fef9c3", borderLeft: "4px solid #eab308" }}>
                    <b style={{ color: "#a16207" }}>Q2 (Adequado)</b>
                    <div className="f30-mono" style={{ fontSize: 16, fontWeight: 800 }}>10 ops (31,2%)</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: "#ffedd5", borderLeft: "4px solid #ea580c" }}>
                    <b style={{ color: "#c2410c" }}>Q3 (Atenção)</b>
                    <div className="f30-mono" style={{ fontSize: 16, fontWeight: 800 }}>10 ops (31,2%)</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: "#fee2e2", borderLeft: "4px solid #dc2626" }}>
                    <b style={{ color: "#b91c1c" }}>Q4 (Crítico)</b>
                    <div className="f30-mono" style={{ fontSize: 16, fontWeight: 800 }}>1 op (3,1%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RANKING DE OPERADORES ATUAIS E NOVOS */}
            <div className="f30-card" style={{ maxHeight: 540, overflowY: "auto" }}>
              <div className="f30-secao-titulo" style={{ color: "var(--orange-dark)" }}>
                Operadores Atuais ({operadoresFiltrados.length}) — Nota de Monitores
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left", color: "var(--ink-soft)" }}>
                    <th style={{ padding: "6px" }}>Operador</th>
                    <th style={{ padding: "6px" }}>Sup.</th>
                    <th style={{ padding: "6px", textAlign: "center" }}>Nota</th>
                    <th style={{ padding: "6px", textAlign: "center" }}>Quadrante</th>
                  </tr>
                </thead>
                <tbody>
                  {operadoresFiltrados.map((op) => {
                    const est = corQuadrante(op.q);
                    return (
                      <tr key={op.nome} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "6px", fontWeight: 600 }}>{op.nome}</td>
                        <td style={{ padding: "6px", color: "var(--ink-soft)" }}>{op.sup}</td>
                        <td style={{ padding: "6px", textAlign: "center", fontWeight: 700 }}>{op.nota}%</td>
                        <td style={{ padding: "6px", textAlign: "center" }}>
                          <span style={{ background: est.bg, color: est.color, padding: "2px 10px", borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                            {op.q}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="f30-secao-titulo" style={{ color: "var(--orange-dark)", marginTop: 18 }}>
                Operadores Novos ({operadoresNovosFiltrados.length})
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {operadoresNovosFiltrados.map((op) => {
                    const est = corQuadrante(op.q);
                    return (
                      <tr key={op.nome} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "6px", fontWeight: 600 }}>{op.nome}</td>
                        <td style={{ padding: "6px", color: "var(--ink-soft)" }}>{op.sup}</td>
                        <td style={{ padding: "6px", textAlign: "center", fontWeight: 700 }}>{op.nota}%</td>
                        <td style={{ padding: "6px", textAlign: "center" }}>
                          <span style={{ background: est.bg, color: est.color, padding: "2px 10px", borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
                            {op.q}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          SUB-ABA 2: CONTROLES INTERNOS, REORIENTAÇÕES & N2
         ===================================================================== */}
      {subAba === "controles" && (
        <>
          <div className="f30-grid f30-grid-4" style={{ marginBottom: 18 }}>
            <div className="f30-card" style={{ borderTop: "4px solid var(--orange)" }}>
              <div className="f30-kpi-label">QT. REORIENTAÇÕES (MÊS)</div>
              <div className="f30-kpi-value">5</div>
              <div style={{ fontSize: 12, color: "var(--good)", fontWeight: 700 }}>5 Casos Finalizados (100%)</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid var(--good)" }}>
              <div className="f30-kpi-label">FORA DO SLA / REVERTIDAS</div>
              <div className="f30-kpi-value">0 / 0</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Nenhum atraso de tratativa N2</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid var(--bad)" }}>
              <div className="f30-kpi-label">MAIOR MOTIVO / TOP OFENSOR</div>
              <div className="f30-kpi-value" style={{ fontSize: 22 }}>Waiver (39 acum.)</div>
              <div style={{ fontSize: 12, color: "var(--bad)", fontWeight: 700 }}>80% Erro Operacional · 20% Pend. Justif.</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid var(--warn)" }}>
              <div className="f30-kpi-label">EQUIPE MAIS REORIENTADA</div>
              <div className="f30-kpi-value" style={{ fontSize: 20 }}>Cristiane & Camila</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>2 casos cada no mês · Taxa erro: 14%</div>
            </div>
          </div>

          <div className="f30-grid f30-grid-2" style={{ marginBottom: 18 }}>
            <div className="f30-card">
              <div className="f30-secao-titulo">Reorientação por Supervisão & Top 3 Controles (Mar–Out)</div>
              <div className="f30-grid f30-grid-2">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>RANKING EQUIPES (OUTUBRO)</label>
                  {SUPERVISORES_DADOS.sort((a, b) => b.reorientacoesOut - a.reorientacoesOut).map((s, idx) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dashed var(--line)", fontSize: 13 }}>
                      <span><b>{idx + 1}º</b> {s.nomeCompleto}</span>
                      <b className="f30-mono" style={{ color: s.reorientacoesOut > 0 ? "var(--orange-dark)" : "var(--good)" }}>{s.reorientacoesOut}</b>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>TOP 3 OFENSORES (MAR - OUT)</label>
                  <div style={{ background: "var(--orange-soft)", padding: 12, borderRadius: 10, marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      <span>1º Waiver</span>
                      <span style={{ color: "var(--orange-dark)" }}>39 casos</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                      <span>2º Invoice</span>
                      <span>8 casos</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13 }}>
                      <span>3º Precificação M.</span>
                      <span>4 casos</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-soft)" }}>
                    <b>Evolução Mensal:</b> Mar (4) · Abr (11) · Mai (8) · Jun (3) · Jul (12) · Ago (9) · Set (10) · Out (5)
                  </div>
                </div>
              </div>
            </div>

            <div className="f30-card">
              <div className="f30-secao-titulo">Detalhamento de Reorientações do N2 e Status de Atraso</div>
              {REORIENTACOES_N2_INICIAIS.filter((r) => filtroSup === "Todos" || r.sup === filtroSup).map((r) => (
                <div key={r.id} style={{ padding: "9px 0", borderBottom: "1px dashed var(--line)", fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{r.operador} ({r.sup})</span>
                    <span className="f30-mono" style={{ color: "var(--good)" }}>{r.atrasoSLA} · {r.status}</span>
                  </div>
                  <div style={{ color: "var(--ink-soft)", marginTop: 2 }}>
                    <b>{r.controle}:</b> {r.motivo} ({r.data})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="f30-card">
            <div className="f30-secao-titulo">Abertura por Controle — Março a Outubro</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--orange)", color: "#fff" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Controle</th>
                    <th style={{ padding: 8 }}>Março</th>
                    <th style={{ padding: 8 }}>Abril</th>
                    <th style={{ padding: 8 }}>Maio</th>
                    <th style={{ padding: 8 }}>Junho</th>
                    <th style={{ padding: 8 }}>Julho</th>
                    <th style={{ padding: 8 }}>Agosto</th>
                    <th style={{ padding: 8 }}>Setembro</th>
                    <th style={{ padding: 8 }}>Outubro</th>
                    <th style={{ padding: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {TABELA_CONTROLES_MESES.map((row) => (
                    <tr key={row.controle} style={{ borderBottom: "1px solid var(--line)", textAlign: "center" }}>
                      <td style={{ padding: 8, textAlign: "left", fontWeight: 700 }}>{row.controle}</td>
                      <td>{row.mar}</td>
                      <td>{row.abr}</td>
                      <td>{row.mai}</td>
                      <td>{row.jun}</td>
                      <td>{row.jul}</td>
                      <td>{row.ago}</td>
                      <td>{row.set}</td>
                      <td style={{ fontWeight: 800, color: "var(--orange-dark)" }}>{row.out}</td>
                      <td style={{ fontWeight: 800 }}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          SUB-ABA 3: ESCALAS, FÉRIAS, HORÁRIO SUPORTE, BANCO DE HORAS E DISCIPLINAR
         ===================================================================== */}
      {subAba === "escalas" && (
        <>
          <div className="f30-card" style={{ marginBottom: 18 }}>
            <div className="f30-secao-titulo">Escala dos Supervisores, Horários de Suporte e Pretensão de Férias (TO)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--lilac-soft)", color: "var(--ink)", textAlign: "left" }}>
                    <th style={{ padding: 9 }}>Supervisor</th>
                    <th style={{ padding: 9 }}>Escala de Trabalho</th>
                    <th style={{ padding: 9 }}>Horário de Plantão / Suporte</th>
                    <th style={{ padding: 9 }}>Período Pretensão de Férias</th>
                    <th style={{ padding: 9 }}>Status TO / Férias</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisoresFiltrados.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: 9, fontWeight: 700 }}>{s.nomeCompleto}</td>
                      <td style={{ padding: 9 }} className="f30-mono">{s.escala}</td>
                      <td style={{ padding: 9 }} className="f30-mono">{s.suporteHorario}</td>
                      <td style={{ padding: 9 }}>{s.ferias}</td>
                      <td style={{ padding: 9 }}>
                        <span className="f30-motivo-chip">{s.toFerias}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="f30-grid f30-grid-2">
            {/* CONTROLE DE BANCO DE HORAS */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Controle de Banco de Horas</div>
              {BANCO_HORAS_INICIAL.filter((b) => filtroSup === "Todos" || b.sup === filtroSup).map((b) => (
                <div key={b.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{b.colaborador} ({b.sup})</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{b.acao} · Venc.: {b.vencimento}</div>
                  </div>
                  <span
                    className="f30-mono"
                    style={{
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: b.saldo.startsWith("-") ? "var(--bad-soft)" : "var(--good-soft)",
                      color: b.saldo.startsWith("-") ? "var(--bad)" : "var(--good)",
                    }}
                  >
                    {b.saldo}
                  </span>
                </div>
              ))}
            </div>

            {/* MEDIDAS DISCIPLINARES */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Aba de Medidas Disciplinares</div>
              <form className="f30-form" onSubmit={adicionarMedida} style={{ marginBottom: 14 }}>
                <div className="f30-grid f30-grid-2">
                  <div>
                    <label>Colaborador</label>
                    <input
                      type="text"
                      value={novaMedida.colaborador}
                      onChange={(e) => setNovaMedida({ ...novaMedida, colaborador: e.target.value })}
                      placeholder="Nome do operador"
                    />
                  </div>
                  <div>
                    <label>Tipo de Medida</label>
                    <select value={novaMedida.tipo} onChange={(e) => setNovaMedida({ ...novaMedida, tipo: e.target.value })}>
                      <option>Feedback Formal / Alinhamento</option>
                      <option>Advertência Verbal</option>
                      <option>Advertência Escrita</option>
                      <option>Suspensão Disciplinar</option>
                    </select>
                  </div>
                </div>
                <label>Motivo / Ocorrência</label>
                <input
                  type="text"
                  value={novaMedida.motivo}
                  onChange={(e) => setNovaMedida({ ...novaMedida, motivo: e.target.value })}
                  placeholder="Descreva a ocorrência..."
                />
                <div className="f30-form-actions">
                  <button className="f30-btn pequeno" type="submit">+ Registrar Medida</button>
                </div>
              </form>

              {medidas.map((m) => (
                <div key={m.id} style={{ padding: "9px 0", borderBottom: "1px dashed var(--line)", fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>{m.colaborador} ({m.sup})</b>
                    <button
                      type="button"
                      className="f30-btn secundario pequeno"
                      style={{ padding: "2px 8px", fontSize: 11, color: "var(--bad)" }}
                      onClick={() => removerMedida(m.id)}
                    >
                      Remover
                    </button>
                  </div>
                  <div style={{ color: "var(--orange-dark)", fontWeight: 700 }}>{m.tipo} · {m.data}</div>
                  <div style={{ color: "var(--ink-soft)" }}>{m.motivo}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          SUB-ABA 4: INDICADORES TMO/TME, CHAMADOS, LIBRAS, INSÍGNIA, DETRATORES & ABANDONO
         ===================================================================== */}
      {subAba === "operacao" && (
        <>
          <div className="f30-grid f30-grid-4" style={{ marginBottom: 18 }}>
            <div className="f30-card" style={{ borderTop: "4px solid var(--orange)" }}>
              <div className="f30-kpi-label">TMO / TME CONSOLIDADO</div>
              <div className="f30-kpi-value" style={{ fontSize: 26 }}>326s / 47s</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Meta TMO: 320s | Meta TME: 45s</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid #6366f1" }}>
              <div className="f30-kpi-label">ATENDIMENTOS EM LIBRAS</div>
              <div className="f30-kpi-value" style={{ color: "#4f46e5" }}>124</div>
              <div style={{ fontSize: 12, color: "var(--good)", fontWeight: 700 }}>98,4% satisfação · TME 28s</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid #eab308" }}>
              <div className="f30-kpi-label">ATENDIMENTOS INSÍGNIA (VIP)</div>
              <div className="f30-kpi-value" style={{ color: "#ca8a04" }}>312</div>
              <div style={{ fontSize: 12, color: "var(--good)", fontWeight: 700 }}>FCR 95% · Prioridade Diamante</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid var(--bad)" }}>
              <div className="f30-kpi-label">ABANDONO DE TICKETS</div>
              <div className="f30-kpi-value" style={{ color: "var(--bad)" }}>71 (5,3%)</div>
              <div style={{ fontSize: 12, color: "var(--bad)" }}>Principal fila: Bagagem & Reembolso</div>
            </div>
          </div>

          <div className="f30-card" style={{ marginBottom: 18 }}>
            <div className="f30-secao-titulo">Lista de Chamados, Códigos, Volume, TMO, TME e Taxa de Abandono</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--orange)", color: "#fff", textAlign: "left" }}>
                    <th style={{ padding: 8 }}>Código</th>
                    <th style={{ padding: 8 }}>Fila / Assunto</th>
                    <th style={{ padding: 8, textAlign: "center" }}>Volume</th>
                    <th style={{ padding: 8, textAlign: "center" }}>TMO</th>
                    <th style={{ padding: 8, textAlign: "center" }}>TME</th>
                    <th style={{ padding: 8, textAlign: "center" }}>Abandonos</th>
                    <th style={{ padding: 8 }}>Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  {CHAMADOS_LISTA_INICIAL.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: 8 }} className="f30-mono"><b>{c.codigo}</b></td>
                      <td style={{ padding: 8, fontWeight: 700 }}>{c.fila}</td>
                      <td style={{ padding: 8, textAlign: "center" }}>{c.volume}</td>
                      <td style={{ padding: 8, textAlign: "center" }}>{c.tmo}s</td>
                      <td style={{ padding: 8, textAlign: "center" }}>{c.tme}s</td>
                      <td style={{ padding: 8, textAlign: "center", fontWeight: 700, color: c.abandonos > 20 ? "var(--bad)" : "var(--ink)" }}>
                        {c.abandonos}
                      </td>
                      <td style={{ padding: 8 }}>
                        <span className="f30-motivo-chip">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="f30-card">
            <div className="f30-secao-titulo">Análise de Detratores (NPS), Motivos, Pessoas e Abandono de Tickets</div>
            {DETRATORES_INICIAIS.filter((d) => filtroSup === "Todos" || d.sup === filtroSup).map((d) => (
              <div key={d.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    <span className="f30-mono" style={{ color: "var(--orange-dark)" }}>{d.protocolo}</span> — {d.operador} (Sup. {d.sup})
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>Motivo: {d.motivo}</div>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ fontWeight: 800, color: "var(--bad)" }}>Nota NPS: {d.notaNPS}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>Abandono: {d.abandono}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =====================================================================
          SUB-ABA 5: CICLO DE GESTÃO, PROCESSOS DE MELHORIAS, TREINAMENTOS EM ATRASO E MATERIAIS/LINKS
         ===================================================================== */}
      {subAba === "ciclo" && (
        <>
          <div className="f30-grid f30-grid-3" style={{ marginBottom: 18 }}>
            <div className="f30-card">
              <div className="f30-kpi-label">FEEDBACKS REGISTRADOS</div>
              <div className="f30-kpi-value">{feedbacks.length}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>100% integrados ao Ciclo de Gestão</div>
            </div>
            <div className="f30-card">
              <div className="f30-kpi-label">PLANOS DE AÇÃO & MELHORIAS</div>
              <div className="f30-kpi-value">{melhorias.length}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Acompanhamento de causas e prazos</div>
            </div>
            <div className="f30-card">
              <div className="f30-kpi-label">TREINAMENTOS EM ATRASO</div>
              <div className="f30-kpi-value" style={{ color: "var(--bad)" }}>{TREINAMENTOS_ATRASO_INICIAIS.length}</div>
              <div style={{ fontSize: 12, color: "var(--bad)" }}>Cobrar conclusão imediata dos supervisores</div>
            </div>
          </div>

          <div className="f30-grid f30-grid-2" style={{ marginBottom: 18 }}>
            <div className="f30-card">
              <div className="f30-secao-titulo">Treinamentos Obrigatórios em Atraso</div>
              {TREINAMENTOS_ATRASO_INICIAIS.map((t) => (
                <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.treinamento}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
                    Operador: <b>{t.colaborador}</b> (Sup. {t.sup}) · Prazo: {t.prazo}
                  </div>
                  <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 700, color: "var(--bad)", background: "var(--bad-soft)", padding: "2px 8px", borderRadius: 6 }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="f30-card">
              <div className="f30-secao-titulo">Todos os Processos de Melhorias, Planos de Ação e Datas</div>
              {melhorias.map((m) => (
                <div key={m.id} style={{ padding: "9px 0", borderBottom: "1px dashed var(--line)", fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>{m.problema}</span>
                    <span className="f30-mono">{m.prazo}</span>
                  </div>
                  <div style={{ color: "var(--ink-soft)", marginTop: 2 }}>
                    <b>Ação:</b> {m.acao} · <b>Resp.:</b> {m.responsavel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="f30-card">
            <div className="f30-secao-titulo">Página de Materiais Criados, Documentos Oficiais e Links Úteis</div>
            <form className="f30-form" onSubmit={adicionarMaterial} style={{ marginBottom: 16 }}>
              <div className="f30-grid f30-grid-3">
                <div>
                  <label>Título do Material / Documento</label>
                  <input
                    type="text"
                    value={novoMaterial.titulo}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, titulo: e.target.value })}
                    placeholder="Ex.: Guia de Bolso Waiver"
                  />
                </div>
                <div>
                  <label>Categoria</label>
                  <select value={novoMaterial.tipo} onChange={(e) => setNovoMaterial({ ...novoMaterial, tipo: e.target.value })}>
                    <option>Material Criado</option>
                    <option>Documento Oficial</option>
                    <option>Link Útil</option>
                  </select>
                </div>
                <div>
                  <label>Link (URL)</label>
                  <input
                    type="text"
                    value={novoMaterial.link}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">+ Adicionar Material / Link</button>
              </div>
            </form>

            <div className="f30-grid f30-grid-2">
              {materiais.map((docItem) => (
                <div key={docItem.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="f30-motivo-chip">{docItem.tipo}</span>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 6 }}>{docItem.titulo}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                      Criado em {docItem.data} · {docItem.responsavel}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {docItem.link && (
                      <a
                        href={docItem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="f30-btn secundario pequeno"
                        style={{ textDecoration: "none" }}
                      >
                        Abrir
                      </a>
                    )}
                    <button
                      type="button"
                      className="f30-btn secundario pequeno"
                      style={{ color: "var(--bad)" }}
                      onClick={() => removerMaterial(docItem.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
