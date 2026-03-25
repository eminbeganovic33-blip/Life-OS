import { useState } from "react";
import { S } from "../../styles/theme";
import { CATEGORIES } from "../../data";
import { getQuestTier, calculateQuestXP } from "../../utils";

export default function CustomQuestModal({ unlockedCategories, onAdd, onClose }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [questText, setQuestText] = useState("");

  const tier = questText.trim() ? getQuestTier(questText) : null;
  const xpPreview = questText.trim() ? calculateQuestXP(questText, 1) : 0;

  function handleAdd() {
    if (!selectedCat || !questText.trim()) return;
    onAdd({
      id: `cq_${Date.now()}`,
      category: selectedCat,
      text: questText.trim(),
    });
    setQuestText("");
    setSelectedCat(null);
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Add Custom Quest</span>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>

        <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 14, lineHeight: 1.5 }}>
          Custom quest slots unlock after a 7-day streak in each category's core quest.
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
                {!isUnlocked && <span style={{ fontSize: 10, marginLeft: 4 }}>🔒</span>}
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
          onChange={(e) => setQuestText(e.target.value)}
          disabled={!selectedCat}
        />

        {/* XP preview */}
        {questText.trim() && tier && (
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
            opacity: selectedCat && questText.trim() ? 1 : 0.35,
          }}
          onClick={handleAdd}
          disabled={!selectedCat || !questText.trim()}
        >
          Add Quest
        </button>
      </div>
    </div>
  );
}
