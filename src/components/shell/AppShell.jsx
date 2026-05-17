import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";
import DomainPanel from "../panels/DomainPanel";
import BriefScreen from "../screens/BriefScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TabBar from "./TabBar";

export default function AppShell({ state, save }) {
  const [activeTab, setActiveTab] = useState("brief");
  const [activePanel, setActivePanel] = useState(null);

  const openPanel = useCallback((domainId) => {
    setActivePanel(domainId);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

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

      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      <AnimatePresence>
        {activePanel && (
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
