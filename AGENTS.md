# AGENTS.md

Instructions for OpenCode/agent sessions working in this repository.

## Spec trust overlay — models, API contracts, pages (owner directive, 2026-09-01)

**`docs/project-specification.md` is NOT a single source of truth for:**

- **§18–§24A — Domain models** (User, Branch, Report, Audio,
  Transcription, ChatConversation, Item): every schema's field contracts
  and indexes.
- **§30–§39 — Domain API contracts** (Branch CRUD/lifecycle, Report,
  Audio, STT, Generation, Correction, Chat, Export, Analytics, Search) —
  incl. §30.2 filter semantics and §30.6 delete flow.
- **§48–§59 — Pages & features** (auth pages, dashboard, reports
  list/detail, branches §56.2/§56.3/§56.5/§56.6/§56.7, profile §57,
  exports §58, wizard-replacement workspace).
- **everything involved with them** — their constants, request/response
  envelope and data shapes, indexes, dependent models, and the pages/
  reusable components that realize them.

**Instead:** every single detail in these areas becomes binding ONLY
when it is amended WITH the owner during the Step-1.1 identification of
each phase/task/sub-task and recorded in `findings.md` / `progress.md` /
`task_plan.md` / `AGENTS.md` in the same working tree (§66.6 same-commit
mirrors). Spec text alone carries no weight for these areas; a detail
stays out until owner-amended (KNOWN OR AMENDED ONLY, Rule #1). Already
owner-amended branches state and built, owner-reviewed code are
unaffected. These sections remain behavioral reference only, pending
owner amendment.

## Current campaign — Phase 6 Trust Overlay Amendments

**Branch:** `phase-6-trust-overlay-amendments`
**Objective:** amend every detail in the trust-overlay scope for the
reports domain — data models (§21/§24A/§22/§23/§24) and API contracts
(§31–§39) — one resource at a time, with the owner, during Step-1.1.
Design-only; no implementation in this phase.

**Roadmap:** R1–R10 increment table with dependency chain and involved
sets — see `task_plan.md` Phase 6 section.

**Progress:**
- R1 complete (design-only): Report model §21 + Report & Status API §31
  amended. See `findings.md`/`progress.md`/`task_plan.md` + spec §21/§31.
- R3 complete (design-only): Audio model §22 + Audio API §32 amended
  (nested `/reports/:reportId/clips`, no stream, direct-delete,
  final-clip→draft, add-at-transcribed keeps status/drops readiness,
  temp-chunk-cleanup, Audio-tab one-card layout). See
  `findings.md`/`progress.md`/`task_plan.md` + spec §22/§32.
- **CONSOLIDATED user-first re-amendment done (2026-09-01):** SUPERSEDES R1 and R3.
  Report = single collection with embedded `audios[]` + `transcription{raw,latest}`;
  NO `status`/`generatedAt`/`contributions`/`items`-embedded. Item = separate collection;
  GenerationPreset = user CRUD (no default); ChatConversation = per report. Create =
  atomic multipart `POST /reports` (`metadata`+`clips[]`+lazy `createKey`) with attempt-session
  incremental retry; Addis-only STT (Path A, no prompts). Post-creation = `/edit` 3 tabs +
  `/chat` card protocol (Copy/Re-try/Like-accept-revert; one accepted per report) with a
  grounded-history digest agent. Full record: `findings.md` "CONSOLIDATED re-amendment";
  `task_plan.md` "Consolidated supersession".
- **FULL spec reconciliation sweep done (2026-09-01):** `docs/project-specification.md`
  top-to-bottom reconciled to the consolidated model — §5/§6/§11/§17/§18.7/§21/§22/§23/§24/
  §24A/§25/§31–§39/§41/§46/§49–§58/§62/§66/§69. Report = embedded audios/transcription +
  `generated`; no status machine; §52 wizard RETIRED; atoms of the per-type item statuses
  (activities completed|in_progress default completed; issues reported|in_progress|completed
  default reported; comments no status/no rating; `text` field; status-update = direct PATCH, closed 2026-09-01).
  See `progress.md` sweep record.

**Progress:**
- R2 complete (design-only): **Item resource** amended — model/ItemDto/lists/
  status PATCH (see `findings.md`/`progress.md`/`task_plan.md` + spec
  §24A/§31.6/§31.9). Two-surface split confirmed (`GET .../reports/:reportId/
  items` report-context + `GET /items` cross-report boss/agent/sheet); 401 =
  global auth gate only; 403 archived; status-update direct PATCH
  (same-status→200, not generated-gated).

**Status:** consolidated re-amendment complete (supersedes R1/R3). R1/R3/R2
amended; open items closed (2026-09-01); GET /items contract confirmed.
**R2 done. Next = R4 transcription-create details** (pending-clip/re-transcribe
bookkeeping), then R5 Generation+Presets (digest+exemplars), R6 Correction,
R7 Chat (streaming + MUI), R8 Export, R9/R10. Remaining open only: GET /items
consumer page (later), chat streaming (R7).

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
- **The spec is wrong but not entirely wrong:** While its implementation-status claims are unreliable, it contains foundational truths that cannot be wrong (e.g., JSDoc everywhere, arrow functions, `_id` everywhere, semantic HTTP status names, icon-only buttons on `xs`).
- **Exhaustive Brainstorm & Identification:** For every implementation task, we must perform deep analysis during brainstorming to explicitly separate these canonical truths (Canon Inventory) from outdated plans (Amendments).
- **Same-Change Discipline (§66.6):** Every single amendment must be noted down in the planning working files, `AGENTS.md`, and `docs/project-specification.md` (as a physical text amendment) in the same commit as the code changes. Once identified and amended, these rules must be respected throughout the remaining lifecycle.
- When spec tables conflict with `package.json`, the manifest wins (spec §13.1 agrees).
- Never silently invent behavior the spec doesn't decide — surface the gap to the user instead.

## Implementation workflow (mandatory)

### Standing scope rule — KNOWN OR AMENDED ONLY (owner directive, 2026-08-24)

**Every single thing done in this repo must be done for known or
amended things only.** Nothing is implemented, installed,
transcribed, or planned speculatively — this covers constants,
features, files, directories, dependencies, every artifact alike:

- **Known** — what is logically valid or already established
  regardless of spec wording: foundational truths (the problem the
  product exists to solve, §1), decisions settled before this
  session (e.g., the `[auth → branches → reports]` priority), and
  things valid by nature in every case (e.g., HTTP status codes).
  Spec text does not by itself make a thing known.
- **Amended** — what the task's §9.8 Step-1.1 identification
  explicitly decides to change for that task, with its same-commit
  mirrors (§66.6). Every Step-1.1 names what is known and what is
  amended before any code is written.
- **Define on require.** A spec-declared item that was not amended
  is left out even when the spec schedules it now; when a real
  consumer requires it, it is created then, in its proper place —
  so every entry carries a proven need and a reason. This applies
  to anything: constants, env vars, directories, structures,
  features, dependencies.
- Spec sections describing unconfirmed or superseded plans are
  **inert** — never a build trigger (example: the §52 wizard is
  dropped; its sections and constants stay out of the codebase
  until re-confirmed).
- If any other instruction appears to authorize speculative work,
  THIS RULE WINS until the owner amends it.

Work is delivered through the spec §66 phase protocol (P1–P8) using the §9.8 six-step git protocol, broken into small tasks:

1. **Pre-git:** check status, create feature branch `phase-N-description`. No direct commits to `main`.
2. **Deep analysis:** read the current code and all prior-phase commits/working files before executing. Consult mui-mcp for MUI/MUI X APIs when applicable.
3. **Step-1.1 identification:** after deep analysis, identify *everything* related to the task — all canon items from spec that apply (rules that can't be wrong), all spec amendments, all files it creates/edits, its constants/env/spec-tree mirrors, and its validation gates. Record canon inventory and amendments in working files before any code is written.
4. **Execute sub-tasks**, each closed by its listed validation (see gates below). **No commit happens in this phase — work stays uncommitted in the working tree.**
5. **User review + explicit approval BEFORE any commit** — hard gate (owner directive 2026-08-24: the step-5 review precedes committing, always; no interim commits). Show a diff summary and exit-gate results. Only after approval: commit → push → merge → delete branch.
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

- **No direct alignItems prop on Stack:** Direct `alignItems` property on `<Stack>` components is forbidden. All layouts using `<Stack>` must specify alignment via the `sx` prop (e.g., `sx={{ alignItems: "center" }}`) to adhere to v9 conventions.
- **No deprecated MUI props:** never `PaperProps` / `primaryTypographyProps` / `ModalProps` / `TransitionProps` etc. — v9 slot form only (`slotProps={{ paper: … }}`, direct child Typography). mui-mcp is the mandatory first stop for every MUI/MUI X API (owner directive 2026-08-26).
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

- JS modules kebab-case (`httpStatus.js`, `stt.service.js`); React components PascalCase, one exported component per file named after itself; reusable MUI components prefixed `Mui*` in `client/src/components/reusable/`; **no barrel files**. **No MUI barrel imports:** never `import { X } from "@mui/material"` (root) or `import { A, B } from "@mui/icons-material"` — always tree-shaken single/subpath imports (`import X from "@mui/material/X"`, `import Icon from "@mui/icons-material/Icon"`, `import { useTheme } from "@mui/material/styles"`). `@mui/x-data-grid`/`@mui/x-date-pickers` named top-level imports are fine (separate packages).
- **ALL reusable components (`client/src/components/reusable/`) are page-agnostic and generic** (owner directive 2026-08-31) — used based on the page we are on; never hardcode a page's feature into a reusable component. `MuiDataGrid`+`MuiDataGridToolbar` especially: the toolbar is per-feature opt-in configurable (Print/CSV/PDF/Excel via `slotProps.toolbar`); a page enables only what it needs (Branches leaves export/Print off per C29; Reports/others may enable later). `export` is a reserved word — never a prop name (use `showExport`, etc.).
- **Arrow functions everywhere** (owner directive 2026-08-24); exceptions only where semantics force otherwise: mongoose hooks/methods/virtuals (`this`), class declarations/constructors.
- **Event handlers in components use `useCallback`** (owner directive 2026-08-31) with correctly specified deps — empty `[]` when the handler touches only stable setters/log. Apply consistently across all pages and consumer components (matches existing `useLogout.js`, `AppShell.jsx`, `MuiTextField.jsx`; mirrors spec §46.2).
- **Query loading gate = "no content yet" (`!data && !error`), never `isLoading`** (owner directive 2026-08-31). `isLoading` stays true until a request settles and spins forever on a hung request; `!data && !error` flips off the moment a response (success or error) arrives. Apply to every RTK Query surface (mirrors spec §46.14).
- **Redux envelope is unwrapped once in `apiSlice` (`unwrapEnvelope`)** — query consumers and `providesTags`/`invalidatesTags` callbacks read the inner payload directly (`result.docs`, `result.page`, …), **never `result.data.*`** (a `result.data.docs` access in `providesTags` throws → `data` undefined). Mirrors spec §42.4.
- **Server-side list pagination is `mongoose-paginate-v2` registered PER-SCHEMA via `.plugin()`** before model compilation; list controllers call `Model.paginate`. There is no `utils/pagination.js` wrapper — the spec §15 claim of one was false (corrected to removed/deprecated, 2026-08-31). Never rely on a spec-claimed file; verify the filesystem (mirrors spec §27.6).
- **`validate()` is a factory — always INVOKE it as `validate()` in route chains, never pass the bare `validate` reference** (C24, 2026-08-31). A bare reference makes Express call it as `validate(req, res, next)` → `req` lands in `options`, the inner middleware is returned but ignored, `next()` never runs → the request **hangs forever with no response** (Postman "always loading" while `/health` responds). Mirrors spec §29.2/§29.3.
- **Forms use `react-hook-form` with `register`, never `Controller` for plain fields** (C25, 2026-08-31) — `Controller` is reserved for MUI X DatePicker/TimePicker only (spec §46/§9.6). `MuiTextField` forwards its ref via `inputRef`, so `register` works directly. Mirrors spec §46/§9.6.
- **Server errors surface through toasts, never `setError`** (C27, 2026-08-31; §9.6/ADR-033/§60) — `setError`/field `errors` are client-side rule failures only. Submit handlers `await mutation(values).unwrap()` then toast success, catch → toast error. Mirrors spec §9.6/§60.
- **No quick filter/search in any DataGrid or grid toolbar** (C29, STRICT 2026-08-31) — there is exactly one global search on `MuiAppbar` (built in a later phase). No `QuickFilter`, no `showQuickFilter`, no per-page search, on any grid/page. Mirrors spec §46.8/§46.9.
- **Page-level full-page load/error/empty states are primary** (C30, 2026-08-31) — grid `loadingOverlay`/`noRowsOverlay` only for in-grid refetch/pagination feedback; reuse existing `LoadingSpinner`/`MuiEmptyState`, never new overlay components. Mirrors spec §46.14.
- **Grid column widths use `flex`, never hardcoded `width`** (C31, 2026-08-31) — in every domain column file (`columns/*.jsx`), each column uses `flex` (+ `minWidth`, optionally `maxWidth`) so the grid distributes the full horizontal space proportionally. No `width:` in any column, for all current/future columns. `MuiDataGrid` sets `disableColumnResize` (resizing off; widths come from the column definitions). Mirrors spec §46.8.
- **Card/list grids use MUI `Grid` with the `size` prop** (C32, 2026-08-31) — e.g. `<Grid container spacing={2}>` + `<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>`. **NEVER `gridTemplateColumns`** anywhere. Mirrors spec §46.8/§56.7.
- **`MuiPagination` is list/card-view ONLY, and only when total pages > 1** (C33, 2026-08-31) — shown beside the card list when `totalPages > 1`, 1-indexed, changes mapped to the shared 0-indexed `paginationModel`. The grid never uses it. Mirrors spec §46.7/§56.7.
- **Prefer `Stack` over `Box`** (C34, 2026-08-31) — pass valid non-`sx` Stack props (`direction`, `spacing`); alignment via `sx={{ alignItems: … }}`, never a direct `alignItems` prop on `<Stack>`. Mirrors spec §46.8.
- **Reusable/branch components are never committed "blind"** (owner directive 2026-08-31) — each is wired into the Branches page, rendered live, reviewed in-browser by the owner, and approved before its commit (applies to MuiDataGrid, MuiDataGridToolbar, MuiPagination, BranchLedgerCard, BranchRowActions, dialog integration).
- **Controllers use `express-async-handler`** — no manual try/catch → `next(error)` boilerplate (owner directive 2026-08-24).
- RTK Query domain endpoint sets live at `redux/features/<domain>Slice.js` (owner directive 2026-08-24; `userSlice.js` not `authEndpoints.js`).
- `LocalizationProvider` mounts exactly once in `main.jsx` — never per page/component.
- Every request error funnels to the global handler; every user-facing message is plain end-user language.
- API envelope: `{ success, message, data }`; paginated data adds `{ docs, page, limit, totalDocs, totalPages }` (`mongoose-paginate-v2`, server-side pagination).
- UI language is English; audio/transcription/report content may be Amharic — never force translation; English tech words become Amharic workplace transliteration (e.g. `deep fryer` → `ዲፕ ፍራየር`).
- Domain dates are Ethiopian calendar, displayed numeric `DD-MM-YY`; convert only via `ethiopianDate.js` utilities + dayjs — no native `Date` arithmetic on domain dates. Times 24h `HH:mm`.
- **Avatar/identifier colors are deterministic** (A40/A41, 2026-08-31) — first-letter avatars derive a stable "known random" color via `utils/avatarColor.js` (`getAvatarColor(seed)` hashes into the frozen `AVATAR_COLORS` palette in `constants.js`), so the same entity always renders the same color across renders/reloads. No inline `Math.random()` color per render.
- Statuses are lowercase enums; providers are exactly `addis`/`gemini`/`nvidia`; route paths kebab-case.
- Report content model: `raw` (original STT/plain text, written once) + `latest` (current, rich HTML) — single undo via revert, no version chain.

## Current state (as of 2026-08-31 — verify, don't trust)

- **Phase 5 (branches frontend) MERGED 2026-09-01:** `main` tip `6e6e7c4` (was `364eb24`); branch `phase-5-branches-frontend` deleted locally + remotely. **Standing workflow (2026-09-01):** interim increments are add/commit/push only; the step-6 close (commit → push → ff-merge → delete branch) runs once the owner approves the phase (overrides the earlier "no merge ever" note). Next phase starts from a new `phase-N-description` branch off `main`.
- **Branches-foundation context (owner, 2026-09-01):** Branches is a **foundation resource** — the C′ work is the start, not the finish; many things remain for it (Branch Details page §56.5, Name-cell link, reports-domain cascade). It was done first because **reports are dependent on branches**: without a created branch nothing reports-bound could start. Branches unblock the entire reports domain (spec: branches are the report's primary dimension, §56; fixture order users → branches → reports, §5916).
- `backend/`: `branch` domain (controller/routes/validator) + `auth` + `utils/constants.js` `PAGINATION_*`; paginated list with limit default 10 (1–100 clamp). `deleteBranch` (2026-09-01): finds the branch by `{ _id, user, isArchived: true }` → 404 if not found (DELETE targets already-archived rows only; Archive is the separate action that sets `isArchived`) → deletes the branch row + all linked resources in one session, responds `{ success, message: "Branch deleted", data: null }`. No `updateOne` in the delete. **Deferred to reports phase (STRICT TODO, 2026-09-01):** the linked-resource cascade (branch → reports → items → audios → transcriptions → chat) has no schemas yet, so only the branch row is removed now (nothing can reference it); a TODO comment marks the cascade spot (§17.4/§62). No immediate `mongoose.model("Report"/"Item")` deref (those schemas are later-phase).
- `client/`: theme + `redux` (`apiSlice` tagTypes `["User","Branch"]`; `store.js` side-effect imports `userSlice` + `branchesSlice`; `authSlice` persisted) + `MuiPageHeader` (+`hideTitle`), `BranchesHeaderActions`, `Branches.jsx` (fetch/loading/error/empty + `branchColumns` memo with lifecycle handlers + per-row `getActionLoading` + card view + grid view), reusable belt (`MuiButton`, `MuiTextField`, `LoadingSpinner`, `MuiEmptyState`, `MuiErrorState`, `MuiDialog`, `MuiConfirmDialog`, `MuiPageHeader`, `MuiAppbar`, `MuiStatusBadge`, `MuiDataGrid`(+`Toolbar`), `MuiPagination`), layout/shell (`AppShell`, `MuiSidebar`, `AvatarMenu`, `Logo`, `ThemeToggle`, `PublicLayout`, `ProtectedRoute`, `PublicRoute`, `AppToastContainer`), `AuthSheet`/`LoginForm`/`RegisterForm`/`BrandPanel`/`GoogleOAuthButton`, `branch` components (`BranchLedgerCard` card view; `BranchRowActions` grid Actions column; `BranchesFilterMenu`; `BranchFormDialog`; `BranchesHeaderActions`), `columns/branches.jsx` (Name/Location/Status/Created/Actions, flex widths C31), redux slices (`apiSlice`, `authSlice`, `userSlice`, `branchesSlice`), `utils/constants.js`/`avatarColor.js`/`ethiopianDate.js`/`toast.js`/`httpStatus.js`. **`MuiPagination` (2026-09-01 correction — WAS "pending", verified WRONG):** wired into the card/list view at `Branches.jsx:353-359` (`count=totalPages`, `page=paginationModel.page+1`, `onChange=handlePaginationChange`, gated by `totalPages > 1` per C33), committed in B′ `2f8151c`.
- Effective progress: phase 5 (branches frontend) MERGED to `main` `6e6e7c4` — header + fetch/loading/error/empty + card/list view + full lifecycle (B′ `2f8151c`) + **grid Actions column (C′)** (`BranchRowActions` rewrite + `columns/branches.jsx` actions column + barrel-import cleanup; owner-approved, merged 2026-09-01). **Remaining for branches (foundation, next increments):** Branch Details page `/branches/:branchId` (§56.5, `GET /branches/:branchId/detail` not implemented), Name-cell link to details (§56.3), reports-domain cascade (reports → items → audios → transcriptions → chat; STRICT TODO in `deleteBranch`). Next phase starts from a new `phase-N-description` branch off `main`.
