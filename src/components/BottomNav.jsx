import { useState } from "react";
import { S } from "../styles/theme";
import { useTheme } from "../hooks";
import { NavIcon } from "./Icon";
import { MoreHorizontal, BookOpen, BarChart3, Users, User, X } from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Home" },
  { id: "home", label: "Quests" },
  { id: "dojo", label: "Dojo" },
  { id: "forge", label: "Forge" },
  { id: "academy", label: "Academy" },
];

const MORE_ITEMS = [
  { id: "journal", label: "Journal", Icon: BookOpen, color: "#7C5CFC" },
  { id: "analytics", label: "Analytics", Icon: BarChart3, color: "#3B82F6" },
  { id: "social", label: "Social", Icon: Users, color: "#06B6D4" },
  { id: "profile", label: "Profile", Icon: User, color: "#F97316" },
];

export default function BottomNav({ view, setView }) {
  const { theme, themed } = useTheme();
  const isDark = theme !== "light";
  const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = MORE_ITEMS.some((m) => m.id === view);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div style={overlayStyle} onClick={() => setShowMore(false)}>
          <div
            style={{ ...menuStyle, background: isDark ? "#1E293B" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={menuHeader}>
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6 }}>More</span>
              <X size={16} style={{ opacity: 0.4, cursor: "pointer" }} onClick={() => setShowMore(false)} />
            </div>
            <div style={menuGrid}>
              {MORE_ITEMS.map((item) => {
                const active = view === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      ...menuItem,
                      background: active ? `${item.color}15` : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: active ? `1px solid ${item.color}30` : `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}
                    onClick={() => { setView(item.id); setShowMore(false); }}
                  >
                    <item.Icon size={20} color={active ? item.color : inactiveColor} strokeWidth={active ? 2 : 1.5} />
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? item.color : undefined, marginTop: 4 }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={themed("bottomNav")}>
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <div
              key={n.id}
              style={{ ...S.navItem, color: active ? "#7C5CFC" : inactiveColor }}
              onClick={() => { setView(n.id); setShowMore(false); }}
            >
              <NavIcon id={n.id} size={20} color={active ? "#7C5CFC" : inactiveColor} strokeWidth={active ? 2 : 1.5} />
              <div style={{ fontSize: 10, marginTop: 3, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>{n.label}</div>
              {active && <div style={S.navDot} />}
            </div>
          );
        })}
        {/* More button */}
        <div
          style={{ ...S.navItem, color: isMoreActive ? "#7C5CFC" : inactiveColor }}
          onClick={() => setShowMore(!showMore)}
        >
          <MoreHorizontal size={20} color={isMoreActive ? "#7C5CFC" : inactiveColor} strokeWidth={isMoreActive ? 2 : 1.5} />
          <div style={{ fontSize: 10, marginTop: 3, fontWeight: isMoreActive ? 700 : 500, letterSpacing: 0.2 }}>More</div>
          {isMoreActive && <div style={S.navDot} />}
        </div>
      </div>
    </>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 998,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const menuStyle = {
  width: "100%",
  maxWidth: 430,
  borderRadius: "20px 20px 0 0",
  padding: "16px 16px 24px",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.2)",
};

const menuHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  padding: "0 4px",
};

const menuGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const menuItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px 8px",
  borderRadius: 14,
  cursor: "pointer",
  transition: "all 0.15s",
};
