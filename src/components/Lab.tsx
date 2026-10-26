import { useEffect, useState } from "react";
import {
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  ShieldCheck,
  TriangleAlert,
  Code2,
  Search,
  Terminal,
  Download,
  Activity,
} from "lucide-react";
import {
  moderate,
  scenarios,
  retrievePolicy,
  toolDefinitions,
  callTool,
  InputError,
  type ModerationResult,
} from "../lib/engine";
import { capacityModel } from "../lib/economics";
import type { Locale } from "../data/content";
export function Lab({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [tab, setTab] = useState("context");
  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">03 / {t("EXPERIMENTAR", "EXPERIMENT")}</span>
        <h1>{t("O raciocínio, em movimento.", "Reasoning, in motion.")}</h1>
        <p>
          {t(
            "Três experimentos pequenos. Decisões que você pode inspecionar.",
            "Three small experiments. Decisions you can inspect.",
          )}
        </p>
      </div>
      <div className="notice">
        <ShieldCheck size={18} />
        {t(
          "Laboratório independente. Dados sintéticos, regras determinísticas e custos/latências simulados. Nenhuma mensagem é enviada a um modelo.",
          "Independent laboratory. Synthetic data, deterministic rules and simulated costs/latencies. No message is sent to a model.",
        )}
      </div>
      <div className="segmented tabs-three">
        {[
          ["context", t("01 · Contexto", "01 · Context")],
          ["capacity", t("02 · Capacidade", "02 · Capacity")],
          ["policy", t("03 · Evidência", "03 · Evidence")],
        ].map(([id, label]) => (
          <button
            aria-pressed={tab === id}
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "context" ? (
        <Moderation lang={lang} />
      ) : tab === "capacity" ? (
        <Capacity lang={lang} />
      ) : (
        <PolicyLab lang={lang} />
      )}
    </>
  );
}
function Moderation({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [scenario, setScenario] = useState(scenarios[0].id),
    [custom, setCustom] = useState(false),
    [message, setMessage] = useState(""),
    [context, setContext] = useState(""),
    [threshold, setThreshold] = useState(0.72),
    [available, setAvailable] = useState(true),
    [result, setResult] = useState<{
      reference: ModerationResult;
      proposed: ModerationResult;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setResult(null);
    setError("");
  }, [lang]);
  const sample = scenarios.find((s) => s.id === scenario) ?? scenarios[0];
  const run = () => {
    setBusy(true);
    setError("");
    setResult(null);
    requestAnimationFrame(() => {
      try {
        const input = {
          text: custom ? message : sample.text[lang],
          context: custom ? context : sample.context[lang],
          threshold,
          available,
          locale: lang,
        };
        setResult({
          reference: moderate({ ...input, mode: "reference" }),
          proposed: moderate({ ...input, mode: "proposed" }),
        });
      } catch (e) {
        setError(
          e instanceof InputError
            ? e.messages[lang]
            : t("Não foi possível avaliar.", "Unable to evaluate."),
        );
      } finally {
        setBusy(false);
      }
    });
  };
  const exportResult = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            label:
              "Synthetic deterministic demonstration; not a DoorDash result",
            ...result,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "synthetic-decision.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <div className="lab-layout">
        <section className="panel input-panel">
          <div className="panel-top">
            <span className="eyebrow">INPUT</span>
            <span className="badge">{t("Sintético", "Synthetic")}</span>
          </div>
          <h2>
            {t("Uma mensagem. Mais contexto.", "One message. More context.")}
          </h2>
          <label>
            {t("Escolha um cenário", "Choose a scenario")}
            <select
              value={custom ? "custom" : scenario}
              onChange={(e) => {
                setCustom(e.target.value === "custom");
                if (e.target.value !== "custom") {
                  setScenario(e.target.value);
                  setAvailable(
                    scenarios.find((s) => s.id === e.target.value)?.available ??
                      true,
                  );
                }
                setResult(null);
              }}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title[lang]}
                </option>
              ))}
              <option value="custom">
                {t("Escrever meu exemplo", "Write my own example")}
              </option>
            </select>
          </label>
          <label>
            {t("Mensagem", "Message")}
            <textarea
              maxLength={2000}
              value={custom ? message : sample.text[lang]}
              onChange={(e) => {
                setMessage(e.target.value);
                if (!custom) setContext(sample.context[lang]);
                setCustom(true);
                setResult(null);
              }}
            />
          </label>
          <label>
            {t("Contexto anterior", "Earlier context")}
            <textarea
              className="context-input"
              maxLength={2000}
              value={custom ? context : sample.context[lang]}
              onChange={(e) => {
                setContext(e.target.value);
                if (!custom) setMessage(sample.text[lang]);
                setCustom(true);
                setResult(null);
              }}
            />
          </label>
          <label className="range-label">
            <span>
              {t("Limiar de ação", "Action threshold")}
              <strong>
                {threshold.toLocaleString(lang, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={threshold}
              onChange={(e) => {
                setThreshold(+e.target.value);
                setResult(null);
              }}
            />
          </label>
          <label className="toggle-row">
            <span>
              {t(
                "Componente contextual disponível",
                "Context component available",
              )}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={available}
              onChange={(e) => {
                setAvailable(e.target.checked);
                setResult(null);
              }}
            />
          </label>
          <button className="primary full" disabled={busy} onClick={run}>
            <Play size={16} />
            {busy
              ? t("Avaliando…", "Evaluating…")
              : t("Comparar decisões", "Compare decisions")}
            <ArrowRight size={16} />
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <p className="micro">
            {t(
              "Execução local no navegador. O modo de referência é uma baseline didática, não uma reprodução do SafeChat.",
              "Runs locally in your browser. Reference mode is an educational baseline, not a reproduction of SafeChat.",
            )}
          </p>
        </section>
        <div className="result-column" aria-live="polite">
          {result ? (
            <>
              <ResultCard
                value={result.reference}
                title={t(
                  "Referência · mensagem isolada",
                  "Reference · isolated message",
                )}
                lang={lang}
              />
              <ResultCard
                value={result.proposed}
                title={t(
                  "Proposta · contexto + política",
                  "Proposal · context + policy",
                )}
                lang={lang}
                primary
              />
              <button className="text-button" onClick={exportResult}>
                <Download size={15} />
                {t(
                  "Baixar evidência desta execução",
                  "Download this execution record",
                )}
              </button>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-orbit">
                <Activity size={34} />
              </div>
              <h3>
                {t("A decisão aparece aqui.", "The decision appears here.")}
              </h3>
              <p>
                {t(
                  "Escolha uma mensagem, altere o contexto e compare as duas rotas.",
                  "Choose a message, change the context and compare both routes.",
                )}
              </p>
              <div className="tiny-flow">
                <span>{t("Mensagem", "Message")}</span>
                <ArrowRight size={14} />
                <span>{t("Política", "Policy")}</span>
                <ArrowRight size={14} />
                <span>{t("Decisão", "Decision")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <details className="disclosure">
        <summary>
          {t(
            "O que esse experimento demonstra — e o que ainda precisa de validação",
            "What this experiment demonstrates — and what still needs validation",
          )}
        </summary>
        <p>
          {t(
            "Demonstra contratos e roteamento reproduzíveis com regras explícitas. Os scores são constantes ilustrativas, não probabilidades calibradas. Expressões fora das regras podem passar despercebidas. Uma integração real requer dados representativos, revisão independente, avaliação por idioma e validação das políticas. A recomendação não executa sanção, pagamento ou suspensão.",
            "Demonstrates reproducible contracts and routing with explicit rules. Scores are illustrative constants, not calibrated probabilities. Expressions outside the rules may go undetected. A real integration needs representative data, independent review, language-specific evaluation and policy validation. A recommendation does not execute a sanction, payment or suspension.",
          )}
        </p>
      </details>
    </>
  );
}
function ResultCard({
  value: v,
  title,
  lang,
  primary = false,
}: {
  value: ModerationResult;
  title: string;
  lang: Locale;
  primary?: boolean;
}) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const action = {
    allow: t("Liberar", "Allow"),
    hold: t("Reter e revisar", "Hold & review"),
    review: t("Revisão humana", "Human review"),
    censor: t("Ocultar mensagem", "Censor message"),
  }[v.action];
  const stageNames: Record<string, string> = {
    validate: t("Validar", "Validate"),
    normalize: t("Normalizar", "Normalize"),
    rules: t("Regras", "Rules"),
    "context-rules": t("Contexto", "Context"),
    "policy-gate": t("Política", "Policy"),
    recommendation: t("Recomendação", "Recommendation"),
    "audit-envelope": t("Auditoria", "Audit"),
    "timeout-injected": t("Falha injetada", "Injected failure"),
  };
  return (
    <section className={`panel decision ${primary ? "proposed" : ""}`}>
      <div className="panel-top">
        <span className="eyebrow">{title}</span>
        {primary && (
          <span className="badge red">{t("Proposta", "Proposal")}</span>
        )}
      </div>
      <div className="decision-title">
        <span className={`decision-icon ${v.action}`}>
          <ShieldCheck size={23} />
        </span>
        <h3>{action}</h3>
        <span className="score">
          {v.score.toLocaleString(lang, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <small>score</small>
        </span>
      </div>
      <p>{v.reason[lang]}</p>
      <div className="route-strip">
        {v.stages.map((s, i) => (
          <span key={s}>
            <i>{i + 1}</i>
            {stageNames[s] ?? s}
          </span>
        ))}
      </div>
      <div className="decision-metrics">
        <span>
          <b>{v.simulatedLatencyMs} ms</b>
          {t("latência simulada", "simulated latency")}
        </span>
        <span>
          <b>
            US${" "}
            {v.simulatedCostUsd.toLocaleString(lang, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </b>
          {t("custo simulado", "simulated cost")}
        </span>
        <span>
          <b>{v.policy.id}</b>v{v.policy.version}
        </span>
      </div>
      <details>
        <summary>
          {t("Inspecionar contrato de auditoria", "Inspect audit contract")}
        </summary>
        <pre>{JSON.stringify(v.audit, null, 2)}</pre>
        <p className="micro">
          {t(
            "Fingerprint não criptográfico para a fixture; não é anonimização nem prova de integridade.",
            "Non-cryptographic fixture fingerprint; not anonymization or integrity proof.",
          )}
        </p>
      </details>
    </section>
  );
}
function Capacity({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [arrivals, setArrivals] = useState(1000),
    [rate, setRate] = useState(0.04),
    [people, setPeople] = useState(4),
    [time, setTime] = useState(4),
    [shadow, setShadow] = useState(0.5);
  const r = capacityModel(arrivals, rate, people, time, shadow);
  const max = Math.max(r.capacity, r.demand + r.desiredShadow, 1);
  return (
    <>
      <div className="lab-layout">
        <section className="panel">
          <span className="eyebrow">CAPACITY GATE</span>
          <h2>
            {t("O piloto cabe na operação?", "Does the pilot fit operations?")}
          </h2>
          <p>
            {t(
              "Modelo de capacidade por hora. Valores ilustrativos; não é uma simulação estocástica de filas.",
              "Hourly capacity model. Illustrative values; not a stochastic queue simulation.",
            )}
          </p>
          {[
            [
              t("Mensagens / hora", "Messages / hour"),
              arrivals,
              setArrivals,
              100,
              10000,
              100,
            ],
            [
              t("Taxa de revisão", "Review rate"),
              rate,
              setRate,
              0.01,
              0.3,
              0.01,
            ],
            [
              t("Revisores disponíveis", "Available reviewers"),
              people,
              setPeople,
              1,
              30,
              1,
            ],
            [
              t("Minutos por caso", "Minutes per case"),
              time,
              setTime,
              1,
              15,
              1,
            ],
            [
              t("Shadow / demanda obrigatória", "Shadow / mandatory demand"),
              shadow,
              setShadow,
              0,
              1,
              0.05,
            ],
          ].map(([label, value, set, min, max, step], i) => (
            <label className="range-label" key={i}>
              <span>
                {label as string}
                <strong>
                  {i === 1 || i === 4
                    ? `${Math.round(Number(value) * 100)}%`
                    : Number(value).toLocaleString(lang)}
                </strong>
              </span>
              <input
                type="range"
                min={Number(min)}
                max={Number(max)}
                step={Number(step)}
                value={Number(value)}
                onChange={(e) => (set as (n: number) => void)(+e.target.value)}
              />
            </label>
          ))}
        </section>
        <section className="panel queue-panel">
          <span className={`badge ${r.backlog > 0 ? "red" : "green"}`}>
            {r.backlog > 0
              ? t("Pausar expansão", "Pause rollout")
              : r.gate === "limited"
                ? t("Limitar piloto", "Limit pilot")
                : t("Capacidade disponível", "Capacity available")}
          </span>
          <h2>
            {r.admittedShadow.toFixed(0)}{" "}
            <small>
              {t("avaliações opcionais / h", "optional evaluations / h")}
            </small>
          </h2>
          <div className="queue-viz">
            {[
              [t("Capacidade", "Capacity"), r.capacity, "neutral"],
              [t("Demanda obrigatória", "Mandatory demand"), r.demand, "red"],
              [
                t("Shadow solicitado", "Requested shadow"),
                r.desiredShadow,
                "light",
              ],
              [
                t("Shadow admitido", "Admitted shadow"),
                r.admittedShadow,
                "green",
              ],
            ].map(([label, v, color]) => (
              <div className="bar-row" key={String(label)}>
                <div>
                  <span>{label}</span>
                  <b>{Number(v).toFixed(0)}</b>
                </div>
                <div className="bar-track">
                  <i
                    className={String(color)}
                    style={{ width: `${(Number(v) / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="notice">
            <TriangleAlert size={20} />
            <span>
              {r.backlog > 0
                ? t(
                    `A demanda obrigatória excede a capacidade em ${r.backlog.toFixed(0)} casos/h. Shadow bloqueado; escalar a limitação operacional.`,
                    `Mandatory demand exceeds capacity by ${r.backlog.toFixed(0)} cases/h. Shadow blocked; escalate the operational constraint.`,
                  )
                : t(
                    "20% da capacidade restante é reservada. Trabalho opcional nunca substitui trabalho obrigatório neste modelo.",
                    "20% of remaining capacity is reserved. Optional work never replaces mandatory work in this model.",
                  )}
            </span>
          </div>
          <p className="micro">
            {t(
              "Capacidade = revisores × 60 ÷ minutos/caso. Admissão = mínimo(solicitado, 80% da capacidade restante).",
              "Capacity = reviewers × 60 ÷ minutes/case. Admission = minimum(requested, 80% of remaining capacity).",
            )}
          </p>
        </section>
      </div>
      <div className="editorial-note">
        <b>{t("Minha decisão como gestor", "My management decision")}</b>
        <p>
          {t(
            "Eu alinharia com Safety Ops o limite de capacidade antes de ampliar o piloto. A equipe teria autonomia para experimentar dentro desse limite e uma condição explícita para pausar. O crescimento da fila obrigatória exigiria intervenção operacional; o gate sozinho não resolve falta de capacidade.",
            "I would agree on the capacity boundary with Safety Ops before expanding the pilot. The team would have autonomy within that boundary and an explicit pause condition. A growing mandatory queue requires operational intervention; the gate alone cannot fix insufficient capacity.",
          )}
        </p>
      </div>
    </>
  );
}
function PolicyLab({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [query, setQuery] = useState("threat"),
    [searched, setSearched] = useState(false),
    [found, setFound] = useState<ReturnType<typeof retrievePolicy>>([]),
    [tool, setTool] = useState("search_policies"),
    [args, setArgs] = useState('{"query":"threat"}'),
    [output, setOutput] = useState(""),
    [toolError, setToolError] = useState(false),
    [searchError, setSearchError] = useState("");
  useEffect(() => {
    setFound([]);
    setSearched(false);
    setOutput("");
    setSearchError("");
  }, [lang]);
  const run = () => {
    try {
      setOutput(JSON.stringify(callTool(tool, JSON.parse(args)), null, 2));
      setToolError(false);
    } catch (e) {
      setToolError(true);
      setOutput(
        e instanceof InputError
          ? e.messages[lang]
          : t(
              "JSON inválido ou argumentos não suportados.",
              "Invalid JSON or unsupported arguments.",
            ),
      );
    }
  };
  return (
    <>
      <div className="lab-layout">
        <section className="panel">
          <span className="eyebrow">RETRIEVAL</span>
          <h2>{t("Uma política. Uma versão.", "One policy. One version.")}</h2>
          <p>
            {t(
              "Recuperação lexical local: uma alternativa simples antes de adicionar embeddings ou geração com LLM.",
              "Local lexical retrieval: a simple alternative before adding embeddings or LLM generation.",
            )}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchError("");
              try {
                setFound(retrievePolicy(query, lang));
                setSearched(true);
              } catch (error) {
                setFound([]);
                setSearched(false);
                setSearchError(
                  error instanceof InputError
                    ? error.messages[lang]
                    : t(
                        "Não foi possível buscar. Tente novamente.",
                        "Unable to search. Try again.",
                      ),
                );
              }
            }}
            className="search-row"
          >
            <input
              aria-label={t("Buscar política", "Search policies")}
              value={query}
              maxLength={500}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "ameaça, contexto, fallback…",
                "threat, context, fallback…",
              )}
            />
            <button className="primary" aria-label={t("Buscar", "Search")}>
              <Search size={18} />
            </button>
          </form>
          {searchError && (
            <p className="error" role="alert">
              {searchError}
            </p>
          )}
          <div aria-live="polite">
            {found.map((p) => (
              <article className="policy-card" key={p.id}>
                <div className="panel-top">
                  <b>{p.id}</b>
                  <span className="badge">v{p.version}</span>
                </div>
                <h3>{p.title[lang]}</h3>
                <p>{p.excerpt}</p>
                <code>{p.source}</code>
                <span className="micro">
                  {t(
                    "Política sintética deste laboratório",
                    "Synthetic policy authored for this laboratory",
                  )}
                </span>
              </article>
            ))}
            {searched && found.length === 0 && (
              <div className="empty-small">
                <Search size={24} />
                <p>
                  {t(
                    "Nenhuma evidência suficiente. A demonstração se abstém de produzir uma resposta.",
                    "Insufficient evidence. The demonstration abstains from producing an answer.",
                  )}
                </p>
              </div>
            )}
            {!searched && (
              <div className="empty-small">
                <ShieldCheck size={28} />
                <p>
                  {t(
                    "Busque uma política para inspecionar fonte, versão e conteúdo.",
                    "Search a policy to inspect its source, version and content.",
                  )}
                </p>
              </div>
            )}
          </div>
        </section>
        <section className="panel terminal-panel">
          <div className="panel-top">
            <span className="eyebrow">MCP / READ-ONLY</span>
            <Terminal size={18} />
          </div>
          <h2>{t("Ferramentas com limites.", "Tools with boundaries.")}</h2>
          <p>
            {t(
              "O navegador demonstra as mesmas ferramentas de leitura do servidor MCP local. Não há conexão MCP remota nesta tela.",
              "The browser demonstrates the same read tools as the local MCP server. This screen has no remote MCP connection.",
            )}
          </p>
          <label>
            {t("Ferramenta descoberta", "Discovered tool")}
            <select
              value={tool}
              onChange={(e) => {
                setTool(e.target.value);
                setArgs(
                  e.target.value === "search_policies"
                    ? '{"query":"threat"}'
                    : e.target.value === "get_case_preview"
                      ? '{"id":"eval-01"}'
                      : "{}",
                );
                setOutput("");
              }}
            >
              {toolDefinitions.map((d) => (
                <option key={d.name}>{d.name}</option>
              ))}
            </select>
          </label>
          <label>
            {t("Argumentos JSON", "JSON arguments")}
            <textarea
              className="code-input"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              spellCheck={false}
            />
          </label>
          <button className="primary" onClick={run}>
            <Play size={15} />
            {t("Executar leitura", "Execute read")}
          </button>
          <pre className={toolError ? "error" : ""} aria-live="polite">
            {output ||
              t("// O resultado aparece aqui.", "// The result appears here.")}
          </pre>
          <details>
            <summary>
              {t(
                "Inspecionar descoberta de ferramentas",
                "Inspect tool discovery",
              )}
            </summary>
            <pre>{JSON.stringify(toolDefinitions, null, 2)}</pre>
          </details>
        </section>
      </div>
      <div className="editorial-note">
        <b>RAG · LangChain · LangGraph · MCP</b>
        <p>
          {t(
            "Este laboratório usa recuperação direta e uma máquina de estados pequena. RAG com geração é uma evolução opcional; LangChain/LangGraph só se justificariam com composição ou estado que compensem a dependência. MCP padroniza acesso a ferramentas, mas autorização e escopo continuam responsabilidades do servidor. Nenhuma dessas tecnologias concede autoridade a um LLM.",
            "This lab uses direct retrieval and a small state machine. Retrieval-augmented generation is an optional evolution; LangChain/LangGraph would need composition or state requirements that justify the dependency. MCP standardizes tool access, while authorization and scope remain server responsibilities. None of these technologies grants authority to an LLM.",
          )}
        </p>
        <a href={`#/${lang}/architecture`}>
          {t(
            "Explorar o fluxo proposto de contexto, RAG, parecer e decisão →",
            "Explore the proposed context, RAG, advice and decision flow →",
          )}
        </a>
      </div>
    </>
  );
}
