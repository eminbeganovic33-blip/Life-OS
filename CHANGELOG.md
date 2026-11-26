# Changelog

Dated entries, newest first. Each push to GitHub gets an entry saying what changed and why.

## 2026-11-26 — v1 preview: AI coach cut, privacy, Forge disclaimer, security headers

**Branch:** `claude/lifeos-v1-preview` (on top of `claude/lifeos-audit-optimize-1af8e3`, which is on top of PR #5)

**Why:** Emin approved "save, fix, then redeploy". This branch is the build for a Vercel **preview**. Production stays as it is until Emin OKs it.

**What changed:**
- **AI coach and AI workout generator cut for v1.** Any `VITE_*` key is copied into the public JavaScript, so the Gemini key would have been readable by anyone. `src/utils/ai.js` no longer reads `VITE_GEMINI_API_KEY` at all, so both features stay hidden even if the key is set on Vercel. To bring AI back, add a server-side proxy.
- **Privacy policy** (served at `/privacy`) now says plainly that no AI features are in this version and no data goes to an AI service.
- **Forge:** a "not medical advice" note under the quit trackers, including a warning that stopping heavy drinking suddenly can be dangerous.
- **Security headers** (in `vercel.json`, for every path):
  - Content-Security-Policy, limited to the app, Google Fonts, Firebase/Google Analytics, Sentry and Open Library covers;
  - `frame-ancestors 'none'` and X-Frame-Options DENY;
  - nosniff;
  - Referrer-Policy;
  - Permissions-Policy (no camera, mic, location or payment).
- **`public/robots.txt`** added. It was a 404 before.

**Verified:**
- `npm test`: 38/38 passing in all 3 timezones. `npm run lint`: 0 errors. `npm run build`: green.
- A build made with the real local `.env` does **not** contain the Gemini key. The Firebase web key is still there, which is expected because Firebase web keys are public by design.
- Headless Chrome against the production build, with the CSP applied:
  - no "Continue with Google" button (Firebase isn't configured);
  - AI coach and AI workout generator hidden;
  - the Forge disclaimer shows;
  - `/privacy` shows the no-AI text;
  - no reload on the first visit;
  - 0 console errors or warnings.

## 2026-11-26 — Save the Nov 5 audit work

**Branch:** `claude/lifeos-audit-optimize-1af8e3` (stacked on PR #5, `redesign/hybrid-calm-game` @ 3cab42a)

**Why:** the fixes from the 2026-11-05 audit had never been committed. They sat only in a local folder synced by iCloud, which had already started offloading files. This commit saves them to GitHub. Full findings: `docs/audit/2026-11-05-lifeos-audit-and-plan.md`.

**What changed:**
- **Streak engine fixed.** Live production caps every streak at 1: opening the app the day after a perfect day resets it. Freezes were spent twice and awarded twice. Fixed in `reconcileStreaks`, with 38 unit tests run in 3 timezones.
- **Data safety.** A corrupted save no longer silently resets the app to a fresh onboarding. The original is kept, a recovery screen appears, imports are validated, and there's "Undo last import". The crash screen has an Export button.
- **Rewards.** Milestone trophies can unlock again, the weekly challenge pays out once, the daily bonus can't be farmed, and the check/uncheck XP farm is closed.
- **Day rollover** works while the app stays open (re-checks on resume and every 60 s).
- **Privacy.** The policy was rewritten to match what the code actually does. Analytics are opt-in (unticked checkbox). The auth screen is hidden when Firebase isn't configured, so the dead Google button is gone.
- **Performance and offline.** Firebase loads lazily and Firestore is dropped (startup JS 812 KB → 559 KB). The service worker no longer reloads the page on the first visit; updates wait for an "Update" tap.
- `npm audit fix`: the critical advisories are fixed.
- Vitest added (`npm test`).

**Verified:** `npm test`: 38/38 passing in America/New_York, Europe/Sarajevo and Pacific/Kiritimati. `npm run lint`: 0 errors (37 warnings). `npm run build`: green.

**Not included:** `.github/workflows/ci.yml`. The GitHub token can't push workflow files (it lacks the `workflow` scope). Add it through the GitHub web UI, or run `gh auth refresh -s workflow`.
