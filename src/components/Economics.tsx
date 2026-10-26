import { useState } from "react";
import { ArrowUpRight, Calculator, RotateCcw, Info } from "lucide-react";
import {
  calculate,
  defaultInputs,
  type EconomicInputs,
} from "../lib/economics";
import type { Locale } from "../data/content";
export function Economics({ lang }: { lang: Locale }) {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  const [i, setI] = useState({ ...defaultInputs });
  const r = calculate(i);
  const money = (v: number) =>
    new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  const fields: [keyof EconomicInputs, string, string, number][] = [
    ["volume", "Mensagens / mês", "Messages / month", 10000],
    [
      "llmBefore",
      "Rota LLM antes (fração)",
      "LLM route before (fraction)",
      0.01,
    ],
    [
      "llmAfter",
      "Rota LLM depois (fração)",
      "LLM route after (fraction)",
      0.01,
    ],
    ["inputTokens", "Tokens de entrada / chamada", "Input tokens / call", 10],
    ["outputTokens", "Tokens de saída / chamada", "Output tokens / call", 10],
    [
      "inputPerMillion",
      "USD / 1M tokens de entrada",
      "USD / 1M input tokens",
      0.1,
    ],
    [
      "outputPerMillion",
      "USD / 1M tokens de saída",
      "USD / 1M output tokens",
      0.1,
    ],
    [
      "reviewRate",
      "Casos elegíveis / volume (fração)",
      "Eligible cases / volume (fraction)",
      0.005,
    ],
    ["minutesSaved", "Minutos poupados / caso", "Minutes saved / case", 0.1],
    ["hourly", "USD / hora de revisão", "USD / review hour", 1],
    [
      "realization",
      "Fator de realização (fração)",
      "Realization factor (fraction)",
      0.05,
    ],
    [
      "infra",
      "Infraestrutura incremental / mês",
      "Incremental infrastructure / month",
      50,
    ],
    [
      "observability",
      "Avaliação + observabilidade / mês",
      "Evaluation + observability / month",
      50,
    ],
    [
      "maintenance",
      "Manutenção incremental / mês",
      "Incremental maintenance / month",
      50,
    ],
    [
      "investment",
      "Investimento inicial (USD)",
      "Initial investment (USD)",
      1000,
    ],
  ];
  const presets = [
    {
      id: "low",
      label: t("Conservador", "Conservative"),
      value: {
        ...defaultInputs,
        minutesSaved: 0.5,
        realization: 0.2,
        investment: 20000,
      },
    },
    {
      id: "base",
      label: t("Base ilustrativa", "Illustrative base"),
      value: { ...defaultInputs },
    },
    {
      id: "high",
      label: t("Otimista", "Optimistic"),
      value: { ...defaultInputs, minutesSaved: 3, realization: 0.7 },
    },
  ];
  const max = Math.max(
    ...r.flow.map((x) => Math.abs(x.cumulative)),
    i.investment,
    1,
  );
  return (
    <>
      <div className="section-heading">
        <span className="eyebrow">08 / {t("VIABILIDADE", "VIABILITY")}</span>
        <h1>
          {t("Um número precisa de premissas.", "A number needs assumptions.")}
        </h1>
        <p>
          {t(
            "Um modelo de investimento que também sabe dizer “não”.",
            "An investment model that can also say “no”.",
          )}
        </p>
      </div>
      <div className="notice">
        <Info size={18} />
        {t(
          "Todos os parâmetros são ilustrativos em USD. Não são preços atuais de fornecedores nem resultados da DoorDash. Trocar o idioma não converte moeda.",
          "All inputs are illustrative USD assumptions. They are not current vendor prices or DoorDash results. Switching language does not convert currency.",
        )}
      </div>
      <div className="preset-row">
        {presets.map((p) => (
          <button className="chip" key={p.id} onClick={() => setI(p.value)}>
            {p.label}
          </button>
        ))}
        <button
          className="text-button"
          onClick={() => setI({ ...defaultInputs })}
        >
          <RotateCcw size={14} />
          {t("Restaurar", "Reset")}
        </button>
      </div>
      <div className="economics-layout">
        <section className="panel economic-inputs">
          <span className="eyebrow">INPUT / USD</span>
          <h2>{t("Mude as premissas.", "Change the assumptions.")}</h2>
          <div className="input-grid">
            {fields.map(([key, pt, en, step]) => (
              <label key={key}>
                {t(pt, en)}
                <input
                  type="number"
                  min="0"
                  max={
                    [
                      "llmBefore",
                      "llmAfter",
                      "reviewRate",
                      "realization",
                    ].includes(key)
                      ? 1
                      : undefined
                  }
                  step={step}
                  value={i[key]}
                  onChange={(e) => {
                    let n = Math.max(0, +e.target.value || 0);
                    if (
                      [
                        "llmBefore",
                        "llmAfter",
                        "reviewRate",
                        "realization",
                      ].includes(key)
                    )
                      n = Math.min(1, n);
                    setI({ ...i, [key]: n });
                  }}
                />
              </label>
            ))}
          </div>
        </section>
        <div>
          <section className="financial-head">
            <span className="eyebrow">
              {t(
                "BENEFÍCIO LÍQUIDO / MÊS ESTÁVEL",
                "NET BENEFIT / STEADY MONTH",
              )}
            </span>
            <strong className={r.monthlyNet < 0 ? "negative" : ""}>
              {money(r.monthlyNet)}
            </strong>
            <p>
              {t(
                "Após custo incremental e fator de realização.",
                "After incremental cost and realization factor.",
              )}
            </p>
            <div className="financial-pair">
              <span>
                <b>
                  {r.roi === null
                    ? "—"
                    : `${(r.roi * 100).toLocaleString(lang, { maximumFractionDigits: 1 })}%`}
                </b>
                ROI / 12 {t("meses", "months")}
              </span>
              <span>
                <b>
                  {r.payback
                    ? `${r.payback} ${t("meses", "months")}`
                    : t("Não atingido", "Not reached")}
                </b>
                {t("payback em 12 meses", "payback within 12 months")}
              </span>
            </div>
          </section>
          <section className="panel">
            <h3>{t("A conta, aberta.", "The arithmetic, open.")}</h3>
            <dl className="ledger">
              {[
                [t("Inferência antes", "Inference before"), r.inferenceBefore],
                [t("Inferência depois", "Inference after"), r.inferenceAfter],
                [
                  t("Economia de inferência", "Inference saving"),
                  r.inferenceSaving,
                ],
                [
                  t("Capacidade equivalente", "Capacity-equivalent value"),
                  r.capacity,
                ],
                [t("Economia realizável", "Realizable saving"), r.realized],
                [
                  t("Custo incremental total", "Total incremental cost"),
                  -r.operating,
                ],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt>{label}</dt>
                  <dd>{money(Number(value))}</dd>
                </div>
              ))}
            </dl>
            <p className="micro">
              {r.hours.toLocaleString(lang, { maximumFractionDigits: 1 })}{" "}
              {t(
                "horas liberadas/mês. Capacidade não equivale automaticamente a redução de despesas.",
                "hours freed/month. Capacity does not automatically equal expense reduction.",
              )}
            </p>
          </section>
        </div>
      </div>
      <section className="panel cashflow">
        <div className="panel-top">
          <h2>
            {t(
              "O investimento ao longo do tempo.",
              "The investment over time.",
            )}
          </h2>
          <span className="badge">
            {t("Fluxo acumulado", "Cumulative cash flow")}
          </span>
        </div>
        <div
          className="cash-bars"
          role="img"
          aria-label={t(
            "Fluxo de caixa acumulado em 12 meses",
            "Cumulative cash flow over 12 months",
          )}
        >
          {r.flow.map((m) => (
            <div className="cash-column" key={m.month}>
              <span>{money(m.cumulative)}</span>
              <div className="cash-area">
                <i
                  className={m.cumulative >= 0 ? "positive" : "negative"}
                  style={{
                    height: `${Math.max(2, (Math.abs(m.cumulative) / max) * 100)}%`,
                  }}
                />
              </div>
              <small>M{m.month}</small>
            </div>
          ))}
        </div>
        <p className="micro">
          {t(
            "Adoção: 25%, 50%, 75%, depois 100%. Custos incrementais completos desde o primeiro mês. Payback é o primeiro mês com fluxo acumulado não negativo.",
            "Adoption: 25%, 50%, 75%, then 100%. Full incremental costs from month one. Payback is the first month with non-negative cumulative cash flow.",
          )}
        </p>
      </section>
      <div className="two-col">
        <section className="panel">
          <h3>{t("Fórmulas e unidades", "Formulas & units")}</h3>
          <ol className="formula-list">
            <li>
              {t("Inferência", "Inference")} ={" "}
              {t(
                "volume × taxa da rota × custo/chamada",
                "volume × route share × cost/call",
              )}
            </li>
            <li>
              {t("Custo/chamada", "Cost/call")} = (tokens in × USD/1M in +
              tokens out × USD/1M out) / {Number(1000000).toLocaleString(lang)}
            </li>
            <li>
              {t("Horas", "Hours")} ={" "}
              {t(
                "volume × casos elegíveis × minutos poupados ÷ 60",
                "volume × eligible share × minutes saved ÷ 60",
              )}
            </li>
            <li>
              {t("Economia realizável", "Realizable saving")} ={" "}
              {t(
                "horas × USD/hora × realização",
                "hours × USD/hour × realization",
              )}
            </li>
            <li>
              ROI = (
              {t(
                "benefício líquido acumulado − investimento",
                "accumulated net benefit − investment",
              )}
              ) / {t("investimento", "investment")}
            </li>
          </ol>
        </section>
        <section className="panel">
          <h3>{t("O que muda a decisão?", "What changes the decision?")}</h3>
          <p>
            {t(
              "Ponto de equilíbrio operacional em minutos poupados por caso:",
              "Operational break-even in minutes saved per case:",
            )}{" "}
            <b>
              {r.breakEvenMinutes === null
                ? t("não definido neste cenário", "undefined in this scenario")
                : r.breakEvenMinutes.toLocaleString(lang, {
                    maximumFractionDigits: 2,
                  })}
            </b>
            .
          </p>
          <div className="sensitivity">
            {[0.25, 0.5, 0.75].map((realization) => {
              const s = calculate({ ...i, realization });
              return (
                <div key={realization}>
                  <span>
                    {Math.round(realization * 100)}%{" "}
                    {t("realização", "realization")}
                  </span>
                  <b>{money(s.monthlyNet)}/m</b>
                </div>
              );
            })}
          </div>
          <p>
            {t(
              "Não atribuo um preço arbitrário à segurança humana. Receita incremental não entra neste cálculo. Infraestrutura é um custo adicional; o custo unitário por inferência cobre apenas a rota externa, evitando dupla contagem.",
              "I do not attach an arbitrary price to human safety. Incremental revenue is excluded. Infrastructure is an additional cost; unit inference cost covers only the external route, avoiding double counting.",
            )}
          </p>
        </section>
      </div>
    </>
  );
}
