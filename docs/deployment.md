# Publication record / Registro de publicação

Verified on **2026-10-26**.

- Public URL: https://wesleyvieira99.github.io/doordashSafeChat/
- Source implementation: `f5e884aeb97a65c379ab3e81484b77a47209fc18` on `main`.
- Published static artifact: `cf2e26e3f33cfeb1b56dcf7033439dfd057f8c05` on `gh-pages`.
- Pages configuration: deploy from `gh-pages` at `/`; `.nojekyll` prevents Jekyll processing.
- Pages build `1316563221`: **built**, no error.
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
