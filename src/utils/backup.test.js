// Data-safety tests: schema coercion, import validation, quarantine rotation,
// and the full load path on a REAL production save (main @ 146d065, captured
// from https://life-os-app-ashen.vercel.app on 2026-11-05).
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sanitizeState, validateBackup, stash, listQuarantine, latestQuarantine } from "./backup";
import { reconcileStreaks, migrateActiveQuests } from "./helpers";
import prodState from "./__fixtures__/prod-main-146d065-state.json";

// Minimal in-memory localStorage for the node test environment.
function installStorage() {
  const m = new Map();
  globalThis.localStorage = {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
  };
}

afterEach(() => vi.useRealTimers());

describe("sanitizeState", () => {
  it("leaves a real production save untouched", () => {
    const { state, fixed } = sanitizeState(prodState);
    expect(fixed).toEqual([]);
    expect(state.activeQuests).toEqual(prodState.activeQuests);
    expect(state.sobrietyDates).toEqual(prodState.sobrietyDates);
    expect(state.completedDays).toEqual(prodState.completedDays);
    expect(state.onboarded).toBe(true);
  });

  it("converts lossless type drift instead of resetting it", () => {
    const { state, reset } = sanitizeState({ ...prodState, xp: "120", onboarded: "true", streak: "4" });
    expect(state.xp).toBe(120);
    expect(state.onboarded).toBe(true); // a reset here would re-run onboarding
    expect(state.streak).toBe(4);
    expect(reset).toEqual([]);
  });

  it("turns an ISO startDate into its local day key (journey day survives)", () => {
    const iso = new Date(2026, 4, 1, 10, 30).toISOString(); // local May 1st
    expect(sanitizeState({ ...prodState, startDate: iso }).state.startDate).toBe("2026-05-01");
  });

  it("does not turn a junk startDate into 1970", () => {
    const { state, reset } = sanitizeState({ ...prodState, startDate: 1 });
    expect(state.startDate.startsWith("19")).toBe(false);
    expect(reset).toContain("startDate");
  });

  it("resets only unconvertible wrong-typed fields", () => {
    const { state, reset } = sanitizeState({ ...prodState, restDays: {}, pausedDates: "oops" });
    expect(state.restDays).toEqual([]);
    expect(state.pausedDates).toEqual([]);
    expect(reset.sort()).toEqual(["pausedDates", "restDays"]);
    expect(state.completedQuests).toEqual(prodState.completedQuests);
  });
});

describe("validateBackup", () => {
  it("accepts a real backup and reports its size", () => {
    const r = validateBackup(prodState);
    expect(r.ok).toBe(true);
    expect(r.summary.days).toBe(1);
    expect(r.summary.fixedFields).toBe(0);
  });

  it("rejects non-objects, foreign JSON and files with a broken core", () => {
    expect(validateBackup([]).ok).toBe(false);
    expect(validateBackup({ name: "some other app" }).ok).toBe(false);
    expect(validateBackup({ startDate: 1, completedQuests: [], completedDays: "x" }).ok).toBe(false);
  });

  it("repairs the file that used to crash the next load", () => {
    const r = validateBackup({ startDate: "2026-10-01", restDays: {} });
    expect(r.ok).toBe(true);
    expect(r.state.restDays).toEqual([]);
  });
});

describe("quarantine", () => {
  beforeEach(installStorage);

  it("keeps a fresh copy on every distinct failure, newest 3 only", () => {
    vi.useFakeTimers();
    for (let i = 1; i <= 5; i++) {
      vi.setSystemTime(new Date(2026, 10, 5, 12, 0, i));
      stash(`blob-${i}`);
    }
    expect(listQuarantine()).toHaveLength(3);
    expect(latestQuarantine()).toBe("blob-5");
  });

  it("does not duplicate the same blob", () => {
    stash("same");
    stash("same");
    expect(listQuarantine()).toHaveLength(1);
  });
});

describe("load path on a real production save", () => {
  const load = () => reconcileStreaks(migrateActiveQuests(sanitizeState(prodState).state));

  it("next morning: everything kept, streak intact", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6, 8, 0));
    const s = load();
    expect(s.streak).toBe(1);
    expect(s.activeQuests).toHaveLength(4);
    expect(Object.keys(s.sobrietyDates)).toEqual(["smoking"]);
    expect(s.onboarded).toBe(true);
  });

  it("after a missed day: streak breaks with the restore value kept", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 8, 0));
    const s = load();
    expect(s.streak).toBe(0);
    expect(s.lastBrokenStreak).toBe(1);
    expect(s.activeQuests).toHaveLength(4);
  });
});
