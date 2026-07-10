# Spec: Friction-Free Quick Capture (Phase 9A)

> **Goal:** Let a user capture a thought/task/quest in **one tap and one line**, with zero required fields. Triage later. This attacks the single most-cited reason habit & ADHD users abandon apps: *capture friction*.

## 1. The pain (why we're building it)

From high-engagement Reddit threads (r/ADHD, r/productivity, r/SomebodyMakeThis):

- "Every app assumes I'll remember to open it and fill out a form."
- "By the time I've picked a category and a due date, I've lost the thought."
- "I just need somewhere to dump it and deal with it later."

**Design principle:** capture must cost *nothing* — no category, no XP, no time block. Organization is a separate, optional step. The measurable cost we remove: the ~5–10 taps and the dropped thought between "idea" and "saved."

## 2. Scope

**In scope (v1)**
- A floating "+" capture button on the Today screen.
- A minimal capture sheet: one text input + Save. Enter saves.
- An **Inbox**: a list of captured notes, newest first.
- Triage actions per note: **Make Quest** (→ existing custom quest flow), **Send to Journal**, **Delete**, **Done** (archive).
- Persistence in `state.inbox`, same `save()` path as everything else.

**Out of scope (v1)**
- Voice capture, AI auto-categorization, reminders/notifications, due dates.
- Editing a note's text after capture (delete + re-add is fine for v1).
- Sync — rides on whatever persistence `useAppState` already does.

## 3. Data model

Add one array to app state. No migration needed (absent → treat as `[]`).

```js
// state.inbox: InboxItem[]
{
  id: string,        // `inbox-${Date.now()}-${rand}`
  text: string,      // trimmed, max 280 chars
  createdAt: string, // ISO timestamp
  status: "open" | "done", // "done" = archived, hidden from default view
}
```

Why a separate `inbox` rather than reusing `customQuests`: a custom quest carries a `category` + `xp` and immediately joins the daily roster. The whole point of capture is to *defer* that decision. Triaging an inbox item into a quest is an explicit promotion.

## 4. UX flow

```
[Today screen]
   │  user taps  (FAB, bottom-right, above AI Coach FAB)
   ▼
[Capture sheet]  ── one input, autofocused ──▶ type ──▶ Enter / Save
   │                                                       │
   │  (sheet stays open, input clears, toast "Captured")   │  ← rapid-fire capture
   ▼
[Inbox]  (opened from a Today strip: "Inbox · N to triage")
   ├─ Make Quest  → opens CustomQuestPanel prefilled with text; on add, mark item done
   ├─ Send to Journal → appends text to today's journal entry; mark item done
   ├─ Done → status: "done"
   └─ Delete → remove from array
```

### FAB placement
The AI Coach FAB already sits bottom-right (`AICoachWidget`). Place the capture FAB **directly above it** (e.g. `bottom: 84px` if the coach is at `bottom: 24px`), same right offset, smaller or equal size, distinct color (brand violet vs. coach gradient) so they don't read as one control. Respect `env(safe-area-inset-bottom)` as the rest of the app does.

### Capture sheet behavior
- Autofocus the input on open (keyboard pops immediately on mobile).
- **Enter saves and keeps the sheet open**, clearing the input → enables rapid multi-capture (a known ADHD-friendly pattern). A small "Captured ✓" toast (reuse `Toast`/`XPToast` style) confirms.
- Tapping the backdrop or a close button dismisses.
- Empty/whitespace input is a no-op (mirror `addQuest`'s `if (!trimmed) return`).

## 5. Implementation plan

### 5.1 State helpers
Co-locate with capture, or add to `utils/state.js` if that's where mutations live:

```js
function addInboxItem(state, text) {
  const trimmed = (text || "").trim().slice(0, 280);
  if (!trimmed) return state;
  const item = {
    id: `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: trimmed,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  return { ...state, inbox: [item, ...(state.inbox || [])] };
}

function setInboxStatus(state, id, status) {
  return { ...state, inbox: (state.inbox || []).map((i) => i.id === id ? { ...i, status } : i) };
}

function removeInboxItem(state, id) {
  return { ...state, inbox: (state.inbox || []).filter((i) => i.id !== id) };
}
```

### 5.2 Components
- **`src/components/shared/QuickCaptureFab.jsx`** — the FAB + capture sheet (self-contained, takes `state`, `save`). Models its open/close + framer-motion off `AICoachWidget`.
- **`src/components/panels/InboxPanel.jsx`** — slide-in panel listing open items with triage actions. Models layout off `CustomQuestPanel` (same header/back/content structure and `styles`).

### 5.3 Wiring
1. Render `<QuickCaptureFab state={state} save={save} />` in `TodayScreen.jsx`, next to `<AICoachWidget />`.
2. Register `"inbox"` as a panel route wherever `onOpenPanel` panels are dispatched (`AppShell` / `EmbeddedPanelHost`).
3. Add an **Inbox strip** to `TodayScreen` (mirror the existing Forge / Journal CTA strips) that shows only when there are open items:
   ```
   📥  Inbox · {openCount} to triage   →   onOpenPanel("inbox")
   ```
4. **Make Quest** triage: open `CustomQuestPanel` with the text prefilled. Simplest path — pass an optional `initialText`/`initialCategory` prop to `CustomQuestPanel` (defaulting to current behavior) and, on successful add, call `setInboxStatus(state, id, "done")`.
5. **Send to Journal** triage: append `text` to `state.journal[today].text` (newline-joined), then mark done.

### 5.4 Reuse checklist (avoid net-new patterns)
- Persistence: `save({ ...state, ... })` — same as `toggleQuest` / `addQuest`.
- Panel chrome, slide-in animation, and `styles` object: copy from `CustomQuestPanel.jsx`.
- FAB animation + open state: copy from `AICoachWidget.jsx`.
- Confirmation toast: reuse `Toast` / `XPToast`.
- Quest creation: reuse `CustomQuestPanel.addQuest` rather than duplicating XP/category logic.

## 6. Edge cases
- `state.inbox` undefined (existing users) → coalesce to `[]` everywhere.
- Duplicate rapid taps → unique id includes random suffix; no dedupe needed.
- Long text → hard cap 280 chars at capture (`maxLength` + `.slice`).
- Two FABs overlapping on small screens → fixed vertical offsets + safe-area inset; verify on a 360px-wide viewport.
- "Make Quest" then user cancels the quest panel → leave the inbox item `open` (only mark done on a real add).

## 7. Acceptance criteria
- [ ] A capture FAB is visible on Today and does not overlap the AI Coach FAB.
- [ ] Tapping it opens an autofocused single-line input.
- [ ] Enter (or Save) stores the note, clears the input, shows a confirmation, and keeps the sheet open for the next capture.
- [ ] Captured notes appear in the Inbox, newest first.
- [ ] Each note can be promoted to a quest, sent to the journal, marked done, or deleted.
- [ ] An Inbox strip on Today shows the open-item count and opens the panel; it hides at zero.
- [ ] Reloading the app preserves the inbox (rides existing persistence).
- [ ] Existing users with no `inbox` key see no errors and an empty inbox.

## 8. Effort & sequencing
- State helpers + `state.inbox`: ~0.5 day.
- `QuickCaptureFab` + sheet: ~0.5 day.
- `InboxPanel` + triage actions + Today strip: ~1 day.
- Polish (animations, safe-area, toast, QA on mobile widths): ~0.5 day.

**Total: ~2–2.5 days.** Ship 9A alone first — it's the highest-fit, lowest-effort item and validates the "remove capture friction" thesis before investing in 9B–9E.
