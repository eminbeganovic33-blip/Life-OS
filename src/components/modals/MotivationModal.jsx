import { S } from "../../styles/theme";

export default function MotivationModal({ card, onDismiss }) {
  if (!card) return null;
  return (
    <div style={S.overlay} onClick={onDismiss}>
      <div style={S.motCard} onClick={(e) => e.stopPropagation()}>
        <div style={S.motBadge}>{card.category}</div>
        <div style={S.motQuote}>"{card.quote}"</div>
        <div style={S.motAuthor}>— {card.author}</div>
        <button style={S.motBtn} onClick={(e) => { e.stopPropagation(); onDismiss(); }}>Let's Go</button>
      </div>
    </div>
  );
}
