import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/theme";
import { TROPHIES } from "../../data";
import { getTrophyTierColor } from "../../data/trophies";
import { getTotalVolume, getLevel, getNextLevel, getLevelIndex, isPrestigeReady } from "../../utils";
import { useAuth } from "../../hooks/useAuth";
import { usePremium } from "../../hooks/usePremium";
import { useTheme } from "../../hooks/useTheme";
import { usePomodoroContext } from "../../hooks";
import AvatarPicker from "../AvatarPicker";
import { renderAnimalAvatar } from "../AnimalAvatars";
import { Flame, Calendar, CheckCircle, Pencil, Swords, Sun, Moon, Users, Bell, AlertTriangle, Timer, Star, ChevronLeft, ChevronRight, Flag, Zap, Trophy, Target, Crown, Sparkles, Volume2, VolumeX, Download } from "lucide-react";
import { getSoundsEnabled, setSoundsEnabled, playSound } from "../../utils/audio";

const T = TOKENS;

export default function ProfileView({ state, save, user, onReset, onOpenNotifications, onNavigate }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [soundsOn, setSoundsOn] = useState(getSoundsEnabled());
  const [expandedTrophySections, setExpandedTrophySections] = useState({ milestone: true });
  const toggleTrophySection = useCallback((id) => {
    setExpandedTrophySections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const { logout } = useAuth();
  const { isPremium, isPremiumActive, isTrialActive, trialDaysRemaining, premiumUntil, plan, setShowUpgrade } = usePremium();
  const { theme, toggleTheme, colors } = useTheme();
  const pomodoro = usePomodoroContext();
  const { pomodoroActive, pomodoroTime, toggle, reset: resetTimer, phase, phaseLabel, sessionsCompleted, skipPhase } = pomodoro;

  const isDark = theme === "dark";
  const pomodoroMins = Math.floor(pomodoroTime / 60);
  const pomodoroSecs = pomodoroTime % 60;
  const phaseDuration =
    phase === "work" ? (state.pomodoroMinutes || 25) * 60 : phase === "longBreak" ? 15 * 60 : 5 * 60;
  const pomProg = 1 - pomodoroTime / phaseDuration;
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
    const today = new Date().toISOString().slice(0, 10);
    save({
      ...state,
      xp: 0,
      prestige: prestige + 1,
      prestigeHistory: [...(state.prestigeHistory || []), { date: today, atStreak: state.streak }],
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
          {displayEmail && <div style={heroEmail}>{displayEmail}</div>}
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
          <span style={xpNext}>{nextLevel ? `${nextLevel.xpReq - state.xp} to ${nextLevel.name}` : "Max level"}</span>
        </div>
        <div style={xpTrack}>
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
              <div style={{ fontSize: T.font.xs, opacity: 0.65, marginTop: 2 }}>
                Reset XP to gain a permanent crown. Trophies and streak stay.
              </div>
            </div>
          </div>
          {!confirmPrestige ? (
            <button style={prestigeBtn} onClick={() => setConfirmPrestige(true)}>
              Prestige Now
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={prestigeBtnConfirm} onClick={handlePrestige}>Confirm Reset</button>
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
          <div key={i} style={secStat}>
            <div style={secStatVal}>{s.v}</div>
            <div style={secStatLbl}>{s.l}</div>
          </div>
        ))}
      </div>

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

      {/* ── Journey Map ── */}
      <SectionHeader title="Journey Map" sub={day > 66 ? "Mastery Mode" : `Day ${day} of 66`} />
      <div style={dayGrid}>
        {Array.from({ length: Math.max(66, day) }, (_, i) => {
          const d = i + 1;
          const done = state.completedDays[d];
          const cur = d === day;
          const isBoss = d === 21 || d === 66;
          return (
            <div key={d} style={{
              ...dayDot,
              background: done ? "linear-gradient(135deg,#7C5CFC,#EC4899)" : cur ? "rgba(124,92,252,0.25)" : isBoss ? "rgba(249,115,22,0.12)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: cur ? "2px solid #7C5CFC" : isBoss && !done ? "2px solid rgba(249,115,22,0.3)" : "2px solid transparent",
              color: done ? "#fff" : cur ? "#7C5CFC" : isBoss ? "#F97316" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              fontWeight: cur || isBoss ? 700 : 400,
              fontSize: isBoss && !done ? 11 : 10,
            }}>
              {isBoss && !done ? <Swords size={11} /> : d}
            </div>
          );
        })}
      </div>

      {/* ── Streak Calendar ── */}
      <SectionHeader title="Streak Calendar" sub={`${Object.keys(state.completedDays).length} days completed`} />
      <StreakCalendar state={state} isDark={isDark} />

      {/* ── Milestones ── */}
      <SectionHeader title="Milestones" sub={day > 66 ? "Journey complete" : "Your path"} />
      <MilestonesTimeline state={state} day={day} />

      {/* ── Settings ── */}
      <SectionHeader title="Settings" />
      <div style={settingsSection}>
        {/* Theme toggle */}
        <div style={settingsRow}>
          <div style={settingsRowLeft}>
            <span style={{ display: "flex", alignItems: "center" }}>{isDark ? <Moon size={20} /> : <Sun size={20} color="#F59E0B" />}</span>
            <div>
              <div style={settingsRowTitle}>Appearance</div>
              <div style={settingsRowSub}>{isDark ? "Dark Mode" : "Light Mode"}</div>
            </div>
          </div>
          <button style={toggleTrack(isDark)} onClick={toggleTheme} role="switch" aria-checked={isDark} aria-label="Toggle theme">
            <span style={toggleIcon(true, isDark)}><Sun size={12} /></span>
            <span style={toggleIcon(false, isDark)}><Moon size={12} /></span>
            <div style={toggleThumb(isDark)} />
          </button>
        </div>

        {/* Social */}
        <div style={{ ...settingsRow, cursor: "pointer" }} onClick={() => onNavigate?.("social")}>
          <div style={settingsRowLeft}>
            <span style={{ display: "flex", alignItems: "center" }}><Users size={20} /></span>
            <div>
              <div style={settingsRowTitle}>Community</div>
              <div style={settingsRowSub}>Leaderboard, friends &amp; challenges</div>
            </div>
          </div>
          <span style={settingsChevron}>›</span>
        </div>

        {/* Sound effects */}
        <div style={settingsRow}>
          <div style={settingsRowLeft}>
            <span style={{ display: "flex", alignItems: "center" }}>{soundsOn ? <Volume2 size={20} /> : <VolumeX size={20} />}</span>
            <div>
              <div style={settingsRowTitle}>Sound Effects</div>
              <div style={settingsRowSub}>Audio feedback on actions</div>
            </div>
          </div>
          <button
            style={toggleTrack(soundsOn)}
            role="switch"
            aria-checked={soundsOn}
            aria-label="Toggle sound effects"
            onClick={() => {
              const next = !soundsOn;
              setSoundsEnabled(next);
              setSoundsOn(next);
              if (next) playSound("questCheck");
            }}
          >
            <span style={toggleThumb(soundsOn)} />
          </button>
        </div>

        {/* Notifications */}
        <div style={{ ...settingsRow, cursor: "pointer" }} onClick={onOpenNotifications}>
          <div style={settingsRowLeft}>
            <span style={{ display: "flex", alignItems: "center" }}><Bell size={20} /></span>
            <div>
              <div style={settingsRowTitle}>Notifications</div>
              <div style={settingsRowSub}>Reminders and alerts</div>
            </div>
          </div>
          <span style={settingsChevron}>›</span>
        </div>

        {/* Focus Timer — collapsible, last row so no bottom border */}
        <div style={{ ...settingsRow, borderBottom: "none", cursor: "pointer" }} onClick={() => setShowTimer(v => !v)}>
          <div style={settingsRowLeft}>
            <span style={{ display: "flex", alignItems: "center" }}><Timer size={20} /></span>
            <div>
              <div style={settingsRowTitle}>Focus Timer</div>
              <div style={settingsRowSub}>{pomodoroActive ? "Running..." : `${String(pomodoroMins).padStart(2,"0")}:${String(pomodoroSecs).padStart(2,"0")}`}</div>
            </div>
          </div>
          <span style={settingsChevron}>{showTimer ? "▲" : "▼"}</span>
        </div>

        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div style={timerExpanded}>
                <div style={{ fontSize: T.font.xs, fontWeight: T.weight.bold, color: phase === "work" ? "#7C5CFC" : "#22C55E", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  {phaseLabel}
                </div>
                <div style={{ position: "relative" }}>
                  <svg viewBox="0 0 120 120" style={{ width: 120, height: 120 }}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} strokeWidth="5" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke={phase === "work" ? "#7C5CFC" : "#22C55E"} strokeWidth="5"
                      strokeDasharray={`${pomProg * 327} 327`} strokeLinecap="round"
                      transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 0.5s, stroke 0.3s" }} />
                  </svg>
                  <div style={timerText}>
                    {String(pomodoroMins).padStart(2, "0")}:{String(pomodoroSecs).padStart(2, "0")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button style={timerBtn} onClick={toggle}>
                    {pomodoroActive ? "Pause" : pomodoroTime === 0 ? "Continue" : "Start"}
                  </button>
                  <button style={timerBtnSec} onClick={skipPhase}>Skip</button>
                  <button style={timerBtnSec} onClick={resetTimer}>Reset</button>
                </div>
                <div style={{ marginTop: 10, fontSize: T.font.xs, opacity: 0.55, fontWeight: T.weight.medium }}>
                  {sessionsCompleted} session{sessionsCompleted === 1 ? "" : "s"} today · {state.totalPomodoros || 0} total
                </div>
                {pomodoroTime === 0 && <div style={{ marginTop: 8, fontSize: T.font.sm, color: "#10B981", fontWeight: T.weight.bold }}>Phase complete!</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* ── Data Export ── */}
      <SectionHeader title="Your Data" />
      <div style={dangerSection}>
        <button
          style={exportBtn}
          onClick={() => {
            const exportData = {
              exportedAt: new Date().toISOString(),
              version: "life-os-v1",
              profile: { userName: state.userName, currentDay: state.currentDay, xp: state.xp, streak: state.streak, bestStreak: state.bestStreak },
              completedDays: state.completedDays,
              completedQuests: state.completedQuests,
              journal: state.journal,
              moods: state.moods,
              workoutLogs: state.workoutLogs,
              sobrietyDates: state.sobrietyDates,
              forgeGoals: state.forgeGoals,
              recoveryJournals: state.recoveryJournals,
              courseProgress: state.courseProgress,
              customQuests: state.customQuests,
              unlockedTrophies: state.unlockedTrophies,
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={14} style={{ marginRight: 6 }} />
          Export All Data (JSON)
        </button>
      </div>

      {/* ── Account / Danger Zone ── */}
      <SectionHeader title="Account" />
      <div style={dangerSection}>
        {user && (
          <button style={logoutBtn} onClick={logout}>
            Sign Out
          </button>
        )}
        {!confirmReset ? (
          <button style={resetBtn} onClick={() => setConfirmReset(true)}>
            Reset All Progress
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={resetConfirm}
          >
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: "#EF4444", marginBottom: T.space.md }}>
              <AlertTriangle size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> This will permanently erase all your progress. Are you sure?
            </div>
            <div style={{ display: "flex", gap: T.space.sm }}>
              <button style={{ ...resetBtn, flex: 1 }} onClick={() => { onReset(); setConfirmReset(false); }}>
                Yes, erase everything
              </button>
              <button style={{ ...timerBtnSec, flex: 1 }} onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }) {
  const { colors } = useTheme();
  return (
    <div style={sectionHeader}>
      <span style={sectionTitle}>{title}</span>
      {sub && <span style={sectionSub}>{sub}</span>}
    </div>
  );
}

function StreakCalendar({ state, isDark }) {
  const { colors } = useTheme();
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Build a set of completed calendar dates from state
  const startDate = state.startDate ? new Date(state.startDate) : null;
  const completedDates = new Set();
  if (startDate) {
    Object.keys(state.completedDays).forEach((dayNum) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + Number(dayNum) - 1);
      completedDates.add(d.toISOString().split("T")[0]);
    });
  }

  const today = now.toISOString().split("T")[0];
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const canGoForward = monthOffset < 0;

  // Count completions this month
  let monthCompletions = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (completedDates.has(dateStr)) monthCompletions++;
  }

  return (
    <div style={calendarWrap}>
      {/* Month nav */}
      <div style={calendarNav}>
        <button style={calNavBtn} onClick={() => setMonthOffset((o) => o - 1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold }}>{monthName}</div>
          <div style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)" }}>{monthCompletions} / {daysInMonth} days</div>
        </div>
        <button style={{ ...calNavBtn, opacity: canGoForward ? 1 : 0.3 }} onClick={() => canGoForward && setMonthOffset((o) => o + 1)} disabled={!canGoForward} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div style={calendarGrid}>
        {dayLabels.map((l) => (
          <div key={l} style={calDayLabel}>{l}</div>
        ))}
        {/* Empty cells for offset */}
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
          return (
            <div key={d} style={{
              ...calDayCell,
              background: done ? "linear-gradient(135deg, #7C5CFC, #EC4899)" : isToday ? "rgba(124,92,252,0.15)" : "transparent",
              color: done ? "#fff" : isFuture ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)") : isToday ? "#7C5CFC" : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"),
              border: isToday && !done ? "2px solid #7C5CFC" : "2px solid transparent",
              fontWeight: isToday || done ? 700 : 400,
            }}>
              {d}
            </div>
          );
        })}
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

function MilestonesTimeline({ state, day }) {
  const { colors } = useTheme();
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
                background: reached ? m.color : isNext ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.06)",
                border: isNext ? `2px solid ${m.color}` : "2px solid transparent",
                boxShadow: reached ? `0 0 12px ${m.color}44` : "none",
              }}>
                <m.Icon size={14} color={reached ? "#fff" : isNext ? m.color : "rgba(255,255,255,0.2)"} />
              </div>
              {i < MILESTONES.length - 1 && (
                <div style={{
                  ...milestoneConnector,
                  background: reached && day >= (MILESTONES[i + 1]?.day || Infinity) ? "linear-gradient(180deg, #7C5CFC, #EC4899)" : reached ? `linear-gradient(180deg, ${m.color}88, rgba(255,255,255,0.06))` : "rgba(255,255,255,0.06)",
                }} />
              )}
            </div>
            {/* Content */}
            <div style={{ ...milestoneContent, opacity: reached ? 1 : isNext ? 0.8 : 0.35 }}>
              <div style={{ display: "flex", alignItems: "center", gap: T.space.sm }}>
                <span style={{ fontSize: T.font.md, fontWeight: T.weight.bold }}>{m.label}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: T.weight.medium }}>Day {m.day}</span>
              </div>
              <div style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{m.desc}</div>
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
  const { colors } = useTheme();
  return (
    <div style={{ ...primaryStat, borderColor: `${color}22` }}>
      <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      <div style={{ ...primaryStatVal, color }}>{value}</div>
      <div style={primaryStatLbl}>{label}</div>
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
  background: "rgba(255,255,255,0.05)",
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

const dayGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(11,1fr)",
  gap: 3,
  padding: `0 ${T.space.lg}px`,
  marginBottom: T.space.md,
};

const dayDot = {
  aspectRatio: "1",
  borderRadius: T.radii.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 400,
  transition: `all 0.15s ease`,
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

const timerExpanded = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: `${T.space.lg}px ${T.space.lg}px ${T.space.xl}px`,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const timerText = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  fontSize: 26,
  fontWeight: T.weight.black,
  fontVariantNumeric: "tabular-nums",
  letterSpacing: 2,
};

const timerBtn = {
  padding: `${T.space.md}px ${T.space.xxl}px`,
  borderRadius: T.radii.md,
  border: "none",
  background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
  color: "#fff",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  boxShadow: "0 3px 12px rgba(124,92,252,0.2)",
};

const timerBtnSec = {
  padding: `${T.space.md}px ${T.space.xxl}px`,
  borderRadius: T.radii.md,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "rgba(255,255,255,0.45)",
  fontSize: T.font.sm,
  fontWeight: T.weight.medium,
  cursor: "pointer",
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

const dangerSection = {
  margin: `0 ${T.space.lg}px`,
  display: "flex",
  flexDirection: "column",
  gap: T.space.sm,
};

const exportBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "1px solid rgba(124,92,252,0.2)",
  background: "rgba(124,92,252,0.06)",
  color: "#7C5CFC",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoutBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "transparent",
  color: "rgba(255,255,255,0.45)",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  textAlign: "center",
};

const resetBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "1px solid rgba(239,68,68,0.2)",
  background: "transparent",
  color: "#EF4444",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  textAlign: "center",
};

const resetConfirm = {
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(239,68,68,0.05)",
  border: "1px solid rgba(239,68,68,0.15)",
};

// Toggle styles
const toggleTrack = (isDark) => ({
  position: "relative", width: 56, height: 30, borderRadius: 15, border: "none",
  background: isDark ? "linear-gradient(135deg, #1A1A3E, #2D2B55)" : "linear-gradient(135deg, #87CEEB, #FDB813)",
  cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
  boxShadow: isDark ? "inset 0 1px 3px rgba(0,0,0,0.4)" : "inset 0 1px 3px rgba(0,0,0,0.15)",
  transition: "background 0.3s ease", flexShrink: 0,
});

const toggleIcon = (isSun, isDark) => ({
  fontSize: 12, lineHeight: 1, position: "absolute", top: "50%", transform: "translateY(-50%)",
  ...(isSun ? { left: 7, opacity: isDark ? 0.3 : 0.9 } : { right: 7, opacity: isDark ? 0.9 : 0.3 }),
  transition: "opacity 0.3s ease", pointerEvents: "none", zIndex: 1,
});

const toggleThumb = (isDark) => ({
  position: "absolute", top: 3, left: isDark ? 29 : 3, width: 24, height: 24, borderRadius: "50%",
  background: isDark ? "linear-gradient(135deg, #C4B5FD, #7C5CFC)" : "linear-gradient(135deg, #FFF8DC, #FFD700)",
  boxShadow: isDark ? "0 2px 6px rgba(124,92,252,0.4)" : "0 2px 6px rgba(255,215,0,0.4)",
  transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 2,
});

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
