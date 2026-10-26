# Public source registry / Registro de fontes públicas

Accessed / Consultado: **2026-10-26** (America/Sao_Paulo).

This independent portfolio does not represent DoorDash, establish access to internal systems or claim endorsement. Public descriptions are bounded by publication time. The portal uses 28 sources: 27 ecosystem references plus the target role. They are publications, documented capabilities and product documentation; none is mislabeled as an open-source project. The bilingual per-source supported claim and proposed connection are stored in `src/data/evidence.ts` and rendered in the portal.

## Evidence rules / Regras

- **Public fact / Fato público:** attributed to the linked source and its date.
- **Interpretation / Interpretação:** a transfer of a documented pattern, not proof of integration.
- **Hypothesis / Hipótese:** needs internal context, representative data and validation.
- **Proposal / Proposta:** the author's independent design.
- **Measured demo result / Resultado medido:** execution of synthetic fixtures only.
- **Assumption / Premissa:** illustrative estimates, including calculator costs.

Missing publication dates remain empty in the source data: no guessed dates. The InfoQ page gives a recording date of 2026-08-22; this is not silently substituted for a publication date. DoorDash Help and the live role do not expose a publication date in the consulted text. For the Kafka/Flink article, the current article page displays 2022-10-21, while the archive/search indexing also exposes 2022-08-02; this registry follows the article page and records the discrepancy here.

## Core numerical interpretation

- The 2025 SafeChat article's 99.8% describes traffic handled by the internal model, **not accuracy**.
- Under 300 ms for most messages is **not p95**; the article does not provide a complete latency distribution.
- The reported 50% reduction concerns low/medium-severity safety occurrences in the published context. These are DoorDash results, never this project's results.
- Internal inference still has compute, storage, staffing and maintenance costs.
- The 2026 rules-engine publication and Bruna's talk already describe configuration, replay/backtesting and auditing patterns. Their existence must be recognized rather than framed as missing functionality.

## Reading the original diagrams

The SafeChat article links Figure 1 (`Safety-Blog-Images-6.jpg`) for synchronous text moderation and Figure 2 (`Safety-Blog-Images-7-1024x529.jpg`) for streamed calls reporting harm to moderation. The article and captions were read. Direct image download received Cloudflare HTTP 403. This registry does **not** claim pixel-level inspection of those images, and no copied source diagrams are shipped. New diagrams are original explanatory work for this independent study and distinguish the implemented laboratory from production proposals.

## Verified references

URLs below were read through the web reader, with title, date and author checked where provided. Raw HTTPS requests to careersatdoordash.com may be rejected by Cloudflare; a 403 from that client is not evidence that the source is unavailable to readers.

| ID | Source | Author / organization | Publication |
|---|---|---|---|
| safechat | [SafeChat: DoorDash’s AI-powered safety feature](https://careersatdoordash.com/blog/doordash-safechat-ai-safety-feature/) | Bruna Pereira | 2025-10-30 |
| safechat-help | [SafeChat — Dasher Help Center](https://help.doordash.com/en-us/dashers/article/safechat) | DoorDash | Not stated / Não informada |
| safechat-talk | [SafeChat: Building AI-Powered Safety Systems at Scale in a Real-Time Marketplace](https://www.infoq.com/presentations/doordash-llm-ai-moderation-platform/) | Bruna Pereira | Not stated / Não informada |
| role | [Engineering Manager, Trust & Safety — São Paulo](https://job-boards.greenhouse.io/doordashinternational/jobs/7682119) | DoorDash Brazil | Not stated / Não informada |
| rules-engine | [Fighting Fraud at Scale: Insights from building a real-time rules engine](https://careersatdoordash.com/blog/doordash-fraud-insights-from-building-a-real-time-rules-engine/) | Fengjiao Jiang; Aditya Upadhyaya | 2026-03-09 |
| anomaly | [Building an anomaly detection platform at DoorDash to catch fraud trends early](https://careersatdoordash.com/blog/doordash-anomaly-detection-platform-to-catch-fraud-trends/) | Dave Press | 2025-09-15 |
| ml-platform | [DoorDash’s ML Platform — The Beginning](https://careersatdoordash.com/blog/doordash-ml-platform-the-beginning/) | Param Reddy | 2020-04-23 |
| sibyl | [Meet Sibyl — DoorDash’s New Prediction Service](https://careersatdoordash.com/blog/doordashs-new-prediction-service/) | Cody Zeng | 2020-06-29 |
| ranking | [Integrating a Search Ranking Model into a Prediction Service](https://careersatdoordash.com/blog/integrating-a-scoring-framework-into-a-prediction-service/) | Ezra Berger | 2020-10-01 |
| fabricator | [Introducing Fabricator: A Declarative Feature Engineering Framework](https://careersatdoordash.com/blog/introducing-fabricator-a-declarative-feature-engineering-framework/) | Kunal Shah | 2022-01-11 |
| drift | [Maintaining Machine Learning Model Accuracy Through Monitoring](https://careersatdoordash.com/blog/monitor-machine-learning-model-drift/) | Swaroop Chitlur; Kornel Csernai | 2021-05-20 |
| clusterless | [Lessons learned building DoorDash’s clusterless ML feature store](https://careersatdoordash.com/blog/doordash-clusterless-ml-feature-store/) | Luigi Tagliamonte | 2026-05-18 |
| feature-cost | [Using CockroachDB to Reduce Feature Store Costs by 75%](https://careersatdoordash.com/blog/using-cockroachdb-to-reduce-feature-store-costs-by-75/) | Brian Seo; Kunal Shah | 2023-03-21 |
| workflows | [Using Kotlin, React, and Postgres to Create a No-Code Platform for Building Customized Workflows](https://careersatdoordash.com/blog/using-kotlin-react-and-postgres-to-create-a-no-code-platform/) | Kishore Guruswamy | 2022-02-01 |
| events | [Building scalable real time event processing with Kafka and Flink](https://careersatdoordash.com/blog/building-scalable-real-time-event-processing-with-kafka-and-flink/) | Allen Wang | 2022-10-21 |
| kafka-tenancy | [Setting up Kafka multi-tenancy](https://careersatdoordash.com/blog/setting-up-kafka-multi-tenancy/) | Yunji Zhong; Amit Gud; Carlos Herrera | 2024-03-27 |
| aperture | [Failure Mitigation for Microservices: An Intro to Aperture](https://careersatdoordash.com/blog/failure-mitigation-for-microservices-an-intro-to-aperture/) | Cong Ma; Matt Ranney | 2023-03-14 |
| prometheus | [How DoorDash Migrated from StatsD to Prometheus](https://careersatdoordash.com/blog/how-doordash-migrated-from-statsd-to-prometheus/) | Qixuan Wang | 2023-08-01 |
| bpfagent | [BPFAgent: eBPF for Monitoring at DoorDash](https://careersatdoordash.com/blog/bpfagent-ebpf-for-monitoring-at-doordash/) | Patrick Rogers | 2023-08-15 |
| infra-prober | [Using Active Probing to Detect Infrastructure Failures](https://careersatdoordash.com/blog/infra-prober-active-infrastructure-monitor/) | Shannon Li | 2021-01-28 |
| metrics-layer | [Using Metrics Layer to Standardize and Scale Experimentation at DoorDash](https://careersatdoordash.com/blog/using-metrics-layer-to-standardize-and-scale-experimentation-at-doordash-2/) | Arun Balasubramani | 2023-04-12 |
| experiment-velocity | [Balancing Velocity and Confidence in Experimentation](https://careersatdoordash.com/blog/balancing-velocity-and-confidence-in-experimentation/) | Stas Sajin | 2022-11-15 |
| support-rag | [Path to high-quality LLM-based Dasher support automation](https://careersatdoordash.com/blog/large-language-modules-based-dasher-support-automation/) | Zhe Jia; Shuai Wang; Aditi Bamba; Martin Wang | 2024-09-17 |
| simulation | [A simulation and evaluation flywheel to develop LLM chatbots at scale](https://careersatdoordash.com/blog/doordash-simulation-evaluation-flywheel-to-develop-llm-chatbots-at-scale/) | Lewis Warne; Chenran Gong; Aditi Bamba; Matt Gode | 2026-01-26 |
| judge | [LLM-as-a-Judge: Evaluating natural language search](https://careersatdoordash.com/blog/doordash-llm-as-a-judge-evaluating-natural-language-search/) | Xiaochang Miao; Heather Song | 2026-05-14 |
| autoeval | [How DoorDash leverages LLMs to evaluate search result pages](https://careersatdoordash.com/blog/doordash-llms-to-evaluate-search-result-pages/) | Yulei Liu | 2025-04-30 |
| merchant-risk | [Protecting Merchants and Combating Fraud](https://about.doordash.com/en-us/news/protecting-merchants-and-combating-fraud) | DoorDash | 2024-06-21 |
| incident | [Our response to the July 9, 2025 incident and steps forward](https://careersatdoordash.com/blog/july-9-2025-incident-and-steps-forward/) | Michael Czabator; Joseph Tortorelli; Muneeb Ansari; Vinay Chella | 2025-07-15 |

## Applied connections / Conexões aprofundadas

**Policy authoring and enforcement.** The 2026 rules engine separates facts, configurable logic and effects; the 2022 workflow article documents operator-authored flows. This study applies separation of concerns to versioned policy, deterministic decisions and review. Whether any production integration is appropriate is unknown and would require contracts, owners and authorization review.

**Evaluation without user exposure.** The support simulator and calibrated LLM-judge articles demonstrate two complementary ideas: reproducible scenarios before release and explicit human reference labels. This portfolio uses synthetic fixtures to test its decision logic. Such fixtures cannot establish performance across languages or harm categories in production; a representative, independently labeled test set is required.

**Operational recovery.** Aperture, Infra Prober and the 2025 incident account connect local failure handling with dependency-level behavior. The proposal limits remote time budgets and separates asynchronous processing. Production readiness would require sustained load, failure injection, durable queues and recovery tests; no benchmark is implied by UI animation.

**Context and retrieval.** The Dasher support RAG article highlights changing conversation context, grounded answers and consistency between actions and responses. The portfolio retrieves versioned synthetic policy documents for reviewer support. Retrieved text can explain a permitted decision; it cannot grant permissions or authorize sensitive actions.

## Historical scope

The registry intentionally includes historical publications to show the progression of design decisions. A 2020–2024 component name is a historical capability, not a claim of current deployment. Aperture, Kafka, Flink, OpenTelemetry, React, PostgreSQL and cloud services are external technologies discussed or proposed; the presence of their logo does not mean DoorDash uses the proposed stack for SafeChat.
