# Changelog

Dated entries, newest first. Each push to GitHub gets an entry saying what changed and why.

## 2026-11-26 — Revamp follow-up: one popup at a time, room under the "+" button

**Branch:** `claude/lifeos-visual-revamp`. Preview only.

**Why:** the round-2 review found two glitches.
- When a day completed, the day-complete, level-up and boss popups all opened at once, so a second card showed behind the top one.
- On Today, the last card ended up under the floating "+" button.

**What changed:**
- **Popups:** celebration popups now show one at a time, in a fixed order: day complete → level up → boss → comeback → weekly review → Forge milestone → anniversary. Each one appears when the previous one is dismissed.
- **Today:** the screen now has 168px of space at the bottom (96px on other tabs), so the last card scrolls fully clear of the "+" button. The button itself stays above the tab bar.

**Verified:**
- `npm test`: 38/38 passing. Lint: 0 errors. Build: green.
- Headless check: the popups come up in sequence with nothing stacked behind, in light and dark.
- At the end of the Today scroll, no button sits under the "+".

## 2026-11-26 — Visual revamp, round 2: 3D images, bigger art, bolder cards

**Branch:** `claude/lifeos-visual-revamp` (still on top of PR #6). **Preview only**: production waits for Emin's OK on the look.

**Why:** Emin's feedback on round 1: "Swap to the 3D Fluent images, make the images bigger and more prominent, and push the style harder before shipping."

**What changed:**
- **3D images:** the flat Fluent Emoji were replaced with Microsoft's **Fluent Emoji 3D** (MIT).
  - Only the 136 images in use were downloaded from the official GitHub repo, plus 2 new ones (sun and sunset).
  - They're saved as 192px WebP, about 590 KB in total and lazy-loaded.
  - `CREDITS.md` is updated with the source, licence and how to add more.
- **Bigger, more prominent art:**
  - **Today:** each quest is now a bold card, with a 52px picture tile, a tinted background, a 2px border, a pressable lip and a 32px check circle. The time blocks use 3D sun, sunset, moon and lightning. The daily bonus and weekly challenge use 3D art, and the streak and freeze pills use 3D fire and snowflake.
  - **Forge:** tracker art is 64px.
  - **Dojo and Academy:** programs and courses have 64px tiles.
  - **Trophies and guides:** images are 40px.
  - **Onboarding:** the "What's inside" cards use 3D art, and the goal and vice images are bigger.
  - **Empty states:** 80px images.
- **Popups:** level-up (rocket or crown), day complete (party popper), Forge milestone (shield), comeback (sunrise) and weekly review (chart) all use large 3D images instead of line icons.
  - The anniversary popup was see-through at the top-left corner. It's opaque now, and works in dark mode.
- **More colour:** surfaces and borders have a lavender tint, and cards have a soft solid lip.
- No change to behaviour or saved data.

**Verified:**
- `npm test`: 38/38 passing in 3 timezones. Lint: 0 errors (38 advisory warnings). Build: green.
- Phone-size screenshots, light and dark, of onboarding, the five tabs and 7 popups (day complete, level-up, boss, Forge milestone, comeback, anniversary, weekly review):
  - 0 console errors;
  - no emoji characters left as text on the tabs;
  - no button under 44px.

## 2026-11-26 — Visual revamp: thick rounded font, big round buttons, real images, dark mode

**Branch:** `claude/lifeos-visual-revamp` (on top of `claude/lifeos-v1-preview` / PR #6, which isn't merged yet)

**Why:** Emin asked to "revamp lifeos completely visually, make it have large buttons with curved edges and nice thick font with images (source smth) instead of emojis." This is a **preview only**. Merging and production wait for Emin's OK on the look.

**What changed:**
- **Font:** Nunito (SIL OFL), self-hosted via `@fontsource/nunito`, so the Google Fonts request is gone and the privacy text and CSP are updated to match.
  - Headings and numbers are 900 and body text is 600.
  - The weight scale is one step heavier across the app.
- **Buttons:**
  - every button is at least 48px tall;
  - corners are more rounded (radius scale 12/16/20/28);
  - main actions are now a purple "pressable" button with a solid lip, instead of near-black;
  - buttons press down slightly on tap.
- **Images instead of emoji:** 136 Microsoft Fluent Emoji images (MIT) as 128px WebP, about 380 KB in total and lazy-loaded, with alt text.
  - A new `Emoji` / `EmojiText` component renders them everywhere an emoji was shown: quests, Forge, trophies, moods, courses, books, toasts, modals.
  - Source and licence are recorded in `CREDITS.md`.
- **One palette, with light and dark mode:** the colour tokens are now CSS variables, and dark mode follows the phone's system setting. The tab bar and modals no longer use hard-coded white.
- No change to behaviour or saved data. Only rendering changed.

**Verified:**
- `npm test`: 38/38 passing in 3 timezones. Lint: 0 errors. Build: green.
- Headless phone screenshots (390×844, light and dark) of onboarding, Today, Train, Learn, Forge and Me:
  - 0 console errors;
  - no emoji characters left as text on those screens;
  - no visible button under 44px on any of the five tabs (the Today pause button went from 32 to 48px).

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
