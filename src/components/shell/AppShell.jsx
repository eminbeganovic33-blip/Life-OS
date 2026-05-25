import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr, getDayQuests, daysBetween, getLevelIndex } from "../../utils";
import { useTrophies } from "../../hooks/useTrophies";
import { useToast } from "../shared/Toast";

import DomainPanel from "../panels/DomainPanel";
import JournalPanel from "../panels/JournalPanel";
import ForgePanel from "../panels/ForgePanel";
import DojoPanel from "../panels/DojoPanel";
import ProgressPanel from "../panels/ProgressPanel";
import AcademyPanel from "../panels/AcademyPanel";
import TrophyPanel from "../panels/TrophyPanel";
import KnowledgePanel from "../panels/KnowledgePanel";
import CustomQuestPanel from "../panels/CustomQuestPanel";
import AvatarPickerPanel from "../panels/AvatarPickerPanel";
import BookLibraryPanel from "../panels/BookLibraryPanel";
import LeaderboardPanel from "../panels/LeaderboardPanel";
import CharacterPanel from "../panels/CharacterPanel";
import CardCollectionPanel from "../panels/CardCollectionPanel";
import QuestLibraryPanel from "../panels/QuestLibraryPanel";

import TodayScreen from "../screens/TodayScreen";
import TrainScreen from "../screens/TrainScreen";
import LearnScreen from "../screens/LearnScreen";
import ForgeScreen from "../screens/ForgeScreen";
import MeScreen from "../screens/MeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";

import XPToast from "../shared/XPToast";
import DayCompleteModal from "../shared/DayCompleteModal";
import LevelUpModal from "../shared/LevelUpModal";
import WeeklyReviewModal from "../shared/WeeklyReviewModal";
import ComebackModal from "../shared/ComebackModal";
import Confetti from "../shared/Confetti";
import BossModal from "../shared/BossModal";
import ForgeSuccessModal from "../shared/ForgeSuccessModal";
import AnniversaryModal, { ANNIVERSARY_DAYS } from "../shared/AnniversaryModal";
import TabBar from "./TabBar";
import { MOTIVATION_CARDS } from "../../data/constants";
import { feedback } from "../../utils/audio";

const SPECIAL_PANELS = [
  "journal", "forge", "dojo", "progress",
  "academy", "trophies", "knowledge", "custom-quests",
  "avatar", "books", "leaderboard", "character", "cards", "quest-library",
];

export default function AppShell({ state, save, user }) {
  const [activeTab, setActiveTab] = useState("today");
  const [activePanel, setActivePanel] = useState(null);

  const [xpToast, setXpToast] = useState({ xp: 0, visible: false });
  const [dayCompleteModal, setDayCompleteModal] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [weeklyReview, setWeeklyReview] = useState(false);
  const [comebackDays, setComebackDays] = useState(0);
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

  // Comeback detection + streak protection + lastActiveDate bump on mount.
  // Consolidated into a single save() so we don't race with other mount effects.
  useEffect(() => {
    if (!state.onboarded) return;
    const today = getTodayStr();
    if (state.lastActiveDate === today) return;

    const patch = { lastActiveDate: today };
    let toastMsg = null;

    if (state.lastActiveDate) {
      const last = new Date(state.lastActiveDate + "T12:00:00");
      const now = new Date();
      const diff = Math.floor((now - last) / 86400000);

      if (diff >= 2 && state.streak > 0) {
        const freezes = state.streakFreezes || 0;
        const daysToCover = diff - 1; // gap of 2 = 1 missed day
        // Hard Mode: skip freeze protection entirely — break the streak on any miss.
        if (!state.hardMode && freezes >= daysToCover) {
          patch.streakFreezes = freezes - daysToCover;
          toastMsg = `Streak freeze used (${patch.streakFreezes} left). Streak preserved.`;
        } else {
          patch.streak = 0;
          patch.streakFreezes = state.hardMode ? freezes : 0;
          setComebackDays(diff);
        }
      } else if (diff >= 2) {
        setComebackDays(diff);
      }
    }

    save({ ...state, ...patch });
    if (toastMsg) setTimeout(() => toast.show(toastMsg, { type: "xp", duration: 3200 }), 600);
  }, []);

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
  }, []);

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
    const todayQuests = getDayQuests(dayNumber, state.customQuests, state);
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

      // Award a streak freeze every 7 days (max 3 banked).
      // Hard Mode: no freezes — the point is they don't protect you.
      const currentFreezes = state.streakFreezes || 0;
      const newFreezes = !state.hardMode && newStreak > 0 && newStreak % 7 === 0
        ? Math.min(3, currentFreezes + 1)
        : currentFreezes;

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
        streakFreezes: newFreezes,
      });

      if (unlockedCardId !== null) {
        setTimeout(() => toast.show("New motivation card unlocked!", { type: "xp", duration: 2400 }), 800);
      }
      if (newFreezes > currentFreezes) {
        setTimeout(() => toast.show(`Streak freeze earned (${newFreezes}/3)`, { type: "xp", duration: 2400 }), 1600);
      }

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
  }, []);

  // Forge milestone detection
  useEffect(() => {
    const MILESTONES = [7, 14, 21, 30, 60, 90];
    const shown = { ...(state.shownForgeMilestones || {}) };
    let firstHit = null;
    let changed = false;

    Object.entries(state.sobrietyDates || {}).forEach(([habitId, startDate]) => {
      const days = Math.floor((new Date() - new Date(startDate)) / 86400000);
      const key = `${habitId}-${days}`;
      if (MILESTONES.includes(days) && !shown[key]) {
        shown[key] = true;
        changed = true;
        // Show modal for the first milestone hit this session. The rest are
        // still marked seen so they don't re-fire next mount.
        if (!firstHit) firstHit = { habitId, days };
      }
    });

    if (changed) {
      save({ ...state, shownForgeMilestones: shown });
      if (firstHit) setForgeSuccess(firstHit);
    }
  }, []);

  if (!state.onboarded) {
    return <OnboardingScreen state={state} save={save} />;
  }

  return (
    <div data-app-shell style={styles.container}>
      <div style={styles.content}>
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
      </div>

      <TabBar activeTab={activeTab} onChangeTab={(tab) => { setActivePanel(null); setActiveTab(tab); }} />

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
