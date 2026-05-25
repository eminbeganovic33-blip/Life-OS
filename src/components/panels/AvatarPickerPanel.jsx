import { motion } from "framer-motion";
import { ChevronLeft, Check, User } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { ANIMAL_AVATARS, renderAnimalAvatar } from "../shared/AnimalAvatars";

export default function AvatarPickerPanel({ state, save, onClose }) {
  const current = state.avatar || null;

  function pick(id) {
    save({ ...state, avatar: id });
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <User size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Choose Avatar</span>
      </div>

      <div style={styles.body}>
        <div style={styles.intro}>Pick your spirit animal. You can change this anytime.</div>

        <div style={styles.grid}>
          {ANIMAL_AVATARS.map((a) => {
            const selected = current === a.id;
            return (
              <button
                key={a.id}
                onClick={() => pick(a.id)}
                style={{
                  ...styles.card,
                  borderColor: selected ? a.bgColor : "transparent",
                  background: selected ? `${a.bgColor}10` : TOKENS.color.surface,
                }}
              >
                <div style={styles.avatarWrap}>
                  {renderAnimalAvatar(a.id, 72)}
                  {selected && (
                    <div style={{ ...styles.checkBadge, background: a.bgColor }}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div style={styles.label}>{a.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  panel: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 480, background: TOKENS.color.bg,
    zIndex: 200, display: "flex", flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  title: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  body: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  intro: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    marginBottom: TOKENS.space[5], lineHeight: 1.5,
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: TOKENS.space[3],
  },
  card: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: TOKENS.space[2], padding: TOKENS.space[4],
    borderRadius: TOKENS.radius.lg,
    border: "2px solid transparent",
    background: TOKENS.color.surface,
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  avatarWrap: { position: "relative" },
  checkBadge: {
    position: "absolute", top: -2, right: -2,
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #fff",
  },
  label: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
};
