import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S } from "./styles/theme";
import { MOTIVATION_CARDS, COURSES, FORGE_SUCCESS_STORIES, FORGE_MILESTONES } from "./data";
import { getPersonalizedQuote } from "./utils/intelligence";
import { applyStreakMultiplier, getStreakMultiplier, getWeeklyChallenge } from "./utils/xpEngine";
import {
  getTodayStr, getDayQuests, getLevelIndex, daysBetween,
  getCalendarDay, getCategoryStreak, defaultState,
} from "./utils";
import { useTrophies, useAuth, useCloudSync, PremiumProvider, usePremium, ThemeProvider, useTheme, LifeOSProvider, useLifeOS, PomodoroProvider, usePomodoroContext } from "./hooks";
import { firebaseConfigured } from "./firebase";
import { injectGlobalStyles } from "./styles/global";

import LoadingScreen from "./components/LoadingScreen";
import AuthScreen from "./components/AuthScreen";
import Onboarding from "./components/Onboarding";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import MotivationModal from "./components/modals/MotivationModal";
import MorningBrief from "./components/MorningBrief";
import Confetti from "./components/Confetti";
import DayCompleteModal from "./components/modals/DayCompleteModal";
import { ToastProvider, useToast } from "./components/Toast";
import WorkoutModal from "./components/modals/WorkoutModal";
import RelapseModal from "./components/modals/RelapseModal";
import BossModal from "./components/modals/BossModal";
import LevelUpModal from "./components/modals/LevelUpModal";
import ForgeSuccessModal from "./components/modals/ForgeSuccessModal";
import CustomQuestModal from "./components/modals/CustomQuestModal";
import NotificationSettingsModal from "./components/modals/NotificationSettingsModal";
import ComebackModal from "./components/modals/ComebackModal";
import DashboardView from "./components/views/DashboardView";
const HomeView = lazy(() => import("./components/views/HomeView"));
const JournalView = lazy(() => import("./components/views/JournalView"));
const AcademyView = lazy(() => import("./components/views/AcademyView"));
const ForgeView = lazy(() => import("./components/views/ForgeView"));
const DojoView = lazy(() => import("./components/views/DojoView"));
const ProfileView = lazy(() => import("./components/views/ProfileView"));
const AnalyticsView = lazy(() => import("./components/views/AnalyticsView"));
const SocialView = lazy(() => import("./components/views/SocialView"));
import { updatePublicProfile } from "./utils/social";
import UpgradeScreen from "./components/UpgradeScreen";
import WeeklySummaryBanner from "./components/WeeklySummaryBanner";
import { computeWeeklySummary, sendNotification, checkStreakAtRisk, getDefaultNotificationSettings, scheduleNotificationCheck } from "./utils/notifications";
import { playSound } from "./utils/audio";

injectGlobalStyles();

// All courses in one array — tier 2 gating handled by AcademyView
const ALL_COURSES = COURSES;

export default function LifeOSRoot() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LifeOS />
      </ToastProvider>
    </ThemeProvider>
  );
}

function LifeOS() {
  const { user, loading: authLoading } = useAuth();
  const { state, loading, save, showOnboarding, setShowOnboarding } = useCloudSync(user);
  const { checkTrophies } = useTrophies();
  const toast = useToast();
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);

  // Celebration triggers (increment to fire)
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [confettiPop, setConfettiPop] = useState(0);

  // Dojo state
  const [workoutExercise, setWorkoutExercise] = useState(null);
  const [workoutSets, setWorkoutSets] = useState([{ weight: "", reps: "" }]);

  // Forge relapse
  const [relapseTracker, setRelapseTracker] = useState(null);
  const [relapseText, setRelapseText] = useState("");

  // Boss level
  const [bossDay, setBossDay] = useState(null);

  // Level-up detection
  const [levelUpIndex, setLevelUpIndex] = useState(null);
  const prevLevelRef = useRef(null);
  const comebackCheckedRef = useRef(false);
  const forgeMilestoneQueueRef = useRef([]);

  // Day completion celebration
  const [dayCompleteDay, setDayCompleteDay] = useState(null);

  // Forge success story
  const [forgeStory, setForgeStory] = useState(null);

  // Weekly summary
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  // Comeback modal
  const [comebackInfo, setComebackInfo] = useState(null);

  // Notification scheduler
  const notifIntervalRef = useRef(null);

  // Track level changes to trigger level-up modal
  useEffect(() => {
    if (!state) return;
    const currentLvl = getLevelIndex(state.xp);
    if (prevLevelRef.current !== null && currentLvl > prevLevelRef.current) {
      setLevelUpIndex(currentLvl);
      setModal("levelup");
      setConfettiBurst((c) => c + 1);
      playSound("levelUp");
    }
    prevLevelRef.current = currentLvl;
  }, [state?.xp]);

  // Streak freeze used notification
  useEffect(() => {
    if (!state) return;
    const today = getTodayStr();
    if (state.streakFreezeUsedDate === today) {
      toast.show("Streak freeze used — streak preserved!", "info", 4000);
    }
  }, [state?.streakFreezeUsedDate]);

  // Comeback detection — show modal if returning after 2+ days
  useEffect(() => {
    if (!state || comebackCheckedRef.current) return;
    comebackCheckedRef.current = true;
    const last = state.lastActiveDate;
    if (!last) return;
    const today = new Date(getTodayStr());
    const lastDate = new Date(last);
    const diffDays = Math.round((today - lastDate) / 86400000);
    if (diffDays >= 2) {
      setComebackInfo({ daysAway: diffDays, streak: state.streak });
    }
  }, [state?.lastActiveDate]);

  // Weekly challenge completion check
  useEffect(() => {
    if (!state || state.currentDay < 7) return;
    const wc = getWeeklyChallenge(state);
    if (!wc || !wc.completed) return;
    const claimedKey = `wc_${wc.weekNum}_${wc.id}`;
    if (state.weeklyChallengeClaimed?.[claimedKey]) return;
    // Award XP and mark claimed
    const ns = {
      ...state,
      xp: state.xp + wc.xpReward,
      weeklyChallengeClaimed: { ...(state.weeklyChallengeClaimed || {}), [claimedKey]: true },
    };
    save(ns);
    showXp(wc.xpReward);
    toast.show(`Weekly challenge completed! +${wc.xpReward} XP`, "trophy", 4000);
    setConfettiBurst((c) => c + 1);
  }, [state?.completedDays, state?.completedQuests, state?.streak, state?.workoutLogs]);

  // Morning Brief — shows full-screen brief on first daily open
  useEffect(() => {
    if (state && !modal && (view === "home" || view === "dashboard")) {
      const today = getTodayStr();
      if (!state.motivationSeen?.includes(today)) {
        setTimeout(() => setModal("morning_brief"), 500);
      }
    }
  }, [state?.currentDay, view]);

  // Feature Set 2: Check forge milestones whenever forge view opens
  useEffect(() => {
    if (!state || view !== "forge" || modal) return;
    checkForgeMilestones();
  }, [view]);

  // Notification scheduler
  useEffect(() => {
    if (!state) return;
    const settings = state.notificationSettings || getDefaultNotificationSettings();
    if (!settings.enabled) return;

    if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    notifIntervalRef.current = scheduleNotificationCheck(state, settings, {
      onReminder: (label) => sendNotification("Life OS Reminder", label),
      onStreakRisk: () => sendNotification("Streak at Risk!", "You haven't completed any quests today. Don't break your streak!"),
    });

    return () => {
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [state?.notificationSettings?.enabled, state?.currentDay]);

  // Weekly summary check — show on Sundays (or user-set day) if not dismissed this week
  useEffect(() => {
    if (!state) return;
    const settings = state.notificationSettings || getDefaultNotificationSettings();
    const today = new Date();
    if (today.getDay() === (settings.weeklySummaryDay ?? 0)) {
      const todayStr = getTodayStr();
      if (state.weeklySummaryDismissed !== todayStr && state.currentDay > 7) {
        setShowWeeklySummary(true);
      }
    }
  }, [state?.currentDay]);

  // Sync public profile to Firestore for leaderboard/social
  useEffect(() => {
    if (!user || !state) return;
    updatePublicProfile(user.uid, {
      displayName: user.displayName || state.userName || "Warrior",
      photoURL: state.avatar?.type === "photo" ? state.avatar.value : (user.photoURL || null),
      avatar: state.avatar || null,
      xp: state.xp,
      streak: state.streak,
      level: getLevelIndex(state.xp),
      currentDay: state.currentDay,
    });
  }, [user?.uid, state?.xp, state?.streak, state?.currentDay, state?.avatar]);

  const [skipAuth, setSkipAuth] = useState(false);

  if (authLoading) return <LoadingScreen />;
  if (firebaseConfigured && !user && !skipAuth) return <AuthScreen onAuth={() => {}} onSkip={() => setSkipAuth(true)} />;
  if (loading || !state) return <LoadingScreen />;

  if (showOnboarding) {
    return (
      <Onboarding
        onFinish={(preferences) => {
          const updates = { ...state, onboarded: true };
          if (preferences) {
            if (preferences.focusCategories) updates.focusCategories = preferences.focusCategories;
            if (preferences.forgeTrackers) {
              const dates = {};
              preferences.forgeTrackers.forEach((id) => { dates[id] = getTodayStr(); });
              updates.sobrietyDates = { ...state.sobrietyDates, ...dates };
            }
            if (preferences.userName) updates.userName = preferences.userName;
          }
          save(updates);
          setShowOnboarding(false);
        }}
      />
    );
  }

  // ── Derived values ──
  const day = state.currentDay;
  const calendarDay = getCalendarDay(state.startDate);
  const maxAllowedDay = 999;

  // Feature Set 1: Temporal lock — can the user advance?
  const previousDayCompleted = day === 1 || state.completedDays[day - 1];
  const calendarAllowsAdvance = calendarDay > day;
  const canCompleteDay = previousDayCompleted && calendarAllowsAdvance;

  // Feature Set 3: Custom quests unlock after Day 3 — all categories open at once
  const customQuestsUnlocked = day >= 4; // Completed 3 days
  const unlockedCustomCategories = customQuestsUnlocked
    ? ["sleep", "water", "exercise", "mind", "screen", "shower", "nutrition", "reading", "work", "social", "finance", "creative"]
    : [];

  // Feature Set 4: Quests now include custom quests
  const quests = getDayQuests(day, state.customQuests, state);
  const completed = state.completedQuests[day] || [];
  const allDone = completed.length === quests.length && quests.length > 0;

  // ── Helpers ──
  function showXp(val) {
    setXpPopup({ xp: val, id: Date.now() });
    setTimeout(() => setXpPopup(null), 1200);
  }

  // ── Feature Set 2: Check Forge Milestones ──

  function checkForgeMilestones() {
    const seen = state.forgeStoriesSeen || {};
    const pending = [];
    for (const [trackerId, startDate] of Object.entries(state.sobrietyDates || {})) {
      if (!startDate) continue;
      const daysClean = daysBetween(startDate);
      const stories = FORGE_SUCCESS_STORIES[trackerId];
      if (!stories) continue;
      for (const milestone of FORGE_MILESTONES) {
        const key = `${trackerId}-${milestone}`;
        if (daysClean >= milestone && !seen[key]) {
          const story = stories.find((s) => s.day === milestone);
          if (story) {
            const labels = { smoking: "Smoking", alcohol: "Alcohol", junkfood: "Junk Food", social_media: "Doomscrolling" };
            pending.push({ story, trackerLabel: labels[trackerId] || trackerId, daysClean: milestone, key });
          }
        }
      }
    }
    if (pending.length > 0) {
      forgeMilestoneQueueRef.current = pending;
      setForgeStory(pending[0]);
      setModal("forge_success");
    }
  }

  function dismissForgeSuccess() {
    // Mark all milestones as seen at once
    const allMilestones = forgeMilestoneQueueRef.current;
    if (allMilestones.length > 0) {
      const newSeen = { ...(state.forgeStoriesSeen || {}) };
      allMilestones.forEach((m) => { newSeen[m.key] = true; });
      save({ ...state, forgeStoriesSeen: newSeen });
    }
    forgeMilestoneQueueRef.current = [];
    setForgeStory(null);
    setModal(null);
  }

  // ── Quest Actions ──
  // Check a quest (one-way click — unchecking uses uncheckQuest via swipe)
  function checkQuest(questId, xpVal) {
    const dc = [...completed];
    if (dc.includes(questId)) return; // already done
    dc.push(questId);
    const boostedXp = applyStreakMultiplier(xpVal, state.streak);
    const newXp = state.xp + boostedXp;
    showXp(boostedXp);
    const ns = { ...state, xp: newXp, completedQuests: { ...state.completedQuests, [day]: dc } };
    const { unlocked, xpBonus, newlyUnlocked } = checkTrophies(ns);
    if (xpBonus > 0) showXp(xpBonus);
    const finalState = { ...ns, xp: ns.xp + xpBonus, unlockedTrophies: unlocked };
    save(finalState);
    playSound("questCheck");
    // Confetti only for trophy unlocks or completing all quests
    const allQuestsDone = dc.length === getDayQuests(day, state.customQuests, state).length;
    if (newlyUnlocked?.length > 0 || allQuestsDone) {
      setConfettiPop((c) => c + 1);
      if (newlyUnlocked?.length > 0) playSound("levelUp");
    }
    // Toast for trophy unlocks
    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((t) => toast.show(`Trophy unlocked: ${t.name}!`, "trophy", 4000));
    }
  }

  // Uncheck a quest (called only via swipe gesture)
  function uncheckQuest(questId, xpVal) {
    const dc = [...completed];
    if (!dc.includes(questId)) return;
    dc.splice(dc.indexOf(questId), 1);
    const newXp = Math.max(0, state.xp - xpVal);
    const ns = { ...state, xp: newXp, completedQuests: { ...state.completedQuests, [day]: dc } };
    save(ns);
  }

  function completeDay() {
    if (!allDone) return;
    // Feature Set 1: Temporal lock
    if (!canCompleteDay) return;
    const newStreak = state.streak + 1;
    const newDay = Math.min(day + 1, maxAllowedDay);
    const ns = {
      ...state,
      completedDays: { ...state.completedDays, [day]: true },
      currentDay: newDay,
      streak: newStreak,
      bestStreak: Math.max(state.bestStreak, newStreak),
      lastActiveDate: getTodayStr(),
    };
    const { unlocked, xpBonus, newlyUnlocked } = checkTrophies(ns);
    if (xpBonus > 0) showXp(xpBonus);
    save({ ...ns, xp: ns.xp + xpBonus, unlockedTrophies: unlocked });
    setConfettiBurst((c) => c + 1);
    playSound("dayComplete");
    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((t) => toast.show(`Trophy unlocked: ${t.name}!`, "trophy", 4000));
    }
    if (day === 21 || day === 66) {
      setBossDay(day);
      setModal("boss");
    } else {
      // Show day completion celebration (skip on boss days — boss modal takes priority)
      setDayCompleteDay(day);
      setModal("day_complete");
    }
  }

  // Feature Set 5: progressLifecycle — called when boss modal is dismissed
  function progressLifecycle() {
    const bossClears = { ...(state.bossClears || {}) };
    let xpBonus = 0;
    let masteryMode = state.masteryMode || false;

    if (bossDay && !bossClears[bossDay]) {
      bossClears[bossDay] = true;
      xpBonus = bossDay === 66 ? 500 : 100;

      if (bossDay === 66) {
        masteryMode = true;
      }
    }

    const ns = {
      ...state,
      bossClears,
      masteryMode,
      xp: state.xp + xpBonus,
    };
    if (xpBonus > 0) showXp(xpBonus);

    const { unlocked, xpBonus: tXp } = checkTrophies(ns);
    if (tXp > 0) showXp(tXp);
    save({ ...ns, xp: ns.xp + tXp, unlockedTrophies: unlocked });
    setModal(null);
    setBossDay(null);
  }

  function dismissMotivation() {
    save({ ...state, motivationSeen: [...(state.motivationSeen || []), getTodayStr()] });
    setModal(null);
  }

  // ── Journal ──
  function saveJournal() {
    save({
      ...state,
      journal: { ...state.journal, [day]: journalText || state.journal[day] },
      moods: { ...state.moods, [day]: selectedMood ?? state.moods[day] },
    });
    toast.show("Journal saved", "success", 2000);
    setView("home");
  }

  // Save raw journal content (used by chat journal for auto-save)
  function saveJournalRaw(rawContent) {
    save({
      ...state,
      journal: { ...state.journal, [day]: rawContent },
      moods: { ...state.moods, [day]: selectedMood ?? state.moods[day] },
    });
  }

  // ── Dojo ──
  function saveWorkout() {
    if (!workoutExercise) return;
    const validSets = workoutSets
      .filter((s) => s.weight && s.reps)
      .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) }));
    if (validSets.length === 0) return;
    doSaveWorkout(workoutExercise, validSets);
    setModal(null);
    setWorkoutExercise(null);
    setWorkoutSets([{ weight: "", reps: "" }]);
  }

  // Shared workout save logic (used by both modal and DojoView)
  function doSaveWorkout(exercise, validSets) {
    const volume = validSets.reduce((a, s) => a + s.weight * s.reps, 0);
    const bonusXp = Math.floor(volume / 100);
    const todayKey = getTodayStr();
    const existing = state.workoutLogs[todayKey] || [];
    const newEntry = { exercise, sets: validSets, time: Date.now() };
    const isNewDay = state.lastLiftDate !== todayKey;
    const newLiftStreak = isNewDay ? (state.liftingStreak || 0) + 1 : state.liftingStreak || 0;
    const ns = {
      ...state,
      workoutLogs: { ...state.workoutLogs, [todayKey]: [...existing, newEntry] },
      xp: state.xp + 20 + bonusXp,
      liftingStreak: newLiftStreak,
      bestLiftingStreak: Math.max(state.bestLiftingStreak || 0, newLiftStreak),
      lastLiftDate: todayKey,
    };
    const { unlocked, xpBonus, newlyUnlocked } = checkTrophies(ns);
    showXp(20 + bonusXp + xpBonus);
    save({ ...ns, xp: ns.xp + xpBonus, unlockedTrophies: unlocked });
    toast.show("Workout logged!", "success", 2000);
    if (newlyUnlocked?.length > 0) {
      newlyUnlocked.forEach((t) => toast.show(`Trophy unlocked: ${t.name}!`, "trophy", 4000));
    }
  }

  // ── Dojo: Edit/Delete logged exercises ──
  function updateWorkoutEntry(index, newSets) {
    const todayKey = getTodayStr();
    const existing = [...(state.workoutLogs[todayKey] || [])];
    if (index < 0 || index >= existing.length) return;
    const oldVol = existing[index].sets.reduce((a, s) => a + s.weight * s.reps, 0);
    const newVol = newSets.reduce((a, s) => a + s.weight * s.reps, 0);
    const xpDiff = Math.floor(newVol / 100) - Math.floor(oldVol / 100);
    existing[index] = { ...existing[index], sets: newSets, time: Date.now() };
    save({
      ...state,
      workoutLogs: { ...state.workoutLogs, [todayKey]: existing },
      xp: Math.max(0, state.xp + xpDiff),
    });
  }

  function deleteWorkoutEntry(index) {
    const todayKey = getTodayStr();
    const existing = [...(state.workoutLogs[todayKey] || [])];
    if (index < 0 || index >= existing.length) return;
    const removedVol = existing[index].sets.reduce((a, s) => a + s.weight * s.reps, 0);
    const xpLoss = 20 + Math.floor(removedVol / 100);
    existing.splice(index, 1);
    save({
      ...state,
      workoutLogs: { ...state.workoutLogs, [todayKey]: existing },
      xp: Math.max(0, state.xp - xpLoss),
    });
  }

  // ── Academy ──
  // Check a course step (one-way — unchecking uses uncheckCourseStep)
  function checkCourseStep(courseId, stepIdx) {
    const progress = { ...(state.courseProgress || {}) };
    if (!progress[courseId]) progress[courseId] = { steps: [], completed: false };
    const steps = [...progress[courseId].steps];
    if (steps.includes(stepIdx)) return; // already checked
    steps.push(stepIdx);
    const course = ALL_COURSES.find((c) => c.id === courseId);
    if (!course) return;
    const isCompleted = steps.length === course.steps.length;
    progress[courseId] = { steps, completed: isCompleted };
    // Save step completion timestamp for rate-limiting
    const stepCompletedAt = { ...(state.stepCompletedAt || {}) };
    if (!stepCompletedAt[courseId]) stepCompletedAt[courseId] = {};
    stepCompletedAt[courseId] = { ...stepCompletedAt[courseId], [stepIdx]: Date.now() };
    // Only award 50 XP if never awarded before (permanent tracking)
    const courseXpAwarded = { ...(state.courseXpAwarded || {}) };
    let xpBonus = 0;
    if (isCompleted && !courseXpAwarded[courseId]) {
      xpBonus = 50;
      courseXpAwarded[courseId] = true;
    }
    // Auto-remove completed course from focus (frees a slot)
    let academyFocus = [...(state.academyFocus || [])];
    if (isCompleted && academyFocus.includes(courseId)) {
      academyFocus = academyFocus.filter((id) => id !== courseId);
    }
    const ns = { ...state, courseProgress: progress, courseXpAwarded, stepCompletedAt, academyFocus, xp: state.xp + xpBonus };
    const { unlocked, xpBonus: tXp } = checkTrophies(ns);
    if (xpBonus > 0 || tXp > 0) showXp(xpBonus + tXp);
    save({ ...ns, xp: ns.xp + tXp, unlockedTrophies: unlocked });
  }

  // Uncheck a course step (called only via swipe gesture)
  function uncheckCourseStep(courseId, stepIdx) {
    const progress = { ...(state.courseProgress || {}) };
    if (!progress[courseId]) return;
    const steps = [...progress[courseId].steps];
    if (!steps.includes(stepIdx)) return;
    steps.splice(steps.indexOf(stepIdx), 1);
    const course = ALL_COURSES.find((c) => c.id === courseId);
    if (!course) return;
    progress[courseId] = { steps, completed: false };
    save({ ...state, courseProgress: progress });
  }

  // ── Forge ──
  function startSobriety(trackerId) {
    save({ ...state, sobrietyDates: { ...state.sobrietyDates, [trackerId]: getTodayStr() } });
    toast.show("Forge tracker started — stay strong!", "streak", 3000);
  }

  function triggerRelapse(trackerId) {
    setRelapseTracker(trackerId);
    setRelapseText("");
    setModal("relapse");
  }

  function submitRelapse() {
    if (!relapseText.trim()) return;
    // Cap recovery journal text at 2000 characters
    const trimmedText = relapseText.trim().slice(0, 2000);
    const prevDate = state.sobrietyDates?.[relapseTracker];
    const daysClean = prevDate ? daysBetween(prevDate) : 0;
    const newJournals = [
      ...(state.recoveryJournals || []),
      { tracker: relapseTracker, text: trimmedText, date: getTodayStr(), daysCleanBefore: daysClean },
    ];
    const ns = {
      ...state,
      sobrietyDates: { ...state.sobrietyDates, [relapseTracker]: getTodayStr() },
      recoveryJournals: newJournals,
      xp: state.xp + 25,
    };
    const { unlocked, xpBonus } = checkTrophies(ns);
    showXp(25 + xpBonus);
    save({ ...ns, xp: ns.xp + xpBonus, unlockedTrophies: unlocked });
    setModal(null);
    setRelapseTracker(null);
  }

  // ── Feature Set 3: Add / Remove Custom Quests ──
  function addCustomQuest(quest) {
    // Validate max length for quest text
    if (!quest || !quest.text || quest.text.length > 200) return;
    save({ ...state, customQuests: [...(state.customQuests || []), quest] });
    setModal(null);
    toast.show("Custom quest added!", "success", 2000);
  }

  function removeCustomQuest(questId) {
    save({
      ...state,
      customQuests: (state.customQuests || []).filter((q) => q.id !== questId),
    });
  }

  function resetApp() {
    save(defaultState());
    setView("dashboard");
  }

  // ── Modal Rendering ──
  function renderModal() {
    if (!modal) return null;
    if (modal === "motivation") {
      return <MotivationModal card={currentCard} onDismiss={dismissMotivation} />;
    }
    if (modal === "morning_brief") {
      return <MorningBrief state={state} user={user} onDismiss={dismissMotivation} />;
    }
    if (modal === "workout") {
      return (
        <WorkoutModal
          workoutExercise={workoutExercise}
          setWorkoutExercise={setWorkoutExercise}
          workoutSets={workoutSets}
          setWorkoutSets={setWorkoutSets}
          onSave={saveWorkout}
          onClose={() => setModal(null)}
          bossClears={state.bossClears || {}}
        />
      );
    }
    if (modal === "relapse") {
      return (
        <RelapseModal
          trackerId={relapseTracker}
          relapseText={relapseText}
          setRelapseText={setRelapseText}
          onSubmit={submitRelapse}
          onClose={() => setModal(null)}
        />
      );
    }
    if (modal === "boss") {
      return <BossModal bossDay={bossDay} onProgress={progressLifecycle} />;
    }
    if (modal === "levelup") {
      return <LevelUpModal levelIndex={levelUpIndex} onDismiss={() => { setModal(null); setLevelUpIndex(null); }} />;
    }
    if (modal === "forge_success" && forgeMilestoneQueueRef.current.length > 0) {
      return (
        <ForgeSuccessModal
          milestones={forgeMilestoneQueueRef.current}
          onDismiss={dismissForgeSuccess}
        />
      );
    }
    if (modal === "custom_quest") {
      return (
        <CustomQuestModal
          unlockedCategories={unlockedCustomCategories}
          onAdd={addCustomQuest}
          onClose={() => setModal(null)}
          currentDay={day}
          existingQuests={quests}
          customQuestCount={(state.customQuests || []).length}
        />
      );
    }
    if (modal === "day_complete" && dayCompleteDay) {
      return (
        <DayCompleteModal
          state={state}
          completedDay={dayCompleteDay}
          onDismiss={() => { setModal(null); setDayCompleteDay(null); }}
        />
      );
    }
    if (modal === "notifications") {
      return (
        <NotificationSettingsModal
          settings={state.notificationSettings || getDefaultNotificationSettings()}
          onSave={(settings) => save({ ...state, notificationSettings: settings })}
          onClose={() => setModal(null)}
        />
      );
    }
    return null;
  }

  function openDojo() {
    setWorkoutExercise(null);
    setWorkoutSets([{ weight: "", reps: "" }]);
    setModal("workout");
  }

  const lifeOSValue = {
    state, save, view, setView, xpPopup,
    checkQuest, uncheckQuest, completeDay, canCompleteDay, calendarDay,
    openDojo, setModal, addCustomQuest, removeCustomQuest, unlockedCustomCategories,
    journalText, setJournalText, selectedMood, setSelectedMood, saveJournal, saveJournalRaw,
    checkCourseStep, uncheckCourseStep, ALL_COURSES,
    startSobriety, triggerRelapse,
    user, resetApp,
    doSaveWorkout, updateWorkoutEntry, deleteWorkoutEntry,
    confettiBurst, confettiPop,
    setSkipAuth,
  };

  return (
    <PremiumProvider state={state} save={save}>
      <PomodoroProvider minutes={state?.pomodoroMinutes || 25} state={state} save={save}>
      <LifeOSProvider value={lifeOSValue}>
        <LifeOSInner
          renderModal={renderModal}
          showWeeklySummary={showWeeklySummary}
          setShowWeeklySummary={setShowWeeklySummary}
          comebackInfo={comebackInfo}
          onDismissComeback={() => setComebackInfo(null)}
        />
      </LifeOSProvider>
      </PomodoroProvider>
    </PremiumProvider>
  );
}

function LifeOSInner({ renderModal, showWeeklySummary, setShowWeeklySummary, comebackInfo, onDismissComeback }) {
  const {
    state, save, view, setView, xpPopup,
    checkQuest, uncheckQuest, completeDay, canCompleteDay, calendarDay,
    openDojo, setModal, addCustomQuest, removeCustomQuest, unlockedCustomCategories,
    journalText, setJournalText, selectedMood, setSelectedMood, saveJournal, saveJournalRaw,
    checkCourseStep, uncheckCourseStep, ALL_COURSES,
    startSobriety, triggerRelapse,
    user, resetApp,
    doSaveWorkout, updateWorkoutEntry, deleteWorkoutEntry,
    confettiBurst, confettiPop,
    setSkipAuth,
  } = useLifeOS();
  const { showUpgrade, setShowUpgrade } = usePremium();
  // Subscribe to theme context so this component re-renders when theme changes
  const { themed } = useTheme();

  const day = state.currentDay;

  // Centralized view change handler — initializes state for views that need it
  function handleViewChange(v) {
    if (v === "auth") {
      setSkipAuth(false);
      return;
    }
    if (v === "journal") {
      setJournalText(state.journal?.[day] || "");
      setSelectedMood(state.moods?.[day] ?? null);
    }
    setView(v);
  }

  return (
    <div style={themed("app")} data-app-shell role="application" aria-label="Life OS">
      <Confetti trigger={confettiBurst} type="burst" />
      <Confetti trigger={confettiPop} type="pop" originY={0.4} />
      {renderModal()}
      <ComebackModal
        show={!!comebackInfo}
        daysAway={comebackInfo?.daysAway || 0}
        streak={comebackInfo?.streak || 0}
        onClose={onDismissComeback}
      />
      {showUpgrade && <UpgradeScreen onClose={() => setShowUpgrade(false)} />}
      <main id="main-content" style={S.content}>
        {(view === "home" || view === "dashboard") && showWeeklySummary && (
          <WeeklySummaryBanner
            summary={computeWeeklySummary(state)}
            onDismiss={() => {
              setShowWeeklySummary(false);
              save({ ...state, weeklySummaryDismissed: getTodayStr() });
            }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
          <Suspense fallback={<div style={{ padding: 40, textAlign: "center", opacity: 0.3 }}>Loading…</div>}>
            {view === "dashboard" && (
              <ErrorBoundary name="Dashboard" key="eb-dashboard">
                <DashboardView state={state} user={user} onNavigate={handleViewChange} />
              </ErrorBoundary>
            )}
            {view === "home" && (
              <ErrorBoundary name="Quests" key="eb-home">
                <HomeView
                  state={state}
                  xpPopup={xpPopup}
                  onCheckQuest={checkQuest}
                  onUncheckQuest={uncheckQuest}
                  onCompleteDay={completeDay}
                  onOpenDojo={openDojo}
                  canCompleteDay={canCompleteDay}
                  calendarDay={calendarDay}
                  onOpenCustomQuest={() => setModal("custom_quest")}
                  onAddSuggestedQuest={addCustomQuest}
                  onRemoveCustomQuest={removeCustomQuest}
                  unlockedCustomCategories={unlockedCustomCategories}
                  onNavigate={handleViewChange}
                />
              </ErrorBoundary>
            )}
            {view === "journal" && (
              <ErrorBoundary name="Journal" key="eb-journal">
                <JournalView
                  state={state}
                  journalText={journalText}
                  setJournalText={setJournalText}
                  selectedMood={selectedMood}
                  setSelectedMood={setSelectedMood}
                  onSave={saveJournal}
                  onSaveRaw={saveJournalRaw}
                />
              </ErrorBoundary>
            )}
            {view === "dojo" && <ErrorBoundary name="Dojo" key="eb-dojo"><DojoView state={state} onSaveWorkout={doSaveWorkout} onUpdateEntry={updateWorkoutEntry} onDeleteEntry={deleteWorkoutEntry} /></ErrorBoundary>}
            {view === "forge" && <ErrorBoundary name="Forge" key="eb-forge"><ForgeView state={state} save={save} onStart={startSobriety} onTriggerRelapse={triggerRelapse} /></ErrorBoundary>}
            {view === "analytics" && <ErrorBoundary name="Analytics" key="eb-analytics"><AnalyticsView state={state} /></ErrorBoundary>}
            {view === "social" && <ErrorBoundary name="Social" key="eb-social"><SocialView user={user} state={state} onNavigate={handleViewChange} /></ErrorBoundary>}
            {view === "academy" && (
              <ErrorBoundary name="Academy" key="eb-academy">
                <AcademyView
                  state={state}
                  save={save}
                  onCheckStep={checkCourseStep}
                  onUncheckStep={uncheckCourseStep}
                  allCourses={ALL_COURSES}
                />
              </ErrorBoundary>
            )}
            {view === "profile" && (
              <ErrorBoundary name="Profile" key="eb-profile">
                <ProfileView
                  state={state}
                  save={save}
                  user={user}
                  onReset={resetApp}
                  onOpenNotifications={() => setModal("notifications")}
                  onNavigate={handleViewChange}
                />
              </ErrorBoundary>
            )}
          </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav view={view} setView={handleViewChange} />
    </div>
  );
}

// Keep the export as the outer LifeOS function
