import { S } from "../styles/theme";

export default function LoadingScreen() {
  return (
    <div style={S.loadScreen}>
      <div style={S.loadPulse}>⚡</div>
      <div style={S.loadText}>Life OS</div>
      <div style={S.loadSub}>Loading your journey...</div>
    </div>
  );
}
