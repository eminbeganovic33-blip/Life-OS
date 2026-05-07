import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/theme";
import { TROPHIES } from "../../data";
import { getTrophyTierColor } from "../../data/trophies";
import { getTotalVolume, getLevel, getNextLevel, getLevelIndex, isPrestigeReady, dateToLocalDayKey } from "../../utils";
import { getArc } from "../../utils/arcs";
import { usePremium } from "../../hooks/usePremium";
import { useTheme } from "../../hooks/useTheme";
import AvatarPicker from "../AvatarPicker";
import { renderAnimalAvatar } from "../AnimalAvatars";
import { Flame, Calendar, CheckCircle, Pencil, Swords, Users, Star, ChevronLeft, ChevronRight, Flag, Zap, Trophy, Target, Crown, Sparkles } from "lucide-react";

const T = TOKENS;

export default function ProfileView({ state, save, user, onReset, onOpenNotifications, onOpenStake, onNavigate }) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  // H5: Collapse all trophy sections on Day 1–7 (user has earned very few trophies)
  const [expandedTrophySections, setExpandedTrophySections] = useState(
    () => state.currentDay >= 7 ? { milestone: true } : {}
  );
  const toggleTrophySection = useCallback((id) => {
    setExpandedTrophySections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const { isPremium, isPremiumActive, isTrialActive, trialDaysRemaining, premiumUntil, plan, setShowUpgrade } = usePremium();
  const { theme, colors } = useTheme();

  const isDark = theme === "dark";
  const totalVolume = getTotalVolume(state.workoutLogs);
  const workoutCount = Object.values(state.workoutLogs || {}).reduce((a, b) => a + b.length, 0);
  const day = state.currentDay;

  const level = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const xpProgress = nextLevel ? (state.xp - level.xpReq) / (nextLevel.xpReq - level.xpReq) : 1;

  const unlockedTrophyCount = Object.keys(state.unlockedTrophies || {}).length;
  const totalTrophies = TROPHIES.length;

  // Compute progress for each trophy
  const trophyProgress = useMemo(() => {
    const catCounts = {};
    Object.entries(state.completedQuests || {}).forEach(([, qIds]) => {
      qIds.forEach((qid) => {
        const cat = qid.split("-")[0];
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
    });
    const totalCompletedDays = Object.keys(state.completedDays || {}).length;
    const completedCourses = Object.values(state.courseProgress || {}).filter((p) => p.completed).length;
    const recoveryCount = (state.recoveryJournals || []).length;

    const progress = {};
    TROPHIES.forEach((t) => {
      if (state.unlockedTrophies?.[t.id]) { progress[t.id] = 1; return; }
      let current = 0, target = 1;
      if (t.daysReq && t.category === "all") { current = totalCompletedDays; target = t.daysReq; }
      else if (t.daysReq) { current = catCounts[t.category] || 0; target = t.daysReq; }
      else if (t.dayReq) { current = state.currentDay; target = t.dayReq; }
      else if (t.countReq && t.category === "dojo") { current = workoutCount; target = t.countReq; }
      else if (t.countReq && t.category === "academy") { current = completedCourses; target = t.countReq; }
      else if (t.countReq && t.category === "forge") { current = recoveryCount; target = t.countReq; }
      else if (t.volumeReq) { current = totalVolume; target = t.volumeReq; }
      progress[t.id] = Math.min(current / target, 1);
    });
    return progress;
  }, [state]);

  const displayName = (user && user.displayName) || state.userName || "Warrior";
  const displayEmail = user ? user.email : null;
  const avatarLetter = displayName[0].toUpperCase();
  const avatar = state.avatar; // { type: "letter"|"animal"|"photo", value: ... }

  const handleAvatarSave = (newAvatar) => {
    save({ ...state, avatar: newAvatar });
  };

  const prestige = state.prestige || 0;
  const canPrestige = isPrestigeReady(state.xp);
  const [confirmPrestige, setConfirmPrestige] = useState(false);

  const handlePrestige = () => {
    const today = dateToLocalDayKey(new Date());
    const newPrestige = prestige + 1;
    save({
      ...state,
      xp: 0,                         // level resets so the climb feels meaningful again
      lifetimeXp: state.lifetimeXp || state.xp, // never resets — true career total
      prestigeXpBonus: (state.prestigeXpBonus || 0) + Math.round(state.xp * 0.1), // 10% of peak XP banked
      prestige: newPrestige,
      prestigeHistory: [...(state.prestigeHistory || []), { date: today, atStreak: state.streak, xpAtPrestige: state.xp }],
    });
    setConfirmPrestige(false);
    playSound("levelUp");
  };

  return (
    <div style={{ paddingTop: T.space.md, paddingBottom: 80 }}>

      {/* ── Hero Identity Card ── */}
      <div style={heroCard}>
        {/* Avatar — tap to change */}
        <div style={{ ...avatarWrap, cursor: "pointer" }} onClick={() => setShowAvatarPicker(true)}>
          {avatar?.type === "photo" ? (
            <img src={avatar.value} alt="" style={avatarImg} />
          ) : avatar?.type === "animal" ? (
            <div style={avatarAnimal}>{renderAnimalAvatar(avatar.value, 58)}</div>
          ) : user?.photoURL ? (
            <img src={user.photoURL} alt="" style={avatarImg} />
          ) : (
            <div style={avatarCircle}>{avatarLetter}</div>
          )}
          <div style={levelDot}>Lv.{levelIdx + 1}</div>
          <div style={editBadge}><Pencil size={10} /></div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={heroName}>{displayName}</div>
          {displayEmail && <div style={{ ...heroEmail, color: colors.textSecondary }}>{displayEmail}</div>}
          <div style={levelRow}>
            <span style={levelPill}>{level.name}</span>
            {prestige > 0 && (
              <span style={prestigePill} aria-label={`Prestige ${prestige}`}>
                <Crown size={11} style={{ verticalAlign: -1 }} /> ×{prestige}
              </span>
            )}
            {state.streak > 0 && (
              <span style={streakPill}><Flame size={12} style={{ verticalAlign: -1 }} /> {state.streak} day streak</span>
            )}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div style={xpSection}>
        <div style={xpTop}>
          <span style={xpLabel}>{state.xp} XP</span>
          <span style={{ ...xpNext, color: colors.textSecondary }}>{nextLevel ? `${nextLevel.xpReq - state.xp} to ${nextLevel.name}` : "Max level"}</span>
        </div>
        <div style={{ ...xpTrack, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)" }}>
          <motion.div
            style={xpFill}
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(xpProgress * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Prestige action — only when at max level */}
      {canPrestige && (
        <div style={prestigeCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Crown size={28} color="#FACC15" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: T.font.md, fontWeight: T.weight.heavy, color: "#FACC15" }}>
                Ready to Prestige
              </div>
              <div style={{ fontSize: T.font.xs, opacity: 0.65, marginTop: 2, lineHeight: 1.5 }}>
                Your level resets so the climb feels meaningful again.{" "}
                <strong style={{ color: "#FACC15" }}>10% of your XP ({Math.round((state.xp || 0) * 0.1).toLocaleString()} XP)</strong>{" "}
                is banked permanently. Crown added. Streak and trophies stay.
              </div>
            </div>
          </div>
          {!confirmPrestige ? (
            <button style={prestigeBtn} onClick={() => setConfirmPrestige(true)}>
              Prestige
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={prestigeBtnConfirm} onClick={handlePrestige}>Confirm Prestige</button>
              <button style={prestigeBtnCancel} onClick={() => setConfirmPrestige(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* ── Primary Stats ── */}
      <div style={primaryStats}>
        <StatBig value={state.streak} label="Streak" color="#F97316" icon={<Flame size={22} color="#F97316" />} />
        <StatBig value={day} label="Day" color="#7C5CFC" icon={<Calendar size={22} color="#7C5CFC" />} />
        <StatBig value={Object.keys(state.completedDays).length} label="Done" color="#22C55E" icon={<CheckCircle size={22} color="#22C55E" />} />
      </div>

      {/* ── Secondary Stats Grid ── */}
      <div style={secGrid}>
        {[
          { v: workoutCount, l: "Workouts" },
          { v: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k kg` : `${Math.round(totalVolume)} kg`, l: "Vol. Moved" },
          { v: Object.values(state.courseProgress || {}).filter(p => p.completed).length, l: "Courses" },
          { v: state.bestStreak, l: "Best Streak" },
          { v: unlockedTrophyCount, l: "Trophies" },
          { v: state.liftingStreak || 0, l: "Lift Streak" },
        ].map((s, i) => (
          <div key={i} style={{
            ...secStat,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}>
            <div style={{ ...secStatVal, color: colors.text }}>{s.v}</div>
            <div style={{ ...secStatLbl, color: colors.textSecondary }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Next Trophies ── */}
      {(() => {
        const nextTrophies = TROPHIES
          .filter((t) => !state.unlockedTrophies?.[t.id] && (trophyProgress[t.id] || 0) > 0)
          .sort((a, b) => (trophyProgress[b.id] || 0) - (trophyProgress[a.id] || 0))
          .slice(0, 3);
        if (nextTrophies.length === 0) return null;
        return (
          <>
            <SectionHeader title="Chase These Next" sub="Your closest trophies" />
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              {nextTrophies.map((t, i) => {
                const prog = trophyProgress[t.id] || 0;
                const tier = getTrophyTierColor(t.tier);
                return (
                  <motion.div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: `${tier.bg}`,
                      border: `1px solid ${tier.border}`,
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {t.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: colors.text }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.7, marginBottom: 5, lineHeight: 1.3 }}>{t.desc}</div>
                      <div style={{ height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
                        <motion.div
                          style={{ height: "100%", borderRadius: 2, background: tier.text || "#7C5CFC" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(prog * 100)}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08 }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: tier.text || "#7C5CFC", flexShrink: 0, minWidth: 36, textAlign: "right" }}>
                      {Math.round(prog * 100)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* ── Trophy Room ── */}
      <SectionHeader title="Trophy Room" sub={`${unlockedTrophyCount} / ${totalTrophies} unlocked`} />
      {/* Overall progress bar */}
      <div style={trophyProgressWrap}>
        <div style={trophyProgressTrack}>
          <motion.div
            style={{ ...trophyProgressFill, width: `${(unlockedTrophyCount / totalTrophies) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedTrophyCount / totalTrophies) * 100}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Organized Trophy Sections */}
      {[
        { id: "milestone", label: "Milestones", icon: "🏁", cats: ["milestone"] },
        { id: "consistency", label: "Consistency", icon: "⚡", cats: ["all"] },
        { id: "habits", label: "Category Habits", icon: "🌿", cats: ["water","sleep","mind","shower","screen","exercise","nutrition","reading"] },
        { id: "dojo", label: "Dojo", icon: "⚔️", cats: ["dojo"] },
        { id: "academy", label: "Academy", icon: "📚", cats: ["academy"] },
        { id: "forge", label: "Forge", icon: "🔥", cats: ["forge"] },
      ].map((section) => {
        const sectionTrophies = TROPHIES.filter(t => section.cats.includes(t.category));
        const sectionUnlocked = sectionTrophies.filter(t => !!state.unlockedTrophies?.[t.id]).length;
        const isOpen = !!expandedTrophySections[section.id];
        return (
          <div key={section.id} style={{ marginBottom: 8, marginLeft: T.space.md, marginRight: T.space.md }}>
            <button
              onClick={() => toggleTrophySection(section.id)}
              aria-expanded={isOpen}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                borderRadius: isOpen ? "12px 12px 0 0" : 12,
                padding: "11px 14px", cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <span style={{ flex: 1, fontSize: T.font.sm, fontWeight: T.weight.bold, color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)" }}>
                {section.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: sectionUnlocked === sectionTrophies.length ? "#22C55E" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                marginRight: 8,
              }}>
                {sectionUnlocked}/{sectionTrophies.length}
              </span>
              <ChevronRight size={16} color={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
                style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
                    padding: "10px 10px 12px",
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                    borderTop: "none", borderRadius: "0 0 12px 12px",
                  }}>
                    {sectionTrophies.map((t) => {
                      const unlocked = !!state.unlockedTrophies?.[t.id];
                      const prog = trophyProgress[t.id] || 0;
                      const tier = getTrophyTierColor(t.tier);
                      return (
                        <div key={t.id} style={{
                          ...trophyCard,
                          ...(unlocked ? trophyUnlocked : trophyLocked),
                          position: "relative",
                        }}>
                          {t.tier && (
                            <span style={{
                              position: "absolute", top: 6, right: 6,
                              fontSize: 9, fontWeight: 700, lineHeight: 1,
                              color: tier.text, background: tier.bg,
                              borderWidth: 1, borderStyle: "solid", borderColor: tier.border,
                              borderRadius: 4, padding: "2px 4px",
                            }}>{tier.label}</span>
                          )}
                          <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)", marginBottom: 4 }}>{t.icon}</div>
                          <div style={{ fontSize: T.font.xs, fontWeight: T.weight.bold, textAlign: "center", lineHeight: 1.2 }}>{t.name}</div>
                          <div style={{ fontSize: 10, opacity: unlocked ? 0.7 : 0.3, textAlign: "center", marginTop: 2 }}>
                            {unlocked ? `+${t.xpReward} XP` : t.desc}
                          </div>
                          {!unlocked && prog > 0 && (
                            <div style={trophyProgWrap}>
                              <div style={{ ...trophyProgBar, width: `${prog * 100}%` }} />
                              <span style={trophyProgLabel}>{Math.round(prog * 100)}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* ── The Stake ── */}
      <StakeCard state={state} onEdit={onOpenStake} isDark={isDark} colors={colors} />

      {/* ── Journey Calendar (merged journey map + streak calendar) ── */}
      <SectionHeader
        title="Journey Calendar"
        sub={day > 66 ? `Mastery Mode · ${Object.keys(state.completedDays).length} days` : `Day ${day} of 66 · ${Object.keys(state.completedDays).length} completed`}
      />
      <JourneyCalendar state={state} isDark={isDark} />

      {/* ── Milestones ── */}
      <SectionHeader title="Milestones" sub={day > 66 ? "Journey complete" : "Your path"} />
      <MilestonesTimeline state={state} day={day} isDark={isDark} colors={colors} />

      {/* ── Settings shortcut ── */}
      <div style={{ margin: `${T.space.xl}px ${T.space.lg}px 0` }}>
        {/* Community */}
        <div
          style={{ ...settingsSection, overflow: "visible", marginBottom: 8 }}
        >
          <div style={{ ...settingsRow, cursor: "pointer", borderBottom: "none" }} onClick={() => onNavigate?.("social")}>
            <div style={settingsRowLeft}>
              <span style={{ display: "flex", alignItems: "center" }}><Users size={20} /></span>
              <div>
                <div style={settingsRowTitle}>Community</div>
                <div style={settingsRowSub}>Leaderboard, friends &amp; challenges</div>
              </div>
            </div>
            <span style={settingsChevron}>›</span>
          </div>
        </div>

        {/* Settings */}
        <div style={settingsSection}>
          <div
            style={{ ...settingsRow, cursor: "pointer", borderBottom: "none" }}
            onClick={() => onNavigate?.("settings")}
          >
            <div style={settingsRowLeft}>
              <span style={{ display: "flex", alignItems: "center", fontSize: 20 }}>⚙️</span>
              <div>
                <div style={settingsRowTitle}>Settings</div>
                <div style={settingsRowSub}>Appearance, notifications, AI coach &amp; more</div>
              </div>
            </div>
            <span style={settingsChevron}>›</span>
          </div>
        </div>
      </div>

      {/* ── Premium / Subscription ── */}
      {!isPremium && (
        <div style={premiumBanner} onClick={() => setShowUpgrade(true)}>
          <div style={{ display: "flex", alignItems: "center", gap: T.space.md }}>
            <span style={{ display: "flex", alignItems: "center" }}><Star size={24} color="#FFD700" /></span>
            <div>
              <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold, color: "#FFD700" }}>Upgrade to Premium</div>
              <div style={{ fontSize: T.font.xs, opacity: 0.55, marginTop: 2 }}>Unlock AI coaching, unlimited custom quests & more</div>
            </div>
          </div>
          <span style={{ fontSize: T.font.sm, color: "#FFD700", fontWeight: T.weight.bold, flexShrink: 0 }}>Upgrade →</span>
        </div>
      )}
      {isPremium && (
        <div style={subscriptionCard}>
          <div style={subStatusRow}>
            <div style={{ display: "flex", alignItems: "center", gap: T.space.md }}>
              <span style={subCrown}>👑</span>
              <div>
                <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold, color: "#FFD700" }}>
                  {isTrialActive ? "Free Trial Active" : "Premium Member"}
                </div>
                <div style={{ fontSize: T.font.xs, opacity: 0.6, marginTop: 2 }}>
                  {isTrialActive
                    ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} remaining`
                    : plan === "yearly"
                      ? "Yearly plan"
                      : plan === "monthly"
                        ? "Monthly plan"
                        : "Active"}
                </div>
              </div>
            </div>
            <span style={subStatusPill}>Active</span>
          </div>
          {isPremiumActive && premiumUntil && (
            <div style={subRenewRow}>
              Renews {new Date(premiumUntil).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </div>
          )}
          {isTrialActive && trialDaysRemaining <= 3 && (
            <div style={subTrialWarning}>
              Your trial ends soon. Upgrade now to keep your premium features.
            </div>
          )}
          <button style={subManageBtn} onClick={() => setShowUpgrade(true)}>
            {isTrialActive ? "Upgrade to keep Premium" : "Manage subscription"}
          </button>
        </div>
      )}

      {/* Avatar Picker Sheet */}
      <AvatarPicker
        open={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        currentAvatar={avatar}
        onSave={handleAvatarSave}
      />

      {/* ── Share Card ── */}
      <SectionHeader title="Share Your Progress" />
      <ShareCard state={state} displayName={displayName} level={level} levelIdx={levelIdx} />

    </div>
  );
}

// ── Share Card (Statement design) ─────────────────────────────────────────────

/**
 * Returns a two-line "statement" that captures the user's current moment.
 * Line 1 = assertion (bold sans).
 * Line 2 = reflection (serif italic) — adds a note of interiority.
 */
function getStatement(state) {
  const day = state.currentDay || 1;
  const streak = state.streak || 0;

  // Legend moment
  if (day >= 66) return { line1: "Habit forged.", line2: "it's who I am now." };

  // Boss Day I defeated
  if (state.completedDays?.[21]) return { line1: "Boss Day I.", line2: "beaten." };

  // Long streaks (streak is the most shareable metric)
  if (streak >= 100) return { line1: "One hundred days.", line2: "not missed once." };
  if (streak >= 60)  return { line1: `${streak} days in a row.`, line2: "still here." };
  if (streak >= 30)  return { line1: `${streak} days.`, line2: "zero excuses." };
  if (streak >= 14)  return { line1: `${streak} days straight.`, line2: "not stopping." };
  if (streak >= 7)   return { line1: "One full week.", line2: "didn't skip once." };

  // Early journey
  if (day === 1)     return { line1: "Started today.", line2: "quietly." };
  if (day <= 3)      return { line1: "Showing up.", line2: "that's the whole game." };
  if (day <= 14)     return { line1: "Building the habit.", line2: "day by day." };
  if (day <= 30)     return { line1: "Deep in it.", line2: "it's working." };
  if (day <= 50)     return { line1: "More than halfway.", line2: "no stopping now." };
  return { line1: "The final stretch.", line2: "almost there." };
}

/** #RRGGBB → "r,g,b" for rgba() strings. */
function hexToRgb(hex) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// ── The Stake Card — surfaces the user's articulated why/cost/proof ──
function StakeCard({ state, onEdit, isDark, colors }) {
  const stake = state.stake;
  const deferred = state.stakeDeferred;

  // Empty state — prompt to set it
  if (!stake) {
    return (
      <div
        onClick={onEdit}
        style={{
          margin: `${T.space.xl}px ${T.space.lg}px`,
          padding: "18px 18px",
          borderRadius: T.radii.lg,
          border: `1px dashed ${deferred ? "rgba(124,92,252,0.35)" : "rgba(124,92,252,0.55)"}`,
          background: "rgba(124,92,252,0.04)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          textTransform: "uppercase", color: "#7C5CFC",
          marginBottom: 6,
        }}>
          The Stake · Not Set
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
          Why are you doing this?
        </div>
        <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5, opacity: 0.75 }}>
          Three sentences. The real reason, the cost of not doing it, and how you'll know it worked.
          {deferred ? " You deferred this — tap to set it now." : " Tap to set your stake."}
        </div>
      </div>
    );
  }

  const setDate = stake.setAt ? new Date(stake.setAt) : null;
  const setLabel = setDate
    ? setDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div style={{
      margin: `${T.space.xl}px ${T.space.lg}px`,
      padding: "18px 18px 16px",
      borderRadius: T.radii.lg,
      background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(124,92,252,0.02))",
      border: "1px solid rgba(124,92,252,0.2)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
          textTransform: "uppercase", color: "#7C5CFC",
        }}>
          The Stake · Sealed {setLabel}
        </div>
        <button
          onClick={onEdit}
          style={{
            background: "transparent", border: "none",
            color: "#7C5CFC", fontSize: 10, fontWeight: 700,
            cursor: "pointer", padding: "2px 6px",
            letterSpacing: 0.5,
          }}
        >
          EDIT
        </button>
      </div>

      <StakeLine label="Why" value={stake.why} colors={colors} />
      <StakeLine label="Cost" value={stake.cost} colors={colors} />
      <StakeLine label="Proof" value={stake.proof} colors={colors} last />

      {stake.revisions?.length > 0 && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: `1px dashed ${colors.cardBorder || "rgba(255,255,255,0.06)"}`,
          fontSize: 10, color: colors.textSecondary, opacity: 0.5,
        }}>
          Revised {stake.revisions.length} time{stake.revisions.length === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  );
}

function StakeLine({ label, value, colors, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 10 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "#7C5CFC",
        marginBottom: 3, letterSpacing: 0.8, opacity: 0.7,
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, lineHeight: 1.5, color: colors.text,
        fontStyle: "italic", fontWeight: 500,
      }}>
        {value}
      </div>
    </div>
  );
}

function ShareCard({ state, displayName, level, levelIdx }) {
  const [generating, setGenerating] = useState(false);
  const [shared, setShared] = useState(false);

  const day = state.currentDay || 1;
  const arc = getArc(day);
  const arcRgb = hexToRgb(arc.color);
  const statement = getStatement(state);

  async function generateAndShare() {
    setGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 1080, H = 1080;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");

      // ── Background ────────────────────────────────────────────────────────
      ctx.fillStyle = "#0A0B16";
      ctx.fillRect(0, 0, W, H);

      // Arc-colored ambient glow (top-left)
      const glow = ctx.createRadialGradient(80, 80, 0, 80, 80, 720);
      glow.addColorStop(0, `rgba(${arcRgb},0.32)`);
      glow.addColorStop(1, `rgba(${arcRgb},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Cool counter-glow (bottom-right) for depth
      const glow2 = ctx.createRadialGradient(W - 120, H - 120, 0, W - 120, H - 120, 520);
      glow2.addColorStop(0, "rgba(236,72,153,0.12)");
      glow2.addColorStop(1, "rgba(236,72,153,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      // Subtle dot texture (paper feel)
      ctx.fillStyle = "rgba(255,255,255,0.022)";
      for (let gx = 40; gx < W; gx += 56) {
        for (let gy = 40; gy < H; gy += 56) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Inner rounded border
      ctx.strokeStyle = `rgba(${arcRgb},0.22)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(24, 24, W - 48, H - 48, 36);
      ctx.stroke();

      // ── Top strip: wordmark + arc badge ───────────────────────────────────
      const PAD = 88;

      // LIFE OS wordmark
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.font = "800 20px -apple-system, system-ui, sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillText("LIFE · OS", PAD, 108);

      // Arc badge (top-right)
      const arcLabel = `${arc.icon}  ${arc.name.toUpperCase()}`;
      ctx.font = "700 18px -apple-system, system-ui, sans-serif";
      const arcTextW = ctx.measureText(arcLabel).width;
      const badgePadX = 18, badgeH = 38;
      const badgeW = arcTextW + badgePadX * 2;
      const badgeX = W - PAD - badgeW;
      const badgeY = 108 - 28;
      ctx.fillStyle = `rgba(${arcRgb},0.12)`;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      ctx.fill();
      ctx.strokeStyle = `rgba(${arcRgb},0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = arc.color;
      ctx.fillText(arcLabel, badgeX + badgePadX, badgeY + 26);

      // ── Statement (hero) ──────────────────────────────────────────────────
      // Line 1: bold sans, massive — the fact
      let size1 = 132;
      ctx.font = `900 ${size1}px -apple-system, system-ui, sans-serif`;
      while (ctx.measureText(statement.line1).width > W - PAD * 2 && size1 > 72) {
        size1 -= 4;
        ctx.font = `900 ${size1}px -apple-system, system-ui, sans-serif`;
      }
      // Line 2: serif italic, smaller — the reflection
      let size2 = 80;
      ctx.font = `italic 500 ${size2}px "Iowan Old Style", Georgia, "Times New Roman", serif`;
      while (ctx.measureText(statement.line2).width > W - PAD * 2 && size2 > 48) {
        size2 -= 3;
        ctx.font = `italic 500 ${size2}px "Iowan Old Style", Georgia, "Times New Roman", serif`;
      }

      // Vertical layout: anchor the block so the baseline between the two lines sits near canvas center
      const gap = 28;
      const blockH = size1 + gap + size2;
      const blockTop = (H - blockH) / 2 - 40; // nudge up slightly to leave room for attribution

      // Draw line 1
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${size1}px -apple-system, system-ui, sans-serif`;
      ctx.fillText(statement.line1, PAD, blockTop + size1);

      // Draw line 2
      ctx.fillStyle = "rgba(255,255,255,0.62)";
      ctx.font = `italic 500 ${size2}px "Iowan Old Style", Georgia, "Times New Roman", serif`;
      ctx.fillText(statement.line2, PAD, blockTop + size1 + gap + size2);

      // ── Attribution block ─────────────────────────────────────────────────
      const attrY = blockTop + blockH + 100;

      // Em-dash + name
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "500 28px -apple-system, system-ui, sans-serif";
      ctx.fillText(`— ${displayName}, Day ${day} of 66`, PAD, attrY);

      // Secondary line: arc + level
      ctx.fillStyle = `rgba(${arcRgb},0.75)`;
      ctx.font = "600 20px -apple-system, system-ui, sans-serif";
      ctx.fillText(`${arc.icon}  ${arc.name} Arc  ·  Lv.${levelIdx + 1} ${level.name}`, PAD, attrY + 38);

      // ── Footer strip ──────────────────────────────────────────────────────
      // Divider
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, H - 120);
      ctx.lineTo(W - PAD, H - 120);
      ctx.stroke();

      // Stats (left)
      const trophyCount = Object.keys(state.unlockedTrophies || {}).length;
      const sealed = Object.keys(state.completedDays || {}).length;
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.font = "600 20px -apple-system, system-ui, sans-serif";
      const statLine = `🔥 ${state.streak || 0}   ✓ ${sealed}   🏆 ${trophyCount}   ${(state.xp || 0).toLocaleString()} XP`;
      ctx.fillText(statLine, PAD, H - 70);

      // life-os.app (right)
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.font = "700 20px -apple-system, system-ui, sans-serif";
      ctx.fillText("life-os.app", W - PAD, H - 70);
      ctx.textAlign = "left";

      // ── Share ─────────────────────────────────────────────────────────────
      const dataUrl = canvas.toDataURL("image/png");

      if (navigator.share && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "life-os-statement.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${displayName} · Life OS`,
            text: `"${statement.line1} ${statement.line2}" — Day ${day} of 66.`,
          });
          setShared(true);
          setTimeout(() => setShared(false), 3000);
          return;
        }
      }

      // Fallback: download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "life-os-statement.png";
      a.click();
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } finally {
      setGenerating(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // In-app preview — mirrors the canvas layout tightly so "what you see" = "what you share"
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "0 16px 12px" }}>
      {/* Preview card */}
      <div style={{
        position: "relative",
        borderRadius: 20,
        background: "#0A0B16",
        border: `1px solid rgba(${arcRgb},0.22)`,
        overflow: "hidden",
        marginBottom: 12,
        aspectRatio: "1 / 1",
      }}>
        {/* Ambient glow layers — same colors as canvas */}
        <div style={{
          position: "absolute", top: "-20%", left: "-15%",
          width: "70%", height: "70%",
          background: `radial-gradient(circle, rgba(${arcRgb},0.30) 0%, rgba(${arcRgb},0) 60%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-20%",
          width: "60%", height: "60%",
          background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0) 60%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute", inset: 0,
          padding: "22px 22px 20px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Top strip */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontSize: 11, fontWeight: 800,
              color: "rgba(255,255,255,0.32)",
              letterSpacing: 2,
            }}>LIFE · OS</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: arc.color,
              background: `rgba(${arcRgb},0.12)`,
              border: `1px solid rgba(${arcRgb},0.3)`,
              padding: "4px 10px", borderRadius: 8,
              letterSpacing: 0.5,
            }}>{arc.icon} {arc.name.toUpperCase()}</span>
          </div>

          {/* Statement (vertically centered with flex) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
            <div style={{
              fontSize: "clamp(22px, 7.5vw, 38px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.02,
              letterSpacing: -0.6,
            }}>
              {statement.line1}
            </div>
            <div style={{
              fontSize: "clamp(15px, 5vw, 24px)",
              fontStyle: "italic",
              fontFamily: "'Iowan Old Style', Georgia, 'Times New Roman', serif",
              color: "rgba(255,255,255,0.62)",
              lineHeight: 1.1,
            }}>
              {statement.line2}
            </div>
          </div>

          {/* Attribution */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 12, fontWeight: 500,
              color: "rgba(255,255,255,0.55)",
            }}>
              — {displayName}, Day {day} of 66
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: `rgba(${arcRgb},0.85)`,
              marginTop: 3,
            }}>
              {arc.icon} {arc.name} Arc · Lv.{levelIdx + 1} {level.name}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", fontWeight: 600, letterSpacing: 0.3 }}>
              🔥 {state.streak || 0} · ✓ {Object.keys(state.completedDays || {}).length} · 🏆 {Object.keys(state.unlockedTrophies || {}).length}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: 700, letterSpacing: 0.3 }}>
              life-os.app
            </span>
          </div>
        </div>
      </div>

      {/* Share CTA — arc-colored to match the card */}
      <motion.button
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 12,
          background: shared
            ? "rgba(34,197,94,0.15)"
            : `linear-gradient(135deg, rgba(${arcRgb},0.25), rgba(236,72,153,0.18))`,
          border: shared
            ? "1px solid rgba(34,197,94,0.3)"
            : `1px solid rgba(${arcRgb},0.35)`,
          color: shared ? "#22C55E" : arc.color,
          fontSize: 14,
          fontWeight: 800,
          cursor: generating ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          letterSpacing: 0.3,
        }}
        whileTap={{ scale: 0.97 }}
        onClick={generating ? undefined : generateAndShare}
        disabled={generating}
      >
        {generating ? (
          <>Composing your card…</>
        ) : shared ? (
          <><CheckCircle size={16} /> Saved</>
        ) : (
          <><Sparkles size={16} /> Share this moment</>
        )}
      </motion.button>

      {/* Subtle helper text */}
      <div style={{
        fontSize: 11, textAlign: "center",
        color: "rgba(255,255,255,0.28)",
        marginTop: 8, fontWeight: 500,
      }}>
        The statement updates as your streak grows.
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }) {
  const { colors } = useTheme();
  return (
    <div style={sectionHeader}>
      <span style={{ ...sectionTitle, color: colors.text }}>{title}</span>
      {sub && <span style={{ ...sectionSub, color: colors.textSecondary }}>{sub}</span>}
    </div>
  );
}

function JourneyCalendar({ state, isDark }) {
  const { colors } = useTheme();
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = dateToLocalDayKey(now);
  const canGoForward = monthOffset < 0;
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  const startDate = state.startDate ? new Date(state.startDate) : null;

  // Map dateStr → journey day number for the visible range
  const dateToDayNum = {};
  if (startDate) {
    const totalDays = Math.max(66, (state.currentDay || 1) + 7);
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d - 1);
      dateToDayNum[dateToLocalDayKey(date)] = d;
    }
  }

  // Build completed dates set
  const completedDates = new Set();
  if (startDate) {
    Object.keys(state.completedDays).forEach((dayNum) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + Number(dayNum) - 1);
      completedDates.add(dateToLocalDayKey(d));
    });
  }

  // Today's journey day
  const todayJourneyDay = dateToDayNum[today];

  // Completions this month
  let monthCompletions = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (completedDates.has(dateStr)) monthCompletions++;
  }

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div style={calendarWrap}>
      {/* Month nav + journey-day context */}
      <div style={calendarNav}>
        <button style={calNavBtn} onClick={() => setMonthOffset((o) => o - 1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold, color: colors.text }}>{monthName}</div>
          <div style={{ fontSize: T.font.xs, color: colors.textSecondary }}>
            {monthCompletions > 0 ? `${monthCompletions} day${monthCompletions !== 1 ? "s" : ""} sealed` : "No completions yet"}
            {todayJourneyDay && monthOffset === 0 ? ` · D${todayJourneyDay}` : ""}
          </div>
        </div>
        <button
          style={{ ...calNavBtn, opacity: canGoForward ? 1 : 0.3 }}
          onClick={() => canGoForward && setMonthOffset((o) => o + 1)}
          disabled={!canGoForward}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div style={calendarGrid}>
        {/* Weekday headers */}
        {dayLabels.map((l) => (
          <div key={l} style={calDayLabel}>{l}</div>
        ))}
        {/* Offset empty cells */}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`e${i}`} />
        ))}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const done = completedDates.has(dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;
          const journeyDay = dateToDayNum[dateStr];
          const isBoss = journeyDay === 21 || journeyDay === 66;
          const isOnJourney = !!journeyDay;

          return (
            <div
              key={d}
              style={{
                ...calDayCell,
                aspectRatio: "auto",
                flexDirection: "column",
                gap: 1,
                padding: "5px 2px",
                background: done
                  ? "linear-gradient(135deg, #7C5CFC, #EC4899)"
                  : isBoss && !isFuture
                  ? (isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)")
                  : isToday
                  ? "rgba(124,92,252,0.15)"
                  : "transparent",
                color: done
                  ? "#fff"
                  : isFuture
                  ? sub(0.15)
                  : isBoss
                  ? "#F97316"
                  : isToday
                  ? "#7C5CFC"
                  : sub(0.5),
                border: isToday && !done
                  ? "2px solid #7C5CFC"
                  : isBoss && !done && !isFuture
                  ? "2px solid rgba(249,115,22,0.3)"
                  : "2px solid transparent",
                fontWeight: isToday || done || isBoss ? 700 : 400,
              }}
            >
              {/* Calendar date */}
              <span style={{ fontSize: 11, lineHeight: 1 }}>{d}</span>
              {/* Journey day badge — shown only for days on the journey */}
              {isOnJourney && (
                <span style={{
                  fontSize: 8, lineHeight: 1,
                  opacity: done ? 0.9 : isFuture ? 0.4 : 0.65,
                  fontWeight: isBoss ? 800 : 600,
                }}>
                  {isBoss && !done ? "⚔" : `D${journeyDay}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 12, marginTop: 10,
        paddingTop: 10, borderTop: `1px solid ${sub(0.05)}`,
        flexWrap: "wrap",
      }}>
        {[
          { color: "linear-gradient(135deg,#7C5CFC,#EC4899)", label: "Sealed" },
          { color: "rgba(124,92,252,0.25)", label: "Today", border: "1.5px solid #7C5CFC" },
          { color: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)", label: "Boss day", border: "1.5px solid rgba(249,115,22,0.35)" },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: color, border: border || "none", flexShrink: 0,
            }} />
            <span style={{ fontSize: 10, color: sub(0.4), fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MILESTONES = [
  { day: 1, label: "First Step", desc: "Started the journey", Icon: Flag, color: "#22C55E" },
  { day: 3, label: "Building Momentum", desc: "3-day streak earned", Icon: Zap, color: "#F59E0B" },
  { day: 7, label: "One Week Strong", desc: "First full week", Icon: Flame, color: "#F97316" },
  { day: 14, label: "Habit Forming", desc: "Two weeks of discipline", Icon: Target, color: "#7C5CFC" },
  { day: 21, label: "Boss Day I", desc: "First major milestone", Icon: Swords, color: "#EC4899" },
  { day: 30, label: "One Month", desc: "30 days of growth", Icon: Crown, color: "#FFD700" },
  { day: 45, label: "Deep Roots", desc: "Habits are second nature", Icon: Trophy, color: "#10B981" },
  { day: 66, label: "Boss Day II", desc: "Journey complete — mastery unlocked", Icon: Sparkles, color: "#7C5CFC" },
];

function MilestonesTimeline({ state, day, isDark, colors }) {
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  return (
    <div style={milestonesWrap}>
      {MILESTONES.map((m, i) => {
        const reached = day >= m.day;
        const isNext = !reached && (i === 0 || day >= MILESTONES[i - 1].day);
        return (
          <div key={m.day} style={milestoneRow}>
            {/* Timeline line */}
            <div style={milestoneLineCol}>
              <div style={{
                ...milestoneDot,
                background: reached ? m.color : isNext ? "rgba(124,92,252,0.2)" : sub(0.06),
                border: isNext ? `2px solid ${m.color}` : "2px solid transparent",
                boxShadow: reached ? `0 0 12px ${m.color}44` : "none",
              }}>
                <m.Icon size={14} color={reached ? "#fff" : isNext ? m.color : sub(0.2)} />
              </div>
              {i < MILESTONES.length - 1 && (
                <div style={{
                  ...milestoneConnector,
                  background: reached && day >= (MILESTONES[i + 1]?.day || Infinity) ? "linear-gradient(180deg, #7C5CFC, #EC4899)" : reached ? `linear-gradient(180deg, ${m.color}88, ${sub(0.06)})` : sub(0.06),
                }} />
              )}
            </div>
            {/* Content */}
            <div style={{ ...milestoneContent, opacity: reached ? 1 : isNext ? 0.8 : 0.35 }}>
              <div style={{ display: "flex", alignItems: "center", gap: T.space.sm }}>
                <span style={{ fontSize: T.font.md, fontWeight: T.weight.bold, color: colors.text }}>{m.label}</span>
                <span style={{ fontSize: 10, color: colors.textSecondary, fontWeight: T.weight.medium }}>Day {m.day}</span>
              </div>
              <div style={{ fontSize: T.font.xs, color: colors.textSecondary, marginTop: 2 }}>{m.desc}</div>
              {isNext && (
                <div style={{ fontSize: T.font.xs, color: m.color, fontWeight: T.weight.bold, marginTop: 4 }}>
                  {m.day - day} day{m.day - day !== 1 ? "s" : ""} away
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatBig({ value, label, color, icon }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div style={{
      ...primaryStat,
      borderColor: `${color}22`,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      border: `1px solid ${isDark ? `${color}22` : `${color}18`}`,
    }}>
      <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      <div style={{ ...primaryStatVal, color }}>{value}</div>
      <div style={{ ...primaryStatLbl, color: colors.textSecondary }}>{label}</div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const heroCard = {
  display: "flex",
  alignItems: "center",
  gap: T.space.lg,
  margin: `0 ${T.space.lg}px ${T.space.md}px`,
  padding: T.space.xl,
  borderRadius: T.radii.xl,
  background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
  border: "1px solid rgba(124,92,252,0.12)",
};

const avatarWrap = {
  position: "relative",
  flexShrink: 0,
};

const avatarCircle = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  fontWeight: T.weight.black,
  color: "#fff",
};

const avatarImg = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  objectFit: "cover",
};

const avatarAnimal = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  overflow: "hidden",
  flexShrink: 0,
};

const levelDot = {
  position: "absolute",
  bottom: -4,
  right: -4,
  background: "#7C5CFC",
  color: "#fff",
  fontSize: 9,
  fontWeight: T.weight.black,
  padding: "2px 5px",
  borderRadius: 8,
  border: "2px solid #0F172A",
};

const editBadge = {
  position: "absolute",
  top: -2,
  right: -2,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#1E293B",
  border: "2px solid #0F172A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  lineHeight: 1,
};

const heroName = {
  fontSize: T.font.xl,
  fontWeight: T.weight.black,
  letterSpacing: -0.3,
};

const heroEmail = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
  marginTop: 2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const levelRow = {
  display: "flex",
  gap: T.space.sm,
  marginTop: T.space.sm,
  flexWrap: "wrap",
};

const levelPill = {
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  padding: "3px 10px",
  borderRadius: 20,
  background: "rgba(124,92,252,0.12)",
  color: "#7C5CFC",
};

const streakPill = {
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  padding: "3px 10px",
  borderRadius: 20,
  background: "rgba(249,115,22,0.12)",
  color: "#F97316",
};

const prestigePill = {
  fontSize: T.font.xs,
  fontWeight: T.weight.heavy,
  padding: "3px 10px",
  borderRadius: 20,
  background: "linear-gradient(135deg,rgba(250,204,21,0.18),rgba(245,158,11,0.12))",
  color: "#FACC15",
  border: "1px solid rgba(250,204,21,0.3)",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

const prestigeCard = {
  margin: `0 ${T.space.lg}px ${T.space.lg}px`,
  padding: T.space.lg,
  borderRadius: T.radii.lg,
  background: "linear-gradient(135deg,rgba(250,204,21,0.08),rgba(245,158,11,0.04))",
  border: "1px solid rgba(250,204,21,0.25)",
};

const prestigeBtn = {
  marginTop: 12,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(250,204,21,0.4)",
  background: "linear-gradient(135deg,rgba(250,204,21,0.18),rgba(245,158,11,0.1))",
  color: "#FACC15",
  fontSize: T.font.sm,
  fontWeight: T.weight.heavy,
  cursor: "pointer",
};

const prestigeBtnConfirm = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#FACC15,#F59E0B)",
  color: "#1A1530",
  fontSize: T.font.sm,
  fontWeight: T.weight.heavy,
  cursor: "pointer",
};

const prestigeBtnCancel = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "transparent",
  color: "rgba(255,255,255,0.45)",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
};

const xpSection = {
  margin: `0 ${T.space.lg}px ${T.space.lg}px`,
};

const xpTop = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: T.font.xs,
  marginBottom: T.space.xs,
};

const xpLabel = {
  fontWeight: T.weight.bold,
  color: "#7C5CFC",
};

const xpNext = {
  color: "rgba(255,255,255,0.45)",
};

const xpTrack = {
  height: 6,
  borderRadius: 3,
  overflow: "hidden",
};

const xpFill = {
  height: "100%",
  borderRadius: 3,
  background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
};

const primaryStats = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: T.space.sm,
  margin: `0 ${T.space.lg}px ${T.space.md}px`,
};

const primaryStat = {
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: T.space.xs,
};

const primaryStatVal = {
  fontSize: T.font.xxl,
  fontWeight: T.weight.black,
  lineHeight: 1,
};

const primaryStatLbl = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
};

const secGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: T.space.sm,
  margin: `0 ${T.space.lg}px ${T.space.xl}px`,
};

const secStat = {
  padding: T.space.md,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  textAlign: "center",
};

const secStatVal = {
  fontSize: T.font.lg,
  fontWeight: T.weight.black,
};

const secStatLbl = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
  marginTop: 2,
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${T.space.xl}px`,
  marginBottom: T.space.md,
  marginTop: T.space.xl,
};

const sectionTitle = {
  fontSize: T.font.lg,
  fontWeight: T.weight.black,
  letterSpacing: -0.2,
};

const sectionSub = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
};

const trophyProgressWrap = {
  margin: `0 ${T.space.lg}px ${T.space.md}px`,
};

const trophyProgressTrack = {
  height: 4,
  borderRadius: 2,
  background: "rgba(255,255,255,0.05)",
  overflow: "hidden",
};

const trophyProgressFill = {
  height: "100%",
  borderRadius: 2,
  background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
};

const trophyGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: T.space.sm,
  padding: `0 ${T.space.lg}px`,
  marginBottom: T.space.md,
};

const trophyCard = {
  padding: T.space.md,
  borderRadius: T.radii.md,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const trophyUnlocked = {
  background: "rgba(124,92,252,0.07)",
  border: "1px solid rgba(124,92,252,0.18)",
  boxShadow: "0 0 16px rgba(124,92,252,0.07)",
};

const trophyLocked = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.06)",
  opacity: 0.6,
};

const trophyProgWrap = {
  width: "100%",
  height: 4,
  borderRadius: 2,
  background: "rgba(255,255,255,0.05)",
  marginTop: 6,
  position: "relative",
  overflow: "hidden",
};
const trophyProgBar = {
  height: "100%",
  borderRadius: 2,
  background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
  transition: "width 0.3s ease",
};
const trophyProgLabel = {
  position: "absolute",
  right: 0,
  top: -12,
  fontSize: 8,
  fontWeight: 700,
  opacity: 0.5,
};


const settingsSection = {
  margin: `0 ${T.space.lg}px`,
  borderRadius: T.radii.lg,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  overflow: "hidden",
};

const settingsRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${T.space.lg}px ${T.space.lg}px`,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const settingsRowLeft = {
  display: "flex",
  alignItems: "center",
  gap: T.space.md,
};

const settingsRowTitle = {
  fontSize: T.font.md,
  fontWeight: T.weight.medium,
};

const settingsRowSub = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
  marginTop: 1,
};

const settingsChevron = {
  fontSize: T.font.xl,
  color: "rgba(255,255,255,0.45)",
};

const premiumBanner = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: `${T.space.xl}px ${T.space.lg}px 0`,
  padding: T.space.lg,
  borderRadius: T.radii.lg,
  background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.03))",
  border: "1px solid rgba(255,215,0,0.12)",
  cursor: "pointer",
};

const subscriptionCard = {
  margin: `${T.space.xl}px ${T.space.lg}px 0`,
  padding: T.space.lg,
  borderRadius: T.radii.lg,
  background: "linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,165,0,0.03))",
  border: "1px solid rgba(255,215,0,0.18)",
  display: "flex",
  flexDirection: "column",
  gap: T.space.md,
};

const subStatusRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const subCrown = {
  fontSize: 28,
  display: "flex",
  alignItems: "center",
  filter: "drop-shadow(0 0 8px rgba(255,215,0,0.4))",
};

const subStatusPill = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(16,185,129,0.12)",
  border: "1px solid rgba(16,185,129,0.3)",
  color: "#10B981",
};

const subRenewRow = {
  fontSize: T.font.xs,
  opacity: 0.45,
  fontWeight: T.weight.medium,
};

const subTrialWarning = {
  fontSize: T.font.xs,
  fontWeight: T.weight.medium,
  color: "#FFD700",
  padding: T.space.sm,
  borderRadius: T.radii.sm,
  background: "rgba(255,215,0,0.08)",
  border: "1px solid rgba(255,215,0,0.2)",
  textAlign: "center",
};

const subManageBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "1px solid rgba(255,215,0,0.3)",
  background: "rgba(255,215,0,0.06)",
  color: "#FFD700",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
};

// ── Streak Calendar styles ───────────────────────────────────────────────────

const calendarWrap = {
  margin: `0 ${T.space.lg}px ${T.space.md}px`,
  padding: T.space.lg,
  borderRadius: T.radii.lg,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const calendarNav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: T.space.md,
};

const calNavBtn = {
  width: 32,
  height: 32,
  borderRadius: T.radii.sm,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 3,
};

const calDayLabel = {
  textAlign: "center",
  fontSize: 10,
  fontWeight: T.weight.bold,
  color: "rgba(255,255,255,0.45)",
  paddingBottom: T.space.xs,
};

const calDayCell = {
  aspectRatio: "1",
  borderRadius: T.radii.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  transition: "all 0.15s ease",
};

// ── Milestones Timeline styles ───────────────────────────────────────────────

const milestonesWrap = {
  margin: `0 ${T.space.lg}px ${T.space.md}px`,
};

const milestoneRow = {
  display: "flex",
  gap: T.space.md,
  minHeight: 56,
};

const milestoneLineCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 30,
  flexShrink: 0,
};

const milestoneDot = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const milestoneConnector = {
  width: 2,
  flex: 1,
  minHeight: 16,
  borderRadius: 1,
};

const milestoneContent = {
  paddingBottom: T.space.md,
  flex: 1,
};
