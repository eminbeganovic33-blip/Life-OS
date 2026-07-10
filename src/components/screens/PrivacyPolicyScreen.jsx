/**
 * Privacy Policy — rendered as an in-app screen AND at /privacy (for Play Store URL).
 * Last updated: June 2026
 */
export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {onBack && (
          <button onClick={onBack} style={styles.back}>← Back</button>
        )}
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.meta}>Life OS · Last updated June 2026</p>
      </div>

      <div style={styles.body}>
        <Section title="Overview">
          Life OS ("the app") is a personal habit-tracking application. We take your privacy
          seriously. This policy explains what data is collected, how it is used, and your rights.
        </Section>

        <Section title="Data we collect">
          <b>When you use the app without an account (local-only mode):</b>
          <ul>
            <li>No data leaves your device. All habits, streaks, journal entries, and progress are stored exclusively in your browser's localStorage.</li>
            <li>We collect no personal information, usage analytics, or identifiers.</li>
          </ul>

          <b>When you create an account (optional):</b>
          <ul>
            <li><b>Email address</b> — used only for authentication and account recovery.</li>
            <li><b>Display name</b> — shown only to you inside the app.</li>
            <li><b>App data</b> (habits, streaks, journal entries, workout logs) — synced to your private Firestore document, readable only by your authenticated account.</li>
            <li>We do <b>not</b> collect payment info, location, contacts, health sensor data, or any device identifier.</li>
          </ul>
        </Section>

        <Section title="How we use your data">
          <ul>
            <li>To sync your progress across devices (signed-in users only).</li>
            <li>To authenticate you when you sign in.</li>
            <li>We do <b>not</b> sell, share, or monetise your data in any form.</li>
            <li>We do <b>not</b> use your data for advertising.</li>
            <li>We do <b>not</b> perform automated profiling or use AI to analyse your journal entries or habits.</li>
          </ul>
        </Section>

        <Section title="Third-party services">
          <ul>
            <li><b>Firebase (Google)</b> — Authentication and Firestore database for signed-in users. Governed by <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>Google's Privacy Policy</a>.</li>
            <li><b>Vercel</b> — Hosts the web application. Standard server access logs (IP, user-agent) may be retained by Vercel per their policy. We do not access or store these logs.</li>
          </ul>
          No advertising SDKs, social trackers, or analytics platforms are embedded in the app.
        </Section>

        <Section title="Data retention &amp; deletion">
          <ul>
            <li><b>Local-only users:</b> All data is stored on your device. Clear your browser/app storage at any time to delete everything.</li>
            <li><b>Signed-in users:</b> You can delete your account and all associated data permanently by emailing <a href="mailto:eminbeganovic33@gmail.com" style={styles.link}>eminbeganovic33@gmail.com</a> with the subject "Delete my data". We will action the request within 30 days.</li>
          </ul>
        </Section>

        <Section title="Children">
          Life OS is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it immediately.
        </Section>

        <Section title="Your rights (GDPR / CCPA)">
          If you are in the EU or California, you have the right to access, correct, export, or delete your personal data. Contact us at the email below to exercise these rights.
        </Section>

        <Section title="Security">
          All data in transit is encrypted via HTTPS/TLS. Firestore data is encrypted at rest by Google. We never store passwords — authentication is delegated entirely to Firebase (Google Sign-In or Firebase email auth with hashed credentials).
        </Section>

        <Section title="Changes to this policy">
          We may update this policy. When we do, the "Last updated" date at the top changes. Continued use of the app after changes constitutes acceptance.
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
