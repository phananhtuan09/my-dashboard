# CLAUDE.md

# AI Agent Workflow Standards

## Core Coding Philosophy

### 1. Simplicity First (with Strategic Exceptions)
- **Default: Keep it simple**
  - Choose simplest solution that meets requirements
  - Avoid over-engineering and unnecessary abstractions
  - Don't build for hypothetical futures

- **Readability > Cleverness**
  - Prefer clear, readable code over clever one-liners
  - Code is read more often than written - optimize for understanding
  - If code needs a comment to explain what it does, consider rewriting it

- **Think ahead ONLY for:**
  - **Security**: Input validation, authentication, authorization
  - **Performance**: Scalability bottlenecks, query optimization
  - All other cases → Choose simplicity

- **Examples:**
  - ✅ Use array methods instead of custom loops
  - ✅ Add input validation for user data (security)
  - ✅ Consider pagination for large datasets (performance)
  - ❌ Don't create abstractions for one-time operations
  - ❌ Don't write clever one-liners that require mental parsing

### 2. Deep Understanding
- If unclear about requirements, edge cases, or expected behavior → **Ask first**
- Batch related questions into a single block (avoid asking one at a time)
- Never assume or guess - clarification prevents wasted effort
- Key questions:
  - "What should happen when X occurs?"
  - "Is this the expected flow: A → B → C?"

### 3. Multiple Options When Appropriate
- Present 2-3 solution options with clear trade-offs
- Format: "Option 1: [approach] - Pros: [...] Cons: [...]"
- Let user choose based on their priorities

---

## Workflow Guidelines

**Tooling:**
- Prefer semantic search; grep for exact matches only
- Run independent operations in parallel

**Communication:**
- Use Markdown minimally; backticks for `files/functions/classes`
- Mirror user's language; code/comments in English
- Status updates before/after key actions

**Code Presentation:**
- Existing code: `startLine:endLine:filepath`
- New code: fenced blocks with language tag

**TODO Management:**
- Create todos for medium/large tasks (≤14 words, verb-led)
- Keep ONE `in_progress` item only
- Update immediately; mark completed when done

---

## Skill Reporting (MANDATORY)

**CRITICAL REQUIREMENT - ALWAYS follow this:**

At the START of EVERY response, BEFORE any other content, report skills:

```
📚 Skills: skill-name-1, skill-name-2
```

**Rules:**
- If skills were activated → List them
- If NO skills activated → Write: `📚 Skills: none`
- This line MUST appear in EVERY response, no exceptions
- Place BEFORE greeting, explanation, or any other content

**Example responses:**

```
📚 Skills: frontend-design-fundamentals, frontend-design-theme-factory

I'll help you create a modern login page...
```

```
📚 Skills: none

Sure, I can help you fix that bug...
```

Skills are defined in `.claude/skills/`.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npm run format    # Prettier (writes in place)
npm run deploy    # Deploy via deploy.sh (uses PM2)
```

No test framework is configured.

## Architecture

**Personal work planner** built with Next.js 16 App Router + Supabase. The app manages a weekly task schedule and daily execution checklist.

### Data flow
All data fetching happens **client-side** directly via the Supabase JS client — there are no API routes or server-side data fetching. The single Supabase client is instantiated in `src/lib/supabase/client.ts` and imported directly into feature view components.

### Page → View pattern
`src/app/` pages are thin shells (some just `redirect()`). All logic lives in a corresponding `*View` component under `src/components/{feature}/`:

- `/schedule` → `ScheduleView` — weekly grid (time slots × days), assigns tasks per slot per day
- `/daily` → `DailyChecklistView` — syncs `weekly_schedule` into `daily_logs` on load, then tracks status/notes/progress per slot
- `/tasks` → `TaskListView` — CRUD for reusable tasks with color labels
- `/time-slots` → `TimeSlotListView` — CRUD for named time slots (start/end time)

### Database tables (Supabase)
| Table | Key columns |
|---|---|
| `tasks` | `id`, `name`, `color` (red/amber/blue/green/purple/gray) |
| `time_slots` | `id`, `start_time`, `end_time` |
| `weekly_schedule` | `id`, `slot_id`, `day_of_week` (1=Mon…7=Sun), `task_id` |
| `daily_logs` | `id`, `date` (YYYY-MM-DD), `slot_id`, `task_id`, `status` (Todo/Doing/Done/Skip), `note`, `progress` (int 0–100) |

`DailyChecklistView` auto-syncs on load: it creates missing `daily_logs` entries from `weekly_schedule`, updates task assignments for pristine logs (Todo + no note/progress), and deletes orphaned pristine logs.

### Layout
`AppShell` wraps all pages with a desktop sidebar + mobile bottom navigation. The root route redirects to `/schedule`.

### Styling conventions
- Tailwind CSS v4 with `cn()` helper (`clsx` + `tailwind-merge`) from `src/lib/utils.ts`
- `lucide-react` for all icons
- Responsive breakpoints: mobile card view vs `lg:` table view is the dominant pattern
- Common UI primitives: `Button`, `Card`, `Input`, `Select`, `Badge`, `Table` in `src/components/common/`

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
