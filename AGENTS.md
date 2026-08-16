# Agent instructions

This repository uses **trunk-based development**. `main` is trunk. Cloudflare Pages deploys the public site from `main` whenever it moves.

## Git workflow

Cloud agents still work on a short-lived `cursor/*` branch and open a pull request. That PR is the delivery vehicle, not a long-lived review queue.

After each iteration (each turn that changed code):

1. Commit and push.
2. Create or update the PR against `main`, and mark it ready (`draft: false`).
3. `.github/workflows/merge-to-trunk.yml` squash-merges `cursor/*` PRs into `main` and deletes the branch.
4. Fetch `origin/main` before the next iteration. Do not keep committing on a merged branch.

To hold a PR open, add the `do-not-merge` label. Only do that when the user asks.

## Public site

Static files live in `public/`. Cloudflare Pages serves that directory from `main`. After a merge, the production URL updates without any extra deploy step from the agent.
