import React, { useState } from "react";
import { useTheme } from "../hooks/useTheme";

const QuestGuidePanel = ({ guide, onAddQuest }) => {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  const [expandedSections, setExpandedSections] = useState({});
  const [expandedBooks, setExpandedBooks] = useState({});

  if (!guide) return null;

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBook = (idx) => {
    setExpandedBooks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const styles = {
    panel: {
      background: sub(0.02),
      borderRadius: 12,
      padding: "14px 16px",
      maxWidth: 400,
      width: "100%",
      fontFamily: "inherit",
      color: colors.text,
      fontSize: 12,
      lineHeight: 1.5,
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    icon: {
      fontSize: 22,
      lineHeight: 1,
      flexShrink: 0,
    },
    headerText: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: 700,
      color: colors.text,
      margin: 0,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      margin: 0,
    },
    section: {
      background: sub(0.03),
      borderRadius: 10,
      border: `1px solid ${sub(0.06)}`,
      padding: "10px 12px",
      marginBottom: 8,
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      userSelect: "none",
      fontSize: 13,
      fontWeight: 600,
      color: colors.text,
    },
    arrow: {
      fontSize: 12,
      color: colors.textSecondary,
      marginRight: 4,
      width: 14,
      display: "inline-block",
    },
    tipList: {
      margin: 0,
      padding: "0 0 0 16px",
      listStyle: "disc",
    },
    tipItem: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 3,
    },
    stepItem: {
      display: "flex",
      gap: 8,
      marginBottom: 8,
    },
    stepNumber: {
      fontSize: 11,
      fontWeight: 700,
      color: "#7C5CFC",
      minWidth: 18,
      textAlign: "center",
      lineHeight: "18px",
      height: 18,
      borderRadius: 9,
      background: "rgba(124,92,252,0.12)",
      flexShrink: 0,
    },
    stepLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: colors.text,
      marginBottom: 1,
    },
    stepDetail: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    bookItem: {
      background: sub(0.03),
      borderRadius: 8,
      padding: "8px 10px",
      marginBottom: 6,
    },
    bookHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      userSelect: "none",
    },
    bookTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: colors.text,
    },
    bookAuthor: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    bookSummary: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 1.45,
    },
    addQuestBtn: {
      marginTop: 6,
      padding: "4px 10px",
      fontSize: 11,
      fontWeight: 600,
      color: "#7C5CFC",
      background: "rgba(124,92,252,0.1)",
      border: "1px solid rgba(124,92,252,0.25)",
      borderRadius: 6,
      cursor: "pointer",
      outline: "none",
    },
    card: {
      background: sub(0.03),
      borderRadius: 8,
      padding: "8px 10px",
      marginBottom: 6,
    },
    cardName: {
      fontSize: 12,
      fontWeight: 600,
      color: colors.text,
      marginBottom: 3,
    },
    badge: {
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      color: "#7C5CFC",
      background: "rgba(124,92,252,0.1)",
      borderRadius: 4,
      padding: "1px 6px",
      marginLeft: 6,
    },
    cardDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 1.4,
    },
    levelRow: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      padding: "4px 0",
      borderBottom: `1px solid ${sub(0.04)}`,
    },
    levelBadge: {
      fontSize: 10,
      fontWeight: 700,
      color: "#7C5CFC",
      minWidth: 16,
    },
    levelExercise: {
      fontSize: 11,
      fontWeight: 600,
      color: colors.text,
      flex: 1,
    },
    levelReps: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    levelCue: {
      fontSize: 10,
      color: "rgba(124,92,252,0.6)",
      fontStyle: "italic",
    },
    ingredientList: {
      fontSize: 11,
      color: colors.textSecondary,
      margin: "3px 0",
    },
    benefitText: {
      fontSize: 11,
      color: "rgba(124,92,252,0.7)",
      fontStyle: "italic",
    },
    programMeta: {
      display: "flex",
      gap: 8,
      marginBottom: 3,
    },
  };

  const CollapsibleSection = ({ title, sectionKey, children }) => {
    const isOpen = !!expandedSections[sectionKey];
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggleSection(sectionKey)}>
          <span>
            <span style={styles.arrow}>{isOpen ? "▾" : "▸"}</span>
            {title}
          </span>
        </div>
        {isOpen && <div style={{ marginTop: 8 }}>{children}</div>}
      </div>
    );
  };

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        {guide.icon && <span style={styles.icon}>{guide.icon}</span>}
        <div style={styles.headerText}>
          {guide.title && <h3 style={styles.title}>{guide.title}</h3>}
          {guide.subtitle && <p style={styles.subtitle}>{guide.subtitle}</p>}
        </div>
      </div>

      {/* Tips */}
      {guide.tips && guide.tips.length > 0 && (
        <div style={styles.section}>
          <ul style={styles.tipList}>
            {guide.tips.map((tip, i) => (
              <li key={i} style={styles.tipItem}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {guide.steps && guide.steps.length > 0 && (
        <div style={styles.section}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Steps</div>
          {guide.steps.map((step, i) => (
            <div key={i} style={styles.stepItem}>
              <span style={styles.stepNumber}>{i + 1}</span>
              <div>
                <div style={styles.stepLabel}>{step.label}</div>
                {step.detail && <div style={styles.stepDetail}>{step.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Books */}
      {guide.books && guide.books.length > 0 && (
        <CollapsibleSection title="Books" sectionKey="books">
          {guide.books.map((book, i) => (
            <div key={i} style={styles.bookItem}>
              <div style={styles.bookHeader} onClick={() => toggleBook(i)}>
                <div>
                  <div style={styles.bookTitle}>{book.title}</div>
                  {book.author && <div style={styles.bookAuthor}>{book.author}</div>}
                </div>
                <span style={styles.arrow}>{expandedBooks[i] ? "▾" : "▸"}</span>
              </div>
              {expandedBooks[i] && (
                <div>
                  {book.category && (
                    <span style={styles.badge}>{book.category}</span>
                  )}
                  {book.summary && (
                    <div style={styles.bookSummary}>{book.summary}</div>
                  )}
                  {book.actionQuest && onAddQuest && (
                    <button
                      style={styles.addQuestBtn}
                      onClick={() => onAddQuest(book.actionQuest)}
                    >
                      Add to Quests
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Techniques */}
      {guide.techniques && guide.techniques.length > 0 && (
        <CollapsibleSection title="Techniques" sectionKey="techniques">
          {guide.techniques.map((tech, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardName}>
                {tech.name}
                {tech.time && <span style={styles.badge}>{tech.time}</span>}
              </div>
              {tech.desc && <div style={styles.cardDesc}>{tech.desc}</div>}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Progressions */}
      {guide.progressions && guide.progressions.length > 0 && (
        <CollapsibleSection title="Progressions" sectionKey="progressions">
          {guide.progressions.map((prog, pi) => {
            const progKey = `prog_${pi}`;
            const isProgOpen = !!expandedSections[progKey];
            return (
              <div key={pi} style={styles.card}>
                <div
                  style={{ ...styles.sectionHeader, fontSize: 12, marginBottom: isProgOpen ? 6 : 0 }}
                  onClick={() => toggleSection(progKey)}
                >
                  <span>
                    <span style={styles.arrow}>{isProgOpen ? "▾" : "▸"}</span>
                    {prog.name}
                  </span>
                </div>
                {isProgOpen &&
                  prog.levels &&
                  prog.levels.map((lvl, li) => (
                    <div key={li} style={styles.levelRow}>
                      <span style={styles.levelBadge}>L{lvl.level}</span>
                      <span style={styles.levelExercise}>{lvl.exercise}</span>
                      {lvl.reps && <span style={styles.levelReps}>{lvl.reps}</span>}
                      {lvl.cue && <div style={styles.levelCue}>{lvl.cue}</div>}
                    </div>
                  ))}
              </div>
            );
          })}
        </CollapsibleSection>
      )}

      {/* Nutrition */}
      {guide.nutrition && guide.nutrition.length > 0 && (
        <CollapsibleSection title="Nutrition" sectionKey="nutrition">
          {guide.nutrition.map((recipe, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardName}>{recipe.name}</div>
              {recipe.ingredients && (
                <div style={styles.ingredientList}>{recipe.ingredients.join(", ")}</div>
              )}
              {recipe.benefit && <div style={styles.benefitText}>{recipe.benefit}</div>}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Programs */}
      {guide.programs && guide.programs.length > 0 && (
        <CollapsibleSection title="Programs" sectionKey="programs">
          {guide.programs.map((prog, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardName}>{prog.name}</div>
              <div style={styles.programMeta}>
                {prog.weeks && <span style={styles.badge}>{prog.weeks} weeks</span>}
                {prog.frequency && <span style={styles.badge}>{prog.frequency}</span>}
              </div>
              {prog.desc && <div style={styles.cardDesc}>{prog.desc}</div>}
            </div>
          ))}
        </CollapsibleSection>
      )}
    </div>
  );
};

export default QuestGuidePanel;
