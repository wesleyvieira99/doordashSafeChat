import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Globe2,
  Layers,
  Menu,
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  FileText,
  CheckCircle2,
  Activity,
} from "lucide-react";
import {
  nav,
  c,
  proposals,
  futureQuestions,
  roadmap,
  type Locale,
} from "./data/content";
import { evidence } from "./data/evidence";
import { evaluateDataset } from "./lib/engine";
import { Lab } from "./components/Lab";
import { Economics } from "./components/Economics";
import { Architecture } from "./components/Architecture";
import { CodeExplorer } from "./components/CodeExplorer";
const repo = "https://github.com/wesleyvieira99/doordashSafeChat";
const source =
  "https://careersatdoordash.com/blog/doordash-safechat-ai-safety-feature/";
const assets = import.meta.env.BASE_URL + "brand/";
const icons = [
  BookOpen,
  MessageSquare,
  Sparkles,
  FlaskConical,
  GitBranch,
  Code2,
  ShieldCheck,
  Layers,
  Activity,
  CheckCircle2,
  Globe2,
  FileText,
  Users,
];
const readHash = () => {
  const [a, b] = location.hash.replace("#/", "").split("/");
  return {
    lang: a === "en" ? ("en" as const) : ("pt" as const),
    page: nav.some((x) => x.id === b) ? b : "overview",
  };
};
export default function App() {
  const initial = readHash();
  const [lang, setLang] = useState<Locale>(() =>
    location.hash
      ? initial.lang
      : localStorage.getItem("trust-language") === "en"
        ? "en"
        : "pt",
  );
  const [page, setPage] = useState(initial.page);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const go = (id: string) => {
    location.hash = `/${lang}/${id}`;
  };
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);
  useEffect(() => {
    const update = () => {
      const v = readHash();
      setLang(v.lang);
      setPage(v.page);
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    localStorage.setItem("trust-language", lang);
    document.title = `${nav.find((n) => n.id === page)?.title[lang]} · Trust, by Design`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        t(
          "Estudo independente de Wesley Vieira: engenharia de confiança e segurança inspirada no SafeChat da DoorDash.",
          "An independent study by Wesley Vieira: trust and safety engineering inspired by DoorDash SafeChat.",
        ),
      );
  }, [lang, page]);
  useEffect(() => {
    const f = () =>
      setProgress(
        window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
      );
    window.addEventListener("scroll", f, { passive: true });
    f();
    return () => window.removeEventListener("scroll", f);
  }, [page]);
  const current = nav.find((n) => n.id === page)!;
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        {t("Pular para conteúdo", "Skip to content")}
      </a>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <a href={`#/${lang}/overview`} className="brand">
          <img src={assets + "doordash.png"} alt="DoorDash" />
          <span>
            Trust,
            <br />
            <b>by Design.</b>
          </span>
        </a>
        <div className="independent-label">
          {t("ESTUDO INDEPENDENTE", "INDEPENDENT STUDY")}
        </div>
        <nav aria-label={t("Navegação principal", "Main navigation")}>
          {[0, 1, 2].map((group) => (
            <div className="nav-group" key={group}>
              <p>
                {
                  [
                    t("DESCOBRIR", "DISCOVER"),
                    t("EXPLORAR", "EXPLORE"),
                    t("CONSTRUIR", "BUILD"),
                  ][group]
                }
              </p>
              {nav.map((n, i) => {
                const Icon = icons[i];
                return (
                  n.group === group && (
                    <a
                      key={n.id}
                      href={`#/${lang}/${n.id}`}
                      aria-current={page === n.id ? "page" : undefined}
                      className={page === n.id ? "active" : ""}
                    >
                      <Icon size={16} />
                      <span>{n.title[lang]}</span>
                      {page === n.id && <i />}
                    </a>
                  )
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-author">
          <span className="avatar">WV</span>
          <div>
            <b>Wesley Vieira</b>
            <small>Engineering · Trust & Safety</small>
          </div>
          <a
            href="https://www.linkedin.com/in/techvieira/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>
      {open && (
        <button
          className="nav-backdrop"
          aria-label={t("Fechar navegação", "Close navigation")}
          onClick={() => setOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-button"
              aria-label={t("Abrir navegação", "Open navigation")}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>SafeChat</span>
            <ChevronRight size={13} />
            <b>{current.title[lang]}</b>
          </div>
          <div className="top-actions">
            <div className="language-control">
              <button
                className={lang === "pt" ? "active" : ""}
                aria-label="Português"
                aria-pressed={lang === "pt"}
                onClick={() => {
                  setLang("pt");
                  location.hash = `/pt/${page}`;
                }}
              >
                PT
              </button>
              <button
                className={lang === "en" ? "active" : ""}
                aria-label="English"
                aria-pressed={lang === "en"}
                onClick={() => {
                  setLang("en");
                  location.hash = `/en/${page}`;
                }}
              >
                EN
              </button>
            </div>
            <a
              className="source-link"
              href={repo}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} />
              <span>{t("Ver código", "View code")}</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>
        <main id="main" key={page} className="main-content" tabIndex={-1}>
          {page === "overview" && <Overview lang={lang} go={go} />}
          {page === "safechat" && <Starting lang={lang} />}
          {page === "opportunities" && <Opportunities lang={lang} go={go} />}
          {page === "playground" && <Lab lang={lang} />}
          {page === "architecture" && <Architecture lang={lang} />}
          {page === "code" && <CodeExplorer lang={lang} />}
          {page === "evaluation" && <Evaluation lang={lang} />}
          {page === "cloud" && <Cloud lang={lang} />}
          {page === "economics" && <Economics lang={lang} />}
          {page === "roadmap" && <Roadmap lang={lang} />}
          {page === "ecosystem" && <Sources lang={lang} ecosystem />}
          {page === "sources" && <Sources lang={lang} />}
          {page === "contribution" && <Contribution lang={lang} />}
          <footer>
            <span>
              W / V <b>Trust, by Design.</b>
            </span>
            <p>
              {t(
                "Estudo independente de Wesley Vieira. Sem vínculo ou endosso da DoorDash. Marcas pertencem aos respectivos titulares.",
                "Independent study by Wesley Vieira. Not affiliated with or endorsed by DoorDash. Trademarks belong to their owners.",
              )}
            </p>
            <a
              href={`${repo}/blob/main/docs/brand-assets.md`}
              target="_blank"
              rel="noreferrer"
            >
              {t("Créditos e fontes", "Credits & sources")}
              <ArrowUpRight size={12} />
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
function Overview({ lang, go }: { lang: Locale; go: (p: string) => void }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return (
    <>
      <div className="overview-top">
        <span className="eyebrow">
          <i className="status-dot" />
          {t(
            "UMA EXPLORAÇÃO DE TRUST & SAFETY",
            "AN EXPLORATION OF TRUST & SAFETY",
          )}
        </span>
        <span className="edition">VOL. 01 / 2026</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <img src={assets + "doordash.png"} alt="" />
            <span>
              {t(
                "Inspirado no SafeChat da DoorDash",
                "Inspired by DoorDash SafeChat",
              )}
            </span>
          </div>
          <h1>
            {t("Confiança,", "Trust,")}
            <br />
            {t("por engenharia.", "by engineering.")}
            <span className="red-dot">●</span>
          </h1>
          <p>
            {t(
              "Como transformar sinais de risco em decisões cuidadosas — para as pessoas, para a operação e para o time que constrói.",
              "Turning risk signals into thoughtful decisions — for people, for operations and for the team building them.",
            )}
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={() => go("playground")}>
              {t("Experimentar o laboratório", "Explore the laboratory")}
              <ArrowRight size={17} />
            </button>
            <button className="text-button" onClick={() => go("architecture")}>
              {t("Explorar arquitetura", "Explore architecture")}
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="hero-credit">
            <span className="avatar small">WV</span>
            <span>
              {t("Um estudo de", "A study by")} <b>Wesley Vieira</b>
              <small>
                Engineering Manager, Trust & Safety ·{" "}
                {t("Candidatura", "Application")}
              </small>
            </span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label={t(
            "Ilustração do caminho entre contexto, política e decisão",
            "Illustration of the path between context, policy and decision",
          )}
        >
          <div className="art-grid" />
          <div className="art-orbit one" />
          <div className="art-orbit two" />
          <div className="art-heading">
            <span className="eyebrow">
              {t("CAMADA DE DECISÃO", "THE DECISION LAYER")}
            </span>
            <span className="badge">{t("Conceito", "Concept")}</span>
          </div>
          <div className="floating-message">
            <MessageSquare size={18} />
            <div>
              <b>{t("“Ele me ameaçou.”", "“He threatened me.”")}</b>
              <small>
                {t(
                  "Entender o contexto importa.",
                  "Understanding context matters.",
                )}
              </small>
            </div>
            <i />
          </div>
          <div className="signal-line" />
          <div className="core-visual">
            <ShieldCheck size={56} strokeWidth={1.15} />
            <span>TRUST</span>
            <small>{t("Contexto + política", "Context + policy")}</small>
          </div>
          <div className="art-branches">
            <div />
            <div />
          </div>
          <div className="art-decisions">
            <div>
              <CheckCircle2 size={16} />
              <span>
                {t("Evidência", "Evidence")}
                <small>{t("com origem", "with provenance")}</small>
              </span>
            </div>
            <div>
              <Users size={16} />
              <span>
                {t("Julgamento", "Judgment")}
                <small>
                  {t("com responsabilidade", "with accountability")}
                </small>
              </span>
            </div>
          </div>
          <div className="art-bottom">
            <i className="status-dot" />
            <span>
              {t(
                "A IA apoia. A política define os limites.",
                "AI assists. Policy defines the boundaries.",
              )}
            </span>
          </div>
        </div>
      </section>
      <div className="reading-paths">
        {[
          [
            "02",
            t("minutos", "minutes"),
            t("Entenda a proposta", "Understand the proposal"),
            "safechat",
          ],
          [
            "10",
            t("minutos", "minutes"),
            t("Explore as decisões", "Explore the decisions"),
            "opportunities",
          ],
          [
            "∞",
            t("profundidade", "depth"),
            t("Inspecione a implementação", "Inspect the implementation"),
            "code",
          ],
        ].map(([num, label, title, id]) => (
          <button key={id} onClick={() => go(id)}>
            <span className="path-number">{num}</span>
            <span>
              <small>{label}</small>
              <b>{title}</b>
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      <section className="editorial-intro">
        <div>
          <span className="eyebrow">
            {t("O PONTO DE PARTIDA", "THE STARTING POINT")}
          </span>
          <h2>
            {t(
              "Uma boa plataforma torna decisões difíceis mais claras.",
              "A good platform makes difficult decisions clearer.",
            )}
          </h2>
        </div>
        <p>
          {t(
            "O case da Bruna Pereira mostra como a DoorDash combina modelos e ações proporcionais para proteger interações. Eu parto desse trabalho para investigar três perguntas: que contexto a decisão precisa, quanta revisão a operação suporta e qual política sustenta cada resposta.",
            "Bruna Pereira’s case study shows how DoorDash combines models and proportional actions to protect interactions. I build on that work to investigate three questions: what context does a decision need, how much review can operations sustain, and which policy supports each response?",
          )}
        </p>
      </section>
      <div className="proposal-preview">
        {proposals.map((p) => (
          <button onClick={() => go("opportunities")} key={p.id}>
            <span className="proposal-number">{p.id}</span>
            <h3>{p.title[lang]}</h3>
            <p>{p.question[lang]}</p>
            <ArrowUpRight size={20} />
          </button>
        ))}
      </div>
      <section className="tech-strip">
        <span className="eyebrow">{t("IMPLEMENTADO COM", "BUILT WITH")}</span>
        <div>
          {[
            ["react.svg", "React"],
            ["typescript.svg", "TypeScript"],
            ["python.svg", "Python"],
            ["fastapi.svg", "FastAPI"],
            ["mcp.svg", "MCP"],
          ].map(([img, label]) => (
            <span
              key={label}
              className={label === "FastAPI" ? "dark-logo" : ""}
            >
              <img src={assets + img} alt={label} />
            </span>
          ))}
        </div>
        <p>
          {t(
            "React + TypeScript no navegador. Python + FastAPI e MCP como referências locais.",
            "React + TypeScript in the browser. Python + FastAPI and MCP as local references.",
          )}
        </p>
      </section>
    </>
  );
}
function Starting({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return (
    <>
      <Heading
        n="01"
        label={t("COMPREENDER", "UNDERSTAND")}
        title={t(
          "Começar pelo que já funciona.",
          "Start with what already works.",
        )}
        text={t(
          "O aprendizado vem do trabalho publicado pela equipe.",
          "The learning starts with the team’s published work.",
        )}
      />
      <a
        className="article-feature"
        href={source}
        target="_blank"
        rel="noreferrer"
      >
        <div className="article-brand">
          <img src={assets + "doordash.png"} alt="DoorDash" />
        </div>
        <div>
          <span className="eyebrow">
            {t("FONTE PRIMÁRIA · 30 OUT 2025", "PRIMARY SOURCE · OCT 30, 2025")}
          </span>
          <h2>SafeChat: DoorDash’s AI-powered safety feature</h2>
          <p>Bruna Pereira · DoorDash Engineering</p>
        </div>
        <ArrowUpRight size={24} />
      </a>
      <div className="three-col public-stats">
        {[
          [
            t("99,8%", "99.8%"),
            t(
              "do tráfego no modelo interno",
              "of traffic handled by the internal model",
            ),
            t(
              "Participação de tráfego descrita no artigo. Não é acurácia.",
              "Traffic share described in the article. Not accuracy.",
            ),
          ],
          [
            "<300 ms",
            t(
              "para a maioria das mensagens na primeira camada",
              "for most messages in the first layer",
            ),
            t(
              "Referência publicada; não estabelece um p95.",
              "Published reference; does not establish a p95.",
            ),
          ],
          [
            "50%",
            t(
              "de redução em ocorrências de baixa e média gravidade",
              "reduction in low/medium-severity occurrences",
            ),
            t(
              "Resultado reportado pela DoorDash no contexto do case.",
              "Result reported by DoorDash in the case study context.",
            ),
          ],
        ].map(([v, l, d]) => (
          <article className="panel" key={v}>
            <span className="badge">{t("Fato público", "Public fact")}</span>
            <strong>{v}</strong>
            <h3>{l}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
      <div className="modality-grid">
        {[
          [
            MessageSquare,
            t("Texto: antes da entrega", "Text: before delivery"),
            t(
              "A classificação síncrona permite intervir antes que uma mensagem chegue à outra pessoa.",
              "Synchronous classification enables intervention before a message reaches its recipient.",
            ),
          ],
          [
            ImageIcon,
            t("Imagem: granularidade", "Images: granularity"),
            t(
              "O artigo relata testes com categorias mais específicas e revisão de falsos positivos.",
              "The article describes finer categories and review of false positives.",
            ),
          ],
          [
            Mic,
            t("Voz: reação em tempo real", "Voice: real-time response"),
            t(
              "O áudio já pode ter sido ouvido. A ação busca interromper a exposição e evitar escalada.",
              "Audio may already have been heard. Action aims to stop exposure and prevent escalation.",
            ),
          ],
        ].map(([Icon, title, body], i) => {
          const I = Icon as typeof MessageSquare;
          return (
            <article key={i}>
              <I size={24} />
              <h3>{String(title)}</h3>
              <p>{String(body)}</p>
            </article>
          );
        })}
      </div>
      <section className="panel">
        <h2>
          {t("O que eu levo desse desenho", "What I take from this design")}
        </h2>
        <div className="numbered-list">
          {[
            t(
              "Reservar a rota mais cara para a incerteza que justifica seu custo.",
              "Reserve the expensive path for uncertainty that justifies its cost.",
            ),
            t(
              "Separar classificação, política e ação para tornar responsabilidades visíveis.",
              "Separate classification, policy and action to make responsibilities visible.",
            ),
            t(
              "Avaliar a qualidade e a capacidade operacional antes de ampliar a atuação.",
              "Evaluate quality and operational capacity before expanding intervention.",
            ),
          ].map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
        <p className="micro">
          {t(
            "Interpretação deste estudo. A apresentação posterior da Bruna e o artigo do motor de regras já documentam fluxos configuráveis, backtesting e auditoria. As propostas não pressupõem ausência dessas capacidades.",
            "This study’s interpretation. Bruna’s later presentation and the rules-engine article already document configurable workflows, backtesting and auditing. The proposals do not assume these capabilities are absent.",
          )}
        </p>
      </section>
    </>
  );
}
function Heading({
  n,
  label,
  title,
  text,
}: {
  n: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        {n} / {label}
      </span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function Opportunities({
  lang,
  go,
}: {
  lang: Locale;
  go: (s: string) => void;
}) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return (
    <>
      <Heading
        n="02"
        label={t("INVESTIGAR", "INVESTIGATE")}
        title={t(
          "Três hipóteses. Profundidade primeiro.",
          "Three hypotheses. Depth first.",
        )}
        text={t(
          "Perguntas de investigação, abertas à validação com quem conhece a operação.",
          "Investigation questions, open to validation with the people who know operations.",
        )}
      />
      {proposals.map((p) => (
        <article className="opportunity" key={p.id}>
          <div className="opportunity-title">
            <span>{p.id}</span>
            <div>
              <span className="badge red">{p.tag[lang]}</span>
              <h2>{p.title[lang]}</h2>
              <p>{p.question[lang]}</p>
            </div>
          </div>
          <div className="two-col">
            <div>
              <h4>{t("Cenário sintético", "Synthetic scenario")}</h4>
              <p>{p.scenario[lang]}</p>
              <h4>{t("Minha hipótese", "My hypothesis")}</h4>
              <p>{p.hypothesis[lang]}</p>
            </div>
            <div>
              <h4>
                {t(
                  "O que o laboratório demonstra",
                  "What the lab demonstrates",
                )}
              </h4>
              <p>{p.solution[lang]}</p>
              <h4>{t("Alternativa mais simples", "Simpler alternative")}</h4>
              <p>{p.simpler[lang]}</p>
            </div>
          </div>
          <details className="disclosure">
            <summary>
              {t(
                "Evidências, riscos e condições de avanço",
                "Evidence, risks and advancement conditions",
              )}
            </summary>
            <dl className="detail-grid">
              {(
                [
                  "evidence",
                  "unknown",
                  "experiment",
                  "benefit",
                  "risk",
                  "success",
                  "stop",
                ] as const
              ).map((key, i) => (
                <div key={key}>
                  <dt>
                    {
                      [
                        t("Evidência pública", "Public evidence"),
                        t("O que não sei", "What I do not know"),
                        t("Experimento necessário", "Required experiment"),
                        t("Benefício esperado", "Expected benefit"),
                        t("Riscos e dependências", "Risks & dependencies"),
                        t("Critério de sucesso", "Success criterion"),
                        t("Condição de interrupção", "Stop condition"),
                      ][i]
                    }
                  </dt>
                  <dd>{p[key][lang]}</dd>
                </div>
              ))}
            </dl>
          </details>
          <button className="text-button" onClick={() => go("playground")}>
            {t("Explorar no laboratório", "Explore in the laboratory")}
            <ArrowRight size={16} />
          </button>
        </article>
      ))}
      <section className="panel">
        <span className="eyebrow">
          {t("HORIZONTE DE PESQUISA", "RESEARCH HORIZON")}
        </span>
        <h2>
          {t(
            "Perguntas para as próximas conversas.",
            "Questions for the next conversations.",
          )}
        </h2>
        <div className="question-list">
          {futureQuestions.map((q) => (
            <p key={q.en}>
              <ArrowUpRight size={16} />
              {q[lang]}
            </p>
          ))}
        </div>
        <p className="micro">
          {t(
            "Fases futuras, não capacidades implementadas nem falhas comprovadas da DoorDash.",
            "Future phases, not implemented capabilities or demonstrated DoorDash shortcomings.",
          )}
        </p>
      </section>
    </>
  );
}
function Evaluation({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [r, setR] = useState<ReturnType<typeof evaluateDataset> | null>(null);
  return (
    <>
      <Heading
        n="06"
        label={t("VERIFICAR", "VERIFY")}
        title={t(
          "Uma decisão precisa de evidência.",
          "A decision needs evidence.",
        )}
        text={t(
          "O que foi exercitado, o que foi simulado e o que ainda precisa ser medido.",
          "What was exercised, what was simulated and what still needs measurement.",
        )}
      />
      <section className="panel">
        <div className="panel-top">
          <div>
            <span className="eyebrow">FIXTURE EVALUATION</span>
            <h2>
              {t(
                "Execute a avaliação reproduzível.",
                "Run the reproducible evaluation.",
              )}
            </h2>
          </div>
          <button className="primary" onClick={() => setR(evaluateDataset())}>
            <FlaskConical size={16} />
            {t("Executar fixtures", "Run fixtures")}
          </button>
        </div>
        <p>
          {t(
            "18 casos sintéticos separados dos exemplos da interface. Avaliação de regras e contratos; não há treinamento de modelo nem estimativa de eficácia no mundo real.",
            "18 synthetic cases separate from the UI examples. Rule and contract evaluation; no model training or estimate of real-world effectiveness.",
          )}
        </p>
        {r && (
          <div aria-live="polite">
            <div className="three-col metric-cards">
              <div>
                <b>
                  {r.proposed.correct}/{r.total}
                </b>
                <span>
                  {t(
                    "categoria + ação corretas · proposta",
                    "correct category + action · proposed",
                  )}
                </span>
              </div>
              <div>
                <b>
                  {r.reference.correct}/{r.total}
                </b>
                <span>
                  {t(
                    "categoria + ação corretas · referência",
                    "correct category + action · reference",
                  )}
                </span>
              </div>
              <div>
                <b>{r.proposed.reviewCount}</b>
                <span>{t("revisões recomendadas", "recommended reviews")}</span>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fixture</th>
                    <th>{t("Idioma", "Language")}</th>
                    <th>{t("Referência", "Reference")}</th>
                    <th>{t("Proposta", "Proposed")}</th>
                    <th>{t("Verificação da proposta", "Proposal check")}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((x: any) => (
                    <tr key={x.id}>
                      <td>
                        <code>{x.id}</code>
                      </td>
                      <td>{x.locale ?? x.language ?? "—"}</td>
                      <td>{x.reference.action}</td>
                      <td>{x.proposed.action}</td>
                      <td>
                        {x.proposedPass ? <Check size={16} /> : <X size={16} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="micro">{r.disclaimer[lang]}</p>
          </div>
        )}
      </section>
      <div className="two-col">
        <section className="panel">
          <h2>{t("Plano de avaliação real", "Real-world evaluation plan")}</h2>
          <dl className="detail-grid">
            {[
              [
                t("Qualidade", "Quality"),
                t(
                  "Precisão, recall, falsos positivos e falsos negativos por categoria, idioma e contexto; rótulos revisados por mais de uma pessoa.",
                  "Precision, recall, false positives and false negatives by category, language and context; labels reviewed by more than one person.",
                ),
              ],
              [
                t("Calibração", "Calibration"),
                t(
                  "Curvas de confiabilidade e cobertura versus erro para abstenção. Scores fixos desta demo não são probabilidades.",
                  "Reliability curves and coverage versus error for abstention. Fixed demo scores are not probabilities.",
                ),
              ],
              [
                t("Operação", "Operations"),
                t(
                  "Latência p50/p95/p99, erros, disponibilidade, tempo até intervenção, custo por mil mensagens e demanda de revisão.",
                  "p50/p95/p99 latency, errors, availability, time to intervention, cost per thousand messages and review demand.",
                ),
              ],
              [
                t("Método", "Method"),
                t(
                  "Separar treino, desenvolvimento e teste por conversa e período. Reservar teste final, registrar versões e controlar vazamento.",
                  "Separate training, development and test by conversation and time. Hold out final test data, version artifacts and control leakage.",
                ),
              ],
            ].map(([a, b]) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{b}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel">
          <h2>{t("Proteções e limites", "Protections & boundaries")}</h2>
          <div className="check-list">
            {[
              t(
                "Ferramentas expõem apenas leituras; nenhuma sanção é executada.",
                "Tools expose reads only; no sanction is executed.",
              ),
              t(
                "Texto não ganha autoridade para mudar política ou liberar ações.",
                "Text does not gain authority to change policy or authorize actions.",
              ),
              t(
                "Políticas sintéticas versionadas e validação explícita de entrada.",
                "Versioned synthetic policies and explicit input validation.",
              ),
              t(
                "Sem chaves privadas no navegador; nenhuma mensagem enviada externamente.",
                "No private keys in the browser; no externally transmitted messages.",
              ),
              t(
                "Produção exige autorização por caso, retenção mínima e isolamento.",
                "Production requires case-scoped authorization, minimal retention and isolation.",
              ),
            ].map((s) => (
              <p key={s}>
                <ShieldCheck size={18} />
                {s}
              </p>
            ))}
          </div>
        </section>
      </div>
      <section className="rollout">
        <h2>
          {t(
            "Aumentar a exposição, com evidência.",
            "Increase exposure, with evidence.",
          )}
        </h2>
        <div>
          {[
            "Offline",
            "Shadow",
            t("Revisão humana", "Human review"),
            t("Canário", "Canary"),
            t("Expansão", "Expansion"),
          ].map((s, i) => (
            <span key={s}>
              <small>0{i + 1}</small>
              <b>{s}</b>
              <ArrowRight size={16} />
            </span>
          ))}
        </div>
        <p>
          {t(
            "Cada etapa depende de qualidade, capacidade e responsáveis definidos. Nenhum experimento propõe expor deliberadamente pessoas a conteúdo nocivo. Regressão aciona o fluxo aprovado de contingência.",
            "Each stage depends on quality, capacity and defined owners. No experiment proposes deliberately exposing people to harmful content. Regressions trigger the approved fallback workflow.",
          )}
        </p>
      </section>
    </>
  );
}
function Cloud({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [cloud, setCloud] = useState(0);
  const names = ["AWS", "Google Cloud", "Microsoft Azure"];
  const logos = ["aws.png", "gcp.svg", "azure.svg"];
  const rows = [
    ["Computação", "Compute", "ECS / Fargate", "Cloud Run", "Container Apps"],
    [
      "Inferência",
      "Inference",
      "Bedrock / SageMaker AI",
      "Vertex AI",
      "Azure AI Foundry",
    ],
    [
      "Eventos e fila",
      "Events & queue",
      "SQS / EventBridge",
      "Pub/Sub",
      "Service Bus / Event Grid",
    ],
    [
      "Banco",
      "Database",
      "RDS PostgreSQL",
      "Cloud SQL PostgreSQL",
      "Azure Database for PostgreSQL",
    ],
    [
      "Recuperação",
      "Retrieval",
      "PostgreSQL / pgvector",
      "PostgreSQL / pgvector",
      "PostgreSQL / pgvector",
    ],
    ["Armazenamento", "Storage", "S3", "Cloud Storage", "Blob Storage"],
    [
      "Identidade / segredos",
      "Identity / secrets",
      "IAM / Secrets Manager",
      "IAM / Secret Manager",
      "Entra ID / Key Vault",
    ],
    [
      "Observabilidade",
      "Observability",
      "CloudWatch / OpenTelemetry",
      "Cloud Monitoring / OpenTelemetry",
      "Azure Monitor / OpenTelemetry",
    ],
    [
      "Rede",
      "Network",
      "VPC / security groups",
      "VPC / ingress controls",
      "VNet / ingress controls",
    ],
    [
      "Recuperação",
      "Recovery",
      "Multi-AZ + DLQ + backups",
      "Regional services + DLQ + backups",
      "Zone redundancy + DLQ + backups",
    ],
  ];
  return (
    <>
      <Heading
        n="07"
        label={t("IMPLANTAÇÃO", "DEPLOYMENT")}
        title={t(
          "O mesmo contrato. Três caminhos.",
          "The same contract. Three paths.",
        )}
        text={t(
          "Alternativas propostas para produção. Nenhuma infraestrutura paga foi provisionada.",
          "Proposed production alternatives. No paid infrastructure has been provisioned.",
        )}
      />
      <div className="cloud-selector">
        {names.map((name, i) => (
          <button
            key={name}
            className={cloud === i ? "active" : ""}
            onClick={() => setCloud(i)}
          >
            <img src={assets + logos[i]} alt={name} />
            <b>{name}</b>
            {i === 0 && (
              <small>
                {t("Recomendação inicial", "Initial recommendation")}
              </small>
            )}
          </button>
        ))}
      </div>
      <div className="two-col">
        <section className="panel">
          <h2>{names[cloud]}</h2>
          <dl className="service-map">
            {rows.map(([pt, en, ...services], i) => (
              <div key={i}>
                <dt>{t(pt, en)}</dt>
                <dd>{services[cloud]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel">
          <span className="eyebrow">
            {t("BASE DE COMPARAÇÃO", "COMPARISON BASELINE")}
          </span>
          <h2>
            {t(
              "Premissas iguais. Diferenças explícitas.",
              "Equal assumptions. Explicit differences.",
            )}
          </h2>
          <p>
            {t(
              "Planejamento ilustrativo: 1 milhão de mensagens/mês, pico de 10× a média, implantação nos EUA, retenção de metadados de 7 dias e objetivo de tolerar perda de uma zona. O suporte depende do serviço, região e configuração escolhidos.",
              "Illustrative planning: 1 million messages/month, peak at 10× average, US deployment, 7-day metadata retention and an objective to tolerate one-zone loss. Support depends on the selected service, region and configuration.",
            )}
          </p>
          <p>
            {t(
              "AWS us-east-1, GCP us-central1 e Azure East US são referências regionais aproximadas, não locais idênticos. Equivalência funcional não garante a mesma semântica de ordenação, entrega ou disponibilidade.",
              "AWS us-east-1, GCP us-central1 and Azure East US are approximate regional references, not identical locations. Functional equivalence does not guarantee identical ordering, delivery or availability semantics.",
            )}
          </p>
          <div className="editorial-note">
            <b>
              {t("Por que eu começaria por AWS", "Why I would start with AWS")}
            </b>
            <p>
              {t(
                "Minha experiência com AWS reduz a curva inicial de operação. Eu preservaria contratos HTTP, eventos e OpenTelemetry para limitar dependência. Isso é uma preferência técnica a validar; não uma afirmação de menor preço.",
                "My AWS experience reduces the initial operational learning curve. I would retain HTTP contracts, events and OpenTelemetry to limit lock-in. This is a technical preference to validate, not a lowest-price claim.",
              )}
            </p>
          </div>
          <p className="micro">
            {t(
              "Sem cotação de fornecedores: a calculadora usa premissas editáveis. Modelos, quotas e disponibilidade precisam de confirmação na região de destino.",
              "No vendor quote: the calculator uses editable assumptions. Models, quotas and availability require confirmation in the destination region.",
            )}
          </p>
          <a
            className="text-button"
            href={`${repo}/blob/main/docs/cloud.md`}
            target="_blank"
            rel="noreferrer"
          >
            {t(
              "Ler comparação e fontes oficiais",
              "Read comparison & official sources",
            )}
            <ArrowUpRight size={15} />
          </a>
        </section>
      </div>
      <section className="panel">
        <h2>
          {t(
            "Portabilidade que vale o esforço",
            "Portability worth the effort",
          )}
        </h2>
        <div className="three-col">
          <div>
            <h4>HTTP + JSON</h4>
            <p>
              {t(
                "Contratos verificáveis entre aplicação, políticas e adaptadores.",
                "Verifiable contracts between application, policies and adapters.",
              )}
            </p>
          </div>
          <div>
            <h4>OpenTelemetry</h4>
            <p>
              {t(
                "Instrumentação comum; exportadores específicos da operação.",
                "Shared instrumentation; operations-specific exporters.",
              )}
            </p>
          </div>
          <div>
            <h4>PostgreSQL</h4>
            <p>
              {t(
                "Adicionar persistência governada quando o piloto precisar; o laboratório não depende de um banco remoto.",
                "Add governed persistence when the pilot needs it; the lab does not depend on a remote database.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
function Roadmap({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return (
    <>
      <Heading
        n="09"
        label={t("PRIORIDADES", "PRIORITIES")}
        title={t(
          "Ouvir. Validar. Construir junto.",
          "Listen. Validate. Build together.",
        )}
        text={t(
          "Um plano proposto para uma equipe com acesso e contexto. Não é uma promessa de implantação.",
          "A proposed plan for a team with access and context. Not a deployment commitment.",
        )}
      />
      <div className="roadmap-track">
        {roadmap.map((r) => (
          <article key={r.days}>
            <div className="roadmap-day">
              <strong>{r.days}</strong>
              <small>{t("DIAS", "DAYS")}</small>
            </div>
            <div className="roadmap-content">
              <h2>{r.name[lang]}</h2>
              <p>{r.deliver[lang]}</p>
              <div className="owner-label">
                <Users size={15} />
                {r.owner}
              </div>
              <details className="disclosure">
                <summary>
                  {t(
                    "Entrega, dependências e condições",
                    "Delivery, dependencies & conditions",
                  )}
                </summary>
                <dl className="detail-grid">
                  {(
                    ["dependency", "effort", "metric", "gate", "stop"] as const
                  ).map((k, i) => (
                    <div key={k}>
                      <dt>
                        {
                          [
                            t("Dependências", "Dependencies"),
                            t("Esforço", "Effort"),
                            t("Métrica", "Metric"),
                            t("Avanço", "Advance"),
                            t("Interrupção", "Stop"),
                          ][i]
                        }
                      </dt>
                      <dd>{r[k][lang]}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>
          {t(
            "Priorizar é explicitar escolhas.",
            "Prioritizing means making choices explicit.",
          )}
        </h2>
        <p>
          {t(
            "RICE ilustrativo = alcance relativo × impacto × confiança ÷ esforço. Alcance e impacto: 1–5; confiança: 0–1; esforço: pessoa-semanas. Os valores abaixo são premissas para discussão.",
            "Illustrative RICE = relative reach × impact × confidence ÷ effort. Reach and impact: 1–5; confidence: 0–1; effort: person-weeks. Values below are discussion assumptions.",
          )}
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  t("Proposta", "Proposal"),
                  t("Alcance", "Reach"),
                  t("Impacto", "Impact"),
                  t("Confiança", "Confidence"),
                  t("Esforço", "Effort"),
                  "RICE",
                ].map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [t("Política versionada", "Versioned policy"), 4, 4, 0.8, 2],
                [t("Gate de capacidade", "Capacity gate"), 3, 5, 0.7, 3],
                [
                  t("Contexto por idioma", "Language-aware context"),
                  4,
                  4,
                  0.5,
                  5,
                ],
              ].map(([a, r, i, c, e]) => (
                <tr key={String(a)}>
                  <td>{a}</td>
                  <td>{r}</td>
                  <td>{i}</td>
                  <td>{c}</td>
                  <td>{e}</td>
                  <td>
                    {(
                      (Number(r) * Number(i) * Number(c)) /
                      Number(e)
                    ).toLocaleString(lang, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="notice">
          <ShieldCheck size={18} />
          {t(
            "Autorização, privacidade e proteção crítica são condições obrigatórias, independentemente da pontuação.",
            "Authorization, privacy and critical protection are mandatory conditions, regardless of score.",
          )}
        </div>
      </section>
    </>
  );
}
function Sources({
  lang,
  ecosystem = false,
}: {
  lang: Locale;
  ecosystem?: boolean;
}) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [query, setQuery] = useState("");
  const items = evidence.filter(
    (e) =>
      (!ecosystem || e.id !== "role") &&
      `${e.title} ${e.claim[lang]} ${e.connection[lang]} ${e.category[lang]}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        n={ecosystem ? "10" : "11"}
        label={t("PESQUISA", "RESEARCH")}
        title={
          ecosystem
            ? t("Conectar o que é público.", "Connect what is public.")
            : t("Uma trilha que você pode conferir.", "A trail you can verify.")
        }
        text={
          ecosystem
            ? t(
                "27 referências para ampliar perguntas e reconhecer capacidades já documentadas.",
                "27 references to expand questions and recognize documented capabilities.",
              )
            : t(
                "Fontes primárias, hipóteses explícitas e decisões revisáveis.",
                "Primary sources, explicit hypotheses and revisable decisions.",
              )
        }
      />
      {!ecosystem && (
        <>
          <div className="evidence-legend">
            {[
              t("Fato público", "Public fact"),
              t("Interpretação", "Interpretation"),
              t("Hipótese", "Hypothesis"),
              t("Proposta", "Proposal"),
              t("Medição na demo", "Demo measurement"),
              t("Estimativa", "Estimate"),
            ].map((s, i) => (
              <span key={s}>
                <i
                  style={{
                    background: [
                      "#ef4527",
                      "#69717b",
                      "#d7a658",
                      "#466f91",
                      "#3d8669",
                      "#ad89aa",
                    ][i],
                  }}
                />
                {s}
              </span>
            ))}
          </div>
          <section className="panel">
            <h2>
              {t(
                "Decisões de arquitetura, registradas.",
                "Architecture decisions, recorded.",
              )}
            </h2>
            <p>
              {t(
                "Problema, alternativas, consequências e condições para reconsiderar cada escolha.",
                "Problem, alternatives, consequences and conditions for revisiting each choice.",
              )}
            </p>
            <a
              href={`${repo}/tree/main/docs/adr`}
              className="text-button"
              target="_blank"
              rel="noreferrer"
            >
              {t("Abrir os ADRs no repositório", "Open ADRs in the repository")}
              <ArrowUpRight size={16} />
            </a>
          </section>
        </>
      )}
      <div className="search-row source-search">
        <Search size={18} />
        <input
          aria-label={t("Buscar referências", "Search references")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            "Busque por modelos, fraude, observabilidade…",
            "Search models, fraud, observability…",
          )}
        />
        <span>
          {items.length} {t("fontes", "sources")}
        </span>
      </div>
      <div className={ecosystem ? "evidence-grid" : "evidence-list"}>
        {items.map((e, i) => (
          <article className="evidence-card" key={e.id}>
            <div className="panel-top">
              <span className="badge">{e.category[lang]}</span>
              <span className="micro">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3>
              <a href={e.url} target="_blank" rel="noreferrer">
                {e.title}
                <ArrowUpRight size={16} />
              </a>
            </h3>
            <p>{e.claim[lang]}</p>
            <details>
              <summary>
                {t("Conexão com este estudo", "Connection to this study")}
              </summary>
              <p>{e.connection[lang]}</p>
              <small>
                {t(
                  "Interpretação deste projeto; não comprova uma integração interna.",
                  "This project’s interpretation; does not establish an internal integration.",
                )}
              </small>
            </details>
            <div className="evidence-meta">
              <span>{e.author}</span>
              <span>
                {e.published || t("Data não indicada", "Date not stated")}
              </span>
              <small>
                {t("Consultado", "Accessed")} {e.accessed}
              </small>
            </div>
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <p className="empty-small">
          {t(
            "Nenhuma referência encontrada. Tente outro termo.",
            "No references found. Try another term.",
          )}
        </p>
      )}
    </>
  );
}
function Contribution({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return (
    <>
      <Heading
        n="12"
        label={t("CONSTRUIR JUNTO", "BUILD TOGETHER")}
        title={t(
          "Meu próximo passo começa com uma conversa.",
          "My next step starts with a conversation.",
        )}
        text={t(
          "Experiência em prevenção a fraudes, produto e engenharia. Vontade de aprender o contexto do time.",
          "Experience in fraud prevention, product and engineering. A willingness to learn the team’s context.",
        )}
      />
      <div className="contribution-hero">
        <div className="portrait-type">
          W<span>/</span>V
        </div>
        <div>
          <span className="eyebrow">WESLEY VIEIRA</span>
          <h2>
            {t(
              "Engenharia. Pessoas. Proteção.",
              "Engineering. People. Protection.",
            )}
          </h2>
          <p>
            {t(
              "Hoje, no Itaú, conduzo a direção técnica de duas squads, com mais de 15 engenheiros e mais de 20 sistemas e serviços de prevenção a fraudes. Minha trajetória também inclui produto técnico e liderança de engenharia no Bradesco.",
              "At Itaú, I currently provide technical direction across two squads, more than 15 engineers and more than 20 fraud systems and services. My career also includes technical product management and engineering leadership at Bradesco.",
            )}
          </p>
          <p>
            {t(
              "Preparei este estudo para tornar meu raciocínio examinável. Quero ouvir as pessoas que conhecem a operação, desafiar minhas hipóteses e construir algo útil com o time.",
              "I prepared this study to make my reasoning inspectable. I want to hear from the people who know operations, challenge my assumptions and build something useful with the team.",
            )}
          </p>
          <div className="hero-buttons">
            <a
              href="https://www.linkedin.com/in/techvieira/"
              target="_blank"
              rel="noreferrer"
              className="primary"
            >
              LinkedIn
              <ArrowUpRight size={16} />
            </a>
            <a
              href="https://wesleyvieira99.github.io/WVPortfolio"
              target="_blank"
              rel="noreferrer"
              className="text-button"
            >
              {t("Portfólio completo", "Full portfolio")}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="three-col contribution-cards">
        {[
          [
            t("Desenvolver pessoas", "Develop people"),
            t(
              "Ajudar engenheiros a assumir decisões, discutir alternativas e crescer com feedback e responsabilidade.",
              "Help engineers own decisions, discuss alternatives and grow through feedback and accountability.",
            ),
          ],
          [
            t("Conectar disciplinas", "Connect disciplines"),
            t(
              "Traduzir necessidades de produto, operação e risco em prioridades e contratos que a equipe consiga construir.",
              "Translate product, operations and risk needs into priorities and contracts the team can build.",
            ),
          ],
          [
            t("Responder pelo resultado", "Own outcomes"),
            t(
              "Acompanhar a qualidade, o custo de operar e a experiência humana depois da entrega.",
              "Follow quality, operating cost and human experience after delivery.",
            ),
          ],
        ].map(([title, body]) => (
          <section className="panel" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </section>
        ))}
      </div>
      <div className="editorial-note">
        <b>{t("Transparência sobre a autoria", "Authorship transparency")}</b>
        <p>
          {t(
            "Ferramentas de IA apoiaram pesquisa, implementação e edição deste portfólio. As propostas são um estudo independente e precisam de validação com o time. Minha trajetória profissional está descrita no currículo; resultados sintéticos do laboratório não são resultados profissionais nem resultados da DoorDash.",
            "AI tools assisted research, implementation and editing of this portfolio. The proposals are an independent study and require validation with the team. My professional background is described in my résumé; synthetic lab results are not professional outcomes or DoorDash outcomes.",
          )}
        </p>
      </div>
    </>
  );
}
