import React, { useState, useMemo } from "react";

function gerarId(prefixo) {
  return `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function calcularQuadrante(nota) {
  const n = Number(nota) || 0;
  if (n >= 95) return "Q1";
  if (n >= 90) return "Q2";
  if (n >= 60) return "Q3";
  return "Q4";
}

function CorQuadrante({ q }) {
  const cores = {
    Q1: { bg: "#15803D", txt: "#fff" },
    Q2: { bg: "#EAB308", txt: "#1F2937" },
    Q3: { bg: "#F97316", txt: "#fff" },
    Q4: { bg: "#DC2626", txt: "#fff" },
  };
  const c = cores[q] || cores.Q3;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 12px",
        borderRadius: 6,
        fontWeight: 800,
        fontSize: 11.5,
        background: c.bg,
        color: c.txt,
        textAlign: "center",
        minWidth: 44,
      }}
    >
      {q}
    </span>
  );
}

export default function PainelCoordenadora({
  supervisoresCadastrados = [],
  colaboradores = [],
  melhorias = [],
  feedbacks = [],
  checklists = [],
  dadosCoordenacao = {},
  onAtualizarDadosCoordenacao,
  onRemoverMelhoria,
}) {
  const [subAba, setSubAba] = useState("qualidade");
  const [filtroSupUid, setFiltroSupUid] = useState(""); // "" = Todos os cadastrados

  // Listas salvas no banco (sem dados fictícios pré-definidos)
  const monitorias = Array.isArray(dadosCoordenacao?.monitorias) ? dadosCoordenacao.monitorias : [];
  const reorientacoes = Array.isArray(dadosCoordenacao?.reorientacoes) ? dadosCoordenacao.reorientacoes : [];
  const escalasFerias = Array.isArray(dadosCoordenacao?.escalasFerias) ? dadosCoordenacao.escalasFerias : [];
  const medidasDisciplinares = Array.isArray(dadosCoordenacao?.medidasDisciplinares)
    ? dadosCoordenacao.medidasDisciplinares
    : [];
  const chamados = Array.isArray(dadosCoordenacao?.chamados) ? dadosCoordenacao.chamados : [];
  const materiais = Array.isArray(dadosCoordenacao?.materiais) ? dadosCoordenacao.materiais : [];
  const treinamentos = Array.isArray(dadosCoordenacao?.treinamentos) ? dadosCoordenacao.treinamentos : [];
  const detratores = Array.isArray(dadosCoordenacao?.detratores) ? dadosCoordenacao.detratores : [];
  const abandonos = Array.isArray(dadosCoordenacao?.abandonos) ? dadosCoordenacao.abandonos : [];

  // Estados de formulários (todos iniciando vazios "", sem opções pré-selecionadas)
  const [formMon, setFormMon] = useState({
    colaboradorId: "",
    supervisorUid: "",
    notaMonitor: "",
    notaSupervisao: "",
    qtdMonitores: "",
    qtdSupervisores: "",
  });

  const [formReor, setFormReor] = useState({
    colaboradorId: "",
    supervisorUid: "",
    controle: "",
    motivo: "",
    atrasoSLA: "",
    status: "",
    data: "",
  });

  const [formEscala, setFormEscala] = useState({
    supervisorUid: "",
    escala: "",
    suporte: "",
    ferias: "",
    bancoHoras: "",
  });

  const [formMedida, setFormMedida] = useState({
    colaboradorId: "",
    supervisorUid: "",
    tipo: "",
    motivo: "",
    data: "",
    status: "",
  });

  const [formChamado, setFormChamado] = useState({
    codigo: "",
    fila: "",
    assunto: "",
    supervisorUid: "",
    volume: "",
    tmo: "",
    tme: "",
    status: "",
  });

  const [formMaterial, setFormMaterial] = useState({
    titulo: "",
    tipo: "",
    data: "",
    link: "",
    responsavelUid: "",
  });

  const [formTreino, setFormTreino] = useState({
    colaboradorId: "",
    supervisorUid: "",
    treinamento: "",
    prazo: "",
    status: "",
  });

  const [formDetrator, setFormDetrator] = useState({
    colaboradorId: "",
    supervisorUid: "",
    notaNPS: "",
    motivo: "",
    ticket: "",
  });

  const [formAbandono, setFormAbandono] = useState({
    fila: "",
    supervisorUid: "",
    recebidos: "",
    abandonados: "",
    tempoMedioAbandono: "",
    motivoPrincipal: "",
  });

  function salvarLista(chave, novaLista) {
    if (!onAtualizarDadosCoordenacao) return;
    onAtualizarDadosCoordenacao({
      ...dadosCoordenacao,
      [chave]: novaLista,
    });
  }

  function nomeSupervisorPorUid(uid) {
    if (!uid) return "Não vinculado";
    const s = supervisoresCadastrados.find((x) => x.uid === uid);
    return s ? s.nome || s.email : "Não encontrado";
  }

  function nomeColaboradorPorId(id) {
    if (!id) return "Não vinculado";
    const c = colaboradores.find((x) => x.id === id || x.uid === id);
    return c ? c.nome || c.email : "Não encontrado";
  }

  // Filtragem pelo supervisor selecionado no topo
  const colaboradoresFiltrados = useMemo(() => {
    if (!filtroSupUid) return colaboradores;
    return colaboradores.filter((c) => c.supervisorUid === filtroSupUid);
  }, [colaboradores, filtroSupUid]);

  const monitoriasFiltradas = useMemo(() => {
    if (!filtroSupUid) return monitorias;
    return monitorias.filter((m) => m.supervisorUid === filtroSupUid);
  }, [monitorias, filtroSupUid]);

  const reorientacoesFiltradas = useMemo(() => {
    if (!filtroSupUid) return reorientacoes;
    return reorientacoes.filter((r) => r.supervisorUid === filtroSupUid);
  }, [reorientacoes, filtroSupUid]);

  const escalasFiltradas = useMemo(() => {
    if (!filtroSupUid) return escalasFerias;
    return escalasFerias.filter((e) => e.supervisorUid === filtroSupUid);
  }, [escalasFerias, filtroSupUid]);

  const medidasFiltradas = useMemo(() => {
    if (!filtroSupUid) return medidasDisciplinares;
    return medidasDisciplinares.filter((m) => m.supervisorUid === filtroSupUid);
  }, [medidasDisciplinares, filtroSupUid]);

  const chamadosFiltrados = useMemo(() => {
    if (!filtroSupUid) return chamados;
    return chamados.filter((c) => c.supervisorUid === filtroSupUid);
  }, [chamados, filtroSupUid]);

  const treinamentosFiltrados = useMemo(() => {
    if (!filtroSupUid) return treinamentos;
    return treinamentos.filter((t) => t.supervisorUid === filtroSupUid);
  }, [treinamentos, filtroSupUid]);

  const detratoresFiltrados = useMemo(() => {
    if (!filtroSupUid) return detratores;
    return detratores.filter((d) => d.supervisorUid === filtroSupUid);
  }, [detratores, filtroSupUid]);

  const abandonosFiltrados = useMemo(() => {
    if (!filtroSupUid) return abandonos;
    return abandonos.filter((a) => a.supervisorUid === filtroSupUid);
  }, [abandonos, filtroSupUid]);

  // Cálculos reais baseados nos registros do banco
  const mediaMonitoria = useMemo(() => {
    if (!monitoriasFiltradas.length) return 0;
    const soma = monitoriasFiltradas.reduce((acc, m) => acc + (Number(m.notaMonitor) || 0), 0);
    return Math.round(soma / monitoriasFiltradas.length);
  }, [monitoriasFiltradas]);

  const mediaSupervisao = useMemo(() => {
    if (!monitoriasFiltradas.length) return 0;
    const soma = monitoriasFiltradas.reduce((acc, m) => acc + (Number(m.notaSupervisao) || 0), 0);
    return Math.round(soma / monitoriasFiltradas.length);
  }, [monitoriasFiltradas]);

  const totalMonitores = useMemo(
    () => monitoriasFiltradas.reduce((acc, m) => acc + (Number(m.qtdMonitores) || 0), 0),
    [monitoriasFiltradas]
  );

  const totalSupervisoresMon = useMemo(
    () => monitoriasFiltradas.reduce((acc, m) => acc + (Number(m.qtdSupervisores) || 0), 0),
    [monitoriasFiltradas]
  );

  const SUB_ABAS = [
    { id: "qualidade", rotulo: "1. Monitoria de Qualidade" },
    { id: "controles", rotulo: "2. Controles Internos & N2" },
    { id: "escala_disciplinar", rotulo: "3. Escala, Férias, BH & Disciplinar" },
    { id: "indicadores_chamados", rotulo: "4. TMO/TME, Chamados, Melhorias & Materiais" },
    { id: "ciclo_detratores", rotulo: "5. Ciclo de Gestão, Treinamento, Detratores & Abandono" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* CABEÇALHO EXECUTIVO COM FILTROS REAIS DO BANCO DE DADOS */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 65%, #EA580C 100%)",
          color: "#fff",
          borderRadius: 16,
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FDBA74", fontWeight: 700 }}>
            VISÃO EXCLUSIVA DE COORDENAÇÃO GERAL · DADOS REAIS DO BANCO
          </div>
          <h2 style={{ margin: "4px 0 2px", fontSize: 21, fontWeight: 800 }}>
            PAINEL EXECUTIVO DA COORDENAÇÃO
          </h2>
          <div style={{ fontSize: 12, color: "#CBD5E1" }}>
            Supervisores cadastrados no banco: <b>{supervisoresCadastrados.length}</b> · Colaboradores cadastrados: <b>{colaboradores.length}</b>
          </div>
        </div>

        {/* Botões rápidos de filtro apenas com os Supervisores reais cadastrados no banco */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#E2E8F0", fontWeight: 600 }}>
            FILTRAR POR SUPERVISOR(A) CADASTRADO(A) NO BANCO:
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setFiltroSupUid("")}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: filtroSupUid === "" ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                background: filtroSupUid === "" ? "#EA580C" : "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Todos ({supervisoresCadastrados.length})
            </button>
            {supervisoresCadastrados.map((sup) => (
              <button
                type="button"
                key={sup.uid}
                onClick={() => setFiltroSupUid(sup.uid)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: filtroSupUid === sup.uid ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                  background: filtroSupUid === sup.uid ? "#EA580C" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {sup.nome || sup.email}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE OS 5 BLOCOS DA COORDENADORA */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SUB_ABAS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSubAba(b.id)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: subAba === b.id ? "1px solid #EA580C" : "1px solid var(--line)",
              background: subAba === b.id ? "#EA580C" : "var(--card)",
              color: subAba === b.id ? "#fff" : "var(--ink)",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {b.rotulo}
          </button>
        ))}
      </div>

      {/* ==================== 1. MONITORIA DE QUALIDADE ==================== */}
      {subAba === "qualidade" && (
        <>
          <div className="f30-grid f30-grid-4">
            <div className="f30-card" style={{ borderTop: "4px solid #EA580C" }}>
              <div className="f30-kpi-label">MÉDIA GERAL DA MONITORIA</div>
              <div className="f30-kpi-value" style={{ color: "#EA580C" }}>{mediaMonitoria}<span>%</span></div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{monitoriasFiltradas.length} avaliações salvas</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid #EA580C" }}>
              <div className="f30-kpi-label">MONITORIAS DE MONITORES</div>
              <div className="f30-kpi-value" style={{ color: "#EA580C" }}>{totalMonitores}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Quantidade registrada</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid #EA580C" }}>
              <div className="f30-kpi-label">MONITORIAS DE SUPERVISORES</div>
              <div className="f30-kpi-value" style={{ color: "#EA580C" }}>{totalSupervisoresMon}</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Quantidade registrada</div>
            </div>
            <div className="f30-card" style={{ borderTop: "4px solid #EA580C" }}>
              <div className="f30-kpi-label">NOTA GERAL DA SUPERVISÃO</div>
              <div className="f30-kpi-value" style={{ color: "#EA580C" }}>{mediaSupervisao}<span>%</span></div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Consolidado real</div>
            </div>
          </div>

          <div className="f30-grid f30-grid-2">
            {/* Formulário para registrar monitoria real */}
            <form
              className="f30-card f30-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!formMon.supervisorUid && !formMon.colaboradorId) return;
                const nova = {
                  id: gerarId("mon"),
                  ...formMon,
                  quadrante: calcularQuadrante(formMon.notaMonitor),
                };
                salvarLista("monitorias", [nova, ...monitorias]);
                setFormMon({
                  colaboradorId: "",
                  supervisorUid: "",
                  notaMonitor: "",
                  notaSupervisao: "",
                  qtdMonitores: "",
                  qtdSupervisores: "",
                });
              }}
            >
              <div className="f30-secao-titulo">Registrar Monitoria de Qualidade</div>
              <div className="f30-grid f30-grid-2">
                <div>
                  <label>Supervisor(a) (cadastrado no banco)</label>
                  <select
                    value={formMon.supervisorUid}
                    onChange={(e) => setFormMon({ ...formMon, supervisorUid: e.target.value })}
                    required
                  >
                    <option value="">-- Selecione o(a) Supervisor(a) --</option>
                    {supervisoresCadastrados.map((s) => (
                      <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Colaborador(a) (cadastrado no banco)</label>
                  <select
                    value={formMon.colaboradorId}
                    onChange={(e) => setFormMon({ ...formMon, colaboradorId: e.target.value })}
                    required
                  >
                    <option value="">-- Selecione o(a) Colaborador(a) --</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="f30-grid f30-grid-4" style={{ marginTop: 8 }}>
                <div>
                  <label>Nota Monitor (%)</label>
                  <input
                    type="text"
                    value={formMon.notaMonitor}
                    onChange={(e) => setFormMon({ ...formMon, notaMonitor: e.target.value })}
                    placeholder="Ex: 95"
                    required
                  />
                </div>
                <div>
                  <label>Nota Supervisão (%)</label>
                  <input
                    type="text"
                    value={formMon.notaSupervisao}
                    onChange={(e) => setFormMon({ ...formMon, notaSupervisao: e.target.value })}
                    placeholder="Ex: 98"
                  />
                </div>
                <div>
                  <label>Qtd. (Monitores)</label>
                  <input
                    type="text"
                    value={formMon.qtdMonitores}
                    onChange={(e) => setFormMon({ ...formMon, qtdMonitores: e.target.value })}
                    placeholder="Ex: 1"
                  />
                </div>
                <div>
                  <label>Qtd. (Supervisão)</label>
                  <input
                    type="text"
                    value={formMon.qtdSupervisores}
                    onChange={(e) => setFormMon({ ...formMon, qtdSupervisores: e.target.value })}
                    placeholder="Ex: 1"
                  />
                </div>
              </div>
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">Salvar monitoria no banco</button>
              </div>
            </form>

            {/* Lista de monitorias salvas */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Monitorias Registradas ({monitoriasFiltradas.length})</div>
              {monitoriasFiltradas.length === 0 ? (
                <div className="f30-vazio">Nenhuma monitoria registrada ainda.</div>
              ) : (
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                        <th style={{ padding: 6 }}>Colaborador</th>
                        <th style={{ padding: 6 }}>Supervisor</th>
                        <th style={{ padding: 6 }}>Nota</th>
                        <th style={{ padding: 6 }}>Quadrante</th>
                        <th style={{ padding: 6 }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoriasFiltradas.map((m) => (
                        <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: 6, fontWeight: 700 }}>{nomeColaboradorPorId(m.colaboradorId)}</td>
                          <td style={{ padding: 6 }}>{nomeSupervisorPorUid(m.supervisorUid)}</td>
                          <td style={{ padding: 6 }} className="f30-mono">{m.notaMonitor}%</td>
                          <td style={{ padding: 6 }}><CorQuadrante q={m.quadrante || calcularQuadrante(m.notaMonitor)} /></td>
                          <td style={{ padding: 6 }}>
                            <button
                              type="button"
                              className="f30-btn secundario pequeno"
                              style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                              onClick={() => salvarLista("monitorias", monitorias.filter((x) => x.id !== m.id))}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ==================== 2. CONTROLES INTERNOS & N2 ==================== */}
      {subAba === "controles" && (
        <div className="f30-grid f30-grid-2">
          <form
            className="f30-card f30-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!formReor.controle.trim()) return;
              const nova = { id: gerarId("reor"), ...formReor };
              salvarLista("reorientacoes", [nova, ...reorientacoes]);
              setFormReor({
                colaboradorId: "",
                supervisorUid: "",
                controle: "",
                motivo: "",
                atrasoSLA: "",
                status: "",
                data: "",
              });
            }}
          >
            <div className="f30-secao-titulo">Registrar Reorientação / Controle Interno (N2)</div>
            <div className="f30-grid f30-grid-2">
              <div>
                <label>Supervisor(a)</label>
                <select
                  value={formReor.supervisorUid}
                  onChange={(e) => setFormReor({ ...formReor, supervisorUid: e.target.value })}
                  required
                >
                  <option value="">-- Selecione --</option>
                  {supervisoresCadastrados.map((s) => (
                    <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Colaborador(a)</label>
                <select
                  value={formReor.colaboradorId}
                  onChange={(e) => setFormReor({ ...formReor, colaboradorId: e.target.value })}
                  required
                >
                  <option value="">-- Selecione --</option>
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
              <div>
                <label>Controle / Ofensor (ex: Waiver, Invoice)</label>
                <input
                  type="text"
                  value={formReor.controle}
                  onChange={(e) => setFormReor({ ...formReor, controle: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Motivo</label>
                <input
                  type="text"
                  value={formReor.motivo}
                  onChange={(e) => setFormReor({ ...formReor, motivo: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="f30-grid f30-grid-3" style={{ marginTop: 8 }}>
              <div>
                <label>SLA / Atraso</label>
                <select
                  value={formReor.atrasoSLA}
                  onChange={(e) => setFormReor({ ...formReor, atrasoSLA: e.target.value })}
                >
                  <option value="">-- Selecione --</option>
                  <option value="No prazo">No prazo</option>
                  <option value="Fora do SLA">Fora do SLA</option>
                </select>
              </div>
              <div>
                <label>Status</label>
                <select
                  value={formReor.status}
                  onChange={(e) => setFormReor({ ...formReor, status: e.target.value })}
                >
                  <option value="">-- Selecione --</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Revertido">Revertido</option>
                </select>
              </div>
              <div>
                <label>Data</label>
                <input
                  type="date"
                  value={formReor.data}
                  onChange={(e) => setFormReor({ ...formReor, data: e.target.value })}
                />
              </div>
            </div>
            <div className="f30-form-actions">
              <button className="f30-btn pequeno" type="submit">Salvar reorientação</button>
            </div>
          </form>

          <div className="f30-card">
            <div className="f30-secao-titulo">Reorientações Registradas ({reorientacoesFiltradas.length})</div>
            {reorientacoesFiltradas.length === 0 ? (
              <div className="f30-vazio">Nenhuma reorientação registrada.</div>
            ) : (
              reorientacoesFiltradas.map((r) => (
                <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {nomeColaboradorPorId(r.colaboradorId)} · <span style={{ color: "#EA580C" }}>Sup: {nomeSupervisorPorUid(r.supervisorUid)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                      <b>{r.controle}:</b> {r.motivo} ({r.status || "—"} · {r.atrasoSLA || "—"})
                    </div>
                  </div>
                  <button
                    type="button"
                    className="f30-btn secundario pequeno"
                    style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                    onClick={() => salvarLista("reorientacoes", reorientacoes.filter((x) => x.id !== r.id))}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. ESCALA, FÉRIAS, BH & MEDIDAS DISCIPLINARES ==================== */}
      {subAba === "escala_disciplinar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="f30-grid f30-grid-2">
            <form
              className="f30-card f30-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!formEscala.supervisorUid) return;
                const nova = { id: gerarId("esc"), ...formEscala };
                salvarLista("escalasFerias", [nova, ...escalasFerias]);
                setFormEscala({ supervisorUid: "", escala: "", suporte: "", ferias: "", bancoHoras: "" });
              }}
            >
              <div className="f30-secao-titulo">Cadastrar Escala, Suporte, Férias & Banco de Horas</div>
              <label>Supervisor(a) (cadastrado no banco)</label>
              <select
                value={formEscala.supervisorUid}
                onChange={(e) => setFormEscala({ ...formEscala, supervisorUid: e.target.value })}
                required
              >
                <option value="">-- Selecione --</option>
                {supervisoresCadastrados.map((s) => (
                  <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                ))}
              </select>
              <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
                <div>
                  <label>Escala de Trabalho</label>
                  <input type="text" value={formEscala.escala} onChange={(e) => setFormEscala({ ...formEscala, escala: e.target.value })} placeholder="Ex: Seg a Sex (08h-17h)" />
                </div>
                <div>
                  <label>Horário de Suporte</label>
                  <input type="text" value={formEscala.suporte} onChange={(e) => setFormEscala({ ...formEscala, suporte: e.target.value })} placeholder="Ex: 09:00 às 13:00" />
                </div>
              </div>
              <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
                <div>
                  <label>Pretensão de Férias</label>
                  <input type="text" value={formEscala.ferias} onChange={(e) => setFormEscala({ ...formEscala, ferias: e.target.value })} placeholder="Ex: Janeiro/2027" />
                </div>
                <div>
                  <label>Saldo Banco de Horas</label>
                  <input type="text" value={formEscala.bancoHoras} onChange={(e) => setFormEscala({ ...formEscala, bancoHoras: e.target.value })} placeholder="Ex: +04h20" />
                </div>
              </div>
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">Salvar escala</button>
              </div>
            </form>

            <div className="f30-card">
              <div className="f30-secao-titulo">Escalas, Férias e Banco de Horas Salvos ({escalasFiltradas.length})</div>
              {escalasFiltradas.length === 0 ? (
                <div className="f30-vazio">Nenhuma escala registrada ainda.</div>
              ) : (
                escalasFiltradas.map((e) => (
                  <div key={e.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12.5 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5 }}>{nomeSupervisorPorUid(e.supervisorUid)}</div>
                      <div>Escala: {e.escala || "—"} · Suporte: {e.suporte || "—"}</div>
                      <div>Férias: {e.ferias || "—"} · Banco de Horas: <b>{e.bancoHoras || "00h00"}</b></div>
                    </div>
                    <button
                      type="button"
                      className="f30-btn secundario pequeno"
                      style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                      onClick={() => salvarLista("escalasFerias", escalasFerias.filter((x) => x.id !== e.id))}
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="f30-grid f30-grid-2">
            <form
              className="f30-card f30-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!formMedida.colaboradorId || !formMedida.tipo) return;
                const nova = { id: gerarId("med"), ...formMedida };
                salvarLista("medidasDisciplinares", [nova, ...medidasDisciplinares]);
                setFormMedida({ colaboradorId: "", supervisorUid: "", tipo: "", motivo: "", data: "", status: "" });
              }}
            >
              <div className="f30-secao-titulo">Registrar Medida Disciplinar</div>
              <div className="f30-grid f30-grid-2">
                <div>
                  <label>Supervisor(a)</label>
                  <select value={formMedida.supervisorUid} onChange={(e) => setFormMedida({ ...formMedida, supervisorUid: e.target.value })} required>
                    <option value="">-- Selecione --</option>
                    {supervisoresCadastrados.map((s) => (
                      <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Colaborador(a)</label>
                  <select value={formMedida.colaboradorId} onChange={(e) => setFormMedida({ ...formMedida, colaboradorId: e.target.value })} required>
                    <option value="">-- Selecione --</option>
                    {colaboradores.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="f30-grid f30-grid-3" style={{ marginTop: 8 }}>
                <div>
                  <label>Tipo de Medida</label>
                  <select value={formMedida.tipo} onChange={(e) => setFormMedida({ ...formMedida, tipo: e.target.value })} required>
                    <option value="">-- Selecione --</option>
                    <option value="Alinhamento Verbal">Alinhamento Verbal</option>
                    <option value="Advertência Escrita">Advertência Escrita</option>
                    <option value="Suspensão">Suspensão</option>
                  </select>
                </div>
                <div>
                  <label>Data</label>
                  <input type="date" value={formMedida.data} onChange={(e) => setFormMedida({ ...formMedida, data: e.target.value })} />
                </div>
                <div>
                  <label>Status</label>
                  <select value={formMedida.status} onChange={(e) => setFormMedida({ ...formMedida, status: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    <option value="Assinada">Assinada</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <label style={{ marginTop: 8 }}>Motivo</label>
              <input type="text" value={formMedida.motivo} onChange={(e) => setFormMedida({ ...formMedida, motivo: e.target.value })} required />
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">Salvar medida</button>
              </div>
            </form>

            <div className="f30-card">
              <div className="f30-secao-titulo">Medidas Disciplinares ({medidasFiltradas.length})</div>
              {medidasFiltradas.length === 0 ? (
                <div className="f30-vazio">Nenhuma medida disciplinar registrada.</div>
              ) : (
                medidasFiltradas.map((m) => (
                  <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12.5 }}>
                      <div style={{ fontWeight: 700 }}>{nomeColaboradorPorId(m.colaboradorId)} ({nomeSupervisorPorUid(m.supervisorUid)})</div>
                      <div><b>{m.tipo}:</b> {m.motivo} · {m.status || "—"}</div>
                    </div>
                    <button
                      type="button"
                      className="f30-btn secundario pequeno"
                      style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                      onClick={() => salvarLista("medidasDisciplinares", medidasDisciplinares.filter((x) => x.id !== m.id))}
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. TMO/TME, CHAMADOS, MELHORIAS & MATERIAIS ==================== */}
      {subAba === "indicadores_chamados" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="f30-grid f30-grid-2">
            <form
              className="f30-card f30-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!formChamado.codigo.trim()) return;
                const novo = { id: gerarId("chm"), ...formChamado };
                salvarLista("chamados", [novo, ...chamados]);
                setFormChamado({ codigo: "", fila: "", assunto: "", supervisorUid: "", volume: "", tmo: "", tme: "", status: "" });
              }}
            >
              <div className="f30-secao-titulo">Registrar Chamado / Indicador TMO & TME (Voz, Libra, Insígnia)</div>
              <div className="f30-grid f30-grid-3">
                <div>
                  <label>Código do Chamado</label>
                  <input type="text" value={formChamado.codigo} onChange={(e) => setFormChamado({ ...formChamado, codigo: e.target.value })} required />
                </div>
                <div>
                  <label>Canal / Fila</label>
                  <select value={formChamado.fila} onChange={(e) => setFormChamado({ ...formChamado, fila: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    <option value="Voz / N1">Voz / N1</option>
                    <option value="Libra (Acessibilidade)">Libra (Acessibilidade)</option>
                    <option value="Insígnia / VIP">Insígnia / VIP</option>
                    <option value="Backoffice / N2">Backoffice / N2</option>
                  </select>
                </div>
                <div>
                  <label>Supervisor(a)</label>
                  <select value={formChamado.supervisorUid} onChange={(e) => setFormChamado({ ...formChamado, supervisorUid: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    {supervisoresCadastrados.map((s) => (
                      <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="f30-grid f30-grid-3" style={{ marginTop: 8 }}>
                <div>
                  <label>Volume</label>
                  <input type="text" value={formChamado.volume} onChange={(e) => setFormChamado({ ...formChamado, volume: e.target.value })} />
                </div>
                <div>
                  <label>TMO (s)</label>
                  <input type="text" value={formChamado.tmo} onChange={(e) => setFormChamado({ ...formChamado, tmo: e.target.value })} />
                </div>
                <div>
                  <label>TME (s)</label>
                  <input type="text" value={formChamado.tme} onChange={(e) => setFormChamado({ ...formChamado, tme: e.target.value })} />
                </div>
              </div>
              <label style={{ marginTop: 8 }}>Assunto</label>
              <input type="text" value={formChamado.assunto} onChange={(e) => setFormChamado({ ...formChamado, assunto: e.target.value })} />
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">Salvar chamado</button>
              </div>
            </form>

            <div className="f30-card">
              <div className="f30-secao-titulo">Chamados e Filas Registrados ({chamadosFiltrados.length})</div>
              {chamadosFiltrados.length === 0 ? (
                <div className="f30-vazio">Nenhum chamado registrado ainda.</div>
              ) : (
                chamadosFiltrados.map((c) => (
                  <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12.5 }}>
                      <div style={{ fontWeight: 700 }}>{c.codigo} · {c.fila || "Geral"} ({nomeSupervisorPorUid(c.supervisorUid)})</div>
                      <div>{c.assunto} · Vol: {c.volume || 0} · TMO: {c.tmo || 0}s · TME: {c.tme || 0}s</div>
                    </div>
                    <button
                      type="button"
                      className="f30-btn secundario pequeno"
                      style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                      onClick={() => salvarLista("chamados", chamados.filter((x) => x.id !== c.id))}
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="f30-grid f30-grid-2">
            <form
              className="f30-card f30-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!formMaterial.titulo.trim()) return;
                const novo = { id: gerarId("mat"), ...formMaterial };
                salvarLista("materiais", [novo, ...materiais]);
                setFormMaterial({ titulo: "", tipo: "", data: "", link: "", responsavelUid: "" });
              }}
            >
              <div className="f30-secao-titulo">Cadastrar Material / Documento / Link Operacional</div>
              <label>Título do Material</label>
              <input type="text" value={formMaterial.titulo} onChange={(e) => setFormMaterial({ ...formMaterial, titulo: e.target.value })} required />
              <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
                <div>
                  <label>Tipo</label>
                  <input type="text" value={formMaterial.tipo} onChange={(e) => setFormMaterial({ ...formMaterial, tipo: e.target.value })} placeholder="Ex: PDF, Planilha, Link" />
                </div>
                <div>
                  <label>Link / URL</label>
                  <input type="text" value={formMaterial.link} onChange={(e) => setFormMaterial({ ...formMaterial, link: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="f30-form-actions">
                <button className="f30-btn pequeno" type="submit">Salvar material</button>
              </div>
            </form>

            <div className="f30-card">
              <div className="f30-secao-titulo">Materiais Criados & Processos de Melhoria</div>
              {materiais.length === 0 && melhorias.length === 0 ? (
                <div className="f30-vazio">Nenhum material ou melhoria cadastrado.</div>
              ) : (
                <>
                  {materiais.map((m) => (
                    <div key={m.id} style={{ padding: "8px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12.5 }}>
                        <b>{m.titulo}</b> ({m.tipo || "Documento"}) {m.link && <a href={m.link} target="_blank" rel="noreferrer" style={{ color: "#EA580C" }}>Abrir link</a>}
                      </div>
                      <button
                        type="button"
                        className="f30-btn secundario pequeno"
                        style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                        onClick={() => salvarLista("materiais", materiais.filter((x) => x.id !== m.id))}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  {melhorias.map((mel) => (
                    <div key={mel.id} style={{ padding: "8px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12.5 }}>
                        <b>Melhoria:</b> {mel.problema} — Resp: {mel.responsavel}
                      </div>
                      {onRemoverMelhoria && (
                        <button
                          type="button"
                          className="f30-btn secundario pequeno"
                          style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}
                          onClick={() => onRemoverMelhoria(mel.id)}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. CICLO DE GESTÃO, TREINAMENTO, DETRATORES & ABANDONO ==================== */}
      {subAba === "ciclo_detratores" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="f30-grid f30-grid-3">
            {/* Treinamentos */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Treinamentos em Atraso</div>
              <form
                className="f30-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formTreino.treinamento.trim()) return;
                  salvarLista("treinamentos", [{ id: gerarId("tr"), ...formTreino }, ...treinamentos]);
                  setFormTreino({ colaboradorId: "", supervisorUid: "", treinamento: "", prazo: "", status: "" });
                }}
              >
                <label>Supervisor(a)</label>
                <select value={formTreino.supervisorUid} onChange={(e) => setFormTreino({ ...formTreino, supervisorUid: e.target.value })}>
                  <option value="">-- Selecione --</option>
                  {supervisoresCadastrados.map((s) => (
                    <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                  ))}
                </select>
                <label>Colaborador(a)</label>
                <select value={formTreino.colaboradorId} onChange={(e) => setFormTreino({ ...formTreino, colaboradorId: e.target.value })}>
                  <option value="">-- Selecione --</option>
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <label>Treinamento</label>
                <input type="text" value={formTreino.treinamento} onChange={(e) => setFormTreino({ ...formTreino, treinamento: e.target.value })} required />
                <div className="f30-form-actions">
                  <button className="f30-btn pequeno" type="submit">Adicionar</button>
                </div>
              </form>
              <div style={{ marginTop: 12 }}>
                {treinamentosFiltrados.map((t) => (
                  <div key={t.id} style={{ padding: "6px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span><b>{nomeColaboradorPorId(t.colaboradorId)}:</b> {t.treinamento}</span>
                    <button type="button" className="f30-btn secundario pequeno" style={{ padding: "2px 6px", fontSize: 10, color: "var(--bad)" }} onClick={() => salvarLista("treinamentos", treinamentos.filter((x) => x.id !== t.id))}>Remover</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Detratores */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Detratores (Motivos & Pessoas)</div>
              <form
                className="f30-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formDetrator.motivo.trim()) return;
                  salvarLista("detratores", [{ id: gerarId("det"), ...formDetrator }, ...detratores]);
                  setFormDetrator({ colaboradorId: "", supervisorUid: "", notaNPS: "", motivo: "", ticket: "" });
                }}
              >
                <label>Supervisor(a)</label>
                <select value={formDetrator.supervisorUid} onChange={(e) => setFormDetrator({ ...formDetrator, supervisorUid: e.target.value })}>
                  <option value="">-- Selecione --</option>
                  {supervisoresCadastrados.map((s) => (
                    <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                  ))}
                </select>
                <label>Colaborador(a)</label>
                <select value={formDetrator.colaboradorId} onChange={(e) => setFormDetrator({ ...formDetrator, colaboradorId: e.target.value })}>
                  <option value="">-- Selecione --</option>
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <label>Motivo do Detrator / Nota</label>
                <input type="text" value={formDetrator.motivo} onChange={(e) => setFormDetrator({ ...formDetrator, motivo: e.target.value })} required />
                <div className="f30-form-actions">
                  <button className="f30-btn pequeno" type="submit">Adicionar</button>
                </div>
              </form>
              <div style={{ marginTop: 12 }}>
                {detratoresFiltrados.map((d) => (
                  <div key={d.id} style={{ padding: "6px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span><b>{nomeColaboradorPorId(d.colaboradorId)}:</b> {d.motivo}</span>
                    <button type="button" className="f30-btn secundario pequeno" style={{ padding: "2px 6px", fontSize: 10, color: "var(--bad)" }} onClick={() => salvarLista("detratores", detratores.filter((x) => x.id !== d.id))}>Remover</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Abandono de Tickets */}
            <div className="f30-card">
              <div className="f30-secao-titulo">Análise de Abandono de Tickets</div>
              <form
                className="f30-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formAbandono.fila.trim()) return;
                  salvarLista("abandonos", [{ id: gerarId("ab"), ...formAbandono }, ...abandonos]);
                  setFormAbandono({ fila: "", supervisorUid: "", recebidos: "", abandonados: "", tempoMedioAbandono: "", motivoPrincipal: "" });
                }}
              >
                <label>Supervisor(a)</label>
                <select value={formAbandono.supervisorUid} onChange={(e) => setFormAbandono({ ...formAbandono, supervisorUid: e.target.value })}>
                  <option value="">-- Selecione --</option>
                  {supervisoresCadastrados.map((s) => (
                    <option key={s.uid} value={s.uid}>{s.nome || s.email}</option>
                  ))}
                </select>
                <label>Fila / Canal</label>
                <input type="text" value={formAbandono.fila} onChange={(e) => setFormAbandono({ ...formAbandono, fila: e.target.value })} required />
                <label>Qtd. Abandonados / Motivo</label>
                <input type="text" value={formAbandono.motivoPrincipal} onChange={(e) => setFormAbandono({ ...formAbandono, motivoPrincipal: e.target.value })} required />
                <div className="f30-form-actions">
                  <button className="f30-btn pequeno" type="submit">Adicionar</button>
                </div>
              </form>
              <div style={{ marginTop: 12 }}>
                {abandonosFiltrados.map((a) => (
                  <div key={a.id} style={{ padding: "6px 0", borderBottom: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span><b>{a.fila}:</b> {a.motivoPrincipal}</span>
                    <button type="button" className="f30-btn secundario pequeno" style={{ padding: "2px 6px", fontSize: 10, color: "var(--bad)" }} onClick={() => salvarLista("abandonos", abandonos.filter((x) => x.id !== a.id))}>Remover</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
