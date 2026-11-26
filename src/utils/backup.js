// Backup, restore and state-shape safety.
//
// Life OS is local-first: localStorage is the only copy of a user's history
// unless they export it. Everything here exists so a bad file, a schema drift
// or a crash can never silently replace that copy with an empty state.

import { defaultState } from "./state";
import { dateToLocalDayKey } from "./helpers";

export const STATE_KEY = "life-os-state";
// Raw blob that failed to load — kept so a bug never destroys real data.
export const QUARANTINE_KEY = "life-os-state-quarantine";
// Snapshot taken right before an import replaces the current state.
export const PRE_IMPORT_KEY = "life-os-state-before-import";

const kindOf = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Try to turn a wrong-typed value into the wanted kind without losing it. */
function convert(value, want) {
  if (want === "number" && typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return { ok: true, value: Number(value) };
  }
  if (want === "boolean" && (value === "true" || value === "false")) {
    return { ok: true, value: value === "true" };
  }
  if (want === "string" && typeof value === "number" && Number.isFinite(value)) {
    return { ok: true, value: String(value) };
  }
  return { ok: false };
}

/** Normalise any parseable date (ISO string, timestamp) to a local day key. */
function toDayKey(value) {
  if (typeof value === "string" && DAY_KEY.test(value)) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    // Plausible range only: `startDate: 1` must not become 1970-01-01.
    if (!Number.isNaN(d.getTime()) && d.getFullYear() >= 2020 && d.getFullYear() <= 2100) {
      return dateToLocalDayKey(d);
    }
  }
  return null;
}

/**
 * Coerce a loaded/imported state onto the current schema. A field whose type
 * disagrees with defaultState() is converted when that's lossless ("120" →
 * 120, "true" → true, an ISO startDate → its local day key) and otherwise
 * reset to its default — e.g. `restDays: {}` where an array is expected,
 * which crashed `restDays.includes` on load. Unknown keys are kept.
 * Returns { state, fixed: [keys converted or reset], reset: [keys reset] }.
 */
export function sanitizeState(raw) {
  const defaults = defaultState();
  const out = { ...defaults, ...raw };
  const fixed = [];
  const reset = [];
  for (const [key, def] of Object.entries(defaults)) {
    if (def === null || !(key in raw) || key === "startDate") continue;
    const want = kindOf(def);
    const got = kindOf(raw[key]);
    if (got === want) continue;
    if (got === "null" && want !== "array" && want !== "object") continue;
    const c = convert(raw[key], want);
    out[key] = c.ok ? c.value : def;
    fixed.push(key);
    if (!c.ok) reset.push(key);
  }
  if ("startDate" in raw) {
    const key = toDayKey(raw.startDate);
    if (key !== raw.startDate) {
      out.startDate = key || defaults.startDate;
      fixed.push("startDate");
      if (!key) reset.push("startDate");
    }
  }
  return { state: out, fixed, reset };
}

/**
 * Decide whether a parsed JSON file is a Life OS backup worth restoring.
 * Returns { ok: true, state, summary } or { ok: false, reason }.
 */
export function validateBackup(parsed) {
  if (!parsed || kindOf(parsed) !== "object") {
    return { ok: false, reason: "That file isn't a Life OS backup (expected a JSON object)." };
  }
  const core = ["startDate", "activeQuests", "completedQuests", "completedDays"];
  if (!core.some((k) => k in parsed)) {
    return { ok: false, reason: "That JSON doesn't look like a Life OS backup — no habit data found in it." };
  }
  const { state, fixed, reset } = sanitizeState(parsed);
  // If most of the core structure is the wrong shape, this isn't our file.
  const coreBroken = core.filter((k) => reset.includes(k)).length;
  if (coreBroken >= 2) {
    return { ok: false, reason: "That file is damaged or from another app — its core fields have the wrong format." };
  }
  return {
    ok: true,
    state,
    fixed,
    summary: {
      days: Object.keys(state.completedDays || {}).length,
      journalEntries: Object.keys(state.journal || {}).length,
      fixedFields: reset.length,
    },
  };
}

/** Download any JSON-serialisable value (or a raw JSON string) as a file. */
export function downloadJson(data, filename) {
  const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read the raw stored state string without parsing it (crash-safe). */
export function readRawState() {
  try { return localStorage.getItem(STATE_KEY); } catch { return null; }
}

const MAX_QUARANTINE = 3;

/** Quarantine copies, newest first: [{ key, at }]. */
export function listQuarantine() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${QUARANTINE_KEY}:`)) out.push({ key: k, at: Number(k.split(":")[1]) || 0 });
    }
  } catch { /* blocked storage */ }
  return out.sort((a, b) => b.at - a.at);
}

export function latestQuarantine() {
  const [newest] = listQuarantine();
  if (!newest) return null;
  try { return localStorage.getItem(newest.key); } catch { return null; }
}

/**
 * Keep a timestamped copy of `raw` (newest 3 are kept). Every call stores a
 * fresh copy — a write-once slot meant a second corruption had nowhere to go.
 */
export function stash(raw) {
  if (!raw) return;
  try {
    if (latestQuarantine() === raw) return; // already safe
    localStorage.setItem(`${QUARANTINE_KEY}:${Date.now()}`, raw);
    listQuarantine().slice(MAX_QUARANTINE).forEach(({ key }) => localStorage.removeItem(key));
  } catch { /* full or blocked storage */ }
}
