import { S } from "../styles/theme";
import { useTheme } from "../hooks";

const NAV = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "home", icon: "⚔️", label: "Quests" },
  { id: "dojo", icon: "🥋", label: "Dojo" },
  { id: "forge", icon: "🔥", label: "Forge" },
  { id: "academy", icon: "📚", label: "Academy" },
];

export default function BottomNav({ view, setView }) {
  const { theme, themed } = useTheme();
  const inactiveColor = theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";

  return (
    <div style={themed("bottomNav")}>
      {NAV.map((n) => (
        <div
          key={n.id}
          style={{ ...S.navItem, color: view === n.id ? "#7C5CFC" : inactiveColor }}
          onClick={() => setView(n.id)}
        >
          <div style={{ fontSize: 18 }}>{n.icon}</div>
          <div style={{ fontSize: 11, marginTop: 1, fontWeight: view === n.id ? 700 : 400 }}>{n.label}</div>
          {view === n.id && <div style={S.navDot} />}
        </div>
      ))}
    </div>
  );
}
