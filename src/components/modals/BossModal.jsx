import { S } from "../../styles/theme";

export default function BossModal({ bossDay, onProgress }) {
  const isFinal = bossDay === 66;
  return (
    <div style={S.overlay}>
      <div style={S.bossCard} onClick={(e) => e.stopPropagation()}>
        <div style={S.bossGlow} />
        <div style={{ fontSize: 56, position: "relative", zIndex: 2 }}>
          {isFinal ? "👑" : "⚔️"}
        </div>
        <div style={S.bossTitle}>
          {isFinal ? "JOURNEY COMPLETE" : "BOSS LEVEL CLEARED"}
        </div>
        <div style={S.bossSub}>
          {isFinal
            ? "You've completed the full 66-day transformation. Mastery Mode is now active — your journey continues infinitely."
            : `Day ${bossDay} conquered. New exercises and courses have been unlocked.`}
        </div>
        <div style={S.bossXp}>{isFinal ? "+500 XP" : "+100 XP"}</div>
        {!isFinal && (
          <div style={unlockList}>
            <div style={unlockItem}>🏋️ 8 new Dojo exercises unlocked</div>
            <div style={unlockItem}>📚 Advanced Academy courses available</div>
          </div>
        )}
        {isFinal && (
          <div style={unlockList}>
            <div style={unlockItem}>♾️ Mastery Mode — Day counter continues to 999+</div>
            <div style={unlockItem}>📚 All remaining courses unlocked</div>
          </div>
        )}
        <button style={{ ...S.motBtn, position: "relative", zIndex: 10 }} onClick={(e) => { e.stopPropagation(); onProgress(); }}>Evolve →</button>
      </div>
    </div>
  );
}

const unlockList = {
  textAlign: "left",
  padding: "10px 16px",
  borderRadius: 12,
  background: "rgba(249,115,22,0.06)",
  border: "1px solid rgba(249,115,22,0.1)",
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
};

const unlockItem = {
  fontSize: 12,
  lineHeight: 1.8,
  opacity: 0.7,
};
