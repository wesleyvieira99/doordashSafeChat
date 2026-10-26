# Cloud alternatives / Alternativas de nuvem

**Status:** proposed reference architecture. None of these deployments or model endpoints has been provisioned. Service names and relevant documentation checked on **2026-10-26**. No current prices or universal service/region/model availability are claimed.

## Português

### Comparação com premissas equivalentes

O cenário ilustrativo é o mesmo: **1 milhão de mensagens/mês**, 30 dias, pico de **10× a média**, texto com até 2 KB, retenção de metadados de **7 dias**, 1% de escalonamento de modelo e 0,5% de revisão humana. Média: 1.000.000 ÷ (30 × 86.400) = **0,386 mensagem/s**; pico de planejamento: **3,86 mensagens/s**. Isso é uma premissa de dimensionamento, não um teste de capacidade. O mesmo modelo, tokens, classe de CPU, retenção e perfil de tráfego devem ser mantidos em uma cotação real.

Comparação geográfica: **EUA**, candidatos AWS `us-east-1`, GCP `us-central1`, Azure `eastus`. São referências regionais aproximadas; a região GCP fica no centro dos EUA e as demais no leste. Não são a mesma instalação ou localização. Uma comparação de latência justa exige clientes e distâncias equivalentes, ainda não medidos. A meta arquitetural é tolerar falha de uma zona, manter capacidade aquecida e testar restauração. Não prometo equivalência de SLAs. A região e o SKU exatos do modelo, a quota, o acesso privado e o comportamento de failover precisam ser confirmados antes de qualquer provisionamento.

| Necessidade | AWS | Google Cloud | Microsoft Azure |
|---|---|---|---|
| Containers de API | ECS em Fargate | Cloud Run | Container Apps |
| Inferência seletiva | Amazon Bedrock; endpoint próprio se necessário | Vertex AI | Azure AI Foundry / endpoint de modelo aprovado |
| Fila de trabalho | Amazon SQS + DLQ | Pub/Sub + dead-letter topic | Service Bus + dead-letter queue |
| Eventos de domínio | EventBridge | Eventarc / Pub/Sub | Event Grid |
| Banco relacional | RDS PostgreSQL Multi-AZ | Cloud SQL PostgreSQL HA | Azure Database for PostgreSQL Flexible Server HA |
| Recuperação inicial | Consulta a políticas versionadas no banco | Consulta a políticas versionadas no banco | Consulta a políticas versionadas no banco |
| Busca avançada opcional | OpenSearch / pgvector quando justificado | Vertex AI Search / pgvector quando justificado | Azure AI Search / pgvector quando justificado |
| Objetos e conjuntos de avaliação | S3 | Cloud Storage | Blob Storage |
| Identidade / segredos | IAM task roles / Secrets Manager | Service accounts / Secret Manager | Managed identities / Key Vault |
| Observabilidade | OpenTelemetry → CloudWatch | OpenTelemetry → Cloud Monitoring / Logging | OpenTelemetry → Azure Monitor |
| Rede | VPC, endpoints privados, ALB | VPC, conectividade privada, load balancing | VNet, private endpoints, ingress |
| Recuperação | Réplicas em zonas, DLQ, backups e restore testado | Serviço regional, HA de dados, replay e restore | Zone redundancy, HA de dados, replay e restore |

Os serviços acima correspondem a capacidades aproximadas, não a implementações intercambiáveis. Semântica de entrega, redrive, visibilidade, ordenação, quotas e controle de zonas precisam ser testados. Eu não colocaria um mecanismo de busca vetorial em uma pequena lista de políticas só para demonstrar RAG; começaria com filtros, versão e evidência verificáveis.

### Escolha inicial e condições de revisão

Eu escolheria **AWS ECS/Fargate** como referência inicial: permite empacotar o serviço Python em um container a construir, manter fronteiras explícitas e operar a decisão e o trabalhador separadamente. A escolha favorece um primeiro experimento operacional, não afirma que AWS é mais barata. Cloud Run é atraente quando se deseja reduzir a gestão de capacidade; mínimos aquecidos evitam comparar cold starts com um serviço sempre ativo. Container Apps é atraente em um ambiente já organizado com identidade e operação Azure; zone redundancy precisa ser configurada corretamente na criação do ambiente.

A recomendação muda se quotas de inferência, residência, latência medida, experiência da equipe ou contratos existentes favorecem outra nuvem. Manter o domínio independente de SDKs de provedor torna essa mudança mais simples; filas, IAM e endpoints privados continuam exigindo adaptação.

### Preços e custos

Não há consulta de preços ao vivo neste projeto. Os valores da calculadora são **premissas ilustrativas**, expressos em USD em ambos os idiomas. Uma cotação real incluiria: réplicas mínimas 24×7, inferência/tokens, ALB/ingress, egress, NAT ou endpoints, fila, banco HA, armazenamento, backups, logs, métricas, avaliação, revisão humana e manutenção. O custo de inferência interna não é zero porque não há chamada externa paga.

A comparação exige a mesma hipótese de HA, tráfego e retenção; preços spot, free tier e créditos promocionais devem ser mostrados separadamente. A capacidade liberada na revisão só vira economia de despesas pela parcela efetivamente realizável.

### Infraestrutura entregue

`infra/aws/main.tf` é uma fundação opcional de auditoria: fila SQS, DLQ, logs e armazenamento privado com expiração. Ela **não** implanta a API, rede, identidade de usuários, inferência ou banco, e não constitui uma plataforma de produção. O propósito é tornar parte da proposta inspecionável. Os prazos de retenção da fundação são exemplos independentes (30 dias de objetos, 14 dias de logs/DLQ e 4 dias de fila) e devem ser ajustados ao cenário de 7 dias antes de uma cotação ou implantação comparável. Nenhum `apply` foi executado. Terraform não estava instalado no ambiente de autoria; a configuração foi revisada estaticamente, sem alegar `terraform validate` executado.

## English

The same illustrative workload applies to all three alternatives: **one million messages per month**, a 30-day month, **10× average peak**, up to 2 KB of text per message, **7-day metadata retention**, 1% model escalation and 0.5% human review. Average traffic is **0.386 messages/second**, with a planning peak of **3.86 messages/second**. These are sizing assumptions, not measured capacity.

The geographic comparison is the **US**: AWS `us-east-1`, GCP `us-central1` and Azure `eastus` are candidate regions, not identical physical locations. GCP is in the central US while the other candidates are eastern US. A fair latency comparison needs equivalent client locations and distances; none has been measured. The architecture should tolerate a zone failure, keep warm capacity and exercise restores. Model SKU, quota, regional support, private access and failover semantics still require deployment-time verification. Similar service categories do not imply equivalent SLAs or delivery guarantees.

AWS uses ECS/Fargate, Bedrock, SQS/EventBridge, RDS PostgreSQL, S3, IAM/Secrets Manager and CloudWatch. GCP uses Cloud Run, Vertex AI, Pub/Sub/Eventarc, Cloud SQL PostgreSQL, Cloud Storage, service accounts/Secret Manager and Cloud Monitoring. Azure uses Container Apps, an approved AI Foundry model endpoint, Service Bus/Event Grid, PostgreSQL Flexible Server, Blob Storage, managed identities/Key Vault and Azure Monitor. OpenTelemetry provides a portable instrumentation layer. Small versioned policy collections should begin with direct retrieval; vector or managed search is optional and needs evidence of benefit.

I would start the reference design on **AWS ECS/Fargate**, because the Python service can be containerized and deployed with explicit service and worker boundaries. This is an operational design choice, not a cheapest-cloud claim. Cloud Run reduces capacity management, with minimum warm instances for a fair latency comparison. Container Apps suits an existing Azure identity and operations environment, provided zone redundancy is configured during environment creation. Quotas, data residency, measured latency and team experience can change the recommendation.

No live prices were fetched. Calculator values are illustrative USD assumptions in both languages. A real quote must include minimum replicas, inference, ingress, egress, network endpoints/NAT, HA storage, backups, observability, evaluation, human review and maintenance. Internal inference still consumes infrastructure and operational resources. Free tiers and credits should be separate from a sustainable operating baseline.

The optional Terraform under `infra/aws/` defines only an audit foundation: a queue, DLQ, private object storage and logs. It does not deploy an API, model, production identity, network or database. Its sample retention values (30-day objects, 14-day logs/DLQ and 4-day queue) must be aligned to the 7-day comparison scenario before equivalent pricing or deployment. It has not been applied. Terraform was unavailable in the authoring environment, so no successful `terraform validate` or deployment is claimed.

## Primary sources / Fontes primárias

Consulted 2026-10-26. These documents support service capabilities and differences; they do not validate this portfolio's projected performance or a customer-specific price.

- [AWS compute overview](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/compute-services.html): ECS, Fargate and container service categories.
- [Google Cloud cross-cloud comparison](https://docs.cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison): comparable service families; page identifies last update as 2024-12-03, so not sufficient alone for model SKU availability.
- [Microsoft Azure for AWS professionals](https://learn.microsoft.com/en-us/azure/architecture/aws-professional/): approximate mappings and explicit lack of feature-for-feature equivalence.
- [ECS Availability Zone balancing](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-rebalancing.html): multi-zone placement and task rebalancing.
- [Cloud Run autoscaling](https://docs.cloud.google.com/run/docs/about-instance-autoscaling): scaling behavior, concurrency and minimum instances.
- [Azure Container Apps reliability](https://learn.microsoft.com/en-us/azure/container-apps/disaster-recovery?tabs=bash): zone redundancy, required configuration and retries.
- [Azure Container Apps architecture guidance](https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-container-apps): replicas, identities and regional resilience.
- [Bedrock regional model support](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html): model-dependent regional availability; redirects readers to model-specific availability.
- [Amazon SQS overview](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/): queue behavior and retention.
