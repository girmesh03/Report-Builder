# Findings — Report Builder

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
