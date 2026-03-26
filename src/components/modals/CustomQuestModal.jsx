import { useState, useMemo } from "react";
import { S } from "../../styles/theme";
import { CATEGORIES } from "../../data";
import { getQuestTier, calculateQuestXP } from "../../utils";

const MAX_CUSTOM_QUESTS = 5;

// Keywords for similarity detection
const SIMILARITY_KEYWORDS = {
  run: ["run", "jog", "sprint", "running", "jogging"],
  walk: ["walk", "steps", "walking", "10000", "10,000"],
  pushup: ["push-up", "pushup", "push up", "push ups", "pushups"],
  meditate: ["meditate", "meditation", "mindful", "mindfulness"],
  read: ["read", "reading", "book"],
  water: ["water", "hydrat", "drink", "glasses"],
  sleep: ["sleep", "bed", "bedtime", "wake"],
  screen: ["screen", "phone", "social media", "digital", "doomscroll"],
  workout: ["workout", "gym", "exercise", "lift", "train", "training"],
  stretch: ["stretch", "stretching", "yoga", "flexibility"],
  journal: ["journal", "write", "writing", "diary"],
  cold: ["cold", "shower", "ice"],
  food: ["food", "eat", "diet", "meal", "calorie", "junk"],
};

function findSimilarQuests(newText, existingQuests) {
  const lower = newText.toLowerCase();
  const matches = [];

  for (const quest of existingQuests) {
    const questLower = quest.text.toLowerCase();

    // Direct substring match
    if (lower.includes(questLower) || questLower.includes(lower)) {
      matches.push({ quest, reason: "Very similar to existing quest" });
      continue;
    }

    // Keyword-based match
    for (const [, keywords] of Object.entries(SIMILARITY_KEYWORDS)) {
      const newHas = keywords.some((k) => lower.includes(k));
      const existHas = keywords.some((k) => questLower.includes(k));
      if (newHas && existHas) {
        matches.push({ quest, reason: "Could be bundled with existing quest" });
        break;
      }
    }
  }

  return matches;
}

export default function CustomQuestModal({ unlockedCategories, onAdd, onClose, currentDay, existingQuests = [], customQuestCount = 0 }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [questText, setQuestText] = useState("");
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const tier = questText.trim() ? getQuestTier(questText) : null;
  const xpPreview = questText.trim() ? calculateQuestXP(questText, currentDay || 1) : 0;
  const atLimit = customQuestCount >= MAX_CUSTOM_QUESTS;

  // Find similar existing quests
  const similarQuests = useMemo(() => {
    if (!questText.trim() || questText.trim().length < 3) return [];
    return findSimilarQuests(questText, existingQuests);
  }, [questText, existingQuests]);

  const showSuggestion = similarQuests.length > 0 && !dismissedSuggestion;

  function handleAdd() {
    if (!selectedCat || !questText.trim() || atLimit) return;
    onAdd({
      id: `cq_${Date.now()}`,
      category: selectedCat,
      text: questText.trim().slice(0, 200),
    });
    setQuestText("");
    setSelectedCat(null);
    setDismissedSuggestion(false);
  }

  function handleTextChange(e) {
    setQuestText(e.target.value);
    setDismissedSuggestion(false);
  }

  const allLocked = unlockedCategories.length === 0;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Add Custom Quest</span>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>

        {allLocked ? (
          <div style={lockedMessage}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Custom quests unlock on Day 4</div>
            <div style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>
              Complete your first 3 days to unlock the ability to add your own quests.
              Focus on your current quests for now — use the Academy to learn techniques!
            </div>
          </div>
        ) : atLimit ? (
          <div style={lockedMessage}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Quest limit reached ({MAX_CUSTOM_QUESTS}/{MAX_CUSTOM_QUESTS})</div>
            <div style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>
              You've reached the maximum of {MAX_CUSTOM_QUESTS} custom quests.
              Remove an existing custom quest to add a new one.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 14, lineHeight: 1.5 }}>
              {customQuestCount}/{MAX_CUSTOM_QUESTS} custom quest slots used
            </div>

            {/* Category selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {CATEGORIES.map((cat) => {
                const isUnlocked = unlockedCategories.includes(cat.id);
                const isSelected = selectedCat === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => isUnlocked && setSelectedCat(cat.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? cat.color : isUnlocked ? `${cat.color}33` : "rgba(255,255,255,0.06)"}`,
                      background: isSelected ? `${cat.color}18` : "rgba(255,255,255,0.02)",
                      color: isUnlocked ? cat.color : "rgba(255,255,255,0.2)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isUnlocked ? "pointer" : "default",
                      opacity: isUnlocked ? 1 : 0.4,
                      transition: "all 0.15s",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </div>
                );
              })}
            </div>

            {/* Quest text input */}
            <input
              style={{
                ...S.setInput,
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                fontSize: 13,
                marginBottom: 8,
                boxSizing: "border-box",
              }}
              type="text"
              placeholder={selectedCat ? "e.g. 20 min morning run" : "Select a category first..."}
              value={questText}
              onChange={handleTextChange}
              disabled={!selectedCat}
              maxLength={200}
            />

            {/* Similar quest suggestion */}
            {showSuggestion && (
              <div style={suggestionBox}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FACC15", marginBottom: 6 }}>
                  Similar quest detected
                </div>
                {similarQuests.map(({ quest, reason }, i) => (
                  <div key={i} style={suggestionItem}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{quest.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.4 }}>{reason}</div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button style={suggestionBtn} onClick={() => setDismissedSuggestion(true)}>
                    Add anyway
                  </button>
                  <button style={{ ...suggestionBtn, color: "#7C5CFC", borderColor: "rgba(124,92,252,0.2)" }} onClick={onClose}>
                    Keep existing
                  </button>
                </div>
              </div>
            )}

            {/* XP preview */}
            {questText.trim() && tier && !showSuggestion && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                marginBottom: 12,
                fontSize: 12,
              }}>
                <span>
                  <span style={{ color: tier.color, fontWeight: 700 }}>{tier.label}</span>
                  <span style={{ opacity: 0.3, marginLeft: 6 }}>Tier {tier.tier}</span>
                </span>
                <span style={{ color: "#FACC15", fontWeight: 700 }}>+{xpPreview} XP</span>
              </div>
            )}

            <button
              style={{
                ...S.primaryBtn,
                margin: "4px 0 0",
                width: "100%",
                opacity: selectedCat && questText.trim() && !showSuggestion ? 1 : 0.35,
              }}
              onClick={handleAdd}
              disabled={!selectedCat || !questText.trim() || showSuggestion}
            >
              Add Quest
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const lockedMessage = {
  textAlign: "center",
  padding: "20px 10px",
};

const suggestionBox = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(250,204,21,0.06)",
  border: "1px solid rgba(250,204,21,0.12)",
  marginBottom: 12,
};

const suggestionItem = {
  padding: "6px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const suggestionBtn = {
  flex: 1,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(250,204,21,0.2)",
  background: "transparent",
  color: "#FACC15",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};
