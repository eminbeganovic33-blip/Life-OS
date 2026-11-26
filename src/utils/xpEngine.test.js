// Daily bonus must not re-roll as quests are completed (was: 10 claimable
// bonuses, +520 XP, in one day).
import { describe, it, expect, afterEach, vi } from "vitest";
import { getDailyBonusQuest } from "./xpEngine";

afterEach(() => vi.useRealTimers());

describe("getDailyBonusQuest", () => {
  it("keeps the same bonus all day while today's quests are completed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 9, 0));
    const state = {
      currentDay: 5,
      completedDays: { "2026-11-03": true, "2026-11-04": true },
      completedQuests: {
        "2026-11-03": ["lib-sleep-a-day1", "lib-exercise-b-day1"],
        "2026-11-04": ["lib-sleep-a-day2", "lib-mind-c-day2"],
      },
    };
    const first = getDailyBonusQuest(state);
    expect(first).toBeTruthy();
    let s = state;
    for (const qid of [`lib-${first.category}-x-day5`, first.id, "lib-work-y-day5", "lib-social-z-day5"]) {
      s = { ...s, completedQuests: { ...s.completedQuests, "2026-11-05": [...(s.completedQuests["2026-11-05"] || []), qid] } };
      expect(getDailyBonusQuest(s).id).toBe(first.id);
    }
  });
});
