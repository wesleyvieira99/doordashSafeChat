import policyData from '../../backend/data/policies.json';
import evaluationData from '../../backend/data/evaluation.json';
import { scenarios } from '../data/scenarios';
import type { Action, Bilingual, Category, Locale } from '../data/scenarios';
export { scenarios };
export type { Action, Bilingual, Category, Locale };

export interface Policy {
  id: string; version: string; title: Bilingual; source: string;
  body: Bilingual; keywords: string[];
}
export interface ModerationInput {
  text: string; context?: string; locale?: Locale; threshold?: number;
  available?: boolean; mode?: 'reference' | 'proposed'; idempotencyKey?: string;
}
export interface ModerationResult {
  id: string; category: Category; score: number; action: Action; route: string;
  reason: Bilingual; policy: Pick<Policy, 'id' | 'version' | 'title' | 'source'>;
  stages: string[]; simulatedLatencyMs: number; simulatedCostUsd: number;
  audit: { policyVersion: string; evidenceDigest: string; contentStored: false };
}
export const policies: Policy[] = policyData;
export const ENGINE_VERSION = 'deterministic-demo-1.0';

export class InputError extends Error {
  readonly code: string;
  readonly messages: Bilingual;
  constructor(code: string, pt: string, en: string) {
    super(en); this.name = 'InputError'; this.code = code; this.messages = { pt, en };
  }
}
const invalid = (code: string, pt: string, en: string): never => { throw new InputError(code, pt, en); };
const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const length = (text: string) => Array.from(text).length;
// A stable non-cryptographic fixture fingerprint, not anonymization or tamper evidence.
function digest(text: string): string {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
function validate(input: ModerationInput): void {
  if (!input || typeof input.text !== 'string' || !input.text.trim()) invalid('TEXT_REQUIRED', 'Escreva uma mensagem para avaliar.', 'Enter a message to assess.');
  if (length(input.text) > 2000) invalid('TEXT_TOO_LONG', 'Use até 2.000 caracteres.', 'Use at most 2,000 characters.');
  if (input.context !== undefined && (typeof input.context !== 'string' || length(input.context) > 2000)) invalid('CONTEXT_INVALID', 'O contexto deve ter até 2.000 caracteres.', 'Context must contain at most 2,000 characters.');
  if (input.threshold !== undefined && (typeof input.threshold !== 'number' || !Number.isFinite(input.threshold) || input.threshold < 0 || input.threshold > 1)) invalid('THRESHOLD_INVALID', 'O limiar deve estar entre 0 e 1.', 'Threshold must be between 0 and 1.');
  if (input.locale !== undefined && !['pt', 'en'].includes(input.locale)) invalid('LOCALE_INVALID', 'Escolha pt ou en.', 'Choose pt or en.');
  if (input.mode !== undefined && !['reference', 'proposed'].includes(input.mode)) invalid('MODE_INVALID', 'Escolha reference ou proposed.', 'Choose reference or proposed.');
  if (input.available !== undefined && typeof input.available !== 'boolean') invalid('AVAILABILITY_INVALID', 'Disponibilidade deve ser um booleano.', 'Availability must be a boolean.');
  if (input.idempotencyKey !== undefined && (typeof input.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(input.idempotencyKey))) invalid('IDEMPOTENCY_KEY_INVALID', 'Use uma chave de 1 a 80 letras, números, _ ou -.', 'Use a key of 1–80 letters, digits, _ or -.');
}
const expressions = {
  injection: /ignore (?:all|previous|as|todas|os)|(?:system|developer) (?:prompt|message)|ban_user|approve_refund|approve refund|execute tool|execute a ferramenta|libere o pagamento/,
  threat: /vou te (?:matar|machucar|agredir)|(?:i will|i'll|going to) (?:kill|hurt|shoot) you|te dou um tiro/,
  profanity: /\b(?:idiota|imbecil|babaca|porra|merda|fuck|fucking|asshole|idiot|bitch)\b/,
  ambiguous: /vai se arrepender|will regret|sei onde voce mora|know where you live|vai pagar por isso|pay for this/,
  reporting: /denuncia|relato|citando|citacao|quoted|quoting|reporting|report:|received|recebi|recebido|recebeu|complaint/,
  figurative: /matar de rir|killing me with laughter/,
};

/** Pure deterministic rules: no model, external call, action execution or persistence. */
export function moderate(input: ModerationInput): ModerationResult {
  validate(input);
  const text = normalize(input.text);
  const context = normalize(input.context ?? '');
  const mode = input.mode ?? 'proposed';
  const threshold = input.threshold ?? 0.72;
  const available = input.available ?? true;
  let category: Category = 'safe'; let score = 0.06; let action: Action = 'allow';
  let policyId = 'SAFE-001'; let route = 'rules';
  let reason: Bilingual = { pt: 'Nenhum padrão de risco desta demonstração foi reconhecido. Isso não é uma garantia de segurança.', en: 'No risk pattern in this demo was recognized. This is not a safety guarantee.' };
  const threat = expressions.threat.test(text);
  const profanity = expressions.profanity.test(text);
  const injection = expressions.injection.test(`${text} ${context}`);
  const stages = ['validate', 'normalize', 'rules'];
  if (injection) {
    category = 'injection'; score = 0.98; action = 'review'; policyId = 'BOUNDARY-005'; route = 'tool-boundary';
    reason = { pt: 'Tentativa de alterar instruções foi tratada como conteúdo. Nenhuma ferramenta de escrita existe; encaminhar para revisão.', en: 'An attempt to change instructions was treated as content. No write tool exists; route to review.' };
  } else if (!available) {
    category = threat ? 'threat' : 'ambiguous'; score = threat ? 0.94 : 0.5;
    action = threat || profanity ? 'hold' : 'review'; policyId = 'FALLBACK-006'; route = 'timeout-fallback';
    reason = { pt: 'Indisponibilidade contextual injetada. Sinal forte fica retido; os demais casos seguem para revisão, sem aprovação automática.', en: 'Contextual unavailability was injected. Strong signals are held; other cases go to review, without automatic approval.' };
    stages.push('timeout-injected');
  } else if (mode === 'proposed' && expressions.figurative.test(text) && !expressions.threat.test(text.replace(expressions.figurative, '')) && !profanity) {
    score = 0.12; policyId = 'CONTEXT-004'; route = 'context-rules';
    reason = { pt: 'Uma expressão figurada conhecida foi reconhecida pela regra contextual. Permissão limitada a este padrão sintético.', en: 'A known figurative expression matched the context rule. Allowance is limited to this synthetic pattern.' };
    stages.push('context-rules');
  } else if (mode === 'proposed' && (threat || profanity) && expressions.reporting.test(`${text} ${context}`)) {
    category = 'ambiguous'; score = 0.55; action = 'review'; policyId = 'CONTEXT-004'; route = 'context-review';
    reason = { pt: 'O conteúdo pode ser uma denúncia ou citação. Revisão humana preserva o contexto; o relato não autoriza uma sanção automática.', en: 'The content may be a report or quotation. Human review preserves context; the report does not authorize an automatic sanction.' };
    stages.push('context-rules');
  } else if (threat) {
    category = 'threat'; score = 0.94; action = score >= threshold ? 'hold' : 'review'; policyId = 'THREAT-003'; route = action === 'hold' ? 'safety-review' : 'threshold-review';
    reason = { pt: 'Padrão de ameaça direta reconhecido. O limiar decide entre retenção recomendada e revisão; nenhuma ação sobre a conta é executada.', en: 'A direct-threat pattern was recognized. Threshold selects recommended hold or review; no account action is executed.' };
  } else if (profanity) {
    category = 'profanity'; score = 0.88; action = score >= threshold ? 'censor' : 'review'; policyId = 'ABUSE-002'; route = action === 'censor' ? 'message-filter' : 'threshold-review';
    reason = { pt: 'Padrão de linguagem ofensiva reconhecido. Acima do limiar, recomenda-se ocultar a mensagem; abaixo dele, revisar.', en: 'An abusive-language pattern was recognized. Above threshold, censoring the message is recommended; below it, review.' };
  } else if (expressions.ambiguous.test(text)) {
    category = 'ambiguous'; score = 0.58; action = 'review'; policyId = 'CONTEXT-004'; route = 'context-review';
    reason = { pt: 'A intenção não pode ser resolvida por este padrão. Encaminhar para revisão humana.', en: 'Intent cannot be resolved from this pattern. Route to human review.' };
  }
  const policy = policies.find((p) => p.id === policyId)!;
  stages.push('policy-gate', 'recommendation', 'audit-envelope');
  const evidenceDigest = `fnv1a32:${digest(`${input.text}\n${input.context ?? ''}`)}`;
  const id = `demo-${digest(JSON.stringify([input.text, input.context ?? '', mode, threshold, available, policy.version]))}`;
  return {
    id, category, score, action, route, reason,
    policy: { id: policy.id, version: policy.version, title: policy.title, source: policy.source },
    stages, simulatedLatencyMs: available ? (mode === 'reference' ? 12 : route.includes('context') ? 84 : 24) : 300,
    simulatedCostUsd: available && mode === 'proposed' && route.includes('context') ? 0.0004 : 0,
    audit: { policyVersion: policy.version, evidenceDigest, contentStored: false },
  };
}

/** Lexical retrieval over six fictional policies, not embeddings or a real RAG system. */
export function retrievePolicy(query: string, locale: Locale = 'pt') {
  if (typeof query !== 'string' || !query.trim() || length(query) > 500) invalid('QUERY_INVALID', 'Use uma busca de 1 a 500 caracteres.', 'Use a query of 1–500 characters.');
  if (!['pt', 'en'].includes(locale)) invalid('LOCALE_INVALID', 'Escolha pt ou en.', 'Choose pt or en.');
  const tokens = normalize(query).match(/[a-z0-9]+/g) ?? [];
  return policies.map((policy) => {
    const terms = normalize(`${policy.id} ${policy.title[locale]} ${policy.body[locale]} ${policy.keywords.join(' ')}`);
    const matches = [...new Set(tokens)].filter((token) => terms.includes(token)).length;
    return { ...policy, relevance: tokens.length ? matches / new Set(tokens).size : 0, excerpt: policy.body[locale] };
  }).filter((p) => p.relevance > 0).sort((a, b) => b.relevance - a.relevance || a.id.localeCompare(b.id)).slice(0, 3);
}

export const toolDefinitions = [
  { name: 'search_policies', description: 'Search fictional demo policies using lexical matches. Read-only.', inputSchema: { type: 'object', properties: { query: { type: 'string', minLength: 1, maxLength: 500 }, locale: { type: 'string', enum: ['pt', 'en'] } }, required: ['query'], additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } },
  { name: 'get_case_preview', description: 'Read one synthetic evaluation case and its deterministic recommendation. Read-only.', inputSchema: { type: 'object', properties: { id: { type: 'string', minLength: 1, maxLength: 80 } }, required: ['id'], additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } },
  { name: 'list_cases', description: 'List synthetic fixture identifiers and labels. Read-only.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } },
];

export function callTool(name: string, args: Record<string, unknown> = {}): unknown {
  if (!args || typeof args !== 'object' || Array.isArray(args)) invalid('TOOL_ARGUMENTS_INVALID', 'Argumentos da ferramenta inválidos.', 'Invalid tool arguments.');
  const allowed: Record<string, string[]> = { search_policies: ['query', 'locale'], get_case_preview: ['id'], list_cases: [] };
  if (!Object.prototype.hasOwnProperty.call(allowed, name)) invalid('TOOL_NOT_ALLOWED', 'Esta ferramenta não está disponível. Somente leitura é permitida.', 'This tool is unavailable. Only read operations are allowed.');
  if (Object.keys(args).some((key) => !allowed[name].includes(key))) invalid('TOOL_ARGUMENTS_INVALID', 'Campo não permitido na ferramenta.', 'Unexpected tool argument.');
  if (name === 'search_policies') return { source: 'synthetic-policies', retrieval: 'lexical', results: retrievePolicy(args.query as string, (args.locale ?? 'pt') as Locale) };
  if (name === 'list_cases') return evaluationData.map((row) => ({ id: row.id, locale: row.locale, expectedAction: row.expectedAction, expectedCategory: row.expectedCategory, synthetic: true }));
  if (typeof args.id !== 'string' || length(args.id) < 1 || length(args.id) > 80) invalid('TOOL_ARGUMENTS_INVALID', 'Use um identificador de 1 a 80 caracteres.', 'Use an identifier of 1–80 characters.');
  const row = evaluationData.find((item) => item.id === args.id);
  if (!row) return invalid('CASE_NOT_FOUND', 'Caso sintético não encontrado.', 'Synthetic case not found.');
  return { ...row, synthetic: true, result: moderate({ ...row, locale: row.locale as Locale }) };
}

export function evaluateDataset() {
  const rows = evaluationData.map((row) => {
    const input = { text: row.text, context: row.context, locale: row.locale as Locale, available: row.available };
    const reference = moderate({ ...input, mode: 'reference' });
    const proposed = moderate({ ...input, mode: 'proposed' });
    return { ...row, reference, proposed, referencePass: reference.action === row.expectedAction && reference.category === row.expectedCategory, proposedPass: proposed.action === row.expectedAction && proposed.category === row.expectedCategory };
  });
  const summarize = (mode: 'reference' | 'proposed') => {
    const correct = rows.filter((r) => mode === 'reference' ? r.referencePass : r.proposedPass).length;
    const reviewCount = rows.filter((r) => r[mode].action === 'review' || r[mode].action === 'hold').length;
    const expectedAllowed = rows.filter((r) => r.expectedAction === 'allow');
    const falsePositiveCount = expectedAllowed.filter((r) => r[mode].action !== 'allow').length;
    const risky = rows.filter((r) => r.expectedAction !== 'allow');
    const falseNegativeCount = risky.filter((r) => r[mode].action === 'allow').length;
    const latencies = rows.map((r) => r[mode].simulatedLatencyMs).sort((a, b) => a - b);
    return { correct, total: rows.length, accuracy: correct / rows.length, reviewCount, reviewRate: reviewCount / rows.length, falsePositiveCount, falsePositiveRate: falsePositiveCount / expectedAllowed.length, falseNegativeCount, falseNegativeRate: falseNegativeCount / risky.length, simulatedP95LatencyMs: latencies[Math.ceil(latencies.length * 0.95) - 1], simulatedTotalCostUsd: Number(rows.reduce((sum, r) => sum + r[mode].simulatedCostUsd, 0).toFixed(6)) };
  };
  return { dataset: 'synthetic-fixtures-v1', engineVersion: ENGINE_VERSION, synthetic: true, total: rows.length, rows, reference: summarize('reference'), proposed: summarize('proposed'), disclaimer: { pt: 'Acurácia mede concordância com 18 exemplos sintéticos escritos pelo autor. Latência e custo são cenários fixos, não medições. Não é um benchmark independente.', en: 'Accuracy measures agreement with 18 author-written synthetic examples. Latency and cost are fixed scenarios, not measurements. This is not an independent benchmark.' } };
}
