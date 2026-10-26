# Publication record / Registro de publicação

Verified on **2026-10-26**.

- Public URL: https://wesleyvieira99.github.io/doordashSafeChat/
- Source implementation: `011de53` on `main`.
- Published static artifact: `c65f577526c4ac41dbca69196abcd4a0ce7bba49` on `gh-pages`.
- Pages configuration: deploy from `gh-pages` at `/`; `.nojekyll` prevents Jekyll processing.
- Latest Pages branch build created at `2026-10-26T18:24:06Z`: **built**, no error.
- Public page and all 35 checked page/catalog/diagram/logo URLs returned HTTP 200.
- Local checks: production TypeScript/Vite build, 15 TypeScript tests, 27 Python tests.

## Automation limitation

[Actions run 40372386146](https://github.com/wesleyvieira99/doordashSafeChat/actions/runs/40372386146) did not start any job steps. GitHub's annotation states: “The job was not started because your account is locked due to a billing issue.” This is not a code/test failure, and no CI success is claimed.

The fully built artifact was committed to a new `gh-pages` branch without replacing any prior history. The normal GitHub Pages branch build then succeeded. No billing setting, paid subscription or security setting was changed.

The workflow remains ready. After the account owner resolves the GitHub billing issue, select **Settings → Pages → Source → GitHub Actions**, then run **Verify and publish**. Equivalent commands from the repository:

```sh
gh api repos/wesleyvieira99/doordashSafeChat/pages -X PUT -f build_type=workflow
gh workflow run pages.yml
```

Do not switch the source before the account issue is resolved. Until then, `main` contains source and `gh-pages` contains the verified static build; updating source alone does not republish the site.

## Boundaries

The public site is static. The local API, MCP transport and optional Ollama adapter are not hosted by Pages. Model calls, Docker image execution and paid infrastructure deployment were not performed. Email drafts were delivered separately for private review and were not sent.

## Architecture explanation update / Atualização da explicação

The PT/EN Architecture page now explains the proposed context → retrieval → LLM advice → decision workflow, framework responsibilities and evaluation criteria. This is explanatory content; no LangChain, LangGraph or generative RAG integration was added.

Validation: production build and whitespace check passed. The new section was visually reviewed at 390 and 1440 px without document overflow; both disclosures expanded successfully. The public JavaScript bundle `index-BI4qp9Yj.js` matches the local build byte-for-byte and contains the expanded section. Existing regression results above apply to the unchanged execution logic. The email redesign is delivered privately outside the published repository.
