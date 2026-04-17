import { S } from "../styles/theme";
import { useTheme } from "../hooks";
import { NavIcon } from "./Icon";
import { BookOpen } from "lucide-react";

const NAV = [
  { id: "home",    label: "Today"   },
  { id: "journal", label: "Journal", LucideIcon: BookOpen },
  { id: "forge",   label: "Forge"   },
  { id: "dojo",    label: "Dojo"    },
  { id: "academy", label: "Academy" },
];

export default function BottomNav({ view, setView }) {
  const { theme, themed } = useTheme();
  const isDark = theme !== "light";
  const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

  return (
    <nav
      style={{ ...S.bottomNav, ...themed("bottomNav") }}
      data-bottom-nav
      role="tablist"
      aria-label="Main navigation"
    >
      {NAV.map((n) => {
        const active = view === n.id;
        const color = active ? "#7C5CFC" : inactiveColor;
        return (
          <button
            key={n.id}
            role="tab"
            aria-selected={active}
            aria-label={n.label}
            style={{
              ...S.navItem,
              color,
              background: "none",
              border: "none",
              padding: "8px 0",
              minHeight: 48,
              flex: 1,
              cursor: "pointer",
            }}
            onClick={() => setView(n.id)}
          >
            {n.LucideIcon
              ? <n.LucideIcon size={20} color={color} strokeWidth={active ? 2 : 1.5} />
              : <NavIcon id={n.id} size={20} color={color} strokeWidth={active ? 2 : 1.5} />
            }
            <div style={{ fontSize: 10, marginTop: 3, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>
              {n.label}
            </div>
            {active && <div style={S.navDot} />}
          </button>
        );
      })}
    </nav>
  );
}
