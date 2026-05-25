import { injectGlobalStyles } from "./styles/global";
import { useAuth } from "./hooks/useAuth";
import { useAppState } from "./hooks/useAppState";
import { ToastProvider } from "./components/shared/Toast";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import AuthScreen from "./components/screens/AuthScreen";
import AppShell from "./components/shell/AppShell";

injectGlobalStyles();

export default function LifeOS() {
  const { user, loading: authLoading } = useAuth();
  const { state, loading: stateLoading, save } = useAppState();

  if (authLoading || stateLoading || !state) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100dvh", gap: 20,
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 32px rgba(124,92,252,0.30)",
          fontSize: 28,
        }}>⚡</div>
        <div style={{
          width: 20, height: 20,
          border: "2px solid rgba(124,92,252,0.20)",
          borderTopColor: "#7C5CFC",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
      </div>
    );
  }

  // Show AuthScreen when: (new user who hasn't skipped) OR (existing user explicitly wants to sign in)
  const needsInitialAuth = !state.onboarded && !state.skippedAuth;
  if (!user && (needsInitialAuth || state.wantsAuth)) {
    return <AuthScreen onSkip={() => save({ ...state, skippedAuth: true, wantsAuth: false })} />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppShell state={state} save={save} user={user} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
