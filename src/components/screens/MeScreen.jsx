import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight, RotateCcw, Shield, Trophy,
  Download, LogOut, Flame, Award,
  Sparkles, Star, LogIn, TrendingUp, Settings, Crown,
  Volume2, VolumeX, PlayCircle,
} from "lucide-react";
import { getSoundsEnabled, setSoundsEnabled, feedback } from "../../utils/audio";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, daysBetween, getLevelIndex } from "../../utils";
import { LEVELS, MOTIVATION_CARDS } from "../../data/constants";
import { TROPHIES } from "../../data/trophies";
import { CATEGORIES } from "../../data/categories";
import { renderAnimalAvatar } from "../shared/AnimalAvatars";
import { getCharacterStats, getCharacterTier, STAT_META } from "../../utils/character";
import { useAuth } from "../../hooks/useAuth";
import YearInPixels from "../shared/YearInPixels";
import PatternInsights from "../shared/PatternInsights";

const TROPHY_SECTIONS = [
  { id: "streaks",   label: "Streaks",       icon: "🔥", cats: ["all"] },
  { id: "domains",   label: "Domains",       icon: "🎯", cats: ["sleep","water","exercise","mind","screen","shower","nutrition","reading"] },
  { id: "training",  label: "Training",      icon: "💪", cats: ["dojo","exercise"] },
  { id: "learning",  label: "Learning",      icon: "📚", cats: ["academy","reading"] },
  { id: "discipline",label: "Discipline",    icon: "⚔️", cats: ["all","streak"] },
];

export default function MeScreen({ state, save, user, onOpenPanel }) {
  const { logout } = useAuth();
  const today = getTodayStr();
  const [soundsOn, setSoundsOn] = useState(() => getSoundsEnabled());

  function toggleSounds() {
    const next = !soundsOn;
    setSoundsEnabled(next);
    setSoundsOn(next);
    if (next) feedback("questCheck");
  }
  const totalCompleted = Object.keys(state.completedQuests || {}).filter(k => (state.completedQuests[k]?.length || 0) > 0).length;
  const [expandedTrophy, setExpandedTrophy] = useState({});
  const [showAllTrophies, setShowAllTrophies] = useState(false);
  const [showYearInPixels, setShowYearInPixels] = useState(false);

  const levelIdx = getLevelIndex(state.xp || 0);
  const level = LEVELS[levelIdx];
  const nextLevel = LEVELS[levelIdx + 1];
  const xpInLevel = (state.xp || 0) - level.xpReq;
  const xpForNext = nextLevel ? nextLevel.xpReq - level.xpReq : 1;
  const levelProgress = nextLevel ? Math.min(xpInLevel / xpForNext, 1) : 1;

  const stats = useMemo(() => getCharacterStats(state), [state]);
  const tier = useMemo(() => getCharacterTier(stats), [stats]);
  const maxStat = Math.max(50, ...Object.values(stats));

  const coursesDone = useMemo(() => {
    return Object.values(state.courseProgress || {}).filter((p) => p?.completed).length;
  }, [state.courseProgress]);

  const totalWorkouts = useMemo(() => {
    return Object.values(state.workoutLogs || {}).reduce(
      (sum, day) => sum + (Array.isArray(day) ? day.length : 1), 0
    );
  }, [state.workoutLogs]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.values(state.workoutLogs || {}).forEach((entries) => {
      const list = Array.isArray(entries) ? entries : [entries];
      list.forEach((entry) => {
        (entry.sets || entry.exercises || []).forEach((s) => {
          if (s.weight && s.reps) vol += s.weight * s.reps;
          if (s.sets) s.sets.forEach((set) => {
            if (set.weight && set.reps) vol += set.weight * set.reps;
          });
        });
      });
    });
    return vol;
  }, [state.workoutLogs]);

  const trophyCount = Object.keys(state.unlockedTrophies || {}).length;
  const lifetimeQuests = useMemo(() => {
    return Object.values(state.completedQuests || {}).reduce(
      (sum, ids) => sum + (Array.isArray(ids) ? ids.length : 0), 0
    );
  }, [state.completedQuests]);

  function handleExport() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-os-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (window.confirm("This will erase ALL your data permanently. Are you sure?")) {
      localStorage.removeItem("life-os-state");
      window.location.reload();
    }
  }

  function handleSignOut() {
    if (window.confirm("Sign out? Your data stays on this device.")) {
      logout().catch(() => {});
    }
  }

  // Visual character evolution: tier-based avatar treatments
  const tierGlow = `0 0 0 4px ${tier.color}30, 0 8px 24px ${tier.color}40`;

  return (
    <div style={styles.screen}>
      {/* HERO — visual character evolution by tier */}
      <motion.section
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          ...styles.hero,
          background: `linear-gradient(135deg, ${tier.color}14 0%, ${tier.color}04 100%)`,
          borderColor: `${tier.color}30`,
        }}
      >
        <button onClick={() => onOpenPanel("avatar")} style={styles.avatarBtn}>
          <div style={{
            ...styles.avatarCircle,
            boxShadow: tier.tier >= 2 ? tierGlow : "none",
            border: tier.tier >= 4 ? `3px solid ${tier.color}` : `2px solid ${tier.color}40`,
          }}>
            {state.avatar
              ? renderAnimalAvatar(state.avatar, 72)
              : <span style={{ fontSize: 56 }}>{tier.emoji}</span>}
            <div style={{ ...styles.levelBadge, background: tier.color }}>Lv.{levelIdx + 1}</div>
          </div>
        </button>
        <div style={styles.identity}>
          <div style={styles.displayName}>
            {state.userName || user?.displayName || "Warrior"}
          </div>
          <div style={styles.heroLevelRow}>
            <span style={styles.heroLevelLabel}>Lv.{levelIdx + 1}</span>
            <span style={styles.heroLevelName}>{level.name}</span>
            {tier.tier >= 3 && <Crown size={12} color={tier.color} />}
          </div>
        </div>
      </motion.section>

      {/* XP bar */}
      <div style={styles.xpSection}>
        <div style={styles.xpRow}>
          <span style={styles.xpLabel}>{state.xp || 0} XP</span>
          <span style={styles.xpNext}>{nextLevel ? `${nextLevel.xpReq} XP` : "Max"}</span>
        </div>
        <div style={styles.xpBarOuter}>
          <div style={{ ...styles.xpBarInner, width: `${levelProgress * 100}%`, background: `linear-gradient(90deg, ${tier.color} 0%, ${tier.color}80 100%)` }} />
        </div>
      </div>

      {/* CHARACTER STATS — embedded mini radar/bars */}
      <button onClick={() => onOpenPanel("character")} style={styles.sectionBtn}>
        <div style={styles.sectionBtnHeader}>
          <Sparkles size={14} color="#7C5CFC" />
          <span style={styles.sectionBtnLabel}>CHARACTER STATS</span>
          <span style={styles.tierChip} title={tier.next ? `${tier.next.min - tier.total} pts to ${tier.next.label}` : "Max tier"}>
            <span>{tier.emoji}</span>
            <span style={{ color: tier.color }}>{tier.label}</span>
            <span style={{ color: TOKENS.color.textTertiary }}>· {tier.total}</span>
          </span>
          <ChevronRight size={14} color={TOKENS.color.textTertiary} />
        </div>
        <div style={styles.miniStats}>
          {Object.entries(STAT_META).map(([key, meta]) => {
            const v = stats[key];
            const pct = Math.min(v / maxStat, 1) * 100;
            return (
              <div key={key} style={styles.miniStatItem}>
                <div style={styles.miniStatHead}>
                  <span style={{ fontSize: 12 }}>{meta.icon}</span>
                  <span style={styles.miniStatLabel}>{meta.label.slice(0, 3).toUpperCase()}</span>
                  <span style={{ ...styles.miniStatValue, color: meta.color }}>{v}</span>
                </div>
                <div style={styles.miniStatBar}>
                  <div style={{ ...styles.miniStatFill, width: `${pct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </button>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard label="Streak" value={state.streak || 0} icon={<Flame size={14} color="#F97316" />} />
        <StatCard label="Best" value={state.bestStreak || 0} />
        <StatCard label="Days" value={totalCompleted} />
        <StatCard label="Quests" value={lifetimeQuests} />
        <StatCard label="Workouts" value={totalWorkouts} />
        <StatCard label="Courses" value={coursesDone} />
        <StatCard label="Volume" value={totalVolume > 1000 ? `${Math.round(totalVolume / 1000)}k` : totalVolume} suffix="kg" />
        <StatCard label="Trophies" value={trophyCount} />
        <StatCard label="Lifting" value={state.liftingStreak || 0} />
      </div>

      {/* Forge summary */}
      {Object.keys(state.sobrietyDates || {}).length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Forge streaks</div>
          {Object.entries(state.sobrietyDates).map(([id, startDate]) => {
            const days = daysBetween(startDate);
            return (
              <div key={id} style={styles.infoRow}>
                <Shield size={14} color="#F97316" />
                <span style={{ ...styles.infoLabel, textTransform: "capitalize" }}>{id.replace(/_/g, " ")}</span>
                <span style={{ ...styles.infoValue, color: "#F97316" }}>{days}d</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Trophies section — restored grouping */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Trophies · {trophyCount}/{TROPHIES.length}</div>
        {TROPHY_SECTIONS.map((sec) => {
          const sectionTrophies = TROPHIES.filter((t) =>
            sec.cats.includes(t.category) ||
            (sec.id === "domains" && CATEGORIES.find((c) => c.id === t.category)) ||
            (sec.id === "training" && (t.category === "exercise" || t.id?.includes("rep") || t.id?.includes("workout"))) ||
            (sec.id === "learning" && (t.category === "reading" || t.id?.includes("lesson") || t.id?.includes("scholar") || t.id?.includes("professor")))
          );
          if (sectionTrophies.length === 0) return null;
          const unlocked = sectionTrophies.filter((t) => state.unlockedTrophies?.[t.id]).length;
          const isExpanded = expandedTrophy[sec.id];
          const pct = (unlocked / sectionTrophies.length) * 100;

          return (
            <div key={sec.id} style={styles.trophySection}>
              <button
                onClick={() => setExpandedTrophy((p) => ({ ...p, [sec.id]: !p[sec.id] }))}
                style={styles.trophySectionHeader}
              >
                <span style={{ fontSize: 18 }}>{sec.icon}</span>
                <span style={styles.trophySectionLabel}>{sec.label}</span>
                <span style={{ ...styles.trophySectionMeta, color: unlocked === sectionTrophies.length ? TOKENS.color.success : TOKENS.color.textTertiary }}>
                  {unlocked}/{sectionTrophies.length}
                </span>
                <ChevronRight size={14} color={TOKENS.color.textTertiary} style={{ transform: isExpanded ? "rotate(90deg)" : "none" }} />
              </button>
              <div style={styles.trophySectionBar}>
                <div style={{ ...styles.trophySectionFill, width: `${pct}%`, background: unlocked === sectionTrophies.length ? TOKENS.color.success : "#7C5CFC" }} />
              </div>
              {isExpanded && (
                <div style={styles.trophyGrid}>
                  {sectionTrophies.map((t) => {
                    const isUnlocked = !!state.unlockedTrophies?.[t.id];
                    return (
                      <div key={t.id} style={{
                        ...styles.trophyItem,
                        opacity: isUnlocked ? 1 : 0.4,
                        filter: isUnlocked ? "none" : "grayscale(60%)",
                      }}>
                        <span style={{ fontSize: 24 }}>{t.icon}</span>
                        <div style={styles.trophyName}>{t.name}</div>
                        <div style={styles.trophyDesc}>{t.desc}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress / Year in Pixels */}
      <div style={styles.section}>
        <button onClick={() => setShowYearInPixels(!showYearInPixels)} style={styles.expandRow}>
          <TrendingUp size={14} color="#22C55E" />
          <span style={styles.sectionLabel}>Year in Pixels</span>
          <ChevronRight size={14} color={TOKENS.color.textTertiary} style={{ transform: showYearInPixels ? "rotate(90deg)" : "none" }} />
        </button>
        {showYearInPixels && (
          <div style={styles.expandBody}>
            <YearInPixels state={state} />
            <button onClick={() => onOpenPanel("progress")} style={styles.deepLinkBtn}>
              See full analytics →
            </button>
          </div>
        )}
      </div>

      {/* Pattern Insights */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Pattern Insights</div>
        <PatternInsights state={state} />
      </div>

      {/* Feature links */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Features</div>
        <button onClick={() => onOpenPanel?.("cards")} style={styles.linkRow}>
          <Star size={16} color="#FBBF24" />
          <span style={styles.linkLabel}>Card Collection</span>
          <span style={styles.badge}>{Object.keys(state.collectedCards || {}).length}/{MOTIVATION_CARDS.length}</span>
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
        <button onClick={() => onOpenPanel?.("leaderboard")} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
          <Award size={16} color="#3B82F6" />
          <span style={styles.linkLabel}>Leaderboard</span>
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
        <button onClick={() => onOpenPanel?.("custom-quests")} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
          <Sparkles size={16} color="#7C5CFC" />
          <span style={styles.linkLabel}>Custom Quests</span>
          {(state.customQuests || []).length > 0 && (
            <span style={styles.badge}>{(state.customQuests || []).length}</span>
          )}
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
      </div>

      {/* Settings */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Settings</div>
        <button onClick={toggleSounds} style={styles.linkRow}>
          {soundsOn
            ? <Volume2 size={16} color={TOKENS.color.text} />
            : <VolumeX size={16} color={TOKENS.color.textTertiary} />}
          <span style={styles.linkLabel}>
            Sounds {soundsOn ? "on" : "off"}
          </span>
          <div style={{
            ...styles.toggleSwitch,
            background: soundsOn ? "#22C55E" : TOKENS.color.border,
          }}>
            <div style={{
              ...styles.toggleKnob,
              transform: soundsOn ? "translateX(16px)" : "translateX(0)",
            }} />
          </div>
        </button>
        <button onClick={() => save({ ...state, onboarded: false, _replayTour: true })} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
          <PlayCircle size={16} color="#7C5CFC" />
          <span style={{ ...styles.linkLabel, color: "#7C5CFC" }}>Replay welcome tour</span>
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
        <button onClick={handleExport} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
          <Download size={16} color={TOKENS.color.text} />
          <span style={styles.linkLabel}>Export data</span>
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
        {user ? (
          <button onClick={handleSignOut} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
            <LogOut size={16} color={TOKENS.color.textSecondary} />
            <span style={{ ...styles.linkLabel, color: TOKENS.color.textSecondary }}>
              Sign out ({user.email || user.displayName})
            </span>
            <ChevronRight size={16} color={TOKENS.color.textTertiary} />
          </button>
        ) : (
          <button onClick={() => save({ ...state, wantsAuth: true })} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
            <LogIn size={16} color={TOKENS.color.brand} />
            <span style={{ ...styles.linkLabel, color: TOKENS.color.brand }}>Sign in / Link account</span>
            <ChevronRight size={16} color={TOKENS.color.textTertiary} />
          </button>
        )}
        <button onClick={handleReset} style={{ ...styles.linkRow, marginTop: TOKENS.space[2] }}>
          <RotateCcw size={16} color={TOKENS.color.danger} />
          <span style={{ ...styles.linkLabel, color: TOKENS.color.danger }}>Reset all data</span>
          <ChevronRight size={16} color={TOKENS.color.textTertiary} />
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
        {value}
        {suffix && <span style={styles.statSuffix}> {suffix}</span>}
      </div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  screen: { padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px ${TOKENS.space[5]}px` },
  hero: {
    display: "flex", alignItems: "center", gap: TOKENS.space[5],
    padding: TOKENS.space[5],
    borderRadius: TOKENS.radius.lg,
    border: "1px solid",
    marginBottom: TOKENS.space[4],
  },
  avatarBtn: { background: "none", border: "none", padding: 0, cursor: "pointer" },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    background: TOKENS.color.surfaceElevated,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
    transition: TOKENS.transition.normal,
  },
  levelBadge: {
    position: "absolute", bottom: -4, right: -4,
    fontSize: 10, fontWeight: 900, color: "#fff",
    padding: "3px 8px", borderRadius: TOKENS.radius.full,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  identity: { flex: 1, minWidth: 0 },
  displayName: {
    fontSize: TOKENS.font.size.xl, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, letterSpacing: -0.3,
  },
  heroLevelRow: {
    display: "flex", alignItems: "center", gap: 6,
    marginTop: 4,
  },
  heroLevelLabel: {
    fontSize: 10, fontWeight: 900, color: "#fff",
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    padding: "2px 8px", borderRadius: TOKENS.radius.full,
    letterSpacing: 0.4,
  },
  heroLevelName: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text, letterSpacing: 0.2,
  },
  tierChip: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 700, letterSpacing: 0.2,
  },
  xpSection: { marginBottom: TOKENS.space[6] },
  xpRow: { display: "flex", justifyContent: "space-between", marginBottom: TOKENS.space[2] },
  xpLabel: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text },
  xpNext: { fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary, fontWeight: TOKENS.font.weight.semibold },
  xpBarOuter: { height: 8, background: TOKENS.color.border, borderRadius: 4, overflow: "hidden" },
  xpBarInner: { height: "100%", minWidth: 6, borderRadius: 4, transition: "width 0.4s ease" },
  sectionBtn: {
    width: "100%", padding: TOKENS.space[4],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    border: "none", cursor: "pointer", textAlign: "left",
    marginBottom: TOKENS.space[5],
  },
  sectionBtnHeader: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: TOKENS.space[3],
  },
  sectionBtnLabel: {
    flex: 1, fontSize: 10, fontWeight: 900,
    color: TOKENS.color.textTertiary, letterSpacing: 0.8,
  },
  sectionBtnMeta: { fontSize: TOKENS.font.size.sm, fontWeight: 900 },
  miniStats: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: TOKENS.space[3] },
  miniStatItem: {},
  miniStatHead: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  miniStatLabel: { fontSize: 9, fontWeight: 900, color: TOKENS.color.textTertiary, letterSpacing: 0.4 },
  miniStatValue: { fontSize: TOKENS.font.size.sm, fontWeight: 900 },
  miniStatBar: { height: 3, background: TOKENS.color.border, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  miniStatFill: { height: "100%" },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: TOKENS.space[3], marginBottom: TOKENS.space[6],
  },
  statCard: {
    padding: TOKENS.space[3],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
    textAlign: "center",
  },
  statValue: {
    fontSize: TOKENS.font.size.lg, fontWeight: 900,
    color: TOKENS.color.text, display: "inline-flex", alignItems: "center",
  },
  statSuffix: { fontSize: 10, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.textTertiary, marginLeft: 2 },
  statLabel: {
    fontSize: 10, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary, marginTop: 2, letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  section: { marginBottom: TOKENS.space[6] },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: TOKENS.space[3],
    flex: 1,
  },
  infoRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px 0`,
    borderBottom: `1px solid ${TOKENS.color.border}`,
  },
  infoLabel: { flex: 1, fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.medium, color: TOKENS.color.text },
  infoValue: { fontSize: TOKENS.font.size.sm, fontWeight: 900 },
  trophySection: { marginBottom: TOKENS.space[3] },
  trophySectionHeader: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[3]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
    border: "none", cursor: "pointer", width: "100%",
  },
  trophySectionLabel: { flex: 1, fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text, textAlign: "left" },
  trophySectionMeta: { fontSize: TOKENS.font.size.xs, fontWeight: 900 },
  trophySectionBar: { height: 2, background: TOKENS.color.border, borderRadius: 1, overflow: "hidden", marginTop: 2, marginLeft: 8, marginRight: 8 },
  trophySectionFill: { height: "100%", transition: "width 0.4s ease" },
  trophyGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: TOKENS.space[3], padding: TOKENS.space[3], marginTop: TOKENS.space[2],
  },
  trophyItem: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, padding: TOKENS.space[3],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
    transition: TOKENS.transition.fast, textAlign: "center",
  },
  trophyName: { fontSize: 10, fontWeight: 900, color: TOKENS.color.text, marginTop: 2 },
  trophyDesc: { fontSize: 9, color: TOKENS.color.textTertiary, lineHeight: 1.3 },
  expandRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px 0`,
    background: "none", border: "none", cursor: "pointer", width: "100%",
  },
  expandBody: { marginTop: TOKENS.space[3] },
  deepLinkBtn: {
    width: "100%", padding: TOKENS.space[3],
    background: "none", border: "none", cursor: "pointer",
    color: TOKENS.color.brand, fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold, marginTop: TOKENS.space[3],
  },
  linkRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    width: "100%", padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
    border: "none", cursor: "pointer", textAlign: "left",
  },
  linkLabel: { flex: 1, fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text },
  badge: {
    fontSize: 10, fontWeight: 900, color: TOKENS.color.textTertiary,
    background: TOKENS.color.border, padding: "2px 8px",
    borderRadius: TOKENS.radius.full,
  },
  toggleSwitch: {
    width: 36, height: 20, borderRadius: 10,
    padding: 2, transition: "background 0.2s ease",
    flexShrink: 0,
  },
  toggleKnob: {
    width: 16, height: 16, borderRadius: 8,
    background: "#fff",
    transition: "transform 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
};
