# Product Requirements Document (PRD)
## Personal Command Center — Single-User Productivity PWA
**Version:** 1.0  
**Status:** Draft  
**Author:** AI Product Architect  
**Date:** August 2026

---

## Table of Contents

1. [Product Overview & Vision](#1-product-overview--vision)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Tech Stack Recommendations](#3-tech-stack-recommendations)
4. [System Architecture](#4-system-architecture)
5. [Feature Breakdown — Epics & User Stories](#5-feature-breakdown--epics--user-stories)
6. [API & Integration Requirements](#6-api--integration-requirements)
7. [Data Model / Schema](#7-data-model--schema)
8. [UI/UX Principles](#8-uiux-principles)
9. [Phased Implementation Plan](#9-phased-implementation-plan)
10. [Security & Credential Management](#10-security--credential-management)
11. [Open Questions & Future Considerations](#11-open-questions--future-considerations)

---

## 1. Product Overview & Vision

### 1.1 Problem Statement

Modern knowledge work is fragmented across dozens of tools: multiple calendars, task managers, email clients, notes apps, and AI assistants. Each requires a context switch, and none of them talk to each other in a meaningful, personalized way. The result is cognitive overhead, missed time blocks, disorganized ideas, and reactive (rather than intentional) days.

### 1.2 Product Vision

**Personal Command Center (PCC)** is a single-user, AI-augmented productivity hub that unifies every thread of daily work and life management into one intentional interface. It is not a SaaS product — it is a personal operating system, owned and run entirely by its sole user.

The guiding philosophy is: **Pull everything in, let AI make sense of it, let the morning ritual set the day's intention.**

### 1.3 Core Principles

| Principle | Description |
|-----------|-------------|
| **Single-owner simplicity** | Zero multi-tenancy complexity. No auth walls, no shared state. |
| **Offline-first** | All core functionality works without internet. Syncs when connected. |
| **AI as a thinking partner** | Gemini is woven into the UX — not bolted on as a chatbot widget. |
| **One codebase, all platforms** | Web browser, Android/iOS via Capacitor, desktop via Tauri. |
| **Intentional mornings** | Every session begins with a ritual that sets the day's direction. |
| **Privacy-first** | All data lives locally. API calls go directly from user's device to services. |

### 1.4 Personas

Since this is a single-user application, there is one persona:

> **The Owner/User** — A productivity-minded professional who manages a complex personal and professional life across multiple digital services. They think deeply about their time, have ideas frequently throughout the day, and want one trusted system that reduces friction and amplifies intentionality.

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

- Eliminate the need to open 5+ separate apps to understand the day.
- Reduce time spent on morning planning from 20+ minutes to under 5 minutes.
- Capture every idea immediately without losing it to context.
- Never miss a task or meeting because it lived in an isolated silo.

### 2.2 Success Metrics (Personal KPIs)

| Metric | Target |
|--------|--------|
| Morning setup time | < 5 minutes from app open to focused work |
| Missed scheduled tasks | 0 per week |
| Brain dump capture rate | 100% (ideas captured before they are forgotten) |
| App load time (PWA) | < 2s on cached load |
| Offline functionality coverage | 80% of features functional without internet |

---

## 3. Tech Stack Recommendations

### 3.1 Frontend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) with TypeScript | Best PWA support, SSR/API routes in one repo, strong ecosystem |
| **UI Library** | shadcn/ui + Tailwind CSS v4 | Accessible, unstyled-by-default components, full control over design |
| **State Management** | Zustand | Lightweight, no boilerplate, perfect for single-user with no auth state |
| **Drag & Drop** | dnd-kit | Modern, accessible drag/drop for calendar time-blocking |
| **Calendar Rendering** | react-big-calendar or FullCalendar React | Mature, supports week/day/month views with custom event rendering |
| **Data Fetching** | TanStack Query (React Query) | Caching, background re-fetch, offline support, stale-while-revalidate |
| **Forms** | React Hook Form + Zod | Type-safe forms with runtime validation |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **Animations** | Framer Motion | Smooth transitions for the morning ritual flow |

### 3.2 Backend / API Layer

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **API Routes** | Next.js Route Handlers (App Router) | Co-located with frontend, zero separate server to manage |
| **Runtime** | Node.js 20+ | Full access to file system and native modules |
| **Job Scheduling** | node-cron (within Next.js) | Background sync jobs for calendar/email polling |
| **Email IMAP** | imapflow + mailparser | Modern IMAP client for non-Gmail accounts |

### 3.3 Database

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Primary DB** | SQLite via better-sqlite3 | Local, file-based, zero setup, perfect for single-user |
| **ORM** | Drizzle ORM | Type-safe, lightweight, excellent SQLite support, fast migrations |
| **DB Location** | `~/.pcc/data/pcc.db` | Outside project directory, survives app updates |
| **Offline Cache** | IndexedDB via Dexie.js | Client-side cache for PWA offline reads |
| **Secrets Store** | `~/.pcc/secrets/` (encrypted JSON) | OAuth tokens stored outside the repo, encrypted at rest |

> **Design Note:** SQLite is the correct choice here. It is used in production by major platforms and is battle-tested for single-user workloads. The `.db` file can be backed up by simply copying it.

### 3.4 Cross-Platform Deployment

| Target | Technology | Details |
|--------|-----------|---------|
| **Web (PWA)** | next-pwa (Workbox) | Service worker, installable via browser, offline caching |
| **Mobile (iOS/Android)** | Capacitor 6 | Wrap the Next.js export, native device APIs (notifications, haptics) |
| **Desktop (Mac/Win/Linux)** | Tauri 2 | Lightweight Rust shell, ~4MB binary, accesses local SQLite directly |

**Recommended build strategy:**
- Development: `next dev` in browser
- PWA: `next build` → deploy to Vercel/self-host, or serve locally via `serve`
- Mobile: Capacitor wraps the `next export` static build
- Desktop: Tauri calls Next.js API routes via localhost sidecar

### 3.5 AI Integration

| Component | Technology |
|-----------|-----------|
| **AI Model** | Google Gemini 1.5 Pro (for deep analysis) / Gemini 2.0 Flash (for quick inline tasks) |
| **SDK** | `@google/generative-ai` (official Node.js SDK) |
| **Streaming** | Gemini streaming API via SSE for real-time brainstorm responses |
| **Prompt Storage** | SQLite `prompts` table with versioning |

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    USER'S DEVICE                           │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Next.js App (localhost or PWA)          │  │
│  │                                                     │  │
│  │  ┌──────────────┐    ┌──────────────────────────┐  │  │
│  │  │  React UI    │◄──►│   Zustand / React Query  │  │  │
│  │  │  (Frontend)  │    │   (State + Cache Layer)  │  │  │
│  │  └──────────────┘    └──────────────────────────┘  │  │
│  │         │                                           │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │           Next.js Route Handlers             │  │  │
│  │  │           (Internal API Layer)               │  │  │
│  │  └───────────────────┬──────────────────────────┘  │  │
│  │                      │                              │  │
│  │  ┌───────────────────▼──────────────────────────┐  │  │
│  │  │         Drizzle ORM ◄──► SQLite DB            │  │  │
│  │  │         (~/.pcc/data/pcc.db)                 │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                         │                                  │
│          ┌──────────────┼──────────────┐                  │
│          ▼              ▼              ▼                  │
│   [Secrets Store]  [IndexedDB]  [Service Worker]          │
│   (~/.pcc/secrets) (Dexie.js)   (Offline Cache)           │
└────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼──────────────────────┐
          ▼               ▼                      ▼
  ┌──────────────┐ ┌─────────────┐    ┌─────────────────┐
  │ Google APIs  │ │Microsoft    │    │  Gemini API     │
  │ - Calendar   │ │Graph API    │    │  (Brainstorm,   │
  │ - Gmail      │ │- Calendar   │    │   Email, etc.)  │
  │ - Tasks      │ │- Outlook    │    └─────────────────┘
  └──────────────┘ └─────────────┘
          │               │
  ┌──────────────┐ ┌─────────────────┐
  │  Todoist API │ │  Notion API     │
  │  (Tasks)     │ │  (Tasks/Notes)  │
  └──────────────┘ └─────────────────┘
```

### 4.1 Data Flow Summary

1. **Inbound Sync:** Cron jobs (every 15 min or on-demand) call external APIs → normalize data → upsert into local SQLite via Drizzle.
2. **UI Reads:** React Query fetches from Next.js Route Handlers → served from SQLite (fast, local, offline-capable).
3. **AI Calls:** Route handlers proxy user content to Gemini API → stream response back to client.
4. **Outbound Writes:** User actions (create event, complete task) → local DB update first (optimistic) → background sync to external API.

---

## 5. Feature Breakdown — Epics & User Stories

---

### EPIC 1: Core Shell & Navigation

> The foundational layout and routing of the app.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E1-S1 | As the user, I want a persistent sidebar navigation so I can jump between modules without losing context. | Sidebar renders on all views; active route is highlighted; collapses to icon-only on mobile. |
| E1-S2 | As the user, I want the app to be installable as a PWA on my phone and desktop. | App passes PWA audit in Lighthouse; install prompt appears on eligible browsers; app works offline. |
| E1-S3 | As the user, I want a global command palette (⌘K) so I can navigate, create tasks, or trigger AI without touching the mouse. | Palette opens with ⌘K/Ctrl+K; supports fuzzy search across nav routes, recent items, and quick actions. |
| E1-S4 | As the user, I want a unified notifications/alert badge on the sidebar that shows items needing attention. | Badge shows count of overdue tasks + unread urgent emails + today's events starting in < 30 min. |
| E1-S5 | As the user, I want the app to remember my last-visited module and open it on next launch. | Last route is persisted in localStorage and restored on app load (after morning ritual check). |

---

### EPIC 2: Morning Ritual Prompt

> The daily intentionality gate that anchors the user's day.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E2-S1 | As the user, I want a Morning Ritual screen to appear automatically on first app open each day. | On first load after midnight, if Morning Plan for today is not completed, the app renders the ritual overlay. Dismissal without completion is possible but flagged. |
| E2-S2 | As the user, I want the Morning Ritual to show me a snapshot of today (events, tasks due, weather) so I can plan with full context. | Ritual screen displays: today's calendar events (sorted by time), tasks due today, yesterday's incomplete tasks, and optionally a weather widget. |
| E2-S3 | As the user, I want to write my "One Primary Focus" for the day so it pins to the dashboard header. | Text field for primary focus; on save, the focus text persists to the `morning_plans` table and displays as a banner throughout the day. |
| E2-S4 | As the user, I want to optionally log a morning intention/gratitude note so I can build a reflective habit log. | Optional free-text `reflection` field; stored in DB; accessible from a "Past Reflections" journal view. |
| E2-S5 | As the user, I want Gemini to optionally read my plan and suggest any missing prep steps or flag conflicts. | "Get AI Suggestions" button sends today's events + focus text to Gemini; response displayed inline as a bulleted suggestion list. |
| E2-S6 | As the user, I want a "Skip for today" option that suppresses the ritual until tomorrow. | Skip sets a `skipped_until` timestamp; app does not show ritual again until the next calendar day. |

---

### EPIC 3: Calendar Aggregator

> One unified view of all calendars.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E3-S1 | As the user, I want to connect my Google Calendar so events sync automatically. | OAuth2 flow for Google; access token + refresh token stored in secrets store; initial full sync on connect; incremental sync (delta tokens) every 15 minutes. |
| E3-S2 | As the user, I want to connect my Microsoft Outlook Calendar via Microsoft Graph API. | Microsoft OAuth2 flow; delta query sync; events normalized and stored in `calendar_events` with `source = 'outlook'`. |
| E3-S3 | As the user, I want to connect my Apple Calendar via CalDAV so iCloud events appear. | CalDAV endpoint configured with Apple ID app-specific password; synced via node-caldav library. |
| E3-S4 | As the user, I want to see all events in a unified day/week/month calendar view with color-coded sources. | Calendar renders events from all sources; each calendar source has a distinct color configurable in Settings; view toggles: Day / Week / Month / Agenda. |
| E3-S5 | As the user, I want to create local "PCC" events that live only in this app (not pushed to external calendars, unless I choose). | New event form has "Source" dropdown: PCC Local / Google / Outlook; only pushes to external API if an external source is selected. |
| E3-S6 | As the user, I want to click any event to see its full details (title, description, attendees, location, video link). | Event detail drawer slides in from the right; includes a "Join Meeting" button if a video URL is detected; shows raw external event ID for debugging. |
| E3-S7 | As the user, I want to filter the calendar view to show/hide individual calendar sources. | Per-source toggle in calendar sidebar; filter state persists in localStorage. |
| E3-S8 | As the user, I want a "Next 7 Days" mini-agenda widget on the main dashboard. | Dashboard widget renders a compact list of upcoming events for the next 7 days, grouped by day. |

---

### EPIC 4: Task Integration & Time-Blocking

> Pull tasks from external tools; drag them into calendar slots.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E4-S1 | As the user, I want to connect Todoist so my tasks sync into the app. | Todoist API OAuth (or API token); full sync on connect; webhook or polling every 10 min for updates; tasks stored in `tasks` table with `source = 'todoist'`. |
| E4-S2 | As the user, I want to connect a Notion database as a task source. | Notion OAuth integration; user selects a Notion database; rows with a "Status" and "Due Date" property are imported as tasks. |
| E4-S3 | As the user, I want to see a "Task Inbox" panel alongside my calendar showing all unscheduled tasks. | Task Inbox panel (collapsible, right-side panel on calendar view) lists all tasks where `scheduled_start` is NULL; filterable by source, priority, and due date. |
| E4-S4 | As the user, I want to drag a task from the Task Inbox onto a calendar time slot to schedule it. | dnd-kit drag source = task card; drop target = calendar time cell; on drop: sets `scheduled_start` and `scheduled_end` (duration defaults to 30 min, resizable); renders as a distinct "task block" on calendar. |
| E4-S5 | As the user, I want to resize a time-blocked task on the calendar to adjust its duration. | Task blocks are vertically resizable on the calendar; resize updates `scheduled_end` in DB. |
| E4-S6 | As the user, I want to mark a task as complete directly from the calendar or task inbox. | Checkbox on task card/block; on check: `completed_at` timestamp set; task grays out; if task has a Todoist source, the completion is pushed back to Todoist API. |
| E4-S7 | As the user, I want to create local tasks inside PCC without needing an external tool. | New task form: title, description, due date, priority (P1–P4), project label; saved to `tasks` table with `source = 'local'`. |
| E4-S8 | As the user, I want AI to suggest which open time slots I should use for which unscheduled tasks. | "AI Schedule Suggestions" button: sends today's calendar + unscheduled task list to Gemini; returns a prioritized suggestion list with reasoning; user can apply suggestions with one click. |

---

### EPIC 5: Life Management Modules

> Sub-modules for daily life beyond work.

#### 5A: Daily Planner

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E5A-S1 | As the user, I want a "Today" page that shows a time-segmented view of my full day (events + tasks + free time). | Today view renders hourly blocks from 6 AM to 10 PM; events and task blocks overlaid; free slots visually distinct. |
| E5A-S2 | As the user, I want to add quick notes to specific time blocks during my day for journaling/reflection. | Each hour block accepts an inline note; notes saved to `daily_notes` table with timestamp. |
| E5A-S3 | As the user, I want an end-of-day summary generated by AI based on my completed tasks and calendar. | "EOD Wrap-up" button: Gemini receives completed tasks and attended events; generates a 3-5 sentence summary with tomorrow's prep suggestions. |

#### 5B: Smart Grocery List

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E5B-S1 | As the user, I want to add grocery items with optional category, quantity, and store tags. | Add item form: name, quantity, unit, category (produce/dairy/etc.), store; saved to `grocery_items`. |
| E5B-S2 | As the user, I want items grouped by category and sorted by store for efficient shopping. | List view groups items by category; toggle to group by store; checked items move to bottom. |
| E5B-S3 | As the user, I want to type or paste a recipe and have AI extract the ingredient list. | "Extract from Recipe" input: user pastes recipe text; Gemini extracts ingredients + quantities; auto-populates grocery list; user confirms before adding. |
| E5B-S4 | As the user, I want to share the current grocery list as a plaintext/WhatsApp-ready message. | "Export" button generates a clean text list; copies to clipboard with one click. |
| E5B-S5 | As the user, I want recurring items to auto-add to the list on a schedule. | `recurring_items` table; cron job adds recurring items to `grocery_items` on configured day/interval. |

#### 5C: Personal Workspace (Notes & Projects)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E5C-S1 | As the user, I want to create rich-text notes organized into Projects (folders). | Notes use a block-based editor (Tiptap); nested under Projects; stored in `notes` table with `project_id` FK. |
| E5C-S2 | As the user, I want to search all notes full-text instantly. | SQLite FTS5 extension powers full-text search; results ranked by relevance; highlights matching terms. |
| E5C-S3 | As the user, I want to link a note to a calendar event or task for context. | Note editor supports `@` mention to link to events/tasks; stored as `note_links`; linked items shown in note sidebar. |
| E5C-S4 | As the user, I want to pin important notes to the dashboard. | `is_pinned` boolean on `notes`; pinned notes appear in a widget on the main dashboard. |
| E5C-S5 | As the user, I want to ask Gemini questions about the content of any note. | "Ask AI" button in note editor: sends note content + question to Gemini; response appears in a side panel without leaving the note. |

---

### EPIC 6: AI Brainstorm Dump

> A capture-first, AI-powered ideation space.

> **⚠️ Implementation Note (added during build):** Two bugs remain unresolved as of last session:
> 1. **History list empty on refresh** — `brain_dumps` rows are saved to SQLite but the history tab shows empty after a page refresh. Investigate the `/api/brainstorm/history` route and the autosave upsert logic (stale closure on `sessionId` may be creating duplicate rows instead of updating).
> 2. **Saved workspace note not visible** — `POST /api/notes` succeeds (201) but the note does not appear in the Brainstorm project in `/workspace`. Likely cause: note `content` is saved as raw Markdown but `NotesList.tsx` and `NoteEditor.tsx` expect Tiptap JSON format. Fix by either converting Markdown to Tiptap JSON before saving, or adding a plain-text fallback in the editor.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E6-S1 | As the user, I want a large, distraction-free text area to brain-dump ideas in raw form. | Brainstorm view is a full-viewport, minimal text area; no formatting toolbar; autosaves every 5 seconds to `brain_dumps`. |
| E6-S2 | As the user, I want to submit my dump and receive instant Gemini feedback in three modes: Organize, Critique, and Expand. | Three action buttons: "Organize" (returns structured outline), "Critique" (plays devil's advocate), "Expand" (adds missing angles). Responses stream in real-time via SSE. |
| E6-S3 | As the user, I want the AI response to appear side-by-side with my dump so I can compare. | Split-pane layout: left = user dump; right = Gemini response; response rendered as Markdown. |
| E6-S4 | As the user, I want to save the AI response as a note in my Personal Workspace with one click. | "Save to Workspace" button on Gemini response pane; creates a new note in the `Brainstorm` default project with timestamp title. |
| E6-S5 | As the user, I want to maintain a history of all past brainstorm sessions I can search and revisit. | `brain_dumps` table stores all sessions; History tab shows sessions sorted by date; full-text searchable. |
| E6-S6 | As the user, I want a "Quick Capture" shortcut (e.g., global floating button) that opens a minimal modal to capture a thought from any screen. | Floating action button or ⌘⇧B shortcut opens a small modal text field; saves immediately to `brain_dumps` with `quick_capture = true`; no AI processing until user explicitly opens full Brainstorm view. |

---

### EPIC 7: AI Email Review

> Gemini-powered email triage integrated directly into the app.

**User Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| E7-S1 | As the user, I want to connect my Gmail account so emails sync into PCC. | Gmail API OAuth2; fetches unread emails from INBOX; stores headers + body in `emails` table; syncs every 5 minutes. |
| E7-S2 | As the user, I want to connect a non-Gmail account via IMAP so I can use any email provider. | IMAP config (host, port, username, password/app-password) stored in secrets store; `imapflow` connects and fetches inbox messages. |
| E7-S3 | As the user, I want a unified inbox view showing all emails from all connected accounts. | Inbox list: sender name, subject, snippet, time, account source badge; unread emails bold; read state synced back to source. |
| E7-S4 | As the user, I want to open an email and have Gemini provide a one-paragraph plain-English summary. | Email detail view auto-generates a summary via Gemini on open; summary shown in a highlighted card above the full email body; skips if email < 100 words. |
| E7-S5 | As the user, I want Gemini to identify the required action from any email and add it as a task. | "Extract Action" button on email detail: Gemini returns a suggested task title + due date; user confirms; task saved to `tasks` with source = 'email_extracted'. |
| E7-S6 | As the user, I want Gemini to draft a reply to an email based on my instructions. | "Draft Reply" flow: user types a short instruction (e.g., "Accept the meeting for Thursday, mention I'll be 5 min late"); Gemini generates a full, properly toned reply; user edits and sends. |
| E7-S7 | As the user, I want to send the drafted reply directly from PCC via Gmail API or SMTP. | "Send" button in reply composer: for Gmail accounts, uses Gmail API `messages.send`; for IMAP accounts, uses Nodemailer via SMTP. |
| E7-S8 | As the user, I want a "Morning Email Brief" that Gemini generates summarizing overnight emails. | Triggered during Morning Ritual (Epic 2): Gemini receives last 24h email subjects + senders; returns a 5-bullet priority summary; displayed on the morning ritual screen. |
| E7-S9 | As the user, I want to mark emails as read, archive, or flag from within PCC. | Action buttons on email detail: Mark Read / Archive / Flag; each action is synced back to Gmail API or IMAP. |

---

## 6. API & Integration Requirements

### 6.1 Google APIs

#### 6.1.1 Google Calendar API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/calendars/primary/events` | GET | List all events (with `timeMin`, `timeMax`, `syncToken`) |
| `/calendars/primary/events` | POST | Create new event |
| `/calendars/primary/events/{eventId}` | PUT | Update event |
| `/calendars/primary/events/{eventId}` | DELETE | Delete event |
| `/users/me/calendarList` | GET | Get list of all calendars |

**Auth:** OAuth2 with scopes `https://www.googleapis.com/auth/calendar`

**Sync Strategy:** Use `nextSyncToken` (incremental sync) — on first call, do a full sync; subsequent calls use the token to fetch only deltas.

#### 6.1.2 Gmail API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/me/messages` | GET | List messages (with `q` filter, e.g., `in:inbox is:unread`) |
| `/users/me/messages/{messageId}` | GET | Get full message content (`format=full`) |
| `/users/me/messages/send` | POST | Send email (base64-encoded RFC 2822 message) |
| `/users/me/messages/{id}/modify` | POST | Mark read/archive (`addLabelIds`, `removeLabelIds`) |
| `/users/me/threads/{threadId}` | GET | Get full thread for conversation view |

**Auth:** OAuth2 with scopes `https://www.googleapis.com/auth/gmail.modify`

### 6.2 Microsoft Graph API (Outlook)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/me/calendarView` | GET | Get events in a time window |
| `/me/events` | POST | Create event |
| `/me/events/{id}` | PATCH | Update event |
| `/me/events/{id}` | DELETE | Delete event |

**Auth:** MSAL OAuth2 with scopes `Calendars.ReadWrite`

**Sync Strategy:** Use `$deltaToken` (delta query) for incremental sync.

### 6.3 Apple Calendar (CalDAV)

| Operation | Protocol | Purpose |
|-----------|----------|---------|
| PROPFIND | CalDAV | Discover calendars |
| REPORT (calendar-query) | CalDAV | Fetch events in date range |
| PUT | CalDAV | Create/update event (iCalendar format) |
| DELETE | CalDAV | Delete event |

**Auth:** Apple ID + app-specific password. Endpoint: `https://caldav.icloud.com/`

**Library:** `tsdav` (TypeScript CalDAV/CardDAV library)

### 6.4 Todoist API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tasks` | GET | Get all active tasks |
| `/tasks/{id}` | POST | Update task |
| `/tasks/{id}/close` | POST | Complete task |
| `/tasks` | POST | Create task |

**Auth:** OAuth2 or personal API token (stored in secrets). Base URL: `https://api.todoist.com/rest/v2`

### 6.5 Notion API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/databases/{id}/query` | POST | Query tasks database with filters |
| `/pages/{id}` | PATCH | Update task properties (status, due date) |
| `/pages` | POST | Create new task page |

**Auth:** Notion internal integration token. Base URL: `https://api.notion.com/v1`

### 6.6 IMAP (Non-Gmail Email)

```
Protocol: IMAP4rev1 (SSL/TLS)
Library: imapflow + mailparser
Operations:
  - IDLE command (push-like updates when available)
  - SELECT INBOX
  - FETCH (envelope, body structure, full body)
  - STORE +FLAGS (\Seen, \Flagged, \Deleted)
  - EXPUNGE
  - APPEND (for sent messages)
SMTP for sending: nodemailer
```

### 6.7 Google Gemini API

All AI calls are proxied through internal Next.js Route Handlers to protect the API key.

| Internal Route | Gemini Method | Purpose |
|----------------|---------------|---------|
| `POST /api/ai/brainstorm` | `generateContentStream` | Brain dump analysis (streaming) |
| `POST /api/ai/morning` | `generateContent` | Morning ritual suggestions |
| `POST /api/ai/email-summary` | `generateContent` | Email summarization |
| `POST /api/ai/email-draft` | `generateContent` | Reply drafting |
| `POST /api/ai/task-extract` | `generateContent` | Extract task from email |
| `POST /api/ai/schedule` | `generateContent` | Task scheduling suggestions |
| `POST /api/ai/note-qa` | `generateContentStream` | Q&A over note content |
| `POST /api/ai/grocery-extract` | `generateContent` | Extract ingredients from recipe |
| `POST /api/ai/eod-summary` | `generateContent` | End-of-day wrap-up |

**Model Selection:**
- Complex reasoning (email draft, brainstorm critique, schedule planning): `gemini-1.5-pro`
- Fast inline tasks (summarize, extract, organize): `gemini-2.0-flash`

**Prompt Templates** (stored in DB, versioned):
```
System context injected in all calls:
"You are a personal productivity assistant for a single user. Be concise, 
actionable, and direct. Never add unnecessary caveats or filler phrases."
```

---

## 7. Data Model / Schema

> All tables are in a single SQLite database. No `users` table — all records implicitly belong to the one user.

### 7.1 Schema Definition (Drizzle ORM TypeScript)

```typescript
// schema.ts

import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export const settings = sqliteTable('settings', {
  key:        text('key').primaryKey(),
  value:      text('value').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' })
              .default(sql`(unixepoch())`),
});
// Examples: 'theme', 'default_calendar_view', 'primary_focus_color',
//           'gemini_model_default', 'daily_routine_start_hour'

// ─── OAUTH TOKENS ─────────────────────────────────────────────────────────────

export const oauthTokens = sqliteTable('oauth_tokens', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  provider:      text('provider').notNull(),  // 'google' | 'microsoft' | 'todoist' | 'notion'
  account_email: text('account_email'),
  access_token:  text('access_token').notNull(),  // encrypted at rest
  refresh_token: text('refresh_token'),            // encrypted at rest
  expires_at:    integer('expires_at', { mode: 'timestamp' }),
  scope:         text('scope'),
  created_at:    integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:    integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── CALENDAR SOURCES ─────────────────────────────────────────────────────────

export const calendarSources = sqliteTable('calendar_sources', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  provider:     text('provider').notNull(),  // 'google' | 'outlook' | 'apple' | 'local'
  calendar_id:  text('calendar_id').notNull(),  // external calendar ID
  name:         text('name').notNull(),
  color:        text('color').notNull().default('#4285F4'),
  is_enabled:   integer('is_enabled', { mode: 'boolean' }).default(true),
  sync_token:   text('sync_token'),  // nextSyncToken (Google) | deltaToken (MS)
  last_synced:  integer('last_synced', { mode: 'timestamp' }),
  oauth_token_id: integer('oauth_token_id').references(() => oauthTokens.id),
});

// ─── CALENDAR EVENTS ──────────────────────────────────────────────────────────

export const calendarEvents = sqliteTable('calendar_events', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  external_id:     text('external_id'),   // ID from Google/Outlook/Apple
  source_id:       integer('source_id').references(() => calendarSources.id),
  title:           text('title').notNull(),
  description:     text('description'),
  location:        text('location'),
  video_url:       text('video_url'),     // Extracted meet/zoom/teams link
  start_at:        integer('start_at', { mode: 'timestamp' }).notNull(),
  end_at:          integer('end_at', { mode: 'timestamp' }).notNull(),
  is_all_day:      integer('is_all_day', { mode: 'boolean' }).default(false),
  rrule:           text('rrule'),         // Recurrence rule string
  attendees:       text('attendees'),     // JSON array of {name, email, status}
  status:          text('status').default('confirmed'),  // confirmed | tentative | cancelled
  raw_data:        text('raw_data'),      // Original JSON from external API
  created_at:      integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:      integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── TASKS ────────────────────────────────────────────────────────────────────

export const tasks = sqliteTable('tasks', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  external_id:     text('external_id'),   // ID from Todoist/Notion
  source:          text('source').notNull().default('local'),  // 'local' | 'todoist' | 'notion' | 'email_extracted'
  title:           text('title').notNull(),
  description:     text('description'),
  project:         text('project'),
  labels:          text('labels'),        // JSON array of strings
  priority:        integer('priority').default(4),  // 1 (urgent) to 4 (none)
  due_at:          integer('due_at', { mode: 'timestamp' }),
  scheduled_start: integer('scheduled_start', { mode: 'timestamp' }),
  scheduled_end:   integer('scheduled_end', { mode: 'timestamp' }),
  completed_at:    integer('completed_at', { mode: 'timestamp' }),
  is_synced:       integer('is_synced', { mode: 'boolean' }).default(false),
  raw_data:        text('raw_data'),
  created_at:      integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:      integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── MORNING PLANS ────────────────────────────────────────────────────────────

export const morningPlans = sqliteTable('morning_plans', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  plan_date:     text('plan_date').notNull().unique(),  // 'YYYY-MM-DD'
  primary_focus: text('primary_focus'),
  reflection:    text('reflection'),
  skipped:       integer('skipped', { mode: 'boolean' }).default(false),
  ai_suggestions: text('ai_suggestions'),  // JSON: Gemini's suggestions
  email_brief:   text('email_brief'),      // AI-generated email summary
  completed_at:  integer('completed_at', { mode: 'timestamp' }),
  created_at:    integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── BRAIN DUMPS ──────────────────────────────────────────────────────────────

export const brainDumps = sqliteTable('brain_dumps', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  content:       text('content').notNull(),
  mode:          text('mode'),             // 'organize' | 'critique' | 'expand' | 'quick_capture'
  ai_response:   text('ai_response'),     // Gemini's structured response
  is_quick_capture: integer('is_quick_capture', { mode: 'boolean' }).default(false),
  saved_note_id: integer('saved_note_id'), // FK to notes if saved to workspace
  created_at:    integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── EMAILS ───────────────────────────────────────────────────────────────────

export const emailAccounts = sqliteTable('email_accounts', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  type:           text('type').notNull(),  // 'gmail' | 'imap'
  email:          text('email').notNull(),
  display_name:   text('display_name'),
  color:          text('color').default('#EA4335'),
  imap_host:      text('imap_host'),
  imap_port:      integer('imap_port'),
  smtp_host:      text('smtp_host'),
  smtp_port:      integer('smtp_port'),
  oauth_token_id: integer('oauth_token_id').references(() => oauthTokens.id),
  last_synced:    integer('last_synced', { mode: 'timestamp' }),
  is_enabled:     integer('is_enabled', { mode: 'boolean' }).default(true),
});

export const emails = sqliteTable('emails', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  account_id:     integer('account_id').references(() => emailAccounts.id),
  message_id:     text('message_id').notNull(),  // RFC 2822 Message-ID
  thread_id:      text('thread_id'),
  subject:        text('subject'),
  from_name:      text('from_name'),
  from_email:     text('from_email'),
  to_addresses:   text('to_addresses'),   // JSON array
  cc_addresses:   text('cc_addresses'),   // JSON array
  body_plain:     text('body_plain'),
  body_html:      text('body_html'),
  snippet:        text('snippet'),        // First 200 chars for list view
  is_read:        integer('is_read', { mode: 'boolean' }).default(false),
  is_flagged:     integer('is_flagged', { mode: 'boolean' }).default(false),
  is_archived:    integer('is_archived', { mode: 'boolean' }).default(false),
  ai_summary:     text('ai_summary'),     // Gemini summary
  received_at:    integer('received_at', { mode: 'timestamp' }),
  created_at:     integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── PROJECTS & NOTES ─────────────────────────────────────────────────────────

export const projects = sqliteTable('projects', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  description: text('description'),
  color:       text('color').default('#6366F1'),
  icon:        text('icon'),               // Lucide icon name
  is_archived: integer('is_archived', { mode: 'boolean' }).default(false),
  sort_order:  integer('sort_order').default(0),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const notes = sqliteTable('notes', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  project_id:  integer('project_id').references(() => projects.id),
  title:       text('title').notNull(),
  content:     text('content'),            // Tiptap JSON (stringified) or Markdown
  is_pinned:   integer('is_pinned', { mode: 'boolean' }).default(false),
  tags:        text('tags'),               // JSON array of strings
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:  integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// FTS5 virtual table for full-text search on notes
// CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, content=notes, content_rowid=id);

export const noteLinks = sqliteTable('note_links', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  note_id:     integer('note_id').references(() => notes.id),
  linked_type: text('linked_type'),   // 'task' | 'event' | 'email'
  linked_id:   integer('linked_id'),
});

// ─── DAILY NOTES ──────────────────────────────────────────────────────────────

export const dailyNotes = sqliteTable('daily_notes', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  note_date:   text('note_date').notNull(),   // 'YYYY-MM-DD'
  hour_block:  integer('hour_block'),          // 0-23
  content:     text('content').notNull(),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── GROCERY LIST ─────────────────────────────────────────────────────────────

export const groceryItems = sqliteTable('grocery_items', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  quantity:    real('quantity'),
  unit:        text('unit'),               // 'g' | 'kg' | 'pcs' | 'cups' | etc.
  category:    text('category'),           // 'produce' | 'dairy' | 'meat' | etc.
  store:       text('store'),
  is_checked:  integer('is_checked', { mode: 'boolean' }).default(false),
  is_recurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recur_every_days: integer('recur_every_days'),
  next_recur_at: integer('next_recur_at', { mode: 'timestamp' }),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// ─── AI PROMPT TEMPLATES ──────────────────────────────────────────────────────

export const promptTemplates = sqliteTable('prompt_templates', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull().unique(),  // 'brainstorm_organize', 'email_summary', etc.
  system:      text('system').notNull(),
  user_prefix: text('user_prefix'),
  model:       text('model').default('gemini-2.0-flash'),
  version:     integer('version').default(1),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
```

### 7.2 Entity Relationship Summary

```
settings (k/v store)
oauth_tokens ──┬── calendar_sources ── calendar_events
               └── email_accounts ──── emails

morning_plans (date-keyed, standalone)
brain_dumps (standalone, optionally → notes)
daily_notes (date + hour keyed)

projects ── notes ── note_links ──► tasks / calendar_events / emails
tasks (source-typed: local / todoist / notion / email_extracted)
grocery_items (standalone)
prompt_templates (standalone)
```

---

## 8. UI/UX Principles

### 8.1 Layout Structure

```
┌──────────────────────────────────────────────────┐
│  [PCC Logo]  ← Sidebar Nav (collapsible)         │
│  🌅 Today                                         │
│  📅 Calendar                                      │
│  ✅ Tasks                                          │
│  🧠 Brainstorm                                    │
│  📧 Email                                         │
│  📝 Workspace                                     │
│  🛒 Grocery                                       │
│  ─────────────────                               │
│  ⚙️  Settings                                     │
│  🔄 Sync Status                                   │
└──────────────────────────────────────────────────┘
│                                                  │
│     Main Content Area                            │
│                                                  │
│  [Primary Focus Banner if set]                   │
│                                                  │
│  ← Module-specific content renders here →        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 8.2 Design Tokens

- **Font:** Inter (system fallback)
- **Theme:** Dark mode default, light mode toggle, stored in settings
- **Radius:** 8px cards, 4px inputs
- **Accent Color:** User-configurable (default: `#6366F1` indigo)
- **Spacing Scale:** 4px base unit (Tailwind default)

### 8.3 Morning Ritual UI Flow

```
App Launch
     │
     ▼
[Check: morning_plans for today date]
     │
     ├─ NOT completed ──► MORNING RITUAL FULLSCREEN OVERLAY
     │                         │
     │                    Phase 1: "Good morning. Here's your day."
     │                    → Today's events + tasks at-a-glance
     │                    → AI Email Brief
     │                         │
     │                    Phase 2: "What is your ONE primary focus today?"
     │                    → Text input (required or skippable)
     │                         │
     │                    Phase 3: "Optional: morning reflection"
     │                    → Freeform text (optional)
     │                         │
     │                    [BEGIN MY DAY] button
     │                         │
     │                         ▼
     └─ completed ──────► MAIN DASHBOARD
```

### 8.4 Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Single-column; sidebar becomes bottom tab bar; task inbox hidden by default |
| Tablet (768–1024px) | Sidebar icons-only; calendar takes full width |
| Desktop (> 1024px) | Full sidebar + content + optional right panel (task inbox / AI response) |

---

## 9. Phased Implementation Plan

### Phase 0: Foundation (Week 1–2)

**Goal:** Working shell with database, routing, and PWA manifest.

- [ ] Initialize Next.js 14 with TypeScript, Tailwind, and shadcn/ui
- [ ] Configure Drizzle ORM + SQLite (better-sqlite3)
- [ ] Create all DB tables from schema (run initial migration)
- [ ] Build sidebar navigation layout with all route stubs
- [ ] Configure next-pwa (Workbox) — manifest, service worker, offline fallback page
- [ ] Create settings K/V CRUD (Route Handlers + Zustand store)
- [ ] Implement theme (dark/light) toggle stored in settings
- [ ] Set up secrets store (`~/.pcc/secrets/` with AES-256 encryption utility)
- [ ] Set up global command palette (⌘K) with route navigation
- [ ] Basic responsive layout passing Lighthouse PWA audit ≥ 90

**Deliverable:** Installable PWA shell, all routes reachable, DB initialized.

---

### Phase 1: Core Life Modules (Week 3–4)

**Goal:** Self-contained modules working without any external APIs.

- [ ] **Morning Ritual:** Full ritual flow (check, overlay, focus input, save to `morning_plans`), primary focus banner on dashboard
- [ ] **Daily Planner (Today view):** Hourly blocks 6AM–10PM; daily notes per block; static data
- [ ] **Notes/Workspace:** Tiptap editor integrated; projects CRUD; notes CRUD; FTS5 search; pinned notes widget
- [ ] **Grocery List:** Full CRUD with categories; export/copy; recurring items cron seed
- [ ] **Brain Dump (local-only version):** Text area with autosave; history view; no AI yet

**Deliverable:** App is fully usable as a local-only personal tool (no external dependencies).

---

### Phase 2: AI Integration (Week 5–6)

**Goal:** Gemini powers all AI features.

- [ ] Store Gemini API key in secrets store; inject via server-side env
- [ ] Build `/api/ai/*` Route Handlers with streaming support (SSE)
- [ ] Seed default `prompt_templates` into DB
- [ ] **Brainstorm AI:** Organize / Critique / Expand modes; streaming side-panel; save-to-notes
- [ ] **Quick Capture:** Floating button + keyboard shortcut (⌘⇧B); modal; saves to brain_dumps
- [ ] **Morning Ritual AI:** Email brief (no email connected yet — use placeholder); day suggestions
- [ ] **Note Q&A:** "Ask AI" button in note editor; streaming side panel
- [ ] **Grocery AI:** Recipe text → ingredient extraction
- [ ] **Prompt template editor** in Settings (edit system prompts per AI feature)

**Deliverable:** AI features fully functional; testable with real Gemini API.

---

### Phase 3: Calendar Integration (Week 7–9)

**Goal:** All calendars unified in one view with full sync.

- [ ] OAuth2 flow for Google (store tokens encrypted); scopes: Calendar + Gmail (for Phase 4)
- [ ] Google Calendar: Initial full sync → incremental sync (syncToken); background cron every 15 min
- [ ] Calendar UI: react-big-calendar with Day/Week/Month views; color-coded sources
- [ ] Event detail drawer: full details, Join Meeting button, Edit/Delete
- [ ] Create/edit local PCC events
- [ ] Microsoft OAuth (MSAL); Graph API Calendar sync (delta tokens)
- [ ] Apple CalDAV (tsdav); iCloud calendar sync
- [ ] Per-source filter toggles; calendar list in sidebar panel
- [ ] "Next 7 Days" agenda widget on dashboard
- [ ] Morning Ritual: real today's events from calendar

**Deliverable:** Single unified calendar working with all three external sources.

---

### Phase 4: Task Integration & Time-Blocking (Week 10–11)

**Goal:** External tasks appear in app and can be scheduled on the calendar.

- [ ] Todoist API token/OAuth setup; full sync + 10-min polling
- [ ] Notion OAuth + database selector; Notion DB → tasks sync
- [ ] Task Inbox panel on calendar view (collapsible right panel)
- [ ] dnd-kit: drag task from inbox → drop on calendar time slot (sets `scheduled_start/end`)
- [ ] Vertical resize of task blocks on calendar
- [ ] Complete task → sync completion back to Todoist / Notion
- [ ] AI Schedule Suggestions (Gemini recommends time blocks for unscheduled tasks)
- [ ] Task detail modal: edit title, due date, priority, notes, linked events

**Deliverable:** Full task integration with drag-and-drop time-blocking on calendar.

---

### Phase 5: Email Integration (Week 12–13)

**Goal:** Unified inbox with Gemini-powered triage.

- [ ] Gmail API integration: OAuth, inbox sync every 5 min, thread grouping
- [ ] IMAP integration (imapflow): config UI for host/port/credentials; inbox fetch; IDLE if supported
- [ ] Unified inbox view: multi-account, source badges, unread state
- [ ] Email detail view: render HTML or plain; auto-summary on open (Gemini)
- [ ] "Extract Action" → create task from email
- [ ] "Draft Reply" flow: instruction → Gemini draft → edit → send (Gmail API / Nodemailer)
- [ ] Archive / flag / mark read → sync back to source
- [ ] Morning Email Brief: integrated into Morning Ritual (Phase 2 placeholder now real)
- [ ] Email → Morning Ritual connection (real overnight email summary)

**Deliverable:** Gemini-augmented unified inbox; full triage workflow.

---

### Phase 6: Polish & Cross-Platform Packaging (Week 14–15)

**Goal:** Production-quality app on all target platforms.

- [ ] Performance audit: React Query caching review; SQLite indexes on frequently queried columns
- [ ] Full offline mode test: all Phase 1 features work with service worker; online features show clear "requires connection" state
- [ ] **Capacitor setup:** `npm install @capacitor/core @capacitor/android @capacitor/ios`; configure `capacitor.config.ts`; test on Android + iOS device
- [ ] **Tauri setup:** `cargo tauri init`; configure to sidecar Next.js; test on Mac + Windows
- [ ] Push notifications: Capacitor notifications plugin for morning ritual reminder (7:30 AM)
- [ ] Deep link support (e.g., `pcc://brainstorm/quick-capture` from phone widget)
- [ ] End-of-day summary flow (Gemini generates daily summary on "Wrap Up Day" trigger)
- [ ] Settings: comprehensive settings page (connected accounts, prompt editor, sync intervals, theme)
- [ ] Data backup/export: one-click SQLite `.db` file export + import (for migration to new device)
- [ ] Comprehensive error handling: sync failures shown in sidebar status; retry UI

**Deliverable:** App fully packaged and running on web, iOS/Android (Capacitor), and desktop (Tauri).

---

### Phase 7: Enhancements (Post-MVP, Ongoing)

> Ideas for after core system is stable.

- **Widget support:** iOS/Android home screen widgets for quick capture and today's focus
- **Siri/Google Assistant integration:** "Hey Siri, add to PCC: pick up dry cleaning"
- **Weekly review mode:** Sunday AI-generated weekly reflection using past 7 days of morning plans and completed tasks
- **Habit tracker module:** Daily habit checkboxes; streak tracking; monthly heatmap view
- **Financial tracking widget:** Quick expense logging; monthly budget overview (no external API needed)
- **AI document analysis:** Drop a PDF into PCC and Gemini summarizes it
- **Todoist two-way sync:** Write new tasks in PCC and push them to Todoist (currently Phase 4 is read + complete only)
- **Zapier/Make webhook endpoint:** Allow external automations to push tasks/notes into PCC

---

## 10. Security & Credential Management

### 10.1 Token Storage

All OAuth tokens and API keys are stored outside the project directory and encrypted at rest.

```
~/.pcc/
  secrets/
    google.json          ← { access_token, refresh_token } AES-256 encrypted
    microsoft.json
    todoist.json
    notion.json
    imap_accounts.json
    api_keys.json        ← { gemini: '...' }
  data/
    pcc.db               ← SQLite database
  logs/
    sync.log
```

**Encryption utility:** Use Node.js built-in `crypto` module with AES-256-GCM; encryption key derived from machine-specific UUID (not stored in plain text).

### 10.2 Local-Only Principle

- No data ever leaves the device to a PCC server (there is no PCC server).
- AI calls send only the minimum necessary content to Gemini API (no full email bodies for summary — only the body of the specific open email).
- OAuth tokens for Google/Microsoft live in `~/.pcc/secrets/`, not in the database or source code.
- The `.env.local` file (for Next.js) contains only the Gemini API key and the path to secrets store.

### 10.3 HTTPS for PWA

- When deployed on local network (Tauri / local server), use self-signed cert or mkcert for localhost HTTPS (required for service workers and some OAuth redirect URIs).
- For the web PWA version, deploy to Vercel or a personal VPS with Let's Encrypt.

### 10.4 Rate Limiting (Self-Imposed)

To avoid accidental Gemini API overuse:

- Implement a per-feature daily call counter in the `settings` table.
- Optional hard cap configurable in Settings (e.g., max 100 Gemini calls/day).
- Long email bodies: truncate to 4,000 tokens before sending to Gemini.

---

## 11. Open Questions & Future Considerations

| Question | Options to Evaluate |
|----------|---------------------|
| How to handle timezone sync across calendar sources? | Normalize all timestamps to UTC in DB; use `date-fns-tz` for display in local timezone |
| Apple Calendar auth UX? | CalDAV requires app-specific password; document this clearly in onboarding. Consider skipping Apple in MVP if friction is too high. |
| What happens when SQLite file grows large? | Implement monthly archiving: move `calendar_events` and `emails` older than 90 days to `_archive` tables; vacuum on schedule |
| Tauri vs. Capacitor for desktop — do both? | Start with Tauri for desktop (better performance, smaller binary). Capacitor for mobile. PWA for browser. All three can coexist. |
| Notion API rate limits (3 req/sec)? | Implement a queue for Notion sync calls; backoff on 429 responses |
| How to handle email privacy with Gemini? | Add a "Privacy filter" toggle: when enabled, strip names/email addresses before sending email content to Gemini API |

---

## Appendix A: Project Directory Structure

```
pcc/
├── app/                          # Next.js App Router
│   ├── (shell)/                  # Shared layout with sidebar
│   │   ├── layout.tsx
│   │   ├── today/page.tsx        # Daily Planner
│   │   ├── calendar/page.tsx     # Calendar Aggregator
│   │   ├── tasks/page.tsx        # Task Inbox (full page)
│   │   ├── brainstorm/page.tsx   # Brain Dump
│   │   ├── email/page.tsx        # Unified Inbox
│   │   ├── workspace/            # Notes & Projects
│   │   │   ├── page.tsx
│   │   │   └── [noteId]/page.tsx
│   │   ├── grocery/page.tsx
│   │   └── settings/page.tsx
│   ├── morning/page.tsx          # Morning Ritual (no shell)
│   ├── api/
│   │   ├── ai/
│   │   │   ├── brainstorm/route.ts
│   │   │   ├── morning/route.ts
│   │   │   ├── email-summary/route.ts
│   │   │   ├── email-draft/route.ts
│   │   │   ├── schedule/route.ts
│   │   │   └── note-qa/route.ts
│   │   ├── calendar/
│   │   │   ├── google/route.ts   # OAuth + event CRUD
│   │   │   ├── outlook/route.ts
│   │   │   └── apple/route.ts
│   │   ├── email/
│   │   │   ├── gmail/route.ts
│   │   │   └── imap/route.ts
│   │   ├── tasks/route.ts
│   │   ├── notes/route.ts
│   │   └── sync/route.ts         # Trigger manual sync
│   └── layout.tsx                # Root layout, global providers
├── components/
│   ├── calendar/
│   ├── tasks/
│   ├── email/
│   ├── morning/
│   ├── brainstorm/
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts              # Drizzle instance
│   │   └── migrations/
│   ├── ai/
│   │   ├── gemini.ts             # Gemini client singleton
│   │   └── prompts.ts            # Prompt builder utilities
│   ├── sync/
│   │   ├── google-calendar.ts
│   │   ├── outlook.ts
│   │   ├── caldav.ts
│   │   ├── todoist.ts
│   │   ├── notion.ts
│   │   └── gmail.ts
│   ├── secrets.ts                # Secrets store read/write/encrypt
│   └── utils.ts
├── store/
│   └── index.ts                  # Zustand stores
├── hooks/                        # Custom React hooks
├── types/                        # Shared TypeScript types
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── drizzle.config.ts
├── next.config.ts                # next-pwa config
├── capacitor.config.ts
├── tauri/                        # Tauri app source
└── .env.local                    # GEMINI_API_KEY, SECRETS_PATH
```

---

## Appendix B: Key Dependencies (package.json excerpt)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^4.0.0",
    "@shadcn/ui": "latest",
    "drizzle-orm": "^0.31.0",
    "better-sqlite3": "^11.0.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.40.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "react-big-calendar": "^1.13.0",
    "date-fns": "^3.6.0",
    "date-fns-tz": "^3.1.0",
    "@tiptap/react": "^2.4.0",
    "@tiptap/starter-kit": "^2.4.0",
    "@google/generative-ai": "^0.15.0",
    "framer-motion": "^11.2.0",
    "lucide-react": "^0.400.0",
    "imapflow": "^1.0.162",
    "mailparser": "^3.7.1",
    "nodemailer": "^6.9.0",
    "tsdav": "^2.0.11",
    "node-cron": "^3.0.3",
    "next-pwa": "^5.6.0",
    "dexie": "^4.0.7",
    "@capacitor/core": "^6.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.22.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/nodemailer": "^6.4.0"
  }
}
```

---

*End of PRD — Personal Command Center v1.0*
*This document is the living master blueprint. Update version number and date with each significant change.*
