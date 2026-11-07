import React, { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { useAuth } from "./context/AuthContext.jsx";

/* =========================================================================
   FRONT 30' — protótipo funcional (fase 1: front-end apenas, dados fictícios)
   ========================================================================= */

/* ---------------------------- Dados fictícios --------------------------- */

const COLABORADORES_INICIAIS = [
  {
    id: "c1",
    nome: "Renata Aquino",
    cargo: "Atendente de Relacionamento Sênior",
    iniciais: "RA",
    pontosFortes: ["Empatia em casos sensíveis", "Domínio de remarcações"],
    focoDesenvolvimento: "Reduzir tempo médio em chamadas de reembolso",
    indicadores: { tmo: 342, fcr: 88, qualidade: 94, retrabalho: 4 },
    reconhecimentos: 3,
    emAcompanhamento: true,
    ultimaConversa: { data: "2026-09-03", resumo: "Alinhamos script de reembolso e ela trouxe uma ideia de checklist rápido.", proximoPasso: "Testar checklist por 1 semana e trazer resultado.", prazo: "2026-09-10" },
  },
  {
    id: "c2",
    nome: "Diego Farias",
    cargo: "Atendente de Relacionamento",
    iniciais: "DF",
    pontosFortes: ["Agilidade", "Boa escuta ativa"],
    focoDesenvolvimento: "Aumentar first call resolution em bagagem extraviada",
    indicadores: { tmo: 298, fcr: 74, qualidade: 89, retrabalho: 9 },
    reconhecimentos: 1,
    emAcompanhamento: true,
    ultimaConversa: { data: "2026-08-28", resumo: "Conversamos sobre os retrabalhos de agosto; causa raiz parece ser falta de confirmação de endereço.", proximoPasso: "Passar a confirmar endereço em voz alta em toda ligação de bagagem.", prazo: "2026-09-11" },
  },
  {
    id: "c3",
    nome: "Juliana Prado",
    cargo: "Atendente de Relacionamento Pleno",
    iniciais: "JP",
    pontosFortes: ["Consistência", "Referência em qualidade"],
    focoDesenvolvimento: "Assumir mentoria de novatos",
    indicadores: { tmo: 310, fcr: 91, qualidade: 97, retrabalho: 2 },
    reconhecimentos: 5,
    emAcompanhamento: false,
    ultimaConversa: { data: "2026-08-20", resumo: "Ela topou apadrinhar o Diego nas próximas duas semanas.", proximoPasso: "Primeira sessão de apadrinhamento.", prazo: "2026-09-05" },
  },
  {
    id: "c4",
    nome: "Marcos Vidal",
    cargo: "Atendente de Relacionamento",
    iniciais: "MV",
    pontosFortes: ["Simpatia com passageiros difíceis"],
    focoDesenvolvimento: "Reduzir TMO em atendimentos de check-in",
    indicadores: { tmo: 405, fcr: 79, qualidade: 85, retrabalho: 7 },
    reconhecimentos: 0,
    emAcompanhamento: true,
    ultimaConversa: { data: "2026-09-01", resumo: "Ligações de check-in estão longas por excesso de explicação. Ele concorda em objetivar mais.", proximoPasso: "Gravar 3 ligações e revisar juntos.", prazo: "2026-09-09" },
  },
  {
    id: "c5",
    nome: "Camila Torres",
    cargo: "Atendente de Relacionamento Pleno",
    iniciais: "CT",
    pontosFortes: ["Organização", "Registro impecável de ocorrências"],
    focoDesenvolvimento: "Ganhar confiança para negociar exceções",
    indicadores: { tmo: 289, fcr: 86, qualidade: 93, retrabalho: 3 },
    reconhecimentos: 2,
    emAcompanhamento: false,
    ultimaConversa: { data: "2026-08-25", resumo: "Falamos sobre autonomia em pequenas exceções de tarifa.", proximoPasso: "Aplicar autonomia combinada em 3 casos e revisar.", prazo: "2026-09-08" },
  },
];

const INDICADORES_TIME = {
  tmo: { atual: 328, anterior: 351, unidade: "s", melhorQuando: "menor" },
  fcr: { atual: 84, anterior: 80, unidade: "%", melhorQuando: "maior" },
  qualidade: { atual: 92, anterior: 90, unidade: "%", melhorQuando: "maior" },
  retrabalho: { atual: 5, anterior: 7, unidade: "%", melhorQuando: "menor" },
};

const ITENS_ROTINA_INICIAIS = {
  hoje: [
    { id: "h1", texto: "Verificar indicadores do time", status: "concluido" },
    { id: "h2", texto: "Fazer uma escuta com um colaborador", status: "em_andamento" },
    { id: "h3", texto: "Observar um processo em execução", status: "nao_iniciado" },
    { id: "h4", texto: "Reconhecer alguém publicamente", status: "nao_iniciado" },
    { id: "h5", texto: "Registrar pendência do dia", status: "nao_iniciado" },
  ],
  semana: [
    { id: "s1", texto: "Analisar desvios da semana", status: "em_andamento" },
    { id: "s2", texto: "Ouvir a equipe (rodada rápida)", status: "nao_iniciado" },
    { id: "s3", texto: "Escolher uma melhoria para priorizar", status: "concluido" },
    { id: "s4", texto: "Acompanhar ação em andamento", status: "em_andamento" },
    { id: "s5", texto: "Reconhecer evolução de alguém", status: "nao_iniciado" },
  ],
  mes: [
    { id: "m1", texto: "Comparar resultados com o mês anterior", status: "nao_iniciado" },
    { id: "m2", texto: "Revisar plano de desenvolvimento do time", status: "nao_iniciado" },
    { id: "m3", texto: "Analisar melhorias concluídas", status: "em_andamento" },
    { id: "m4", texto: "Fechar aprendizados do mês", status: "nao_iniciado" },
  ],
};

const MELHORIAS_INICIAIS = [
  {
    id: "mel1",
    problema: "Retrabalho alto em solicitações de reembolso",
    causa: "Passageiro não recebia confirmação escrita, ligava de novo para checar",
    acao: "Enviar SMS de confirmação automático ao final da chamada",
    responsavel: "Renata Aquino",
    prazo: "2026-08-30",
    resultado: "Retrabalho do time caiu de 9% para 5% em 3 semanas",
    aprendizado: "Confirmação escrita reduz ansiedade do passageiro e ligações repetidas",
    status: "concluida",
    criadoEm: "2026-08-05",
  },
  {
    id: "mel2",
    problema: "TMO elevado em atendimentos de check-in",
    causa: "Roteiro de explicação muito longo para casos simples",
    acao: "Criar roteiro curto para os 3 casos mais comuns de check-in",
    responsavel: "Marcos Vidal",
    prazo: "2026-09-09",
    resultado: "",
    aprendizado: "",
    status: "em_andamento",
    criadoEm: "2026-08-27",
  },
  {
    id: "mel3",
    problema: "Baixo FCR em casos de bagagem extraviada",
    causa: "Endereço de entrega não é confirmado na ligação original",
    acao: "Confirmar endereço em voz alta em toda ligação de bagagem",
    responsavel: "Diego Farias",
    prazo: "2026-09-11",
    resultado: "",
    aprendizado: "",
    status: "em_andamento",
    criadoEm: "2026-08-28",
  },
];

const RECONHECIMENTOS_INICIAIS = [
  { id: "r1", colaboradorId: "c3", descricao: "Aceitou apadrinhar um colega novo, de forma voluntária", data: "2026-08-20" },
  { id: "r2", colaboradorId: "c1", descricao: "Trouxe uma solução própria para reduzir retrabalho", data: "2026-08-22" },
  { id: "r3", colaboradorId: "c5", descricao: "Registro impecável em uma ocorrência complexa", data: "2026-09-02" },
];

const AGENDA_INICIAL = [
  { id: "ag1", titulo: "1:1 — Renata Aquino", data: "2026-09-10", hora: "09:00" },
  { id: "ag2", titulo: "1:1 — Marcos Vidal", data: "2026-09-09", hora: "11:00" },
  { id: "ag3", titulo: "Alinhamento semanal do time", data: "2026-09-12", hora: "14:00" },
  { id: "ag4", titulo: "1:1 — Diego Farias", data: "2026-09-11", hora: "10:30" },
];

const EVOLUCOES_INICIAIS = [
  { id: "ev1", periodo: "esta_semana", texto: "Retrabalho caiu 2 pontos após ação de SMS de confirmação. Seguimos monitorando check-in.", data: "2026-09-02", status: "enviado" },
];

const FEEDBACKS_INICIAIS = [
  {
    id: "f1",
    colaboradorId: "c1",
    autor: "Você (gestora)",
    texto: "Sua ideia do checklist de reembolso foi ótima — já vi diferença na clareza das ligações. Bora manter e revisar o texto juntas semana que vem.",
    data: "2026-09-03",
    resposta: { texto: "Obrigada! Já ajustei duas perguntas do checklist com base nas ligações desta semana.", autor: "Renata Aquino", data: "2026-09-04" },
  },
  {
    id: "f2",
    colaboradorId: "c4",
    autor: "Você (gestora)",
    texto: "Percebi que as explicações de check-in ainda estão longas. Vamos gravar algumas ligações e revisar juntos para deixar mais direto.",
    data: "2026-09-01",
    resposta: null,
  },
];

const CHECKLIST_ATRASO_INICIAL = [
  { id: "ch1", colaboradorId: "c2", data: "2026-08-19", motivos: ["Problema no transporte público"], observacao: "" },
  { id: "ch2", colaboradorId: "c4", data: "2026-08-27", motivos: ["Instabilidade na operadora de internet", "Imprevisto pessoal/familiar"], observacao: "Resolveu em 20 minutos." },
];

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
const NOMES_STATUS_ITEM = { nao_iniciado: "Não iniciado", em_andamento: "Em andamento", concluido: "Concluído" };
const PROX_STATUS = { nao_iniciado: "em_andamento", em_andamento: "concluido", concluido: "nao_iniciado" };

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
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}

function diasAte(iso) {
  const hoje = new Date(obterDataHojeISO() + "T00:00:00");
  const alvo = new Date(iso + "T00:00:00");
  return Math.round((alvo - hoje) / (1000 * 60 * 60 * 24));
}

function variacaoIndicador(tipo, atual, anterior) {
  const melhorQuando = INDICADORES_TIME[tipo].melhorQuando;
  const diff = atual - anterior;
  const pctBase = anterior === 0 ? 0 : (diff / anterior) * 100;
  const melhorou = melhorQuando === "menor" ? diff < 0 : diff > 0;
  return { diff, pct: Math.abs(pctBase).toFixed(1), melhorou, igual: diff === 0 };
}

function gerarId(prefixo) {
  return `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/* --------------------------------- ícones -------------------------------- */

const IconSeta = ({ melhorou, igual }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="seta-tendencia" aria-hidden="true">
    {igual ? (
      <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : melhorou ? (
      <path d="M2 9 L7 3 L12 9 M7 3 L7 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M2 5 L7 11 L12 5 M7 11 L7 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const ICONES_NAV = {
  inicio: <path d="M3 10.5 L12 4 L21 10.5 M5.5 9 V19 H18.5 V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  time: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5M13 19c.5-2.6 2.3-4.4 4.5-4.9M16 14.1c2 .4 3.5 2.1 4 4.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  rotina: <path d="M12 7v5l3.2 1.9M21 12a9 9 0 1 1-9-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  melhorias: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  agenda: <path d="M4 5.5h16v15H4v-15Zm0 4.5h16M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  feedback: <path d="M4 5h16v10H8l-4 4V5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  checklist: <path d="M5 4.5h14v15H5v-15Zm3.2 5 1.6 1.6 3-3.2M8.2 14.8l1.6 1.6 3-3.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
};

const ABAS = [
  { id: "inicio", rotulo: "Início" },
  { id: "time", rotulo: "Meu Time" },
  { id: "rotina", rotulo: "Minha Rotina" },
  { id: "melhorias", rotulo: "Melhorias" },
  { id: "agenda", rotulo: "Agenda" },
  { id: "feedback", rotulo: "Feedback" },
  { id: "checklist", rotulo: "Checklist de Atraso" },
];

/* ============================== COMPONENTES ============================== */

function KpiCard({ tipo }) {
  const d = INDICADORES_TIME[tipo];
  const v = variacaoIndicador(tipo, d.atual, d.anterior);
  const classe = v.igual ? "igual" : v.melhorou ? "melhorou" : "piorou";
  return (
    <div className="f30-card f30-kpi">
      <div className="f30-kpi-top">
        <span className="f30-kpi-label">{ROTULOS_INDICADOR[tipo]}</span>
      </div>
      <div className="f30-kpi-value">
        {d.atual}
        <span>{d.unidade}</span>
      </div>
      <div className={`f30-kpi-delta ${classe}`}>
        <IconSeta melhorou={v.melhorou} igual={v.igual} />
        {v.igual ? "estável" : `${v.pct}${d.unidade === "%" ? " pts" : d.unidade} vs. período anterior`}
      </div>
    </div>
  );
}

function TelaInicio({ colaboradores, melhorias, evolucoes, reconhecimentos, prioridadeDia, analise, setAnalise }) {
  const acoesEmAndamento = melhorias.filter((m) => m.status === "em_andamento");
  const acoesNoPrazo = acoesEmAndamento.filter((m) => diasAte(m.prazo) >= 0).length;
  const colaboradoresAcompanhamento = colaboradores.filter((c) => c.emAcompanhamento).length;
  const reconhecimentosSemana = reconhecimentos.filter((r) => diasAte(r.data) >= -7).length;

  function analisarSemana() {
    const pioras = Object.entries(INDICADORES_TIME).filter(([tipo, d]) => !variacaoIndicador(tipo, d.atual, d.anterior).melhorou && !variacaoIndicador(tipo, d.atual, d.anterior).igual);
    const melhoras = Object.entries(INDICADORES_TIME).filter(([tipo, d]) => variacaoIndicador(tipo, d.atual, d.anterior).melhorou);
    const acaoPositiva = melhorias.find((m) => m.status === "concluida" && m.resultado);
    const principalDesvio = pioras[0];

    let texto1 = melhoras.length
      ? `O time avançou em ${melhoras.map(([t]) => ROTULOS_INDICADOR[t]).join(" e ")} nesta janela, com destaque para a redução de retrabalho após a ação de confirmação por SMS.`
      : "Os indicadores do time se mantiveram estáveis nesta janela, sem grandes avanços nem retrocessos.";

    let texto2 = principalDesvio
      ? `O ponto de atenção é ${ROTULOS_INDICADOR[principalDesvio[0]]}, que piorou em relação ao período anterior — vale olhar mais de perto se é um caso pontual ou uma tendência.`
      : "Nenhum indicador piorou nesta janela.";

    let texto3 = acaoPositiva
      ? `A ação "${acaoPositiva.acao}" (${acaoPositiva.responsavel}) já mostrou resultado: ${acaoPositiva.resultado}.`
      : "Ainda não há uma ação concluída com resultado registrado nesta janela.";

    setAnalise({
      texto1,
      texto2,
      texto3,
      decisao: null,
    });
  }

  return (
    <>
      <div className="f30-prioridade">
        <div>
          <div className="f30-prioridade-eyebrow f30-mono">PRIORIDADE DO DIA</div>
          <h2>{prioridadeDia}</h2>
        </div>
      </div>

      <div className="f30-secao">
        <div className="f30-grid f30-grid-4">
          {Object.keys(INDICADORES_TIME).map((tipo) => (
            <KpiCard key={tipo} tipo={tipo} />
          ))}
        </div>
      </div>

      <div className="f30-secao f30-grid f30-grid-3">
        <div className="f30-card f30-resumo-item">
          <div>
            <div className="f30-resumo-num">{acoesNoPrazo} de {acoesEmAndamento.length}</div>
            <div className="f30-resumo-txt">ações em andamento no prazo</div>
          </div>
        </div>
        <div className="f30-card f30-resumo-item">
          <div>
            <div className="f30-resumo-num">{colaboradoresAcompanhamento}</div>
            <div className="f30-resumo-txt">colaboradores com acompanhamento previsto</div>
          </div>
        </div>
        <div className="f30-card f30-resumo-item">
          <div>
            <div className="f30-resumo-num">{reconhecimentosSemana}</div>
            <div className="f30-resumo-txt">reconhecimentos registrados na semana</div>
          </div>
        </div>
      </div>

      <div className="f30-secao f30-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="f30-secao-titulo" style={{ marginBottom: 2 }}>Analisar minha semana</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Um resumo gerado a partir dos seus dados registrados — a decisão final é sempre sua.</div>
          </div>
          <button className="f30-btn" onClick={analisarSemana}>Analisar minha semana</button>
        </div>

        {analise && (
          <div className="f30-analise-box">
            <h3>RESUMO — SEMANA ATUAL</h3>
            <p>{analise.texto1}</p>
            <p>{analise.texto2}</p>
            <p>{analise.texto3}</p>
            <p className="f30-analise-pergunta">Você quer manter a ação atual ou testar uma nova abordagem no próximo ciclo?</p>
            {!analise.decisao ? (
              <div className="f30-analise-opcoes">
                <button className="f30-btn pequeno" onClick={() => setAnalise({ ...analise, decisao: "manter" })}>Manter ação atual</button>
                <button className="f30-btn secundario pequeno" onClick={() => setAnalise({ ...analise, decisao: "testar" })}>Testar nova abordagem</button>
              </div>
            ) : (
              <div className="f30-analise-decisao">
                Decisão registrada: {analise.decisao === "manter" ? "manter a ação atual." : "testar uma nova abordagem no próximo ciclo."}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function CardColaborador({ colaborador, onAbrir, onRemover }) {
  return (
    <div className="f30-colab-card" onClick={() => onAbrir(colaborador)}>
      <div className="f30-colab-stub">
        <div className="f30-colab-avatar">{colaborador.iniciais}</div>
      </div>
      <div className="f30-colab-body">
        <div className="f30-colab-top">
          <div>
            <div className="f30-colab-nome">{colaborador.nome}</div>
            <div className="f30-colab-cargo">{colaborador.cargo}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {colaborador.emAcompanhamento && <span className="f30-badge-acomp">ACOMPANHAMENTO</span>}
            {onRemover && (
              <button
                type="button"
                className="f30-btn secundario pequeno"
                style={{ padding: "4px 8px", fontSize: 11, color: "var(--bad)", borderColor: "var(--bad-soft)" }}
                title="Remover colaborador"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(colaborador.id, colaborador.nome);
                }}
              >
                Remover
              </button>
            )}
          </div>
        </div>

        <div className="f30-colab-linha">
          {Object.entries(colaborador.indicadores).map(([tipo, valor]) => (
            <div className="f30-colab-mini-ind" key={tipo}>
              {ROTULOS_INDICADOR[tipo]}
              <b>{valor}{tipo === "tmo" ? "s" : "%"}</b>
            </div>
          ))}
          <div className="f30-colab-mini-ind">
            Reconhecimentos
            <b>{colaborador.reconhecimentos}</b>
          </div>
        </div>

        <div className="f30-colab-foco"><b>Foco atual:</b> {colaborador.focoDesenvolvimento}</div>

        <div className="f30-colab-footer">
          <span>Último combinado: {colaborador.ultimaConversa.proximoPasso}</span>
          <span className="f30-mono">{formatarData(colaborador.ultimaConversa.prazo)}</span>
        </div>
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
            <div className="f30-colab-cargo">{colaborador.cargo}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onRemover && (
              <button
                type="button"
                className="f30-btn secundario pequeno"
                style={{ color: "var(--bad)", borderColor: "var(--bad)" }}
                onClick={() => {
                  onRemover(colaborador.id, colaborador.nome);
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
            {Object.entries(colaborador.indicadores).map(([tipo, valor]) => (
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
            <div className="f30-mel-field"><label>Pontos fortes</label><p>{colaborador.pontosFortes.join(" · ")}</p></div>
            <div className="f30-mel-field" style={{ marginTop: 10 }}><label>Foco de desenvolvimento</label><p>{colaborador.focoDesenvolvimento}</p></div>
          </div>
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Última conversa</div>
          <div className="f30-card">
            <div className="f30-mel-field"><label>Data</label><p className="f30-mono">{formatarData(colaborador.ultimaConversa.data)}</p></div>
            <div className="f30-mel-field" style={{ marginTop: 10 }}><label>Resumo</label><p>{colaborador.ultimaConversa.resumo}</p></div>
            <div className="f30-mel-field" style={{ marginTop: 10 }}><label>Próximo passo combinado</label><p>{colaborador.ultimaConversa.proximoPasso} — prazo {formatarData(colaborador.ultimaConversa.prazo)}</p></div>
          </div>
        </div>

        <div className="f30-secao">
          <div className="f30-secao-titulo">Reconhecimentos ({reconhecimentosDele.length})</div>
          {reconhecimentosDele.length ? reconhecimentosDele.map((r) => (
            <div className="f30-card" key={r.id} style={{ marginBottom: 8 }}>
              <div className="f30-feed-meta">{formatarData(r.data)}</div>
              <div style={{ fontSize: 13.5 }}>{r.descricao}</div>
            </div>
          )) : <div className="f30-vazio">Nenhum reconhecimento registrado ainda.</div>}
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

function FormColaborador({ onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: "",
    cargo: "Atendente de Relacionamento",
    pontosFortes: "",
    focoDesenvolvimento: "",
    tmo: 320,
    fcr: 85,
    qualidade: 90,
    retrabalho: 4,
    emAcompanhamento: true,
    proximoPasso: "Acompanhamento inicial de rotina.",
    prazo: obterDataHojeISO(),
  });

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function enviar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    const partes = form.nome.trim().split(/\s+/);
    const iniciais =
      partes.length >= 2
        ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
        : form.nome.trim().slice(0, 2).toUpperCase();

    const novo = {
      id: gerarId("c"),
      nome: form.nome.trim(),
      cargo: form.cargo.trim() || "Atendente de Relacionamento",
      iniciais,
      pontosFortes: form.pontosFortes
        ? form.pontosFortes.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Comprometimento"],
      focoDesenvolvimento: form.focoDesenvolvimento.trim() || "Evolução contínua de indicadores",
      indicadores: {
        tmo: Number(form.tmo) || 320,
        fcr: Number(form.fcr) || 85,
        qualidade: Number(form.qualidade) || 90,
        retrabalho: Number(form.retrabalho) || 4,
      },
      reconhecimentos: 0,
      emAcompanhamento: Boolean(form.emAcompanhamento),
      ultimaConversa: {
        data: obterDataHojeISO(),
        resumo: "Cadastro inicial no time.",
        proximoPasso: form.proximoPasso.trim() || "Realizar 1:1 de boas-vindas.",
        prazo: form.prazo || obterDataHojeISO(),
      },
    };
    onSalvar(novo);
  }

  return (
    <form className="f30-card f30-form" style={{ marginBottom: 18 }} onSubmit={enviar}>
      <div className="f30-secao-titulo">Adicionar novo colaborador</div>
      <div className="f30-grid f30-grid-2">
        <div>
          <label>Nome completo</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex.: Lucas Martins"
            required
          />
        </div>
        <div>
          <label>Cargo</label>
          <input
            type="text"
            value={form.cargo}
            onChange={(e) => atualizar("cargo", e.target.value)}
            placeholder="Ex.: Atendente de Relacionamento"
          />
        </div>
      </div>

      <div className="f30-grid f30-grid-2">
        <div>
          <label>Pontos fortes (separados por vírgula)</label>
          <input
            type="text"
            value={form.pontosFortes}
            onChange={(e) => atualizar("pontosFortes", e.target.value)}
            placeholder="Ex.: Agilidade, Boa comunicação"
          />
        </div>
        <div>
          <label>Foco de desenvolvimento</label>
          <input
            type="text"
            value={form.focoDesenvolvimento}
            onChange={(e) => atualizar("focoDesenvolvimento", e.target.value)}
            placeholder="Ex.: Reduzir TMO em check-in"
          />
        </div>
      </div>

      <div className="f30-grid f30-grid-4" style={{ marginTop: 8 }}>
        <div>
          <label>TMO (s)</label>
          <input type="text" value={form.tmo} onChange={(e) => atualizar("tmo", e.target.value)} />
        </div>
        <div>
          <label>FCR (%)</label>
          <input type="text" value={form.fcr} onChange={(e) => atualizar("fcr", e.target.value)} />
        </div>
        <div>
          <label>Qualidade (%)</label>
          <input type="text" value={form.qualidade} onChange={(e) => atualizar("qualidade", e.target.value)} />
        </div>
        <div>
          <label>Retrabalho (%)</label>
          <input type="text" value={form.retrabalho} onChange={(e) => atualizar("retrabalho", e.target.value)} />
        </div>
      </div>

      <div className="f30-grid f30-grid-2" style={{ marginTop: 8 }}>
        <div>
          <label>Próximo passo combinado</label>
          <input
            type="text"
            value={form.proximoPasso}
            onChange={(e) => atualizar("proximoPasso", e.target.value)}
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

function TelaTime({ colaboradores, feedbacks, checklists, reconhecimentos, onAdicionarColaborador, onRemoverColaborador }) {
  const [selecionado, setSelecionado] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Gerencie os integrantes da sua equipe ({colaboradores.length} colaboradores ativos).
        </div>
        <button className="f30-btn" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "Fechar formulário" : "+ Adicionar colaborador"}
        </button>
      </div>

      {mostrarForm && (
        <FormColaborador
          onCancelar={() => setMostrarForm(false)}
          onSalvar={(novo) => {
            onAdicionarColaborador(novo);
            setMostrarForm(false);
          }}
        />
      )}

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

function TelaRotina({ itens, onAlternarStatus }) {
  return (
    <div className="f30-grid f30-grid-3">
      {["hoje", "semana", "mes"].map((bloco) => (
        <div className="f30-rotina-bloco" key={bloco}>
          <h3>{NOMES_BLOCO[bloco]}</h3>
          {itens[bloco].map((item) => (
            <div className="f30-rotina-item" key={item.id} onClick={() => onAlternarStatus(bloco, item.id)}>
              <div className={`f30-status-dot ${item.status}`} />
              <div className={`f30-rotina-texto ${item.status === "concluido" ? "concluido" : ""}`}>{item.texto}</div>
              <div className="f30-rotina-tag">{NOMES_STATUS_ITEM[item.status]}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FormMelhoria({ colaboradores, onSalvar, onCancelar }) {
  const [form, setForm] = useState({ problema: "", causa: "", acao: "", responsavel: colaboradores[0]?.nome || "", prazo: "" });
  function atualizar(campo, valor) { setForm({ ...form, [campo]: valor }); }
  function enviar() {
    if (!form.problema || !form.acao) return;
    onSalvar(form);
  }
  return (
    <div className="f30-card f30-form" style={{ marginBottom: 18 }}>
      <div className="f30-secao-titulo">Novo registro de melhoria</div>
      <label>Problema</label>
      <input type="text" value={form.problema} onChange={(e) => atualizar("problema", e.target.value)} placeholder="Qual gargalo foi identificado?" />
      <label>Causa</label>
      <input type="text" value={form.causa} onChange={(e) => atualizar("causa", e.target.value)} placeholder="Por que isso acontece?" />
      <label>Ação</label>
      <input type="text" value={form.acao} onChange={(e) => atualizar("acao", e.target.value)} placeholder="O que será feito?" />
      <label>Responsável</label>
      <select value={form.responsavel} onChange={(e) => atualizar("responsavel", e.target.value)}>
        {colaboradores.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
      </select>
      <label>Prazo</label>
      <input type="date" value={form.prazo} onChange={(e) => atualizar("prazo", e.target.value)} />
      <div className="f30-form-actions">
        <button className="f30-btn" onClick={enviar}>Salvar registro</button>
        <button className="f30-btn secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </div>
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

      {melhorias.map((m) => (
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
            <div className="f30-mel-field"><label>Causa</label><p>{m.causa}</p></div>
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
      ))}
    </>
  );
}

function TelaAgenda({ agenda, evolucoes, onEnviarEvolucao, onAdicionarCompromisso, onRemoverCompromisso, onRemoverEvolucao }) {
  const [texto, setTexto] = useState("");
  const [periodo, setPeriodo] = useState("esta_semana");
  const [mostrarFormAgenda, setMostrarFormAgenda] = useState(false);
  const [novoCompromisso, setNovoCompromisso] = useState({ titulo: "", data: obterDataHojeISO(), hora: "10:00" });

  const agendaOrdenada = [...agenda].sort((a, b) => new Date(a.data) - new Date(b.data));

  function enviar() {
    if (!texto.trim()) return;
    onEnviarEvolucao(texto, periodo);
    setTexto("");
  }

  function salvarCompromisso(e) {
    e.preventDefault();
    if (!novoCompromisso.titulo.trim()) return;
    onAdicionarCompromisso(novoCompromisso);
    setNovoCompromisso({ titulo: "", data: obterDataHojeISO(), hora: "10:00" });
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
              placeholder="Ex.: 1:1 — Renata Aquino"
              required
            />
            <div className="f30-grid f30-grid-2">
              <div>
                <label>Data</label>
                <input
                  type="date"
                  value={novoCompromisso.data}
                  onChange={(e) => setNovoCompromisso({ ...novoCompromisso, data: e.target.value })}
                />
              </div>
              <div>
                <label>Hora</label>
                <input
                  type="text"
                  value={novoCompromisso.hora}
                  onChange={(e) => setNovoCompromisso({ ...novoCompromisso, hora: e.target.value })}
                  placeholder="09:00"
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
        <div className="f30-secao-titulo">Enviar evolução para a coordenadora</div>
        <div className="f30-card f30-form">
          <label>Período de referência</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="esta_semana">Esta semana</option>
            <option value="este_mes">Este mês</option>
          </select>
          <label>O que você quer contar sobre a evolução do time?</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva livremente sobre indicadores, ações e destaques do período..." />
          <div className="f30-form-actions">
            <button className="f30-btn" onClick={enviar}>Enviar atualização</button>
          </div>
        </div>

        <div className="f30-secao-titulo" style={{ marginTop: 22 }}>Histórico enviado</div>
        {evolucoes.length ? [...evolucoes].reverse().map((e) => (
          <div className="f30-card" key={e.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div className="f30-feed-meta" style={{ margin: 0 }}>{e.periodo === "esta_semana" ? "Esta semana" : "Este mês"} · {formatarData(e.data)} · {e.status === "enviado" ? "Enviado" : "Lido"}</div>
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
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id);
  const [texto, setTexto] = useState("");
  const [respostas, setRespostas] = useState({});

  const temAcessoTotal = papel === "gestor" || papel === "coordenador";
  const listaVisivel = temAcessoTotal ? colaboradores : colaboradores.filter((c) => c.id === colaboradorLogadoId);
  const feedbacksDoColaborador = feedbacks.filter((f) => f.colaboradorId === (temAcessoTotal ? colaboradorId : colaboradorLogadoId));

  function enviar() {
    if (!texto.trim()) return;
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
      {temAcessoTotal && (
        <div>
          <div className="f30-secao-titulo">Novo feedback</div>
          <div className="f30-card f30-form">
            <label>Colaborador</label>
            <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
              {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <label>Feedback</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva o feedback logo após a conversa, enquanto está fresco..." />
            <div className="f30-form-actions">
              <button className="f30-btn" onClick={enviar}>Enviar feedback</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="f30-secao-titulo">
          {temAcessoTotal ? `Linha do tempo — ${colaboradores.find((c) => c.id === colaboradorId)?.nome}` : "Meus feedbacks"}
        </div>
        {feedbacksDoColaborador.length ? [...feedbacksDoColaborador].reverse().map((f) => (
          <div className="f30-feed-item" key={f.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div className="f30-feed-meta" style={{ margin: 0 }}>{f.autor} · {formatarData(f.data)}</div>
              {temAcessoTotal && onRemoverFeedback && (
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
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id);
  const [data, setData] = useState(obterDataHojeISO());
  const [motivos, setMotivos] = useState([]);
  const [observacao, setObservacao] = useState("");
  const [filtroColaborador, setFiltroColaborador] = useState("todos");

  function alternarMotivo(m) {
    setMotivos(motivos.includes(m) ? motivos.filter((x) => x !== m) : [...motivos, m]);
  }

  function registrar() {
    if (!motivos.length) return;
    onRegistrar({ colaboradorId, data, motivos, observacao });
    setMotivos([]);
    setObservacao("");
  }

  const listaFiltrada = filtroColaborador === "todos" ? checklists : checklists.filter((c) => c.colaboradorId === filtroColaborador);
  const listaOrdenada = [...listaFiltrada].sort((a, b) => new Date(b.data) - new Date(a.data));

  function nomeColaborador(id) { return colaboradores.find((c) => c.id === id)?.nome || "—"; }

  return (
    <div className="f30-grid f30-grid-2">
      <div>
        <div className="f30-secao-titulo">Registrar atraso</div>
        <div className="f30-card f30-form">
          <label>Colaborador</label>
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
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
            <option value="todos">Todos os colaboradores</option>
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

/* ================================== APP ================================== */

export default function App() {
  const { usuario, perfilUsuario, sair } = useAuth();
  const [aba, setAba] = useState("inicio");
  const papel = perfilUsuario || "gestor";
  const [colaboradorLogadoId, setColaboradorLogadoId] = useState("c1");

  const [colaboradores, setColaboradores] = useState(COLABORADORES_INICIAIS);
  const [itensRotina, setItensRotina] = useState(ITENS_ROTINA_INICIAIS);
  const [melhorias, setMelhorias] = useState(MELHORIAS_INICIAIS);
  const [reconhecimentos, setReconhecimentos] = useState(RECONHECIMENTOS_INICIAIS);
  const [agenda, setAgenda] = useState(AGENDA_INICIAL);
  const [evolucoes, setEvolucoes] = useState(EVOLUCOES_INICIAIS);
  const [feedbacks, setFeedbacks] = useState(FEEDBACKS_INICIAIS);
  const [checklists, setChecklists] = useState(CHECKLIST_ATRASO_INICIAL);
  const [analise, setAnalise] = useState(null);
  const [toast, setToast] = useState(null);
  const [firestoreOnline, setFirestoreOnline] = useState(false);

  // Sincronização em tempo real com o Firestore
  useEffect(() => {
    if (!db || !usuario || !usuario.emailVerified) return;
    const docRef = doc(db, "front30", "estado_time");
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        setFirestoreOnline(true);
        if (snap.exists()) {
          const dados = snap.data();
          if (dados.colaboradores) setColaboradores(dados.colaboradores);
          if (dados.itensRotina) setItensRotina(dados.itensRotina);
          if (dados.melhorias) setMelhorias(dados.melhorias);
          if (dados.reconhecimentos) setReconhecimentos(dados.reconhecimentos);
          if (dados.agenda) setAgenda(dados.agenda);
          if (dados.evolucoes) setEvolucoes(dados.evolucoes);
          if (dados.feedbacks) setFeedbacks(dados.feedbacks);
          if (dados.checklists) setChecklists(dados.checklists);
        } else {
          // Inicializa o documento no Firestore na primeira vez com os dados iniciais
          setDoc(docRef, {
            colaboradores: COLABORADORES_INICIAIS,
            itensRotina: ITENS_ROTINA_INICIAIS,
            melhorias: MELHORIAS_INICIAIS,
            reconhecimentos: RECONHECIMENTOS_INICIAIS,
            agenda: AGENDA_INICIAL,
            evolucoes: EVOLUCOES_INICIAIS,
            feedbacks: FEEDBACKS_INICIAIS,
            checklists: CHECKLIST_ATRASO_INICIAL,
          }, { merge: true }).catch(() => {});
        }
      },
      (err) => {
        console.warn("Aviso Firestore:", err.code, err.message);
        setFirestoreOnline(false);
        if (err.code === "permission-denied") {
          mostrarToast("Permissão negada no Firestore: verifique as Rules do projeto no Firebase Console.");
        }
      }
    );
    return () => unsubscribe();
  }, [usuario]);

  async function salvarNoFirestore(novosDados) {
    if (!db || !usuario) return;
    try {
      const docRef = doc(db, "front30", "estado_time");
      await setDoc(docRef, novosDados, { merge: true });
      setFirestoreOnline(true);
    } catch (e) {
      console.warn("Erro ao salvar no Firestore:", e);
      if (e?.code === "permission-denied") {
        mostrarToast("Permissão negada (permission-denied): publique as regras no Firebase Console.");
      } else {
        mostrarToast("Erro ao sincronizar alteração com o servidor.");
      }
    }
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function adicionarColaborador(novoColaborador) {
    setColaboradores((prev) => {
      const atualizado = [novoColaborador, ...prev];
      salvarNoFirestore({ colaboradores: atualizado });
      return atualizado;
    });
    mostrarToast(`Colaborador ${novoColaborador.nome} adicionado ao time.`);
  }

  function removerColaborador(id, nome) {
    setColaboradores((prev) => {
      const atualizado = prev.filter((c) => c.id !== id);
      salvarNoFirestore({ colaboradores: atualizado });
      return atualizado;
    });
    mostrarToast(`Colaborador ${nome || ""} removido.`);
  }

  function alternarStatusItem(bloco, id) {
    setItensRotina((prev) => {
      const atualizado = {
        ...prev,
        [bloco]: prev[bloco].map((item) => (item.id === id ? { ...item, status: PROX_STATUS[item.status] } : item)),
      };
      salvarNoFirestore({ itensRotina: atualizado });
      return atualizado;
    });
  }

  function adicionarMelhoria(form) {
    const nova = {
      id: gerarId("mel"),
      problema: form.problema,
      causa: form.causa,
      acao: form.acao,
      responsavel: form.responsavel,
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
    mostrarToast("Registro de melhoria criado.");
  }

  function concluirMelhoria(id, resultado, aprendizado) {
    setMelhorias((prev) => {
      const atualizado = prev.map((m) => (m.id === id ? { ...m, resultado, aprendizado, status: "concluida" } : m));
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
    mostrarToast("Registro de melhoria removido.");
  }

  function adicionarCompromisso(dados) {
    const novo = { id: gerarId("ag"), ...dados };
    setAgenda((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ agenda: atualizado });
      return atualizado;
    });
    mostrarToast("Compromisso agendado.");
  }

  function removerCompromisso(id) {
    setAgenda((prev) => {
      const atualizado = prev.filter((a) => a.id !== id);
      salvarNoFirestore({ agenda: atualizado });
      return atualizado;
    });
    mostrarToast("Compromisso removido da agenda.");
  }

  function enviarEvolucao(texto, periodo) {
    const nova = { id: gerarId("ev"), periodo, texto, data: obterDataHojeISO(), status: "enviado" };
    setEvolucoes((prev) => {
      const atualizado = [...prev, nova];
      salvarNoFirestore({ evolucoes: atualizado });
      return atualizado;
    });
    mostrarToast("Evolução enviada para a coordenadora.");
  }

  function removerEvolucao(id) {
    setEvolucoes((prev) => {
      const atualizado = prev.filter((e) => e.id !== id);
      salvarNoFirestore({ evolucoes: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de evolução removido.");
  }

  function enviarFeedback(colaboradorId, texto) {
    const novo = { id: gerarId("f"), colaboradorId, autor: "Você (gestora)", texto, data: obterDataHojeISO(), resposta: null };
    setFeedbacks((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Feedback enviado.");
  }

  function removerFeedback(id) {
    setFeedbacks((prev) => {
      const atualizado = prev.filter((f) => f.id !== id);
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Feedback removido.");
  }

  function responderFeedback(feedbackId, texto) {
    const colab = colaboradores.find((c) => c.id === colaboradorLogadoId);
    setFeedbacks((prev) => {
      const atualizado = prev.map((f) => (f.id === feedbackId ? { ...f, resposta: { texto, autor: colab?.nome || "Colaborador", data: obterDataHojeISO() } } : f));
      salvarNoFirestore({ feedbacks: atualizado });
      return atualizado;
    });
    mostrarToast("Resposta enviada.");
  }

  function registrarAtraso(dados) {
    const novo = { id: gerarId("ch"), ...dados };
    setChecklists((prev) => {
      const atualizado = [...prev, novo];
      salvarNoFirestore({ checklists: atualizado });
      return atualizado;
    });
    mostrarToast("Atraso registrado.");
  }

  function removerAtraso(id) {
    setChecklists((prev) => {
      const atualizado = prev.filter((c) => c.id !== id);
      salvarNoFirestore({ checklists: atualizado });
      return atualizado;
    });
    mostrarToast("Registro de atraso removido.");
  }

  const prioridadeDia = "Fechar o piloto de confirmação de endereço com o Diego antes de escalar para o resto do time.";

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
        <nav className="f30-nav">
          {ABAS.map((a) => (
            <button key={a.id} className={`f30-nav-item ${aba === a.id ? "ativo" : ""}`} onClick={() => setAba(a.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24">{ICONES_NAV[a.id]}</svg>
              {a.rotulo}
            </button>
          ))}
        </nav>
        <div className="f30-conta">
          <span className="f30-conta-email" title={usuario?.email}>{usuario?.email}</span>
          <button className="f30-btn secundario pequeno" onClick={sair}>Sair</button>
        </div>
      </aside>

      <main className="f30-main">
        <div className="f30-header">
          <div>
            <h1>{ABAS.find((a) => a.id === aba)?.rotulo}</h1>
            <p>
              {papel === "coordenador"
                ? "Visão da coordenação geral — acompanhamento estratégico e acesso total"
                : papel === "gestor"
                ? "Visão da gestora — acesso completo ao time"
                : "Visão do colaborador — apenas seus próprios dados"}
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
                background: firestoreOnline ? "#dcfce7" : "#fef3c7",
                color: firestoreOnline ? "#166534" : "#92400e",
                border: firestoreOnline ? "1px solid #bbf7d0" : "1px solid #fde68a",
              }}
            >
              {firestoreOnline ? "● FIRESTORE ONLINE" : "○ SINCRONIZANDO..."}
            </span>
            <div className="f30-date-stub">{obterDataCabecalho()}</div>
          </div>
        </div>

        {aba === "inicio" && (
          <TelaInicio
            colaboradores={colaboradores}
            melhorias={melhorias}
            evolucoes={evolucoes}
            reconhecimentos={reconhecimentos}
            prioridadeDia={prioridadeDia}
            analise={analise}
            setAnalise={setAnalise}
          />
        )}

        {aba === "time" && (
          papel === "gestor" || papel === "coordenador" ? (
            <TelaTime
              colaboradores={colaboradores}
              feedbacks={feedbacks}
              checklists={checklists}
              reconhecimentos={reconhecimentos}
              onAdicionarColaborador={adicionarColaborador}
              onRemoverColaborador={removerColaborador}
            />
          ) : (
            <div className="f30-vazio">Esta tela é exclusiva do perfil de gestão/coordenação. Veja seus dados em Feedback e Checklist de Atraso.</div>
          )
        )}

        {aba === "rotina" && <TelaRotina itens={itensRotina} onAlternarStatus={alternarStatusItem} />}

        {aba === "melhorias" && (
          <TelaMelhorias
            melhorias={melhorias}
            colaboradores={colaboradores}
            onAdicionar={adicionarMelhoria}
            onConcluir={concluirMelhoria}
            onRemover={removerMelhoria}
          />
        )}

        {aba === "agenda" && (
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
            colaboradores={colaboradores}
            feedbacks={feedbacks}
            onEnviarFeedback={enviarFeedback}
            onResponder={responderFeedback}
            onRemoverFeedback={removerFeedback}
            papel={papel}
            colaboradorLogadoId={colaboradorLogadoId}
          />
        )}

        {aba === "checklist" && (
          papel === "gestor" || papel === "coordenador" ? (
            <TelaChecklistAtraso
              colaboradores={colaboradores}
              checklists={checklists}
              onRegistrar={registrarAtraso}
              onRemoverAtraso={removerAtraso}
            />
          ) : (
            <div className="f30-vazio">Esta tela é exclusiva do perfil de gestão/coordenação.</div>
          )
        )}
      </main>

      {toast && <div className="f30-toast">{toast}</div>}
    </div>
  );
}
