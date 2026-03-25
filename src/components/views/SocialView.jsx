import React, { useState, useEffect } from "react";
import { S } from "../../styles/theme";
import {
  getLeaderboard,
  searchUsers,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getActiveChallenges,
  createChallenge,
  getPublicChallenges,
  joinChallenge,
} from "../../utils/social";

const TABS = ["Leaderboard", "Friends", "Challenges"];

export default function SocialView({ user, state }) {
  const [activeTab, setActiveTab] = useState("Leaderboard");

  if (!user) {
    return (
      <div style={S.vc}>
        <div style={tabBar}>
          {TABS.map((t) => (
            <button key={t} style={t === activeTab ? tabActive : tab} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div style={signInCard}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Sign in to access social features</div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>Connect your account to compete on leaderboards, add friends, and join challenges.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.vc}>
      <div style={tabBar}>
        {TABS.map((t) => (
          <button key={t} style={t === activeTab ? tabActive : tab} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {activeTab === "Leaderboard" && <LeaderboardTab user={user} state={state} />}
      {activeTab === "Friends" && <FriendsTab user={user} />}
      {activeTab === "Challenges" && <ChallengesTab user={user} />}
    </div>
  );
}

// ── Leaderboard Tab ────────────────────────────────────────────────────────────

function LeaderboardTab({ user, state }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard("xp", 20);
      setBoard(data || []);
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, []);

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;
  if (error) return <ErrorMsg text={error} onRetry={fetchBoard} />;

  if (board.length === 0) {
    return (
      <div style={emptyCard}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Connect to Firebase to see the global leaderboard</div>
        <div style={{ fontSize: 11, opacity: 0.35 }}>Leaderboard data will appear here once Firebase is configured.</div>
      </div>
    );
  }

  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div style={{ padding: "0 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={S.secTitle}>Top Players</div>
        <button style={refreshBtn} onClick={fetchBoard}>↻</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {board.map((entry, i) => {
          const isMe = entry.uid === user.uid;
          return (
            <div key={entry.uid} style={{ ...lbRow, ...(isMe ? lbRowHighlight : {}) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ ...rankBadge, color: i < 3 ? medalColors[i] : "rgba(255,255,255,0.3)" }}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </div>
                <Avatar name={entry.displayName} photoURL={entry.photoURL} size={32} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.displayName || "Anonymous"}{isMe ? " (You)" : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={xpBadge}>⚡ {entry.xp || 0}</span>
                <span style={streakBadge}>🔥 {entry.streak || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Friends Tab ────────────────────────────────────────────────────────────────

function FriendsTab({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadPending();
    loadFriends();
  }, [user.uid]);

  const loadPending = async () => {
    setPendingLoading(true);
    try {
      const data = await getPendingRequests(user.uid);
      setPending(data || []);
    } catch { setPending([]); }
    finally { setPendingLoading(false); }
  };

  const loadFriends = async () => {
    setFriendsLoading(true);
    try {
      const data = await getFriends(user.uid);
      setFriends(data || []);
    } catch { setFriends([]); }
    finally { setFriendsLoading(false); }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const data = await searchUsers(searchTerm.trim());
      setSearchResults((data || []).filter((u) => u.uid !== user.uid));
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  };

  const handleAddFriend = async (target) => {
    setActionLoading(target.uid);
    try {
      await sendFriendRequest(user.uid, user.displayName || "User", target.uid, target.displayName || "User");
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  const handleAccept = async (req) => {
    setActionLoading(req.id);
    try {
      await acceptFriendRequest(req.id, user.uid, req.from);
      await loadPending();
      await loadFriends();
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (req) => {
    setActionLoading(req.id);
    try {
      await declineFriendRequest(req.id);
      await loadPending();
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  return (
    <div style={{ padding: "0 14px" }}>
      {/* Search */}
      <div style={S.secTitle}>Find Friends</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          style={inputStyle}
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={smallBtn} onClick={handleSearch} disabled={searchLoading}>
          {searchLoading ? "..." : "Search"}
        </button>
      </div>
      {searchResults.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {searchResults.map((u) => (
            <div key={u.uid} style={friendRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <Avatar name={u.displayName} photoURL={u.photoURL} size={30} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{u.displayName || "User"}</span>
              </div>
              <button
                style={accentBtn}
                onClick={() => handleAddFriend(u)}
                disabled={actionLoading === u.uid}
              >
                {actionLoading === u.uid ? "..." : "Add Friend"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending Requests */}
      <div style={S.secTitle}>Pending Requests</div>
      {pendingLoading ? (
        <LoadingSpinner text="Loading requests..." />
      ) : pending.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.35, padding: "0 4px", marginBottom: 16 }}>No pending requests</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {pending.map((req) => (
            <div key={req.id} style={friendRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <Avatar name={req.fromName} size={30} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{req.fromName || "Someone"}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={accentBtn}
                  onClick={() => handleAccept(req)}
                  disabled={actionLoading === req.id}
                >
                  Accept
                </button>
                <button
                  style={declineBtn}
                  onClick={() => handleDecline(req)}
                  disabled={actionLoading === req.id}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div style={S.secTitle}>Friends</div>
      {friendsLoading ? (
        <LoadingSpinner text="Loading friends..." />
      ) : friends.length === 0 ? (
        <div style={emptyCard}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>👋</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Add friends to keep each other accountable!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {friends.map((f) => (
            <div key={f.uid} style={friendRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <Avatar name={f.displayName} photoURL={f.photoURL} size={32} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.displayName || "Friend"}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.4 }}>Day {f.currentDay || 1}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={xpBadge}>⚡ {f.xp || 0}</span>
                <span style={streakBadge}>🔥 {f.streak || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Challenges Tab ─────────────────────────────────────────────────────────────

function ChallengesTab({ user }) {
  const [active, setActive] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [publicList, setPublicList] = useState([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);
  const [form, setForm] = useState({ title: "", type: "streak", target: "", duration: "" });

  useEffect(() => {
    loadActive();
    loadPublic();
  }, [user.uid]);

  const loadActive = async () => {
    setActiveLoading(true);
    try {
      const data = await getActiveChallenges(user.uid);
      setActive(data || []);
    } catch { setActive([]); }
    finally { setActiveLoading(false); }
  };

  const loadPublic = async () => {
    setPublicLoading(true);
    try {
      const data = await getPublicChallenges(10);
      setPublicList(data || []);
    } catch { setPublicList([]); }
    finally { setPublicLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.target || !form.duration) return;
    setCreateLoading(true);
    try {
      await createChallenge({
        title: form.title.trim(),
        description: "",
        creatorUid: user.uid,
        creatorName: user.displayName || "User",
        type: form.type,
        target: Number(form.target),
        durationDays: Number(form.duration),
      });
      setForm({ title: "", type: "streak", target: "", duration: "" });
      setShowCreate(false);
      await loadActive();
      await loadPublic();
    } catch { /* noop */ }
    finally { setCreateLoading(false); }
  };

  const handleJoin = async (challengeId) => {
    setJoinLoading(challengeId);
    try {
      await joinChallenge(challengeId, user.uid);
      await loadActive();
      await loadPublic();
    } catch { /* noop */ }
    finally { setJoinLoading(null); }
  };

  const typeBadgeColors = {
    streak: { bg: "rgba(249,115,22,0.12)", color: "#F97316" },
    xp: { bg: "rgba(124,92,252,0.12)", color: "#7C5CFC" },
    quest: { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div style={{ padding: "0 14px" }}>
      {/* Active Challenges */}
      <div style={S.secTitle}>Active Challenges</div>
      {activeLoading ? (
        <LoadingSpinner text="Loading challenges..." />
      ) : active.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.35, padding: "0 4px", marginBottom: 16 }}>No active challenges. Join or create one below!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {active.map((ch) => {
            const myProgress = ch.progress?.[user.uid] || 0;
            const pct = ch.target ? Math.min(100, (myProgress / ch.target) * 100) : 0;
            const days = getDaysRemaining(ch.endDate);
            const tColors = typeBadgeColors[ch.type] || typeBadgeColors.quest;
            return (
              <div key={ch.id} style={challengeCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ch.title}</div>
                  <span style={{ ...typeBadge, background: tColors.bg, color: tColors.color }}>{ch.type}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#7C5CFC,#EC4899)", width: `${pct}%`, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.5 }}>
                  <span>{myProgress} / {ch.target || "?"}</span>
                  <span>{days}d remaining</span>
                  <span>{(ch.participants || []).length} participants</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Challenge */}
      <div
        style={{ ...S.secTitle, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        onClick={() => setShowCreate(!showCreate)}
      >
        Create Challenge <span style={{ fontSize: 11, opacity: 0.4 }}>{showCreate ? "▲" : "▼"}</span>
      </div>
      {showCreate && (
        <div style={{ ...card, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
          <input
            style={inputStyle}
            placeholder="Challenge title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            style={inputStyle}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="streak">Streak</option>
            <option value="xp">XP</option>
            <option value="quest">Quest</option>
          </select>
          <input
            style={inputStyle}
            placeholder="Target (number)"
            type="number"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Duration (days)"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
          <button style={S.primaryBtn} onClick={handleCreate} disabled={createLoading}>
            {createLoading ? "Creating..." : "Create Challenge"}
          </button>
        </div>
      )}

      {/* Browse Public Challenges */}
      <div style={S.secTitle}>Browse Challenges</div>
      {publicLoading ? (
        <LoadingSpinner text="Loading challenges..." />
      ) : publicList.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.35, padding: "0 4px" }}>No public challenges available yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {publicList.map((ch) => {
            const alreadyJoined = (ch.participants || []).includes(user.uid);
            return (
              <div key={ch.id} style={friendRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.4 }}>
                    by {ch.creatorName || "Unknown"} · {(ch.participants || []).length} joined
                  </div>
                </div>
                {alreadyJoined ? (
                  <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>Joined</span>
                ) : (
                  <button
                    style={accentBtn}
                    onClick={() => handleJoin(ch.id)}
                    disabled={joinLoading === ch.id}
                  >
                    {joinLoading === ch.id ? "..." : "Join"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────

function Avatar({ name, photoURL, size = 32 }) {
  const letter = (name || "?")[0].toUpperCase();
  return photoURL ? (
    <img
      src={photoURL}
      alt=""
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "rgba(124,92,252,0.15)", color: "#7C5CFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 700,
    }}>
      {letter}
    </div>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0", opacity: 0.4, fontSize: 12 }}>
      {text || "Loading..."}
    </div>
  );
}

function ErrorMsg({ text, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 14px" }}>
      <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 8 }}>{text}</div>
      {onRetry && (
        <button style={smallBtn} onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const tabBar = { display: "flex", gap: 4, padding: "0 14px", marginBottom: 16 };
const tab = { padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" };
const tabActive = { ...tab, background: "rgba(124,92,252,0.2)", color: "#7C5CFC" };

const card = { borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" };

const lbRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "10px 12px", borderRadius: 12,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
};
const lbRowHighlight = {
  border: "1px solid rgba(124,92,252,0.35)",
  background: "rgba(124,92,252,0.06)",
};

const rankBadge = { width: 24, textAlign: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 };

const xpBadge = {
  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10,
  background: "rgba(124,92,252,0.12)", color: "#7C5CFC",
};
const streakBadge = {
  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10,
  background: "rgba(249,115,22,0.12)", color: "#F97316",
};

const friendRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "10px 12px", borderRadius: 12,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
};

const challengeCard = {
  padding: 14, borderRadius: 12,
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
};

const typeBadge = {
  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, textTransform: "uppercase",
};

const inputStyle = {
  flex: 1, padding: "10px 12px", borderRadius: 10, fontSize: 13,
  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
  color: "#E2E2EE", outline: "none", fontFamily: "inherit",
};

const smallBtn = {
  padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
  border: "none", cursor: "pointer",
  background: "rgba(124,92,252,0.15)", color: "#7C5CFC",
};

const accentBtn = {
  padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700,
  border: "none", cursor: "pointer",
  background: "rgba(124,92,252,0.18)", color: "#7C5CFC",
};

const declineBtn = {
  padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700,
  border: "none", cursor: "pointer",
  background: "rgba(239,68,68,0.12)", color: "#EF4444",
};

const refreshBtn = {
  width: 32, height: 32, borderRadius: 10, border: "none", cursor: "pointer",
  background: "rgba(255,255,255,0.05)", color: "#E2E2EE", fontSize: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const signInCard = {
  margin: "40px 14px", padding: 28, borderRadius: 16, textAlign: "center",
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
};

const emptyCard = {
  margin: "0 0 16px", padding: 24, borderRadius: 14, textAlign: "center",
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)",
};
