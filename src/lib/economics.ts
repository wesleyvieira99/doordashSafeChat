/** Illustrative planning arithmetic. No vendor quotes or DoorDash measurements. */
export interface EconomicInputs {
  volume: number;
  llmBefore: number;
  llmAfter: number;
  inputTokens: number;
  outputTokens: number;
  inputPerMillion: number;
  outputPerMillion: number;
  reviewRate: number;
  minutesSaved: number;
  hourly: number;
  realization: number;
  infra: number;
  observability: number;
  maintenance: number;
  investment: number;
}
export const defaultInputs: EconomicInputs = {
  volume: 1000000,
  llmBefore: 0.1,
  llmAfter: 0.04,
  inputTokens: 250,
  outputTokens: 60,
  inputPerMillion: 1,
  outputPerMillion: 4,
  reviewRate: 0.01,
  minutesSaved: 2,
  hourly: 30,
  realization: 0.5,
  infra: 500,
  observability: 100,
  maintenance: 600,
  investment: 15000,
};
/** Month 1–3 adoption: 25%, 50%, 75%; months 4–12: 100%. Costs remain fully charged. */
export function calculate(i: EconomicInputs) {
  for (const [key, value] of Object.entries(i))
    if (!Number.isFinite(value) || value < 0)
      throw new Error(`Invalid non-negative input: ${key}`);
  for (const key of [
    "llmBefore",
    "llmAfter",
    "reviewRate",
    "realization",
  ] as const)
    if (i[key] > 1) throw new Error(`Rate above one: ${key}`);
  const unit =
    (i.inputTokens * i.inputPerMillion + i.outputTokens * i.outputPerMillion) /
    1000000;
  const inferenceBefore = i.volume * i.llmBefore * unit;
  const inferenceAfter = i.volume * i.llmAfter * unit;
  const inferenceSaving = inferenceBefore - inferenceAfter;
  const hours = (i.volume * i.reviewRate * i.minutesSaved) / 60;
  const capacity = hours * i.hourly;
  const realized = capacity * i.realization;
  const operating = i.infra + i.observability + i.maintenance;
  const monthlyNet = inferenceSaving + realized - operating;
  let cumulative = -i.investment;
  const flow = Array.from({ length: 12 }, (_, m) => {
    const adoption = Math.min(1, (m + 1) / 4);
    const net = (inferenceSaving + realized) * adoption - operating;
    cumulative += net;
    return { month: m + 1, adoption, net, cumulative };
  });
  const roi = i.investment === 0 ? null : cumulative / i.investment;
  const payback = flow.find((x) => x.cumulative >= 0)?.month ?? null;
  const breakEvenMinutes =
    i.volume * i.reviewRate * i.hourly * i.realization === 0
      ? null
      : Math.max(
          0,
          ((operating - inferenceSaving) * 60) /
            (i.volume * i.reviewRate * i.hourly * i.realization),
        );
  return {
    unit,
    inferenceBefore,
    inferenceAfter,
    inferenceSaving,
    hours,
    capacity,
    realized,
    operating,
    monthlyNet,
    flow,
    roi,
    payback,
    breakEvenMinutes,
  };
}
export function capacityModel(
  arrivals: number,
  reviewRate: number,
  reviewers: number,
  minutesPerCase: number,
  shadowPercent: number,
) {
  const demand = arrivals * reviewRate;
  const capacity = minutesPerCase > 0 ? (reviewers * 60) / minutesPerCase : 0;
  const spare = Math.max(0, capacity - demand);
  const desiredShadow = demand * shadowPercent;
  const admittedShadow = Math.min(desiredShadow, spare * 0.8);
  return {
    demand,
    capacity,
    spare,
    desiredShadow,
    admittedShadow,
    backlog: Math.max(0, demand - capacity),
    gate: admittedShadow < desiredShadow ? "limited" : "open",
  };
}
