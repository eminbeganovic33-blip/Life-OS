import { injectGlobalStyles } from "./styles/global";
import { useAppState } from "./hooks/useAppState";
import AppShell from "./components/shell/AppShell";

injectGlobalStyles();

export default function LifeOS() {
  const { state, loading, save } = useAppState();

  if (loading || !state) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #111", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      </div>
    );
  }

  return <AppShell state={state} save={save} />;
}
