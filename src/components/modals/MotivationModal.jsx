import { motion } from "framer-motion";
import { S } from "../../styles/theme";

export default function MotivationModal({ card, onDismiss }) {
  if (!card) return null;
  return (
    <motion.div
      style={S.overlay}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={S.motCard}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      >
        <div style={S.motBadge}>{card.category}</div>
        <div style={S.motQuote}>"{card.quote}"</div>
        <div style={S.motAuthor}>— {card.author}</div>
        <button style={S.motBtn} onClick={(e) => { e.stopPropagation(); onDismiss(); }}>Let's Go</button>
      </motion.div>
    </motion.div>
  );
}
