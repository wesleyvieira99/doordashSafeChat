import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Download,
} from "lucide-react";
import { diagrams } from "../data/diagrams";
import type { Locale } from "../data/content";
export function Architecture({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [id, setId] = useState(diagrams[0].id),
    [zoom, setZoom] = useState(1);
  const d = diagrams.find((x) => x.id === id) ?? diagrams[0];
  const src = import.meta.env.BASE_URL + d.src[lang];
  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">04 / {t("SISTEMAS", "SYSTEMS")}</span>
        <h1>{t("Clareza em cada conexão.", "Clarity in every connection.")}</h1>
        <p>
          {t(
            "De uma interação humana ao contrato entre componentes. Dez vistas do mesmo raciocínio.",
            "From a human interaction to the contract between components. Ten views of the same reasoning.",
          )}
        </p>
      </div>
      <div className="diagram-tabs">
        {diagrams.map((x, i) => (
          <button
            key={x.id}
            className={x.id === id ? "active" : ""}
            onClick={() => {
              setId(x.id);
              setZoom(1);
            }}
          >
            <small>{String(i + 1).padStart(2, "0")}</small>
            {x.title[lang]}
          </button>
        ))}
      </div>
      <section className="panel diagram-panel">
        <div className="diagram-toolbar">
          <div>
            <span
              className={`badge ${d.status === "implemented" ? "green" : ""}`}
            >
              {d.status === "implemented"
                ? t("Laboratório implementado", "Implemented laboratory")
                : t("Desenho proposto", "Proposed design")}
            </span>
            <h2>{d.title[lang]}</h2>
          </div>
          <div className="toolbar-actions">
            <button
              aria-label={t("Diminuir zoom", "Zoom out")}
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <ZoomOut size={18} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              aria-label={t("Aumentar zoom", "Zoom in")}
              onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
            >
              <ZoomIn size={18} />
            </button>
            <button
              aria-label={t("Restaurar zoom", "Reset zoom")}
              onClick={() => setZoom(1)}
            >
              <RotateCcw size={17} />
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              aria-label={t("Abrir SVG", "Open SVG")}
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
        <p>{d.description[lang]}</p>
        <div
          className="diagram-viewport"
          tabIndex={0}
          aria-label={t(
            "Diagrama com rolagem e zoom",
            "Scrollable diagram with zoom",
          )}
        >
          <img
            src={src}
            alt={d.description[lang]}
            style={{ width: `${zoom * 100}%`, minWidth: `${zoom * 680}px` }}
          />
        </div>
        <details className="disclosure">
          <summary>
            {t("Versão textual acessível", "Accessible text version")}
          </summary>
          <p>{d.text[lang]}</p>
        </details>
      </section>
      <div className="two-col">
        <article className="editorial-note">
          <b>{t("O que já executa", "What already runs")}</b>
          <p>
            {t(
              "O navegador valida a mensagem, aplica regras sintéticas, consulta a política, recomenda uma ação e mostra o envelope de auditoria. O backend local e o servidor MCP podem ser executados separadamente.",
              "The browser validates the message, applies synthetic rules, retrieves policy, recommends an action and displays the audit envelope. The local backend and MCP server can run separately.",
            )}
          </p>
        </article>
        <article className="editorial-note">
          <b>
            {t("O que exige um ambiente real", "What needs a real environment")}
          </b>
          <p>
            {t(
              "Identidade de produção, autorização por caso, modelos reais, armazenamento governado, integração operacional e revisão humana não são serviços em execução no GitHub Pages.",
              "Production identity, case-scoped authorization, real models, governed storage, operational integration and human review are not running services on GitHub Pages.",
            )}
          </p>
        </article>
      </div>
      <section className="panel" aria-labelledby="ai-flow-title">
        <span className="badge">{t("Evolução proposta", "Proposed evolution")}</span>
        <h2 id="ai-flow-title">
          {t("RAG e LLM: da evidência à decisão.", "RAG and LLMs: from evidence to decision.")}
        </h2>
        <p>
          {t(
            "“Recebi uma mensagem dizendo: vou te machucar.” Um relato de ameaça exige contexto. Eu começaria com um fluxo em duas etapas: recuperar evidência pertinente e depois gerar um parecer limitado, preservando a política e a revisão humana como controles da decisão.",
            "“I received a message saying: I will hurt you.” A threat report needs context. I would start with a two-step flow: retrieve relevant evidence, then generate bounded advice, keeping policy and human review as decision controls.",
          )}
        </p>
        <div className="numbered-list">
          {[
            {
              title: t("Contexto mínimo", "Minimum context"),
              body: t(
                "Receber a mensagem e uma janela limitada de conversa, com papéis dos participantes e idioma. Minimizar dados pessoais; tratar mensagens e documentos recuperados como dados não confiáveis, nunca como instruções para mudar a política.",
                "Receive the message and a bounded conversation window, with participant roles and language. Minimize personal data; treat messages and retrieved documents as untrusted data, never as instructions to change policy.",
              ),
            },
            {
              title: t("Evidência antes da geração · RAG", "Evidence before generation · RAG"),
              body: t(
                "Buscar somente políticas autorizadas e vigentes para aquele caso e idioma. Fixar fonte e versão, selecionar poucos trechos relevantes e encaminhar ausência ou conflito de evidência para revisão. RAG combina recuperação e geração; não exige um banco vetorial. Embeddings só entrariam se melhorassem a recuperação medida.",
                "Retrieve only policies authorized and effective for that case and language. Pin source and version, select a few relevant passages, and refer missing or conflicting evidence for review. RAG combines retrieval and generation; it does not require a vector database. Embeddings would be added only if they improve measured retrieval quality.",
              ),
            },
            {
              title: t("Parecer estruturado · LLM", "Structured advice · LLM"),
              body: t(
                "Propor categoria, justificativa curta, referências aos trechos e necessidade de revisão. Validar schema e correspondência das referências; nenhum desses testes comprova que a conclusão está correta. Prazo e tentativas são limitados. Evidência insuficiente ou falha do modelo vira um estado explícito, conforme a política de contingência.",
                "Propose a category, short rationale, passage references and review requirement. Validate the schema and that references match the retrieved evidence; neither check proves the conclusion is correct. Deadlines and retries are bounded. Insufficient evidence or model failure becomes an explicit state under the fallback policy.",
              ),
            },
            {
              title: t("Decisão e revisão", "Decision and review"),
              body: t(
                "Um controle de política fora do modelo determina quais recomendações são permitidas. Ações reais exigiriam autorização específica e idempotência no sistema que aplica o efeito. Casos ambíguos ou graves seguiriam o fluxo de revisão aprovado, com capacidade, prazo, contestação e registro mínimo definidos.",
                "A policy gate outside the model determines permitted recommendations. Real actions would require scoped authorization and idempotency at the system applying the effect. Ambiguous or severe cases would follow an approved review flow with defined capacity, deadlines, appeals and minimum records.",
              ),
            },
          ].map((step, index) => (
            <div key={index}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p><strong>{step.title}</strong><br />{step.body}</p>
            </div>
          ))}
        </div>
        <details className="disclosure">
          <summary>{t("Onde entram LangChain, LangGraph e MCP", "Where LangChain, LangGraph and MCP fit")}</summary>
          <p>
            <strong>LangChain.</strong>{" "}
            {t(
              "Poderia padronizar retrievers, adaptadores de modelo e saída estruturada. O fluxo começaria com recuperação obrigatória antes de uma chamada de parecer, em vez de deixar o modelo explorar ferramentas sem limite. A biblioteca não substitui autorização nem garante a qualidade da resposta.",
              "Could standardize retrievers, model adapters and structured output. The flow would begin with required retrieval before one advisory call, rather than unrestricted model-driven tool exploration. The library does not replace authorization or guarantee answer quality.",
            )}
          </p>
          <p>
            <strong>LangGraph.</strong>{" "}
            {t(
              "Seria útil se ramificações, retomada após falhas ou espera por revisão justificassem um workflow com estado. Uma pausa humana durável exige checkpointer persistente, identidade do caso e autorização para retomar; esses controles não aparecem automaticamente ao adicionar o framework.",
              "Would be useful if branching, failure recovery or review waits justify a stateful workflow. A durable human pause needs a persistent checkpointer, case identity and authorization to resume; adding the framework does not automatically provide those controls.",
            )}
          </p>
          <p>
            <strong>MCP.</strong>{" "}
            {t(
              "Já existe um servidor local com search_policies, list_cases e get_case_preview, todos somente leitura. Ele padroniza descoberta e chamada; permissões continuam no servidor. O navegador demonstra funções equivalentes localmente e não abre esse processo. O adaptador LLM atual não chama ferramentas MCP.",
              "A local server already provides search_policies, list_cases and get_case_preview, all read-only. It standardizes discovery and invocation; permissions remain a server responsibility. The browser demonstrates equivalent functions locally and does not launch this process. The current LLM adapter does not call MCP tools.",
            )}
          </p>
        </details>
        <details className="disclosure">
          <summary>{t("O que está implementado e o que falta validar", "What is implemented and what remains to validate")}</summary>
          <p>
            <strong>{t("Hoje. ", "Today. ")}</strong>
            {t(
              "Regras determinísticas no portal, busca lexical em seis políticas fictícias versionadas e MCP local somente leitura. O backend tem /advisory opcional para Ollama local, desligado por padrão e separado da moderação: categoria, resumo e needsReview; sem referências recuperadas ou poder de ação. Foi testado com respostas simuladas, sem executar um modelo real.",
              "Deterministic portal rules, lexical retrieval over six fictional versioned policies and local read-only MCP. The backend has an optional local Ollama /advisory route, off by default and separate from moderation: category, summary and needsReview; no retrieved references or action authority. It was tested with mocked responses, without running a real model.",
            )}
          </p>
          <p>
            <strong>{t("Próximos critérios. ", "Next acceptance criteria. ")}</strong>
            {t(
              "Medir recuperação da política correta e vazamento entre escopos; avaliar fundamentação e erros por idioma e gravidade com referência humana; testar política vencida, injeção, timeout e fila saturada. Medir latência p95 real, custo por caso e carga de revisão. Só avançar de avaliação offline para shadow e canário com critérios de parada e rollback acordados. Os 18 exemplos sintéticos atuais são regressão, não prova de eficácia em produção.",
              "Measure correct-policy retrieval and cross-scope leakage; evaluate groundedness and errors by language and severity against human labels; test expired policy, injection, timeout and review backlog. Measure actual p95 latency, cost per case and reviewer load. Advance from offline evaluation to shadow and canary only with agreed stop and rollback criteria. The current 18 synthetic cases are regression checks, not evidence of production efficacy.",
            )}
          </p>
        </details>
        <p>
          {t("Documentação de referência: ", "Reference documentation: ")}
          <a href="https://docs.langchain.com/oss/python/deepagents/retrieval" target="_blank" rel="noreferrer">RAG</a>
          {" · "}
          <a href="https://docs.langchain.com/oss/python/langchain/structured-output" target="_blank" rel="noreferrer">{t("saída estruturada", "structured output")}</a>
          {" · "}
          <a href="https://docs.langchain.com/oss/python/langgraph/workflows-agents" target="_blank" rel="noreferrer">LangGraph</a>
          {" · "}
          <a href="https://docs.langchain.com/oss/python/langgraph/interrupts" target="_blank" rel="noreferrer">{t("pausas e retomada", "interrupts and resumption")}</a>.
        </p>
      </section>
    </>
  );
}
