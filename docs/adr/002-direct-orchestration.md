# ADR 002 — Direct orchestration / Orquestração direta

Date / Data: 2026-10-26. Status: accepted / aceita.

## Português

**Problema:** um fluxo pequeno e previsível não deve adquirir dependências sem uma necessidade demonstrada.

**Opções:** funções e tipos explícitos; LangChain para composição; LangGraph para execução durável com estado.

**Decisão:** usar orquestração direta para validar, classificar, consultar política e decidir. RAG combina recuperação de evidência e geração de uma resposta fundamentada; a busca lexical isolada deste laboratório ainda não realiza esse fluxo. MCP é um protocolo de ferramentas. Nenhuma dessas abordagens exige LangChain ou LangGraph.

**Justificativa:** menos estados ocultos, dependências e caminhos de erro para explicar. A revisão de policy version e motivo fica próxima do código de decisão.

**Consequências:** persistência de workflow, retomada e tarefas humanas duráveis exigiriam implementação adicional. Não apresentar um fluxo ilustrado como orquestração durável entregue.

**Reconsiderar quando:** houver múltiplas etapas com checkpoints, retomada após falhas, espera humana longa ou composição que justifique o custo operacional. Comparar com uma máquina de estados simples e medir ambos.

**Extensão proposta:** começar com RAG em duas etapas: recuperar evidências autorizadas, vigentes e versionadas antes de uma chamada limitada de parecer. LangChain poderia compor retriever, modelo e schema. LangGraph só entraria se estado, ramificações e espera humana justificassem sua operação; retomada durável exige persistência e autorização próprias. O adaptador Ollama opcional atual é separado da moderação, não recebe documentos recuperados nem usa LangChain, LangGraph ou ferramentas MCP. Schema válido não comprova correção factual. A página Arquitetura explica o fluxo e os critérios de evolução em PT/EN.

## English

**Problem:** a short, predictable flow should not gain dependencies without evidence. **Options:** explicit functions/types; LangChain composition; LangGraph stateful durable execution. **Decision:** direct orchestration for validation, classification, policy lookup and decision. Retrieval and MCP do not require either framework. **Rationale:** fewer hidden states and simpler failure inspection. **Consequences:** durable workflow persistence and human waits remain additional engineering work. **Revisit:** if checkpoints, recovery or long human waits justify an orchestration runtime; compare against a small state machine and measure both.

**Proposed extension:** RAG combines retrieval and generation; the lab's isolated lexical search does not implement that workflow. Begin with two-step RAG: retrieve authorized, effective, versioned evidence before one bounded advisory call. LangChain could compose the retriever, model and schema. LangGraph would be justified only by state, branching or human waits; durable resumption requires persistence and authorization. The existing optional Ollama adapter is separate from moderation, receives no retrieved documents and uses no LangChain, LangGraph or MCP tools. Valid schema does not establish factual correctness. The Architecture page explains the flow and acceptance criteria in PT/EN.

## References / Referências

Official documentation checked / documentação oficial consultada em 2026-10-26:

- [Retrieval and two-step RAG](https://docs.langchain.com/oss/python/deepagents/retrieval)
- [Structured output](https://docs.langchain.com/oss/python/langchain/structured-output)
- [LangGraph workflows](https://docs.langchain.com/oss/python/langgraph/workflows-agents)
- [Interrupts and durable resumption](https://docs.langchain.com/oss/python/langgraph/interrupts)
