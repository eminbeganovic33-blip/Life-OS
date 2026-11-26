import { TOKENS } from "../../styles/tokens";
import { Sun, Dumbbell, BookOpen, Shield, User } from "lucide-react";

const TABS = [
  { id: "today", label: "Today", icon: Sun },
  { id: "train", label: "Train", icon: Dumbbell },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "forge", label: "Forge", icon: Shield },
  { id: "me",    label: "Me",    icon: User },
];

export default function TabBar({ activeTab, onChangeTab }) {
  return (
    <nav style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              ...styles.tab,
              color: isActive ? TOKENS.color.brand : TOKENS.color.textTertiary,
            }}
          >
            <span style={{
              ...styles.iconWrap,
              background: isActive ? TOKENS.color.brandSoft : "transparent",
            }}>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? TOKENS.font.weight.bold : TOKENS.font.weight.medium,
              marginTop: 3,
              letterSpacing: 0.2,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  bar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 64,
    background: "rgba(255,255,255,0.82)",
    borderTop: `1px solid ${TOKENS.color.border}`,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-around",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    zIndex: 100,
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
  },
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    padding: "8px 4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: TOKENS.radius.full,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: TOKENS.transition.fast,
  },
};
