# AGENTS.md

Instructions for OpenCode/agent sessions working in this repository.

## What this repo is

MERN-style **Report Builder** — Amharic speech-to-report web app for restaurant supervision. Two npm packages, both ESM (`"type": "module"`), npm only, lockfiles committed:

- `backend/` — Node.js + Express 5 + Mongoose 9, port 4000.
- `client/` — React 19 + Vite 8 + MUI v9 + Redux Toolkit (RTK Query), port 3000.

| Task | Where | Command |
| --- | --- | --- |
| Backend dev | `backend/` | `npm run dev` (nodemon) |
| Backend syntax check | changed `.js` files | `node --check <file>` |
| Client dev | `client/` | `npm run dev` |
| Client build gate | `client/` | `npx vite build` → must be 0 errors → **delete `dist/*` afterwards, always** |
| Client lint | `client/` | `npm run lint` |

There are **no test suites** and none may be added (see exclusions). `npm test` in backend intentionally fails.

## The spec and its trust level

`docs/project-specification.md` (~15k lines, sections §1–§69) is the **sole behavioral source of truth**: business rules, models, API contracts, UI specs, report format (§6), language rules (§7), AI behavior (§8).

But the spec's **implementation-status claims are unreliable**. Its §15 tree marks large parts of the backend/frontend `(implemented)` and §13.5/§66 record installs/amendments that do not exist in this working copy (git had zero commits while those markers were written). Therefore:

- Treat spec sections as behavioral canon; treat every "(implemented)" / "installed" / phase-completion claim as **unverified until you check the actual filesystem, git log, and manifests**.
- When spec tables conflict with `package.json`, the manifest wins (spec §13.1 agrees).
- Never silently invent behavior the spec doesn't decide — surface the gap to the user instead.

## Implementation workflow (mandatory)

Work is delivered through the spec §66 phase protocol (P1–P8) using the §9.8 six-step git protocol, broken into small tasks:

1. **Pre-git:** check status, create feature branch `phase-N-description`. No direct commits to `main`.
2. **Step-1.1 identification:** before writing anything, identify *everything* related to the task — all spec sections it touches, all files it creates/edits, its constants/env/spec-tree mirrors, and its validation gates.
3. **Deep analysis:** read the current code and all prior-phase commits/working files before executing.
4. **Execute sub-tasks**, each closed by its listed validation (see gates below).
5. **User review + explicit approval** — hard gate. Show a diff summary and exit-gate results. Step 6 never runs without it.
6. **Post-git:** stage after diff review, commit (`feat: phase N description`; `chore:` for hardening), push branch, merge to main, delete branch. No amending after push.

Same-change discipline (§66.6): any change to shared truth updates its spec mirrors **in the same commit** — §15 tree ↔ files, §13 tables ↔ manifests, §14 ADR index, §11 constants ↔ consumers.

Phase working files (`task_plan.md`, `findings.md`, `progress.md`) track multi-step work across sessions (§66.3); they are process artifacts, never imported by runtime code.

## Skills & MCPs — required before implementing

Before each implementation, invoke the applicable skills/MCPs — do not skip them:

- **superpowers suite** (`~/.config/opencode/node_modules/superpowers/skills/`): `brainstorming` before any creative/feature work; `test-driven-development` mindset where validation applies; `systematic-debugging` for any bug/failure; `verification-before-completion` before claiming done; `writing-plans`/`executing-plans` for phase plans; `requesting-code-review` at review gates.
- **planning-with-files** (`~/.agents/skills/`) for the §66.3 working-files practice on multi-step work.
- **frontend-design** (`~/.agents/skills/`) for every UI task — deliberate, distinctive design; templated default looks are not acceptable as a finish (§66.4).
- **mui-mcp** (configured in `~/.config/opencode/opencode.json`) for any MUI/MUI X component or docs question — this repo targets MUI v9 pairing; consult it before writing MUI code instead of guessing APIs.

## Hard engineering gates (every change — SC-6/SC-7)

- **No magic values:** literals live in `utils/constants.js` (UPPER_SNAKE_CASE) or `config/env.js`; both objects frozen. Nothing inline in controllers/components.
- **No `console.log` in backend** — Winston logger only.
- **No numeric HTTP status codes** — semantic names from `utils/httpStatus.js` only.
- **`_id` everywhere:** never access `.id`, never add `id` fields on models or DTOs.
- **JSDoc on new/edited functions;** remove unused imports/variables/parameters.
- **Secrets:** AI keys (Addis `sk_…`, Gemini, NVIDIA) live only in `backend/.env` — never in client code, `VITE_` vars, localStorage, Redux state, or logs. All provider calls go through the backend proxy.
- Client build passes with 0 errors and `dist/` deleted; backend files pass `node --check`.

## Permanent stack exclusions (do not introduce)

TypeScript · Next.js/SSR · Tailwind · zod · automated test frameworks · axios on the client (RTK Query `fetchBaseQuery` only) · client-side AI SDKs or browser keys · WebSocket/streaming deps · S3/GridFS (audio stays local under `uploads/`). MUI community edition only. Reversing any requires explicit user approval plus spec §9+§13 changes.

Dependencies are added only via the owning phase or explicit approval (§13.7) — never install proactively; lockfile updates commit with the phase.

## Environment policy

- `.env` files are gitignored, never committed, and **never create `.env.example`**.
- Only `backend/config/env.js` reads `process.env` anywhere; it exports one validated, frozen `env` object. Missing required vars fail fast at boot.
- Client env vars must be `VITE_`-prefixed, read via `import.meta.env.*` only.

## Conventions that differ from defaults

- JS modules kebab-case (`httpStatus.js`, `stt.service.js`); React components PascalCase, one exported component per file named after itself; reusable MUI components prefixed `Mui*` in `client/src/components/reusable/`; **no barrel files**.
- API envelope: `{ success, message, data }`; paginated data adds `{ docs, page, limit, totalDocs, totalPages }` (`mongoose-paginate-v2`, server-side pagination).
- UI language is English; audio/transcription/report content may be Amharic — never force translation; English tech words become Amharic workplace transliteration (e.g. `deep fryer` → `ዲፕ ፍራየር`).
- Domain dates are Ethiopian calendar, displayed numeric `DD-MM-YY`; convert only via `ethiopianDate.js` utilities + dayjs — no native `Date` arithmetic on domain dates. Times 24h `HH:mm`.
- Statuses are lowercase enums; providers are exactly `addis`/`gemini`/`nvidia`; route paths kebab-case.
- Report content model: `raw` (original STT/plain text, written once) + `latest` (current, rich HTML) — single undo via revert, no version chain.

## Current state (as of 2026-08-24 — verify, don't trust)

- Git `main` at 0 commits; nothing tracked yet.
- `backend/`: manifest + `.env` only — no source files exist despite spec §15 marking them implemented.
- `client/`: Vite scaffold + `src/theme/` started (`AppTheme.jsx`, `themePrimitives.js`, `customizations/*`); `main.jsx`/`App.jsx` still scaffold stubs; TipTap/dompurify not installed.
- Effective progress ≈ P1/P2 territory of the §66 plan; reconcile against reality at session start.
