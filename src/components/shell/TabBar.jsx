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
            style={{
              ...styles.tab,
              color: isActive ? TOKENS.color.text : TOKENS.color.textTertiary,
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? TOKENS.font.weight.bold : TOKENS.font.weight.medium,
              marginTop: 4,
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
    background: TOKENS.color.surfaceElevated,
    borderTop: `1px solid ${TOKENS.color.border}`,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-around",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    zIndex: 100,
    backdropFilter: "saturate(180%) blur(20px)",
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
};
