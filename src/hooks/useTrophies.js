import { useCallback } from "react";
import { TROPHIES } from "../data";
import { getTodayStr, getTotalVolume } from "../utils";

export function useTrophies() {
  const checkTrophies = useCallback((s) => {
    let xpBonus = 0;
    const unlocked = { ...(s.unlockedTrophies || {}) };
    const completedQuestsByCategory = {};

    Object.entries(s.completedQuests || {}).forEach(([day, qIds]) => {
      qIds.forEach((qid) => {
        const cat = qid.split("-")[0];
        if (!completedQuestsByCategory[cat]) completedQuestsByCategory[cat] = 0;
        completedQuestsByCategory[cat]++;
      });
    });

    const totalCompletedDays = Object.keys(s.completedDays || {}).length;
    const workoutCount = Object.values(s.workoutLogs || {}).reduce((a, b) => a + b.length, 0);
    const completedCourses = Object.values(s.courseProgress || {}).filter((p) => p.completed).length;
    const recoveryCount = (s.recoveryJournals || []).length;
    const totalVolume = getTotalVolume(s.workoutLogs);

    TROPHIES.forEach((t) => {
      if (unlocked[t.id]) return;
      let earned = false;
      if (t.daysReq && t.category === "all") earned = totalCompletedDays >= t.daysReq;
      else if (t.daysReq && t.category !== "all") earned = (completedQuestsByCategory[t.category] || 0) >= t.daysReq;
      else if (t.dayReq) earned = s.currentDay >= t.dayReq;
      else if (t.countReq && t.category === "dojo") earned = workoutCount >= t.countReq;
      else if (t.countReq && t.category === "academy") earned = completedCourses >= t.countReq;
      else if (t.countReq && t.category === "forge") earned = recoveryCount >= t.countReq;
      else if (t.volumeReq) earned = totalVolume >= t.volumeReq;
      if (earned) {
        unlocked[t.id] = getTodayStr();
        xpBonus += t.xpReward;
      }
    });

    return { unlocked, xpBonus };
  }, []);

  return { checkTrophies };
}
