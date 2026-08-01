# Luna Hook Portfolio

Public developer portfolio for Luna Hook, built as a static Next.js site for free GitHub Pages hosting.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run build
npm run build:pages
```

`npm run build:pages` exports the complete static site to `out/`, including all 43 plugin routes. The GitHub Pages workflow at `.github/workflows/deploy-pages.yml` builds and deploys that directory after a push to `main` or a manual workflow run.

Nothing in the repository should contain deployment secrets, bot tokens, live server data, private IDs, player records, webhooks, or private plugin source.
