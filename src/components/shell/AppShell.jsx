import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";
import DomainPanel from "../panels/DomainPanel";
import JournalPanel from "../panels/JournalPanel";
import ForgePanel from "../panels/ForgePanel";
import DojoPanel from "../panels/DojoPanel";
import ProgressPanel from "../panels/ProgressPanel";
import BriefScreen from "../screens/BriefScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import TabBar from "./TabBar";

export default function AppShell({ state, save }) {
  const [activeTab, setActiveTab] = useState("brief");
  const [activePanel, setActivePanel] = useState(null);

  const openPanel = useCallback((panelId) => {
    setActivePanel(panelId);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  if (!state.onboarded) {
    return <OnboardingScreen state={state} save={save} />;
  }

  return (
    <div data-app-shell style={styles.container}>
      <div style={styles.content}>
        {activeTab === "brief" && (
          <BriefScreen state={state} save={save} onOpenPanel={openPanel} />
        )}
        {activeTab === "profile" && (
          <ProfileScreen state={state} save={save} />
        )}
      </div>

      <TabBar activeTab={activeTab} onChangeTab={(tab) => { setActivePanel(null); setActiveTab(tab); }} />

      <AnimatePresence>
        {activePanel === "journal" && (
          <JournalPanel key="journal" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "forge" && (
          <ForgePanel key="forge" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "dojo" && (
          <DojoPanel key="dojo" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel === "progress" && (
          <ProgressPanel key="progress" state={state} save={save} onClose={closePanel} />
        )}
        {activePanel && !["journal", "forge", "dojo", "progress"].includes(activePanel) && (
          <DomainPanel
            key={activePanel}
            domainId={activePanel}
            state={state}
            save={save}
            onClose={closePanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight: "100dvh",
    background: TOKENS.color.bg,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    paddingBottom: 80,
    overflowY: "auto",
  },
};
