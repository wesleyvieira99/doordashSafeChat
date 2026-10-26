# ADR 002 — Direct orchestration / Orquestração direta

Date / Data: 2026-10-26. Status: accepted / aceita.

## Português

**Problema:** um fluxo pequeno e previsível não deve adquirir dependências sem uma necessidade demonstrada.

**Opções:** funções e tipos explícitos; LangChain para composição; LangGraph para execução durável com estado.

**Decisão:** usar orquestração direta para validar, classificar, consultar política e decidir. RAG é recuperação de evidência; MCP é protocolo de ferramentas; nenhum deles exige LangChain ou LangGraph.

**Justificativa:** menos estados ocultos, dependências e caminhos de erro para explicar. A revisão de policy version e motivo fica próxima do código de decisão.

**Consequências:** persistência de workflow, retomada e tarefas humanas duráveis exigiriam implementação adicional. Não apresentar um fluxo ilustrado como orquestração durável entregue.

**Reconsiderar quando:** houver múltiplas etapas com checkpoints, retomada após falhas, espera humana longa ou composição que justifique o custo operacional. Comparar com uma máquina de estados simples e medir ambos.

## English

**Problem:** a short, predictable flow should not gain dependencies without evidence. **Options:** explicit functions/types; LangChain composition; LangGraph stateful durable execution. **Decision:** direct orchestration for validation, classification, policy lookup and decision. Retrieval and MCP do not require either framework. **Rationale:** fewer hidden states and simpler failure inspection. **Consequences:** durable workflow persistence and human waits remain additional engineering work. **Revisit:** if checkpoints, recovery or long human waits justify an orchestration runtime; compare against a small state machine and measure both.
