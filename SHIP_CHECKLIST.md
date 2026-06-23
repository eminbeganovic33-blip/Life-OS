# Life OS — Ship Checklist

Turning the overall app feedback into an ordered, do-this-to-launch list.
Grouped by what actually blocks a Play Store launch vs. what protects the launch
vs. what makes the launch *succeed*. Check items off as you go.

Legend: 🔴 hard blocker · 🟡 quality gate (should block) · 🟢 makes launch succeed · ✅ already done this session

---

## 0. Pre-flight (do first — nothing ships without this)

- [x] ✅ **Committed + pushed + PR opened** — branch `redesign/hybrid-calm-game`, PR #5 → `main`.
- [ ] 🔴 **Merge PR #5 and deploy to Vercel**; confirm the live URL loads the latest build.
- [ ] 🟡 **Add CI workflow.** `.github/workflows/ci.yml` exists locally but couldn't be pushed (the `gh` OAuth token lacks `workflow` scope). Either `gh auth refresh -s workflow` then commit it, or add it via the GitHub web UI.
- [x] ✅ Build passes (`npm run build`, exit 0, main chunk ~434 KB)
- [x] ✅ Lint clean (`npm run lint`, 0 errors)

## 1. Play Store hard blockers (🔴)

- [ ] 🔴 **Google Play developer account** — register, pay the $25 one-time fee (play.google.com/console).
- [ ] 🔴 **Privacy Policy reachable at a public URL.** Page already built at `/privacy` (`src/components/screens/PrivacyPolicyScreen.jsx`). Confirm `https://<domain>/privacy` loads after deploy; paste that URL into Play Console.
- [ ] 🔴 **Firebase: register the Android app** (`com.lifeos.app`) in the Firebase console. Add the TWA signing SHA-1/SHA-256 to it. Add the production Vercel domain to **Auth → Authorized domains** — otherwise Google sign-in breaks on Android.
- [ ] 🔴 **Build the TWA with Bubblewrap.** `bubblewrap init --manifest https://<domain>/manifest.json`, answer prompts (package `com.lifeos.app`, theme `#7C5CFC`, splash `#0A0B1A`), create + **back up the keystore**, then `bubblewrap build` → `app-release-signed.aab`.
- [ ] 🔴 **Fill in `assetlinks.json` with the real fingerprint.** `public/.well-known/assetlinks.json` currently has `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`. Run `keytool -list -v -keystore <ks>.jks` → copy SHA-256 → paste → redeploy. TWA won't verify without this.
- [ ] 🔴 **Store listing assets:** feature graphic (1024×500), 2–8 phone screenshots (1080×1920+), short description (≤80 chars), full description (≤4000). App icon ✅ exists (`icon-512.png`).
- [ ] 🔴 **Content rating** questionnaire in Play Console (IARC). Likely "Teen" given sobriety content.
- [ ] 🔴 **Target API level 34+** — latest Bubblewrap handles this automatically; verify in the generated `build.gradle`.

## 2. Quality gates — protect the launch (🟡)

- [ ] 🟡 **Set `VITE_SENTRY_DSN` in Vercel env vars.** Crash reporting is wired (`src/main.jsx`) but inert without a DSN. Ship blind = can't fix what you can't see.
- [ ] 🟡 **Verify Google sign-in end-to-end on the real deployed domain** (only ever seen it blocked in the preview sandbox). Test sign-in → sync → sign-out on a phone.
- [ ] 🟡 **Confirm Firebase Analytics fires in production.** Wired (`track()` in `firebase.js` + `day_complete` event). Open the app on the live URL, complete a day, confirm the event lands in Firebase. (This is the "evidence" half of the feedback — see §3.)
- [ ] 🟡 **Maskable icon safe-zone check** — run `public/icon-maskable-512.png` through maskable.app; confirm the ⚡ isn't cropped by the Android circle/squircle mask.
- [ ] 🟡 **On-device smoke test of the signed TWA** before promoting to Production: install via Internal Testing track, run the full loop (onboard → add quest → complete → journal → forge → close/reopen), confirm Android back button behaves (handler added in `AppShell`).

## 3. Make the launch actually succeed (🟢 — the feedback's core)

- [x] ✅ **Funnel events wired** (`onboarding_complete`, `tab_view`, `quest_added`, `journal_saved`, `day_complete`). Still need a Firebase project + to verify they land in prod (§2).
- [x] ✅ **Default roster on empty domain selection** — Today is no longer empty on day 1. (A one-line value-prop on the Ready screen is still worth a copy pass.)
- [ ] 🟢 **Decide the 2 core pillars and let new users meet those first.** Don't delete Train/Learn/Forge — but consider sequencing so a newcomer isn't asked to engage with everything immediately. Revisit nav prominence once §3 analytics show real day-7 usage.
- [ ] 🟢 **Decide monetization stance before submitting** (even "free for v1"). Changing billing model post-launch can mean resubmission/policy review. Pick now, document it.
- [ ] 🟢 **Watch the gamification/“productive procrastination” risk.** Once analytics exist, check whether XP/levels correlate with *habit completion* or just app-poking. If the meta-game is replacing the behavior, simplify it.

## 4. Tech hygiene (low risk — clear the runway)

- [ ] 🟢 Add a CI check (GitHub Action) running `npm run build` + `npm run lint` on PRs, so the 1,447-error lint regression can't recur silently.
- [ ] 🟢 `react-refresh/only-export-components` files (Toast, useAuth, AnimalAvatars, AnniversaryModal) — optional: split helpers into their own files to restore fast-refresh. Dev-DX only; non-blocking.
- [ ] 🟢 The dev-only "dual-React / Invalid hook call" flashes after `npm install` mid-session are a Vite-optimizer artifact (clear `node_modules/.vite` + restart). Not a code bug, no prod impact — documented so it doesn't get re-chased.

---

### Suggested order
**Pre-flight (§0) → Sentry + analytics + sign-in verification (§2 + first item of §3) → Bubblewrap/assetlinks/store listing (§1) → on-device test → submit.**
Then post-launch, let §3 analytics drive the focus/subtraction pass.

### The one-line version
You are ~a day of mechanical setup (§0–§1) away from *being able* to ship, and one analytics integration (§3) away from shipping *wisely*. Don't add features before launch — instrument, then cut based on data.
