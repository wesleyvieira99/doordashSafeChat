# Trust, by Design — SafeChat independent study

A bilingual engineering portfolio by **Wesley Vieira**, inspired by Bruna Pereira's public [SafeChat case study](https://careersatdoordash.com/blog/doordash-safechat-ai-safety-feature/). This project explores contextual moderation, explicit fallback and policy-grounded explanations through a working, deterministic laboratory.

**Independent study, not a DoorDash product or an endorsed integration.** Published DoorDash outcomes belong to the source system. This project's synthetic demonstrations do not establish production accuracy, latency, savings or incident reduction.

- [Portal](https://wesleyvieira99.github.io/doordashSafeChat/)
- [Source repository](https://github.com/wesleyvieira99/doordashSafeChat)
- [Architecture](docs/architecture.md) · [API contract](docs/api.md) · [Backend and MCP](docs/backend.md)
- [Evidence register](docs/sources.md) · [Cloud comparison](docs/cloud.md) · [Decisions](docs/adr/)

## Português

### O que está implementado

- Portal React/TypeScript PT-BR/EN com navegação, exemplos, comparação de modos, limiares e falha injetada.
- Fatia vertical local: mensagem sintética → validação → regras → política → recomendação → envelope de auditoria exibido.
- Recuperação lexical de seis políticas fictícias, com versão, fonte, trecho e ausência de resultado explícita.
- Ferramentas somente leitura, exploráveis no navegador, e servidor MCP real separado sobre stdio.
- Avaliação reproduzível de 18 casos sintéticos, calculadora com premissas editáveis e testes de fórmulas.
- Dez diagramas em português e inglês, código navegável gerado dos arquivos reais, roadmap e registro de fontes.
- Backend Python/FastAPI local com validação, limite de corpo, replay por chave e respostas sem eco do texto de entrada.

**O portal público roda inteiramente no navegador.** Ele não depende de backend, credenciais ou inferência real. O backend local e o servidor MCP são processos opcionais separados; iniciá-los não conecta automaticamente o site a eles.

### Executar o portal

Recomendado: Node.js **24** e npm, como no workflow. Dependências diretas estão fixadas no `package.json` e as transitivas no `package-lock.json`.

```sh
npm ci
npm run dev
```

Abra **http://127.0.0.1:5178/doordashSafeChat/**. O caminho `/doordashSafeChat/` vem de `vite.config.ts`; não o remova ao testar assets e links locais.

```sh
npm test
npm run build
npm run preview
```

O build gera `public/code/catalog.json` a partir dos arquivos centrais, verifica TypeScript e cria `dist/`. O preview informa sua porta no terminal. Navegação por hash mantém os links de seção compatíveis com hospedagem estática, e o seletor de idioma preserva a seção.

### Executar a API de referência

Python **3.10+**, a partir da raiz do repositório:

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.lock
backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --no-access-log
```

Em Windows, use `backend/.venv/Scripts/python.exe` no lugar de `backend/.venv/bin/python`.

| Endpoint | Uso |
|---|---|
| `GET /health` | Versão e declaração do modo sintético |
| `POST /moderate` | Recomendação determinística e envelope de auditoria |
| `GET /policies` | Políticas fictícias; parâmetros opcionais `q` e `locale` |
| `GET /evaluation` | Executa as 18 fixtures em ambos os modos |
| `GET /docs` | Explorador OpenAPI gerado pelo FastAPI |

A API permanece em loopback. CORS permite somente origens locais de desenvolvimento nas portas 5178 e 5173; CORS não é autenticação. Não existe endpoint HTTP `/mcp`.

### Executar MCP e testes Python

```sh
python3 -m backend.mcp_server
backend/.venv/bin/python -m unittest backend.test_engine backend.test_api backend.test_advisory -v
```

O servidor MCP usa somente a biblioteca padrão. O cliente precisa enviar `initialize` e `notifications/initialized` antes de `tools/list`/`tools/call`. Ferramentas: `search_policies`, `list_cases`, `get_case_preview`. O protocolo é MCP `2025-03-26` sobre JSON-RPC em linhas UTF-8. O teste executa uma conversa real com o subprocesso. O explorador de ferramentas no portal chama funções TypeScript locais; não inicia o processo stdio.

### Limites e tratamento de dados

Scores, latências e custos de cenários são valores ilustrativos. Concordância com exemplos escritos pelo autor é um teste de regressão, não uma avaliação independente de generalização. O modo `reference` é uma referência sintética deste projeto; não reproduz a implementação interna da DoorDash.

Os únicos resultados das ações `allow`, `censor`, `hold` e `review` são recomendações exibidas. Nenhuma mensagem real é enviada, nenhuma conta é suspensa e nenhum caso operacional é aberto. Use somente conteúdo sintético ao experimentar.

Texto existe temporariamente na memória do navegador ou da requisição. O código não grava mensagens em disco nem inclui texto bruto nas respostas de moderação. A API tem cache de replay limitado a 128 entradas e cinco minutos por processo, contendo hashes e envelopes de resultado. O fingerprint FNV-1a é uma identidade de fixture, **não anonimização, integridade criptográfica ou auditoria imutável**. Veja [limites detalhados](docs/backend.md#data-handling-and-replay-limits).

A integração opcional com Ollama existe em `/advisory`, desativada por padrão e separada da moderação; seus testes usam respostas simuladas, sem chamadas a modelo. Embeddings, banco persistente, filas duráveis, operações de revisão/contestação, autenticação de produção e instrumentação OpenTelemetry continuam como propostas. LangChain/LangGraph foram avaliados e não adicionados ao fluxo direto. Há um Dockerfile opcional; o build da imagem não foi executado porque o daemon Docker não estava ativo.

### Publicação

`.github/workflows/pages.yml` verifica testes TypeScript e Python, gera o build e publica `dist/` pelo GitHub Actions. No repositório, Pages precisa estar configurado com **Source: GitHub Actions**. O workflow dispara em push para `main` ou manualmente. A URL do portal depende do sucesso desse workflow; ter arquivos no GitHub não confirma publicação.

O backend não é publicado pelo GitHub Pages. `infra/aws/` é uma fundação Terraform opcional e parcial, não aplicada. Ela não é usada pelo workflow e não cria recursos durante o build. Nenhuma cobrança de nuvem foi autorizada ou realizada por este projeto.

### Docker e provedor opcional

```sh
docker build -f backend/Dockerfile -t safechat-reference .
docker run --rm --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges -p 127.0.0.1:8000:8000 safechat-reference
```

O container usa usuário não privilegiado e mantém o adaptador desligado. O bind publicado fica em loopback. A imagem usa uma tag Python versionada, sem inventar digest; fixe um digest revisado antes de produção. O daemon não estava disponível, portanto estes comandos de container não foram executados na verificação.

Para testar um modelo já instalado no Ollama local, use a execução Python no host e configure explicitamente as variáveis documentadas em [backend.md](docs/backend.md#optional-local-ollama-advisory). `.env.example` documenta as opções; o aplicativo não carrega `.env` automaticamente. O portal não oferece esse endpoint nem recebe as variáveis. Não é necessário baixar ou executar modelo para explorar a demonstração.

### Diagramas e materiais

```sh
python3 public/diagrams/generate.py
```

Regenera 20 SVGs e `src/data/diagrams.ts` com geometria fixa, logos pertinentes e versões textuais acessíveis. A procedência dos logos oficiais está em [brand-assets.md](docs/brand-assets.md). Os emails de candidatura em texto/HTML foram entregues separadamente, para revisão privada. Nenhum email é enviado pelo projeto.

## English

### Run the portal

Use **Node.js 24** and npm, matching CI:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5178/doordashSafeChat/**. Run `npm test` for TypeScript tests, `npm run build` for the source catalog, type check and static build, and `npm run preview` to inspect `dist/`. The Vite base path is `/doordashSafeChat/`. Hash navigation supports direct static links; language selection preserves the current section.

### Run the optional local API and MCP

Use **Python 3.10+** from the repository root:

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.lock
backend/.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --no-access-log
```

On Windows use `backend/.venv/Scripts/python.exe`. API endpoints are `/health`, `/moderate`, `/policies`, `/evaluation` and the generated `/docs`. Local development CORS covers ports 5178 and 5173; it does not authenticate requests. Keep the sample bound to loopback.

```sh
python3 -m backend.mcp_server
backend/.venv/bin/python -m unittest backend.test_engine backend.test_api backend.test_advisory -v
```

MCP uses standard-library Python and the `2025-03-26` stdio protocol. Initialize the session before discovery/calls. Tools are `search_policies`, `list_cases` and `get_case_preview`; all are read-only. There is no HTTP `/mcp` endpoint. The browser tool explorer executes matching local TypeScript functions, while tests exercise the actual Python subprocess transport.

### What is and is not running

The GitHub Pages experience runs entirely in the browser with deterministic rules and fictional policies. Starting the API does not connect the public demo to it. There are no model calls by default, credentials, account actions, delivered messages or durable review cases. A separate local-only Ollama advisory adapter is implemented but disabled by default; tests use mocked provider responses. Scores, latency and costs are scenario assumptions. Eighteen author-created fixtures demonstrate regression behavior, not independent real-world performance. The `reference` mode is this project's synthetic baseline, not a replica of DoorDash's system.

Raw input exists transiently in request/browser memory. Moderation responses do not echo it and the implementation does not write it to disk. The process-local replay cache is bounded to 128 entries and five minutes, retaining hashes and result envelopes. FNV-1a fingerprints are fixture identities, not anonymization or tamper protection. Review [data boundaries](docs/backend.md#data-handling-and-replay-limits) before extending the prototype.

The optional `/advisory` adapter is separate from moderation and cannot authorize an action. Embeddings, persistent databases, durable queues, human operations, production identity and OpenTelemetry instrumentation remain future work. An optional Dockerfile is supplied; the image was not built because the Docker daemon was unavailable. LangChain/LangGraph were considered but direct orchestration was selected for this small flow.

### Optional container and local provider

Build with `docker build -f backend/Dockerfile -t safechat-reference .` and run with `docker run --rm --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges -p 127.0.0.1:8000:8000 safechat-reference`. It runs as a non-root user with the adapter disabled. The Docker daemon was unavailable during verification, so image build/run are not claimed as tested. The versioned Python image tag is not a content digest; pin a reviewed digest before production.

For an already installed local Ollama model, use host Python and the explicit environment described in [backend.md](docs/backend.md#optional-local-ollama-advisory). `.env.example` is documentation; environment files are not loaded automatically. The public portal does not call this endpoint or receive these variables. Model installation is not required for the public demonstration.

### Deployment and reproducibility

GitHub Actions runs Python/TypeScript checks, builds `dist/` and deploys Pages on `main`. Enable **GitHub Actions** as the repository's Pages source. The public URL depends on successful deployment, not merely a pushed commit. The backend is not hosted by Pages. Optional Terraform is a partial, unapplied audit foundation; it is not run by CI and no paid infrastructure was created.

`python3 public/diagrams/generate.py` rebuilds twenty bilingual SVGs and the typed diagram catalog. Brand asset sources, source evidence and architectural decisions are documented. Application emails are delivered separately as text and HTML for private review. This project does not send email.

## Repository map / Estrutura

```text
src/
  App.tsx                 Portal sections, navigation and language
  components/             Playground, diagrams, economics and code explorer
  lib/engine.ts           Deterministic browser moderation and tools
  lib/economics.ts        Economic model and editable scenario calculations
  data/                   Bilingual content, evidence, scenarios, diagrams
backend/
  app.py                  Loopback FastAPI reference and bounded replay
  engine.py               Python deterministic engine
  mcp_server.py           Read-only stdio MCP server
  advisory.py             Opt-in local Ollama advice; no policy authority
  Dockerfile              Optional non-root backend container
  data/                   Shared fictional policies and evaluation fixtures
  test_*.py               Backend/API/MCP tests
  requirements.lock       Pinned environment dependencies
public/
  brand/                  Attributed official technology assets
  diagrams/               Rendered bilingual diagrams and generator
  code/catalog.json       Generated source/guide catalog
scripts/catalog.mjs       Generates code catalog from real source files
tests/                    Browser-engine and economic-formula tests
docs/                     Architecture, API, evidence, cloud and ADRs
infra/aws/                Optional unapplied Terraform audit foundation
.github/workflows/        Verification and Pages deployment
```
