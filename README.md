# yamper

Public site for this repo is served from `main` by Cloudflare Pages. Agents use trunk-based development: each iteration lands on `main` so Cloudflare can publish it.

## How agents ship

Cursor Cloud Agents cannot work directly on `main`. They create a short-lived `cursor/*` branch and a pull request. This repo treats that PR as a same-day merge to trunk, not a long-lived review branch.

```text
agent iteration
  → commit + push on cursor/*
  → PR targeting main
  → GitHub Action squash-merges to main
  → Cloudflare Pages deploys the public site
```

`.github/workflows/merge-to-trunk.yml` squash-merges every `cursor/*` PR into `main` after it is opened or updated. Add the `do-not-merge` label to skip that for a specific PR.

## One-time dashboard setup

These two steps are outside the repository and only need to be done once.

### 1. Let GitHub Actions merge

Open [GitHub Actions settings](https://github.com/toli-y/yamper/settings/actions) and set **Workflow permissions** to **Read and write permissions**.

Without that, the merge workflow cannot squash-merge agent PRs.

Do not require pull-request reviews on `main` unless you also give the workflow a token that can satisfy those reviews. Required reviews will block automatic trunk merges.

### 2. Connect Cloudflare Pages to `main`

1. In the Cloudflare dashboard, go to **Workers & Pages**.
2. **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub and select `toli-y/yamper`.
4. Set **Production branch** to `main`.
5. Framework preset: **None**.
6. **Build command**: leave empty.
7. **Build output directory**: `public`.
8. Save and deploy.

After that, every merge to `main` is pulled automatically and published to the Pages URL. Static files live in `public/`.
