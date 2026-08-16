# yamper

Public site for this repo is served from `main` by Cloudflare Workers static assets. Agents use trunk-based development: each iteration lands on `main` so Cloudflare can publish it.

## How agents ship

Cursor Cloud Agents cannot work directly on `main`. They create a short-lived `cursor/*` branch and a pull request. This repo treats that PR as a same-day merge to trunk, not a long-lived review branch.

```text
agent iteration
  → commit + push on cursor/*
  → PR targeting main
  → GitHub Action squash-merges to main
  → Cloudflare deploys the public site from main
```

`.github/workflows/merge-to-trunk.yml` squash-merges every `cursor/*` PR into `main` after it is opened or updated. Add the `do-not-merge` label to skip that for a specific PR.

## One-time dashboard setup

These two steps are outside the repository and only need to be done once.

### 1. Let GitHub Actions merge

Open [GitHub Actions settings](https://github.com/toli-y/yamper/settings/actions) and set **Workflow permissions** to **Read and write permissions**.

Without that, the merge workflow cannot squash-merge agent PRs.

Do not require pull-request reviews on `main` unless you also give the workflow a token that can satisfy those reviews. Required reviews will block automatic trunk merges.

### 2. Connect Cloudflare to `main`

Connect the GitHub repo so Cloudflare runs `wrangler deploy` on every push to `main`. `wrangler.toml` tells Wrangler this is an assets-only Worker: it serves `public/` and does not need a Worker script.

After that, every merge to `main` is published automatically. Static files live in `public/`.
