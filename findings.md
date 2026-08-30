# Findings — Report Builder

## Session 2026-08-28 — Branch API Independent Routes (Phase 4.1)

- **Scope:** Implemented 7 independent branch backend routes per brainstorming decisions:
  `GET /branches`, `GET /branches/:branchId`, `POST /branches`, `PATCH /branches/:branchId`, `POST /branches/:branchId/archive`, `POST /branches/:branchId/restore`, `DELETE /branches/:branchId`.
- **Deferred (cross-model/domain dependencies):** `GET /branches/:branchId/detail` (Report+Item+Analytics aggregation).
- **Removed:** `GET /branches/:branchId/timeline` (added during brainstorming, not in spec, removed per owner directive).
- **Amendments from spec (owner-approved brainstorming):**
  1. `GET /branches`: `isArchived` default = `all` (not `false`); values `active`|`archived`|`all` (not boolean).
  2. `GET /branches`: `sort` allowlist = `name`|`-name`|`createdAt`|`-createdAt`.
  3. `GET /branches`: local `search` removed — global search only.
  4. `GET /branches`: no `name`/`location`/`createdAt` range filters.
  5. Branch name uniqueness: exact match after trim, case-sensitive, per user (`Saris` ≠ `saris` ≠ `ሳሪስ`).
  6. `POST`/`PATCH`: duplicate name → 409 CONFLICT "A branch with this name already exists".
  7. Archive/Restore idempotent-ish: re-archive = 409, restore active = 409.
- **Fixes applied:**
  - Removed `index: true` on `user` field (spec §18.3 — redundant with compound indexes).
  - Fixed pagination: removed invalid `leanWithId`, fixed page cap bug.
  - Added race condition handling for E11000 (returns correct 409 message).
- **New constants (§11.3):** `PAGINATION_DEFAULT_PAGE`, `PAGINATION_DEFAULT_LIMIT`, `PAGINATION_MAX_LIMIT`, `BRANCH_NAME_MAX_LENGTH`, `BRANCH_LOCATION_MAX_LENGTH`.
- **Files created:** `backend/models/branch.model.js`, `backend/validators/branch.validator.js`, `backend/controllers/branch.controller.js`, `backend/routes/branch.routes.js`.
- **Files modified:** `backend/utils/constants.js`, `backend/routes/index.js`, `docs/project-specification.md` (§30.2, §30.8, §69).
- **Gates passed:** `node --check` ×8 backend files, `npx vite build` (0 errors), `npx eslint src/` (0 warnings), `dist/` deleted.

## Session 2026-08-25 — S2 branches backend walk

- **Matrix green:** create 201 · folded-dup 409 (`SARIS ኮፌ`≡`Saris
  ኮፌ`) · transliteration pair correctly ALLOWED (Amharic ≠ Latin) ·
  self-rename conflict-free · rename-onto-sibling 409 (verified by
  exact-name probe) · archive/re-archive-409 · archived-list filter
  both ways · restore/not-archived-409 · DELETE retention copy ·
  foreign-id 404 · bad-limit & non-ObjectId id 422.
- **UTF-8 proof:** git-bash curl -d mangles Amharic args (codepage)
  — node-fetch insert round-trips perfectly (`amharic-intact:true`).
  Test harness lesson: never send non-ASCII through bash curl args;
  use node fetch drivers.
- **Defects caught & fixed during walk:** (1) `authenticate` missing
  on branch router (req.user undefined → 500) — now mounted
  router-wide; (2) `nameFolded` leaked into DTOs despite select:false
  (direct-create docs bypass query projection) — transforms now strip
  it; (3) global 11000 copy neutralized ("This value already
  exists"), auth register owns its email-specific 409 catch.
- **Windows spawn technique:** `cmd /c start` and relative-path
  PowerShell Start-Process both misbehaved; working pattern is
  Start-Process with ABSOLUTE WorkingDirectory.

## Session 2026-08-24 — Arrow-function sweep (R4 execution)

- Repo-wide conversion done: ~50 declarations → arrow consts across
  backend (env/logger/errors/sanitize/rateLimit/auth/server/
  constants) and client (6 pages, 12 components, forms, validators,
  store adapter, authSlice reducers, apiSlice, toast,
  ethiopianDate, useLogout).
- **Sed pitfall recorded:** the mechanical pattern dropped `async`
  on converted thunks — caught by `node --check` ("await outside
  async"); three sites repaired. Always run syntax checks immediately
  after mechanical sweeps.
- **Documented exceptions (`this`/class semantics):** exactly three
  in `user.model.js` (virtual getter, pre-save hook, comparePassword
  method) + class bodies; MuiTextField keeps a named inner render via
  `forwardRef((...) => …)` + explicit `displayName` (DevTools/Refresh
  names).
- **Lazy contract preserved:** every lazily-imported page keeps a
  named const + `export default <Name>;` — verified per file (gate);
  thunks unchanged.

## Session 2026-08-24 — 404 routing defect (owner /dashboardd pass)

- **Catch-all placement:** `{path:"*"}` as a SIBLING of the root
  layout route rendered NotFound OUTSIDE `<App/>` — unthemed, no
  CssBaseline/boundary/toasts; and with no errorElement on that
  branch, any failure surfaced React Router's built-in default
  boundary (the unstyled "Go back/Home" page the owner saw). Rule:
  **the catch-all is always the LAST CHILD of the root layout** so
  every URL inherits AppTheme + boundary. Fixed in main.jsx.
- The notFound_404.svg artwork contains no text/rects (2 circles,
  4 paths) — it never drew buttons; the phantom buttons were RR's
  default boundary chrome.

## Session 2026-08-24 — Remediation verifications (owner "if not yet" items)

- **DB exponential retry:** already implemented D53-conformant in
  server.js (1 s doubling, 30 s cap, 10 attempts, fail-fast exit 1,
  post-connect drops on driver auto-reconnect). No change needed.
- **hashPassword await:** correct under the Mongoose 9 pure-async
  idiom — `await bcrypt.hash` completes before save proceeds.
- **Morgan colors:** streamed plain through Winston's formats —
  ANSI codes would pollute file logs; `dev` tokens kept readable.

## Session 2026-08-24 — Slice 1 review fixes (owner browser pass)

- **redux-persist storage contract:** adapters must return Promises
  (`getStoredState` chains `.then`); the sync hand-rolled adapter
  crashed every boot with "storage.getItem(...).then is not a
  function". Fixed in store.js — methods now Promise-returning.
- **RR v8 lazy-object form:** `lazy:{ Component: () => import(X) }`
  feeds the MODULE NAMESPACE to the fiber → "Element type is invalid
  … got: object" inside `<Route>`. The thunk must resolve the default
  export: `import(X).then(m => m.default)` (matches the V3-proven
  form). Fixed on all four page routes.

## Session 2026-08-24 — Slice 1 (auth area), Phase B

- **Integration smoke (browser-origin simulation):** POST login from
  `Origin: http://localhost:3000` → 200, `ACAO` echoes the origin,
  `allow-credentials: true`, both httpOnly cookies issued. Combined
  with A7 this closes the client↔server loop at HTTP level; the
  interactive browser walk remains the owner's step-5 pass.
- **Scaffold drift fixed:** `theme/customizations/datePickers.js`
  imported `pickersDayClasses` (pre-rename name, unused import
  remnant) while using it at four style sites under its v9 name
  `pickerDayClasses` — import corrected to match usages; build went
  green. Lesson: substring greps mislead — grep the exact symbol.
- **Layout ownership:** pages must NOT embed PublicLayout — the
  router owns layout branches (§41.3); initial page drafts embedded
  it and were stripped to avoid a double app-bar.
- **react-compiler lint rule** flags RHF `watch()` as incompatible-
  library; the name-reveal preview uses `useWatch({control})`
  instead (also cleaner: no whole-form subscription).
- **Route-map gate nuance:** `element` appears only for guards,
  layouts, error page and 404 (the §41.3 static participants); every
  PAGE route uses the lazy `Component` form with literal specifiers.
- **Vite build chunk graph confirms code-splitting:** Login/
  Register/Landing/Dashboard are separate lazy chunks.

## Session 2026-08-24 — Slice 1 (auth area), Phase A

- **A7 sync-walk evidence (live, port 4000, Mongo local):** health
  `{"status":"up",uptime}` exact envelope · register 201 with exact
  DTO (derived beza/ayalew, `fullName` virtual, no password/id/__v) ·
  duplicate 409 exact copy via global-handler dup-key mapping ·
  invalid email 422 aggregate details shape · wrong-password 401
  identical copy, cookie-less · login 200 "Welcome back" setting
  httpOnly SameSite=Lax cookies at paths `/api/v1` (access) and
  `/api/v1/auth` (refresh) · refresh 200 "Session refreshed" with
  rotated refresh value (old ≠ new proven from jars) · logout
  idempotent clearing BOTH cookies (Max-Age=0 headers captured) ·
  Google stub 404 exact open-question copy. Server killed after walk;
  port 4000 verified free.
- **Mongoose 9 hook idiom:** async pre hooks must not declare
  `next` — pure async functions only (next-style throws "next is not
  a function").
- **express-validator matchedData** is flat by default; §29.2's
  `{ body, params, query }` buckets need explicit
  `locations` per call in the harness.
- **authenticate mounting deferred:** no auth route is protected in
  this slice (profile/avatar deferred), so `middleware/auth.js`
  exists as the §28-owned artifact; its first route-group mount lands
  with the branches slice.
- **AI-tier limiter deferred** (no AI endpoint yet); rateLimit.js
  ships global + auth tiers only.
- **New constants consumed this slice** (all §11.3 rows already
  declared): BCRYPT_SALT_ROUNDS, ACCESS/REFRESH TTLs (+ derived MS,
  MS_PER_MINUTE, MS_PER_DAY), MONGO_CONNECT_TIMEOUT_MS, DB_RETRY_*,
  LOG_RETENTION_DAYS, MONGO_DUPLICATE_KEY_ERROR_CODE, RATE_LIMIT_*
  six. Spec-mirror additions owed same-commit: API_MOUNT_PATH,
  MS_PER_MINUTE, MS_PER_DAY, SHUTDOWN_FORCE_TIMEOUT_MS rows in §11.3.

## Session 2026-08-24 (P1)

- **Owner directives (this session, binding):**
  1. Build strategy: vertical slices by domain area — small backend
     area → its frontend integration → sync; backend leads when an
     area cannot sync; no mock adapter ever ("no version, just Report
     Builder" — this workspace is the single canonical product).
  2. The spec's feature sections can be wrong: the §52 wizard is
     dropped (V3's re-implementation had already replaced it with a
     `ReportWorkspace` page). What survives from the spec is the
     engineering law: no hardcoded values, named constant homes,
     frozen objects.
  3. KNOWN OR AMENDED ONLY (refined same session): known = logically
     valid or already established (§1 problem statement; earlier-set
     priorities like [auth → branches → reports]; naturally-valid
     sets like HTTP status codes); amended = what each Step-1.1
     identification explicitly decides. Define on require:
     spec-scheduled but unamended items stay out until a real
     consumer requires them, then land in their proper place with a
     proven need and reason — universal across constants, env vars,
     directories, structures, features, dependencies. Recorded in
     `AGENTS.md` this commit.

- **Spec-vs-reality reconciliation (start of session):**
  - This workspace (`main@c7032f2`) tracked only manifests, client
    theme layer, scaffold, and the spec — despite §15/§13.5/§66
    markers claiming implemented files/installs elsewhere.
  - `backend/.env` holds all §10.4 required names plus extra entries
    (`ADDIS_AI_*`, `OAUTH_GOOGLE_*`, `LOG_LEVEL`). Resolution per
    §26.2: ENV_SPEC exposes exactly §10.4 keys; the extras are
    SDK/internal-scope and stay unread by our code.
  - `client/.env` exists with VITE_ vars; `.gitignore` covers `.env`,
    logs, dist, uploads, node_modules.
  - Prior workspaces on disk (`1.Report-Builder-V3` et al.) contain a
    proven implementation used strictly as read-only reference for
    conformant patterns; current spec canon wins over any drift.

- **AGENTS.md staleness noted (not silently edited):** its "Current
  state" section still says "Git main at 0 commits" while `main`
  carries `c7032f2`. Left untouched — outside approved scope; flagged
  to the owner at step-5 review.

- **Design decisions:**
  - `env.js` modeled on the proven reference but without the addisai
    singleton (no consumer yet — orphan discipline).
  - `constants.js` ships as skeleton + deepFreeze helper; domain
    groups join per slice (auth/rate-limits first).
  - `httpStatus.js` ships complete (§11.6): pure HTTP vocabulary,
    feature-independent, consumed by every slice.
  - `server.js` is a ~10-line fail-fast prototype, superseded by the
    §26 foundation when the auth slice opens.

## Session 2026-08-26 — Redux transform architecture

- **Two-stage pipeline problem:** `normalizeResult` (apiSlice) stripped
  envelope; `extractUser` (userSlice) plucked `.data.user` from auth
  endpoints. Owner directive: single centralized function in apiSlice.
- **Refresh data discarded:** `baseQueryWithReauth` checked
  `refreshResult.data` but never stored the fresh user — session went
  stale after token rotation. Fixed by dispatching `authenticated`
  from the reauth chain.
- **Dead mutation:** `refresh` endpoint in userSlice exported
  `useRefreshMutation` — never imported anywhere. Refresh is purely
  internal to baseQueryWithReauth. Removed.
- **Centralized unwrap pattern:** `unwrapEnvelope` enhanced to detect
  `data.user` shape — auth endpoints return UserDto directly from
  `.unwrap()`, no endpoint-level transform needed.

---

## Session 2026-08-28 — Branches Page Frontend Implementation

### Existing Redux Structure Analysis

**apiSlice.js** - Central API with:
- `baseQueryWithReauth` - handles 401 refresh chain with single-flight refresh
- `unwrapEnvelope` - unwraps `{ success, message, data }` envelope, handles special `data.user` for auth endpoints
- `normalizeError` - normalizes errors to consistent shape: `{ status, message, fieldErrors? }`
- Tag types: `["User"]`

**authSlice.js** - Session state (status + user):
- Status: INITIALIZING | AUTHENTICATED | GUEST
- Reducers: `authenticated`, `setGuest`, `logoutCleared`
- Extra reducers for `AUTH_SESSION_EXPIRED`

**userSlice.js** - Injects auth endpoints into apiSlice:
- `login`, `register`, `logout`, `googleAuth` mutations
- Uses centralized `unwrapEnvelope` - no endpoint-level transformResponse

**store.js**:
- `persistReducer` for auth with sessionStorage adapter
- `listenerMiddleware` for REHYDRATE and login fulfillment
- `listenerMiddleware.startListening` with `apiSlice.endpoints.login.matchFulfilled`

### Key Patterns
1. **Centralized envelope unwrapping** - `unwrapEnvelope` in apiSlice handles all success responses
2. **Centralized error normalization** - `normalizeError` in apiSlice handles all errors
3. **Reauth chain** - `baseQueryWithReauth` handles 401 → refresh → retry
4. **Tag-based invalidation** - `invalidatesTags: ["User"]` for auth mutations
5. **Session persistence** - redux-persist with sessionStorage adapter

### Branches API Contract (from backend)
- `GET /branches` - paginated list with filters: page, limit, sort, isArchived (all|active|archived)
- `GET /branches/:branchId` - lightweight branch
- `POST /branches` - create branch
- `PATCH /branches/:branchId` - update branch
- `POST /branches/:branchId/archive` - archive
- `POST /branches/:branchId/restore` - restore
- `DELETE /branches/:branchId` - archive-first, reference check

### UI Requirements (from spec §56)
- Responsive header with view toggle (List/Grid), filter, new branch
- List view (Branch cards) on xs/sm, Grid view (MuiDataGrid) on md+
- Filter dialog (Show Archived switch only, PROVISIONAL OQ-017)
- Create/Edit branch dialog (RHF + MuiTextField + start adornments)
- Confirmation dialogs (Archive/Restore/Delete)
- MuiDataGrid with server-side pagination/sort
- Card view with MuiPagination
- View toggle: List/Grid with ToggleButton icons only + Tooltips
- Filter button: IconButton with Badge
- New Branch: MuiButton with AddIcon
- Card view: xs=1, sm=2, md=3, lg=4 columns
- DataGrid: server-side pagination/sort, checkboxSelection=true

### Issues Identified in Uncommitted Code

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | MuiPagination passes non-standard props to `<Pagination>` (rowsPerPage, rowsPerPageOptions, onRowsPerPageChange) | MuiPagination.jsx | Rewrite with custom rows-per-page selector |
| 2 | Duplicate loading/error check (early return + inner JSX check) | Branches.jsx | Remove inner dead-code check |
| 3 | `getBranches` tag path `result.data.docs` wrong after unwrapEnvelope flattens | branchesSlice.js:20 | Change to `result.docs` |
| 4 | `getBranchDetail` hits non-existent route `/branches/:branchId/detail` (deferred per Phase 4.1) | branchesSlice.js:29-37 | Keep as stub, do not use in UI |
| 5 | `apiSlice.tagTypes` missing "Branch" | apiSlice.js:149 | Add `"Branch"` to tagTypes |
| 6 | `onSortModelChange` is no-op (void _sort) | Branches.jsx:456-464 | Wire to query state or remove |
| 7 | `ButtonGroup` wrapping `ToggleButtonGroup` (two different MUI grouping components) | BranchesHeaderActions.jsx:37 | Replace with `Box sx={{ display: "flex", gap: 1 }}` |
| 8 | MuiDataGrid uses deprecated `components` prop (v5/v6 API) | MuiDataGrid.jsx:92-101 | Change to `slots={{ noRowsOverlay: ... }}` |
| 9 | `BranchFormDialog` stale defaultValues (useForm reads initialData only once) | BranchFormDialog.jsx:36-38 | Add `useEffect` to reset form on initialData change |
| 10 | Missing newline at end of files | MuiEmptyState.jsx, MuiPageHeader.jsx | Add trailing newline |
| 11 | Planning files overwritten (§66.3 violation) | findings.md, progress.md, task_plan.md | Revert + append |
| 12 | `task_plan.md` stale statuses (all "pending" but code is implemented) | task_plan.md | Update statuses |

---

## Session 2026-08-28 — MuiPageHeader + Branches Page Header (Step-1.1 Identification)

### Task: Re-work MuiPageHeader and Branches page header

### Canon Inventory (spec — must be respected)

| # | Source | Canon Item |
|---|--------|------------|
| C1 | §46.12 | Props: `title`, `subtitle`, `actions`, `hideSubtitle` (auto: subtitle hidden below 600px portrait) |
| C2 | §46.12 | Title (h4) + optional subtitle on one line; `mb: 2` |
| C3 | §46.12 | One-line rule: title `noWrap` with ellipsis; actions slot `flexShrink: 0` |
| C4 | §46.12 | No eyebrow (removed in R3-fix) |
| C5 | §43.2 | Header-strip motif: hairline rule above a title |
| C6 | §56.2 | Branches title: "Branches", subtitle: "Your supervision branches" |
| C7 | AGENTS.md | JSDoc on new/edited functions, `@module` tag, arrow functions, no magic values |

### Amendments (owner-approved)

| # | Amendment | Rationale |
|---|-----------|-----------|
| A1 | Use `useTheme` + `breakpoints.down("xs")` for subtitle visibility | Equivalent to `hideSubtitle` auto behavior |
| A2 | Title variant `h6` on xs | Prevents overflow; owner decides after seeing it |
| A3 | Branches actions slot has view toggle + filter + new branch | Full Branches page functionality |
| A4 | Use `Stack` instead of `Box` for MuiPageHeader layout | Better semantic layout |
| A5 | No bottom border line on MuiPageHeader | Owner design decision |
| A6 | Branches page shows only page header (empty body) | Incremental build — content comes later |

### Issues to Fix (this task)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | MuiPageHeader missing `hideSubtitle` prop (§46.12 canon C1) | MuiPageHeader.jsx | Add `hideSubtitle` prop with auto behavior |
| 2 | BranchesHeaderActions `ButtonGroup` wrapping `ToggleButtonGroup` | BranchesHeaderActions.jsx:37 | Replace with `Box` |
| 3 | Branches.jsx duplicate loading/error check | Branches.jsx | Remove inner dead-code check |
| 4 | Missing newline at end of MuiPageHeader.jsx | MuiPageHeader.jsx | Add trailing newline |
| 5 | MuiPageHeader uses `Box` instead of `Stack` | MuiPageHeader.jsx | Change to `Stack` |
| 6 | MuiPageHeader has bottom border | MuiPageHeader.jsx | Remove border |
| 7 | Branches page has full content instead of header-only | Branches.jsx | Strip to page header only |

---

## Session 2026-08-31 — Responsive Page Header (Step-1.1 Identification)

### Task: Responsive MuiPageHeader + BranchesHeaderActions + Branches.jsx

### Canon Inventory (new items)

| # | Source | Canon Item |
|---|--------|------------|
| C8 | §56.7 | xs = Branch cards (1 col), sm = cards (2 col), md+ = MuiDataGrid |
| C9 | §56.7 | Filter dialog full-width-ish on xs |
| C10 | §45.2 | Breakpoint buckets: xs, sm, md, lg, lg+ |
| C11 | §46.12 | Subtitle `text.secondary` |
| C12 | §46.2 / AGENTS.md | Event handlers in components use `useCallback` with correct deps (`[]` for stable-only setters/log); consistent across all pages/consumers |

### Amendments (owner-approved, 2026-08-31)

| # | Amendment | Amends | Files |
|---|-----------|--------|-------|
| A7 | On xs, hide title too | §46.12 — add `hideTitle` prop | MuiPageHeader.jsx, §46.12 |
| A8 | On xs, no MuiDataGrid — only 1-col card, no toggle | §56.7 breakpoint matrix | Branches.jsx, §56.7 |
| A9 | On sm+, view toggle present, default MuiDataGrid | §56.7 breakpoint matrix | Branches.jsx, §56.7 |
| A10 | Auto-switch view on xs ↔ sm transition | NEW behavior | Branches.jsx, §56.7 |
| A11 | Handler functions with console.log (verification) | §56.4 placeholder | Branches.jsx |
| A12 | On xs, create button icon-only (no text) | §56.4 header actions | BranchesHeaderActions.jsx, §56.4 |
| A13 | `alignItems` on Stack in `sx`, not prop | MUI v9 best practice | MuiPageHeader.jsx, AGENTS.md |
| A14 | Subtitle `text.secondary` (confirmed — already done) | §46.12 | N/A |

### Amendments (supplementary, discovered during exhaustive analysis 2026-08-31)

| # | Amendment | Amends | Files |
|---|-----------|--------|-------|
| A15 | `AuthSheet` passes `hideTitle={false}` so auth titles ("Log in" / "Sign up") never hide on `xs` | §46.12 default behavior | AuthSheet.jsx |

### Issues to Fix (this task)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | MuiPageHeader missing `hideTitle` prop | MuiPageHeader.jsx | Add `hideTitle` prop with auto behavior |
| 2 | `alignItems` as Stack prop instead of sx | MuiPageHeader.jsx | Move to `sx={{ alignItems: "center" }}` |
| 3 | BranchesHeaderActions always shows toggle + full button | BranchesHeaderActions.jsx | Conditional render on `viewMode` prop |
| 4 | Branches.jsx no responsive logic | Branches.jsx | Add useMediaQuery + derived effectiveView + `useCallback` handlers (C12) |
| 5 | AuthSheet would lose its title on xs (hideTitle default) | AuthSheet.jsx | Pass `hideTitle={false}` |

### Strict Process Requirement (codified 2026-08-31)

- The spec (`docs/*`) is **wrong but not entirely wrong** — codified
  in `AGENTS.md` and `docs/project-specification.md` §66.6.
- Every implementation identifies canon (Canon Inventory) vs
  amendments during brainstorm and records them in the planning
  working files, `AGENTS.md`, and the spec in the same commit (§66.6).
- Respect the amended text once recorded.
