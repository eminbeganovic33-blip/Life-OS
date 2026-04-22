// Firebase Cloud Messaging integration.
//
// Goal: capture an FCM token per device and store it in Firestore so a future
// Cloud Function or cron job can push reminders even when the app is closed.
//
// Graceful degradation:
// - If Firebase is not configured → noop.
// - If VAPID key env var is missing → noop (still requires a key per FCM docs).
// - If the browser lacks ServiceWorker / Notification APIs → noop.
// - If the user has not granted notification permission → noop, caller should
//   request permission first.
//
// Existing foreground polling in notifications.js continues to work regardless.

import { firebaseConfigured, vapidKey, firebaseConfig, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Build a query-string the background SW can parse for its own initializeApp()
function buildSwConfigUrl() {
  const params = new URLSearchParams();
  Object.entries(firebaseConfig).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

async function canUseFcm() {
  if (!firebaseConfigured) return false;
  if (!vapidKey) return false;
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

// Register our dedicated FCM service worker (separate from /sw.js which
// handles offline caching). Returns the ServiceWorkerRegistration or null.
async function registerFcmServiceWorker() {
  try {
    const reg = await navigator.serviceWorker.register(buildSwConfigUrl(), {
      scope: "/firebase-cloud-messaging-push-scope",
    });
    // Wait until it's actually active before trying to get a token
    if (reg.installing) {
      await new Promise((resolve) => {
        const worker = reg.installing;
        worker.addEventListener("statechange", () => {
          if (worker.state === "activated") resolve();
        });
      });
    }
    return reg;
  } catch {
    return null;
  }
}

// Store the token under users/{uid}/fcmTokens/{tokenHash}.
// We use the token itself as the doc id so re-registration is idempotent.
async function storeToken(uid, token) {
  if (!db || !uid || !token) return;
  try {
    // Firestore doc ids can't contain "/" — tokens generally don't either, but
    // encode as a safety measure.
    const safeId = encodeURIComponent(token).slice(0, 1500);
    const ref = doc(db, "users", uid, "fcmTokens", safeId);
    await setDoc(ref, {
      token,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent || null,
      platform: navigator.platform || null,
    }, { merge: true });
  } catch {
    // Non-fatal — token just isn't persisted this session
  }
}

let inflight = null;

/**
 * Request + capture an FCM token for the signed-in user and persist it.
 * Safe to call repeatedly — subsequent calls return the same promise until it
 * settles, then are idempotent (setDoc merge).
 *
 * Precondition: user has already granted Notification permission (we don't
 * prompt here — the settings UI owns that flow).
 */
export async function initFcm(user) {
  if (!user?.uid) return null;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      if (!(await canUseFcm())) return null;
      const { getMessaging, getToken, onMessage } = await import("firebase/messaging");
      const { default: app } = await import("../firebase");
      if (!app) return null;
      const messaging = getMessaging(app);
      const swReg = await registerFcmServiceWorker();
      if (!swReg) return null;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });
      if (!token) return null;
      await storeToken(user.uid, token);
      // Foreground message handler — route through our in-app notification
      // so the user sees the message whether the tab is focused or not.
      onMessage(messaging, (payload) => {
        try {
          const title = payload.notification?.title || "Life OS";
          const body = payload.notification?.body || "";
          if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.svg" });
          }
        } catch {}
      });
      return token;
    } catch {
      return null;
    } finally {
      // Allow another attempt later (e.g. after permission flip)
      setTimeout(() => { inflight = null; }, 5000);
    }
  })();
  return inflight;
}
