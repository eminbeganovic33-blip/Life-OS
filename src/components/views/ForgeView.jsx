import { S } from "../../styles/theme";
import { SOBRIETY_DEFAULTS } from "../../data";
import { getProgramDay } from "../../data/forgePrograms";
import { daysBetween } from "../../utils";
import { getTriggerMap } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import { usePremium } from "../../hooks/usePremium";
import { FREE_LIMITS, FEATURE_IDS } from "../../data/premium";

export default function ForgeView({ state, onStart, onTriggerRelapse }) {
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasUnlimitedForge = checkFeatureAccess(FEATURE_IDS.UNLIMITED_FORGE);

  // Count active trackers
  const activeTrackerCount = Object.keys(state.sobrietyDates || {}).filter(
    (k) => !!state.sobrietyDates[k]
  ).length;
  const atFreeLimit = !hasUnlimitedForge && activeTrackerCount >= FREE_LIMITS.maxForgeTrackers;

  return (
    <div style={S.vc}>
      <div style={S.secTitle}>The Forge</div>
      <div style={{ padding: "0 16px", marginBottom: 12, fontSize: 12, opacity: 0.4 }}>
        Track what you're breaking free from. Every day without is a victory.
        {!hasUnlimitedForge && (
          <span style={{ color: "#FFD700", opacity: 1, marginLeft: 6 }}>
            ({activeTrackerCount}/{FREE_LIMITS.maxForgeTrackers} free)
          </span>
        )}
      </div>
      {SOBRIETY_DEFAULTS.map((tracker) => {
        const startDate = state.sobrietyDates?.[tracker.id];
        const daysClean = startDate ? daysBetween(startDate) : 0;
        const isActive = !!startDate;
        return (
          <div key={tracker.id} style={{ ...S.forgeCard, borderLeft: `3px solid ${tracker.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{tracker.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{tracker.label}</div>
                  {isActive ? (
                    <div style={{ fontSize: 22, fontWeight: 800, color: tracker.color, marginTop: 2 }}>
                      {daysClean}{" "}
                      <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5 }}>days free</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, opacity: 0.4 }}>Not tracking yet</div>
                  )}
                </div>
              </div>
              {isActive ? (
                <button
                  style={{ ...S.forgeBtn, borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }}
                  onClick={() => onTriggerRelapse(tracker.id)}
                >
                  Reset
                </button>
              ) : atFreeLimit ? (
                <button
                  style={{ ...S.forgeBtn, borderColor: "rgba(255,215,0,0.3)", color: "#FFD700" }}
                  onClick={() => setShowUpgrade(true)}
                >
                  🔒 Upgrade
                </button>
              ) : (
                <button
                  style={{ ...S.forgeBtn, borderColor: `${tracker.color}44`, color: tracker.color }}
                  onClick={() => onStart(tracker.id)}
                >
                  Start
                </button>
              )}
            </div>
            {isActive && daysClean > 0 && (
              <div style={S.forgeMeter}>
                <div
                  style={{
                    ...S.forgeFill,
                    width: `${Math.min(100, (daysClean / 66) * 100)}%`,
                    background: tracker.color,
                  }}
                />
              </div>
            )}
            {isActive && (() => {
              const dayInfo = getProgramDay(tracker.id, daysClean || 1);
              if (!dayInfo) return null;
              return (
                <div style={forgeTipCard}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.4, marginBottom: 4 }}>
                    Day {dayInfo.day} · {dayInfo.phase}
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{dayInfo.tip}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
                    <strong style={{ color: tracker.color }}>Action:</strong> {dayInfo.action}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}

      {state.recoveryJournals?.length > 0 && (
        <>
          <div style={{ ...S.secTitle, marginTop: 20 }}>Recovery Journal</div>
          {state.recoveryJournals
            .slice(-5)
            .reverse()
            .map((entry, i) => {
              const tr = SOBRIETY_DEFAULTS.find((t) => t.id === entry.tracker);
              return (
                <div key={i} style={S.pastEntry}>
                  <div style={S.pastHead}>
                    <span>{tr?.icon} {tr?.label}</span>
                    <span style={{ opacity: 0.3 }}>{entry.date}</span>
                  </div>
                  {entry.daysCleanBefore != null && (
                    <div style={{ fontSize: 10, opacity: 0.35, marginBottom: 4 }}>
                      Was clean for {entry.daysCleanBefore} day{entry.daysCleanBefore !== 1 ? "s" : ""} before reset
                    </div>
                  )}
                  <div style={S.pastText}>{entry.text}</div>
                </div>
              );
            })}
        </>
      )}

      {/* Trigger Pattern Analysis */}
      <SmartInsights triggerMap={getTriggerMap(state)} />

      {/* Premium upsell for free users */}
      {!hasUnlimitedForge && (
        <div style={forgeUpgradeBanner} onClick={() => setShowUpgrade(true)}>
          <span style={{ fontSize: 16 }}>👑</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>Unlimited Trackers</div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>Premium lets you track all habits at once</div>
          </div>
          <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        </div>
      )}
    </div>
  );
}

const forgeUpgradeBanner = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: "16px 14px 0",
  padding: "12px 14px",
  borderRadius: 12,
  background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.04))",
  border: "1px solid rgba(255,215,0,0.12)",
  cursor: "pointer",
};

const forgeTipCard = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  lineHeight: 1.4,
};
