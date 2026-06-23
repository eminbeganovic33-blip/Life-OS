import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Inbox as InboxIcon } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { isAIConfigured } from "../../utils/ai";
import { feedback } from "../../utils/audio";
import { useToast } from "./Toast";

// Friction-free quick capture (Phase 9A).
// One tap → one line → saved to state.inbox. No category, no XP setup.
// Triage happens later in the Inbox panel. Removes the #1 reason habit apps
// get uninstalled: capture friction.
export default function QuickCaptureFab({ state, save, onOpenInbox }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const toast = useToast();

  // Autofocus the input whenever the sheet opens so the keyboard pops
  // immediately on mobile.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const openCount = (state.inbox || []).filter((i) => i.status === "open").length;

  // Sit above the AI Coach FAB when it's present; otherwise take its slot.
  const bottom = isAIConfigured() ? 148 : 84;

  function capture() {
    const trimmed = text.trim().slice(0, 280);
    if (!trimmed) return;
    const item = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
      status: "open",
    };
    save({ ...state, inbox: [item, ...(state.inbox || [])] });
    setText("");
    feedback("questCheck");
    toast.show("Captured ✓", { type: "xp", duration: 1400 });
    // Keep the sheet open for rapid-fire capture; refocus the input.
    inputRef.current?.focus();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ ...styles.fab, bottom }}
        aria-label="Quick capture"
      >
        <Plus size={22} color="#fff" strokeWidth={2.6} />
        {openCount > 0 && <span style={styles.badge}>{openCount > 9 ? "9+" : openCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={styles.sheet}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.header}>
                <div style={styles.headerTitle}>Quick capture</div>
                <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close">
                  <X size={18} color={TOKENS.color.textTertiary} />
                </button>
              </div>

              <div style={styles.sub}>
                Dump it now, sort it later. No category needed.
              </div>

              <div style={styles.inputRow}>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && capture()}
                  placeholder="What's on your mind?"
                  style={styles.input}
                  maxLength={280}
                />
                <button
                  onClick={capture}
                  disabled={!text.trim()}
                  style={{
                    ...styles.saveBtn,
                    opacity: text.trim() ? 1 : 0.4,
                    cursor: text.trim() ? "pointer" : "default",
                  }}
                >
                  Save
                </button>
              </div>

              <button
                onClick={() => { setOpen(false); onOpenInbox?.(); }}
                style={styles.inboxLink}
              >
                <InboxIcon size={14} color={TOKENS.color.brand} />
                <span>
                  {openCount > 0 ? `Triage inbox · ${openCount} waiting` : "Open inbox"}
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  fab: {
    position: "fixed", right: 16,
    width: 52, height: 52, borderRadius: 26,
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    border: "none", cursor: "pointer",
    boxShadow: "0 12px 32px rgba(16,185,129,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 90,
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, padding: "0 5px",
    borderRadius: 9, background: TOKENS.color.text, color: "#fff",
    fontSize: 11, fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    zIndex: 300,
  },
  sheet: {
    width: "100%", maxWidth: 480,
    background: TOKENS.color.bg,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: TOKENS.space[5],
    paddingRight: TOKENS.space[5],
    paddingLeft: TOKENS.space[5],
    paddingBottom: `max(${TOKENS.space[5]}px, env(safe-area-inset-bottom))`,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerTitle: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 10, margin: -6, display: "flex", alignItems: "center", justifyContent: "center" },
  sub: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    marginTop: 4, marginBottom: TOKENS.space[4],
  },
  inputRow: { display: "flex", gap: TOKENS.space[2] },
  input: {
    flex: 1, padding: "14px 16px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface, fontSize: TOKENS.font.size.md,
    color: TOKENS.color.text, outline: "none", boxSizing: "border-box",
  },
  saveBtn: {
    padding: "0 20px", borderRadius: TOKENS.radius.lg, border: "none",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "#fff", fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
  },
  inboxLink: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%", marginTop: TOKENS.space[4],
    padding: `${TOKENS.space[3]}px`,
    background: "rgba(124,92,252,0.06)",
    border: "1px dashed rgba(124,92,252,0.30)",
    borderRadius: TOKENS.radius.lg, cursor: "pointer",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.brand,
  },
};
