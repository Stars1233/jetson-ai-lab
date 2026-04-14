---
name: jetson-model-catalog-inference
description: Edit Jetson AI Lab model catalog Markdown so the Run on Jetson UI, serve matrix, and one-shot sections render correctly from frontmatter. Use when adding or editing model pages, inference engines, serve/run commands, or one-shot inference blocks.
license: Apache-2.0
compatibility: Requires Node.js and npm for build verification of model schema changes.
---

# Jetson AI Lab: model catalog and inference frontmatter

## Reality check

- **Jetson AI Lab** is a **static Astro site**. It does **not** host inference APIs. Users copy commands from the site and run them on a Jetson (or other machine).
- Model pages are **Markdown files** in the Astro content collection **`models`**: path pattern `src/content/models/<slug>.md`.
- The file **`slug`** (filename without `.md`) becomes the URL segment: published route **`/models/<slug>`** (see page wiring in `src/pages/models/[slug].astro`).
- Commands shown in **Serve the model**, **Call the model**, and **one-shot** modals come **only** from that file’s YAML frontmatter (and from shared layout/components that read it).

Do **not** invent a base URL for “the Jetson AI Lab inference API”—there isn’t one.

---

## Minimal anatomy

1. **File location:** `src/content/models/<slug>.md` (e.g. `qwen3-vl-8b.md` → `/models/qwen3-vl-8b`).
2. **Frontmatter** must satisfy **`modelsSchema`** in `src/content/config.ts` (required fields include `title`, `short_description`, `vision_capable`, `memory_requirements`, `precision`, `model_size`, etc.).
3. **`vision_capable`** (boolean, **required**): drives the hero line “Vision (VLM)” Yes/No on the model page (`src/pages/models/[slug].astro`). Set `true` for VLMs / models that accept image or video inputs; `false` for text-only catalog entries.

---

## Frontmatter tag reference

Every model page is driven by its YAML frontmatter. The table below lists every recognized tag, whether it is required, and what it controls.

### Always-include tags

These tags are either schema-required (build fails without them) or used by **every model in the repo** (schema-optional but expected in practice). Include all of them when adding a new model.

| Tag | Schema | What it does |
|-----|--------|--------------|
| `title` | **required** | Display name on the model page and catalog cards. |
| `short_description` | **required** | One-line summary shown in the catalog grid. |
| `vision_capable` | **required** | `true` for VLMs (image/video input); `false` for text-only. Drives the "Vision (VLM)" badge. |
| `memory_requirements` | **required** | e.g. `"16GB RAM"`. Shown in the specs sidebar. |
| `precision` | **required** | e.g. `"W4A16"`, `"Q4_K_M GGUF"`. Quantization / precision label. |
| `model_size` | **required** | e.g. `"12GB"`. Download / disk size shown in specs. |
| `model_id` | optional | Explicit model identifier (usually matches the filename slug). Used by 100% of models. |
| `family` | optional | Groups related models in the catalog (e.g. `"OpenAI GPT OSS"`). Used by 100% of models. |
| `icon` | optional | Emoji shown on catalog cards. Used by 100% of models. |
| `is_new` | optional | Adds a "New" badge to catalog cards. Used by 100% of models (set `false` once the model is no longer new). |
| `order` | optional | Controls sort position inside the catalog grid. Used by 100% of models. |
| `type` | optional | Category label (e.g. `"Text"`, `"Multimodal"`). Used by 100% of models. |
| `hf_checkpoint` | optional | HuggingFace model id used in commands (e.g. `"openai/gpt-oss-20b"`). Used by 100% of models. |
| `huggingface_url` | optional | Link to the HuggingFace model card. Used by 100% of models. |
| `minimum_jetson` | optional | Smallest Jetson that can run the model (e.g. `"AGX Orin"`, `"Orin Nano"`). Used by 100% of models. |

### Situational tags

Only add these when the model needs them. Most models do not.

| Tag | When to use | Repo usage |
|-----|-------------|:----------:|
| `build_nvidia_url` | Model has an NVIDIA Build page. | ~67% of models |
| `matrix_modules_disabled` | Some matrix module tabs should be grayed out for this model. | ~10% of models |
| `hide_run_button` | Hide the entire Run/Serve UI even though engine data exists (e.g. model not yet launchable). | ~5% of models |

### Inference blocks (at least one required unless `hide_run_button: true`)

| Block | Purpose |
|-------|---------|
| `supported_inference_engines` | Legacy engine array — still works, used by most existing models. |
| `serving.entries` | New-style engine list — preferred for new models, overrides the legacy array. |
| `one_shot_inference` | One-shot run commands (shell, python, per-module variants). |
| `client_call` | Curl / Python snippet for calling a served model (shown in "Call the model"). |
| `benchmark` | Per-platform performance numbers (orin / thor: concurrency1, concurrency8, ttftMs). |


## Inference data: serve matrix (engines)

The UI builds the engine list with **`getSupportedInferenceEngines`** in `src/lib/modelFrontmatterAdapter.ts`:

- If **`serving.entries`** exists and has **one or more** entries, those entries are used (preferred for new work).
- Otherwise **`supported_inference_engines`** (legacy array) is used.

Each engine row maps to **`SupportedEngineEntry`** in `src/lib/inferenceCommands.ts`. Prefer:

- **`serve_command_orin`** / **`serve_command_thor`** for long-running serve commands (vLLM, Ollama, etc.).
- Legacy **`run_command_orin`** / **`run_command_thor`** still work as fallbacks for the serve matrix but are **deprecated** in favor of `serve_command_*` (see comments on `SupportedEngineEntry`).

Optional fields (non-exhaustive):

- **`modules_supported`**: array of **matrix module ids** this engine supports; others may appear grayed for that engine.
- **`run_commands_by_module`**: map from module id → command string for **Run** matrix cells.
- **`matrix_modules_disabled`** (top-level frontmatter): ids to show grayed / non-clickable across the matrix.

**Canonical module ids** and labels live in **`JETSON_MATRIX_MODULES`** in `src/lib/inferenceCommands.ts` (e.g. `thor_t5000`, `thor_t4000`, `orin_agx_64`, `orin_nx_16`, `orin_nano_8`). Use these ids in `modules_supported` / `matrix_modules_disabled` / `one_shot_inference.modules_supported`—do not invent new ids unless you extend `JETSON_MATRIX_MODULES` in code (out of scope for a content-only change).

**Examples in repo:**

- Legacy-only matrix: `src/content/models/qwen3-vl-8b.md` (`supported_inference_engines` with `serve_command_orin` / `serve_command_thor`).
- New **`serving.entries`** plus **`one_shot_inference`**: `src/content/models/ministral3-8b-reasoning.md`.
- **`hide_run_button: true`**: hides the whole run block even if engines exist—e.g. `src/content/models/cosmos-reason2-8b.md` (still has engine data for docs; button hidden).

---

## One-shot inference

Optional frontmatter block **`one_shot_inference`** (see schema in `src/content/config.ts`). Typical fields:

- **`run_command_orin`**, **`run_command_thor`**, and/or **`shell`**, **`python`**
- **`shell_by_module`** / **`python_by_module`** (per matrix module)
- **`modules_supported`**, **`intro`**

Visibility: `src/components/ModelOneShotSection.astro` shows the section when at least one of those command fields is non-empty (see its `hasContent` logic). Snippet/module resolution uses **`src/lib/evalRunModal.ts`**.

---

## Validation (build will fail if wrong)

`src/content/config.ts` **`superRefine`** on the models collection (unless **`hide_run_button: true`**):

You must provide **at least one** of:

1. Non-empty **`serving.entries`**, or  
2. Non-empty **`supported_inference_engines`**, or  
3. **`one_shot_inference`** with at least one **trimmed** command among `run_command_orin`, `run_command_thor`, `shell`, `python`, or values inside `shell_by_module` / `python_by_module`.

Otherwise Zod reports a custom error on `supported_inference_engines` asking you to provide engines and/or one-shot commands or set `hide_run_button: true`.

---

## Checklist before you finish

- [ ] Required model fields present (`title`, `short_description`, `vision_capable`, `memory_requirements`, `precision`, `model_size`, …).
- [ ] Either `serving.entries` **or** `supported_inference_engines` **or** meaningful `one_shot_inference`, **or** `hide_run_button: true`.
- [ ] `serve_command_*` preferred over deprecated `run_command_*` for serve flows.
- [ ] Matrix ids match `JETSON_MATRIX_MODULES` in `src/lib/inferenceCommands.ts`.
- [ ] Run **`npm run build`** (see skill **`jetson-ai-lab-verify-build`**).

---

## Source of truth (repo files)

| Purpose | Path |
|--------|------|
| Model schema + validation | `src/content/config.ts` (`modelsSchema`, `superRefine` ~L124–145) |
| Merge `serving.entries` vs legacy | `src/lib/modelFrontmatterAdapter.ts` (`getSupportedInferenceEngines`, `servingEntryToSupportedEngine`) |
| Engine types, matrix ids, serve/run semantics | `src/lib/inferenceCommands.ts` (`SupportedEngineEntry`, `JETSON_MATRIX_MODULES`, matrix helpers) |
| Model page layout | `src/pages/models/[slug].astro` |
| Serve matrix UI | `src/components/ModelServeSection.astro` |
| Call / client examples | `src/components/ModelCallSection.astro` |
| One-shot UI | `src/components/ModelOneShotSection.astro` |
| One-shot snippet logic | `src/lib/evalRunModal.ts` |
| Benchmarks (optional) | `src/components/ModelBenchmarkSection.astro` + `benchmark` in schema |
