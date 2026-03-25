import { S } from "../styles/theme";

const NAV = [
  { id: "home", icon: "⚔️", label: "Quests" },
  { id: "academy", icon: "📚", label: "Academy" },
  { id: "forge", icon: "🔥", label: "Forge" },
  { id: "social", icon: "👥", label: "Social" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "tools", icon: "🏆", label: "Tools" },
];

export default function BottomNav({ view, setView }) {
  return (
    <div style={S.bottomNav}>
      {NAV.map((n) => (
        <div
          key={n.id}
          style={{ ...S.navItem, color: view === n.id ? "#7C5CFC" : "rgba(255,255,255,0.3)" }}
          onClick={() => setView(n.id)}
        >
          <div style={{ fontSize: 18 }}>{n.icon}</div>
          <div style={{ fontSize: 9, marginTop: 1, fontWeight: view === n.id ? 700 : 400 }}>{n.label}</div>
          {view === n.id && <div style={S.navDot} />}
        </div>
      ))}
    </div>
  );
}
