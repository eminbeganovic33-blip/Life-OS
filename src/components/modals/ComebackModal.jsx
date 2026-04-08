import { motion, AnimatePresence } from "framer-motion";
import { TOKENS, DARK_COLORS } from "../../styles/theme";
import { Flame, Heart, Shield, ArrowRight } from "lucide-react";

const T = TOKENS;
const C = DARK_COLORS;

const MESSAGES = [
  { min: 2, max: 4, title: "Welcome Back!", sub: "A short break, but you're here now. That's what matters.", Icon: Heart, color: "#EC4899" },
  { min: 5, max: 13, title: "The Comeback", sub: "Every champion has setbacks. Your streak may have reset, but your progress hasn't.", Icon: Shield, color: "#7C5CFC" },
  { min: 14, max: Infinity, title: "Rise Again", sub: "It's been a while, but showing up today proves you haven't given up. Let's rebuild, stronger.", Icon: Flame, color: "#F97316" },
];

export default function ComebackModal({ show, daysAway, streak, onClose }) {
  const msg = MESSAGES.find((m) => daysAway >= m.min && daysAway <= m.max) || MESSAGES[0];
  const { Icon } = msg;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={card}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 12 }}
              style={{ ...iconCircle, background: `${msg.color}18`, boxShadow: `0 0 40px ${msg.color}22` }}
            >
              <Icon size={32} color={msg.color} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={title}
            >
              {msg.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={sub}
            >
              {msg.sub}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={statsRow}
            >
              <div style={statItem}>
                <div style={{ fontSize: T.font.xl, fontWeight: T.weight.black, color: msg.color }}>{daysAway}</div>
                <div style={{ fontSize: T.font.xs, color: C.textSecondary }}>days away</div>
              </div>
              {streak > 0 && (
                <div style={statItem}>
                  <div style={{ fontSize: T.font.xl, fontWeight: T.weight.black, color: "#F97316" }}>{streak}</div>
                  <div style={{ fontSize: T.font.xs, color: C.textSecondary }}>streak saved</div>
                </div>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={btn}
              onClick={onClose}
              whileTap={{ scale: 0.97 }}
            >
              Let's Go <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: T.space.lg,
};

const card = {
  width: "100%",
  maxWidth: 360,
  padding: T.space.xxl,
  borderRadius: T.radii.xl,
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  textAlign: "center",
};

const iconCircle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: `0 auto ${T.space.lg}px`,
};

const title = {
  fontSize: T.font.hero,
  fontWeight: T.weight.black,
  margin: `0 0 ${T.space.sm}px`,
  letterSpacing: -0.5,
};

const sub = {
  fontSize: T.font.sm,
  color: C.textSecondary,
  lineHeight: 1.5,
  margin: `0 0 ${T.space.lg}px`,
};

const statsRow = {
  display: "flex",
  justifyContent: "center",
  gap: T.space.xxl,
  marginBottom: T.space.xl,
};

const statItem = {
  textAlign: "center",
};

const btn = {
  width: "100%",
  padding: `${T.space.lg}px`,
  borderRadius: T.radii.md,
  border: "none",
  background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
  color: "#fff",
  fontSize: T.font.md,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(124,92,252,0.25)",
  fontFamily: "inherit",
};
