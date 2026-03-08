# Personal Work Planner – MVP Specifications

## 1. Overview

Personal web application for managing weekly work schedules and tracking daily execution.

Goals:

- Plan weekly tasks
- Track daily work progress
- Keep notes for each task
- Simple spreadsheet-like UI

Scope: **Personal use only (no authentication)**

---

# 2. Tech Stack

## Frontend

- Next.js (App Router)
- React
- TailwindCSS

## Backend / Database

- Supabase (Postgres)

## Deployment

- Vercel

---

# 3. Product Structure

Main modules:

1. Weekly Schedule
2. Daily Work Checklist
3. Task Manager
4. Time Slot Manager

---

# 4. UI Design Principles

Design style inspired by spreadsheet applications.

Principles:

- Clean
- Minimal
- Easy to scan
- Lightweight interaction
- Mobile responsive

UI inspiration: Google Sheets style grid.

---

# 5. UI Theme

## Colors

Background:

- #FFFFFF
- #F8FAFC

Borders:

- #E5E7EB

Text:

- #111827
- #6B7280

Primary:

- #2563EB

Success:

- #16A34A

Warning:

- #F59E0B

---

## Typography

Font: Inter

Sizes:

- Title: 20px
- Section: 16px
- Body: 14px
- Table text: 13px

---

## Task Colors

Each task has a color tag.

Example:

- English Listening → red
- English Vocabulary → yellow
- Coding → blue
- Learning → green

---

# 6. Layout System

Page layout:

Header
Content

Spacing:

8px spacing grid

Typical spacing utilities:

- p-4
- gap-4
- gap-2

---

# 7. Screens

## 7.1 Weekly Schedule

Purpose: Plan tasks for each time slot during the week.

### Desktop Layout

Spreadsheet-like table.

Columns:

- Time
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

Rows represent time slots.

Example:

Time | Mon | Tue | Wed | Thu | Fri | Sat | Sun

1:30–3:30 | Task | Task

8:30–9:00 | Task

9:00–9:30 | Task

9:30–10:30 | Task

### Cell Interaction

Each cell contains a dropdown task selector.

Example UI:

[ English Listening ▼ ]

Selecting a task saves immediately.

### Actions

Top actions:

- Add Time Slot
- Manage Tasks
- Open Today

---

## 7.2 Mobile Weekly Layout

Instead of a table, show **day cards**.

Example:

MONDAY

1:30–3:30
English Listening

8:30–9:00
English Vocabulary

9:00–9:30
Coding

---

# 8. Daily Work Checklist

Purpose: Track work completed for a specific day.

Route:

/daily

---

## Desktop Layout

Table format.

Columns:

Start
End
Job
Status
Note

Example:

Start | End | Job | Status | Note

8:30 | 9:00 | English Listening | Done | 80%

9:00 | 9:30 | English Vocabulary | Done

9:30 | 10:30 | Coding | Doing

---

## Row Interaction

Click row to open edit modal.

Editable fields:

- status
- note
- progress

---

## Status Types

Todo
Doing
Done
Skip

Colors:

Done → green
Doing → blue
Skip → gray
Todo → yellow

---

## Mobile Layout

Each task displayed as a card.

Example:

English Listening

8:30 – 9:00

Status: Done
Note: 80%

---

# 9. Task Manager

Purpose: Manage available tasks.

Features:

- Create task
- Edit task
- Delete task

Fields:

- name
- color

Example list:

English Listening
English Vocabulary
Coding
Learning JS

---

# 10. Time Slot Manager

Purpose: Manage daily time blocks.

User can:

- Add time slot
- Edit time slot
- Delete time slot
- Reorder slots

Fields:

- start_time
- end_time

Example:

1:30 – 3:30
8:30 – 9:00
9:00 – 9:30
9:30 – 10:30
10:30 – 11:00

---

# 11. Database Schema

## tasks

id (uuid)
name (text)
color (text)
created_at

---

## time_slots

id (uuid)
start_time (time)
end_time (time)
order_index (int)

---

## weekly_schedule

id (uuid)

slot_id (uuid)
day_of_week (int 1-7)

task_id (uuid)

---

## daily_logs

id (uuid)

date (date)

slot_id (uuid)
task_id (uuid)

status (text)
note (text)
progress (int)

---

# 12. Routing

/schedule

/daily

/daily/[date]

/tasks

---

# 13. Component Architecture

components/

schedule/

- schedule-table
- schedule-row
- schedule-cell

daily/

- daily-log-table
- daily-log-row

tasks/

- task-form
- task-list

---

# 14. Core Logic

## Weekly Schedule

User assigns tasks to time slots for each weekday.

Data stored in weekly_schedule table.

---

## Daily Log Generation

When opening /daily page:

1. Determine weekday
2. Load weekly_schedule for that day
3. Create daily_logs if not exists

---

## Updating Progress

User can update:

- status
- note
- progress

Changes saved directly to database.

---

# 15. Responsive Strategy

Breakpoints:

mobile < 640px

tablet < 1024px

desktop ≥ 1024px

Desktop uses tables.

Mobile uses cards.

---

# 16. Folder Structure

src/

app/

schedule/
page.tsx

daily/
page.tsx

[daily]/
page.tsx

tasks/
page.tsx

components/

schedule/

daily/

tasks/

lib/

supabase/
queries/

---

# 17. MVP Scope

Included:

- Task CRUD
- Time slot CRUD
- Weekly schedule
- Daily logs
- Mobile responsive UI

Not included:

- Authentication
- Analytics
- Notifications
- Charts

---

# 18. Future Improvements

Possible future features:

- Weekly productivity stats
- Habit streak tracking
- Monthly calendar view
- AI daily summary

---

# 19. Development Plan

Day 1

- Database schema
- Task CRUD
- Time slot CRUD

Day 2

- Weekly schedule table

Day 3

- Daily logs
- Mobile responsive
- Deploy
