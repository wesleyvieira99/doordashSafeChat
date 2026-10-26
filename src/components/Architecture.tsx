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
    </>
  );
}
