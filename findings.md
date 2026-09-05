# Findings — Report Builder

> **SPEC TRUST OVERLAY (owner directive, 2026-09-01):**
> `docs/project-specification.md` is NOT a single source of truth for
> §18–§24A (domain models — schema field contracts & indexes), §30–§39
> (domain API contracts — Branch/Report/Audio/STT/Generation/Correction/
> Chat/Export/Analytics/Search, incl. §30.2 filter semantics and §30.6
> delete flow), and §48–§59 (pages & features — auth pages/dashboard/
> reports list+detail/branches §56.2/§56.3/§56.5/§56.6/§56.7/profile
> §57/exports §58/wizard-replacement workspace) — nor for anything
> involved with them. Every detail in these areas becomes binding only
> when amended WITH the owner during Step-1.1 of each phase/task/
> sub-task and recorded in findings.md / progress.md / task_plan.md /
> AGENTS.md in the same working tree (§66.6). Spec text alone carries no
> weight here until owner-amended.

## Session 2026-09-01 — Phase 6 campaign roadmap (design-only, no implementation)

- **Branch created:** `phase-6-trust-overlay-amendments` off `main`
  (after commit 4f2f5a2 — trust overlay note-down).
- **Scope:** design-only amendment campaign for data models §21/§24A/
  §22/§23/§24 and API contracts §31–§39. Pages §48–§59 deferred to
  frontend campaign.
- **Roadmap:** R1–R10 increment plan (one resource = model + API per
  increment), dependency chain aligned to fixture order §5916. Open
  questions OQ-1–OQ-5 recorded for R1 resolution.
- **Files updated:** task_plan.md (Phase 6 section), AGENTS.md (current
  campaign), findings.md (this entry), progress.md (this entry).
- **Gates:** branch created, roadmap pushed, no merge.

## Session 2026-09-01 — R1: Report resource amendment (model §21 + API §31)

Design-only amendment with the owner (Step-1.1). No implementation —
recorded in this file, progress.md, task_plan.md, AGENTS.md + spec §21/§31
in one commit (§66.6).

### Report model (§21) — amended
Dropped from root: `branch`, `clockIn`, `clockOut`, `transcription` ref.
A single source of truth lives in `visits[]` (Option X — all children
child-side: audio, items, transcription; no parent refs).

```
Report {
  _id           ObjectId auto (only key, never `id`)
  user          ObjectId (ref User) required    // BR-13; fullName via virtual
  date          Date optional (null until captured) // Ethiopian workday; stored UTC-midnight; Ethiopian at boundary
  visits        Array<Visit> ≥1 required        // positional, chronological
  status        String default "draft"          // REPORT_STATUSES; stored, transition-guarded
  isArchived    Boolean default false
  archivedAt    Date default null
  createdAt/updatedAt Date auto (§18.2)
}
Visit (subdoc, _id: false) {
  branch   ObjectId (ref Branch) required
  clockIn  String "HH:mm" required
  clockOut String "HH:mm" required
  isMain   Boolean required  // exactly one true when visits.length > 1; user-decided
}
```

### Indexes (§21.3)
- `{ user, isArchived, date: -1, createdAt: -1 }` — owner list + date sort
- `{ user, "visits.branch" }` — branch filter (Q1) + visited-branch + cascade ref-check (multikey)
- `{ user, date }` — analytics/date rollups
- `{ user, status }` — status filter/roles
- `{ archivedAt }` TTL = ARCHIVED_TTL_SECONDS (sweeper safety net)

### Invariants (validator-enforced, §29)
1. visits ≥ 1
2. exactly one isMain when visits.length > 1 (single visit implicitly main)
3. per-visit clockIn < clockOut
4. day-span clockIn < clockOut (visits[0].clockIn < visits[n-1].clockOut)
5. chronological: visits[i].clockIn ≤ visits[i+1].clockIn
6. main branch position-independent (user-decided)

### Derived (read time, never stored)
- day start = visits[0].clockIn; day exit = visits[n-1].clockOut
- main branch = the visit with isMain → branch
- Type = visits.length (Type-1 single; Type-N changes report format)
- transcribed = Transcription.exists({ report }) [Mongoose 9.9.3 confirmed]

### Content model (owner definition)
metadata + items = report. Items = activities/issues/comment extracted
by the AI agent from the transcription (raw|latest) using metadata.
`generated` freezes the whole metadata block (date, visits, main branch).

### §31 Report & Status API — amended
| Endpoint | Contract |
|---|---|
| POST /reports | meta-only create (date+visits) → draft; 201 list DTO; 401/422 |
| GET /reports | list; page/limit/isArchived active\|archived\|all (Branches mirror)/status/branch (Q1)/sort date\|-date; 200; 401/422 |
| GET /reports/:reportId | single meta read (Meta-tab seed); 200; 401/404 |
| PATCH /reports/:reportId | meta edit (date+visits); < generated only (metadata frozen at generated); 200; 401/404/422/403 |
| POST /reports/:reportId/archive | 200; 404/409 (already archived) |
| POST /reports/:reportId/restore | 200; 404/409 (not archived) |
| DELETE /reports/:reportId | already-archived target; physical session delete + child cascade (Branches mirror); 200; 404 |

Dropped: `PUT /reports/:reportId/visits`, `PUT/DELETE .../visits/:visitIndex`,
`?withContent`. Open/TBD: `GET /reports/:reportId/details` (separate brainstorm).

GET /reports filters (approved):
- isArchived: active|archived|all, default all (Branches mirror)
- status: REPORT_STATUSES members
- branch: Q1 — main-branch only, $elemMatch { branch, isMain: true }
- sort: date/-date allowlist (business-date, createdAt tiebreak)
- page/limit like Branches (PAGINATION_*, clamp 1-100)

### List/meta DTO (populated, light — no content/items/audio)
- user → { _id, firstName, lastName, fullName }
- visits[].branch → { _id, name, location }
- status, isArchived, archivedAt, createdAt, updatedAt
- (no transcription ref — Option X)

### Editing & navigation (frontend facts, some amended)
- Edit icon (card action / MuiDataGrid action column) → navigates to
  `/reports/:reportId/edit` (a route distinct from `/reports/:reportId/details`).
- Edit page: 3 tabs — Meta, Audio, Transcription.
- Tabs use strictly <Tab/><TabContext/><TabList/><TabPanel/>
  <TabScrollButton/><Tabs/>.
- Tabs are NOT a wizard; user may move tab↔tab except on submit/failure edges.
- Audio + Transcription tab UI/endpoints kept OPEN → R3 (§32) / R4 (§33).
- Create dialog: reports page header action → button → dialog →
  react-hook-form { date, visits } → submit → POST /reports → update page UI.
- Branch-visit dialog component: client/src/components/branches/,
  wraps reusable MuiDialog (never edit MuiDialog unless asked), loading via
  LoadingSpinner, each item: left select-checkbox, avatar initial +
  utils/avatarColor.js, title name, subtitle location, right-end main checkbox
  (disabled once another is main), per-selected-branch clockIn/clockOut
  MuiTimePicker, max-height overflow-scroll content, MuiPagination at bottom.

### Cross-cutting (Ethiopian, everywhere)
Ethiopian date/time shown everywhere (fields, filter, select/pick); backend
converts Ethiopian↔UTC at the boundary; stores UTC-midnight Date.

### Open (deferred)
- GET /reports/:reportId/details — complete, separate exhaustive brainstorm.
- Audio (R3 §32) + Transcription (R4 §33) endpoints + tab UI — their own increments.

### Gate notes (for eventual implementation review)
- 422 for body-field validation incl. invalid/foreign/archived visits.branch
  (not 404).
- date-range filter held (defer to details/analytics brainstorm).

## Session 2026-09-01 — R3: Audio resource amendment (model §22 + API §32)

Design-only amendment with the owner (Step-1.1). No implementation —
recorded in this file, progress.md, task_plan.md, AGENTS.md + spec §22/§32
in one commit (§66.6). Blocked by R1 (done).

### Audio model (§22) — confirmed canon (8 fields)
```
Audio {
  _id, user (ref User, required), report (ref Report, child 1:N, required),
  filePath (String, server-internal, never exposed), mimeType (AUDIO_ALLOWED_MIME_TYPES),
  sizeBytes (Number, ≤ AUDIO_MAX_SIZE_BYTES 50MB via validator),
  durationSec (Number, ≤ AUDIO_MAX_DURATION_SEC 900s via ffprobe),
  createdAt/updatedAt
}
```
No `status`, no `isArchived`/`archivedAt`, no `deletedAt`, no ordering field.
Indexes: `{ user }`, `{ user, report }`. No TTL (inherited from report). Direct-delete
lifecycle (no states). `filePath` never exposed.

### §22.4/§32.4 lifecycle & status (amended)
- **Direct delete = DB + physical file:** removes the Audio doc (DB) in the §32 session
  AND `fs.unlink`s the file under `backend/uploads/audio/` after commit — both deleted.
- Final clip deleted (zero remain) → `draft` (no audio = draft presence, always).
- Delete one clip while some remain: `audio_attached` stays; `transcribed` cascades
  transcription → `audio_attached`.
- Add below `generated` never rewinds. Add 1+ clips at `transcribed` KEEPS status
  `transcribed` but DROPS readiness (new clips pending/unheard); existing raw/latest +
  stt.audios ledger retained; new clips re-transcribed+merged (§33.6, R4).
- Upload/delete frozen at `generated` (403). Report hard-delete cascades clips + unlink.

### §22.5 binary contract (amended — temp cleanup)
- Pipeline chunks/temp (ffmpeg conversions, PCM/WAV) cleaned on successful transcription
  + merge; only original uploaded clips persist under `uploads/audio/`.

### §32 API (nested, no stream, direct-delete, flat)
- `POST /reports/:reportId/clips` — 201 AudioDto; MIME/size/duration caps; 403 generated.
- `GET /reports/:reportId/clips` — flat `{ clips: [AudioDto] }`, createdAt asc; empty → `[]`; no pagination.
- `GET /reports/:reportId/clips/:clipId` — single AudioDto (byte source for playback Blob).
- `DELETE /reports/:reportId/clips/:clipId` — direct delete (confirm dialog); +unlink; rewind; 403 generated.
- No `/audios/*` flat routes, no `/play` stream, no archive/restore. Routes nested for RTK Query tags.
- AudioDto: `{ _id, report, mimeType, sizeBytes, durationSec, createdAt, updatedAt }` — never filePath.

### Audio-tab UI (R3) — one card
- One card = big orb (record/stop/play, circular) + drag-drop upload (dashed, text + file, click-to-locate).
- "Narrations" divider (centered) → per-clip items: play/pause, seek bar, duration, size,
  delete (confirm → direct), Transcribe/Re-transcribe (layout slot).
- Transcribe-all button — shown only when any clip not yet transcribed; absent when all transcribed.
- Playback: Blob/object-URL from read endpoint bytes (no stream; amends MuiAudioPlayer).

### Status/readiness rules
- Final clip deleted → `draft`. Add at `transcribed` keeps status, drops readiness (pending until re-transcribe+merge).

### Deferred to R4 (§23 + §33)
Per-clip Transcribe/Re-transcribe engine + Transcribe-all + heard-count `x of y` readiness +
merge-into-existing-transcription + §23 Transcription model + §33 STT pipeline.

## Session 2026-09-01 — CONSOLIDATED re-amendment: report domain, user-first (supersedes R1/R3)

Owner directive: every detail derives user-first — interaction → user story → user flow →
UI → API → model. This record SUPERSEDES the R1 (`06a351a`) and R3 (`b39791a`) amendment
records. Design-only, Step-1.1, with the owner. Mirrored in progress.md / task_plan.md /
AGENTS.md + spec §21/§22/§23/§24/§24A/§31/§32/§33 in one commit (§66.6).

### Method note (owner)
Problems came from starting at spec field tables/storage logic instead of user interaction.
"The logic should win" — decisions by context + multi-dimensional reasoning, never spec text,
never "what the owner wants" / "what the model wants". Also: "don't take my word as is".

### Persona & context
Area Supervisor — employee, company with 2+ branches; clocks in/out daily; visits ≥1 branch/
day (min 1, max TBD). The report is FOR a specific branch (supervisor does NOT narrate branch
names → the report must carry the branch for attribution). Ethiopian calendar/time,
Amharic content — Ethiopian date/time shown everywhere at the boundary; backend stores
UTC-midnight Date, converts ETh↔UTC, never stores the Ethiopian string. The boss can ask for
branch-X issues by month/date-range + status, update an issue's status, export selected
activities/issues, and have the AI return them structured in a sheet → Items are their own
queryable/lifecycled collection.

### Two surfaces
- `/reports/:reportId/edit` — Meta · Audio · Transcription tabs (strict MUI Tabs stack). Manages the materialized report.
- `/reports/:reportId/chat` — post-creation AI agent; `metadata + transcription.latest + preset + history-digest` → cards → item/report creation.
- `/reports/:reportId/details` — OPEN/TBD (own brainstorm; no `?withContent`).

### Final Report model (single collection; embedded) — supersedes R1
```
Report {
  _id, user (ref User, req; fullName virtual),
  date (Date; ETh workday ቀን; null until captured; UTC-midnight; ETh at boundary),
  visits [Visit]≥1 req (positional + chronological),
  audios [AudioClip] embedded,
  transcription { raw, latest } embedded (1:1),
  isArchived (false), archivedAt (null; TTL anchor), createdAt, updatedAt
}
Visit (_id:false) { branch (ref Branch, req; foreign/archived → 422), clockIn "HH:mm", clockOut "HH:mm",
                    isMain Boolean — exactly one true when visits.length>1; position-independent }
AudioClip (_id:true) { mimeType (AUDIO_ALLOWED_MIME_TYPES), sizeBytes (≤50MB), durationSec (≤900s, ffprobe),
                       filePath (server-internal; STRIPPED from all DTOs; never logged), createdAt }
Transcription { raw (immutable, STT re-runs only), latest (TRANSCRIPTION slot only — NOT the report body) }
```
Dropped from root: branch; clockIn/clockOut; status; generatedAt; transcription.contributions;
language; stt.requestId; stt.model; items[] (separate); transcription ref (Option X).
Content model: metadata + items = report; the report body is DERIVED (rendered from metadata+items),
never stored in latest. Freeze gate = items exist (meta + clip add/delete frozen 403; revert reopens).
Derived: day start = visits[0].clockIn; day exit = visits[n-1].clockOut; main = isMain visit;
Type = visits.length; generated = items exist (read-side batched query).
Invariants: visits≥1; one main when >1; per-visit in<out; day-span in<out; chronological;
isMain positional-independent.
Indexes: {user,isArchived,date,createdAt}; {user,"visits.branch"}; {user,date};
{archivedAt} TTL=ARCHIVED_TTL_SECONDS.
16MB safety: binaries on disk; doc≈0.3–1MB; caps raw/latest ~1MB (§11); chat/history NEVER embed.

### Item (separate collection) — boss/agent/sheet surface
```
Item { _id, user, report (ref), branch (DENORM from report main visit), date (DENORM),
       type (activities|issues|comment), text, status (per-type), timestamps }
Indexes: {user,branch,date,status}; {user,report}.
No rating field (owner 2026-09-01).
```
Denorm safe because metadata freezes once items exist. Created on ACCEPT; deleted on REVERT
(delete ALL the report's items; post-accept item status edits lost on revert — accepted).

**Per-type status (owner directive 2026-09-01):**
- activities → status ∈ {completed, in_progress}, default **completed**;
- issues → status ∈ {reported, in_progress, completed}, default **reported**;
- comments → **no status and no rating** (both removed).
Field name is **`text`** (confirmed 2026-09-01 — reconciled the earlier
`payload` wording). The **status-update mechanism is an OPEN item**
(how activities/issues statuses get updated — pending owner verdict;
candidate: direct `PATCH /reports/:reportId/items/:itemId { status }`).

### GenerationPreset (user CRUD, NO default)
```
GenerationPreset { _id, user, name, provider (addis|gemini|nvidia), model (AI_MODELS),
                   language (LANGUAGE_CODES, default am), reasoning (off|low|medium|high),
                   systemPrompt, personaPrompt, createdAt, updatedAt }
```
No default (owner: "forget default"). Zero-preset chat behavior OPEN (lean: require a preset).

### ChatConversation (per report, separate — never embedded)
Ordered turns + acceptedResponseId (single-accept persisted) + report ref + user.
Backend ops: re-try truncate (delete below index N + regenerate); accept → create items;
revert → delete items. One per report; grounded-history agent provides the AI's learning.

### Create-time: atomic multipart create (supersedes R1 meta-only + R3 audio-separate)
- Dialog: RHF (register) metadata (date + visits via branch-visit dialog) + audio (min 1 clip)
  → frontend validation → POST /reports multipart (`metadata` JSON + `clips[]` + `createKey`).
- createKey: client lazy at first submit (useRef), stable across retries in same dialog;
  discarded on close/refresh; nothing server-side if never submitted; idempotent.
- branch-visit dialog: components/branches/ component wrapping reusable MuiDialog (NEVER edit
  MuiDialog.jsx unless owner asks); LoadingSpinner; MuiPagination; item = left checkbox +
  avatar initial + avatarColor.js + title name + subtitle location + right-end main checkbox
  (one only; others disabled); per-selected MuiTimePicker clockIn/clockOut; max-height overflow.
- Backend: §29 + multer → attempt-session (staging uploads/audio/staging/, TTL ~1h, sweeper)
  with per-clip marks uploaded/failed + transcribed/failed → upload each (any fail → rollback
  files; dialog stays, state preserved, outside-click won't close) → STT each → merged
  (empty merge → REJECT "please re-record") → ONE §27.7 transaction creates the Report doc
  (any fail → rollback + delete clips; dialog preserved). No docs until final commit (rollback
  is filesystem-only). Incremental retry: same createKey skips marked clips.

### STT pipeline (locked, Path A)
Addis-only (ADR-001); addis.speech.transcribe({audio, language:"am"}); NO system/persona for
STT; max 25MB/120s SDK; ffmpeg → mono 16-bit 16kHz PCM; ≤60s silence-boundary chunks;
successful chunk texts single-space joined = raw; per-clip all-or-nothing (one bad chunk →
clip failed → retry clip). 402 (credits) surfaced distinct from 429 (rate). Temp chunks cleaned
on success — originals persist. Synchronous; no streaming/queue. Client timeout ≠ server abort.

### Post-creation
- edit Meta: PATCH whole block; frozen (403) while items exist.
- edit Audio: one card = big orb (record/stop/play) + drag-drop upload (dashed, text+file,
  click-to-locate); "Narrations" divider (centered); per-clip items (play/pause, seek, duration,
  size, delete → confirm → direct DB+file, Transcribe/Re-transcribe); Transcribe-all shown only
  when any clip pending. Playback = Blob/object-URL from read endpoint bytes (NO /play stream).
- edit Transcription: review/edit latest via MuiEditor; raw immutable; undo = latest←raw
  (pre-items); corrections modes 1–3 → latest.
- chat cards (owner, exact): each AI response is a card: Copy (copies text); Re-try (removes all
  request/response below + regenerates; disabled at/above the accepted card); Like
  accept (if none accepted → creates items) / revert (on the accepted card → deletes items).
  At most ONE accepted per report; other like-icons hidden/disabled; switching = revert-first.
- Grounded-history agent: before a generation response, tool scans the user's previously
  generated (accepted) reports → context digest → injected with metadata+latest+preset.
  Ephemeral per generation; never cached; never a stored field. First-ever = empty digest
  (found:0, digest:null) → normal generation. Current report excluded until accepted.
  MUI provides NO memory — entirely our backend tool.
- History definition (4 distinct layers): (1) report-record history (Report collection),
  (2) items history (Item collection), (3) chat-conversation history (ChatConversation,
  per report), (4) correction history (latest rewrites + conversation turns). The DIGEST is
  none of these — it is a DERIVED, condensed, ephemeral, per-generation tool artifact that
  reads the accepted-report history (Item rows + light transcription.latest + meta) and shapes
  it into grounding context.
- History-digest scope: RESOLVED per-user (2026-09-01, owner + reasoning). Scope = ALL the
  user's accepted reports across ALL branches — BR-13 isolation (user from req.user; many
  distinct solo users, never global); solves the new-branch empty-history problem; style/
  vocabulary/correction-habits are user-level truth. Structure:
  `{ userProfile (terminology, style, issue categories, format precedents),
     branches: [ { branch, recurringIssues, statuses, timeline } ] }` — per-branch sectors
  neutralize cross-branch factual bleed. Role boundary: digest informs HOW to write, never the
  content source; item content = current report's transcription only (SC-8 no-hallucination);
  items belong to the main branch only (locked Type-2 attribution rule).
- Digest sub-decisions (OPEN/lean — confirm at R5): data-source weight = items + light
  transcription.latest (correction-habits optional in R6/R7); freshness = recompute per
  generation (cache deferred); size cap = DIGEST_MAX_TOKENS-style constant.

### MUI X Chat (researched via mui-mcp; R7 decision pending)
ChatBox full surface (header/messages/composer); adapter sendMessage (ReadableStream chunks)
+ listConversations + listMessages (cursor pagination, hasMoreHistory/isLoadingHistory/
historyCursor) + setTyping + markRead + subscribe + addToolApprovalResponse + stop; tool-calling
lifecycle + typed registry + partRenderers; normalized store + chatSelectors; ChatError codes.
Streaming conflicts with our no-stream exclusion → fake-stream buffered reply (keeps exclusion)
vs real SSE (needs owner lifting). Alpha @mui/x-chat@9.0.0-alpha.18; open-core — some features
Pro/Premium; Community-only rule → verify before adopt; package-add requires approval (§13).
MUI provides NO AI memory/history-analysis.

### API design (final)
Conventions: /api/v1; envelope {success,message,data} + paginated {docs,page,limit,totalDocs,
totalPages}; semantic status; 422 details; BR-13 (user from req.user); ai-tier for clips/STT/
chat; no filePath in responses; no transcription text on light DTOs; status filter REMOVED.
- POST /reports (multipart atomic create; 201 list-DTO) · GET /reports (page/limit/isArchived
  active|archived|all default all Branches-mirror/branch Q1 $elemMatch{isMain}/generated
  true|false/sort date|-date; no status; date-range held) · GET /reports/:reportId (light meta)
  · PATCH /reports/:reportId (meta; 403 while items exist) · POST archive/restore ·
  DELETE /reports/:reportId (archived target; physical delete + child cascade) ·
  GET /reports/:reportId/details (OPEN).
- Clips: POST /reports/:reportId/clips (403 while items exist) · GET .../clips (flat {clips}) ·
  GET .../clips/:clipId (AudioDto + byte source) · DELETE .../clips/:clipId (direct DB+file).
- Transcription: GET /reports/:reportId/transcription ({raw,latest,readiness}) ·
  PUT .../transcription (transcribe; 403 while items exist; engine deferred w/ contributions
  replacement) · PATCH .../transcription ({latest}) · PUT .../transcription/revert.
- Items: GET /reports/:reportId/items · PATCH /reports/:reportId/items/:itemId ({status}) ·
  GET /items?branch=&dateFrom=&dateTo=&status=&type= (cross-report; pagination open in R2).
- Conversation: GET /reports/:reportId/conversation (paged) · POST .../conversation
  ({content,presetId} → buffered card; fake-stream pending decision) ·
  POST .../conversation/re-try ({responseId}) · POST .../conversation/accept ({responseId}) ·
  POST .../conversation/revert.
- Presets: GET/POST /presets; GET/PATCH/DELETE /presets/:presetId (no default).

### Edge-case verdicts (from the 56-item inventory)
Create: no-audio reject; incomplete meta 422; zero/no-main/2+main 422; invalid date 422, future
date allow, pre-account 422; dup-day allow (lean) + dialog notice (open); invariants 422 each
entry; return-visit allowed (header dedupe, 2 time lines); isMain≠0 confirmed; foreign/archived
422; MIME/size/duration/video 422; partial upload → incremental retry; double-submit idempotent;
crashed client → attempt-session resume + sweeper TTL.
Header/footer: clockOut missing impossible at create; revalidate on every PATCH; live-join
header (branch rename accepted); BR-14 ref-check load-bearing; ETh display = boundary conversion.
STT: per-clip failure marks; 402≠429; silent ok/merged-empty reject; word-cut accepted (silence
mitigation); ffmpeg fail → clip fail+rollback; re-run drift accepted (wholesale rewrite);
duplicate clip accepted; ≠am code-mix accepted limitation; noise/multi-speaker no gauge;
clip deleted before STT → excluded; re-record discards take; long clip bad chunk → clip fail;
latency timeout≠abort.
Merge: no partial rows; all fail → no commit; empty → reject; order = request submission order;
delete-clip cascades transcription (accepted); add-clip readiness drops (deferred pending-clip);
re-transcribe = wholesale rewrite (lean); size cap.
Generation: LLM fail → no items, card error, retry-safe; invalid config rejected at preset
create/update 422; system-vs-persona precedence + injection guard = "system wins; transcript
untrusted" (OPEN confirm); incomplete metadata → blocked 422; empty/noisy latest → blocked +
SC-8 no-hallucination; Type-2 attribution → items belong to main branch; malformed LLM JSON →
validate + regenerate; item-count/latest cap; regenerate after item-edit → revert-first;
double-click idempotent; not-fully-heard → blocked; archived → blocked 403; config in
GenerationPreset; ETh ቀን in body → derived render (R8).
Cross-cutting: session atomicity + orphan-sweep; failed-create files → sweeper; refresh
mid-pipeline → resume via createKey; branch hard-delete → BR-14 dominates.

### Open items (need owner verdicts before build/write)
1. Duplicate-day: allow (lean) vs {user,date} unique. 2. Direct-delete/misclick data-loss —
   confirm accepted. 3. system-vs-persona precedence + injection guard — confirm.
4. RESOLVED — history-digest scope = per-user with branch sectors (see "Grounded-history
   agent"); zero-preset behavior (lean: require a preset) + digest sub-decisions (data-source
   weight / freshness / size cap) still open. 5. content caps
   + AUDIO_MAX_TOTAL_DURATION_SEC — include in §11. 6. chat streaming fake vs real (R7).
7. preset per-message (lean). 8. re-amendments supersede the two pushed commits in one §66.6 commit.

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

## Session 2026-08-31 (i) — Increment B′ (card/list view + full lifecycle) — PLAN NOTES FIRST

### Task
Render Branches list view (BranchLedgerCard map + MuiPagination) and mount the
full lifecycle actions (View navigate, edit dialog, archive/restore/delete
confirm → inline loading → toast). Planning notes written BEFORE any code
(§66.6 same-commit discipline — these commit with the code). One thing at a
time (Rule #5); add/commit/push only, NO merge (Rule #4).

### Canon Inventory (new — RESPECT FOREVER)
| # | Source | Canon Item |
|---|--------|------------|
| C8 | §56.7 (existing) | xs = Branch cards (1 col), sm = cards (2 col), md+ = MuiDataGrid |
| C32 | owner 2026-08-31 | **Card grid uses MUI `Grid` with the `size` prop** (`<Grid container spacing={2}>` + `<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>`). **NEVER `gridTemplateColumns`** anywhere in the codebase. Matches BranchLedgerCard 1/2/3/4-col responsive (C8). |
| C33 | owner 2026-08-31 | **`MuiPagination` appears ONLY in list view, and ONLY when the number of pages > 1** (`data.totalPages > 1`). It is 1-indexed; page changes map to the shared 0-indexed `paginationModel`. Grid view never uses it (A30). |
| C34 | owner 2026-08-31 / AGENTS | **Prefer `Stack` over `Box`.** Pass valid non-`sx` Stack props (`direction`, `spacing`); alignment goes in `sx={{ alignItems: … }}` — **never a direct `alignItems` prop on `<Stack>`** (AGENTS hard gate). |

### Amendments (B′ final scope — supersedes the earlier B′/C′ split)
| # | Amendment | Detail |
|---|-----------|--------|
| A33 | Card/list view | `BranchLedgerCard` map (Grid `size` 1/2/3/4-col) + `MuiPagination` (list-view only, >1 page). |
| A34 | Lifecycle confirm | archive/restore/delete each open `MuiConfirmDialog` → mutation → **inline per-branch loading** → success/error toast (C27). |
| A35 | View navigate | View action `useNavigate()` → `/branches/:branchId` (placeholder already routed at main.jsx:115). |
| A36 | Edit seed | `BranchFormDialog` `useEffect` seeds form from `initialData` when it opens (fixes stale defaultValues, Phase 5.4 #9). Landed in B′ (owner-selected). |
| A38 | Scope shift (owner resolution) | **B′ folds the full lifecycle (A34/A35/A36) + list view (A33).** **C′ shrinks to grid Actions column wiring ONLY** (`BranchRowActions` + Actions column in `columns/branches.jsx`). Card `showActions` prop default = **on** (real handlers, per latest owner card-lifecycle directive). |
| A39 | Card lifecycle directive (owner, most recent) | onView → navigate to branch detail page; edit → dialog; archive/restore/delete → confirm dialog → inline loading on the card action → toast based on response. |

### Files
Client: constants.js, BranchFormDialog.jsx, BranchLedgerCard.jsx, Branches.jsx.
Mirrors (same commit): findings (this), task_plan.md, progress.md, AGENTS.md, spec §56.7/§46.8.

### Gates
eslint EXIT=0 · vite build 0 errors → `client/dist/` deleted · grep: no
`gridTemplateColumns`; no direct `alignItems` prop on `<Stack>`; no `console.log`
in Branches.jsx. Owner in-browser review (list view + lifecycle) BEFORE commit.

## Session 2026-08-31 (j) — Increment B′ REWORK (owner review feedback, 6 points)

Owner reviewed the B′ build in-browser and gave 6 directives. Rework recorded
here before code (§66.6; these notes commit with the reworked code).

### Points + resolutions
| # | Owner | Resolution |
|---|-------|-----------|
| 1 | Used `BranchFormDialog` twice — use one | Unify to a SINGLE dialog driven by one `dialogState` (`{mode:"create"}` \| `{mode:"edit",branch}`) in Branches.jsx; drop separate `createOpen`/`editBranch` states and the duplicated instances. |
| 2 | Inline loading must be PER action (archive/restore/delete individually), using each MUTATION's own `isLoading`, shown IN PLACE of that specific action's icon | Page reads `isArchiving`/`isRestoring`/`isDeleting` from the three mutation hooks; derives `actionLoading` = the in-flight action; card swaps just that one icon for a tiny `CircularProgress` and disables it — other actions stay live (View/Edit are non-async, no loading). |
| 3 | (noted) | — |
| 4 | Proper distinct color per action icon | **View `primary` · Edit `info` · Archive `warning` · Restore `success` · Delete `error`** (owner-approved). Amendment: edits spec §46.8 (Edit was `warning` — would collide with Archive). |
| 5 | Card doesn't need much inline style — theme/customizations own the look | Rebuild lean: root `<Card sx={{display:"flex",flexDirection:"column",height:"100%"}}>` so theme's MuiCard `gap:16` + zero-padding MuiCardContent/MuiCardHeader/MuiCardActions space the layout; no hand-rolled padding/border. |
| 6 | Card anatomy: CardHeader (avatar first-letter + deterministic random color, title = name, subheader = status chip w/ proper color); location row (LocationOn + proper color); date row (date icon + createdAt when active / archivedAt when archived); keep divider | Use `<CardHeader>`; avatar `bgcolor=getAvatarColor(name)`; status via `MuiStatusBadge`; location/date rows `text.secondary` icons per app list-icon convention; single date line per owner choice; `<Divider/>` before actions. |

### Amendments
| # | Amendment | Detail |
|---|-----------|--------|
| A40 | New util `client/src/utils/avatarColor.js` | Export `getAvatarColor(seed)` — deterministic (FNV-1a hash → index into `AVATAR_COLORS`), so the same branch always gets the same "known random" color across renders/reloads. |
| A41 | New constant `AVATAR_COLORS` in client constants.js | Frozen palette of ~10 theme-compatible hex colors; first real consumer is the branch-card avatar (define-on-require). |
| A42 | Card date rule (owner choice) | Show `Created {formatEthiopianDate(createdAt)}` when active; `Archived {formatEthiopianDate(archivedAt)}` when archived — single date line matching current state. |
| A43 | Edit icon color `info` | Amends spec §46.8 (Edit was `warning.main`) — avoids Edit/Archive color collision (owner-approved 5-color set). |

### Files
Client: `pages/Branches.jsx`, `components/branches/BranchLedgerCard.jsx`,
`utils/avatarColor.js` (new), `utils/constants.js`.
Mirrors (same commit): findings (this), task_plan.md, progress.md, AGENTS.md,
spec §46.8/§56.7.

### Gates
eslint EXIT=0 · vite build 0 errors → `client/dist/` deleted · grep: exactly ONE
`<BranchFormDialog` in Branches.jsx · no `gridTemplateColumns` · no direct
`alignItems` on `<Stack>` · no `console.log`. Owner in-browser review before commit.

## Session 2026-08-31 (k) — Increment B′ rework round 2 (owner review — 2 issues)

Owner reviewed the reworked card in-browser and flagged two defects. Recording
before code (§66.6; these notes commit with the fix).

### Issue 1 — deprecated props + Tooltip warning
| Owner | Root cause / canon | Fix |
|-------|--------------------|-----|
| Used `titleTypographyProps` — a deprecated slot prop class (`primaryTypographyProps` etc.) | §44.2/AGENTS hard gate: deprecated props never used; repo (MuiSidebar) convention = render **direct Typography child**, no `*TypographyProps` | CardHeader `title={<Typography variant="h6" noWrap>{branch.name}</Typography>}` — drop `titleTypographyProps` |
| "Providing a disabled `button` child to the Tooltip" console warning | `ActionButton` wraps a `disabled` IconButton directly in `Tooltip`; disabled elements don't fire pointer events → MUI can't position the tooltip (MUI "Disabled elements" docs) | Wrap the IconButton in a `<span>` inside the `Tooltip` (documented fix) |

### Issue 2 — action icon colors used the `color` prop, not `sx`
| Owner | Root cause / canon | Fix |
|-------|--------------------|-----|
| Haven't used the proper color of action icons | §44.2: "Icon colors via `sx` (`sx={{ color: 'primary.main' }}`), **never the `color` prop** on icon-bearing action controls." I used `color={color}` on the IconButton | Apply `sx={{ color: '…' }}` per action, keeping the approved A43 set — View `primary.main` · Edit `info.main` · Archive `warning.main` · Restore `success.main` · Delete `error.main` |

### Canon (confirmed, no amendment)
- §44.2 color mechanism (`sx`, never `color` prop) is canon; A43 color VALUES stay as approved.
- Also §44.2 "never the `@mui/material` barrel — tree-shaken single imports": the card file's barrel `import { … } from "@mui/material"` → single imports (matches the rest of the codebase, e.g. Branches.jsx).

### Files
Client: `components/branches/BranchLedgerCard.jsx` only.
Mirrors (same commit): findings (this), progress.md.

### Gates
eslint EXIT=0 · vite build 0 errors → `client/dist/` deleted · grep: no
`titleTypographyProps` / `subheaderTypographyProps` in the file; no `color={`
prop on the action IconButtons (all via `sx`); no barrel `@mui/material`
import. Owner in-browser review before commit.

## Session 2026-09-01 (l) — Increment B′ rework round 3 (owner review — 2 defects)

Owner reviewed in-browser and flagged two defects. Recording before code
(§66.6; these notes commit with the fix).

### Issue 1 — archive/restore/delete inline loading showed on ALL cards
| Owner | Root cause / canon | Fix |
|-------|--------------------|-----|
| Loading spinner appeared on **every** card (not just the one being acted on) | RTK Query mutation `isLoading` is a single **hook-wide** boolean, not per-target. `Branches.jsx` derived one shared `actionLoading` from those flags and passed it to every `BranchLedgerCard`, so any in-flight action spun all cards | Track the exact row: `pendingBranch = { id, type } \| null` in `Branches.jsx`. Set it in `handleConfirm` before the mutation, clear in a `finally`; per-card `actionLoading={pendingBranch?.id === branch._id ? pendingBranch.type : null}`. `BranchLedgerCard` already scopes the spinner off `actionLoading === action`, so only that row's icon spins. Dropped the now-unused `isLoading:` destructures. |

### Issue 2 — Delete returned backend 500 `MissingSchemaError`
| Owner | Root cause / canon | Fix |
|-------|--------------------|-----|
| Delete → "Something went wrong — please try again"; backend 500 `MissingSchemaError` | `deleteBranch` (`branch.controller.js`) called `mongoose.model("Report")` / `mongoose.model("Item")` for an immediate reference check — those **schemas don't exist yet** (only `User`/`Branch`; reports phase is later in `[auth → branches → reports]`), so mongoose throws `MissingSchemaError`. Also deviates from §30.6, which says the DELETE endpoint does **no immediate reference check** (archive-first only; the sweeper owns ref-checks in the reports phase) | **Minimal:** remove only the crashing ref-check block. `deleteBranch` now does the §30.6 archive step-1 (`isArchived=true`, `archivedAt`) and returns the current 200 `data: { archived: true }` + "…retention period". Session/transaction kept (owner direction; correct on mongoose ^9.9.3). No client change — client reads no `data.deleted`; tag invalidation refetches. |

### Canon + amendment decision (owner directive, applied logic)
- **Cascade is the load-bearing fact:** a branch hard-delete MUST cascade to
  reports → items → audios → transcriptions → chat. Those schemas arrive in the
  reports phase, so **hard-delete is deferred** — enabling it now would orphan
  future rows and dangle the reports live-join (§20/§30). Retracts the earlier
  "archived → hard-delete now" idea.
- **DELETE stays archive-only (§30.6)** with `data: { archived: true }` — exactly
  as the owner directed ("only correct `data: { archived: true }`").
- **UX caveat (intentional, this phase):** DELETE on an already-archived branch
  just re-archives (idempotent §30.6); the row stays under the archived filter
  until the reports-phase cascade/sweep lands.

### STRICT TODO — deferred to the reports phase (NOT built now)
1. When `Report`/`Item`/`Audio`/`Transcription`/`Chat` schemas exist: implement
   the **branch-delete cascade** in dependency order (branch → reports → items →
   audios → transcriptions → chat) plus the reference check (refuse while any
   row references the branch, 409). Mirror §30.6/§62/BR-15.
2. Only after the cascade exists: enable **hard-delete of an archived branch
   before the 30-day sweep** (owner requirement; the retention-window bypass is
   a reports-phase design decision). Response contract for that hard delete:
   `{ success: true, message: "Branch deleted", data: null }` (no resource
   remains after a hard delete — owner corrected the earlier `deleted: true`
   shape).

### Files
Backend: `controllers/branch.controller.js` (deleteBranch — removed ref-check).
Client: `pages/Branches.jsx` (per-card `pendingBranch` scoping).
Mirrors (same commit): findings (this), progress.md, task_plan.md, AGENTS.md,
spec §30.6/§20.4/§69.15.

### Gates
`node --check branch.controller.js` EXIT=0 · client eslint EXIT=0 · vite build
0 errors → `client/dist/` deleted · grep: no `mongoose.model("Report"|"Item")`
in the controller; per-card `pendingBranch?.id === branch._id` scoping. Owner
in-browser review before commit (add/commit/push, no merge).

## Session 2026-09-01 (m) — Increment B′ delete-flow correction (owner review, round 4)

Owner corrected the backend delete controller — round-3's minimal "archive-only
+ `data: { archived: true }`" was wrong. Recording before code (§66.6).

### Corrected delete semantics (owner)
| Step | Behavior |
|------|----------|
| 1 | **Find the branch to delete — must already be archived** — `Branch.findOne({ _id: branchId, user: userId, isArchived: true })` → 404 if not found. An active/non-archived branch or another user's branch (BR-13) is indistinguishable from nonexistent for DELETE; Archive is the separate action that sets `isArchived` |
| 2 | **Delete the branch with all linked resources, in the session** — the cascade. Models for reports/items/audios/transcriptions/chat don't exist this phase, so only the branch row is deleted now (nothing can reference it → no orphans); a **TODO comment** marks the cascade spot |
| 3 | **Response** `{ success, message: "Branch deleted", data: null }` — no resource remains after deletion (owner: data absent or `null`; confirmed safe: `unwrapEnvelope` returns `null`, `invalidatesTags` uses only `branchId`) |

> Round-5 correction (owner): the delete **finds an already-archived branch**
> (`isArchived: true`), it does **NOT** set `isArchived` via `updateOne`. The
> `updateOne` archive step was removed (Archive is a separate action).

### Canon/amendment
- **Amends spec §30.6/§62/§12941** (archive-first + sweeper-only hard delete):
  this phase's DELETE hard-deletes the (dependency-free) **already-archived**
  branch row immediately, in the session, with `data: null`. Deliberate owner
  directive.
- **STRICT TODO (reports phase):** the linked-resource cascade
  (branch → reports → items → audios → transcriptions → chat, §17.4/§62) — when
  those schemas exist, delete their rows here in the same session so no
  reference dangles (branch delete = full removal, per owner). Restore the
  reference check (409) then.

### Files
Backend: `controllers/branch.controller.js` (deleteBranch rewritten: find
archived → deleteOne + TODO cascade → `data: null`; no `updateOne`).
Mirrors (same commit): findings (this), progress.md, task_plan.md, AGENTS.md,
spec §30.6/§69.15/§12941.

### Gates
`node --check branch.controller.js` EXIT=0 · client lint/build unchanged
(no client edit) · grep: no `mongoose.model("Report"|"Item")` live deref
(cascade is a comment/TODO); find-archived-first + `data: null` confirmed.
Owner restarts backend + in-browser review, then add/commit/push (no merge).

## Session 2026-09-01 (n) — Increment B′ delete: find ARCHIVED branch, no updateOne (round 5)

Owner corrected round-4's `deleteBranch` again: it must find the branch with
`{ _id, user, isArchived: true }`, NOT set `isArchived` via `updateOne`. Applied:
```
Branch.findOne({ _id: branchId, user: userId, isArchived: true }) → 404 if !branch
Branch.deleteOne({ _id: branchId, user: userId })  // + cascade TODO (reports phase)
res: { success, message: "Branch deleted", data: null }
```
- **DELETE targets already-archived rows only**; `isArchived` is set solely by
  the Archive action (separate endpoint). Active branches → 404 for DELETE.
- **Amends spec §30.6/§62/§12941** for this phase; cascade + ref-check (409)
  remain STRICT TODOs for the reports phase.
- Detectable via grep: no `updateOne` inside `deleteBranch`; `isArchived: true`
  in the delete `findOne` filter; `data: null`.
- **Recorded in:** findings (this), progress.md, task_plan.md, AGENTS.md, spec
  §30.6/§69.15/§12941. Owner restarts backend + in-browser review, then
  add/commit/push (no merge).

## Session 2026-09-01 (o) — Increment C′ grid Actions column (BranchRowActions rewrite + wire-in)

- **Scope:** Add the grid Actions column to the Branches DataGrid (`columns/branches.jsx`), rewriting `BranchRowActions.jsx` to the card conventions and wiring lifecycle handlers + per-row loading into `Branches.jsx`.
- **`BranchRowActions.jsx` rewrite (A38/A43/§44.2/§56.3):**
  - Removed the `@mui/material` barrel import (tree-shaken single imports: `Box`, `Tooltip`, `IconButton`, `CircularProgress`).
  - Icon colors now via **`sx`** (`sx={{ color: '<palette>.main' }}`), never the `color` prop (A43): View `primary.main`, Edit `info.main`, Archive `warning.main`, Restore `success.main`, Delete `error.main` (same as the card).
  - Added the Tooltip **`<span>` wrapper** fix so a disabled IconButton still fires pointer events for the tooltip.
  - Added **`actionLoading`** prop (per-row): only the in-flight action's icon becomes `<CircularProgress size={16}/>`; sibling actions stay live (A34).
  - Handler contract is `(branch) => void` — each `RowActionButton onClick` calls the handler with the `branch` prop (matches `BranchLedgerCard`).
- **`columns/branches.jsx`:** `createBranchColumns({ onView, onEdit, onArchive, onRestore, onDelete, getActionLoading })` appends an `actions` column (`field: "actions"`, `sortable/filterable: false`, `disableColumnMenu: true`, `flex + minWidth` per C31, never `width`). `renderCell` renders `<BranchRowActions branch={params.row} actionLoading={getActionLoading?.(params.row._id) ?? null} .../>`.
- **`Branches.jsx`:** `branchColumns` memo now calls `createBranchColumns({...})` with deps `[handleView, handleEdit, handleConfirmOpen, getActionLoading]`; added `getActionLoading = useCallback((branchId) => pendingBranch?.id === branchId ? pendingBranch.type : null, [pendingBranch])` — per-row scoping identical to the card.
- **Chosen over the v9 `GridActionsCell`/`getActions` pattern:** kept the custom `BranchRowActions` (plain-column `renderCell`) to reuse the card's per-action tooltips + inline loading rather than the standard actions-cell API; valid v9 (custom `renderCell` returning a component).
- **No backend change.** No change to export/Print (C29 stays OFF for Branches). No quick filter.
- **Gates passed:** `npm run lint` 0, `npx vite build` 0 → `rm -rf client/dist`, grep battery clean (no `@mui/material` barrel in BranchRowActions; no deprecated `color` prop on IconButton — the `color=` literals are sx palette-token props consumed as `sx={{ color }}`; no `width:` in columns; `getActionLoading` wired per-row).
- **Recorded in:** this findings (o), progress.md, task_plan.md, AGENTS.md, spec §46.8/§56.3/§44.2. Owner in-browser review of grid actions, then add/commit/push (no merge).

## Session 2026-09-01 (p) — Barrel-import cleanup (folded into C′)

- **Scope:** Remove all MUI barrel (`@mui/material` root) and `@mui/icons-material` named imports from `client/src`, per the MUI bundle-size guide (named `@mui/icons-material` imports are up to 6× slower in dev) and for codebase consistency (most layout files already used single `/Icon` default imports).
- **`@mui/material` root barrel (no subpath):**
  - `components/reusable/MuiPagination.jsx` → `import Pagination from "@mui/material/Pagination";`
  - `components/layout/MuiSidebar.jsx` → `import { useTheme } from "@mui/material/styles";` + `import useMediaQuery from "@mui/material/useMediaQuery";`
- **`@mui/icons-material` named → single default imports (4 files, 16 icons):**
  - `BranchRowActions.jsx` (Visibility, Edit, Archive, Restore, Delete), `BranchLedgerCard.jsx` (+LocationOn, EventNote), `BranchesHeaderActions.jsx` (ViewList, ViewModule, FilterList, Add), `BranchFormDialog.jsx` (Business, LocationOn).
- **NOT touched (not barrel/issues):** `@mui/x-data-grid` (`DataGrid`, `gridClasses`), `@mui/x-date-pickers` (`LocalizationProvider`), `@mui/material/styles` — separate packages/subpaths; their named top-level imports are the documented form.
- **Verify grep clean:** `from "@mui/material"` (root, no subpath) → 0; `from "@mui/icons-material"` → 0.
- **Gates:** `npm run lint` 0, `npx vite build` 0 → `rm -rf client/dist`, grep battery clean.
- **Recorded in:** findings (p), progress.md, task_plan.md, AGENTS.md, spec §44.2. Folded into the C′ commit by owner decision.

## Session 2026-09-01 (q) — Planning-file audit + branches-foundation note (no code change)

- **Audit scope (owner):** read `findings.md`, `progress.md`, `task_plan.md`,
  `AGENTS.md`, and every file in `client/src/*` (excluding `theme/*`) before
  finalizing the step-6 plan — verify, don't trust.
- **Correction found:** AGENTS.md had "`MuiPagination` list/card-view pending"
  — **WRONG**. `MuiPagination` is wired into the Branches card/list view at
  `Branches.jsx:353-359` (`count=totalPages`, `page=paginationModel.page+1`,
  `onChange=handlePaginationChange`, gated `data.totalPages > 1` per C33),
  committed in B′ `2f8151c`. AGENTS.md corrected (2026-09-01).
- **Planning-file corrections applied (same uncommitted C′ working tree, no
  separate commit):**
  - `AGENTS.md` current-state rewritten: dropped the stale "no merge / main
    0-commits" text; documented the step-6 close workflow (commit → push →
    ff-merge → delete branch at phase approval); recorded the branches-foundation
    rationale; completed the client component inventory; corrected the
    `MuiPagination` claim.
  - `task_plan.md` Governing Rule #4 reconciled to "no merge DURING active work;
    step-6 merge+delete at phase close" (supersedes the earlier no-merge-ever
    wording); Phase 5.6 table updated (B′ done `2f8151c`; C′ built awaiting
    review); "Next Step" points to C′ commit + merge; stale items closed (Phase
    5.4 #10, Phase 5.5 gates, Increment-2 #11).
  - `findings.md`/`progress.md` appended with this audit record.
- **Branches-foundation rationale (owner, to keep on record):** dozens of items
  still remain for the branches resource (Branch Details §56.5, Name-cell link,
  reports-domain cascade, etc.) — the C′ work is only the beginning. The branch
  work was sequenced FIRST because **reports are dependent on branches**: without
  a created branch, no reports-bound work could start. Branches unblock the
  entire reports domain (§56: branches are the report's primary dimension;
  §5916: fixture order users → branches → reports → audio → transcriptions →
  conversations).
- **No code change in this session — planning files only.** The C′ grid Actions
  + barrel-cleanup code remains uncommitted in the working tree, pending owner
  in-browser review → step-5 approval → step-6 commit/merge.
