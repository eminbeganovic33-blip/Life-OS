// Streak + freeze regression tests. Run: npm test
// The suite runs in America/New_York (see package.json) so DST transitions
// and west-of-UTC day boundaries are exercised.
import { describe, it, expect, afterEach, vi } from "vitest";
import { reconcileStreaks, freezeAwardFor, addDaysToKey, getTodayStr, getConsistency } from "./helpers";

function at(isoLocal) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoLocal));
}
afterEach(() => vi.useRealTimers());

const base = (over = {}) => ({
  startDate: "2026-11-01",
  streak: 3,
  bestStreak: 3,
  streakFreezes: 0,
  completedDays: { "2026-11-02": true, "2026-11-03": true, "2026-11-04": true },
  pausedDates: [],
  restDays: [],
  lastActiveDate: "2026-11-04",
  ...over,
});

describe("reconcileStreaks", () => {
  it("keeps the streak when yesterday was completed (the cap-at-1 bug)", () => {
    at("2026-11-05T08:00:00");
    const s = reconcileStreaks(base());
    expect(s.streak).toBe(3);
    expect(s.lastBrokenStreak).toBeUndefined();
  });

  it("treats a day the app was opened but not completed as missed", () => {
    at("2026-11-06T08:00:00");
    // Opened on 11-05 (lastActiveDate bumped) but never completed it.
    const s = reconcileStreaks(base({ lastActiveDate: "2026-11-05" }));
    expect(s.streak).toBe(0);
    expect(s.lastBrokenStreak).toBe(3);
  });

  it("leaves a streak alone when today is already completed and the app is reopened", () => {
    at("2026-11-05T21:00:00");
    const done = base({ streak: 4, completedDays: { ...base().completedDays, "2026-11-05": true }, lastActiveDate: "2026-11-05" });
    const s = reconcileStreaks(reconcileStreaks(done));
    expect(s.streak).toBe(4);
  });

  it("breaks the streak after one fully missed day with no freezes", () => {
    at("2026-11-06T08:00:00"); // 11-05 missed
    const s = reconcileStreaks(base());
    expect(s.streak).toBe(0);
    expect(s.lastBrokenStreak).toBe(3);
    expect(s.streakBrokenDate).toBe("2026-11-06");
  });

  it("spends one freeze per missed day and keeps the streak", () => {
    at("2026-11-07T08:00:00"); // 11-05 and 11-06 missed
    const s = reconcileStreaks(base({ streakFreezes: 3 }));
    expect(s.streak).toBe(3);
    expect(s.streakFreezes).toBe(1);
    expect(s.streakFreezeUsedCount).toBe(2);
  });

  it("is idempotent: reopening the same day never spends a second freeze", () => {
    at("2026-11-06T08:00:00");
    const once = reconcileStreaks(base({ streakFreezes: 2 }));
    const twice = reconcileStreaks(reconcileStreaks(once));
    expect(once.streakFreezes).toBe(1);
    expect(twice.streakFreezes).toBe(1);
    expect(twice.streak).toBe(3);
  });

  it("breaks instead of spending when there are fewer freezes than missed days", () => {
    at("2026-11-08T08:00:00"); // 3 missed
    const s = reconcileStreaks(base({ streakFreezes: 2 }));
    expect(s.streak).toBe(0);
    expect(s.streakFreezes).toBe(2);
  });

  it("never spends freezes in Hard Mode", () => {
    at("2026-11-06T08:00:00");
    const s = reconcileStreaks(base({ streakFreezes: 3, hardMode: true }));
    expect(s.streak).toBe(0);
    expect(s.streakFreezes).toBe(3);
  });

  it("excuses paused days", () => {
    at("2026-11-07T08:00:00");
    const s = reconcileStreaks(base({ pausedDates: ["2026-11-05", "2026-11-06"] }));
    expect(s.streak).toBe(3);
  });

  it("does not re-break after the comeback partial restore", () => {
    at("2026-11-06T08:00:00");
    const broken = reconcileStreaks(base());
    const restored = { ...broken, streak: 1, lastBrokenStreak: 0 };
    expect(reconcileStreaks(restored).streak).toBe(1);
  });

  it("counts calendar days across the DST change (America/New_York, Mar 8 2026)", () => {
    at("2026-03-09T07:30:00"); // 03-08 is the 23-hour day and is missed
    const s = reconcileStreaks(base({ startDate: "2026-03-01", completedDays: { "2026-03-07": true }, streakFreezes: 1 }));
    expect(s.streak).toBe(3);
    expect(s.streakFreezes).toBe(0);
    expect(s.streakFreezeUsedCount).toBe(1);
  });

  it("uses local days late at night (11:30pm is still today)", () => {
    at("2026-11-05T23:30:00");
    expect(getTodayStr()).toBe("2026-11-05");
    expect(reconcileStreaks(base()).streak).toBe(3);
  });

  it("ignores legacy numeric completedDays keys", () => {
    at("2026-11-06T08:00:00");
    // Legacy journey-day keys only: without the day-key filter "1" becomes
    // the anchor, parses as 2001-01-01 and a year of "missed days" breaks a
    // streak that simply can't be checked. With it, there is no anchor and
    // the streak is left alone.
    const s = reconcileStreaks(base({ completedDays: { 1: true, 2: true } }));
    expect(s.streak).toBe(3);
  });

  it("miss → freeze → another miss: the second miss is still counted", () => {
    at("2026-11-06T08:00:00"); // 11-05 missed, covered by the freeze
    const covered = reconcileStreaks(base({ streakFreezes: 1 }));
    expect(covered.streak).toBe(3);
    at("2026-11-07T08:00:00"); // 11-06 missed too, no freezes left
    const s = reconcileStreaks(covered);
    expect(s.streak).toBe(0);
    expect(s.lastBrokenStreak).toBe(3);
  });

  it("ignores a streakCheckedThrough marker from the future (wrong clock)", () => {
    at("2026-11-08T08:00:00"); // 11-05..11-07 missed
    const s = reconcileStreaks(base({ streakCheckedThrough: "2026-12-31" }));
    expect(s.streak).toBe(0);
  });

  it("excuses rest days (journey-day numbers)", () => {
    at("2026-11-06T08:00:00"); // 11-05 = journey day 5 from 11-01
    expect(reconcileStreaks(base({ restDays: [5] })).streak).toBe(3);
  });

  it("is a no-op for streak 0 and for states without a startDate", () => {
    at("2026-11-08T08:00:00");
    expect(reconcileStreaks(base({ streak: 0 })).streak).toBe(0);
    const noStart = reconcileStreaks(base({ startDate: undefined }));
    expect(noStart.streak).toBe(0); // still breaks on real misses
    expect(noStart.lastBrokenStreak).toBe(3);
  });

  it("resets the freeze milestone on a break so freezes can be re-earned", () => {
    at("2026-11-06T08:00:00");
    const broken = reconcileStreaks(base({ streak: 14, lastFreezeAwardedAtStreak: 14 }));
    expect(broken.lastFreezeAwardedAtStreak).toBe(0);
    expect(freezeAwardFor(broken, 7)).toMatchObject({ streakFreezes: 1, lastFreezeAwardedAtStreak: 7 });
  });
});

describe("freezeAwardFor", () => {
  it("awards one freeze at each 7-day milestone", () => {
    expect(freezeAwardFor({ streakFreezes: 0 }, 7)).toMatchObject({ streakFreezes: 1, lastFreezeAwardedAtStreak: 7 });
    expect(freezeAwardFor({ streakFreezes: 0 }, 6)).toBeNull();
  });

  it("does not award the same milestone twice", () => {
    expect(freezeAwardFor({ streakFreezes: 1, lastFreezeAwardedAtStreak: 7 }, 7)).toBeNull();
  });

  it("caps at 3 banked and awards nothing in Hard Mode", () => {
    expect(freezeAwardFor({ streakFreezes: 3 }, 14)).toEqual({ lastFreezeAwardedAtStreak: 14 });
    expect(freezeAwardFor({ hardMode: true }, 7)).toBeNull();
  });
});

describe("addDaysToKey", () => {
  it("crosses month, year and DST boundaries", () => {
    expect(addDaysToKey("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysToKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToKey("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDaysToKey("2026-11-01", -1)).toBe("2026-10-31");
  });
});

describe("getConsistency", () => {
  it("counts completed days in the window; today only once it's done", () => {
    at("2026-11-05T20:00:00");
    const s = base(); // 11-02..11-04 done, started 11-01
    expect(getConsistency(s)).toEqual({ done: 3, total: 4 }); // 11-01 missed, today pending
    expect(getConsistency({ ...s, completedDays: { ...s.completedDays, "2026-11-05": true } })).toEqual({ done: 4, total: 5 });
  });

  it("excuses paused days and never looks before the start date", () => {
    at("2026-11-05T20:00:00");
    expect(getConsistency(base({ pausedDates: ["2026-11-01"] }))).toEqual({ done: 3, total: 3 });
    expect(getConsistency(base({ startDate: "2026-11-04", completedDays: { "2026-11-04": true } }))).toEqual({ done: 1, total: 1 });
  });

  it("caps at the 14-day window", () => {
    at("2026-11-30T09:00:00");
    const completedDays = {};
    for (let d = 1; d <= 29; d++) completedDays[`2026-11-${String(d).padStart(2, "0")}`] = true;
    expect(getConsistency(base({ completedDays }))).toEqual({ done: 13, total: 13 });
  });
});
