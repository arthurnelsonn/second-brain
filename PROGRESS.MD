# Build Progress Log

## Status
- [x] Phase 0: Foundation ✅
- [x] Phase 1: Core Shell & Navigation ✅
- [ ] Phase 2: Core Life Modules
- [ ] Phase 3: AI Integration
- [ ] Phase 4: Calendar Integration
- [ ] Phase 5: Task Integration & Time-Blocking
- [ ] Phase 6: Email Integration
- [ ] Phase 7: Polish & Cross-Platform

---

## Phase 0: Foundation ✅ COMPLETE

### Completed Tasks
- [x] Next.js 15.5.22 initialized with TypeScript, Tailwind CSS v4, App Router, ESLint
- [x] All PRD Appendix B dependencies installed (prod + dev)
- [x] Full folder structure from Appendix A created
- [x] Drizzle ORM schema (`lib/db/schema.ts`) — all 15 tables matching PRD Section 7 exactly
- [x] Drizzle DB instance (`lib/db/index.ts`) — SQLite at `~/.pcc/data/pcc.db`, WAL mode, PCC_DB_PATH env support
- [x] Migration runner (`lib/db/migrate.ts`) — runs on server start, applies Drizzle migrations + FTS5 + triggers
- [x] Initial migration generated (`lib/db/migrations/0000_parched_plazm.sql`)
- [x] `drizzle.config.ts` configured
- [x] `next.config.ts` — next-pwa with NetworkFirst for `/api/*`, CacheFirst for static assets
- [x] `public/manifest.json` — PWA manifest (name, short_name, theme #6366F1, bg #0F0F0F, standalone)
- [x] `public/icons/` — placeholder icons at 192x192 and 512x512
- [x] Root layout metadata updated for PWA (manifest, themeColor via viewport export)
- [x] All app route placeholder `page.tsx` files created
- [x] All API route stubs created (`app/api/**`)
- [x] `lib/ai/gemini.ts` — lazy Gemini client singleton
- [x] `lib/ai/prompts.ts` — prompt template loader
- [x] `lib/secrets.ts` — AES-256-GCM encrypt/decrypt, machine.key derivation, typed secret interfaces
- [x] `lib/env.ts` — Zod env validator, throws on missing required vars
- [x] `lib/utils.ts` — cn(), formatDate(), todayString(), extractVideoUrl(), truncate()
- [x] `lib/sync/*.ts` — sync stubs for all 6 external sources
- [x] `store/index.ts` — useUiStore, useSyncStore, useAppStore (all persisted)
- [x] `types/index.ts` — Drizzle InferSelectModel types for all 15 tables
- [x] `.env.local` + `.env.example` created
- [x] TypeScript check passes with 0 errors
- [x] `scripts/verify-db.js` — DB verification script

---

## Phase 1: Core Shell & Navigation ✅ COMPLETE

### Completed Tasks
- [x] `components/layout/Sidebar.tsx` — fixed 240px sidebar, icon-only 64px collapsed, active route highlight, sync dot, mobile bottom tab bar (5 items)
- [x] `components/layout/PrimaryFocusBanner.tsx` — fetches today's plan, shows focus text, dismiss button
- [x] `components/layout/CommandPalette.tsx` — Cmd+K/Ctrl+K, fuzzy filter, arrow key nav, Enter/Escape
- [x] `components/layout/ShellMain.tsx` — client wrapper, adjusts margin for sidebar collapse state
- [x] `components/layout/MorningGuard.tsx` — reads morning_pending cookie, redirects to /morning
- [x] `app/(shell)/layout.tsx` — composes Sidebar + ShellMain + PrimaryFocusBanner + CommandPalette + MorningGuard
- [x] `app/morning/page.tsx` — placeholder with "Complete for now" button (POST /api/morning, clears cookie, redirects /today)
- [x] `app/api/morning/today/route.ts` — GET today's morning plan
- [x] `app/api/morning/route.ts` — POST create/update morning plan (upsert)
- [x] `app/api/tasks/route.ts` — GET all tasks (returns [] when empty)
- [x] `app/api/calendar/events/route.ts` — GET all calendar events
- [x] `app/api/notes/route.ts` — GET all notes
- [x] `app/api/grocery/route.ts` — GET all grocery items
- [x] `app/api/email/inbox/route.ts` — GET non-archived emails
- [x] Root layout: async server-side morning_pending cookie logic

---

## Epic 2: Morning Ritual Prompt ✅ COMPLETE

### Completed Tasks
- [x] `app/morning/page.tsx` — full multi-step ritual flow with Framer Motion slide transitions:
  - Step 1: "Your Day At A Glance" (today's events timeline, tasks checklist with priority badges, email brief placeholder, Continue button)
  - Step 2: "Set Your Primary Focus" (120-char text input with counter, disabled until text entered or skipped, subtle "Skip for today" option)
  - Step 3: "Morning Reflection" (optional reflection textarea, "Begin My Day" button, POSTs to `/api/morning` and redirects to `/today`)
  - Progress dots at top (3 dots, active one filled indigo)
- [x] `app/api/morning/route.ts` — POST route handler:
  - Upserts into `morning_plans` using today's date (`YYYY-MM-DD`) as unique key
  - Sets `completed_at` to current timestamp when `primary_focus` provided and not skipped
  - Sets `skipped_until` to end of today (`23:59:59`) when `skipped: true`
  - Returns saved plan record JSON

---

## Epic 5A: Daily Planner (Today View) ✅ COMPLETE

### Completed Tasks
- [x] `components/today/TimeBlockGrid.tsx` — hourly rows from 06:00 to 23:00, red current-time indicator line with auto-scroll on mount, event blocks and scheduled task blocks overlaid, dotted background for free slots
- [x] `components/today/HourNoteInput.tsx` — hover-to-reveal note input, auto-save on blur/Enter, displays existing note with edit icon on click
- [x] `app/api/daily-notes/route.ts` — GET (fetch daily notes by date) and POST (upsert/delete daily notes by date + hour block) route handlers using Drizzle ORM
- [x] `components/today/TodaySummaryCard.tsx` — formatted date, time-based greeting, event count, due tasks count, completed tasks count, and morning plan primary focus banner
- [x] `app/(shell)/today/page.tsx` — wired up with React Query for fetching events, tasks, morning plan, and daily notes
- [x] TypeScript: 0 errors

### Completed Tasks
- [x] `app/api/projects/route.ts` — GET (non-archived) + POST create
- [x] `app/api/projects/[id]/route.ts` — PATCH update
- [x] `app/api/notes/route.ts` — GET (by projectId or all) + POST create
- [x] `app/api/notes/[id]/route.ts` — GET single + PATCH (title/content) + DELETE
- [x] `app/api/notes/search/route.ts` — FTS5 full-text search with `MATCH` + `rank`
- [x] `lib/db/migrate.ts` — seeds 3 default projects (Brainstorm/Work/Personal) on first run
- [x] `components/workspace/ProjectsSidebar.tsx` — project list, note count badges, inline new-project form with color picker + icon selector
- [x] `components/workspace/NotesList.tsx` — notes per project, preview, relative time, new-note button
- [x] `components/workspace/NoteEditor.tsx` — Tiptap StarterKit + Placeholder, debounced 3s auto-save, editable H1 title, Saving/Saved indicator, disabled Ask AI button with tooltip
- [x] `app/(shell)/workspace/page.tsx` — 3-column desktop (200px | 280px | flex), mobile tab bar
- [x] `@tiptap/extension-placeholder` installed
- [x] TypeScript: 0 errors

---

## Epic 5B: Smart Grocery List ✅ COMPLETE

### Completed Tasks
- [x] `app/api/grocery/route.ts` — GET (recurring seed + unchecked-first ordering) + POST create with validation
- [x] `app/api/grocery/[id]/route.ts` — PATCH (any fields including is_checked) + DELETE single item
- [x] `app/api/grocery/checked/route.ts` — DELETE all is_checked=true items
- [x] `app/(shell)/grocery/page.tsx` — full module:
  - Inline add form: name, qty+unit side-by-side, category dropdown (9 options), store input
  - Group toggle: By Category / By Store, persisted in localStorage
  - Item rows: checkbox (strikethrough + moves to bottom), name+qty, category badge, hover edit/delete
  - Inline edit form (pre-filled, replaces add form area)
  - "Clear checked items" button (visible only when items are checked)
  - Export FAB (fixed bottom-right): plain-text list grouped by category, copies to clipboard
  - Toast notification: "Copied to clipboard!"
  - Empty state with shopping cart icon
- [x] Fixed pre-existing TS errors in `app/api/tasks/route.ts` and `app/api/calendar/events/route.ts` (Drizzle timestamp columns require Date objects, not raw Unix numbers)
- [x] TypeScript: 0 errors


---

## Phase 3: AI Infrastructure ✅ COMPLETE

### Completed Tasks
- [x] `lib/ai/gemini.ts` — two lazy singletons: `getGeminiPro()` (gemini-1.5-pro) and `getGeminiFlash()` (gemini-2.0-flash), both guarded by `server-only`
- [x] `lib/ai/prompts.ts` — `SYSTEM_BASE` constant, `buildPrompt()` with `{{variable}}` substitution, `assembleUserMessage()`, `seedPromptTemplates()` with all 11 templates (9 from PRD + eod_summary + grocery_extract)
- [x] `lib/ai/stream.ts` — `streamGemini()` async generator yielding text chunks, `createStreamResponse()` using Vercel AI SDK `createTextStreamResponse`
- [x] `lib/ai/rateLimit.ts` — `checkRateLimit()` / `incrementCallCount()` using settings table keys `ai_calls_today`, `ai_calls_date`, `ai_daily_limit` (default 100/day)
- [x] `lib/db/migrate.ts` — `seedPromptTemplates()` called on server start
- [x] `app/api/ai/brainstorm/route.ts` — **REAL**: streaming POST, supports `mode: organize | critique | expand`, uses gemini-1.5-pro
- [x] `app/api/ai/morning/route.ts` — **REAL**: non-streaming POST, accepts events + tasks + focus, returns `{ suggestions: string }`
- [x] `app/api/ai/email-summary/route.ts` — stub (202, coming later)
- [x] `app/api/ai/email-draft/route.ts` — stub (202, coming later)
- [x] `app/api/ai/task-extract/route.ts` — stub (202, coming later)
- [x] `app/api/ai/schedule/route.ts` — stub (202, coming later)
- [x] `app/api/ai/note-qa/route.ts` — stub (202, coming later)
- [x] `app/api/ai/grocery-extract/route.ts` — stub (202, coming later)
- [x] `app/api/ai/eod-summary/route.ts` — stub (202, coming later)
- [x] `ai` package installed (Vercel AI SDK v4)
- [x] TypeScript: 0 errors

---

## Epic 6: AI Brainstorm Dump ✅ COMPLETE

### Completed Tasks
- [x] `app/(shell)/brainstorm/page.tsx` — full split-pane layout:
  - Tab switcher: "New Dump" | "History"
  - Left pane: monospace textarea, 5s autosave to DB, 3 mode buttons (Organize/Critique/Expand) with loading state
  - Right pane: empty state, streaming Markdown via react-markdown, Copy + Save to Workspace buttons post-stream
  - History tab: past sessions sorted by date, mode badge, AI badge, click to restore
  - Toast notifications for save actions
- [x] `app/api/brainstorm/save/route.ts` — POST upsert (insert or update by id) into brain_dumps
- [x] `app/api/brainstorm/history/route.ts` — GET all non-quick-capture sessions desc
- [x] `components/brainstorm/QuickCapture.tsx` — floating ⚡ FAB, Ctrl+Shift+B shortcut, 500-char modal, POST with is_quick_capture=true, "Captured!" toast
- [x] `app/(shell)/layout.tsx` — QuickCapture added globally
- [x] `react-markdown` installed
- [x] TypeScript: 0 errors

### ⚠️ Known Bugs — NOT YET FIXED (stopped here)
- [ ] **History disappears on refresh** — `brain_dumps` records ARE being saved to SQLite correctly, but on page load the history list shows empty. The `loadHistory()` fetch to `/api/brainstorm/history` is firing but returning stale/empty data. Suspected cause: the autosave 5s timer uses a stale closure on `sessionId` — the first save creates a new record but subsequent saves may be creating duplicates instead of updating, and the history query may be filtering them out. Needs investigation of the save/upsert logic and whether `is_quick_capture` filter is too aggressive.
- [ ] **"Save to Workspace" note disappears after refresh** — The note IS created in the `notes` table (POST `/api/notes` returns 201 with a valid id), but when navigating to `/workspace` and selecting the Brainstorm project, the note does not appear. Suspected cause: the note `content` field is being saved as a raw Markdown string but `NotesList.tsx` tries to parse it as Tiptap JSON (`JSON.parse(content)`), which fails silently and shows an empty preview. The note may actually be there but invisible. Check by querying the DB directly or adding a raw content fallback in `NoteEditor.tsx`.
- [ ] **Hydration warning on `/workspace`** — `formatDistanceToNow` in `NotesList.tsx` produces different output on server vs client. Added `suppressHydrationWarning` as a workaround but the underlying cause (SSR + relative time) should be fixed properly by only rendering the timestamp on the client side.
