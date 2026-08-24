# Findings — Report Builder

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
