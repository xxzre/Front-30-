import React, { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { useAuth } from "./context/AuthContext.jsx";
import PainelCoordenadora from "./components/PainelCoordenadora.jsx";

/* =========================================================================
   FRONT 30' — 100% conectado ao Banco de Dados em Tempo Real
   Sem dados fictícios pré-definidos e sem opções pré-selecionadas
   ========================================================================= */

const ROTINA_VAZIA = {
  hoje: [],
  semana: [],
  mes: [],
};

const MOTIVOS_ATRASO = [
  "Instabilidade na operadora de internet",
  "Falta de energia elétrica",
  "Problema no transporte público",
  "Imprevisto pessoal/familiar",
  "Problema de saúde",
  "Outro",
];

const ROTULOS_INDICADOR = {
  tmo: "TMO",
  fcr: "FCR",
  qualidade: "Qualidade",
  retrabalho: "Retrabalho",
};

const NOMES_BLOCO = { hoje: "Hoje", semana: "Esta semana", mes: "Este mês" };
const NOMES_STATUS_ITEM = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};
const PROX_STATUS = {
  nao_iniciado: "em_andamento",
  em_andamento: "concluido",
  concluido: "nao_iniciado",
};

/* ------------------------------- utilidades ------------------------------ */

function obterDataHojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterDataCabecalho() {
  const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = meses[agora.getMonth()];
  const ano = agora.getFullYear();
  return `SDU · ${dia} ${mes} ${ano}`;
}

function formatarData(iso) {
  if (!iso) return "—";
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano.slice(2)}`;
}

function diasAte(iso) {
  if (!iso) return 0;
  const hoje = new Date(obterDataHojeISO() + "T00:00:00");
  const alvo = new Date(iso + "T00:00:00");
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}

function gerarId(prefixo) {
  return `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function calcularIniciais(nome) {
  if (!nome || !nome.trim()) return "US";
  const partes = nome.trim().split(/\s+/);
  return partes.length >= 2
    ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    : nome.trim().slice(0, 2).toUpperCase();
}

/* ---------------- Persistência Local + Nuvem (Anti-Reversão no F5) ---------------- */

const CHAVE_STORAGE_REAL = "f30_estado_limpo_v4";

function lerEstadoLocal() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_REAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {
    console.warn("Aviso ao ler estado local:", e);
  }
  return null;
}

function gravarEstadoLocal(parcial) {
  try {
    const atual = lerEstadoLocal() || {
      colaboradoresExtras: [],
      idsExcluidos: [],
      itensRotina: ROTINA_VAZIA,
      melhorias: [],
      reconhecimentos: [],
      agenda: [],
      evolucoes: [],
      feedbacks: [],
      checklists: [],
      dadosCoordenacao: {},
      atualizadoEm: 0,
    };
    const novo = {
      ...atual,
      ...parcial,
      atualizadoEm: parcial.atualizadoEm ?? Date.now(),
    };
    localStorage.setItem(CHAVE_STORAGE_REAL, JSON.stringify(novo));
    return novo;
  } catch (e) {
    console.warn("Aviso ao gravar estado local:", e);
    return null;
  }
}

/* --------------------------------- ícones -------------------------------- */

const ICONES_NAV = {
  inicio: <path d="M3 10.5 L12 4 L21 10.5 M5.5 9 V19 H18.5 V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  coordenacao: <path d="M4 19h16M6 16V9m6 7V5m6 11v-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  time: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M13 19c.5-2.6 2.3-4.4 4.5-4.9M16 14.1c2 .4 3.5 2.1 4 4.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  rotina: <path d="M12 7v5l3.2 1.9M21 12a9 9 0 1 1-9-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  melhorias: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  agenda: <path d="M4 5.5h16v15H4v-15Zm0 4.5h16M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  feedback: <path d="M4 5h16v10H8l-4 4V5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  checklist: <path d="M5 4.5h14v15H5v-15Zm3.2 5 1.6 1.6 3-3.2M8.2 14.8l1.6 1.6 3-3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  perfil: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
};

/* ============================== COMPONENTES ============================== */

function KpiCard({ rotulo, valor, unidade }) {
  return (
    <div className="f30-card f30-kpi">
      <div className="f30-kpi-top">
        <span className="f30-kpi-label">{rotulo}</span>
      </div>
      <div className="f30-kpi-value">
        {valor}
        <span>{unidade}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
        Calculado em tempo real pelos cadastros do banco
      </div>
    </div>
  );
}

function TelaInicio({ colaboradores, melhorias, reconhecimentos }) {
  const acoesEmAndamento = melhorias.filter((m) => m.status === "em_andamento");
  const acoesNoPrazo = acoesEmAndamento.filter((m) => diasAte(m.prazo) >= 0).length;
  const colaboradoresAcompanhamento = colaboradores.filter((c) => c.emAcompanhamento).length;
  const reconhecimentosSemana = reconhecimentos.filter((r) => diasAte(r.data) >= -7).length;

  // Calcula a média real dos colaboradores visíveis (0 se não houver colaboradores cadastrados)
  const medias = useMemo(() => {
    if (!colaboradores.length) {
      return { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 };
    }
    const soma = colaboradores.reduce(
      (acc, c) => ({
        tmo: acc.tmo + (Number(c.indicadores?.tmo) || 0),
        fcr: acc.fcr + (Number(c.indicadores?.fcr) || 0),
        qualidade: acc.qualidade + (Number(c.indicadores?.qualidade) || 0),
        retrabalho: acc.retrabalho + (Number(c.indicadores?.retrabalho) || 0),
      }),
      { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 }
    );
    return {
      tmo: Math.round(soma.tmo / colaboradores.length),
      fcr: Math.round(soma.fcr / colaboradores.length),
      qualidade: Math.round(soma.qualidade / colaboradores.length),
      retrabalho: Math.round(soma.retrabalho / colaboradores.length),
    };
  }, [colaboradores]);

  return (
    <>
      <div className="f30-secao">
        <div className="f30-grid f30-grid-4">
          <KpiCard rotulo="TMO" valor={medias.tmo} unidade="s" />
          <KpiCard rotulo="FCR" valor={medias.fcr} unidade="%" />
          <KpiCard rotulo="Qualidade" valor={medias.qualidade} unidade="%" />
          <KpiCard rotulo="Retrabalho" valor={medias.retrabalho} unidade="%" />
        </div>
      </div>

      <div className="f30-secao">
        <div className="f30-grid f30-grid-3">
          <div className="f30-card f30-mini">
            <div className="f30-mini-num">
              {acoesNoPrazo} <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>de</span> {acoesEmAndamento.length}
            </div>
            <div className="f30-mini-label">ações de melhoria em andamento no prazo</div>
          </div>
          <div className="f30-card f30-mini">
            <div className="f30-mini-num">{colaboradoresAcompanhamento}</div>
            <div className="f30-mini-label">colaboradores cadastrados em acompanhamento</div>
          </div>
          <div className="f30-card f30-mini">
            <div className="f30-mini-num">{reconhecimentosSemana}</div>
            <div className="f30-mini-label">reconhecimentos registrados na semana</div>
          </div>
        </div>
      </div>

      {colaboradores.length === 0 && (
        <div className="f30-vazio" style={{ marginTop: 12 }}>
          Nenhum colaborador cadastrado ainda nesta equipe. Os indicadores serão calculados automaticamente assim que os usuários se cadastrarem no banco de dados ou forem adicionados na aba Meu Time.
        </div>
      )}
    </>
  );
}

function CardColaborador({ colaborador, onAbrir, onRemover }) {
  return (
    <div className="f30-colab-card" onClick={() => onAbrir(colaborador)}>
      <div className="f30-colab-avatar">{colaborador.iniciais || calcularIniciais(colaborador.nome)}</div>
      <div className="f30-colab-body">
        <div className="f30-colab-top">
          <div>
            <div className="f30-colab-nome">{colaborador.nome}</div>
            <div className="f30-colab-cargo">
              {colaborador.cargo || "Colaborador(a)"}
              {colaborador.supervisorNome && (
                <>
                  {" · "}
                  <span style={{ color: "#EA580C", fontWeight: 700 }}>
                    Sup: {colaborador.supervisorNome}
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {colaborador.emAcompanhamento && <span className="f30-badge-acomp">ACOMPANHAMENTO</span>}
            {onRemover && (
              <button
                type="button"
                className="f30-btn secundario pequeno"
                style={{ padding: "4px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                title="Remover colaborador permanentemente"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(colaborador.id, colaborador.nome, colaborador.uid);
                }}
              >
                Remover
              </button>
            )}
          </div>
        </div>

        <div className="f30-colab-linha">
          {Object.entries(colaborador.indicadores || { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 }).map(([tipo, valor]) => (
            <div className="f30-colab-mini-ind" key={tipo}>
              {ROTULOS_INDICADOR[tipo]}
              <b>{valor}{tipo === "tmo" ? "s" : "%"}</b>
            </div>
          ))}
          <div className="f30-colab-mini-ind">
            Reconhecimentos
            <b>{colaborador.reconhecimentos || 0}</b>
          </div>
        </div>

        {colaborador.focoDesenvolvimento && (
          <div className="f30-colab-foco">
            <b>Foco atual:</b> {colaborador.focoDesenvolvimento}
          </div>
        )}

        {colaborador.ultimaConversa?.proximoPasso && (
          <div className="f30-colab-footer">
            <span>Último combinado: {colaborador.ultimaConversa.proximoPasso}</span>
            <span className="f30-mono">{formatarData(colaborador.ultimaConversa.prazo)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PainelColaborador({ colaborador, feedbacks, checklists, reconhecimentos, onFechar, onRemover }) {
  const feedbacksDele = feedbacks.filter((f) => f.colaboradorId === colaborador.id);
  const atrasosDele = checklists.filter((c) => c.colaboradorId === colaborador.id);
  const reconhecimentosDele = reconhecimentos.filter((r) => r.colaboradorId === colaborador.id);

  return (
    <div className="f30-overlay" onClick={onFechar}>
      <div className="f30-painel" onClick={(e) => e.stopPropagation()}>
        <div className="f30-painel-header">
          <div>
            <div className="f30-colab-nome" style={{ fontSize: 19 }}>{colaborador.nome}</div>
            <div className="f30-colab-cargo">
              {colaborador.cargo || "Colaborador(a)"}
              {colaborador.supervisorNome ? ` · Supervisor(a): ${colaborador.supervisorNome}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onRemover && (
              <button
                type="button"
                className="f30-btn secundario pequeno"
                style={{ color: "var(--bad)", borderColor: "var(--bad)" }}
                onClick={() => {
                  onRemover(colaborador.id, colaborador.nome, colaborador.uid);
                  onFechar();
                }}
              >
                Remover colaborador
              </button>
            )}
            <button className="f30-painel-fechar" onClick={onFechar}>×</button>
          </div>
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Indicadores individuais</div>
          <div className="f30-grid f30-grid-4">
            {Object.entries(colaborador.indicadores || { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 }).map(([tipo, valor]) => (
              <div className="f30-card" key={tipo} style={{ padding: 12 }}>
                <div className="f30-kpi-label">{ROTULOS_INDICADOR[tipo]}</div>
                <div className="f30-kpi-value" style={{ fontSize: 22 }}>{valor}<span>{tipo === "tmo" ? "s" : "%"}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Pontos fortes e foco</div>
          <div className="f30-card">
            <div className="f30-mel-field"><label>Pontos fortes</label><p>{colaborador.pontosFortes?.length ? colaborador.pontosFortes.join(" · ") : "—"}</p></div>
            <div className="f30-mel-field" style={{ marginTop: 10 }}><label>Foco de desenvolvimento</label><p>{colaborador.focoDesenvolvimento || "—"}</p></div>
          </div>
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Histórico de feedbacks ({feedbacksDele.length})</div>
          {feedbacksDele.length ? feedbacksDele.map((f) => (
            <div className="f30-feed-item" key={f.id}>
              <div className="f30-feed-meta">{f.autor} · {formatarData(f.data)}</div>
              <div className="f30-feed-texto">{f.texto}</div>
              {f.resposta && (
                <div className="f30-feed-resposta">
                  <div className="f30-feed-resposta-meta">{f.resposta.autor} respondeu · {formatarData(f.resposta.data)}</div>
                  <div style={{ fontSize: 13 }}>{f.resposta.texto}</div>
                </div>
              )}
            </div>
          )) : <div className="f30-vazio">Nenhum feedback registrado ainda.</div>}
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Checklist de atraso ({atrasosDele.length})</div>
          {atrasosDele.length ? atrasosDele.map((c) => (
            <div className="f30-atraso-item" key={c.id}>
              <div className="f30-agenda-data">{formatarData(c.data)}</div>
              <div>
                <div className="f30-atraso-motivos">{c.motivos.map((m) => <span className="f30-motivo-chip" key={m}>{m}</span>)}</div>
                {c.observacao && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{c.observacao}</div>}
              </div>
            </div>
          )) : <div className="f30-vazio">Nenhum atraso registrado.</div>}
        </div>
      </div>
    </div>
  );
}

function FormColaborador({ onSalvar, onCancelar, supervisoresCadastrados }) {
  // Todos os campos iniciam vazios ("") sem valores pré-definidos ou pré-selecionados
  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    supervisorUid: "",
    pontosFortes: "",
    focoDesenvolvimento: "",
    tmo: "",
    fcr: "",
    qualidade: "",
    retrabalho: "",
    emAcompanhamento: false,
    proximoPasso: "",
    prazo: "",
  });

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function enviar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    const sup = supervisoresCadastrados.find((s) => s.uid === form.supervisorUid);

    const novo = {
      id: gerarId("c"),
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      supervisorUid: form.supervisorUid,
      supervisorNome: sup ? sup.nome || sup.email : "",
      iniciais: calcularIniciais(form.nome),
      pontosFortes: form.pontosFortes
        ? form.pontosFortes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      focoDesenvolvimento: form.focoDesenvolvimento.trim(),
      indicadores: {
        tmo: Number(form.tmo) || 0,
        fcr: Number(form.fcr) || 0,
        qualidade: Number(form.qualidade) || 0,
        retrabalho: Number(form.retrabalho) || 0,
      },
      reconhecimentos: 0,
      emAcompanhamento: Boolean(form.emAcompanhamento),
      ultimaConversa: {
        data: obterDataHojeISO(),
        resumo: "",
        proximoPasso: form.proximoPasso.trim(),
        prazo: form.prazo,
      },
    };
    onSalvar(novo);
  }

  return (
    <form className="f30-card f30-form" style={{ marginBottom: 18 }} onSubmit={enviar}>
      <div className="f30-secao-titulo">Adicionar colaborador ao banco</div>
      <div className="f30-grid f30-grid-3">
        <div>
          <label>Nome completo</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Digite o nome"
            required
          />
        </div>
        <div>
          <label>Cargo / Função</label>
          <input
            type="text"
            value={form.cargo}
            onChange={(e) => atualizar("cargo", e.target.value)}
            placeholder="Digite o cargo"
          />
        </div>
        <div>
          <label>Supervisor(a) Responsável (cadastrado no banco)</label>
          <select
            value={form.supervisorUid}
            onChange={(e) => atualizar("supervisorUid", e.target.value)}
          >
            <option value="">
              {supervisoresCadastrados.length > 0
                ? "-- Selecione o(a) Supervisor(a) --"
                : "-- Nenhum Supervisor cadastrado no banco --"}
            </option>
            {supervisoresCadastrados.map((sup) => (
              <option key={sup.uid} value={sup.uid}>
                {sup.nome || sup.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="f30-grid f30-grid-2">
        <div>
          <label>Pontos fortes (separados por vírgula)</label>
          <input
            type="text"
            value={form.pontosFortes}
            onChange={(e) => atualizar("pontosFortes", e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label>Foco de desenvolvimento</label>
          <input
            type="text"
            value={form.focoDesenvolvimento}
            onChange={(e) => atualizar("focoDesenvolvimento", e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="f30-grid f30-grid-4" style={{ marginTop: 8 }}>
        <div>
          <label>TMO (s)</label>
          <input type="text" value={form.tmo} onChange={(e) => atualizar("tmo", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label>FCR (%)</label>
          <input type="text" value={form.fcr} onChange={(e) => atualizar("fcr", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label>Qualidade (%)</label>
          <input type="text" value={form.qualidade} onChange={(e) => atualizar("qualidade", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label>Retrabalho (%)</label>
          <input type="text" value={form.retrabalho} onChange={(e) => atualizar("retrabalho", e.target.value)} placeholder="0" />
        </div>
      </div>

      <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
        <div>
          <label>Próximo passo combinado</label>
          <input
            type="text"
            value={form.proximoPasso}
            onChange={(e) => atualizar("proximoPasso", e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label>Prazo do combinado</label>
          <input
            type="date"
            value={form.prazo}
            onChange={(e) => atualizar("prazo", e.target.value)}
          />
        </div>
      </div>

      <div className="f30-checkbox-row" style={{ marginTop: 10 }}>
        <input
          type="checkbox"
          checked={form.emAcompanhamento}
          onChange={(e) => atualizar("emAcompanhamento", e.target.checked)}
        />
        Marcar colaborador como "Em acompanhamento"
      </div>

      <div className="f30-form-actions">
        <button className="f30-btn" type="submit">Salvar colaborador</button>
        <button className="f30-btn secundario" type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

function TelaTime({
  colaboradores,
  feedbacks,
  checklists,
  reconhecimentos,
  onAdicionarColaborador,
  onRemoverColaborador,
  supervisoresCadastrados,
}) {
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Integrantes cadastrados no banco de dados ({colaboradores.length} colaboradores).
        </div>
        <button className="f30-btn" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Fechar formulário" : "+ Adicionar colaborador"}
        </button>
      </div>

      {mostrarForm && (
        <FormColaborador
          supervisoresCadastrados={supervisoresCadastrados}
          onCancelar={() => setMostrarForm(false)}
          onSalvar={(novo) => {
            onAdicionarColaborador(novo);
            setMostrarForm(false);
          }}
        />
      )}

      {colaboradores.length === 0 ? (
        <div className="f30-vazio">
          Nenhum colaborador vinculado no momento. Quando um colaborador criar conta selecionando você como Supervisor(a) — ou quando você clicar em "+ Adicionar colaborador" — ele aparecerá aqui em tempo real.
        </div>
      ) : (
        <div className="f30-grid f30-grid-2">
          {colaboradores.map((c) => (
            <CardColaborador
              key={c.id}
              colaborador={c}
              onAbrir={setSelecionado}
              onRemover={onRemoverColaborador}
            />
          ))}
        </div>
      )}

      {selecionado && (
        <PainelColaborador
          colaborador={selecionado}
          feedbacks={feedbacks}
          checklists={checklists}
          reconhecimentos={reconhecimentos}
          onFechar={() => setSelecionado(null)}
          onRemover={onRemoverColaborador}
        />
      )}
    </>
  );
}

function TelaRotina({ itens, onAlternarStatus, onAdicionarItemRotina, onRemoverItemRotina }) {
  const [blocoEscolhido, setBlocoEscolhido] = useState("");
  const [textoNovo, setTextoNovo] = useState("");

  function criar(e) {
    e.preventDefault();
    if (!blocoEscolhido || !textoNovo.trim()) return;
    onAdicionarItemRotina(blocoEscolhido, textoNovo.trim());
    setTextoNovo("");
  }

  return (
    <>
      <form className="f30-card f30-form" style={{ marginBottom: 18 }} onSubmit={criar}>
        <div className="f30-secao-titulo">Adicionar item à sua rotina</div>
        <div className="f30-grid f30-grid-3">
          <div>
            <label>Período</label>
            <select value={blocoEscolhido} onChange={(e) => setBlocoEscolhido(e.target.value)} required>
              <option value="">-- Selecione o período --</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mês</option>
            </select>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label>Atividade da rotina</label>
            <input
              type="text"
              value={textoNovo}
              onChange={(e) => setTextoNovo(e.target.value)}
              placeholder="Digite a atividade que deseja acompanhar"
              required
            />
          </div>
        </div>
        <div className="f30-form-actions">
          <button className="f30-btn pequeno" type="submit">+ Adicionar atividade</button>
        </div>
      </form>

      <div className="f30-grid f30-grid-3">
        {["hoje", "semana", "mes"].map((bloco) => {
          const lista = Array.isArray(itens?.[bloco]) ? itens[bloco] : [];
          return (
            <div className="f30-rotina-bloco" key={bloco}>
              <h3>{NOMES_BLOCO[bloco]} ({lista.length})</h3>
              {lista.length === 0 ? (
                <div className="f30-vazio" style={{ padding: 14 }}>Nenhuma atividade cadastrada.</div>
              ) : (
                lista.map((item) => (
                  <div className="f30-rotina-item" key={item.id}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }}
                      onClick={() => onAlternarStatus(bloco, item.id)}
                    >
                      <div className={`f30-status-dot ${item.status}`} />
                      <div className={`f30-rotina-texto ${item.status === "concluido" ? "concluido" : ""}`}>{item.texto}</div>
                    </div>
                    <div className="f30-rotina-tag" onClick={() => onAlternarStatus(bloco, item.id)} style={{ cursor: "pointer" }}>
                      {NOMES_STATUS_ITEM[item.status]}
                    </div>
                    {onRemoverItemRotina && (
                      <button
                        type="button"
                        className="f30-btn secundario pequeno"
                        style={{ padding: "2px 6px", fontSize: 10, color: "var(--bad)", marginLeft: 4 }}
                        onClick={() => onRemoverItemRotina(bloco, item.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function FormMelhoria({ colaboradores, onSalvar, onCancelar }) {
  // Nenhuma pessoa pré-selecionada!
  const [form, setForm] = useState({
    problema: "",
    causa: "",
    acao: "",
    responsavel: "",
    prazo: "",
  });

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function enviar(e) {
    e.preventDefault();
    if (!form.problema.trim() || !form.acao.trim() || !form.responsavel) return;
    onSalvar(form);
  }

  return (
    <form className="f30-card f30-form" style={{ marginBottom: 18 }} onSubmit={enviar}>
      <div className="f30-secao-titulo">Novo registro de melhoria</div>
      <label>Problema</label>
      <input type="text" value={form.problema} onChange={(e) => atualizar("problema", e.target.value)} placeholder="Qual gargalo foi identificado?" required />
      <label>Causa</label>
      <input type="text" value={form.causa} onChange={(e) => atualizar("causa", e.target.value)} placeholder="Por que isso acontece?" />
      <label>Ação</label>
      <input type="text" value={form.acao} onChange={(e) => atualizar("acao", e.target.value)} placeholder="O que será feito?" required />
      <label>Responsável (cadastrado no banco)</label>
      <select value={form.responsavel} onChange={(e) => atualizar("responsavel", e.target.value)} required>
        <option value="">-- Selecione um responsável cadastrado --</option>
        {colaboradores.map((c) => (
          <option key={c.id} value={c.nome}>{c.nome}</option>
        ))}
      </select>
      <label>Prazo</label>
      <input type="date" value={form.prazo} onChange={(e) => atualizar("prazo", e.target.value)} />
      <div className="f30-form-actions">
        <button className="f30-btn" type="submit">Salvar registro</button>
        <button className="f30-btn secundario" type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

function TelaMelhorias({ melhorias, colaboradores, onAdicionar, onConcluir, onRemover }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [resultados, setResultados] = useState({});

  function salvarConclusao(id) {
    const r = resultados[id];
    if (!r || !r.resultado) return;
    onConcluir(id, r.resultado, r.aprendizado || "");
    setResultados({ ...resultados, [id]: undefined });
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Base 5S — registro contínuo de gargalos e melhorias do time.</div>
        <button className="f30-btn" onClick={() => setMostrarForm(!mostrarForm)}>{mostrarForm ? "Fechar formulário" : "+ Novo registro"}</button>
      </div>

      {mostrarForm && (
        <FormMelhoria colaboradores={colaboradores} onCancelar={() => setMostrarForm(false)} onSalvar={(form) => { onAdicionar(form); setMostrarForm(false); }} />
      )}

      {melhorias.length === 0 ? (
        <div className="f30-vazio">Nenhum registro de melhoria cadastrado.</div>
      ) : (
        melhorias.map((m) => (
          <div className="f30-mel-card" key={m.id} style={{ marginBottom: 14 }}>
            <div className="f30-mel-top">
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{m.problema}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`f30-mel-status ${m.status}`}>{m.status === "concluida" ? "CONCLUÍDA" : "EM ANDAMENTO"}</span>
                {onRemover && (
                  <button
                    type="button"
                    className="f30-btn secundario pequeno"
                    style={{ padding: "4px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                    onClick={() => onRemover(m.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
            <div className="f30-mel-grid">
              <div className="f30-mel-field"><label>Causa</label><p>{m.causa || "—"}</p></div>
              <div className="f30-mel-field"><label>Ação</label><p>{m.acao}</p></div>
              <div className="f30-mel-field"><label>Responsável</label><p>{m.responsavel}</p></div>
              <div className="f30-mel-field"><label>Prazo</label><p className="f30-mono">{formatarData(m.prazo)}</p></div>
              <div className="f30-mel-field"><label>Resultado</label><p>{m.resultado || "—"}</p></div>
              <div className="f30-mel-field"><label>Aprendizado</label><p>{m.aprendizado || "—"}</p></div>
            </div>

            {m.status !== "concluida" && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>Registrar resultado e concluir</label>
                <input
                  type="text" placeholder="Resultado observado"
                  style={{ width: "100%", marginTop: 6, padding: "8px 10px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 13.5 }}
                  value={resultados[m.id]?.resultado || ""}
                  onChange={(e) => setResultados({ ...resultados, [m.id]: { ...resultados[m.id], resultado: e.target.value } })}
                />
                <input
                  type="text" placeholder="Aprendizado (opcional)"
                  style={{ width: "100%", marginTop: 8, padding: "8px 10px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 13.5 }}
                  value={resultados[m.id]?.aprendizado || ""}
                  onChange={(e) => setResultados({ ...resultados, [m.id]: { ...resultados[m.id], aprendizado: e.target.value } })}
                />
                <button className="f30-btn pequeno" style={{ marginTop: 10 }} onClick={() => salvarConclusao(m.id)}>Marcar como concluída</button>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}

function TelaAgenda({ agenda, evolucoes, onEnviarEvolucao, onAdicionarCompromisso, onRemoverCompromisso, onRemoverEvolucao }) {
  const [texto, setTexto] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [mostrarFormAgenda, setMostrarFormAgenda] = useState(false);
  const [novoCompromisso, setNovoCompromisso] = useState({ titulo: "", data: "", hora: "" });

  const agendaOrdenada = [...agenda].sort((a, b) => new Date(a.data) - new Date(b.data));

  function enviar() {
    if (!texto.trim() || !periodo) return;
    onEnviarEvolucao(texto, periodo);
    setTexto("");
    setPeriodo("");
  }

  function salvarCompromisso(e) {
    e.preventDefault();
    if (!novoCompromisso.titulo.trim() || !novoCompromisso.data) return;
    onAdicionarCompromisso(novoCompromisso);
    setNovoCompromisso({ titulo: "", data: "", hora: "" });
    setMostrarFormAgenda(false);
  }

  return (
    <div className="f30-grid f30-grid-2">
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="f30-secao-titulo" style={{ margin: 0 }}>Próximos compromissos</div>
          {onAdicionarCompromisso && (
            <button className="f30-btn pequeno" onClick={() => setMostrarFormAgenda(!mostrarFormAgenda)}>
              {mostrarFormAgenda ? "Fechar" : "+ Agendar"}
            </button>
          )}
        </div>

        {mostrarFormAgenda && (
          <form className="f30-card f30-form" style={{ marginBottom: 14 }} onSubmit={salvarCompromisso}>
            <label>Título do compromisso</label>
            <input
              type="text"
              value={novoCompromisso.titulo}
              onChange={(e) => setNovoCompromisso({ ...novoCompromisso, titulo: e.target.value })}
              placeholder="Digite o título do compromisso"
              required
            />
            <div className="f30-grid f30-grid-2">
              <div>
                <label>Data</label>
                <input
                  type="date"
                  value={novoCompromisso.data}
                  onChange={(e) => setNovoCompromisso({ ...novoCompromisso, data: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Hora</label>
                <input
                  type="text"
                  value={novoCompromisso.hora}
                  onChange={(e) => setNovoCompromisso({ ...novoCompromisso, hora: e.target.value })}
                  placeholder="Ex: 09:00"
                />
              </div>
            </div>
            <div className="f30-form-actions">
              <button className="f30-btn pequeno" type="submit">Salvar</button>
            </div>
          </form>
        )}

        <div className="f30-card" style={{ padding: "6px 20px" }}>
          {agendaOrdenada.length ? agendaOrdenada.map((a) => (
            <div className="f30-agenda-item" key={a.id}>
              <div className="f30-agenda-data">{formatarData(a.data)}</div>
              <div className="f30-agenda-titulo">{a.titulo}</div>
              <div className="f30-agenda-hora">{a.hora}</div>
              {onRemoverCompromisso && (
                <button
                  type="button"
                  className="f30-btn secundario pequeno"
                  style={{ padding: "4px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)", marginLeft: 6 }}
                  onClick={() => onRemoverCompromisso(a.id)}
                >
                  Remover
                </button>
              )}
            </div>
          )) : <div className="f30-vazio">Nenhum compromisso agendado.</div>}
        </div>
      </div>

      <div>
        <div className="f30-secao-titulo">Enviar evolução para a coordenação</div>
        <div className="f30-card f30-form">
          <label>Período de referência</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="">-- Selecione o período --</option>
            <option value="esta_semana">Esta semana</option>
            <option value="este_mes">Este mês</option>
          </select>
          <label>O que você quer contar sobre a evolução do time?</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sobre indicadores, ações e destaques do período..." />
          <div className="f30-form-actions">
            <button className="f30-btn" onClick={enviar}>Enviar atualização</button>
          </div>
        </div>

        <div className="f30-secao-titulo" style={{ marginTop: 22 }}>Histórico enviado</div>
        {evolucoes.length ? [...evolucoes].reverse().map((e) => (
          <div className="f30-card" key={e.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div className="f30-feed-meta" style={{ margin: 0 }}>{e.periodo === "esta_semana" ? "Esta semana" : "Este mês"} · {formatarData(e.data)} · {e.autor || ""}</div>
              {onRemoverEvolucao && (
                <button
                  type="button"
                  className="f30-btn secundario pequeno"
                  style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                  onClick={() => onRemoverEvolucao(e.id)}
                >
                  Remover
                </button>
              )}
            </div>
            <div style={{ fontSize: 13.5 }}>{e.texto}</div>
          </div>
        )) : <div className="f30-vazio">Nenhuma evolução enviada ainda.</div>}
      </div>
    </div>
  );
}

function TelaFeedback({ colaboradores, feedbacks, onEnviarFeedback, onResponder, onRemoverFeedback, papel, colaboradorLogadoId }) {
  // Nenhuma opção pré-selecionada ("")
  const [colaboradorId, setColaboradorId] = useState("");
  const [texto, setTexto] = useState("");
  const [respostas, setRespostas] = useState({});

  const temAcessoGestao = papel === "gestor" || papel === "coordenador";
  const feedbacksExibidos = useMemo(() => {
    if (!temAcessoGestao) {
      return feedbacks.filter((f) => f.colaboradorId === colaboradorLogadoId);
    }
    if (!colaboradorId) return feedbacks;
    return feedbacks.filter((f) => f.colaboradorId === colaboradorId);
  }, [feedbacks, temAcessoGestao, colaboradorId, colaboradorLogadoId]);

  function enviar() {
    if (!colaboradorId || !texto.trim()) return;
    onEnviarFeedback(colaboradorId, texto);
    setTexto("");
  }

  function enviarResposta(feedbackId) {
    const r = respostas[feedbackId];
    if (!r || !r.trim()) return;
    onResponder(feedbackId, r);
    setRespostas({ ...respostas, [feedbackId]: "" });
  }

  return (
    <div className="f30-grid f30-grid-2">
      {temAcessoGestao && (
        <div>
          <div className="f30-secao-titulo">Novo feedback</div>
          <div className="f30-card f30-form">
            <label>Colaborador (cadastrado no banco)</label>
            <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
              <option value="">-- Selecione o(a) Colaborador(a) --</option>
              {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <label>Feedback</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva o feedback..." />
            <div className="f30-form-actions">
              <button className="f30-btn" onClick={enviar}>Enviar feedback</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="f30-secao-titulo">
          {temAcessoGestao
            ? colaboradorId
              ? `Feedbacks — ${colaboradores.find((c) => c.id === colaboradorId)?.nome || ""}`
              : "Todos os feedbacks da equipe"
            : "Meus feedbacks"}
        </div>
        {feedbacksExibidos.length ? [...feedbacksExibidos].reverse().map((f) => (
          <div className="f30-feed-item" key={f.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div className="f30-feed-meta" style={{ margin: 0 }}>
                {f.autor} → <b>{colaboradores.find((c) => c.id === f.colaboradorId)?.nome || ""}</b> · {formatarData(f.data)}
              </div>
              {temAcessoGestao && onRemoverFeedback && (
                <button
                  type="button"
                  className="f30-btn secundario pequeno"
                  style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                  onClick={() => onRemoverFeedback(f.id)}
                >
                  Remover
                </button>
              )}
            </div>
            <div className="f30-feed-texto">{f.texto}</div>
            {f.resposta ? (
              <div className="f30-feed-resposta">
                <div className="f30-feed-resposta-meta">{f.resposta.autor} respondeu · {formatarData(f.resposta.data)}</div>
                <div style={{ fontSize: 13 }}>{f.resposta.texto}</div>
              </div>
            ) : papel === "colaborador" ? (
              <div style={{ marginTop: 10 }}>
                <textarea
                  placeholder="Responder a este feedback..."
                  style={{ width: "100%", minHeight: 56 }}
                  value={respostas[f.id] || ""}
                  onChange={(e) => setRespostas({ ...respostas, [f.id]: e.target.value })}
                />
                <button className="f30-btn pequeno" style={{ marginTop: 8 }} onClick={() => enviarResposta(f.id)}>Enviar resposta</button>
              </div>
            ) : (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-soft)" }}>Aguardando resposta do colaborador.</div>
            )}
          </div>
        )) : <div className="f30-vazio">Nenhum feedback registrado ainda.</div>}
      </div>
    </div>
  );
}

function TelaChecklistAtraso({ colaboradores, checklists, onRegistrar, onRemoverAtraso }) {
  // Sem colaborador pré-selecionado ("")
  const [colaboradorId, setColaboradorId] = useState("");
  const [data, setData] = useState("");
  const [motivos, setMotivos] = useState([]);
  const [observacao, setObservacao] = useState("");
  const [filtroColaborador, setFiltroColaborador] = useState("");

  function alternarMotivo(m) {
    setMotivos(motivos.includes(m) ? motivos.filter((x) => x !== m) : [...motivos, m]);
  }

  function registrar() {
    if (!colaboradorId || !data || !motivos.length) return;
    onRegistrar({ colaboradorId, data, motivos, observacao });
    setColaboradorId("");
    setData("");
    setMotivos([]);
    setObservacao("");
  }

  const listaFiltrada = !filtroColaborador
    ? checklists
    : checklists.filter((c) => c.colaboradorId === filtroColaborador);
  const listaOrdenada = [...listaFiltrada].sort((a, b) => new Date(b.data) - new Date(a.data));

  function nomeColaborador(id) {
    return colaboradores.find((c) => c.id === id)?.nome || "—";
  }

  return (
    <div className="f30-grid f30-grid-2">
      <div>
        <div className="f30-secao-titulo">Registrar atraso</div>
        <div className="f30-card f30-form">
          <label>Colaborador (cadastrado no banco)</label>
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
            <option value="">-- Selecione o(a) Colaborador(a) --</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <label>Motivo(s)</label>
          {MOTIVOS_ATRASO.map((m) => (
            <div className="f30-checkbox-row" key={m}>
              <input type="checkbox" checked={motivos.includes(m)} onChange={() => alternarMotivo(m)} />
              {m}
            </div>
          ))}
          <label>Observação (opcional)</label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Detalhes adicionais, se necessário..." />
          <div className="f30-form-actions">
            <button className="f30-btn" onClick={registrar}>Registrar atraso</button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="f30-secao-titulo" style={{ margin: 0 }}>Histórico</div>
          <select className="f30-select-inline" value={filtroColaborador} onChange={(e) => setFiltroColaborador(e.target.value)}>
            <option value="">Todos os colaboradores</option>
            {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="f30-card" style={{ padding: "6px 20px" }}>
          {listaOrdenada.length ? listaOrdenada.map((c) => (
            <div className="f30-atraso-item" key={c.id}>
              <div className="f30-agenda-data">{formatarData(c.data)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{nomeColaborador(c.colaboradorId)}</div>
                <div className="f30-atraso-motivos">{c.motivos.map((m) => <span className="f30-motivo-chip" key={m}>{m}</span>)}</div>
                {c.observacao && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{c.observacao}</div>}
              </div>
              {onRemoverAtraso && (
                <button
                  type="button"
                  className="f30-btn secundario pequeno"
                  style={{ padding: "4px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                  onClick={() => onRemoverAtraso(c.id)}
                >
                  Remover
                </button>
              )}
            </div>
          )) : <div className="f30-vazio">Nenhum atraso registrado.</div>}
        </div>
      </div>
    </div>
  );
}

function TelaPerfil({
  usuario,
  papel,
  dadosPerfil,
  coordenadoresCadastrados,
  supervisoresCadastrados,
  onSalvarPerfil,
}) {
  const [form, setForm] = useState({
    nome: dadosPerfil?.nome || "",
    cargo: dadosPerfil?.cargo || "",
    coordenadorUid: dadosPerfil?.coordenadorUid || "",
    supervisorUid: dadosPerfil?.supervisorUid || "",
    matricula: dadosPerfil?.matricula || "",
    turno: dadosPerfil?.turno || "",
    telefone: dadosPerfil?.telefone || "",
    focoIndividual: dadosPerfil?.focoIndividual || "",
    pontosFortes: Array.isArray(dadosPerfil?.pontosFortes) ? dadosPerfil.pontosFortes.join(", ") : "",
    tmo: dadosPerfil?.indicadores?.tmo ?? "",
    fcr: dadosPerfil?.indicadores?.fcr ?? "",
    qualidade: dadosPerfil?.indicadores?.qualidade ?? "",
    retrabalho: dadosPerfil?.indicadores?.retrabalho ?? "",
  });

  useEffect(() => {
    if (!dadosPerfil) return;
    setForm({
      nome: dadosPerfil.nome || "",
      cargo: dadosPerfil.cargo || "",
      coordenadorUid: dadosPerfil.coordenadorUid || "",
      supervisorUid: dadosPerfil.supervisorUid || "",
      matricula: dadosPerfil.matricula || "",
      turno: dadosPerfil.turno || "",
      telefone: dadosPerfil.telefone || "",
      focoIndividual: dadosPerfil.focoIndividual || "",
      pontosFortes: Array.isArray(dadosPerfil.pontosFortes) ? dadosPerfil.pontosFortes.join(", ") : "",
      tmo: dadosPerfil.indicadores?.tmo ?? "",
      fcr: dadosPerfil.indicadores?.fcr ?? "",
      qualidade: dadosPerfil.indicadores?.qualidade ?? "",
      retrabalho: dadosPerfil.indicadores?.retrabalho ?? "",
    });
  }, [dadosPerfil]);

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar(e) {
    e.preventDefault();
    await onSalvarPerfil({
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      coordenadorUid: papel !== "coordenador" ? form.coordenadorUid : "",
      supervisorUid: papel === "colaborador" ? form.supervisorUid : "",
      matricula: form.matricula.trim(),
      turno: form.turno.trim(),
      telefone: form.telefone.trim(),
      focoIndividual: form.focoIndividual.trim(),
      pontosFortes: form.pontosFortes
        ? form.pontosFortes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      indicadores: {
        tmo: Number(form.tmo) || 0,
        fcr: Number(form.fcr) || 0,
        qualidade: Number(form.qualidade) || 0,
        retrabalho: Number(form.retrabalho) || 0,
      },
    });
  }

  const nomeExibicao = form.nome || usuario?.email || "Usuário";
  const iniciaisAvatar = calcularIniciais(nomeExibicao);

  return (
    <div className="f30-grid f30-grid-2">
      <div>
        <div className="f30-secao-titulo">Meu Perfil no Banco de Dados (Tempo Real)</div>
        <div className="f30-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div
              className="f30-colab-avatar"
              style={{ width: 54, height: 54, fontSize: 18, background: "#EA580C", color: "#fff" }}
            >
              {iniciaisAvatar}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{nomeExibicao}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{form.cargo || "Sem cargo informado"}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "#FFF7ED",
                    color: "#C2410C",
                    border: "1px solid #FDBA74",
                  }}
                >
                  PATENTE: {papel === "coordenador"
                    ? "COORDENADOR(A) GERAL"
                    : papel === "gestor"
                    ? "GESTOR(A) / SUPERVISOR(A)"
                    : "COLABORADOR(A)"}
                </span>
              </div>
            </div>
          </div>

          <div className="f30-mel-grid" style={{ marginTop: 12 }}>
            <div className="f30-mel-field">
              <label>E-mail Cadastrado</label>
              <p className="f30-mono">{usuario?.email || "—"}</p>
            </div>
            {papel !== "coordenador" && (
              <div className="f30-mel-field">
                <label>Coordenador(a) Geral Vinculado</label>
                <p style={{ fontWeight: 700 }}>
                  {coordenadoresCadastrados.find((c) => c.uid === form.coordenadorUid)?.nome ||
                    dadosPerfil?.coordenadorNome ||
                    "Não selecionado"}
                </p>
              </div>
            )}
            {papel === "colaborador" && (
              <div className="f30-mel-field">
                <label>Supervisor(a) / Gestor(a) Vinculado</label>
                <p style={{ fontWeight: 700, color: "#EA580C" }}>
                  {supervisoresCadastrados.find((s) => s.uid === form.supervisorUid)?.nome ||
                    dadosPerfil?.supervisorNome ||
                    "Não selecionado"}
                </p>
              </div>
            )}
            <div className="f30-mel-field">
              <label>Turno / Escala</label>
              <p className="f30-mono">{form.turno || "—"}</p>
            </div>
            <div className="f30-mel-field">
              <label>Matrícula / Ramal</label>
              <p className="f30-mono">{form.matricula || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="f30-secao-titulo">Atualizar Meus Dados no Banco</div>
        <form className="f30-card f30-form" onSubmit={salvar}>
          <div className="f30-grid f30-grid-2">
            <div>
              <label>Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div>
              <label>Cargo / Função</label>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => atualizar("cargo", e.target.value)}
                placeholder="Digite seu cargo"
              />
            </div>
          </div>

          {/* Vínculo hierárquico: exibe apenas pessoas cadastradas no banco com a respectiva Patente */}
          {papel === "colaborador" && (
            <div style={{ marginTop: 8 }}>
              <label>Meu(Minha) Gestor(a) / Supervisor(a) (cadastrado no banco com essa patente)</label>
              <select
                value={form.supervisorUid}
                onChange={(e) => atualizar("supervisorUid", e.target.value)}
              >
                <option value="">
                  {supervisoresCadastrados.length > 0
                    ? "-- Selecione o(a) Supervisor(a) cadastrado(a) --"
                    : "-- Nenhum(a) Supervisor(a) cadastrado(a) no banco --"}
                </option>
                {supervisoresCadastrados.map((sup) => (
                  <option key={sup.uid} value={sup.uid}>
                    {sup.nome || sup.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(papel === "gestor" || papel === "colaborador") && coordenadoresCadastrados.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <label>Meu(Minha) Coordenador(a) Geral (cadastrado no banco com essa patente)</label>
              <select
                value={form.coordenadorUid}
                onChange={(e) => atualizar("coordenadorUid", e.target.value)}
              >
                <option value="">-- Selecione o(a) Coordenador(a) Geral cadastrado(a) --</option>
                {coordenadoresCadastrados.map((coord) => (
                  <option key={coord.uid} value={coord.uid}>
                    {coord.nome || coord.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
            <div>
              <label>Turno / Horário</label>
              <input
                type="text"
                value={form.turno}
                onChange={(e) => atualizar("turno", e.target.value)}
                placeholder="Digite seu horário"
              />
            </div>
            <div>
              <label>Matrícula / Ramal</label>
              <input
                type="text"
                value={form.matricula}
                onChange={(e) => atualizar("matricula", e.target.value)}
                placeholder="Digite sua matrícula"
              />
            </div>
          </div>

          <label style={{ marginTop: 8 }}>Foco de Desenvolvimento / Meta Individual</label>
          <input
            type="text"
            value={form.focoIndividual}
            onChange={(e) => atualizar("focoIndividual", e.target.value)}
            placeholder="Digite seu foco atual"
          />

          {papel === "colaborador" && (
            <>
              <label style={{ marginTop: 8 }}>Pontos fortes (separados por vírgula)</label>
              <input
                type="text"
                value={form.pontosFortes}
                onChange={(e) => atualizar("pontosFortes", e.target.value)}
                placeholder="Opcional"
              />
              <div className="f30-grid f30-grid-4" style={{ marginTop: 8 }}>
                <div>
                  <label>TMO (s)</label>
                  <input type="text" value={form.tmo} onChange={(e) => atualizar("tmo", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label>FCR (%)</label>
                  <input type="text" value={form.fcr} onChange={(e) => atualizar("fcr", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label>Qualidade (%)</label>
                  <input type="text" value={form.qualidade} onChange={(e) => atualizar("qualidade", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label>Retrabalho (%)</label>
                  <input type="text" value={form.retrabalho} onChange={(e) => atualizar("retrabalho", e.target.value)} placeholder="0" />
                </div>
              </div>
            </>
          )}

          <div className="f30-form-actions" style={{ marginTop: 14 }}>
            <button className="f30-btn" type="submit">
              Salvar perfil no banco de dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================== APP ================================== */

export default function App() {
  const {
    usuario,
    perfilUsuario,
    nomeUsuario,
    dadosPerfil,
    coordenadoresCadastrados,
    supervisoresCadastrados,
    colaboradoresCadastrados,
    atualizarMeuPerfil,
    removerUsuarioDoBanco,
    sair,
  } = useAuth();

  // A patente vem estritamente do que está salvo no banco de dados para o usuário logado
  const papel = perfilUsuario || "";

  const [aba, setAba] = useState("inicio");

  // Estados iniciam limpos (ou do cache real salvo), NUNCA com dados fictícios pré-definidos
  const [colaboradoresExtras, setColaboradoresExtras] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.colaboradoresExtras) ? salvo.colaboradoresExtras : [];
  });
  const [idsExcluidos, setIdsExcluidos] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.idsExcluidos) ? salvo.idsExcluidos : [];
  });
  const [itensRotina, setItensRotina] = useState(() => {
    const salvo = lerEstadoLocal();
    return salvo?.itensRotina && typeof salvo.itensRotina === "object"
      ? salvo.itensRotina
      : ROTINA_VAZIA;
  });
  const [melhorias, setMelhorias] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.melhorias) ? salvo.melhorias : [];
  });
  const [reconhecimentos, setReconhecimentos] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.reconhecimentos) ? salvo.reconhecimentos : [];
  });
  const [agenda, setAgenda] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.agenda) ? salvo.agenda : [];
  });
  const [evolucoes, setEvolucoes] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.evolucoes) ? salvo.evolucoes : [];
  });
  const [feedbacks, setFeedbacks] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.feedbacks) ? salvo.feedbacks : [];
  });
  const [checklists, setChecklists] = useState(() => {
    const salvo = lerEstadoLocal();
    return Array.isArray(salvo?.checklists) ? salvo.checklists : [];
  });
  const [dadosCoordenacao, setDadosCoordenacao] = useState(() => {
    const salvo = lerEstadoLocal();
    return salvo?.dadosCoordenacao && typeof salvo.dadosCoordenacao === "object"
      ? salvo.dadosCoordenacao
      : {};
  });

  const [toast, setToast] = useState(null);
  const [firestoreOnline, setFirestoreOnline] = useState(false);

  // Abas visíveis estritamente conforme a Patente cadastrada no banco de dados
  const abasVisiveis = useMemo(() => {
    if (papel === "coordenador") {
      // A aba Coordenação só aparece para quem está cadastrado no banco com a patente "coordenador"
      return [
        { id: "coordenacao", rotulo: "Coordenação" },
        { id: "inicio", rotulo: "Visão Geral" },
        { id: "time", rotulo: "Equipes Cadastradas" },
        { id: "melhorias", rotulo: "Melhorias" },
        { id: "agenda", rotulo: "Agenda & Evoluções" },
        { id: "feedback", rotulo: "Feedbacks" },
        { id: "checklist", rotulo: "Checklist de Atraso" },
        { id: "perfil", rotulo: "Meu Perfil" },
      ];
    }
    if (papel === "gestor") {
      return [
        { id: "inicio", rotulo: "Início" },
        { id: "time", rotulo: "Meu Time" },
        { id: "rotina", rotulo: "Minha Rotina" },
        { id: "melhorias", rotulo: "Melhorias" },
        { id: "agenda", rotulo: "Agenda" },
        { id: "feedback", rotulo: "Feedback" },
        { id: "checklist", rotulo: "Checklist de Atraso" },
        { id: "perfil", rotulo: "Meu Perfil" },
      ];
    }
    // Colaborador
    return [
      { id: "inicio", rotulo: "Meu Desempenho" },
      { id: "rotina", rotulo: "Minha Rotina" },
      { id: "feedback", rotulo: "Meus Feedbacks" },
      { id: "perfil", rotulo: "Meu Perfil" },
    ];
  }, [papel]);

  useEffect(() => {
    if (!abasVisiveis.some((a) => a.id === aba)) {
      setAba(papel === "coordenador" ? "coordenacao" : "inicio");
    }
  }, [papel, abasVisiveis, aba]);

  // Une os colaboradores reais cadastrados na coleção /usuarios com eventuais colaboradores adicionados em Meu Time
  const todosColaboradores = useMemo(() => {
    const excluidosSet = new Set(idsExcluidos);
    const mapa = new Map();

    // 1. Pessoas reais cadastradas no banco com a patente "colaborador"
    colaboradoresCadastrados.forEach((u) => {
      if (excluidosSet.has(u.uid)) return;
      const supObj = supervisoresCadastrados.find((s) => s.uid === u.supervisorUid);
      mapa.set(u.uid, {
        id: u.uid,
        uid: u.uid,
        nome: u.nome || u.email || "Colaborador",
        email: u.email || "",
        cargo: u.cargo || "Colaborador(a)",
        supervisorUid: u.supervisorUid || "",
        supervisorNome: supObj?.nome || u.supervisorNome || "",
        coordenadorUid: u.coordenadorUid || "",
        coordenadorNome: u.coordenadorNome || "",
        iniciais: calcularIniciais(u.nome || u.email),
        pontosFortes: Array.isArray(u.pontosFortes) ? u.pontosFortes : [],
        focoDesenvolvimento: u.focoIndividual || "",
        indicadores: u.indicadores || { tmo: 0, fcr: 0, qualidade: 0, retrabalho: 0 },
        reconhecimentos: 0,
        emAcompanhamento: Boolean(u.emAcompanhamento),
        ultimaConversa: u.ultimaConversa || { data: "", resumo: "", proximoPasso: "", prazo: "" },
      });
    });

    // 2. Colaboradores adicionados manualmente pelo botão "+ Adicionar colaborador"
    colaboradoresExtras.forEach((c) => {
      if (!c || excluidosSet.has(c.id)) return;
      const supObj = supervisoresCadastrados.find((s) => s.uid === c.supervisorUid);
      mapa.set(c.id, {
        ...c,
        supervisorNome: supObj?.nome || c.supervisorNome || "",
      });
    });

    return Array.from(mapa.values());
  }, [colaboradoresCadastrados, colaboradoresExtras, supervisoresCadastrados, idsExcluidos]);

  // Isolamento por Hierarquia baseado nos vínculos reais do banco
  const colaboradoresVisiveis = useMemo(() => {
    if (papel === "coordenador") {
      return todosColaboradores;
    }
    if (papel === "gestor") {
      // O Supervisor vê os colaboradores vinculados ao seu UID no banco
      return todosColaboradores.filter((c) => c.supervisorUid === usuario?.uid);
    }
    // O Colaborador vê apenas o próprio registro
    return todosColaboradores.filter((c) => c.uid === usuario?.uid || c.id === usuario?.uid);
  }, [todosColaboradores, papel, usuario?.uid]);

  const idsColaboradoresVisiveis = useMemo(
    () => new Set(colaboradoresVisiveis.map((c) => c.id)),
    [colaboradoresVisiveis]
  );

  const feedbacksVisiveis = useMemo(() => {
    if (papel === "coordenador") return feedbacks;
    if (papel === "gestor") {
      return feedbacks.filter(
        (f) => f.supervisorUid === usuario?.uid || idsColaboradoresVisiveis.has(f.colaboradorId)
      );
    }
    return feedbacks.filter((f) => f.colaboradorId === usuario?.uid);
  }, [feedbacks, papel, usuario?.uid, idsColaboradoresVisiveis]);

  const checklistsVisiveis = useMemo(() => {
    if (papel === "coordenador") return checklists;
    return checklists.filter(
      (c) => c.supervisorUid === usuario?.uid || idsColaboradoresVisiveis.has(c.colaboradorId)
    );
  }, [checklists, papel, usuario?.uid, idsColaboradoresVisiveis]);

  const melhoriasVisiveis = useMemo(() => {
    if (papel === "coordenador") return melhorias;
    return melhorias.filter((m) => m.supervisorUid === usuario?.uid || m.criadoPorUid === usuario?.uid);
  }, [melhorias, papel, usuario?.uid]);

  // Sincronização em tempo real com o documento /front30/estado_real no Firestore
  useEffect(() => {
    if (!db || !usuario || !usuario.emailVerified) return;
    const docRef = doc(db, "front30", "estado_real");
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        setFirestoreOnline(true);
        const estadoLocal = lerEstadoLocal();
        const localTs = Number(estadoLocal?.atualizadoEm || 0);

        if (snap.exists()) {
          const dados = snap.data();
          const remotoTs = Number(dados.atualizadoEm || 0);

          if (remotoTs >= localTs) {
            const novoCache = {};
            if (Array.isArray(dados.colaboradoresExtras)) {
              setColaboradoresExtras(dados.colaboradoresExtras);
              novoCache.colaboradoresExtras = dados.colaboradoresExtras;
            }
            if (Array.isArray(dados.idsExcluidos)) {
              setIdsExcluidos(dados.idsExcluidos);
              novoCache.idsExcluidos = dados.idsExcluidos;
            }
            if (dados.itensRotina && typeof dados.itensRotina === "object") {
              setItensRotina(dados.itensRotina);
              novoCache.itensRotina = dados.itensRotina;
            }
            if (Array.isArray(dados.melhorias)) {
              setMelhorias(dados.melhorias);
              novoCache.melhorias = dados.melhorias;
            }
            if (Array.isArray(dados.reconhecimentos)) {
              setReconhecimentos(dados.reconhecimentos);
              novoCache.reconhecimentos = dados.reconhecimentos;
            }
            if (Array.isArray(dados.agenda)) {
              setAgenda(dados.agenda);
              novoCache.agenda = dados.agenda;
            }
            if (Array.isArray(dados.evolucoes)) {
              setEvolucoes(dados.evolucoes);
              novoCache.evolucoes = dados.evolucoes;
            }
            if (Array.isArray(dados.feedbacks)) {
              setFeedbacks(dados.feedbacks);
              novoCache.feedbacks = dados.feedbacks;
            }
            if (Array.isArray(dados.checklists)) {
              setChecklists(dados.checklists);
              novoCache.checklists = dados.checklists;
            }
            if (dados.dadosCoordenacao && typeof dados.dadosCoordenacao === "object") {
              setDadosCoordenacao(dados.dadosCoordenacao);
              novoCache.dadosCoordenacao = dados.dadosCoordenacao;
            }
            gravarEstadoLocal({ ...novoCache, atualizadoEm: remotoTs || Date.now() });
          } else if (estadoLocal) {
            setDoc(docRef, estadoLocal, { merge: true }).catch(() => {});
          }
        } else {
          const inicialLimpo = estadoLocal || {
            colaboradoresExtras: [],
            idsExcluidos: [],
            itensRotina: ROTINA_VAZIA,
            melhorias: [],
            reconhecimentos: [],
            agenda: [],
            evolucoes: [],
            feedbacks: [],
            checklists: [],
            dadosCoordenacao: {},
            atualizadoEm: Date.now(),
          };
          gravarEstadoLocal(inicialLimpo);
          setDoc(docRef, inicialLimpo, { merge: true }).catch(() => {});
        }
      },
      (err) => {
        console.warn("Aviso Firestore:", err.code, err.message);
        setFirestoreOnline(false);
      }
    );
    return () => unsubscribe();
  }, [usuario]);

  async function salvarNoFirestore(novosDados) {
    const agora = Date.now();
    const payload = { ...novosDados, atualizadoEm: agora };
    gravarEstadoLocal(payload);

    if (!db || !usuario) return;
    try {
      const docRef = doc(db, "front30", "estado_real");
      await setDoc(docRef, payload, { merge: true });
      setFirestoreOnline(true);
    } catch (e) {
      console.warn("Aviso ao salvar no Firestore (salvo localmente):", e);
    }
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function adicionarColaborador(novoColaborador) {
    const comVinculo = {
      ...novoColaborador,
      supervisorUid: novoColaborador.supervisorUid || (papel === "gestor" ? usuario?.uid : ""),
      supervisorNome:
        novoColaborador.supervisorNome ||
        (papel === "gestor" ? nomeUsuario || usuario?.email : ""),
    };
    setColaboradoresExtras((prev) => {
      const atualizado = [comVinculo, ...prev];
      salvarNoFirestore({ colaboradoresExtras: atualizado });
      return atualizado;
    });
    mostrarToast(`Colaborador ${novoColaborador.nome} salvo no banco.`);
  }

  async function removerColaborador(id, nome, uidBanco) {
    const novosExcluidos = Array.from(new Set([...idsExcluidos, id, uidBanco].filter(Boolean)));
    setIdsExcluidos(novosExcluidos);
    setColaboradoresExtras((prev) => {
      const atualizado = prev.filter((c) => c.id !== id && c.uid !== uidBanco);
      salvarNoFirestore({ colaboradoresExtras: atualizado, idsExcluidos: novosExcluidos });
      return atualizado;
    });
    if (uidBanco) {
      await removerUsuarioDoBanco(uidBanco);
    }
    mostrarToast(`Colaborador ${nome || ""} removido permanentemente.`);
  }

  function adicionarItemRotina(bloco, texto) {
    const novoItem = { id: gerarId("rot"), texto, status: "nao_iniciado" };
    setItensRotina((prev) => {
      const listaBloco = Array.isArray(prev?.[bloco]) ? prev[bloco] : [];
      const atualizado = {
        ...prev,
        [bloco]: [...listaBloco, novoItem],
      };
      salvarNoFirestore({ itensRotina: atualizado });
      return atualizado;
    });
    mostrarToast("Atividade adicionada à rotina.");
  }

  function alternarStatusItem(bloco, id) {
    setItensRotina((prev) => {
      const listaBloco = Array.isArray(prev?.[bloco]) ? prev[bloco] : [];
      const atualizado = {
        ...prev,
        [bloco]: listaBloco.map((item) =>
          item.id === id ? { ...item, status: PROX_STATUS[item.status] } : item
        ),
      };
      salvarNoFirestore({ itensRotina: atualizado });
      return atualizado;
    });
  }

  function removerItemRotina(bloco, id) {
    setItensRotina((prev) => {
      const listaBloco = Array.isArray(prev?.[bloco]) ? prev[bloco] : [];
      const atualizado = {
        ...prev,
        [bloco]: listaBloco.filter((item) => item.id !== id),
      };
      salvarNoFirestore({ itensRotina: atualizado });
      return atualizado;
    });
    mostrarToast("Atividade removida da rotina.");
  }

  function adicionarMelhoria(form) {
    const nova = {
      id: gerarId("mel"),
      problema: form.problema,
      causa: form.causa,
      acao: form.acao,
      responsavel: form.responsavel,
      supervisorUid: usuario?.uid || "",
      criadoPorUid: usuario?.uid || "",
      prazo: form.prazo || obterDataHojeISO(),
      resultado: "",
      aprendizado: "",
      status: "em_andamento",
      criadoEm: obterDataHojeISO(),
    };
    setMelhorias((prev) => {
      const atualizado = [nova, ...prev];
      salvarNoFirestore({ melhorias: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de melhoria salvo.");
  }

  function concluirMelhoria(id, resultado, aprendizado) {
    setMelhorias((prev) => {
      const atualizado = prev.map((m) =>
        m.id === id ? { ...m, resultado, aprendizado, status: "concluida" } : m
      );
      salvarNoFirestore({ melhorias: atualizado });
      return atualizado;
    });
    mostrarToast("Melhoria marcada como concluída.");
  }

  function removerMelhoria(id) {
    setMelhorias((prev) => {
      const atualizado = prev.filter((m) => m.id !== id);
      salvarNoFirestore({ melhorias: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de melhoria removido permanentemente.");
  }

  function adicionarCompromisso(dados) {
    const novo = { id: gerarId("ag"), supervisorUid: usuario?.uid || "", ...dados };
    setAgenda((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ agenda: atualizado });
      return atualizado;
    });
    mostrarToast("Compromisso agendado e salvo.");
  }

  function removerCompromisso(id) {
    setAgenda((prev) => {
      const atualizado = prev.filter((a) => a.id !== id);
      salvarNoFirestore({ agenda: atualizado });
      return atualizado;
    });
    mostrarToast("Compromisso removido permanentemente.");
  }

  function enviarEvolucao(texto, periodo) {
    const nova = {
      id: gerarId("ev"),
      periodo,
      texto,
      supervisorUid: usuario?.uid || "",
      autor: nomeUsuario || usuario?.email || "",
      data: obterDataHojeISO(),
      status: "enviado",
    };
    setEvolucoes((prev) => {
      const atualizado = [...prev, nova];
      salvarNoFirestore({ evolucoes: atualizado });
      return atualizado;
    });
    mostrarToast("Evolução enviada e salva.");
  }

  function removerEvolucao(id) {
    setEvolucoes((prev) => {
      const atualizado = prev.filter((e) => e.id !== id);
      salvarNoFirestore({ evolucoes: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de evolução removido permanentemente.");
  }

  function enviarFeedback(colaboradorId, texto) {
    const autorLabel = nomeUsuario || usuario?.email || "Liderança";
    const novo = {
      id: gerarId("f"),
      colaboradorId,
      supervisorUid: usuario?.uid || "",
      autor: autorLabel,
      texto,
      data: obterDataHojeISO(),
      resposta: null,
    };
    setFeedbacks((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Feedback enviado e salvo.");
  }

  function removerFeedback(id) {
    setFeedbacks((prev) => {
      const atualizado = prev.filter((f) => f.id !== id);
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Feedback removido permanentemente.");
  }

  function responderFeedback(feedbackId, texto) {
    setFeedbacks((prev) => {
      const atualizado = prev.map((f) =>
        f.id === feedbackId
          ? {
              ...f,
              resposta: {
                texto,
                autor: nomeUsuario || usuario?.email || "Colaborador",
                data: obterDataHojeISO(),
              },
            }
          : f
      );
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Resposta enviada e salva.");
  }

  function registrarAtraso(dados) {
    const novo = { id: gerarId("ch"), supervisorUid: usuario?.uid || "", ...dados };
    setChecklists((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ checklists: atualizado });
      return atualizado;
    });
    mostrarToast("Atraso registrado e salvo.");
  }

  function removerAtraso(id) {
    setChecklists((prev) => {
      const atualizado = prev.filter((c) => c.id !== id);
      salvarNoFirestore({ checklists: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de atraso removido permanentemente.");
  }

  function atualizarDadosCoordenacao(novosDadosCoord) {
    setDadosCoordenacao(novosDadosCoord);
    salvarNoFirestore({ dadosCoordenacao: novosDadosCoord });
    mostrarToast("Dados da coordenação atualizados e salvos.");
  }

  return (
    <div className="f30-app">
      <aside className="f30-sidebar">
        <div className="f30-brand">
          <div className="f30-brand-badge">F30</div>
          <div className="f30-brand-text">
            <b>Front 30'</b>
            <span>rotina de liderança</span>
          </div>
        </div>

        {/* Cartão com a Patente real cadastrada no banco de dados */}
        <div
          onClick={() => setAba("perfil")}
          title="Clique para abrir Meu Perfil"
          style={{
            margin: "0 4px 12px",
            padding: "8px 10px",
            borderRadius: 10,
            cursor: "pointer",
            background:
              papel === "coordenador"
                ? "#FFF7ED"
                : papel === "gestor"
                ? "#EFF6FF"
                : "#F0FDF4",
            border:
              papel === "coordenador"
                ? "1px solid #FDBA74"
                : papel === "gestor"
                ? "1px solid #BFDBFE"
                : "1px solid #BBF7D0",
            fontSize: 11,
            lineHeight: 1.35,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color:
                papel === "coordenador"
                  ? "#C2410C"
                  : papel === "gestor"
                  ? "#1D4ED8"
                  : "#15803D",
            }}
          >
            {papel === "coordenador"
              ? "🔒 PATENTE: COORDENADOR(A) GERAL"
              : papel === "gestor"
              ? "🔒 PATENTE: GESTOR(A) / SUPERVISOR(A)"
              : "🔒 PATENTE: COLABORADOR(A)"}
          </div>
          <div style={{ color: "#0F172A", marginTop: 3, fontWeight: 700 }}>
            {nomeUsuario || usuario?.email}
          </div>
        </div>

        <nav className="f30-nav">
          {abasVisiveis.map((a) => (
            <button
              key={a.id}
              className={`f30-nav-item ${aba === a.id ? "ativo" : ""}`}
              onClick={() => setAba(a.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">{ICONES_NAV[a.id]}</svg>
              {a.rotulo}
            </button>
          ))}
        </nav>

        <div className="f30-conta">
          <span
            className="f30-conta-email"
            style={{ cursor: "pointer" }}
            onClick={() => setAba("perfil")}
            title="Abrir Meu Perfil"
          >
            {nomeUsuario || usuario?.email}
          </span>
          <button className="f30-btn secundario pequeno" onClick={sair}>Sair</button>
        </div>
      </aside>

      <main className="f30-main">
        <div className="f30-header">
          <div>
            <h1>{abasVisiveis.find((a) => a.id === aba)?.rotulo}</h1>
            <p>
              {papel === "coordenador"
                ? "Acesso exclusivo da patente Coordenador(a) Geral — dados 100% reais do banco de dados"
                : papel === "gestor"
                ? "Acesso da patente Gestor(a) / Supervisor(a) — equipe vinculada no banco de dados"
                : "Acesso da patente Colaborador(a) — perfil e registros sincronizados em tempo real"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="f30-mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 10px",
                borderRadius: 999,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {firestoreOnline ? "● BANCO DE DADOS EM TEMPO REAL" : "● SALVO AUTOMATICAMENTE"}
            </span>
            <div className="f30-date-stub">{obterDataCabecalho()}</div>
          </div>
        </div>

        {aba === "inicio" && (
          <TelaInicio
            colaboradores={colaboradoresVisiveis}
            melhorias={melhoriasVisiveis}
            reconhecimentos={reconhecimentos}
          />
        )}

        {/* Aba Coordenação: renderiza SOMENTE se o usuário tiver a patente "coordenador" no banco */}
        {aba === "coordenacao" && papel === "coordenador" && (
          <PainelCoordenadora
            supervisoresCadastrados={supervisoresCadastrados}
            colaboradores={todosColaboradores}
            melhorias={melhorias}
            feedbacks={feedbacks}
            checklists={checklists}
            dadosCoordenacao={dadosCoordenacao}
            onAtualizarDadosCoordenacao={atualizarDadosCoordenacao}
            onRemoverMelhoria={removerMelhoria}
          />
        )}

        {aba === "time" && (papel === "gestor" || papel === "coordenador") && (
          <TelaTime
            colaboradores={colaboradoresVisiveis}
            feedbacks={feedbacksVisiveis}
            checklists={checklistsVisiveis}
            reconhecimentos={reconhecimentos}
            onAdicionarColaborador={adicionarColaborador}
            onRemoverColaborador={removerColaborador}
            supervisoresCadastrados={
              papel === "coordenador"
                ? supervisoresCadastrados
                : supervisoresCadastrados.filter((s) => s.uid === usuario?.uid)
            }
          />
        )}

        {aba === "rotina" && (
          <TelaRotina
            itens={itensRotina}
            onAlternarStatus={alternarStatusItem}
            onAdicionarItemRotina={adicionarItemRotina}
            onRemoverItemRotina={removerItemRotina}
          />
        )}

        {aba === "melhorias" && (papel === "gestor" || papel === "coordenador") && (
          <TelaMelhorias
            melhorias={melhoriasVisiveis}
            colaboradores={colaboradoresVisiveis}
            onAdicionar={adicionarMelhoria}
            onConcluir={concluirMelhoria}
            onRemover={removerMelhoria}
          />
        )}

        {aba === "agenda" && (papel === "gestor" || papel === "coordenador") && (
          <TelaAgenda
            agenda={agenda}
            evolucoes={evolucoes}
            onEnviarEvolucao={enviarEvolucao}
            onAdicionarCompromisso={adicionarCompromisso}
            onRemoverCompromisso={removerCompromisso}
            onRemoverEvolucao={removerEvolucao}
          />
        )}

        {aba === "feedback" && (
          <TelaFeedback
            colaboradores={colaboradoresVisiveis}
            feedbacks={feedbacksVisiveis}
            onEnviarFeedback={enviarFeedback}
            onResponder={responderFeedback}
            onRemoverFeedback={removerFeedback}
            papel={papel}
            colaboradorLogadoId={usuario?.uid}
          />
        )}

        {aba === "checklist" && (papel === "gestor" || papel === "coordenador") && (
          <TelaChecklistAtraso
            colaboradores={colaboradoresVisiveis}
            checklists={checklistsVisiveis}
            onRegistrar={registrarAtraso}
            onRemoverAtraso={removerAtraso}
          />
        )}

        {aba === "perfil" && (
          <TelaPerfil
            usuario={usuario}
            papel={papel}
            dadosPerfil={dadosPerfil}
            coordenadoresCadastrados={coordenadoresCadastrados}
            supervisoresCadastrados={supervisoresCadastrados}
            onSalvarPerfil={async (novosCampos) => {
              await atualizarMeuPerfil(novosCampos);
              mostrarToast("Perfil atualizado e salvo em tempo real no banco!");
            }}
          />
        )}
      </main>

      {toast && <div className="f30-toast">{toast}</div>}
    </div>
  );
}
