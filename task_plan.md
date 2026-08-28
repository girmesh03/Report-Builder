# Task Plan — Report Builder

Governing Rule #1 — **KNOWN OR AMENDED ONLY** (owner directive,
2026-08-24, mirrored in `AGENTS.md`): every single thing must be done
for only known or amended things. **Known** = logically valid or
already established (the §1 problem statement; decisions settled
earlier such as `[auth → branches → reports]`; naturally-valid sets
like HTTP status codes) — spec text alone makes nothing known.
**Amended** = what the task's Step-1.1 identification explicitly
decides, with same-commit mirrors. **Define on require:** a
spec-declared item not yet amended stays out even if the spec
schedules it now; it is created when a real consumer requires it, in
its proper place — proven need plus reason. Universal across
constants, env vars, directories, structures, features,
dependencies.

Governing Rule #2 — **STEP-5 REVIEW BEFORE COMMIT** (owner directive,
2026-08-24): no commit of any kind until the owner reviews the diff
and approves. One commit set per increment, post-approval only.

Governing Rule #3 — **NO LONG-BLOCKING COMMANDS** (owner directive,
2026-08-24): never run `node server.js` (even backgrounded with
redirection) through the session shell — it holds the pipe. Spawn
detached via `cmd //c start`, poll separately with sub-second
`curl -m 2`, kill by PID from `netstat`. Builds (~5 s) run alone.

Shell-slice binding note (owner directive, 2026-08-24): when the
AppShell/AppSidebar slice is built, **md+ defaults to `mini` mode**
(amends §47.4's full-default; amend §47.4 in that slice's opening
change set).

## Program plan of record (owner directives, 2026-08-24)

- Sequencing: **vertical slices by domain area** — a small specific
  backend area, then integration with its small specific frontend
  counterpart, then sync. If an area cannot reach sync, backend first
  then frontend.
- No client-side mock adapter is ever built; the §66.10 adapter plan
  and its P7 deletion gate are moot.
- Canonical §66 phase order yields to dependency-driven slices:
  `[auth → branches → reports → …]`.
- The §52 wizard is dropped (superseded UX); its sections and
  constants stay out of the codebase until re-confirmed.
- Every slice runs the §9.8 six-step protocol on its own feature
  branch, with the step-5 approval gate before any commit.

## Increment 1 — P1 Foundations & configuration (branch: phase-1-foundations)

| # | Sub-task | Status |
| --- | --- | --- |
| 0 | AGENTS.md standing scope rule insert | done |
| 1 | Pre-git: branch `phase-1-foundations` | done |
| 2 | Working files initialized (this set) | done |
| 3 | `backend/config/env.js` — frozen §10.4 env, lookup chain, fail-fast | done |
| 4 | `backend/utils/constants.js` — skeleton + deepFreeze only | done |
| 5 | `backend/utils/httpStatus.js` — frozen §11.6 map | done |
| 6 | `backend/server.js` — fail-fast boot prototype | done |
| 7 | Spec mirrors: §69 amendment record (§15.4 needed no edits — paths already listed) | done |
| 8 | Gates: node --check ×4 · fail-fast demo · freeze probe · greps · hygiene | done |
| 9 | Step-5 diff presentation → owner approval → post-git | pending |

Deferred to their first consuming slice (recorded decision): all of
`client/src/utils/*`, every domain constant group (auth/rate-limits
join with the auth slice), the addisai SDK singleton.

## Slice roadmap after P1 — Iterative Page-Driven Rebuild (branch `phase-rebuild-branches`)

### Phase 0: Reversion — COMPLETE ✓
- All branch-specific files deleted, modified files restored to main branch state
- Gates: build 0, lint 0, dist deleted, node --check pass

### Phase 1: Branches Page (`/branches`) — Top-to-Bottom Sections

| Section | Spec | Status |
|---------|------|--------|
| 1.1 Page Header (MuiPageHeader + Filter ButtonGroup + New Branch) | §56.2, §56.4, §46.12 | pending |
| 1.2 Presentation Toggle (Grid ↔ Ledger, device-first default) | §56.3, §56.7 | pending |
| 1.3 MuiDataGrid View (columns, toolbar, selection, hover actions, pagination) | §56.3, §46.8, §56.6 | pending |
| 1.4 Branch Ledger Cards View (ruled entries, identity row, inline actions) | §56.3, §56.7 | pending |
| 1.5 Filter Dialog — PROVISIONAL (Show-Archived only, OQ-017) | §56.4, OQ-017 | pending |
| 1.6 Create/Edit Branch Dialog (MuiDialog + form, validation, submit) | §56.4, §46.17 | pending |
| 1.7 Confirm Dialogs (Archive/Restore/Delete copy, variants) | §56.6 | pending |
| 1.8 States & Empty States (loading, error, empty, archived-empty) | §56.7, §60 | pending |
| 1.9 Branch Slice (RTK Query: 7 endpoints, Branches tags) | §56, §42 | pending |

### Phase 2: Branch Details Page (`/branches/:branchId`) — Top-to-Bottom

| Section | Spec | Status |
|---------|------|--------|
| 2.1 Route & Data Fetch (single aggregate call, states) | §56.5, §30.2.1 | pending |
| 2.2 Signboard Header (Noto Serif Ethiopic name, location, status badge) | §56.5, §43.2 | pending |
| 2.3 Reports Grid (exact §50 surface, OQ-016 suppress pagination) | §56.5, §50, OQ-016 | pending |
| 2.4 Analytics (charts per §49.4 conventions) | §56.5, §49.4 | pending |
| 2.5 Items (activities/issues/comments groups per §24A) | §56.5, §24A | pending |

### Phase 3: Profile Page (`/profile`) — Top-to-Bottom (§57)

| Section | Spec | Status |
|---------|------|--------|
| 3.1 Page Header (title, subtitle, Logout action) | §57.2 | pending |
| 3.2 ID-Card Face (48px avatar + camera, fullName serif, position, hairline) | §57.3, §43.2 | pending |
| 3.3 Profile Form (position display-only, names editable, avatar upload) | §57.3, §46.4, §46.17 | pending |
| 3.4 States (loading, error, failed PATCH keeps values) | §57.6 | pending |

### Phase 4: Routing Integration
- Protected branch: AppShell → Dashboard, Branches, BranchDetails, Profile
- Catch-all as LAST CHILD of root layout (§41.3)

---

**Methodology per section (Plan Mode → Build Mode):**
1. Read spec + cross-refs
2. mui-mcp research for exact MUI v9 APIs
3. Define component structure, props, sx, behavior, integration points
4. Present section plan → OWNER APPROVAL
5. Build → gates (lint 0, build 0, dist deleted) → owner browser review
6. If changes → back to Plan Mode for that section

**Reusable components emerge on second use:** MuiDialog, MuiConfirmDialog, MuiStatusBadge, MuiDataGrid, MuiDataGridToolbar → `components/reusable/` when needed by multiple pages.

---

## Increment 1 — P1 (branch phase-1-foundations) — CLOSED

Merged to main at `86cbd22` on 2026-08-24: AGENTS.md standing rule,
§69.3.6 record, env/constants/httpStatus skeletons, boot prototype,
working files. All gates green.

## Increment 2 — Phase 4.1 Branch API Independent Routes (branch: phase-4-branches-backend-independent)

| # | Sub-task | Status |
|---|----------|--------|
| 1 | Pre-git: branch `phase-4-branches-backend-independent` | done |
| 2 | `backend/utils/constants.js` — add PAGINATION_*, BRANCH_* constants | done |
| 3 | `backend/models/branch.model.js` — schema, indexes, transforms per §20 | done |
| 4 | `backend/validators/branch.validator.js` — chains per §29, §30 | done |
| 5 | `backend/controllers/branch.controller.js` — 7 handlers (list, get, create, update, archive, restore, delete) | done |
| 6 | `backend/routes/branch.routes.js` — routes + validator mounting | done |
| 7 | `backend/routes/index.js` — mount `/branches` router | done |
| 8 | Docs: `docs/project-specification.md` (§30.2, §30.8, §69), `findings.md`, `progress.md`, `task_plan.md` | done |
| 9 | Gates: `node --check` ×8 backend files, `npx vite build` 0 errors, `npx eslint src/` 0 warnings, `dist/` deleted | done |
| 10 | Delete `docs/branches-backend-exhaustive-analysis.md` | done |
| 11 | Step-5 diff presentation → owner approval → post-git | pending |

**Deferred (cross-model/domain — Phase 5):**
- `GET /branches/:branchId/detail` (Report+Item+Analytics aggregation)

**Removed:**
- `GET /branches/:branchId/timeline` (brainstorming added, not in spec, removed)

---

## Redux Layer Fix — Session 2026-08-26

**Owner directive:** Centralized transform in apiSlice — no extractUser.

| File | Change | Status |
|------|--------|--------|
| `apiSlice.js` | Split `normalizeResult` → `unwrapEnvelope` + `normalizeError`; refresh dispatches `authenticated` | pending |
| `userSlice.js` | Delete `extractUser`, `refresh` mutation, all `transformResponse` | pending |
| `store.js` | Add `login.matchFulfilled` listener → dispatches `authenticated` | pending |
| `LoginForm.jsx` | Remove manual `dispatch(authActions.authenticated(user))` | pending |
