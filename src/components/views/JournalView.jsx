import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { MOODS } from "../../data";
import { analyzeJournalSentiment } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import AIJournalInsight from "../AIJournalInsight";
import ChatJournal from "../ChatJournal";
import { MessageCircle, PenLine, Clock, BookOpen, Search, Calendar, Check } from "lucide-react";

// ── Journal Prompts ──

const JOURNAL_PROMPTS = [
  // discipline
  { pillar: "discipline", text: "What did you do today that your future self will thank you for?" },
  { pillar: "discipline", text: "What was the hardest habit to stick to today, and why?" },
  { pillar: "discipline", text: "Describe a moment today where you chose discipline over comfort." },
  { pillar: "discipline", text: "What would you do differently if you could live today again?" },
  { pillar: "discipline", text: "What's the one thing you keep avoiding? Why?" },
  { pillar: "discipline", text: "How did your actions today align with the person you want to become?" },
  { pillar: "discipline", text: "What temptation did you overcome today — and what made that possible?" },
  { pillar: "discipline", text: "Rate your focus today from 1–10. What brought it up or down?" },
  { pillar: "discipline", text: "What does your morning routine reveal about your priorities?" },
  { pillar: "discipline", text: "Which habit, if mastered, would change everything else?" },
  { pillar: "discipline", text: "Where did you show up fully today — and where did you coast?" },
  { pillar: "discipline", text: "What small win happened today because you stayed consistent?" },
  { pillar: "discipline", text: "What would a 1% improvement in your daily discipline look like?" },
  { pillar: "discipline", text: "What's the gap between the standards you set and the ones you actually live by?" },
  { pillar: "discipline", text: "What did you sacrifice today in service of your long-term goals?" },

  // resilience
  { pillar: "resilience", text: "What knocked you down today and how did you get back up?" },
  { pillar: "resilience", text: "When did you feel like quitting today? What kept you going?" },
  { pillar: "resilience", text: "Describe a failure from this week. What did it teach you?" },
  { pillar: "resilience", text: "What's the hardest truth you've had to accept recently?" },
  { pillar: "resilience", text: "What would the strongest version of you have done differently today?" },
  { pillar: "resilience", text: "What setback are you still carrying? What would it take to put it down?" },
  { pillar: "resilience", text: "How have you grown from the hardest thing that happened this month?" },
  { pillar: "resilience", text: "What's a belief that once held you back that you've since outgrown?" },
  { pillar: "resilience", text: "When was the last time you chose discomfort on purpose? What happened?" },
  { pillar: "resilience", text: "What does your response to today's problems say about who you're becoming?" },
  { pillar: "resilience", text: "Who or what has tested your patience recently — and how did you respond?" },
  { pillar: "resilience", text: "What would you tell a past version of yourself who was facing what you face now?" },
  { pillar: "resilience", text: "How do you recover when things don't go to plan? Is it working?" },
  { pillar: "resilience", text: "What's one thing you've survived that you didn't think you could?" },
  { pillar: "resilience", text: "What part of your struggle right now is actually building something in you?" },

  // purpose
  { pillar: "purpose", text: "Why are you doing this? Write it out in full." },
  { pillar: "purpose", text: "What does your ideal life look like in 5 years? Be specific." },
  { pillar: "purpose", text: "Who are you becoming through this process?" },
  { pillar: "purpose", text: "What motivates you more than anything else right now?" },
  { pillar: "purpose", text: "If you could only keep one habit, what would it be and why?" },
  { pillar: "purpose", text: "What does success look like for you — not society's version, yours?" },
  { pillar: "purpose", text: "What do you want to be remembered for?" },
  { pillar: "purpose", text: "What problem in the world do you most want to solve — and are you moving toward it?" },
  { pillar: "purpose", text: "When do you feel most alive? How often does that happen?" },
  { pillar: "purpose", text: "What are you building — and is the daily work actually matching the vision?" },
  { pillar: "purpose", text: "What would you pursue if you knew you couldn't fail?" },
  { pillar: "purpose", text: "What's the deeper reason behind the goal on the surface?" },
  { pillar: "purpose", text: "Who do you want to show up for — and are you actually showing up?" },
  { pillar: "purpose", text: "What would your life look like if you fully committed to your values?" },
  { pillar: "purpose", text: "What's a version of your future that excites and terrifies you simultaneously?" },

  // shadow
  { pillar: "shadow", text: "What are you avoiding thinking about?" },
  { pillar: "shadow", text: "Where did fear stop you today?" },
  { pillar: "shadow", text: "What's the thing you most want to change about yourself?" },
  { pillar: "shadow", text: "What habit is hardest to quit and why do you think that is?" },
  { pillar: "shadow", text: "Be honest: are you making excuses anywhere in your life right now?" },
  { pillar: "shadow", text: "What story do you keep telling yourself that might not be true?" },
  { pillar: "shadow", text: "What do you secretly believe about your own potential — good and bad?" },
  { pillar: "shadow", text: "Where are you seeking validation that you should be giving to yourself?" },
  { pillar: "shadow", text: "What would you do if no one was watching — and what does that reveal?" },
  { pillar: "shadow", text: "What emotion are you suppressing right now? What is it trying to tell you?" },
  { pillar: "shadow", text: "Who have you been unfair to recently — and have you acknowledged it?" },
  { pillar: "shadow", text: "What are you jealous of, and what does that jealousy point to?" },
  { pillar: "shadow", text: "What truth about your situation are you softening to make it easier to live with?" },
  { pillar: "shadow", text: "Where are you self-sabotaging, even in small ways?" },
  { pillar: "shadow", text: "What would you do differently if you weren't trying to protect your ego?" },
];

const PILLAR_COLORS = {
  discipline: "#7C5CFC",
  resilience: "#F97316",
  purpose: "#22C55E",
  shadow: "#EC4899",
};

function getDailyPrompt(day) {
  return JOURNAL_PROMPTS[((day - 1) % JOURNAL_PROMPTS.length)];
}

// Keyword→course hints for cross-module nudges
const JOURNAL_COURSE_HINTS = [
  { keywords: ["sleep", "tired", "exhausted", "insomnia", "rest", "groggy", "fatigue"], courseId: "sleep_hygiene", label: "Sleep Optimization", icon: "🌙", color: "#7C5CFC" },
  { keywords: ["stress", "anxious", "anxiety", "overwhelm", "calm", "breathe", "meditat", "mindful", "focus"], courseId: "meditation_basics", label: "Mindfulness & Meditation", icon: "🧘", color: "#EC4899" },
  { keywords: ["water", "hydrat", "drink", "thirsty", "dehydrat"], courseId: "hydration", label: "Hydration Science", icon: "💧", color: "#38BDF8" },
  { keywords: ["workout", "exercise", "gym", "lift", "run", "cardio", "training", "muscle", "strength"], courseId: "strength_training", label: "Strength Training Basics", icon: "💪", color: "#F97316" },
  { keywords: ["money", "financ", "budget", "saving", "invest", "debt", "spend"], courseId: "money_basics", label: "Financial Clarity", icon: "💰", color: "#34D399" },
  { keywords: ["read", "book", "learn", "study", "knowledge"], courseId: "reading_habit", label: "Deep Reading Habit", icon: "📖", color: "#A78BFA" },
  { keywords: ["porn", "relaps", "addict", "quit", "sober", "clean"], courseId: "dopamine_detox", label: "Dopamine Detox Protocol", icon: "⚡", color: "#F59E0B" },
];

function suggestCourseFromJournal(text) {
  if (!text || text.length < 30) return null;
  const lower = text.toLowerCase();
  for (const hint of JOURNAL_COURSE_HINTS) {
    if (hint.keywords.some((kw) => lower.includes(kw))) return hint;
  }
  return null;
}

export default function JournalView({ state, journalText, setJournalText, selectedMood, setSelectedMood, onSave, onSaveRaw, onNavigate }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const day = state.currentDay;

  const [viewMode, setViewMode] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courseNudge, setCourseNudge] = useState(null);
  // J2: history pagination
  const [historyLimit, setHistoryLimit] = useState(20);
  const autoSaveTimer = useRef(null);

  const dailyPrompt = getDailyPrompt(day);
  const pillarColor = PILLAR_COLORS[dailyPrompt.pillar];

  // Parse all journal entries for history
  const journalEntries = useMemo(() => {
    return Object.keys(state.journal)
      .sort((a, b) => b - a)
      .map((d) => {
        let displayText = state.journal[d];
        let isChat = false;
        try {
          const parsed = JSON.parse(displayText);
          if (Array.isArray(parsed) && parsed[0]?.role) {
            isChat = true;
            displayText = parsed.filter((m) => m.role === "user").map((m) => m.text).join("\n\n");
          }
        } catch {}
        return { day: Number(d), text: displayText || "", mood: state.moods[d], isChat };
      });
  }, [state.journal, state.moods]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return journalEntries;
    const q = searchQuery.toLowerCase();
    return journalEntries.filter(
      (e) => e.text.toLowerCase().includes(q) || `day ${e.day}`.includes(q)
    );
  }, [journalEntries, searchQuery]);

  const totalEntries = journalEntries.length;

  // Auto-save write mode entries with debounce
  useEffect(() => {
    if (viewMode !== "write" || !journalText) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSavedAt(null);
    setSaving(true);
    autoSaveTimer.current = setTimeout(() => {
      onSaveRaw?.(journalText);
      setSavedAt(Date.now());
      setSaving(false);
    }, 1200);
    return () => clearTimeout(autoSaveTimer.current);
  }, [journalText, viewMode]);

  function handleManualSave() {
    onSave?.();
    setSavedAt(Date.now());
    const hint = suggestCourseFromJournal(journalText);
    if (hint) setCourseNudge(hint);
  }

  // Get the write-mode textarea value (support legacy plain-text entries)
  const writeValue = journalText || (() => {
    const raw = state.journal[day];
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]?.role) {
        return parsed.filter((m) => m.role === "user").map((m) => m.text).join("\n\n");
      }
    } catch {}
    return raw;
  })();

  return (
    <div style={S.vc}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 0" }}>
        <BookOpen size={20} color="#7C5CFC" strokeWidth={2} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: colors.text }}>Journal</div>
          <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1, fontWeight: 500 }}>
            Day {day} · {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{ display: "flex", gap: 6, padding: "10px 14px 0" }}>
        {[
          { id: "chat", label: "AI Chat", Icon: MessageCircle },
          { id: "write", label: "Write", Icon: PenLine },
          { id: "history", label: "History", Icon: Clock },
        ].map((t) => {
          const active = viewMode === t.id;
          return (
            <button
              key={t.id}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "8px 0",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background: active ? "rgba(124,92,252,0.12)" : "transparent",
                color: active ? "#7C5CFC" : colors.textSecondary,
                border: active ? "1px solid rgba(124,92,252,0.2)" : `1px solid transparent`,
              }}
              onClick={() => setViewMode(t.id)}
            >
              <t.Icon size={13} strokeWidth={active ? 2 : 1.5} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Mood picker — only Chat and Write ── */}
          {viewMode !== "history" && (
            <div style={{ padding: "10px 16px 4px" }}>
              <div style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 7,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                opacity: 0.5,
              }}>
                How are you feeling?
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {MOODS.map((m, i) => {
                  const active = selectedMood === i;
                  return (
                    <motion.div
                      key={i}
                      onClick={() => setSelectedMood(i)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "6px 8px",
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        minWidth: 50,
                        background: active ? `${m.color}18` : sub(0.03),
                        border: active ? `1px solid ${m.color}60` : `1px solid ${sub(0.06)}`,
                        boxShadow: active ? `0 2px 12px ${m.color}30` : "none",
                      }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: active ? m.color : `${m.color}50`,
                        transition: "all 0.15s", flexShrink: 0,
                      }} />
                      <div style={{
                        fontSize: 10,
                        color: colors.textSecondary,
                        opacity: active ? 0.9 : 0.45,
                        fontWeight: active ? 700 : 400,
                        marginTop: 4,
                      }}>
                        {m.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Chat Tab ── */}
          {viewMode === "chat" && (
            <ChatJournal
              state={state}
              journalText={journalText}
              setJournalText={setJournalText}
              onSaveFull={(raw) => onSaveRaw?.(raw)}
            />
          )}

          {/* ── Write Tab ── */}
          {viewMode === "write" && (
            <div style={{ padding: "10px 14px 0" }}>
              {/* Compact daily prompt */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: `${pillarColor}08`,
                border: `1px solid ${pillarColor}18`,
                marginBottom: 10,
              }}>
                <div style={{
                  width: 3, minHeight: 36, borderRadius: 2,
                  background: pillarColor, flexShrink: 0, marginTop: 2,
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: pillarColor,
                    textTransform: "uppercase", letterSpacing: 0.8,
                    opacity: 0.85, display: "block", marginBottom: 3,
                  }}>
                    {dailyPrompt.pillar} prompt
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: colors.text, lineHeight: 1.5, opacity: 0.82,
                  }}>
                    {dailyPrompt.text}
                  </span>
                </div>
              </div>

              <textarea
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 14,
                  border: `1px solid ${sub(0.1)}`,
                  background: sub(0.025),
                  color: colors.text,
                  fontSize: 14,
                  lineHeight: 1.75,
                  resize: "none",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  minHeight: 220,
                  transition: "border-color 0.15s",
                }}
                placeholder="Write freely..."
                value={writeValue}
                onChange={(e) => setJournalText(e.target.value)}
                rows={10}
              />

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
                marginBottom: 4,
              }}>
                <div style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.6, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {saving ? (
                    <span style={{ color: "#7C5CFC", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C5CFC", animation: "pulse 1.2s ease-in-out infinite" }} />
                      Saving…
                    </span>
                  ) : savedAt ? (
                    <span style={{ color: "#22C55E", fontWeight: 600 }}>✓ Saved {Math.max(0, Math.floor((Date.now() - savedAt) / 1000))}s ago</span>
                  ) : (
                    <span>{(journalText || "").length} chars</span>
                  )}
                </div>
                <motion.button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(124,92,252,0.25)",
                  }}
                  onClick={handleManualSave}
                  whileTap={{ scale: 0.96 }}
                >
                  <Check size={13} />
                  Save
                </motion.button>
              </div>

              <AIJournalInsight entry={journalText || state.journal[day] || ""} state={state} />

              {/* Course nudge */}
              <AnimatePresence>
                {courseNudge && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{
                      margin: "8px 0",
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: `${courseNudge.color}08`,
                      border: `1px solid ${courseNudge.color}18`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{courseNudge.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, opacity: 0.5 }}>
                        Related Course
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{courseNudge.label}</div>
                    </div>
                    {onNavigate && (
                      <button
                        style={{
                          padding: "6px 12px", borderRadius: 8,
                          background: `${courseNudge.color}15`,
                          border: `1px solid ${courseNudge.color}30`,
                          color: courseNudge.color, fontSize: 11, fontWeight: 700,
                          cursor: "pointer", flexShrink: 0,
                        }}
                        onClick={() => { onNavigate("academy"); setCourseNudge(null); }}
                      >
                        Learn →
                      </button>
                    )}
                    <button
                      style={{ background: "none", border: "none", opacity: 0.3, cursor: "pointer", fontSize: 14, padding: 4, flexShrink: 0, color: colors.text }}
                      onClick={() => setCourseNudge(null)}
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <SmartInsights sentiment={analyzeJournalSentiment(state)} />
            </div>
          )}

          {/* ── History Tab ── */}
          {viewMode === "history" && (
            <div style={{ padding: "6px 0 0" }}>
              <SmartInsights sentiment={analyzeJournalSentiment(state)} />

              {/* Stats row */}
              <div style={{ display: "flex", gap: 8, padding: "8px 14px" }}>
                {[
                  { val: totalEntries, label: "Entries" },
                  { val: journalEntries.filter((e) => e.mood != null).length, label: "Moods" },
                  { val: journalEntries.filter((e) => e.isChat).length, label: "AI Chats" },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                    background: sub(0.03), border: `1px solid ${sub(0.05)}`,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>{stat.val}</div>
                    <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Search */}
              {totalEntries > 3 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: "4px 14px 10px",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: sub(0.03),
                  border: `1px solid ${sub(0.06)}`,
                }}>
                  <Search size={14} color={colors.textSecondary} style={{ flexShrink: 0, opacity: 0.5 }} />
                  <input
                    style={{
                      flex: 1, background: "none", border: "none",
                      outline: "none", color: colors.text, fontSize: 13,
                      fontFamily: "inherit",
                    }}
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* Entry list */}
              {filteredEntries.length === 0 ? (
                <div style={{
                  margin: "12px 14px",
                  padding: "32px 20px",
                  borderRadius: 14,
                  background: sub(0.02),
                  border: `1px solid ${sub(0.05)}`,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: colors.textSecondary,
                  fontSize: 12,
                  lineHeight: 1.6,
                }}>
                  {searchQuery ? (
                    <>
                      <Search size={20} color={sub(0.15)} strokeWidth={1.5} />
                      <div style={{ marginTop: 8 }}>No entries match "{searchQuery}"</div>
                    </>
                  ) : (
                    <>
                      <BookOpen size={24} color={sub(0.15)} strokeWidth={1.5} />
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: colors.text }}>No entries yet</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: colors.textSecondary, opacity: 0.5 }}>
                        Start writing to record your first entry.
                      </div>
                    </>
                  )}
                </div>
              ) : (
                filteredEntries.slice(0, historyLimit).map((entry, i) => (
                  <motion.div
                    key={entry.day}
                    style={{
                      margin: "0 14px 8px",
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: sub(0.02),
                      border: `1px solid ${sub(0.05)}`,
                    }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>
                        <Calendar size={10} color="#7C5CFC" />
                        <span>Day {entry.day}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {/* Mode badge — Chat or Write */}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
                          background: entry.isChat ? "rgba(124,92,252,0.08)" : sub(0.04),
                          color: entry.isChat ? "rgba(124,92,252,0.8)" : colors.textSecondary,
                          border: entry.isChat ? "1px solid rgba(124,92,252,0.15)" : `1px solid ${sub(0.06)}`,
                        }}>
                          {entry.isChat ? <MessageCircle size={9} /> : <PenLine size={9} />}
                          {entry.isChat ? "Chat" : "Write"}
                        </span>
                        {entry.mood != null && MOODS[entry.mood] && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 10, fontWeight: 600,
                            color: MOODS[entry.mood].color,
                            background: `${MOODS[entry.mood].color}18`,
                            border: `1px solid ${MOODS[entry.mood].color}40`,
                            borderRadius: 6, padding: "2px 6px",
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: MOODS[entry.mood].color, display: "inline-block" }} />
                            {MOODS[entry.mood].label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 12, lineHeight: 1.7,
                      color: colors.textSecondary,
                      whiteSpace: "pre-wrap",
                    }}>
                      {entry.text.length > 200 ? entry.text.slice(0, 200) + "..." : entry.text || "No text recorded"}
                    </div>
                  </motion.div>
                ))
              )}

              {filteredEntries.length > historyLimit && (
                <div style={{ textAlign: "center", padding: "8px 14px 14px" }}>
                  <button
                    style={{
                      padding: "10px 18px", borderRadius: 10,
                      background: "rgba(124,92,252,0.08)",
                      border: "1px solid rgba(124,92,252,0.2)",
                      color: "#7C5CFC", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={() => setHistoryLimit((n) => n + 20)}
                  >
                    Show more ({filteredEntries.length - historyLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
