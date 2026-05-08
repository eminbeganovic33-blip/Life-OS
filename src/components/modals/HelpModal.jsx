import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trophy, Sword, Flame, Zap } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useTheme } from "../../hooks/useTheme";

/**
 * Help / explainer modal. Replaces several would-be tooltips and ad-hoc copy
 * with one consolidated reference users can return to. Tabs:
 *   - XP — how earnings are calculated
 *   - Boss Days — what every-21st-day means
 *   - Streaks & Freezes — how the safety net works
 *   - The Stake — why the 3-question commitment matters
 */
export default function HelpModal({ initialTab = "xp", onClose }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState(initialTab);
  useEscapeKey(onClose);

  const tabs = [
    { id: "xp", label: "XP", Icon: Zap },
    { id: "boss", label: "Boss Days", Icon: Sword },
    { id: "streaks", label: "Streaks", Icon: Flame },
    { id: "stake", label: "The Stake", Icon: Trophy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bgGrad1 || "#0F0A1F",
          border: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.08)"}`,
          borderRadius: 16, padding: 0, maxWidth: 380, width: "100%",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.06)"}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>How it works</div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", color: colors.textSecondary,
              cursor: "pointer", padding: 4, display: "flex",
            }}
          ><X size={18} /></button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", overflowX: "auto",
          borderBottom: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.06)"}`,
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, minWidth: 80, padding: "10px 8px", border: "none",
                background: tab === t.id ? "rgba(124,92,252,0.08)" : "transparent",
                borderBottom: tab === t.id ? "2px solid #7C5CFC" : "2px solid transparent",
                color: tab === t.id ? "#7C5CFC" : colors.textSecondary,
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}
            >
              <t.Icon size={12} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{
          padding: "18px 18px 22px",
          fontSize: 13, lineHeight: 1.6,
          color: colors.text,
          opacity: 0.85,
          overflowY: "auto",
        }}>
          {tab === "xp" && (
            <>
              <h3 style={h3}>How XP is calculated</h3>
              <p>Each quest's XP starts from a tier based on its name. Hard or rare actions (cold shower, deep work, lifting) earn more. Light actions (water glass) earn less.</p>
              <ul style={ul}>
                <li><b>Tier:</b> 12, 25, or 50 XP base</li>
                <li><b>Day bonus:</b> +2 XP per 10 days into your journey (rewards consistency)</li>
                <li><b>Streak multiplier:</b> 1.0× → 2.0× as your streak grows</li>
              </ul>
              <p style={{ opacity: 0.55, fontSize: 11, marginTop: 8 }}>
                A 25-XP quest on day 30 with a 14-day streak earns 25 × ~1.4 + 6 = ~41 XP.
              </p>
            </>
          )}
          {tab === "boss" && (
            <>
              <h3 style={h3}>Boss Days (every 21 days)</h3>
              <p>A Boss Day is a checkpoint, not a finish line. They land on Day 21, 42, 63, and so on — the rhythm habit research suggests new behavior locks in.</p>
              <p>Boss Days unlock new Dojo exercises, deeper Academy courses, and award bonus XP. The voice gets tougher in the lead-up: <em>tomorrow's the question, today's the answer.</em></p>
              <p style={{ opacity: 0.55, fontSize: 11, marginTop: 8 }}>
                Day 66 is the final boss — completing it activates Mastery Mode.
              </p>
            </>
          )}
          {tab === "streaks" && (
            <>
              <h3 style={h3}>Streaks &amp; Freezes</h3>
              <p>Your streak counts consecutive days where you sealed at least one quest. Miss a day, and the streak resets — unless a Streak Freeze is available.</p>
              <p>You earn a Streak Freeze every 7 streak-days, up to 3 stored. They auto-consume when you miss a day, preserving your run.</p>
              <p style={{ opacity: 0.55, fontSize: 11, marginTop: 8 }}>
                A 1-day miss with a freeze available burns the freeze. A 3+ day gap resets the streak even with freezes — life happens, and that's okay.
              </p>
            </>
          )}
          {tab === "stake" && (
            <>
              <h3 style={h3}>The Stake</h3>
              <p>One sentence each — <em>why</em> you're here, the <em>cost</em> of stopping, and the <em>proof</em> you'll see in 66 days.</p>
              <p>The voice references your stake at weak moments. After a missed day, you'll see your own words quoted back. That's the point — you wrote it because future-you needs it.</p>
              <p style={{ opacity: 0.55, fontSize: 11, marginTop: 8 }}>
                Edit anytime from your Profile. Old versions are saved as revisions.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const h3 = {
  fontSize: 13,
  fontWeight: 800,
  margin: "0 0 8px",
  color: "#7C5CFC",
  letterSpacing: 0.2,
};
const ul = {
  margin: "0 0 10px 18px",
  padding: 0,
  fontSize: 12,
  opacity: 0.85,
  lineHeight: 1.7,
};
