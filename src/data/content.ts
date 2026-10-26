export type Locale = "pt" | "en";
export type Copy = { pt: string; en: string };
export const c = (pt: string, en: string): Copy => ({ pt, en });
export const nav = [
  { id: "overview", title: c("Visão geral", "Overview"), group: 0 },
  {
    id: "safechat",
    title: c("O ponto de partida", "The starting point"),
    group: 0,
  },
  {
    id: "opportunities",
    title: c("Perguntas que importam", "Questions that matter"),
    group: 0,
  },
  {
    id: "playground",
    title: c("Laboratório interativo", "Interactive laboratory"),
    group: 1,
  },
  { id: "architecture", title: c("Arquitetura", "Architecture"), group: 1 },
  { id: "code", title: c("Entenda o código", "Inside the code"), group: 1 },
  {
    id: "evaluation",
    title: c("Avaliação e operação", "Evaluation & operations"),
    group: 1,
  },
  {
    id: "cloud",
    title: c("Três caminhos na nuvem", "Three cloud paths"),
    group: 2,
  },
  {
    id: "economics",
    title: c("Impacto e investimento", "Impact & investment"),
    group: 2,
  },
  {
    id: "roadmap",
    title: c("Da hipótese à entrega", "From hypothesis to delivery"),
    group: 2,
  },
  {
    id: "ecosystem",
    title: c("Ecossistema DoorDash", "DoorDash ecosystem"),
    group: 2,
  },
  {
    id: "sources",
    title: c("Fontes e decisões", "Sources & decisions"),
    group: 2,
  },
  {
    id: "contribution",
    title: c("Minha contribuição", "My contribution"),
    group: 2,
  },
];
export const proposals = [
  {
    id: "01",
    title: c("Contexto antes da decisão", "Context before the decision"),
    tag: c("Roteamento com contexto", "Context-aware routing"),
    question: c(
      "Como distinguir uma ameaça de alguém relatando uma ameaça?",
      "How can we distinguish a threat from someone reporting one?",
    ),
    unknown: c(
      "O artigo não detalha todas as janelas de contexto ou políticas internas.",
      "The article does not describe every context window or internal policy.",
    ),
    evidence: c(
      "O SafeChat documenta classificação por categoria e ações proporcionais.",
      "SafeChat documents category scoring and proportional actions.",
    ),
    scenario: c(
      "Recebi a mensagem: vou te machucar. Quero denunciar. Bloquear o relato pode esconder um pedido de ajuda.",
      "I received: I will hurt you. I want to report it. Blocking the report may hide a request for help.",
    ),
    hypothesis: c(
      "Contexto limitado pode mudar a rota adequada para revisão.",
      "Bounded context may change the appropriate review route.",
    ),
    solution: c(
      "Separar fala direta, relato e ambiguidade; registrar a política e uma referência sintética da evidência.",
      "Separate direct speech, reporting and ambiguity; record the policy and a synthetic evidence reference.",
    ),
    simpler: c(
      "Uma regra explícita de relato e um botão de pedido de ajuda.",
      "An explicit reporting rule and a help request button.",
    ),
    experiment: c(
      "Conjunto rotulado por idioma, revisão independente e comparação com a mesma linha de base.",
      "Language-specific labeled data, independent review and comparison against the same baseline.",
    ),
    benefit: c(
      "Menos bloqueios inadequados de relatos, sem reduzir proteção.",
      "Fewer inappropriate blocks of reports without reducing protection.",
    ),
    risk: c(
      "Relatos falsos, mais contexto pessoal, custo e erros por idioma.",
      "False reports, more personal context, cost and language-specific errors.",
    ),
    success: c(
      "Hipótese: reduzir falsos positivos em relatos mantendo recall crítico e capacidade de revisão.",
      "Hypothesis: reduce report false positives while preserving critical recall and review capacity.",
    ),
    stop: c(
      "Interromper se houver piora de recall crítico ou aumento de retenção de dados sem benefício.",
      "Stop if critical recall degrades or data retention increases without benefit.",
    ),
  },
  {
    id: "02",
    title: c(
      "Uma expansão que respeita a fila",
      "A rollout that respects the queue",
    ),
    tag: c("Capacidade como limite", "Capacity as a constraint"),
    question: c(
      "Quem recebe o trabalho que um novo modelo cria?",
      "Who absorbs the work a new model creates?",
    ),
    unknown: c(
      "Capacidade, escalas, SLAs e regras de admissão da DoorDash não são públicos neste estudo.",
      "DoorDash capacity, staffing, SLAs and admission rules are not public in this study.",
    ),
    evidence: c(
      "O case descreve introdução gradual e revisão humana na moderação de voz.",
      "The case describes gradual introduction and human review for voice moderation.",
    ),
    scenario: c(
      "Um piloto encontra mais casos, mas os revisores já estão no limite.",
      "A pilot surfaces more cases, but reviewers are already at capacity.",
    ),
    hypothesis: c(
      "Admitir avaliação opcional com orçamento de capacidade protege o trabalho obrigatório.",
      "Admitting optional evaluation within a capacity budget protects mandatory work.",
    ),
    solution: c(
      "Simulação de admissão de shadow work, reserva de capacidade e indicação de pausa.",
      "Simulation of shadow-work admission, a capacity reserve and a pause signal.",
    ),
    simpler: c(
      "Amostragem fixa pequena com aprovação manual da operação.",
      "A small fixed sample with manual operations approval.",
    ),
    experiment: c(
      "Simular chegadas e capacidade; observar fila real apenas após autorização interna.",
      "Simulate arrivals and capacity; observe real queues only after internal authorization.",
    ),
    benefit: c(
      "Experimentação sustentável e limites compreensíveis para o time.",
      "Sustainable experimentation and understandable team boundaries.",
    ),
    risk: c(
      "Estimativas de esforço ruins e atraso de aprendizado.",
      "Poor effort estimates and slower learning.",
    ),
    success: c(
      "Meta proposta: trabalho obrigatório preservado; piloto só avança com capacidade e qualidade demonstradas.",
      "Proposed target: mandatory work remains protected; pilot advances only with proven capacity and quality.",
    ),
    stop: c(
      "Pausar shadow work quando a demanda obrigatória supera a capacidade.",
      "Pause shadow work when mandatory demand exceeds capacity.",
    ),
  },
  {
    id: "03",
    title: c("Toda decisão tem uma origem", "Every decision has a source"),
    tag: c("Políticas e ferramentas limitadas", "Policies & bounded tools"),
    question: c(
      "Qual versão da política sustentou essa decisão?",
      "Which policy version supported this decision?",
    ),
    unknown: c(
      "O desenho interno de autorização e retenção precisa ser entendido com os responsáveis.",
      "Internal authorization and retention design must be understood with its owners.",
    ),
    evidence: c(
      "A plataforma pública descreve modelos separados das ações executadas pelos clientes.",
      "The public platform describes models separated from actions executed by clients.",
    ),
    scenario: c(
      "Uma regra muda depois de um caso. A decisão anterior precisa continuar explicável.",
      "A rule changes after a case. The earlier decision must remain explainable.",
    ),
    hypothesis: c(
      "Recuperação versionada e ferramentas somente de leitura tornam a revisão mais rastreável.",
      "Versioned retrieval and read-only tools make review more traceable.",
    ),
    solution: c(
      "Busca lexical de políticas com fonte e versão; ferramentas MCP para consultar política e caso sintético.",
      "Lexical policy retrieval with source and version; MCP tools for policy and synthetic-case reads.",
    ),
    simpler: c(
      "Tabela versionada de políticas com busca e links diretos.",
      "A versioned policy table with search and direct links.",
    ),
    experiment: c(
      "Testar recuperação relevante, ausência de resultados, acesso e tentativas de executar ações indevidas.",
      "Test relevant retrieval, empty results, access boundaries and attempted unauthorized actions.",
    ),
    benefit: c(
      "Uma trilha de explicação que pode ser revisada sem delegar autoridade ao modelo.",
      "An explanation trail that can be reviewed without delegating authority to a model.",
    ),
    risk: c(
      "Política obsoleta, documentação incompleta e recuperação equivocada.",
      "Stale policy, incomplete documentation and incorrect retrieval.",
    ),
    success: c(
      "Meta proposta: nenhuma ação sensível autorizada por texto recuperado; fonte e versão sempre disponíveis.",
      "Proposed target: no sensitive action authorized by retrieved text; source and version always available.",
    ),
    stop: c(
      "Bloquear resposta fundamentada quando não houver política válida suficiente.",
      "Withhold a grounded answer when sufficient valid policy evidence is unavailable.",
    ),
  },
];
export const futureQuestions = [
  c(
    "Ironia, regionalismos e alternância de idioma",
    "Irony, regionalisms and language switching",
  ),
  c(
    "Discordância entre texto, imagem e voz",
    "Disagreement across text, image and voice",
  ),
  c(
    "Calibração e mudanças de distribuição",
    "Calibration and distribution shifts",
  ),
  c(
    "Rótulos, contestação e seleção de amostras",
    "Labels, appeals and sample selection",
  ),
  c(
    "Efeito idempotente de uma ação sensível",
    "Idempotent effects for sensitive actions",
  ),
  c(
    "Retenção mínima e isolamento entre clientes",
    "Minimal retention and tenant isolation",
  ),
];
export const roadmap = [
  {
    days: "30",
    name: c("Entender e delimitar", "Understand & bound"),
    deliver: c(
      "Baseline, mapa de responsáveis, amostra rotulada e um problema priorizado.",
      "Baseline, ownership map, labeled sample and one prioritized problem.",
    ),
    owner: "EM · Product · Safety Ops · Data Science",
    dependency: c(
      "Acesso autorizado, políticas e disponibilidade dos revisores.",
      "Authorized access, policies and reviewer availability.",
    ),
    effort: c(
      "2–3 pessoas · 2–4 semanas (estimativa)",
      "2–3 people · 2–4 weeks (estimate)",
    ),
    metric: c(
      "Cobertura dos cenários e concordância entre revisores.",
      "Scenario coverage and reviewer agreement.",
    ),
    gate: c(
      "Avançar quando problema, baseline e critérios estiverem acordados.",
      "Advance when problem, baseline and criteria are agreed.",
    ),
    stop: c(
      "Repriorizar se a capacidade já existe ou o problema não é confirmado.",
      "Reprioritize if the capability exists or the problem is not confirmed.",
    ),
  },
  {
    days: "60",
    name: c("Testar com limites", "Test within limits"),
    deliver: c(
      "Piloto offline e shadow limitado, sem alterar decisões dos usuários.",
      "Offline pilot and bounded shadow evaluation without changing user decisions.",
    ),
    owner: "Engineering · Data Science · Safety Ops",
    dependency: c(
      "Dados minimizados, controles de acesso e métricas aprovadas.",
      "Minimized data, access controls and approved metrics.",
    ),
    effort: c(
      "Uma squad parcial · 3–4 semanas (estimativa)",
      "Partial squad · 3–4 weeks (estimate)",
    ),
    metric: c(
      "Recall por categoria, falsos positivos, custo e fila de revisão.",
      "Category recall, false positives, cost and review queue.",
    ),
    gate: c(
      "Qualidade e capacidade sustentadas no piloto.",
      "Quality and capacity sustained in the pilot.",
    ),
    stop: c(
      "Pausar por regressão de proteção, privacidade ou capacidade.",
      "Pause for protection, privacy or capacity regression.",
    ),
  },
  {
    days: "90",
    name: c("Entregar e aprender", "Deliver & learn"),
    deliver: c(
      "Canário com fallback aprovado, runbook, responsáveis e revisão semanal.",
      "Canary with approved fallback, runbook, owners and weekly review.",
    ),
    owner: "Engineering · SRE · Product · Safety Ops",
    dependency: c(
      "Critérios de rollout, operação e rollback exercitados.",
      "Rollout, operations and rollback criteria exercised.",
    ),
    effort: c(
      "Uma squad · 3–4 semanas (estimativa)",
      "One squad · 3–4 weeks (estimate)",
    ),
    metric: c(
      "Tempo até intervenção, qualidade auditada e carga operacional.",
      "Time to intervention, audited quality and operational burden.",
    ),
    gate: c(
      "Expandir apenas com comparação confiável e aprovação dos responsáveis.",
      "Expand only with reliable comparison and owner approval.",
    ),
    stop: c(
      "Reverter ao fluxo aprovado anterior quando um guardrail falhar.",
      "Return to the previously approved workflow when a guardrail fails.",
    ),
  },
  {
    days: "180",
    name: c("Escalar o que funcionou", "Scale what worked"),
    deliver: c(
      "Avaliar novos idiomas e produtos; tornar o contrato reutilizável.",
      "Evaluate additional languages and products; make the contract reusable.",
    ),
    owner: "EM · Platform · Product · Recruiting",
    dependency: c(
      "Benefício observado, documentação e capacidade do time.",
      "Observed benefit, documentation and team capacity.",
    ),
    effort: c(
      "Estimativa após o piloto; não assumida neste estudo.",
      "Estimate after the pilot; not assumed in this study.",
    ),
    metric: c(
      "Adoção útil, custo total e confiabilidade por segmento.",
      "Useful adoption, total cost and segment reliability.",
    ),
    gate: c(
      "Expandir apenas o que mostrou valor com manutenção sustentável.",
      "Scale only demonstrated value with sustainable maintenance.",
    ),
    stop: c(
      "Consolidar ou remover capacidades sem benefício demonstrado.",
      "Consolidate or remove capabilities without demonstrated benefit.",
    ),
  },
];
