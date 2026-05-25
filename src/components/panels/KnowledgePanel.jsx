import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { QUEST_GUIDES } from "../../data/questGuides";

// Filter out alias entries (entries that only redirect to other guides)
const guideEntries = Object.entries(QUEST_GUIDES).filter(
  ([_, g]) => g && !g._aliasOf && g.title
);

export default function KnowledgePanel({ onClose }) {
  const [selectedKey, setSelectedKey] = useState(null);

  function resolveGuide(key) {
    if (!key) return null;
    const g = QUEST_GUIDES[key];
    if (g && g._aliasOf) return QUEST_GUIDES[g._aliasOf];
    return g;
  }
  const guide = resolveGuide(selectedKey);

  if (guide) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setSelectedKey(null)} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={styles.guideTitle}>{guide.icon} {guide.title}</div>
            {guide.subtitle && <div style={styles.guideSub}>{guide.subtitle}</div>}
          </div>
        </div>

        <div style={styles.content}>
          {guide.tips && guide.tips.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Tips</div>
              {guide.tips.map((tip, i) => (
                <div key={i} style={styles.tipRow}>
                  <div style={styles.tipBullet}>{i + 1}</div>
                  <div style={styles.tipText}>{tip}</div>
                </div>
              ))}
            </div>
          )}

          {guide.steps && guide.steps.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Action steps</div>
              {guide.steps.map((step, i) => (
                <div key={i} style={styles.stepCard}>
                  <div style={styles.stepLabel}>{step.label}</div>
                  <div style={styles.stepDetail}>{step.detail}</div>
                </div>
              ))}
            </div>
          )}

          {guide.techniques && guide.techniques.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Techniques</div>
              {guide.techniques.map((t, i) => (
                <div key={i} style={styles.stepCard}>
                  <div style={styles.stepLabel}>{t.name} <span style={styles.techTime}>{t.time}</span></div>
                  <div style={styles.stepDetail}>{t.desc}</div>
                </div>
              ))}
            </div>
          )}

          {guide.books && guide.books.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Recommended reading</div>
              {guide.books.map((b, i) => (
                <div key={i} style={styles.bookCard}>
                  <div style={styles.bookTitle}>{b.title}</div>
                  <div style={styles.bookAuthor}>{b.author} — {b.category}</div>
                  <div style={styles.bookSummary}>{b.summary}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
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
        <button onClick={onClose} style={styles.backBtn} data-panel-back aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <BookOpen size={20} color={TOKENS.color.text} />
        <div style={styles.headerTitle}>Knowledge Engine</div>
      </div>

      <div style={styles.guideList}>
        {guideEntries.map(([key, g]) => (
          <button key={key} onClick={() => setSelectedKey(key)} style={styles.guideCard}>
            <div style={styles.guideIcon}>{g.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.guideName}>{g.title}</div>
              {g.subtitle && <div style={styles.guideDesc}>{g.subtitle}</div>}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

const styles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: 480,
    background: TOKENS.color.bg,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[5]}px`,
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  headerTitle: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  guideTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  guideSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  guideList: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  guideCard: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  guideIcon: { fontSize: 28 },
  guideName: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  guideDesc: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  section: {
    marginBottom: TOKENS.space[7],
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[3],
  },
  tipRow: {
    display: "flex",
    gap: TOKENS.space[3],
    marginBottom: TOKENS.space[3],
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: TOKENS.radius.full,
    background: TOKENS.color.surface,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipText: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    color: TOKENS.color.textSecondary,
  },
  stepCard: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  stepLabel: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
    marginBottom: 4,
  },
  stepDetail: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.5,
  },
  techTime: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  bookCard: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  bookTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  bookAuthor: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
    marginBottom: 8,
  },
  bookSummary: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    color: TOKENS.color.textSecondary,
  },
};
