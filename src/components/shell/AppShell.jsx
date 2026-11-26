import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr, getDayQuests, daysBetween, getLevelIndex, parseDayKey, freezeAwardFor, reconcileStreaks } from "../../utils";
import { lazyWithRetry } from "../../utils/lazyWithRetry";
import { prefetchLazyChunks } from "../../utils/prefetchLazyChunks";
import { useTrophies } from "../../hooks/useTrophies";
import { useToast } from "../shared/Toast";

// Panels are lazy-loaded — they pull in the heavy data libraries (exercises,
// books, courses, forge programs) which would otherwise bloat the initial bundle.
// lazyWithRetry auto-reloads once if a chunk 404s after a new deploy.
const DomainPanel = lazyWithRetry(() => import("../panels/DomainPanel"));
const JournalPanel = lazyWithRetry(() => import("../panels/JournalPanel"));
const ForgePanel = lazyWithRetry(() => import("../panels/ForgePanel"));
const DojoPanel = lazyWithRetry(() => import("../panels/DojoPanel"));
const ProgressPanel = lazyWithRetry(() => import("../panels/ProgressPanel"));
const AcademyPanel = lazyWithRetry(() => import("../panels/AcademyPanel"));
const TrophyPanel = lazyWithRetry(() => import("../panels/TrophyPanel"));
const KnowledgePanel = lazyWithRetry(() => import("../panels/KnowledgePanel"));
const CustomQuestPanel = lazyWithRetry(() => import("../panels/CustomQuestPanel"));
const AvatarPickerPanel = lazyWithRetry(() => import("../panels/AvatarPickerPanel"));
const BookLibraryPanel = lazyWithRetry(() => import("../panels/BookLibraryPanel"));
const LeaderboardPanel = lazyWithRetry(() => import("../panels/LeaderboardPanel"));
const CharacterPanel = lazyWithRetry(() => import("../panels/CharacterPanel"));
const CardCollectionPanel = lazyWithRetry(() => import("../panels/CardCollectionPanel"));
const QuestLibraryPanel = lazyWithRetry(() => import("../panels/QuestLibraryPanel"));
const InboxPanel = lazyWithRetry(() => import("../panels/InboxPanel"));

// Today + Onboarding stay eager: Today is the default tab (fastest first paint),
// and Onboarding is the first-run entry screen — it must never gate a brand-new
// user behind a second network fetch that could fail. The rest are lazy.
import TodayScreen from "../screens/TodayScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
const TrainScreen = lazyWithRetry(() => import("../screens/TrainScreen"));
const LearnScreen = lazyWithRetry(() => import("../screens/LearnScreen"));
const ForgeScreen = lazyWithRetry(() => import("../screens/ForgeScreen"));
const MeScreen = lazyWithRetry(() => import("../screens/MeScreen"));

import XPToast from "../shared/XPToast";
import DayCompleteModal from "../shared/DayCompleteModal";
import LevelUpModal from "../shared/LevelUpModal";
import WeeklyReviewModal from "../shared/WeeklyReviewModal";
import ComebackModal from "../shared/ComebackModal";
import Confetti from "../shared/Confetti";
import BossModal from "../shared/BossModal";
import ForgeSuccessModal from "../shared/ForgeSuccessModal";
import AnniversaryModal, { ANNIVERSARY_DAYS } from "../shared/AnniversaryModal";
import QuickCaptureFab from "../shared/QuickCaptureFab";
import UpdateBanner from "../shared/UpdateBanner";
import TabBar from "./TabBar";
import { MOTIVATION_CARDS } from "../../data/constants";
import { feedback } from "../../utils/audio";
import { track, setAnalyticsConsent } from "../../firebase";

const SPECIAL_PANELS = [
  "journal", "forge", "dojo", "progress",
  "academy", "trophies", "knowledge", "custom-quests",
  "avatar", "books", "leaderboard", "character", "cards", "quest-library",
  "inbox",
];

// Minimal fallback shown while a lazy screen/panel chunk loads. Kept subtle —
// chunks are small and load in a blink on a warm connection.
function ScreenFallback() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        width: 22, height: 22,
        border: "2px solid rgba(124,92,252,0.20)",
        borderTopColor: "#7C5CFC",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }} />
    </div>
  );
}

// Home-screen shortcuts in public/manifest.json open /?view=<id>.
const VIEW_TO_TAB = { home: "today", today: "today", forge: "forge", dojo: "train", train: "train", learn: "learn", me: "me", journal: "today" };
function initialView() {
  try {
    const view = new URLSearchParams(window.location.search).get("view");
    return { tab: VIEW_TO_TAB[view] || "today", panel: view === "journal" ? "journal" : null };
  } catch {
    return { tab: "today", panel: null };
  }
}

export default function AppShell({ state, save, user }) {
  const [activeTab, setActiveTab] = useState(() => initialView().tab);
  const [activePanel, setActivePanel] = useState(() => initialView().panel);
  // Local day this shell last reconciled for; changes when the app is resumed
  // (or left open) past midnight, re-running the day-start effect below.
  const [dayKey, setDayKey] = useState(getTodayStr);
  const dayKeyRef = useRef(dayKey);

  const [xpToast, setXpToast] = useState({ xp: 0, visible: false });
  const [dayCompleteModal, setDayCompleteModal] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [weeklyReview, setWeeklyReview] = useState(false);
  const [comebackDays, setComebackDays] = useState(0);
  const [comebackPrevStreak, setComebackPrevStreak] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [bossModal, setBossModal] = useState(null);
  const [forgeSuccess, setForgeSuccess] = useState(null);
  const [anniversaryDay, setAnniversaryDay] = useState(null);

  const prevLevelRef = useRef(getLevelIndex(state.xp || 0));
  const prevXpRef = useRef(state.xp || 0);
  const { checkTrophies } = useTrophies();
  const toast = useToast();

  // Panels that now have dedicated tabs — opening them switches to the tab instead
  const PANEL_TO_TAB = {
    forge: "forge", dojo: "train",
    academy: "learn", knowledge: "learn", books: "learn",
  };

  const openPanel = useCallback((panelId) => {
    // Special token: __tab:XYZ switches tabs instead of opening a panel
    if (typeof panelId === "string" && panelId.startsWith("__tab:")) {
      setActiveTab(panelId.slice(6));
      setActivePanel(null);
      return;
    }
    if (PANEL_TO_TAB[panelId]) {
      setActiveTab(PANEL_TO_TAB[panelId]);
      setActivePanel(null);
      return;
    }
    setActivePanel(panelId);
  }, []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  // Analytics are opt-in; keep the facade in sync before any track() below.
  useEffect(() => {
    setAnalyticsConsent(state.analyticsConsent === true);
  }, [state.analyticsConsent]);

  // Day rollover without a reload: a TWA/PWA stays resident for days, so the
  // load-time reconcile alone let a skipped day go unnoticed and credited the
  // first tap after midnight to the wrong day.
  useEffect(() => {
    function checkDay() {
      if (document.visibilityState !== "visible") return;
      const now = getTodayStr();
      if (now === dayKeyRef.current) return;
      dayKeyRef.current = now;
      save((prev) => reconcileStreaks(prev));
      setDayKey(now);
    }
    document.addEventListener("visibilitychange", checkDay);
    const id = setInterval(checkDay, 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", checkDay);
      clearInterval(id);
    };
  }, [save]);

  // Funnel: which of the 5 pillars users actually open. Drives the post-launch
  // focus decision — keep what gets used, demote what doesn't.
  useEffect(() => {
    track("tab_view", { tab: activeTab });
  }, [activeTab]);

  // Warm every lazy chunk during idle time so tab switches are instant and the
  // service worker caches them for offline (first paint stays untouched —
  // kickoff is delayed well past initial render).
  useEffect(() => {
    const t = setTimeout(() => prefetchLazyChunks(), 3000);
    return () => clearTimeout(t);
  }, []);

  // Android TWA: hardware back button closes the active panel instead of exiting the app.
  useEffect(() => {
    function handleAndroidBack() {
      if (activePanel) { setActivePanel(null); return; }
      if (dayCompleteModal) { setDayCompleteModal(null); return; }
      if (levelUpModal !== null) { setLevelUpModal(null); return; }
      if (weeklyReview) { setWeeklyReview(false); return; }
      // Nothing to close — let the OS handle it (app moves to background)
    }
    window.addEventListener("android-back", handleAndroidBack);
    return () => window.removeEventListener("android-back", handleAndroidBack);
  }, [activePanel, dayCompleteModal, levelUpModal, weeklyReview]);

  // Comeback detection + lastActiveDate bump on mount and on day rollover.
  // Consolidated into a single save() so we don't race with other mount effects.
  useEffect(() => {
    if (!state.onboarded) return;
    const today = getTodayStr();
    if (state.lastActiveDate === today) return;

    const patch = { lastActiveDate: today };
    let toastMsg = null;

    // Freeze spending / streak breaking already happened exactly once in
    // reconcileStreaks() on load. This effect only reports the outcome.
    if (state.streakFreezeUsedDate === today && state.streak > 0) {
      const used = state.streakFreezeUsedCount || 1;
      toastMsg = `${used > 1 ? `${used} streak freezes` : "Streak freeze"} used (${state.streakFreezes || 0} left). Streak preserved.`;
    }

    const brokeToday = state.streakBrokenDate === today && (state.lastBrokenStreak || 0) > 0;
    const diff = state.lastActiveDate
      ? Math.round((parseDayKey(today) - parseDayKey(state.lastActiveDate)) / 86400000)
      : 0;
    // Show the comeback screen after an absence OR whenever the streak broke
    // today — the most common break is a daily opener who left yesterday
    // unfinished, and that used to happen silently.
    if (diff >= 2 || brokeToday) {
      setComebackPrevStreak(brokeToday ? state.lastBrokenStreak : 0);
      setComebackDays(Math.max(diff - 1, 1)); // days strictly between last open and today
    }

    save((prev) => ({ ...prev, ...patch }));
    if (toastMsg) setTimeout(() => toast.show(toastMsg, { type: "xp", duration: 3200 }), 600);
  }, [dayKey]);

  // Weekly review: show on Sunday if not shown this week.
  // Skip for brand-new users (<7 active days) — recapping an empty week is
  // demoralising on Day 1 and adds zero value.
  useEffect(() => {
    if (!state.onboarded) return;
    if (new Date().getDay() !== 0) return;
    const today = getTodayStr();
    if (state.lastWeeklyReview === today) return;
    const activeDays = Object.keys(state.completedDays || {}).length;
    if (activeDays < 7) return;
    setWeeklyReview(true);
  }, [dayKey]);

  // XP change → toast + level-up check
  useEffect(() => {
    const currentXp = state.xp || 0;
    const diff = currentXp - prevXpRef.current;
    if (diff > 0) {
      setXpToast({ xp: diff, visible: true });
      setTimeout(() => setXpToast((p) => ({ ...p, visible: false })), 1500);
    }
    prevXpRef.current = currentXp;

    const currentLevel = getLevelIndex(currentXp);
    if (currentLevel > prevLevelRef.current) {
      setTimeout(() => setLevelUpModal(currentLevel), 600);
      setConfettiTrigger((c) => c + 1);
      feedback("levelUp");
    }
    prevLevelRef.current = currentLevel;
  }, [state.xp]);

  // Day completion check
  useEffect(() => {
    if (!state.onboarded) return;
    const today = getTodayStr();
    if (state.completedDays?.[today]) return;

    const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;
    // Same rule as the Today screen's "day sealed" banner: avoidance quests
    // (10B) are tracked separately and never block day completion.
    const todayQuests = getDayQuests(dayNumber, state.customQuests, state).filter((q) => q.type !== "avoid");
    const completedIds = state.completedQuests?.[today] || [];
    const allDone = todayQuests.length > 0 && todayQuests.every((q) => completedIds.includes(q.id));

    if (allDone) {
      const xpEarned = todayQuests.reduce((sum, q) => sum + (q.xp || 0), 0);
      const newStreak = (state.streak || 0) + 1;

      const { unlocked, xpBonus, newlyUnlocked } = checkTrophies({
        ...state,
        completedDays: { ...state.completedDays, [today]: true },
      });

      // Unlock a random uncollected motivation card
      const allCardIds = MOTIVATION_CARDS.map((_, i) => `card-${i}`);
      const collected = state.collectedCards || {};
      const uncollected = allCardIds.filter((id) => !collected[id]);
      const newCollectedCards = { ...collected };
      let unlockedCardId = null;
      if (uncollected.length > 0) {
        unlockedCardId = uncollected[Math.floor(Math.random() * uncollected.length)];
        newCollectedCards[unlockedCardId] = today;
      }

      // Award a streak freeze every 7 days (max 3 banked, none in Hard Mode).
      const currentFreezes = state.streakFreezes || 0;
      const freezePatch = freezeAwardFor(state, newStreak) || {};
      const newFreezes = freezePatch.streakFreezes ?? currentFreezes;

      save({
        ...state,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak || 0, newStreak),
        completedDays: { ...state.completedDays, [today]: true },
        lastActiveDate: today,
        unlockedTrophies: unlocked,
        xp: (state.xp || 0) + xpBonus,
        lifetimeXp: (state.lifetimeXp || 0) + xpBonus,
        collectedCards: newCollectedCards,
        ...freezePatch,
      });

      if (unlockedCardId !== null) {
        setTimeout(() => toast.show("New motivation card unlocked!", { type: "xp", duration: 2400 }), 800);
      }
      if (newFreezes > currentFreezes) {
        setTimeout(() => toast.show(`Streak freeze earned (${newFreezes}/3)`, { type: "xp", duration: 2400 }), 1600);
      }

      track("day_complete", { day: dayNumber, xp_earned: xpEarned, streak: newStreak });

      setTimeout(() => {
        setDayCompleteModal({ day: dayNumber, xpEarned, streak: newStreak });
        setConfettiTrigger((c) => c + 1);
        feedback("dayComplete");
      }, 400);

      if (dayNumber === 21 || dayNumber === 66) {
        setTimeout(() => setBossModal(dayNumber), 1200);
      }

      newlyUnlocked.forEach((t) => {
        setTimeout(() => toast.show(`${t.icon} ${t.name} unlocked!`, { type: "xp", duration: 3000 }), 1200);
      });
    }
  }, [state.completedQuests]);

  // Anniversary detection — Day 30, 100, 365
  useEffect(() => {
    if (!state.onboarded || !state.startDate) return;
    const dayNumber = daysBetween(state.startDate) + 1;
    const seen = state.anniversaryRecapsSeen || {};
    const hit = ANNIVERSARY_DAYS.find((d) => dayNumber === d && !seen[d]);
    if (hit) {
      setAnniversaryDay(hit);
    }
  }, [dayKey]);

  // Forge milestone detection
  useEffect(() => {
    const MILESTONES = [7, 14, 21, 30, 60, 90];
    const shown = { ...(state.shownForgeMilestones || {}) };
    let firstHit = null;
    let changed = false;

    Object.entries(state.sobrietyDates || {}).forEach(([habitId, startDate]) => {
      // Same local-calendar count the Forge UI shows (the old UTC math fired
      // "7 days" while the tracker still read 6d), and catch up on milestones
      // reached on a day the app wasn't opened instead of skipping them.
      const days = daysBetween(startDate);
      const reached = MILESTONES.filter((m) => m <= days && !shown[`${habitId}-${m}`]);
      if (reached.length === 0) return;
      reached.forEach((m) => { shown[`${habitId}-${m}`] = true; });
      changed = true;
      const top = reached[reached.length - 1];
      if (!firstHit || top > firstHit.days) firstHit = { habitId, days: top };
    });

    if (changed) {
      save((prev) => ({ ...prev, shownForgeMilestones: { ...(prev.shownForgeMilestones || {}), ...shown } }));
      if (firstHit) setForgeSuccess(firstHit);
    }
  }, [dayKey]);

  if (!state.onboarded) {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <OnboardingScreen state={state} save={save} />
      </Suspense>
    );
  }

  return (
    <div data-app-shell style={styles.container}>
      <div style={styles.content}>
        <Suspense fallback={<ScreenFallback />}>
          {activeTab === "today" && (
            <TodayScreen state={state} save={save} onOpenPanel={openPanel} />
          )}
          {activeTab === "train" && (
            <TrainScreen state={state} save={save} />
          )}
          {activeTab === "learn" && (
            <LearnScreen state={state} save={save} />
          )}
          {activeTab === "forge" && (
            <ForgeScreen state={state} save={save} />
          )}
          {activeTab === "me" && (
            <MeScreen state={state} save={save} user={user} onOpenPanel={openPanel} />
          )}
        </Suspense>
      </div>

      <UpdateBanner />
      <TabBar activeTab={activeTab} onChangeTab={(tab) => { setActivePanel(null); setActiveTab(tab); }} />

      {/* QuickCaptureFab: Today tab only — prevents it covering content on other screens */}
      {activeTab === "today" && (
        <QuickCaptureFab state={state} save={save} onOpenInbox={() => openPanel("inbox")} />
      )}

      <Suspense fallback={<ScreenFallback />}>
      <AnimatePresence>
        {activePanel === "journal" && (
          <JournalPanel key="journal" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "forge" && (
          <ForgePanel key="forge" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "dojo" && (
          <DojoPanel key="dojo" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "progress" && (
          <ProgressPanel key="progress" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "academy" && (
          <AcademyPanel key="academy" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "trophies" && (
          <TrophyPanel key="trophies" state={state} onClose={closePanel} />
        )}
        {activePanel === "knowledge" && (
          <KnowledgePanel key="knowledge" onClose={closePanel} />
        )}
        {activePanel === "custom-quests" && (
          <CustomQuestPanel key="custom-quests" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "avatar" && (
          <AvatarPickerPanel key="avatar" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "books" && (
          <BookLibraryPanel key="books" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "leaderboard" && (
          <LeaderboardPanel key="leaderboard" state={state} onClose={closePanel} />
        )}
        {activePanel === "character" && (
          <CharacterPanel key="character" state={state} onClose={closePanel} />
        )}
        {activePanel === "cards" && (
          <CardCollectionPanel key="cards" state={state} onClose={closePanel} />
        )}
        {activePanel === "quest-library" && (
          <QuestLibraryPanel key="quest-library" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "inbox" && (
          <InboxPanel key="inbox" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel && !SPECIAL_PANELS.includes(activePanel) && (
          <DomainPanel
            key={activePanel}
            domainId={activePanel}
            state={state}
            save={save}
            onClose={closePanel}
            onOpenPanel={openPanel}
          />
        )}
      </AnimatePresence>
      </Suspense>

      <XPToast xp={xpToast.xp} visible={xpToast.visible} />

      {dayCompleteModal && (
        <DayCompleteModal
          day={dayCompleteModal.day}
          xpEarned={dayCompleteModal.xpEarned}
          streak={dayCompleteModal.streak}
          onDismiss={() => setDayCompleteModal(null)}
        />
      )}

      {levelUpModal !== null && (
        <LevelUpModal
          level={levelUpModal}
          onDismiss={() => setLevelUpModal(null)}
        />
      )}

      {weeklyReview && (
        <WeeklyReviewModal
          state={state}
          onDismiss={() => {
            setWeeklyReview(false);
            save({ ...state, lastWeeklyReview: getTodayStr() });
          }}
        />
      )}

      {comebackDays > 0 && (
        <ComebackModal
          missedDays={comebackDays}
          prevStreak={comebackPrevStreak}
          onLogOne={() => {
            setActivePanel(null);
            setActiveTab("today");
            setComebackDays(0);
          }}
          onRestoreHalf={() => {
            const restored = Math.floor(comebackPrevStreak / 2);
            // Re-align the freeze milestone with the restored streak.
            save({ ...state, streak: restored, lastBrokenStreak: 0, lastFreezeAwardedAtStreak: Math.floor(restored / 7) * 7 });
            setComebackDays(0);
          }}
          onDismiss={() => setComebackDays(0)}
        />
      )}

      {bossModal && (
        <BossModal
          bossDay={bossModal}
          state={state}
          onDismiss={() => {
            const xpReward = bossModal === 66 ? 500 : 100;
            save({ ...state, xp: (state.xp || 0) + xpReward, lifetimeXp: (state.lifetimeXp || 0) + xpReward });
            setBossModal(null);
          }}
        />
      )}

      {forgeSuccess && (
        <ForgeSuccessModal
          habitId={forgeSuccess.habitId}
          days={forgeSuccess.days}
          onDismiss={() => setForgeSuccess(null)}
        />
      )}

      {anniversaryDay && (
        <AnniversaryModal
          day={anniversaryDay}
          onDismiss={() => {
            save({
              ...state,
              anniversaryRecapsSeen: {
                ...(state.anniversaryRecapsSeen || {}),
                [anniversaryDay]: true,
              },
            });
            setAnniversaryDay(null);
          }}
        />
      )}

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight: "100dvh",
    background: TOKENS.color.bg,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    paddingBottom: 80,
    overflowY: "auto",
  },
};
