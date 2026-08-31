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
| 6 | Branches.jsx state via `let body;` variable | Branches.jsx | Owner directive: NO `body`/state-holder var — render the mutually-exclusive states via an inline ternary chain directly in the fragment (this also motivated `MuiErrorState`) |

### Strict Process Requirement (codified 2026-08-31)

- The spec (`docs/*`) is **wrong but not entirely wrong** — codified
  in `AGENTS.md` and `docs/project-specification.md` §66.6.
- Every implementation identifies canon (Canon Inventory) vs
  amendments during brainstorm and records them in the planning
  working files, `AGENTS.md`, and the spec in the same commit (§66.6).
- Respect the amended text once recorded.

---

## Session 2026-08-31 (b) — Branches Page Fetch / Loading / Error / Empty (Step-1.1 Identification)

### Task: Branches page fetches branches; surfaces loading, error, and empty states — NO data passed to any component

Owner scope (2026-08-31): fetch, loading, and error handling only. Also
drop in the empty state per owner (reused later as the MuiDataGrid
empty overlay). The `data.docs` payload is held by the page but not
passed to any child component in this increment — rows render later.

### Canon Inventory (existing truths — can't be wrong, no change)

| # | Source | Canon Item |
|---|--------|------------|
| C13 | §42.4 | Error normalized to `{ status, message, fieldErrors }`, plain end-user language |
| C14 | §60.2/§60.4 | State transitions never skip: loading → empty/error/success; retry re-enters loading |
| C15 | §46.14 | `LoadingSpinner` is the page/section load surface (message `text.secondary`, minHeight) |
| C16 | §46.17/§60.2 | `MuiEmptyState` is the belt empty surface (title + optional inline action) — also the MuiDataGrid empty overlay |
| C17 | §56.7 | Branches empty copy: **"No branches yet — add your first branch"** (with inline "New branch" action); NOT "No branches found" |
| C18 | §56.7/§60.3 | Query error = §60 error toast + inline retry affordance on the failing region; retry re-runs the same §42 call |
| C19 | backend | Backend default limit = 10 (`PAGINATION_DEFAULT_LIMIT`), validator clamps 1–100 (`branch.validator.js`); client grid page size defaults to 10 (`ROWS_PER_PAGE_OPTIONS=[10,25,50,100]`) — aligned, NO amendment |
| C20 | branchesSlice.js | `getBranches` endpoint exists: `{ page, limit, sort, isArchived }`, paginated, `data.docs` surface |
| C21 | owner directive 2026-08-31 | **Loading gate = "no content yet" (`!data && !error`), NEVER `isLoading`** — `isLoading` stays true until a request settles and spins forever on a hung request; `!data && !error` flips off the moment a response (success or error) arrives. Standing rule for every query surface. Respect forever. |
| C22 | apiSlice.js `unwrapEnvelope` (§42.4) + bug 2026-08-31 | **Envelope is unwrapped ONCE in `apiSlice` — query consumers & tag callbacks read the inner payload directly** (`result.docs`, `result.page`, `result.limit`, `result.totalDocs`, `result.totalPages`), **NEVER `result.data.*`**. The `getBranches.providesTags` `result.data.docs` bug threw a TypeError in tag provisioning → cache never settled → `data` undefined / endless loading. No `.data` access after the unwrap. Respect forever. |
| C23 | Step-1.1 (spec-is-wrong) 2026-08-31 | **Server-side list pagination = `mongoose-paginate-v2` registered PER-SCHEMA via `.plugin()` before model compilation**; list controllers depend on `Model.paginate` (`branch.controller.js` → `Branch.paginate`). Spec §15 falsely claimed `backend/utils/pagination.js (implemented)` — that file **never existed** (not on disk, not tracked in git); corrected to **removed/deprecated**. `getBranches` failed (`Branch.paginate` undefined → morgan `dev` dashes / undefined `data` / endless spinner). Respect forever. |
| C24 | `validate` factory bug 2026-08-31 | **`validate()` is a FACTORY — it must be INVOKED (`validate()`) in route chains, never passed as the bare `validate` reference.** Passing the bare reference makes Express call it as `validate(req, res, next)` → `req` lands in the `options` parameter, the body merely `return`s a fresh inner middleware that Express ignores, so **`next()` is never called and the request hangs forever (no response, no 500)**. Symptom: Postman `/branches` "always loading", `/health` (no validator) responds fine. `auth.routes.js` correctly uses `validate()`; every `branch.routes.js` route used the bare form — fixed to `validate()`. **This is the actual hang blocker** (not mongoose/C23). Respect forever: any route chain applying `express-validator` must call `validate()`. |

### Amendments (this task's deltas, mirrored same-commit)

| # | Amendment | Source/Why | Files |
|---|-----------|-----------|-------|
| A16 | Register `Branch` tag family in apiSlice (`["User"]` → `["User","Branch"]`) | branchesSlice already provides/invalidates `Branch` tags; RTK Q requires declaration | apiSlice.js, §42 |
| A17 | Wire `branchesSlice.js` into the store (side-effect import) | endpoints otherwise not registered; mirrors existing `userSlice.js` import | store.js, §15/§41.6 |
| A18 | Bring `branchesSlice.js` into the tracked tree | untracked today; required for the fetch | branchesSlice.js |
| A19 | Add minimal loading/error/empty copy constants to `client/src/utils/constants.js` | none exist; "define on require" | constants.js, §11.5 |
| A20 | Branches.jsx renders loading/error/empty via reusable surfaces; success holds data w/o passing to children | owner scope | Branches.jsx, §56.7 |

### In-progress (owner decides while implementing)
- Exact inline retry band look for the error state (spec: §60.3 toast + inline retry affordance).

### Issues to Fix (this task)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | apiSlice `tagTypes` missing `"Branch"` | apiSlice.js | add to array (A16) |
| 2 | store doesn't import branchesSlice | store.js | side-effect import (A17) |
| 3 | Branches.jsx has no fetch/loading/error/empty | Branches.jsx | call `useGetBranchesQuery` + render states (A20) |
| 4 | No copy constants | constants.js | add minimal set (A19) |
| 5 | `getBranches.providesTags` reads `result.data.docs` — throws, `data` undefined | branchesSlice.js | read `result.docs` (C22 — envelope already unwrapped) |
| 6 | All 7 `branch.routes.js` routes pass bare `validate` (not `validate()`) → request hangs, no response | branch.routes.js | invoke `validate()` (C24) |

## Session 2026-08-31 (c) — BranchFormDialog create/edit rework (register + redux + toast)

### Canon (spec — must be respected)
| # | Source | Canon Item |
|---|--------|------------|
| C25 | §46/§9.6 | **Forms use `react-hook-form` with `register` by default; `Controller` only for MUI X DatePicker/TimePicker** (each justified). `MuiTextField` forwards its ref via `inputRef` → `register` works directly. Plain text fields must never use `Controller`. |
| C26 | §46 v9 / theme | **MuiDialog carries no inline paper styling** — the theme owns `.MuiDialog-paper` radius/border (`theme/customizations/feedback.js` `MuiDialog`). Reusable dialogs keep behavior (fullscreen/maxWidth/fullWidth) only. |
| C27 | §9.6/ADR-033/§60 | Server errors surface through toasts, never `setError`; `setError`/field `errors` are client-side rule failures only. |

### Amendments (this task's deltas)
| # | Amendment | Source/Why | Files |
|---|-----------|-----------|-------|
| A21 | BranchFormDialog owns submit via redux mutations (create/update) + response `console.log` (dev trace) + success/error toast + loading | owner directive: use redux + response console.log + toast/loading; was prop-driven dead code | BranchFormDialog.jsx |
| A22 | Add `TOAST_CATALOGUE.branches` + `BRANCH_NAME_MAX_LENGTH`/`BRANCH_LOCATION_MAX_LENGTH` + `BRANCHES_COPY.dialog` to client constants | define-on-require; dialog consumer; mirrors backend §20 literals | constants.js |
| A23 | Wire BranchFormDialog into Branches.jsx (createOpen state; `handleCreateOpen`/`handleCreateClose`) | was a console.log stub; make dialog mountable/functional | Branches.jsx |
| A24 | Remove inline paper `sx` from MuiDialog (keep fullscreen/maxWidth/fullWidth) | theme owns styling (C26) | MuiDialog.jsx |

### Files
`BranchFormDialog.jsx` (rewrite), `MuiDialog.jsx` (style removed), `constants.js` (A22), `Branches.jsx` (A23).

### Gates
eslint EXIT=0 · vite build 0 errors → `dist/` deleted. Note: response `console.log` is a dev trace per owner directive 3 — client convention allows (backend forbids console.log via Winston).

## Session 2026-08-31 (d) — Branches filter as Menu (checkbox) + matched-count badge

### Canon (spec — must be respected)
| # | Source | Canon Item |
|---|--------|------------|
| C28 | §30.2 + owner 2026-08-31 | **Branches filter-derived `isArchived` (active/archived/all) + matched-count badge.** Filter UI = **Menu with a FormControl of checkboxes** (Active / Archived, start icons). Derivation: neither checked → `all`; active only → `active`; archived only → `archived`; both → `all`. **Badge shows the matched-response count (`totalDocs`)** but is **invisible in the `all` (no-filter) case**. Filter change resets to page 1 (§46.7; server pages). Replaces the provisional §56.4/OQ-017 dialog. |

### Amendments (this task's deltas)
| # | Amendment | Source/Why | Files |
|---|-----------|-----------|-------|
| A25 | Delete `BranchesFilterDialog.jsx`; add `BranchesFilterMenu.jsx` (Menu + FormControl + 2 Checkboxes w/ start icons: Active CheckCircleOutline, Archived Archive) | owner: "delete BranchesFilterDialog use BranchesFilterMenu"; Menu over dialog | Branch files |
| A26 | `BRANCH_ISARCHIVED = { ACTIVE, ARCHIVED, ALL }` + `BRANCHES_COPY.filter` copy constants | define-on-require; no magic strings | constants.js |
| A27 | Branches.jsx: `isArchived` state derived from `filterChecked`; stable memoized query (C21); `filterAnchorEl` anchors menu; badge = `data.totalDocs` when not `all` else 0; page reset on filter change | owner: badge = matched response count, not for `all` | Branches.jsx |
| A28 | BranchesHeaderActions: filter button opens menu (event.currentTarget anchors); badge `badgeContent=filterBadge`, `invisible={!filterBadge}`; drop `showArchived`/`onFilterDialogOpen` | menu anchoring + matched-count badge | BranchesHeaderActions.jsx |

### Files
`BranchesFilterMenu.jsx` (new), `BranchesFilterDialog.jsx` (deleted), `Branches.jsx`, `BranchesHeaderActions.jsx`, `constants.js`.

### Gates
eslint EXIT=0 · vite build 0 errors → `dist/` deleted. Grep: no `BranchesFilterDialog` references remain.

## Session 2026-08-31 (e) — Phase 5.4/5.3 build: Branches list rendering + lifecycle (A′-C′)

### Canon (STRICT, owner 2026-08-31) — RESPECT FOREVER
| # | Canon Item |
|---|------------|
| C29 | **No quick filter / search anywhere in `MuiDataGrid` / `MuiDataGridToolbar`.** There is exactly ONE global search on `MuiAppbar` (built in a later phase). No per-page search, no `QuickFilter`, no `showQuickFilter` prop, on any grid/page. Respect throughout the remaining lifecycle. |
| C30 | **Branches page full-page states (loading `!data && !error`, error, empty) are PRIMARY.** Grid `loadingOverlay`/`noRowsOverlay` appear only for in-grid refetch/pagination feedback (when data already exists). Reuse existing `LoadingSpinner`/`MuiEmptyState` — NO new overlay components. Page still owns error state (MuiErrorState). |

### Owner-gated workflow directive (2026-08-31) — RESPECT
Every reusable/branch component must be **wired into the Branches page, rendered live, reviewed in-browser by the owner, and approved BEFORE its commit** (never committed blind). Applies to MuiDataGrid, MuiDataGridToolbar, MuiPagination, BranchLedgerCard, BranchRowActions, dialog integration, everything.

### Owner decisions (2026-08-31, recorded)
- Deliver as sequential increments A′/B′/C′ (one thing at a time, Rule #5), each add/commit/push, NO merge.
- View action → navigate to `/branches/:branchId` (BranchDetails placeholder already routed at main.jsx:115).
- NO grid row selection (no bulk action).
- Archive / Restore / Delete all confirm via MuiConfirmDialog.
- MuiPagination is card/list-view ONLY (grid owns its own footer pagination).
- Drop the "Print" toolbar action; no grid search (C29).

### Amendments (Step-1.1)
| # | Amendment | Detail |
|---|-----------|--------|
| A29 | `MuiDataGrid` → MUI X v9 rewrite | server pagination/sort via `paginationModel`+`onPaginationModelChange`+`sortModel`+`onSortModelChange`+`rowCount`+`pageSizeOptions`+`paginationMode="server"`+`sortingMode="server"`; REMOVE removed v9 props `page`/`pageSize`/`onPageChange`/`onPageSizeChange`/`rowsPerPageOptions`/`disableSelectionOnClick`; `getRowId=(row)=>row._id`; density compact; rowHeight 52; NO checkbox selection; overlays via `slots` defaults = `MuiEmptyState`/`LoadingSpinner` (C30), consumer overrides via `slots`; NO quick filter (C29) |
| A30 | `MuiPagination` card/list-view only | plain numbered `<Pagination>` (props `count`,`page` 1-indexed,`onChange`); fixed page size; NOT used by the grid |
| A31 | Ethiopian dates | `columns/branches.jsx` createdAt + `BranchLedgerCard.jsx` createdAt → `formatEthiopianDate` (drop `new Date(...).toLocaleDateString`) |
| A32 | Grid view integration | `effectiveView==="grid"` (sm+) → `MuiDataGrid` + `createBranchColumns` + server pagination/sort |
| A33 | Card/list view + pagination | `BranchLedgerCard` map (xs 1col/sm 2col/md 3col/lg 4col) + `MuiPagination` |
| A34 | Lifecycle confirm | archive/restore/delete each open `MuiConfirmDialog` → mutation → toast success/error (C27) |
| A35 | View navigate | View action `useNavigate()` → `/branches/:branchId` (placeholder routed) |
| A36 | Edit seed | `BranchFormDialog` `useEffect` seeds form from `initialData` when it opens (fixes stale defaultValues, Phase 5.4 #9) |
| A37 | `getBranchDetail` inert | stays declared in branchesSlice but NEVER imported/called (backend route is a later phase) |

### Files
Client: MuiDataGrid.jsx, MuiDataGridToolbar.jsx, MuiPagination.jsx, columns/branches.jsx, BranchLedgerCard.jsx, Branches.jsx, BranchFormDialog.jsx, MuiConfirmDialog.jsx (verify), constants.js. Mirrors: findings/task_plan/progress/AGENTS/spec.

### Owner directive (2026-08-31, updated) — ALL reusable components are page-agnostic
- **Every component under `client/src/components/reusable/` is reusable** — not just
  MuiDataGrid/MuiDataGridToolbar. Each is generic and is used **based on the page we are on**.
- `MuiDataGrid.jsx` + `MuiDataGridToolbar.jsx` are consumed per page; a page may need any
  combination of **Print, Export CSV, Export PDF, Export to Excel** — so the toolbar must expose
  **per-feature opt-in configuration**, not a single hardcoded surface.
- Branches not wanting Print (C29) does **not** mean Reports or other pages won't need
  Print/CSV/PDF later — the reusable component must still support them.
- Export control is an **icon dropdown Menu** whose items are driven by which export formats the
  page enables.
- The `export` prop is a **reserved word (fatal)** → rename to valid identifier `showExport`
  (default off; page opts in). Pages configure via `slotProps.toolbar` (MuiDataGrid already
  forwards `slotProps.toolbar` to the toolbar slot — verified `GridHeader.js:17`).
- Drop the filter `Badge` placeholder (hardcoded `0` dot).

### Canon C31 (2026-08-31) — grid column widths use `flex`, never hardcoded `width`
- **Rule:** domain column files (`columns/*.jsx`) NEVER hardcode a column `width`. Every column
  uses `flex` (+ `minWidth`, optionally `maxWidth`) so the DataGrid distributes the FULL
  horizontal space proportionally. Applies to ALL present and future columns, not just branches.
  (v9: `flex` overrides `width` when both set; all-flex columns split the grid width
  proportionally; each flex column needs its own `minWidth`.)
- **MuiDataGrid:** sets `disableColumnResize` — column drag-resize is off for every grid; widths
  are driven purely by the domain column definitions.
- **Branches weighting (owner-approved):** `name flex:2 minWidth:200` · `location flex:2
  minWidth:160` · `isArchived flex:1 minWidth:120` · `createdAt flex:1 minWidth:120` (Name/Location
  larger, Status/Created compact — prevents Name dominating the grid).
- **Mirrored in:** findings, progress, task_plan, AGENTS.md conventions, spec §46.8.
