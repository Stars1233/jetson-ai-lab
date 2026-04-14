---
name: jetson-ai-lab-verify-build
description: Run npm run build on jetson-ai-lab and triage Astro content collection / MDX failures after edits. Use when verifying the site builds after content, model, tutorial, or asset changes.
license: Apache-2.0
compatibility: Requires Node.js and npm. Run from the repository root where package.json lives.
---

# Jetson AI Lab: verify the build

## When to run

Run a full static build **after** any change to:

- `src/content/models/*.md`
- `src/content/tutorials/**/*.mdx` or `.md`
- Other `src/content/` collections
- `public/` (including `public/code-samples/`)

## Command

From the **repository root** (where `package.json` and `astro.config.mjs` live):

```bash
npm run build
```

Resolve all errors before merging. Do not assume ΓÇ£dev server onlyΓÇ¥ is enough for content-schema issuesΓÇö**production build** validates collections.

---

## Common failures

### Models collection (Zod / `superRefine`)

If you see an error on **`supported_inference_engines`** or a message like:

> Provide `supported_inference_engines` and/or `serving.entries` (non-empty), `one_shot_inference` commands, or set `hide_run_button: true`.

Fix the corresponding model file under **`src/content/models/`** per skill **`jetson-model-catalog-inference`** (`serving.entries` **or** `supported_inference_engines` **or** non-empty `one_shot_inference` command fields **or** `hide_run_button: true`).

### MDX / Astro parse errors

Tutorial files under **`src/content/tutorials/`** are MDX. Unescaped `$` or `~` inside **HTML** tags mixed with Markdown can break the MDX parser (use HTML entities in `<p>/<code>` where needed, or keep shell variables **inside fenced code blocks** only).

### Missing assets

Broken links to `/code-samples/...` usually mean the file is missing under **`public/code-samples/`**ΓÇösee skill **`jetson-ai-lab-code-samples`**.

---

## Source of truth

| Item | Path |
|------|------|
| Build script | `package.json` (`scripts.build`) |
| Astro config | `astro.config.mjs` |
| Model validation | `src/content/config.ts` (`models` collection `superRefine`) |
| Model catalog skill | `skills/jetson-model-catalog-inference/SKILL.md` |
| Code samples skill | `skills/jetson-ai-lab-code-samples/SKILL.md` |
