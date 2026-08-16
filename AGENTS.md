# Agent instructions

This repository uses **trunk-based development**. `main` is trunk. Cloudflare deploys the public site from `main` whenever it moves.

The site is a catalog of **browser video games**. Each game is a single HTML page. Use **Three.js** for visualization, effects, and drawing.

## Git workflow

Cloud agents still work on a short-lived `cursor/*` branch and open a pull request. That PR is the delivery vehicle, not a long-lived review queue.

After each iteration (each turn that changed code):

1. Create or update the project's landing page at `public/<project-slug>/index.html`.
2. Update `public/index.html` so the table of contents lists every project and links to its landing page.
3. Commit and push.
4. Create or update the PR against `main`, and mark it ready (`draft: false`).
5. `.github/workflows/merge-to-trunk.yml` squash-merges `cursor/*` PRs into `main` and deletes the branch.
6. Fetch `origin/main` before the next iteration. Do not keep committing on a merged branch.

To hold a PR open, add the `do-not-merge` label. Only do that when the user asks.

## Public site

Static files live in `public/`. `wrangler.toml` deploys them as a Workers assets-only project (`wrangler deploy`, not `wrangler pages deploy`). After a merge, Cloudflare publishes the new revision automatically.

- Hub: https://yamper.anatoly-yevtushenko.workers.dev/
- Project landing page: https://yamper.anatoly-yevtushenko.workers.dev/<project-slug>/

## Project layout

```text
public/
  index.html                 # hub table of contents
  <project-slug>/
    index.html               # playable single-page game (landing page)
```

- One folder per project. Slug is lowercase kebab-case.
- Keep project assets inside that folder.
- The hub is a list of projects with links to each landing page. It is not a game.

Hub table row to add or update in `public/index.html`:

```html
<tr>
  <td>Space Runner</td>
  <td>Dodge asteroids in a Three.js tunnel.</td>
  <td><a href="/space-runner/">Play</a></td>
</tr>
```

Remove the "No projects yet." row when the first project is added.

## Three.js

Load Three.js from jsDelivr with an import map. Pin **0.185.1** for both the core module and addons. Do not add a bundler, `package.json`, or build step for games.

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/"
  }
}
</script>
<script type="module">
  import * as THREE from "three";
</script>
```
