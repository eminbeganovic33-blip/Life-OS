import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, Shield, Dumbbell, BookOpen, Trophy, ArrowRight,
  Activity, Moon, Flag, Clock,
} from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { ANIMAL_AVATARS, renderAnimalAvatar } from "../shared/AnimalAvatars";
import { getTodayStr } from "../../utils";
import { getCalibratedStartersForCategory, QUEST_LIBRARY } from "../../data/questLibrary";

const QUEST_LIBRARY_COUNT = QUEST_LIBRARY.length;

// ── Static data ─────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  { icon: Target,   color: "#7C5CFC", title: "Daily Quests", body: "Pick habits, complete daily, earn XP" },
  { icon: Shield,   color: "#F97316", title: "Forge",        body: "Quit habits, track sober days" },
  { icon: Dumbbell, color: "#EF4444", title: "Dojo",         body: "Log workouts from a 945-exercise library" },
  { icon: BookOpen, color: "#3B82F6", title: "Academy",      body: "Courses + book summaries" },
  { icon: Trophy,   color: "#FBBF24", title: "Trophies",     body: "34 trophies. Streaks. Boss days." },
];

const ACTIVITY_OPTIONS = [
  { id: "sedentary", label: "Sedentary",   sub: "Mostly sitting, no regular exercise" },
  { id: "light",     label: "Lightly active", sub: "Walks, occasional movement" },
  { id: "moderate",  label: "Active",        sub: "Workouts 2-3x/week" },
  { id: "high",      label: "Very active",   sub: "Train almost daily" },
];

const SLEEP_OPTIONS = [
  { id: "poor",   label: "Poor",     sub: "Trouble falling/staying asleep" },
  { id: "okay",   label: "Inconsistent", sub: "Some nights great, some rough" },
  { id: "good",   label: "Solid",    sub: "7+ hours most nights" },
];

const VICE_OPTIONS = [
  { id: "smoking",       label: "Smoking",       icon: "🚬" },
  { id: "alcohol",       label: "Alcohol",       icon: "🍺" },
  { id: "vaping",        label: "Vaping",        icon: "💨" },
  { id: "social_media",  label: "Social Media",  icon: "📲" },
  { id: "doomscrolling", label: "Doomscrolling", icon: "📱" },
  { id: "junkfood",      label: "Junk Food",     icon: "🍔" },
  { id: "porn",          label: "Porn",          icon: "⚡" },
  { id: "caffeine",      label: "Caffeine",      icon: "☕" },
  { id: "weed",          label: "Weed",          icon: "🌿" },
  { id: "gambling",      label: "Gambling",      icon: "🎰" },
];

const GOAL_OPTIONS = [
  { id: "fitness",    label: "Get in shape",       sub: "Workouts, nutrition, energy",  emoji: "💪", color: "#EF4444" },
  { id: "discipline", label: "Build discipline",   sub: "Sleep, focus, screen control", emoji: "🧠", color: "#7C5CFC" },
  { id: "quit",       label: "Quit a habit",       sub: "Smoking, drinking, scrolling", emoji: "🛡️", color: "#F97316" },
  { id: "learning",   label: "Learn deeply",       sub: "Books, courses, reflection",   emoji: "📚", color: "#3B82F6" },
  { id: "balance",    label: "Full lifestyle reset", sub: "A bit of everything",          emoji: "🌅", color: "#22C55E" },
];

const TIME_OPTIONS = [
  { id: "short",  label: "5-15 min/day", sub: "Just the basics" },
  { id: "medium", label: "15-30 min",    sub: "A solid routine" },
  { id: "long",   label: "30-60+ min",   sub: "Go deep" },
];

// Domain suggestion table — primary goal → recommended categories (must exist in CATEGORIES)
const GOAL_DOMAIN_MAP = {
  fitness:    ["exercise", "nutrition", "sleep", "water"],
  discipline: ["sleep", "mind", "screen", "water"],
  quit:       ["sleep", "mind", "water"],
  learning:   ["reading", "mind", "sleep"],
  balance:    ["sleep", "water", "exercise", "mind", "nutrition"],
};

// Goal → suggested first Academy course id (from data/courses.js)
const GOAL_COURSE_MAP = {
  fitness:    "lifting",
  discipline: "stoicism",
  quit:       "dopamine",
  learning:   "meditation",
  balance:    "getting_started",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function OnboardingScreen({ state, save }) {
  // Steps:
  //  0 Welcome
  //  1 Quick tour (5 features on one screen)
  //  2 Profile (name + avatar)
  //  3 Position — activity + sleep
  //  4 Vices (optional)
  //  5 Goal + time commitment
  //  6 Domains (pre-selected from goal)
  //  7 Ready
  const TOTAL_STEPS = 8;
  const [step, setStep] = useState(0);

  // Profile
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  // Position
  const [activity, setActivity] = useState(null);
  const [sleep, setSleep] = useState(null);
  // Vices
  const [vices, setVices] = useState([]);
  // Goals
  const [goal, setGoal] = useState(null);
  const [timeCommit, setTimeCommit] = useState(null);
  // Domains (auto-set when entering step 6, but user can adjust)
  const [domains, setDomains] = useState([]);

  // When we enter step 6, pre-populate domains from goal — but only if user
  // hasn't touched them yet (i.e., domains is still empty).
  function applyGoalDomainSuggestion(g) {
    const suggested = (GOAL_DOMAIN_MAP[g] || [])
      .filter((id) => CATEGORIES.find((c) => c.id === id));
    if (domains.length === 0 && suggested.length > 0) {
      setDomains(suggested.slice(0, 5));
    }
  }

  function toggleVice(id) {
    setVices((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  }
  function toggleDomain(id) {
    setDomains((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  }

  // Validation per-step
  const canProceed = (() => {
    if (step === 3) return !!(activity && sleep);
    if (step === 5) return !!(goal && timeCommit);
    if (step === 6) return domains.length >= 3;
    return true;
  })();

  // Legacy users (no profile yet) get the FULL questionnaire on replay so they
  // can retroactively calibrate. Users who already have a profile skip past
  // the questionnaire to avoid wiping their existing setup.
  const hasProfile = !!state.profile?.primaryGoal;
  const skipQuestionnaire = state._replayTour && hasProfile;

  function next() {
    if (step === TOTAL_STEPS - 1) return finish();
    // Replay tour with existing profile: jump from Profile straight to Ready
    if (skipQuestionnaire && step === 2) {
      setStep(TOTAL_STEPS - 1);
      return;
    }
    if (step === 5) applyGoalDomainSuggestion(goal);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    if (skipQuestionnaire && step === TOTAL_STEPS - 1) {
      setStep(2);
      return;
    }
    setStep((s) => s - 1);
  }

  function finish() {
    // ── Replay tour for users who already have a profile: just refresh name/avatar ──
    if (skipQuestionnaire) {
      save({
        ...state,
        onboarded: true,
        _replayTour: false,
        userName: name.trim() || state.userName,
        avatar: avatar || state.avatar,
      });
      return;
    }

    // ── Onboarding finish: seed everything from the questionnaire ──
    // For legacy users replaying with no prior profile we PRESERVE their
    // existing roster (don't wipe it) and only fill gaps.
    const isLegacyReplay = state._replayTour;
    const today = getTodayStr();
    const perCategory = timeCommit === "long" ? 2 : 1;

    // 1) Active quest roster
    let activeQuests;
    if (isLegacyReplay) {
      // Keep existing quests + add picks for any newly selected category
      // they don't already have anything for.
      const existingByCat = new Set(
        (state.activeQuests || []).map((aq) => (aq.libraryId || "").split("-")[0])
      );
      activeQuests = [...(state.activeQuests || [])];
      domains.forEach((catId) => {
        if (existingByCat.has(catId)) return;
        const picks = getCalibratedStartersForCategory(catId, timeCommit || "short", perCategory);
        picks.forEach((q, i) => activeQuests.push({
          id: `aq-${catId}-${i}-${Date.now()}`,
          libraryId: q.id,
          addedAt: Date.now(),
          paused: false,
        }));
      });
    } else {
      activeQuests = [];
      domains.forEach((catId) => {
        const picks = getCalibratedStartersForCategory(catId, timeCommit || "short", perCategory);
        picks.forEach((q, i) => activeQuests.push({
          id: `aq-${catId}-${i}-${Date.now()}`,
          libraryId: q.id,
          addedAt: Date.now(),
          paused: false,
        }));
      });
    }

    // 2) Forge trackers — auto-create one entry per vice the user wants to quit
    //    (only adds new ones; never resets a tracker that's already running)
    const sobrietyDates = { ...(state.sobrietyDates || {}) };
    vices.forEach((id) => { if (!sobrietyDates[id]) sobrietyDates[id] = today; });

    // 3) Academy: pin a course aligned with the primary goal
    const suggestedCourseId = GOAL_COURSE_MAP[goal] || "getting_started";
    const academyFocus = Array.from(new Set([...(state.academyFocus || []), suggestedCourseId]));

    save({
      ...state,
      onboarded: true,
      // Preserve the user's actual journey start on legacy replays
      startDate: isLegacyReplay ? (state.startDate || today) : today,
      _replayTour: false,
      activeQuests,
      sobrietyDates,
      academyFocus,
      userName: name.trim() || state.userName,
      avatar: avatar || state.avatar,
      profile: {
        activityLevel: activity,
        sleepQuality: sleep,
        primaryGoal: goal,
        timeCommitment: timeCommit,
        vices,
        setAt: today,
      },
    });
  }

  // Derived for the Ready screen summary.
  // On replay tour, fall back to the user's current state so the counts
  // reflect their actual roster (the questionnaire steps are skipped).
  const summary = useMemo(() => {
    if (state._replayTour) {
      // Pull from existing state — derive a "domain count" from unique
      // categories present in the active roster.
      const activeRoster = (state.activeQuests || []).filter((aq) => !aq.paused);
      const activeCats = new Set();
      activeRoster.forEach((aq) => {
        const libId = aq.libraryId || "";
        const cat = libId.split("-")[0];
        if (cat) activeCats.add(cat);
      });
      return {
        questCount: activeRoster.length,
        viceCount: Object.keys(state.sobrietyDates || {}).length,
        domainCount: activeCats.size,
        course: state.academyFocus?.[0],
      };
    }
    return {
      questCount: domains.length * (timeCommit === "long" ? 2 : 1),
      viceCount: vices.length,
      domainCount: domains.length,
      course: GOAL_COURSE_MAP[goal],
    };
  }, [state, domains, timeCommit, vices, goal]);

  return (
    <div style={styles.container}>
      <div style={styles.stepIndicator}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              background: i <= step ? TOKENS.color.text : TOKENS.color.border,
              width: i === step ? 24 : 8,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          style={styles.content}
        >
          {step === 0 && <WelcomeStep />}
          {step === 1 && <QuickTourStep />}
          {step === 2 && (
            <ProfileStep name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} />
          )}
          {step === 3 && (
            <PositionStep activity={activity} setActivity={setActivity} sleep={sleep} setSleep={setSleep} />
          )}
          {step === 4 && (
            <VicesStep vices={vices} toggleVice={toggleVice} />
          )}
          {step === 5 && (
            <GoalsStep goal={goal} setGoal={setGoal} timeCommit={timeCommit} setTimeCommit={setTimeCommit} />
          )}
          {step === 6 && (
            <DomainsStep domains={domains} toggleDomain={toggleDomain} suggestedFromGoal={(GOAL_DOMAIN_MAP[goal] || [])} />
          )}
          {step === 7 && <ReadyStep summary={summary} />}
        </motion.div>
      </AnimatePresence>

      <div style={styles.footer}>
        <button
          onClick={next}
          disabled={!canProceed}
          style={{
            ...styles.btn,
            opacity: canProceed ? 1 : 0.4,
            cursor: canProceed ? "pointer" : "default",
          }}
        >
          {step === TOTAL_STEPS - 1 ? "Start Day 1" : "Continue"}
          <ArrowRight size={16} />
        </button>
        {step > 0 && (
          <button onClick={back} style={styles.backBtn} aria-label="Close">
            Back
          </button>
        )}
        {/* Optional skip for vices since not everyone has one */}
        {step === 4 && vices.length === 0 && (
          <button onClick={() => setStep(5)} style={styles.skipBtn}>
            Skip — nothing to quit right now
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div style={styles.center}>
      <motion.div
        style={styles.heroGradient}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <span style={{ fontSize: 56 }}>⚡</span>
      </motion.div>
      <h1 style={styles.title}>Life OS</h1>
      <p style={styles.tagline}>Build the life. One habit at a time.</p>
      <p style={styles.sub}>
        Track quests, forge sobriety, train your body, learn from the best. We'll set you up in 2 minutes.
      </p>
    </div>
  );
}

function QuickTourStep() {
  return (
    <div style={{ paddingTop: TOKENS.space[2] }}>
      <h1 style={styles.title}>What's inside</h1>
      <p style={styles.sub}>Five tools, one daily practice.</p>
      <div style={styles.tourGrid}>
        {FEATURE_CARDS.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{ ...styles.tourCard, borderColor: `${f.color}22` }}>
              <div style={{ ...styles.tourIcon, background: f.color }}>
                <Icon size={18} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.tourTitle}>{f.title}</div>
                <div style={styles.tourBody}>{f.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileStep({ name, setName, avatar, setAvatar }) {
  return (
    <div>
      <h1 style={styles.title}>Make it yours</h1>
      <p style={styles.sub}>Pick a name and a spirit animal. You can change both later.</p>
      <div style={styles.inputWrap}>
        <label style={styles.inputLabel}>Your name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Warrior"
          style={styles.input}
          maxLength={24}
        />
      </div>
      <div style={styles.inputLabel}>Avatar</div>
      <div style={styles.avatarGrid}>
        {ANIMAL_AVATARS.slice(0, 9).map((a) => {
          const selected = avatar === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAvatar(a.id)}
              style={{
                ...styles.avatarBtn,
                background: selected ? `${a.bgColor}15` : TOKENS.color.surface,
                borderColor: selected ? a.bgColor : "transparent",
              }}
            >
              {renderAnimalAvatar(a.id, 56)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PositionStep({ activity, setActivity, sleep, setSleep }) {
  return (
    <div>
      <h1 style={styles.title}>Where you are now</h1>
      <p style={styles.sub}>So we can calibrate your starting load — no judgment.</p>

      <SubHeader icon={Activity} label="How active are you?" color="#EF4444" />
      <div style={styles.optionList}>
        {ACTIVITY_OPTIONS.map((o) => (
          <OptionCard key={o.id} option={o} selected={activity === o.id} onClick={() => setActivity(o.id)} accent="#EF4444" />
        ))}
      </div>

      <SubHeader icon={Moon} label="How's your sleep?" color="#7C5CFC" />
      <div style={styles.optionList}>
        {SLEEP_OPTIONS.map((o) => (
          <OptionCard key={o.id} option={o} selected={sleep === o.id} onClick={() => setSleep(o.id)} accent="#7C5CFC" />
        ))}
      </div>
    </div>
  );
}

function VicesStep({ vices, toggleVice }) {
  return (
    <div>
      <h1 style={styles.title}>Anything to quit?</h1>
      <p style={styles.sub}>
        Pick anything you want to stop. We'll start a Forge tracker today so you can rack up clean days.
      </p>
      <div style={styles.viceGrid}>
        {VICE_OPTIONS.map((v) => {
          const selected = vices.includes(v.id);
          return (
            <button
              key={v.id}
              onClick={() => toggleVice(v.id)}
              style={{
                ...styles.viceChip,
                background: selected ? "rgba(249,115,22,0.10)" : TOKENS.color.surface,
                borderColor: selected ? "#F97316" : "transparent",
                color: selected ? "#F97316" : TOKENS.color.text,
              }}
            >
              <span style={{ fontSize: 18 }}>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>
      <div style={styles.countHint}>
        {vices.length === 0 ? "Nothing selected — feel free to skip" : `${vices.length} tracker${vices.length > 1 ? "s" : ""} will start at Day 1`}
      </div>
    </div>
  );
}

function GoalsStep({ goal, setGoal, timeCommit, setTimeCommit }) {
  return (
    <div>
      <h1 style={styles.title}>What you want most</h1>
      <p style={styles.sub}>This shapes the first quests + courses we set up for you.</p>

      <SubHeader icon={Flag} label="Primary goal" color="#7C5CFC" />
      <div style={styles.goalList}>
        {GOAL_OPTIONS.map((g) => {
          const selected = goal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              style={{
                ...styles.goalCard,
                background: selected ? `${g.color}10` : TOKENS.color.surface,
                borderColor: selected ? g.color : "transparent",
              }}
            >
              <span style={{ fontSize: 24 }}>{g.emoji}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ ...styles.optionLabel, color: selected ? g.color : TOKENS.color.text }}>{g.label}</div>
                <div style={styles.optionSub}>{g.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      <SubHeader icon={Clock} label="Time per day" color="#22C55E" />
      <div style={styles.timeRow}>
        {TIME_OPTIONS.map((t) => {
          const selected = timeCommit === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTimeCommit(t.id)}
              style={{
                ...styles.timeChip,
                background: selected ? "rgba(34,197,94,0.10)" : TOKENS.color.surface,
                borderColor: selected ? "#22C55E" : "transparent",
                color: selected ? "#16A34A" : TOKENS.color.text,
              }}
            >
              <div style={styles.timeLabel}>{t.label}</div>
              <div style={styles.timeSub}>{t.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DomainsStep({ domains, toggleDomain, suggestedFromGoal }) {
  return (
    <div>
      <h1 style={styles.title}>Your focus areas</h1>
      <p style={styles.sub}>We picked these based on your goal. Tweak as you like — 3 to 6 work best.</p>
      <div style={styles.domainGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = domains.includes(cat.id);
          const isSuggested = suggestedFromGoal.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleDomain(cat.id)}
              style={{
                ...styles.domainChip,
                background: isSelected ? `${cat.color}14` : TOKENS.color.surface,
                borderColor: isSelected ? cat.color : isSuggested ? `${cat.color}55` : TOKENS.color.border,
                color: isSelected ? cat.color : TOKENS.color.textSecondary,
              }}
            >
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <span style={styles.domainText}>{cat.label}</span>
              {isSuggested && !isSelected && (
                <span style={styles.suggestedDot} title="Suggested" />
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.countHint}>
        {domains.length}/6 selected · need at least 3
      </div>
    </div>
  );
}

function ReadyStep({ summary }) {
  return (
    <div style={styles.center}>
      <motion.div
        style={styles.readyGlow}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <Sparkles size={48} color="#fff" />
      </motion.div>
      <h1 style={styles.title}>You're set up</h1>
      <p style={styles.sub}>
        Tailored to where you are and where you want to go.
      </p>

      <div style={styles.readyStatsRow}>
        <div style={styles.readyStat}>
          <div style={styles.readyStatVal}>{summary.questCount}</div>
          <div style={styles.readyStatLabel}>starter quests</div>
        </div>
        {summary.viceCount > 0 && (
          <div style={styles.readyStat}>
            <div style={styles.readyStatVal}>{summary.viceCount}</div>
            <div style={styles.readyStatLabel}>forge trackers</div>
          </div>
        )}
        <div style={styles.readyStat}>
          <div style={styles.readyStatVal}>{summary.domainCount}</div>
          <div style={styles.readyStatLabel}>focus domains</div>
        </div>
      </div>

      <div style={styles.readyHint}>
        Browse {QUEST_LIBRARY_COUNT}+ habits any time from <strong>Today → Browse quests</strong>.
        Your plan adapts as you go.
      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function SubHeader({ icon: Icon, label, color }) {
  return (
    <div style={styles.subHeader}>
      <Icon size={14} color={color} />
      <span style={{ ...styles.subHeaderLabel, color }}>{label}</span>
    </div>
  );
}

function OptionCard({ option, selected, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.optionCard,
        background: selected ? `${accent}10` : TOKENS.color.surface,
        borderColor: selected ? accent : "transparent",
      }}
    >
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ ...styles.optionLabel, color: selected ? accent : TOKENS.color.text }}>{option.label}</div>
        <div style={styles.optionSub}>{option.sub}</div>
      </div>
      {selected && <div style={{ ...styles.checkDot, background: accent }} />}
    </button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = {
  container: {
    minHeight: "100dvh",
    display: "flex", flexDirection: "column",
    padding: `${TOKENS.space[7]}px ${TOKENS.space[6]}px ${TOKENS.space[7]}px`,
    background: TOKENS.color.bg,
  },
  stepIndicator: {
    display: "flex", gap: 6, marginBottom: TOKENS.space[6],
  },
  dot: {
    height: 8, width: 8, borderRadius: 4,
    transition: TOKENS.transition.normal,
  },
  content: { flex: 1, display: "flex", flexDirection: "column", paddingTop: TOKENS.space[4] },
  center: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "12%" },
  heroGradient: {
    width: 112, height: 112, borderRadius: 32,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: TOKENS.space[6],
    boxShadow: "0 16px 40px rgba(124,92,252,0.3)",
  },
  title: {
    fontSize: TOKENS.font.size.xxl,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    margin: 0, letterSpacing: -0.5,
  },
  tagline: {
    fontSize: TOKENS.font.size.md,
    color: TOKENS.color.brand,
    fontWeight: TOKENS.font.weight.bold,
    margin: `${TOKENS.space[2]}px 0 0`,
  },
  sub: {
    fontSize: TOKENS.font.size.md,
    color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[3],
    lineHeight: 1.6,
  },
  // Quick tour
  tourGrid: {
    display: "flex", flexDirection: "column", gap: TOKENS.space[3],
    marginTop: TOKENS.space[6],
  },
  tourCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    borderRadius: TOKENS.radius.lg,
    border: "1px solid",
    background: TOKENS.color.surface,
  },
  tourIcon: {
    width: 36, height: 36, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  tourTitle: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text },
  tourBody: { fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary, marginTop: 2 },
  // Profile
  inputWrap: { marginTop: TOKENS.space[6] },
  inputLabel: {
    display: "block", fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: TOKENS.space[3], marginTop: TOKENS.space[5],
  },
  input: {
    width: "100%", padding: "14px 16px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface, fontSize: TOKENS.font.size.md,
    color: TOKENS.color.text, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  },
  avatarGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: TOKENS.space[3],
  },
  avatarBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: TOKENS.space[3], borderRadius: TOKENS.radius.lg,
    border: "2px solid transparent", cursor: "pointer",
    background: TOKENS.color.surface, transition: TOKENS.transition.fast,
  },
  // Position / sub-section heading
  subHeader: {
    display: "flex", alignItems: "center", gap: 6,
    marginTop: TOKENS.space[6], marginBottom: TOKENS.space[3],
  },
  subHeaderLabel: {
    fontSize: 11, fontWeight: 900, letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  optionList: { display: "flex", flexDirection: "column", gap: TOKENS.space[2] },
  optionCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[4]}px`,
    borderRadius: TOKENS.radius.lg,
    border: "2px solid transparent",
    cursor: "pointer", transition: TOKENS.transition.fast,
    width: "100%",
  },
  optionLabel: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold },
  optionSub: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: 2, lineHeight: 1.4,
  },
  checkDot: {
    width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
  },
  // Vices
  viceGrid: {
    display: "flex", flexWrap: "wrap", gap: TOKENS.space[2],
    marginTop: TOKENS.space[6],
  },
  viceChip: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: TOKENS.radius.full,
    borderWidth: 1.5, borderStyle: "solid",
    cursor: "pointer", transition: TOKENS.transition.fast,
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold,
  },
  // Goals
  goalList: {
    display: "flex", flexDirection: "column", gap: TOKENS.space[2],
  },
  goalCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[4]}px`,
    borderRadius: TOKENS.radius.lg,
    border: "2px solid transparent",
    cursor: "pointer", transition: TOKENS.transition.fast,
    width: "100%",
  },
  timeRow: {
    display: "flex", gap: TOKENS.space[2],
  },
  timeChip: {
    flex: 1, padding: `${TOKENS.space[3]}px ${TOKENS.space[3]}px`,
    borderRadius: TOKENS.radius.md,
    border: "2px solid transparent",
    cursor: "pointer", transition: TOKENS.transition.fast,
    textAlign: "center",
  },
  timeLabel: { fontSize: TOKENS.font.size.xs, fontWeight: 900 },
  timeSub: { fontSize: 10, color: TOKENS.color.textTertiary, marginTop: 2 },
  // Domains
  domainGrid: {
    display: "flex", flexWrap: "wrap", gap: TOKENS.space[3],
    marginTop: TOKENS.space[6],
  },
  domainChip: {
    position: "relative",
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: TOKENS.radius.full,
    borderWidth: 1.5, borderStyle: "solid",
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  domainText: {
    fontWeight: TOKENS.font.weight.semibold,
    fontSize: TOKENS.font.size.sm,
  },
  suggestedDot: {
    width: 5, height: 5, borderRadius: "50%",
    background: "currentColor", marginLeft: 2,
  },
  countHint: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[5], textAlign: "center",
    fontWeight: TOKENS.font.weight.medium,
  },
  // Ready
  readyGlow: {
    width: 112, height: 112, borderRadius: "50%",
    background: "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: TOKENS.space[6],
    boxShadow: "0 16px 40px rgba(34,197,94,0.3)",
  },
  readyStatsRow: {
    display: "flex", gap: TOKENS.space[3],
    marginTop: TOKENS.space[6], justifyContent: "center",
    flexWrap: "wrap",
  },
  readyStat: {
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    minWidth: 88,
  },
  readyStatVal: {
    fontSize: 28, fontWeight: 900, color: TOKENS.color.text,
    letterSpacing: -0.5,
  },
  readyStatLabel: {
    fontSize: 10, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.semibold,
    textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2,
  },
  readyHint: {
    marginTop: TOKENS.space[6],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.16)",
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.xs,
    color: "#92400E",
    fontWeight: TOKENS.font.weight.semibold,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    display: "flex", flexDirection: "column",
    gap: TOKENS.space[2], paddingTop: TOKENS.space[6],
  },
  btn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "16px",
    borderRadius: TOKENS.radius.lg, border: "none",
    background: TOKENS.color.text, color: "#fff",
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    transition: TOKENS.transition.fast,
  },
  backBtn: {
    width: "100%", padding: "12px",
    border: "none", background: "transparent",
    color: TOKENS.color.textTertiary, fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.medium, cursor: "pointer",
  },
  skipBtn: {
    width: "100%", padding: "8px",
    border: "none", background: "transparent",
    color: TOKENS.color.textTertiary, fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.medium, cursor: "pointer",
    textDecoration: "underline",
  },
};
