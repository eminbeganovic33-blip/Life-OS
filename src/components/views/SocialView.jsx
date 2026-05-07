import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import {
  getLeaderboard, searchUsers, sendFriendRequest,
  getPendingRequests, acceptFriendRequest, declineFriendRequest,
  getFriends, getActiveChallenges, createChallenge,
  getPublicChallenges, joinChallenge,
} from "../../utils/social";
import { renderAnimalAvatar } from "../AnimalAvatars";
import { Trophy, Users, Swords, Globe, Zap, Flame, Hand, Search, Plus, Check, X, Crown, Medal, UserPlus, RefreshCw } from "lucide-react";
import Skeleton from "../Skeleton";

const T = TOKENS;

const TABS = [
  { id: "Leaderboard", Icon: Trophy },
  { id: "Friends", Icon: Users },
  { id: "Challenges", Icon: Swords },
];

// ── Sign-in gate ───────────────────────────────────────────────────────────────
function SignInGate({ onNavigate }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ts = (s) => themeFlipMonochrome(s, isDark);
  const previews = [
    { Icon: Trophy, color: "#FFD700", title: "Global Leaderboard", desc: "See how you rank against warriors worldwide" },
    { Icon: Users, color: "#7C5CFC", title: "Add Friends", desc: "Keep each other accountable on the journey" },
    { Icon: Swords, color: "#F97316", title: "Challenges", desc: "Create and join 30-day challenges with others" },
  ];

  return (
    <div style={ts(gateWrap)}>
      <div style={ts(gateHero)}>
        <Globe size={40} color="#7C5CFC" />
        <h2 style={ts(gateTitle)}>Join the Community</h2>
        <p style={ts(gateSub)}>Sign in to compete, connect, and stay accountable with other Life OS warriors.</p>
      </div>

      <div style={ts(gateFeatures)}>
        {previews.map((p, i) => (
          <motion.div
            key={i}
            style={ts(gateFeatureCard)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span style={{ display: "flex", alignItems: "center" }}><p.Icon size={24} color={p.color} /></span>
            <div>
              <div style={ts(gateFeatureTitle)}>{p.title}</div>
              <div style={ts(gateFeatureDesc)}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        style={ts(gateSignInBtn)}
        onClick={() => onNavigate?.("auth")}
      >
        Sign In to Continue
      </button>
      <p style={ts(gateNote)}>Free · No spam · Sync your progress across devices</p>
    </div>
  );
}

// Recursively swap `rgba(255,255,255,X)` and `#fff`/`#FFF`/`#FFFFFF` in a style
// object so module-level styles can render correctly in light mode without
// rewriting every constant. Cheap — runs once per render.
function themeFlipMonochrome(styleObj, isDark) {
  if (isDark) return styleObj;
  if (!styleObj || typeof styleObj !== "object") return styleObj;
  const flipped = {};
  for (const [k, v] of Object.entries(styleObj)) {
    if (typeof v === "string") {
      flipped[k] = v
        .replace(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/g, "rgba(0,0,0,$1)")
        .replace(/#fff(\b|;|\s|,|\))/gi, "#000$1")
        .replace(/#ffffff(\b|;|\s|,|\))/gi, "#000000$1");
    } else {
      flipped[k] = v;
    }
  }
  return flipped;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SocialView({ user, state, onNavigate }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("Leaderboard");
  // Helper: apply theme flip to any module-level style. Use as `ts(gateWrap)`.
  const ts = (s) => themeFlipMonochrome(s, isDark);
  // Helper: monochrome overlay for inline usage.
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  if (!user) {
    return <SignInGate onNavigate={onNavigate} />;
  }

  return (
    <div style={{ paddingTop: T.space.md, paddingBottom: 80 }}>
      {/* Header */}
      <div style={ts(header)}>
        <div>
          <h2 style={ts(headerTitle)}>Community</h2>
          <p style={ts(headerSub)}>Compete, connect, and stay accountable</p>
        </div>
        <Avatar name={user.displayName} photoURL={user.photoURL} avatar={state?.avatar} size={38} />
      </div>

      {/* Tab bar */}
      <div style={ts(tabBar)}>
        {TABS.map((t) => (
          <button
            key={t.id}
            style={t.id === activeTab ? tabActive : tabStyle}
            onClick={() => setActiveTab(t.id)}
          >
            <t.Icon size={14} />
            <span>{t.id}</span>
          </button>
        ))}
      </div>

      {activeTab === "Leaderboard" && <LeaderboardTab user={user} state={state} />}
      {activeTab === "Friends" && <FriendsTab user={user} />}
      {activeTab === "Challenges" && <ChallengesTab user={user} />}
    </div>
  );
}

// ── Leaderboard ────────────────────────────────────────────────────────────────
function LeaderboardTab({ user, state }) {
  const { theme } = useTheme();
  const ts = (s) => themeFlipMonochrome(s, theme === "dark");
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = async () => {
    setLoading(true); setError(null);
    try { setBoard((await getLeaderboard("xp", 20)) || []); }
    catch { setError("Couldn't load leaderboard. Check your connection."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBoard(); }, []);

  const myRank = board.findIndex(e => e.uid === user.uid) + 1;

  return (
    <div style={ts(tabContent)}>
      {/* My rank banner */}
      {myRank > 0 && (
        <div style={ts(myRankBanner)}>
          <span style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)" }}>Your rank</span>
          <span style={{ fontSize: T.font.xl, fontWeight: T.weight.black, color: "#7C5CFC" }}>#{myRank}</span>
          <span style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)" }}>out of {board.length}</span>
        </div>
      )}

      <div style={ts(sectionLabel)}>Top Warriors</div>

      {loading && <LeaderboardSkeleton />}
      {error && <ErrorState text={error} onRetry={fetchBoard} />}
      {!loading && !error && board.length === 0 && (
        <EmptyState
          icon={<Trophy size={32} color="#FFD700" />}
          title="No one on the board yet"
          desc="Be the first — complete your daily quests to appear here."
        />
      )}
      {!loading && !error && board.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm }}>
          {board.map((entry, i) => {
            const isMe = entry.uid === user.uid;
            const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
            return (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ ...lbRow, ...(isMe ? lbRowMe : {}) }}
              >
                <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i < 3 ? <Crown size={18} color={medalColors[i]} /> : <span style={{ fontSize: T.font.sm, fontWeight: T.weight.black, color: "rgba(255,255,255,0.45)" }}>{i + 1}</span>}
                </div>
                <Avatar name={entry.displayName} photoURL={entry.photoURL} avatar={entry.avatar} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.displayName || "Warrior"}{isMe ? " (You)" : ""}
                  </div>
                  <div style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)" }}>Day {entry.currentDay || 1}</div>
                </div>
                <div style={{ display: "flex", gap: T.space.sm, flexShrink: 0 }}>
                  <span style={ts(xpChip)}><Zap size={11} style={{ verticalAlign: -1 }} /> {entry.xp || 0}</span>
                  <span style={ts(streakChip)}><Flame size={11} style={{ verticalAlign: -1 }} /> {entry.streak || 0}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Friends ────────────────────────────────────────────────────────────────────
function FriendsTab({ user }) {
  const { theme } = useTheme();
  const ts = (s) => themeFlipMonochrome(s, theme === "dark");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());

  useEffect(() => { loadAll(); }, [user.uid]);

  const loadAll = async () => {
    setLoading(true);
    const [p, f] = await Promise.all([
      getPendingRequests(user.uid).catch(() => []),
      getFriends(user.uid).catch(() => []),
    ]);
    setPending(p || []); setFriends(f || []);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try { setSearchResults(((await searchUsers(searchTerm.trim())) || []).filter(u => u.uid !== user.uid)); }
    catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  };

  const handleAdd = async (target) => {
    setActionLoading(target.uid);
    await sendFriendRequest(user.uid, user.displayName || "User", target.uid, target.displayName || "User").catch(() => {});
    setSentIds(s => new Set([...s, target.uid]));
    setActionLoading(null);
  };

  const handleAccept = async (req) => {
    setActionLoading(req.id);
    await acceptFriendRequest(req.id, user.uid, req.from).catch(() => {});
    await loadAll();
    setActionLoading(null);
  };

  const handleDecline = async (req) => {
    setActionLoading(req.id);
    await declineFriendRequest(req.id).catch(() => {});
    await loadAll();
    setActionLoading(null);
  };

  return (
    <div style={ts(tabContent)}>
      {/* Search */}
      <div style={ts(sectionLabel)}>Find Friends</div>
      <div style={ts(searchRow)}>
        <input
          style={ts(searchInput)}
          placeholder="Search by display name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button style={ts(searchBtn)} onClick={handleSearch} disabled={searchLoading}>
          {searchLoading ? "..." : "Search"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm, marginBottom: T.space.lg }}>
          {searchResults.map(u => (
            <div key={u.uid} style={ts(friendRow)}>
              <Avatar name={u.displayName} photoURL={u.photoURL} avatar={u.avatar} size={34} />
              <span style={{ flex: 1, fontSize: T.font.md, fontWeight: T.weight.medium }}>{u.displayName || "User"}</span>
              {sentIds.has(u.uid) ? (
                <span style={{ fontSize: T.font.xs, color: "#22C55E", fontWeight: T.weight.bold, display: "flex", alignItems: "center", gap: 4 }}>Sent <Check size={12} /></span>
              ) : (
                <button style={ts(accentBtn)} onClick={() => handleAdd(u)} disabled={actionLoading === u.uid}>
                  {actionLoading === u.uid ? "..." : "Add"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <div style={{ ...sectionLabel, color: "#F59E0B" }}>Pending Requests · {pending.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm, marginBottom: T.space.lg }}>
            {pending.map(req => (
              <div key={req.id} style={ts(friendRow)}>
                <Avatar name={req.fromName} size={34} />
                <span style={{ flex: 1, fontSize: T.font.md, fontWeight: T.weight.medium }}>{req.fromName || "Someone"}</span>
                <button style={ts(accentBtn)} onClick={() => handleAccept(req)} disabled={actionLoading === req.id}>Accept</button>
                <button style={ts(declineBtn)} onClick={() => handleDecline(req)} disabled={actionLoading === req.id}><X size={14} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Friends list */}
      <div style={ts(sectionLabel)}>Friends · {friends.length}</div>
      {loading ? <Spinner /> : friends.length === 0 ? (
        <EmptyState icon={<Hand size={32} color="#F59E0B" />} title="No friends yet" desc="Search for friends above to start holding each other accountable." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm }}>
          {friends.map(f => (
            <div key={f.uid} style={ts(friendRow)}>
              <Avatar name={f.displayName} photoURL={f.photoURL} avatar={f.avatar} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: T.font.md, fontWeight: T.weight.medium, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.displayName || "Friend"}</div>
                <div style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)" }}>Day {f.currentDay || 1}</div>
              </div>
              <div style={{ display: "flex", gap: T.space.sm }}>
                <span style={ts(xpChip)}><Zap size={11} style={{ verticalAlign: -1 }} /> {f.xp || 0}</span>
                <span style={ts(streakChip)}><Flame size={11} style={{ verticalAlign: -1 }} /> {f.streak || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Challenges ─────────────────────────────────────────────────────────────────
function ChallengesTab({ user }) {
  const { theme } = useTheme();
  const ts = (s) => themeFlipMonochrome(s, theme === "dark");
  const [active, setActive] = useState([]);
  const [publicList, setPublicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);
  const [form, setForm] = useState({ title: "", type: "streak", target: "", duration: "" });

  useEffect(() => { loadAll(); }, [user.uid]);

  const loadAll = async () => {
    setLoading(true);
    const [a, p] = await Promise.all([
      getActiveChallenges(user.uid).catch(() => []),
      getPublicChallenges(10).catch(() => []),
    ]);
    setActive(a || []); setPublicList(p || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.target || !form.duration) return;
    setCreateLoading(true);
    await createChallenge({ title: form.title.trim(), description: "", creatorUid: user.uid, creatorName: user.displayName || "User", type: form.type, target: Number(form.target), durationDays: Number(form.duration) }).catch(() => {});
    setForm({ title: "", type: "streak", target: "", duration: "" });
    setShowCreate(false);
    await loadAll();
    setCreateLoading(false);
  };

  const handleJoin = async (id) => {
    setJoinLoading(id);
    await joinChallenge(id, user.uid).catch(() => {});
    await loadAll();
    setJoinLoading(null);
  };

  const typeColors = {
    streak: { bg: "rgba(249,115,22,0.1)", color: "#F97316" },
    xp: { bg: "rgba(124,92,252,0.1)", color: "#7C5CFC" },
    quest: { bg: "rgba(34,197,94,0.1)", color: "#22C55E" },
  };

  const daysLeft = (end) => Math.max(0, Math.ceil((new Date(end) - new Date()) / 86400000));

  return (
    <div style={ts(tabContent)}>
      {loading ? <Spinner /> : (
        <>
          {/* Active */}
          <div style={ts(sectionLabel)}>Your Challenges · {active.length}</div>
          {active.length === 0 ? (
            <EmptyState icon={<Swords size={32} color="#F97316" />} title="No active challenges" desc="Join a public challenge or create your own below." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm, marginBottom: T.space.lg }}>
              {active.map(ch => {
                const myProg = ch.progress?.[user.uid] || 0;
                const pct = ch.target ? Math.min(100, (myProg / ch.target) * 100) : 0;
                const tc = typeColors[ch.type] || typeColors.quest;
                return (
                  <div key={ch.id} style={ts(challengeCard)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space.sm }}>
                      <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold }}>{ch.title}</div>
                      <span style={{ ...typeBadge, background: tc.bg, color: tc.color }}>{ch.type}</span>
                    </div>
                    <div style={ts(progressTrack)}>
                      <div style={{ ...progressFill, width: `${pct}%`, background: tc.color }} />
                    </div>
                    <div style={ts(challengeMeta)}>
                      <span>{myProg} / {ch.target}</span>
                      <span>{daysLeft(ch.endDate)}d left</span>
                      <span>{(ch.participants || []).length} joined</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create */}
          <button style={ts(createToggleBtn)} onClick={() => setShowCreate(v => !v)}>
            {showCreate ? "Cancel" : <><Plus size={14} style={{ verticalAlign: -2 }} /> Create a Challenge</>}
          </button>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={ts(createForm)}
            >
              <input style={ts(formInput)} placeholder="Challenge title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select style={ts(formInput)} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="streak">Streak</option>
                <option value="xp">XP</option>
                <option value="quest">Quests</option>
              </select>
              <div style={{ display: "flex", gap: T.space.sm }}>
                <input style={{ ...formInput, flex: 1 }} placeholder="Target" type="number" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
                <input style={{ ...formInput, flex: 1 }} placeholder="Days" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <button style={ts(submitBtn)} onClick={handleCreate} disabled={createLoading}>
                {createLoading ? "Creating..." : "Create Challenge"}
              </button>
            </motion.div>
          )}

          {/* Browse */}
          <div style={{ ...sectionLabel, marginTop: T.space.xl }}>Browse Public Challenges</div>
          {publicList.length === 0 ? (
            <EmptyState icon={<Globe size={32} color="#7C5CFC" />} title="No public challenges yet" desc="Create one above and invite others to join." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm }}>
              {publicList.map(ch => {
                const joined = (ch.participants || []).includes(user.uid);
                const tc = typeColors[ch.type] || typeColors.quest;
                return (
                  <div key={ch.id} style={ts(friendRow)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold }}>{ch.title}</div>
                      <div style={{ fontSize: T.font.xs, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                        by {ch.creatorName} · <span style={{ color: tc.color }}>{ch.type}</span> · {(ch.participants || []).length} joined
                      </div>
                    </div>
                    {joined ? (
                      <span style={{ fontSize: T.font.xs, color: "#22C55E", fontWeight: T.weight.bold, display: "flex", alignItems: "center", gap: 4 }}>Joined <Check size={12} /></span>
                    ) : (
                      <button style={ts(accentBtn)} onClick={() => handleJoin(ch.id)} disabled={joinLoading === ch.id}>
                        {joinLoading === ch.id ? "..." : "Join"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────
function Avatar({ name, photoURL, avatar, size = 32 }) {
  const letter = (name || "?")[0].toUpperCase();
  if (avatar?.type === "photo") {
    return <img src={avatar.value} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  if (avatar?.type === "animal") {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden" }}>
        {renderAnimalAvatar(avatar.value, size)}
      </div>
    );
  }
  return photoURL ? (
    <img src={photoURL} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "rgba(124,92,252,0.15)", color: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 700 }}>
      {letter}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ ...lbRow, opacity: 1 - i * 0.12 }}>
          <Skeleton style={{ width: 32, height: 20, borderRadius: 4 }} />
          <Skeleton.Circle size={34} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ width: `${60 - i * 6}%`, height: 14, borderRadius: 4, marginBottom: 4 }} />
            <Skeleton style={{ width: 40, height: 10, borderRadius: 4 }} />
          </div>
          <Skeleton style={{ width: 50, height: 20, borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.space.sm }}>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} style={{ ...friendRow, opacity: 1 - i * 0.15 }}>
          <Skeleton.Circle size={34} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ width: `${70 - i * 10}%`, height: 14, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ text, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: `${T.space.xl}px 0` }}>
      <div style={{ fontSize: T.font.sm, color: "#EF4444", marginBottom: T.space.md }}>{text}</div>
      {onRetry && <button style={{ ...accentBtn, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={onRetry}><RefreshCw size={12} /> Retry</button>}
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div style={ts(emptyWrap)}>
      <span style={{ display: "flex", justifyContent: "center" }}>{icon}</span>
      <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold, marginTop: T.space.sm }}>{title}</div>
      <div style={{ fontSize: T.font.sm, color: "rgba(255,255,255,0.45)", marginTop: T.space.xs, lineHeight: 1.4 }}>{desc}</div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

// Sign-in gate
const gateWrap = {
  padding: `${T.space.xxl}px ${T.space.lg}px`,
  display: "flex",
  flexDirection: "column",
  gap: T.space.lg,
};

const gateHero = {
  textAlign: "center",
  padding: `${T.space.xl}px 0`,
};

const gateTitle = {
  fontSize: T.font.hero,
  fontWeight: T.weight.black,
  margin: `${T.space.md}px 0 ${T.space.sm}px`,
  letterSpacing: -0.5,
};

const gateSub = {
  fontSize: T.font.sm,
  color: "rgba(255,255,255,0.45)",
  lineHeight: 1.5,
  margin: 0,
};

const gateFeatures = {
  display: "flex",
  flexDirection: "column",
  gap: T.space.sm,
};

const gateFeatureCard = {
  display: "flex",
  alignItems: "center",
  gap: T.space.lg,
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const gateFeatureTitle = {
  fontSize: T.font.md,
  fontWeight: T.weight.bold,
  marginBottom: 2,
};

const gateFeatureDesc = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
};

const gateSignInBtn = {
  width: "100%",
  padding: `${T.space.lg}px`,
  borderRadius: T.radii.md,
  border: "none",
  background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
  color: "#fff",
  fontSize: T.font.md,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(124,92,252,0.25)",
  marginTop: T.space.sm,
};

const gateNote = {
  textAlign: "center",
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
  margin: 0,
};

// Main layout
const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `0 ${T.space.lg}px`,
  marginBottom: T.space.lg,
};

const headerTitle = {
  fontSize: T.font.hero,
  fontWeight: T.weight.black,
  margin: 0,
  letterSpacing: -0.5,
};

const headerSub = {
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
  margin: `${T.space.xs}px 0 0`,
};

const tabBar = {
  display: "flex",
  gap: T.space.sm,
  padding: `0 ${T.space.lg}px`,
  marginBottom: T.space.lg,
};

const tabStyle = {
  display: "flex",
  alignItems: "center",
  gap: T.space.xs,
  padding: `${T.space.sm}px ${T.space.md}px`,
  borderRadius: T.radii.sm,
  fontSize: T.font.sm,
  fontWeight: T.weight.medium,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.45)",
  fontFamily: "inherit",
  transition: "all 0.15s ease",
};

const tabActive = {
  ...tabStyle,
  background: "rgba(124,92,252,0.12)",
  border: "1px solid rgba(124,92,252,0.25)",
  color: "#7C5CFC",
};

const tabContent = {
  padding: `0 ${T.space.lg}px`,
};

const sectionLabel = {
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: T.space.sm,
};

const myRankBanner = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: T.space.md,
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.12)",
  marginBottom: T.space.lg,
};

const lbRow = {
  display: "flex",
  alignItems: "center",
  gap: T.space.sm,
  padding: `${T.space.md}px ${T.space.md}px`,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const lbRowMe = {
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.2)",
};

const xpChip = {
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  padding: "3px 8px",
  borderRadius: 10,
  background: "rgba(124,92,252,0.1)",
  color: "#7C5CFC",
};

const streakChip = {
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  padding: "3px 8px",
  borderRadius: 10,
  background: "rgba(249,115,22,0.1)",
  color: "#F97316",
};

const searchRow = {
  display: "flex",
  gap: T.space.sm,
  marginBottom: T.space.md,
};

const searchInput = {
  flex: 1,
  padding: `${T.space.md}px ${T.space.md}px`,
  borderRadius: T.radii.md,
  fontSize: T.font.sm,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "inherit",
  outline: "none",
  fontFamily: "inherit",
};

const searchBtn = {
  padding: `${T.space.md}px ${T.space.lg}px`,
  borderRadius: T.radii.md,
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  border: "none",
  background: "rgba(124,92,252,0.15)",
  color: "#7C5CFC",
  cursor: "pointer",
  fontFamily: "inherit",
};

const friendRow = {
  display: "flex",
  alignItems: "center",
  gap: T.space.md,
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const accentBtn = {
  padding: `${T.space.sm}px ${T.space.md}px`,
  borderRadius: T.radii.sm,
  fontSize: T.font.xs,
  fontWeight: T.weight.bold,
  border: "none",
  background: "rgba(124,92,252,0.15)",
  color: "#7C5CFC",
  cursor: "pointer",
  fontFamily: "inherit",
  flexShrink: 0,
};

const declineBtn = {
  ...accentBtn,
  background: "rgba(239,68,68,0.1)",
  color: "#EF4444",
};

const challengeCard = {
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const progressTrack = {
  height: 5,
  borderRadius: 3,
  background: "rgba(255,255,255,0.05)",
  overflow: "hidden",
  marginBottom: T.space.sm,
};

const progressFill = {
  height: "100%",
  borderRadius: 3,
  transition: "width 0.4s ease",
};

const challengeMeta = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: T.font.xs,
  color: "rgba(255,255,255,0.45)",
};

const typeBadge = {
  fontSize: 10,
  fontWeight: T.weight.bold,
  padding: "3px 10px",
  borderRadius: 10,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const createToggleBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.md,
  border: "1px dashed rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#7C5CFC",
  fontSize: T.font.sm,
  fontWeight: T.weight.bold,
  cursor: "pointer",
  fontFamily: "inherit",
  marginBottom: T.space.sm,
};

const createForm = {
  display: "flex",
  flexDirection: "column",
  gap: T.space.sm,
  padding: T.space.lg,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: T.space.md,
};

const formInput = {
  padding: `${T.space.md}px`,
  borderRadius: T.radii.sm,
  fontSize: T.font.sm,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "inherit",
  outline: "none",
  fontFamily: "inherit",
};

const submitBtn = {
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

const emptyWrap = {
  textAlign: "center",
  padding: `${T.space.xxl}px ${T.space.lg}px`,
  borderRadius: T.radii.md,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  marginBottom: T.space.md,
};
