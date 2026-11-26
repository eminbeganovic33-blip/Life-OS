# LifeOS — audit and improvement plan (2026-11-05)

Branch: `claude/lifeos-audit-optimize-1af8e3`, built on PR #5 (`redesign/hybrid-calm-game` @ 3cab42a).
Inputs: hands-on runs of production and of PR #5 (headless Chrome, fake clock), plus three subagent passes:
`council-architect` (code audit, 22 verified findings), `scout` (fact inventory), `researcher`
(market + Reddit demand: [`docs/research/2026-11-05-niche-and-reddit-demand.md`](../research/2026-11-05-niche-and-reddit-demand.md)).
`council-skeptic` reviewed the draft of this plan (see §7).

---

## TL;DR

1. **Every user's streak has been capped at 1, in production, for months.** Opening the app the morning after a perfect day resets the streak to 0 (or burns a freeze). For an app whose core loop is streaks, this is the headline bug. **Fixed here**, with 38 unit tests (run in 3 timezones) and an end-to-end fake-clock run (1 → 2 → 3).
2. **Production is 5 months stale and built with zero environment variables.** `main` @ 146d065 (2026-05-29) is live; a local build of `main` reproduces the live bundle hash `index-Cr3dOxVC.js` byte-for-byte. No Firebase, no Gemini key, so "Continue with Google" and "Sign up with email" are dead buttons, and analytics, AI coach, and push all do nothing. PR #5 (4.7k lines, ready since July) was never merged.
3. **The privacy policy contradicted the code** (it said "no analytics" and "no AI reads your journal", but the code shipped Firebase Analytics and sends a journal excerpt to Gemini). That's a Play Store rejection risk. **Rewritten here** from a data-flow table, with analytics made opt-in.
4. **There is no cloud sync at all.** Firestore is initialised but never read or written; signing in changes nothing about where data lives. Product decision needed (§6).
5. **Market:** the open gap is the comeback app: a free, local-first life RPG built for the day after you miss. Churn in this category is driven by streak shame and tracking overhead, and LifeOS's breadth works against it (§4).

---

## 1. Where things stand

| Item | State |
|---|---|
| Live site | `main` @ 146d065, deployed ~2026-06-01. Built with no `VITE_*` env vars → local-only mode. |
| PR #5 | Open, mergeable, Vercel preview green since 2026-07-10. Contains Phase 9 + 10, privacy page, lazy chunks, Sentry wiring, analytics funnel. |
| `claude/vibrant-fermi-D135C` | Phase 9 only. Fully contained in PR #5 — can be deleted. |
| Main checkout `~/Desktop/Claude` | On `redesign/hybrid-calm-game` with 26 unexplained working-tree changes. Also has `Aetherfall-Babylon/` and `inkwake/` untracked inside the LifeOS repo, a stale `.git/index.lock` from 2026-09-26, and a 2026-09-08 stash. |
| Repo storage | `.git/objects/pack/*` are iCloud **dataless** (evicted) files → `git show main:…` hangs indefinitely. Repo integrity risk. |
| Tests / CI | None before this branch. `ci.yml` exists only untracked in the main checkout (the `gh` token lacks `workflow` scope). |
| Lint / build | 0 errors, 37 warnings; build green. |

---

## 2. Findings

Severity: **P0** = ship-blocker / user-visible data or trust harm, **P1** = real bug, **P2** = integrity / polish.
Status: ✅ fixed on this branch · ◐ partly fixed · ☐ open.

| # | Sev | Finding | Evidence | Status |
|---|---|---|---|---|
| 1 | P0 | Streak resets to 0 on every next-day open (`missedDays` counted *today*; anchored on last-*opened* not last-*completed* day). Live in prod and PR #5. | Fake-clock harness: 3 perfect days → `streak=1, best=1`. Architect reproduced it in LA + Sarajevo TZ. | ✅ `reconcileStreaks` rewritten; `src/utils/streaks.test.js` |
| 2 | P0 | Privacy policy contradicts data flows (claims sync that doesn't exist, "no analytics", "no AI on journal"; Sentry undisclosed). | `PrivacyPolicyScreen.jsx` vs `firebase.js`, `ai.js`, `main.jsx` | ✅ rewritten + data-flow table §8; owner must review wording |
| 3 | P0 | Gemini `gemini-2.0-flash` was shut down 2026-06-01 → AI coach and workout generator 404 and show "try rephrasing". Key is in the client bundle *and* the URL. | Google deprecations page | ◐ model → `gemini-3.6-flash` (verified on Google's deprecations page), overridable by `VITE_GEMINI_MODEL`; key moved to header; errors report "unavailable"; one-time explicit consent before the first request (Play prominent disclosure). **Proxy still open** |
| 4 | P0 | Production shows Google/email sign-in that can't work (no Firebase config) — taps do nothing. | Live click test | ✅ auth screen and "Sign in" row hidden when Firebase isn't configured |
| 5 | P0 | Accounts are cosmetic: no sync, and on a shared phone user B sees user A's journal/sobriety data. Play policy requires in-app account deletion. | `db` has zero consumers | ☐ owner decision (§6) |
| 6 | P1 | Freezes spent twice for one missed day (reconcile + AppShell) and awarded twice at day 7. | Architect measurement | ✅ single spend path (reconcile) + single award path (`freezeAwardFor`) |
| 7 | P1 | Users with an "avoid" quest see "DAY SEALED" but never get `completedDays` → no streak, no trophies. | AppShell vs TodayScreen rules differ | ✅ same rule in both |
| 8 | P1 | Any load error (bad JSON, wrong-typed field) silently falls back to a fresh onboarding; the first save overwrites the real history. | `useAppState.js` catch → `defaultState()` | ✅ `sanitizeState` converts lossless drift (`"120"`→120, ISO date→day key) and resets only unconvertible fields; original kept in rotating quarantine (last 3); an unparseable blob shows a **recovery screen** that never writes storage until the user chooses; Me → "Download recovered data" |
| 9 | P1 | Import accepts malformed files (`{"startDate":1,"restDays":{}}` passes, then crashes the next load → #8 wipe). No pre-import snapshot. | `MeScreen.jsx` | ✅ `validateBackup` schema check + pre-import snapshot + Me → "Undo last import" |
| 10 | P1 | Crash screen tells users to export from Me (unreachable from the crash screen); "Reset" deletes everything; no Sentry report. | `ErrorBoundary.jsx` | ✅ Export button on crash screen, quarantine before reset, Sentry `captureException` |
| 11 | P1 | Milestone trophies (Week One, Halfway, Legend, Centurion) can never unlock — they read `state.currentDay`, which is never updated. | `useTrophies.js:41` | ✅ derived from `startDate` |
| 12 | P1 | No day rollover while the app stays resident (a TWA rarely cold-starts): a skipped day goes unnoticed and the first tap after midnight is credited to yesterday. | No `visibilitychange` handler | ✅ re-reconcile on resume + every 60 s; comeback, weekly review, anniversaries and Forge milestones re-check on rollover |
| 13 | P1 | Weekly Challenge shows "+200 XP" and a progress bar but never pays. | `xpEngine.js` | ✅ one-time "Claim" button, idempotent per week |
| 14 | P1 | Service worker reloads the page on the **first visit** (wipes half-filled onboarding) and mid-session on every deploy; `CACHE_VERSION` hand-bumped and stuck at `v3-2026-05-11` → runtime cache grows forever; error pages cached as the offline shell. | `main.jsx`, `sw.js` | ✅ no `skipWaiting` on install — a new version waits for the user's "Update" tap (new UpdateBanner) or a cold start; no first-visit reload; per-build cache id + the build's assets precached (stamped at build); only `res.ok` cached |
| 15 | P1 | Stale-closure writes: 42 call sites do `save({...state, …})` from a render snapshot; concurrent effects overwrite each other; two tabs = last writer wins. | `useAppState.js` | ◐ `save(prev => next)` added; AppShell's mount/rollover effects converted (fixes the Forge-milestone vs. last-active race). ~40 call sites remain — Stage 3 |
| 16 | P2 | Firebase (223 KB, incl. never-used Firestore) modulepreloaded for every visitor, even with no config. | `dist/index.html` | ✅ lazy `firebaseClient.js`, Firestore dropped. Startup JS **812 KB → 559 KB** (unconfigured); configured builds load a 171 KB chunk on demand |
| 17 | P2 | `npm audit`: 2 critical (protobufjs, websocket-driver), 1 high, 1 moderate (all via firebase). | scout | ✅ criticals fixed. One high (`@grpc/grpc-js` via Firestore, Node-only) remains — not in the bundle |
| 18 | P2 | Daily bonus re-rolls after each completion → 10 claimable bonuses (+520 XP) per day. | Architect sim | ✅ pick frozen for the day |
| 19 | P2 | Check → uncheck → check farms lifetime XP (+15 each cycle); avoid quests paid the 15 XP fallback, not their value. | Harness: `lifetimeXp=30` for one 15-XP quest | ✅ |
| 20 | P2 | Comeback modal says "away for 2 days" after one missed day. | Screenshot | ✅ |
| 21 | P2 | Manifest shortcuts (`/?view=forge` …) ignored. | No reader of `location.search` | ✅ |
| 22 | P2 | Fabricated claim "ahead of 90% of users". Unsourced health stats in Forge ("lung function up to 30%"). | `intelligence.js:585`, `ForgePanel.jsx:54,63` | ◐ fake percentile removed; health copy needs sourcing |
| 23 | P2 | Relapse logging pays +25 XP with no limit; Phoenix/Resilient trophies count any recovery note. Empty workouts count toward streaks. Forge milestones parse UTC and need the exact day. | Architect | ◐ Forge milestones now use local days and catch up on missed days; relapse XP, trophy counting, empty workouts open (Stage 3) |
| 24 | P2 | No dark mode (light-only tokens) — an evening-routine / journaling app is a white screen at 11 pm. | `tokens.js` | ☐ Stage 4 |
| 25 | P2 | ROADMAP "completed" list claims features that don't exist: smart notifications, Pomodoro timer, swipe-to-uncheck protection, 7-day custom-quest unlock. TrophyPanel unreachable; ~25 dead exports; dead `firebase-messaging-sw.js`. | scout | ☐ docs + cleanup |
| 26 | P2 | `lazyWithRetry` guard is cleared by any successful chunk → a persistently failing chunk reloads on every tap. Today screen `useMemo` never hits. | Architect | ☐ Stage 3 |
| 27 | Env | Repo lives in iCloud-synced `~/Desktop`; packs evicted; git hangs; Vite's watcher restarts from iCloud fs events. | `ls -lO .git/objects/pack` → `dataless` | ☐ owner: move repo out of iCloud |

Not problems (checked): no XSS sinks (`dangerouslySetInnerHTML`/`innerHTML`); leaderboard is local and labelled as modeled tiers; localStorage quota is not a near-term risk (~229 KB/year of state).

---

## 3. What this branch changes (Stage 0, done)

Verified: `npm test` 38/38 in America/New_York, Europe/Sarajevo and Pacific/Kiritimati (incl. a **real production save** captured from the live site, run through the new load path); `npm run lint` 0 errors; `npm run build` green; 16/16 headless browser checks (first visit = 1 navigation, no dead auth screen, corrupted-field and corrupt-JSON recovery, `?view=` shortcuts, privacy text, daily-opener comeback); onboarding → all 5 tabs with 0 console errors; fake-clock streak run 1 → 2 → 3 → break-with-restore. The same checks **fail on production** (2 navigations on first visit; dead auth screen), so they can fail.

- **Streak engine:** `reconcileStreaks` anchored on the last completed day; idempotent via `streakCheckedThrough` (future-dated markers ignored); Hard Mode respected; paused and rest days excused; the freeze milestone resets on a break so freezes can be re-earned; `freezeAwardFor` is the single award path; AppShell no longer spends freezes. The comeback screen now also appears when a daily opener's streak breaks (the most common break, previously silent).
- **Consistency score** on the Today hero ("12 of the last 14 days · 6-day streak"), shipped with the fix because real streak breaks are new to every user (skeptic objection #2).
- **Rewards:** day completion ignores avoid quests (matches the banner); milestone trophies fixed; weekly challenge pays once; daily bonus frozen per day; lifetime-XP farm closed.
- **Data safety:** `src/utils/backup.js` (lossless `sanitizeState`, `validateBackup`, rotating quarantine, pre-import snapshot + undo), recovery screen, crash-screen export + Sentry, functional `save(prev => next)`.
- **Rollover** on resume; `?view=` shortcuts; comeback copy.
- **Release/trust:** privacy policy rewrite (pseudonymous analytics, AI consent, Sentry, fonts); analytics opt-in (unticked checkbox on the last onboarding step + Me → Settings, both only when Firebase is configured); opting out calls `setAnalyticsCollectionEnabled(false)`, and automatic page views are off; AI consent prompt; auth hidden when unconfigured; Gemini model + header auth; fake claim removed.
- **Perf/reliability:** lazy Firebase (−253 KB startup JS) without Firestore, lazy Sentry, service-worker update flow (UpdateBanner), per-build cache id + asset precache; `npm audit fix` (criticals gone); Vitest 4 + CI workflow (`.github/workflows/ci.yml`: test → lint → build).

## 4. Market and demand (summary — full evidence in the research doc)

- **Churn drivers (16 threads, mirror-sourced):** a streak reset that triggers a shame spiral and an uninstall (10 threads), tracking that becomes its own chore (~7), gamification that fades or becomes one more thing to avoid (4). Paywalls in quit apps come next.
- **Most-requested things LifeOS lacks or underplays:** a minimal start with 1–3 habits (6 threads), a consistency or resilience score as the headline instead of a streak (5), accountability without a social network (5), a "what got in the way?" reflection plus one next step after a miss (4), gentle reminders (4). ADHD users are over-represented (8 of 16 threads).
- **Positioning:** *the comeback app*. Forgiving streaks, plus a quit tracker that keeps history after a slip, plus an RPG layer, all free and local-first. Competitors cover one of these each (Finch: forgiving; I Am Sober: quit; Habitica: RPG, but it punishes misses).
- **Breadth is a liability.** Nobody in the evidence asked for the Academy, the Book Library, collectible cards or the leaderboard. A newcomer currently meets 5 tabs, 34 trophies, 44 cards, character stats and a weekly challenge.
- **Caveat (skeptic, accepted):** Reddit was only reachable through an archive mirror, 6 of the 16 threads are founder posts, 8 are from r/ADHD, and Forge rests on one thread. The evidence supports "forgiving streaks reduce churn" as a direction (a crowded pitch), not the bundle as the differentiator, and not cutting pillars: features absent from complaint threads aren't proof nobody uses them. **Treat positioning and cuts as hypotheses for the closed test**, not as reasons to restructure the app now.

---

## 5. Improvement plan

Reordered after the skeptic review: the longest-lead item (the Play closed test) starts on day 1, CI lands before the big merge, and measurement exists before any cut. Each acceptance test must be able to fail. 👤 = owner-only.

### Stage 1 — Ship what exists (start the clock on day 1)
1. 👤 **Start the Play closed test now**: 12 testers opted in for 14 continuous days. It has the longest lead time and doubles as the validation group: add a 3-question exit survey (what you used, why you'd stop, what you'd pay).
2. **CI first, then merge:** push `.github/workflows/ci.yml` (👤 `gh auth refresh -s workflow`, or add it via the web UI), and see it go green on this branch. Then merge PR #5 and this branch (stacked).
3. 👤 **Measurement:** create the Firebase project and set the `VITE_FIREBASE_*` env vars only after deciding §6.1. Analytics stay opt-in through the onboarding checkbox, so `onboarding_complete` can fire. Also set `VITE_SENTRY_DSN`, so the closed test produces crash data. *Test:* in a production build with consent off, the browser makes 0 requests to `*google-analytics.com` or `firebaseinstallations`; with consent on, `onboarding_complete` arrives in DebugView.
4. 👤 **AI:** recommended: **cut it for v1** (leave `VITE_GEMINI_API_KEY` unset; the UI hides itself). A proxy needs a rate-limit store (KV/Upstash) and is otherwise an open relay. *Test:* build with a **canary** key (`VITE_GEMINI_API_KEY=CANARY123`), then grep the bundle. A client-side key is present by design, so this test documents the exposure; a proxy build must show 0 matches.
5. 👤 **Play compliance:** Data safety form (from §8), Health apps declaration (Forge = addiction recovery), health-claim sourcing plus "not medical advice" in the Forge copy (moved up from Stage 4), target API 36, real `assetlinks.json` with the **Play App Signing** SHA-256, and in-app account deletion if accounts ship.
6. 👤 **Environment:** move the repo out of iCloud `~/Desktop`. Pack files and even fresh worktree edits get evicted to "dataless" and can stall git/ESLint (seen today). Clear the stale `index.lock`; triage the 26 unexplained working-tree changes in the main checkout.

### Stage 2 — Retention core (as experiments in the closed test)
1. **Minimal start (A/B, not a cut):** onboarding seeds 3 quests plus one optional Forge tracker for half the testers. Nothing is hidden for the other half. *Test:* a fresh onboarding leaves exactly 3 active quests (not "≤3"), and the variant flag is recorded.
2. **Partial credit:** count a day as done at ≥ 80% of build quests (configurable), so a 4-of-5 day doesn't read as a miss. *Test:* a 4/5 day keeps the streak and counts in consistency, while 3/5 doesn't.
3. **Miss reflection:** the comeback screen (now shown to daily openers too) asks "what got in the way?" with 4 taps + free text, and suggests one smaller quest. *Tests:* the answer persists and the insight appears after 3 tagged misses; this is covered for **both** an absent user and a daily opener.
4. **Forge keeps history on relapse:** show longest run and total clean days; cap relapse XP at once per tracker per day.
5. **Reminders:** page timers don't run in a backgrounded or killed TWA. Options: (a) Capacitor + Local Notifications (no server, stays local-first; Keepfall already uses Capacitor 8), or (b) VAPID web push + a Vercel cron (needs a server and stored subscriptions). Recommended: (a). *Test:* the app is swiped away and idle for 1 hour, and the reminder still fires within ±2 min.

### Stage 3 — Integrity and reliability
1. Convert the remaining ~40 `save({...state})` call sites to `save(prev => …)`, and add a `storage`-event listener for multi-tab use. *Test:* two saves in the same tick both persist.
2. Reward bookkeeping: relapse XP cap, Phoenix/Resilient counting only real relapses, no empty workouts, and the weekly claim respecting later unchecks. Also add a per-chunk guard in `lazyWithRetry`.
3. Playwright in CI: the browser checks from §3 (first visit = 1 navigation, `?view=`, recovery screen, daily-opener comeback, 3-day streak run), a Dojo session surviving the Update flow, and an offline reload after an update rendering the app.

### Stage 4 — Polish
1. Dark mode through CSS variables behind `TOKENS` (follows the system setting).
2. Delete dead code (~25 unused exports, `firebase-messaging-sw.js`, and TrophyPanel unless it gets wired in), and rewrite the ROADMAP "completed" list.
3. Pillar decisions only from the Stage 2 A/B, comparing day-7 retention between arms. Usage of a pillar you hid is self-fulfilling and doesn't count.

## 6. Decisions for the owner

1. **Accounts for v1:** (a) **drop sign-in** and ship local-first with export/import (recommended: honest, no deletion-flow or shared-device obligations). Analytics can still use Firebase without accounts. (b) The alternative is to rebuild sync properly: per-uid Firestore docs, security rules plus emulator tests, in-app deletion, and sign-out clearing the device copy **only after a confirmed upload** (clearing first loses data when sync fails).
2. **Analytics default:** opt-in through an unticked checkbox on the last onboarding step, plus a Me → Settings toggle. This is GDPR-safe but yields less data. Pair it with the closed-test exit survey.
3. **AI coach:** recommended **cut for v1** (leave the key unset). Keeping it means building the proxy, a rate-limit store and a cost cap, and confirming the Gemini tier: on the free tier Google may use prompts, which would have to go into the policy.
4. **Scope:** approve the Stage 2.1 minimal-start A/B. This is an experiment, not a cut.
5. **Monetisation:** "free for v1" — say so in the listing; changing the model later can trigger a policy review.

---

## 7. Skeptic review (council-skeptic) and what changed

**Verdict:** "The streak rewrite is correct on the common paths I traced": first day, gaps, freeze chains, hard mode, pause, DST and westward travel. The skeptic flagged 4 must-fix issues in Stage 0, all fixed here:

| Skeptic finding | Resolution |
|---|---|
| Quarantine was write-once, and a parse failure still fell through to onboarding (data loss) | Rotating quarantine (last 3) + recovery screen that never writes storage; browser-checked |
| Freezes couldn't be re-earned after a break | Milestone reset on break; restore-half re-aligns it; unit-tested |
| Daily openers' streaks broke silently | Comeback screen on `streakBrokenDate === today`; browser-checked |
| Deferred reload-on-hide could wipe a Dojo session; no update listener; offline blank after update | No `skipWaiting` on install, UpdateBanner + SKIP_WAITING, build assets precached |
| Analytics opt-out only flipped a flag; policy said "anonymous" | `setAnalyticsCollectionEnabled(false)`, `send_page_view:false`, "pseudonymous" wording, vices count disclosed |
| AI prompt includes journal/Forge data without in-context disclosure | One-time explicit consent before the first request |
| `sanitizeState` reset convertible values (`onboarded:"true"` re-ran onboarding; ISO `startDate` reset the journey) | Lossless conversions; plausible-date bound so `startDate:1` isn't 1970 |
| Future-dated `streakCheckedThrough` forgave misses | Ignored if after yesterday; unit-tested |
| Rollover didn't re-run milestone/anniversary/weekly checks | `dayKey` added to those effects |
| Pre-import snapshot had no undo | Me → "Undo last import" |
| Two streak tests couldn't fail; many cases missing | Rewritten (each demonstrated failing against the unfixed code), +22 tests incl. a real production save, 3 timezones |
| "Model id unverified" | Verified first-hand on Google's deprecations page (2.0-flash → 3.6-flash) |

While re-verifying these fixes, the browser checks also caught **a regression of mine**: a functional `save(prev => …)` read a ref before it was populated (child effects run before parent effects), which would have sent onboarded users back to onboarding. I fixed it and guarded it before it could ship.

Plan objections accepted (reflected in §5/§6): no measurement source → onboarding opt-in, a Sentry DSN and the closed test as the validation group; streak breaks become real for the first time → consistency score shipped now, partial credit in Stage 2; Play prerequisites and the 14-day gate moved to day 1; reminder test rewritten for a killed TWA, with Capacitor recommended; acceptance tests that couldn't fail rewritten; CI before merge; Stage 2 cuts turned into an A/B; the proxy needs a store, so cut AI for v1; sign-out clears data only after a confirmed upload.

Still open from the review: the weekly claim isn't reversed when quests are unchecked afterwards (Stage 3), and the auth chunk loads after the main bundle when Firebase is configured, which may lengthen the splash slightly (measure in the closed test).

---

## 8. Data-flow table (source of truth for the privacy policy)

| Flow | When | What is sent | Where | Code |
|---|---|---|---|---|
| On-device storage | Always | Entire app state | `localStorage["life-os-state"]` | `useAppState.js` |
| AI coach / workout generator | Only when the user sends a message, and only if `VITE_GEMINI_API_KEY` is set | Message + summary: name, XP/level, streaks, recent quests, recent moods, Forge tracker names + days, onboarding profile, latest journal excerpt | Google Gemini API | `ai.js` |
| Usage analytics | Only if Firebase is configured **and** the user opted in | `tab_view`, `quest_added`, `journal_saved` (flags only), `day_complete`, `onboarding_complete` (goal, counts) + Firebase app-instance ID | Firebase Analytics | `firebase.js`, `firebaseClient.js` |
| Sign-in | Only if Firebase is configured and the user signs in | Email, display name, auth tokens | Firebase Auth | `useAuth.jsx` |
| Crash reports | Only if `VITE_SENTRY_DSN` is set (prod) | Error, stack, component stack, UA, URL, release | Sentry | `main.jsx`, `ErrorBoundary.jsx` |
| Fonts | Always | Standard request (IP, UA) | Google Fonts | `styles/global.js` |
| Hosting | Always | Standard access logs | Vercel | — |

If you add a row in code, add it here and to `PrivacyPolicyScreen.jsx` in the same change.
