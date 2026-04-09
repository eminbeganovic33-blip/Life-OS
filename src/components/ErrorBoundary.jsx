import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary] ${this.props.name || "Unknown"}:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <AlertTriangle size={28} color="#F97316" />
            </div>
            <div style={styles.title}>Something went wrong</div>
            <div style={styles.sub}>
              {this.props.name ? `The ${this.props.name} section encountered an error.` : "An unexpected error occurred."}
            </div>
            <button
              style={styles.btn}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    padding: 24,
  },
  card: {
    textAlign: "center",
    padding: "32px 24px",
    borderRadius: 16,
    background: "rgba(249,115,22,0.06)",
    border: "1px solid rgba(249,115,22,0.15)",
    maxWidth: 320,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(249,115,22,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    opacity: 0.5,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
