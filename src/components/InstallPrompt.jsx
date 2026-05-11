import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, Plus, X } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { TOKENS } from "../styles/theme";

const T = TOKENS;
const DISMISS_KEY = "lifeos_install_dismissed_at";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari legacy
    window.navigator.standalone === true
  );
}

function detectPlatform() {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
  if (isIOS && isSafari) return "ios-safari";
  if (isIOS) return "ios-other"; // Chrome/Firefox on iOS can't install — show Safari hint
  if (isAndroid) return "android";
  return "desktop";
}

export default function InstallPrompt() {
  const { colors } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState("other");
  const [expanded, setExpanded] = useState(false); // iOS step-by-step

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const p = detectPlatform();
    setPlatform(p);

    // Android / desktop Chrome: capture the prompt
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Hide if the app gets installed mid-session
    const onInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no beforeinstallprompt — show our manual banner after a delay
    if (p === "ios-safari") {
      const t = setTimeout(() => setShow(true), 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice.catch(() => ({ outcome: "dismissed" }));
    if (outcome === "accepted") {
      setShow(false);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
  }

  if (!show) return null;

  const isIOS = platform === "ios-safari";
  const canPrompt = !!deferredPrompt;

  const card = {
    position: "fixed",
    left: T.space.lg,
    right: T.space.lg,
    bottom: 88, // above BottomNav
    zIndex: 900,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: T.radii.xl,
    padding: T.space.lg,
    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  };

  return (
    <AnimatePresence>
      <motion.div
        key="install-prompt"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        style={card}
        role="dialog"
        aria-label="Install Life OS"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: T.space.md }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: T.radii.md,
              background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Download size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: T.font.md,
                fontWeight: T.weight.bold,
                color: colors.text,
                marginBottom: 2,
              }}
            >
              Install Life OS
            </div>
            <div
              style={{
                fontSize: T.font.xs,
                color: colors.textSecondary,
                lineHeight: 1.4,
              }}
            >
              {isIOS
                ? "Add to Home Screen for fullscreen + offline access."
                : "Works offline. Opens instantly. No app store needed."}
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            style={{
              background: "transparent",
              border: "none",
              color: colors.textSecondary,
              cursor: "pointer",
              padding: 4,
              marginLeft: -4,
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action */}
        <div style={{ marginTop: T.space.md }}>
          {canPrompt && (
            <button
              onClick={install}
              style={primaryBtn}
            >
              Install app
            </button>
          )}
          {isIOS && !canPrompt && (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{ ...primaryBtn, background: "rgba(124,92,252,0.14)", color: "#7C5CFC" }}
              >
                {expanded ? "Hide steps" : "Show how"}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.ol
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: `${T.space.md}px 0 0`,
                      color: colors.text,
                      fontSize: T.font.sm,
                      lineHeight: 1.6,
                    }}
                  >
                    <li style={iosStep}>
                      <span style={stepNum}>1</span>
                      <span>
                        Tap the <Share size={14} style={iconInline} /> Share button in Safari
                      </span>
                    </li>
                    <li style={iosStep}>
                      <span style={stepNum}>2</span>
                      <span>
                        Scroll and tap <b>Add to Home Screen</b> <Plus size={14} style={iconInline} />
                      </span>
                    </li>
                    <li style={iosStep}>
                      <span style={stepNum}>3</span>
                      <span>Tap <b>Add</b> — Life OS is now on your home screen.</span>
                    </li>
                  </motion.ol>
                )}
              </AnimatePresence>
            </>
          )}
          {platform === "ios-other" && (
            <div
              style={{
                fontSize: T.font.xs,
                color: colors.textSecondary,
                padding: `${T.space.sm}px ${T.space.md}px`,
                background: "rgba(255,255,255,0.04)",
                borderRadius: T.radii.sm,
              }}
            >
              Open this page in <b>Safari</b> to install on iOS.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const primaryBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "none",
  background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
  color: "#fff",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  fontFamily: "inherit",
};

const iosStep = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 0",
};

const stepNum = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "rgba(124,92,252,0.16)",
  color: "#7C5CFC",
  fontSize: 11,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const iconInline = {
  display: "inline",
  verticalAlign: "text-bottom",
  margin: "0 2px",
};
