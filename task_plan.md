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

## Slice roadmap after P1

1. Auth area: backend §26 foundation + §27 chain + §28 auth ↔ frontend
   network layer + login/register pages + guards.
2. Branches area (backend §30 ↔ frontend branches pages).
3. Reports area (backend §31/§32/§33/§34/§35 ↔ frontend reports
   workspace) — scope re-confirmed per area before it opens.
