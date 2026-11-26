/**
 * Privacy Policy — rendered as an in-app screen AND at /privacy (for Play Store URL).
 * Last updated: November 2026.
 *
 * Keep this in lockstep with the code. Every outbound data flow is listed in
 * docs/audit/2026-11-05-lifeos-audit-and-plan.md ("Data-flow table"); if you
 * add a network call, update both. A policy that contradicts the app is a
 * Play Store rejection/takedown risk.
 */
export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.back}>← Back</button>
        )}
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.meta}>Life OS · Last updated November 2026</p>
      </div>

      <div style={styles.body}>
        <Section title="Overview">
          Life OS ("the app") is a personal habit, sobriety and workout tracker. It is built
          local-first: your data lives on your device. This policy lists every case in which
          anything leaves it.
        </Section>

        <Section title="Data stored on your device">
          <ul>
            <li>Your habits, streaks, XP, journal entries, moods, workout logs, quit-tracker (Forge) dates and settings are stored only in this browser/app's local storage on your device.</li>
            <li>They are <b>not</b> uploaded to our servers or synced to the cloud. If you clear the app's storage or uninstall it, they are gone — use <b>Me → Export data</b> to keep a backup file.</li>
            <li>Mood, journal and sobriety data can be sensitive. It stays on your device.</li>
          </ul>
        </Section>

        <Section title="When data leaves your device">
          <ul>
            <li>
              <b>No AI features in this version.</b> The AI Coach and AI workout generator are
              switched off, so none of your data is sent to an AI service. If we add AI features
              later, we will update this policy and ask for your permission first.
            </li>
            <li>
              <b>Usage statistics (off unless you turn them on in Me → Settings).</b> If enabled,
              Firebase Analytics (Google) receives events such as which tab you opened, that a quest
              was added or a day completed, and your onboarding choices (goal, time budget, and how
              many focus areas and habits-to-quit you picked). It never receives journal text, mood
              entries or which habits you're quitting. The data is pseudonymous: it is tied to a random
              app-instance identifier, not your name or email. Turning the setting off stops
              collection immediately.
            </li>
            <li>
              <b>Account sign-in (optional, only where offered).</b> If you sign in, Firebase
              Authentication (Google) stores your email address and display name to identify you.
              Signing in does <b>not</b> upload or sync your app data.
            </li>
            <li>
              <b>Crash reports (when enabled by us).</b> If the app crashes, an error report (error
              message, code location, browser/device type, app version and page address) may be sent
              to Sentry so we can fix it. Reports are not meant to include your journal or habit
              content.
            </li>
            <li>
              <b>Hosting.</b> The app is served by Vercel, which keeps standard access logs (IP address,
              user agent). Fonts and icons are served from the app itself. Book covers in the Learn tab load from Open Library (Internet Archive), which sees your IP address.
            </li>
          </ul>
          We do <b>not</b> sell or share your data, show ads, or use advertising SDKs.
        </Section>

        <Section title="Data retention &amp; deletion">
          <ul>
            <li><b>On-device data:</b> delete it any time with <b>Me → Reset all data</b>, or by clearing the app's storage.</li>
            <li><b>Account:</b> to delete your account, email <a href="mailto:eminbeganovic33@gmail.com?subject=Delete%20my%20Life%20OS%20account" style={styles.link}>eminbeganovic33@gmail.com</a> with the subject "Delete my account". We delete it within 30 days.</li>
            <li><b>Analytics and crash data</b> are kept by Google/Sentry under their standard retention (up to 14 months for analytics) and can be deleted on request.</li>
          </ul>
        </Section>

        <Section title="Health and recovery information">
          Life OS is not a medical service. Quit-tracker milestones and health facts are general
          information, not medical advice. If you are dealing with addiction, please also reach out
          to a professional or a local support line.
        </Section>

        <Section title="Children">
          Life OS is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it immediately.
        </Section>

        <Section title="Your rights (GDPR / CCPA)">
          If you are in the EU/EEA, the UK or California, you have the right to access, correct, export, or delete your personal data, and to withdraw consent (for example by turning off usage statistics). Your on-device data can be exported at any time from Me → Export data. Contact us at the email below for anything held by third parties.
        </Section>

        <Section title="Security">
          All data in transit is encrypted via HTTPS/TLS. We never store passwords — sign-in is handled by Firebase Authentication. On-device data is protected by your device's own security; anyone with access to your unlocked device and this app can see it.
        </Section>

        <Section title="Changes to this policy">
          We may update this policy. When we do, the "Last updated" date at the top changes, and material changes are announced in the app.
        </Section>

        <Section title="Contact">
          Questions or data requests: <a href="mailto:eminbeganovic33@gmail.com" style={styles.link}>eminbeganovic33@gmail.com</a>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={sectionStyles.wrap}>
      <h2 style={sectionStyles.heading}>{title}</h2>
      <div style={sectionStyles.body}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 680, margin: "0 auto",
    padding: "32px 20px 80px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111",
    lineHeight: 1.6,
  },
  header: { marginBottom: 32 },
  back: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 14, color: "#7C5CFC", padding: 0, marginBottom: 16,
    display: "block",
  },
  title: { fontSize: 28, fontWeight: 800, margin: "0 0 6px" },
  meta: { fontSize: 13, color: "#888", margin: 0 },
  body: { display: "flex", flexDirection: "column", gap: 28 },
  link: { color: "#7C5CFC", textDecoration: "none" },
};

const sectionStyles = {
  wrap: {},
  heading: {
    fontSize: 16, fontWeight: 700,
    margin: "0 0 8px", color: "#222",
  },
  body: {
    fontSize: 14, color: "#444",
    lineHeight: 1.7,
  },
};
