import { TOKENS } from "../../styles/tokens";
import { Briefcase, User } from "lucide-react";

const TABS = [
  { id: "brief", label: "Brief", icon: Briefcase },
  { id: "profile", label: "Profile", icon: User },
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
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span style={{
              fontSize: TOKENS.font.size.xs,
              fontWeight: isActive ? TOKENS.font.weight.semibold : TOKENS.font.weight.medium,
              marginTop: 2,
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
    height: 72,
    background: TOKENS.color.surfaceElevated,
    borderTop: `1px solid ${TOKENS.color.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    zIndex: 100,
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    padding: "8px 24px",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
};
