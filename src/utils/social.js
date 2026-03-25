import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// ── Profile ──────────────────────────────────────────────────────────────────

export async function updatePublicProfile(uid, data) {
  if (!db) return;
  try {
    const ref = doc(db, "users", uid);
    await setDoc(
      ref,
      {
        ...data,
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("updatePublicProfile:", err);
  }
}

export async function getPublicProfile(uid) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error("getPublicProfile:", err);
    return null;
  }
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(field = "xp", max = 20) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "users"),
      orderBy(field, "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName,
        photoURL: data.photoURL,
        xp: data.xp,
        streak: data.streak,
        level: data.level,
        currentDay: data.currentDay,
      };
    });
  } catch (err) {
    console.error("getLeaderboard:", err);
    return [];
  }
}

// ── Friends ──────────────────────────────────────────────────────────────────

export async function sendFriendRequest(fromUid, fromName, toUid, toName) {
  if (!db) return;
  try {
    const id = `${fromUid}_${toUid}`;
    await setDoc(doc(db, "friendRequests", id), {
      from: fromUid,
      to: toUid,
      fromName,
      toName,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("sendFriendRequest:", err);
  }
}

export async function getPendingRequests(uid) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", uid),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getPendingRequests:", err);
    return [];
  }
}

export async function getSentRequests(uid) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "friendRequests"),
      where("from", "==", uid),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getSentRequests:", err);
    return [];
  }
}

export async function acceptFriendRequest(requestId, uid, friendUid) {
  if (!db) return;
  try {
    await updateDoc(doc(db, "friendRequests", requestId), {
      status: "accepted",
    });
    await updateDoc(doc(db, "users", uid), {
      friends: arrayUnion(friendUid),
    });
    await updateDoc(doc(db, "users", friendUid), {
      friends: arrayUnion(uid),
    });
  } catch (err) {
    console.error("acceptFriendRequest:", err);
  }
}

export async function declineFriendRequest(requestId) {
  if (!db) return;
  try {
    await updateDoc(doc(db, "friendRequests", requestId), {
      status: "declined",
    });
  } catch (err) {
    console.error("declineFriendRequest:", err);
  }
}

export async function removeFriend(uid, friendUid) {
  if (!db) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      friends: arrayRemove(friendUid),
    });
    await updateDoc(doc(db, "users", friendUid), {
      friends: arrayRemove(uid),
    });
  } catch (err) {
    console.error("removeFriend:", err);
  }
}

export async function getFriends(uid) {
  if (!db) return [];
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return [];
    const friendIds = snap.data().friends || [];
    const profiles = await Promise.all(
      friendIds.map((fid) => getPublicProfile(fid))
    );
    return profiles.filter(Boolean);
  } catch (err) {
    console.error("getFriends:", err);
    return [];
  }
}

// ── Challenges ───────────────────────────────────────────────────────────────

export async function createChallenge(data) {
  if (!db) return null;
  try {
    const { title, description, creatorUid, creatorName, type, target, durationDays } = data;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + durationDays);

    const ref = doc(collection(db, "challenges"));
    const challenge = {
      title,
      description,
      creatorUid,
      creatorName,
      type,
      target,
      participants: [creatorUid],
      progress: { [creatorUid]: 0 },
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, challenge);
    return { id: ref.id, ...challenge };
  } catch (err) {
    console.error("createChallenge:", err);
    return null;
  }
}

export async function joinChallenge(challengeId, uid) {
  if (!db) return;
  try {
    const ref = doc(db, "challenges", challengeId);
    await updateDoc(ref, {
      participants: arrayUnion(uid),
      [`progress.${uid}`]: 0,
    });
  } catch (err) {
    console.error("joinChallenge:", err);
  }
}

export async function updateChallengeProgress(challengeId, uid, value) {
  if (!db) return;
  try {
    const ref = doc(db, "challenges", challengeId);
    await updateDoc(ref, {
      [`progress.${uid}`]: value,
    });
  } catch (err) {
    console.error("updateChallengeProgress:", err);
  }
}

export async function getActiveChallenges(uid) {
  if (!db) return [];
  try {
    const now = new Date().toISOString();
    const q = query(
      collection(db, "challenges"),
      where("participants", "array-contains", uid),
      where("endDate", ">=", now)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getActiveChallenges:", err);
    return [];
  }
}

export async function getPublicChallenges(max = 10) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "challenges"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getPublicChallenges:", err);
    return [];
  }
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchUsers(searchTerm) {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + "\uf8ff"),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName,
        photoURL: data.photoURL,
        xp: data.xp,
        level: data.level,
      };
    });
  } catch (err) {
    console.error("searchUsers:", err);
    return [];
  }
}
