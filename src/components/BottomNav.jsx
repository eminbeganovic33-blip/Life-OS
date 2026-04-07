import { S } from "../styles/theme";
import { useTheme } from "../hooks";
import { NavIcon } from "./Icon";

const NAV = [
  { id: "dashboard", label: "Home" },
  { id: "home", label: "Quests" },
  { id: "dojo", label: "Dojo" },
  { id: "forge", label: "Forge" },
  { id: "academy", label: "Academy" },
];

export default function BottomNav({ view, setView }) {
  const { theme, themed } = useTheme();
  const inactiveColor = theme === "light" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";

  return (
    <div style={themed("bottomNav")}>
      {NAV.map((n) => {
        const active = view === n.id;
        return (
          <div
            key={n.id}
            style={{ ...S.navItem, color: active ? "#7C5CFC" : inactiveColor }}
            onClick={() => setView(n.id)}
          >
            <NavIcon id={n.id} size={20} color={active ? "#7C5CFC" : inactiveColor} strokeWidth={active ? 2 : 1.5} />
            <div style={{ fontSize: 10, marginTop: 3, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>{n.label}</div>
            {active && <div style={S.navDot} />}
          </div>
        );
      })}
    </div>
  );
}
