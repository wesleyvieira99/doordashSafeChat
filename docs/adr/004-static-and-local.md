# ADR 004 — Static portal, local backend / Portal estático, backend local

Date / Data: 2026-10-26. Status: accepted / aceita.

## Português

**Problema:** GitHub Pages hospeda arquivos estáticos; uma API persistente não deve ser apresentada como parte dessa hospedagem.

**Opções:** hospedar tudo em serviço pago; entregar somente conteúdo; executar uma demonstração no navegador e fornecer backend local separado.

**Decisão:** React/TypeScript estático para a experiência sem credenciais. Python/FastAPI local para contratos executáveis, documentação de API e integração opcional. Publicação de backend é uma tarefa separada.

**Justificativa:** o link público permanece simples de explorar e o código de serviço fica inspecionável. Segredos nunca são variáveis de build do frontend.

**Consequências:** estados e registros do browser não formam banco multiusuário. Um localhost funcional não demonstra autenticação, escala ou disponibilidade de produção. TypeScript e Python exigem testes de consistência dos cenários compartilhados.

**Reconsiderar quando:** uma demonstração autenticada com backend for autorizada e houver orçamento, operação e política de dados.

## English

**Problem:** GitHub Pages serves static assets and cannot host the persistent API. **Options:** paid full-stack hosting, content-only delivery or browser simulation with a separate local backend. **Decision:** static React/TypeScript plus a separately executable Python/FastAPI reference. **Rationale:** a credential-free link and inspectable service code; frontend build variables never carry secrets. **Consequences:** browser state is not a shared database; localhost does not establish production authentication or availability. Shared scenarios need consistency checks across languages. **Revisit:** when an authenticated hosted backend has approved budget, operation and data policy.
