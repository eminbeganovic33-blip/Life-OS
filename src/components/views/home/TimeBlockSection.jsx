import { CircleCheck } from "lucide-react";
import QuestCard from "./QuestCard";

export default function TimeBlockSection({
  blockKey, block, quests, completed, isCollapsed, onToggle, ts, colors,
  // QuestCard pass-through props
  isDark, categoryStreaks, focusQuest, swipeHint, activeGuide,
  onCheck, onUncheck, onSwipeHintShow, onSwipeHintClear,
  onToggleGuide, onNavigate, onOpenCustomQuest, onRemoveCustomQuest,
  onTouchStart, onTouchEnd, currentDay,
}) {
  if (quests.length === 0) return null;

  const blockCompleted = quests.filter((q) => completed.includes(q.id)).length;
  const blockDone = blockCompleted === quests.length;

  return (
    <div style={ts.timeBlock}>
      {/* Block header */}
      <div style={ts.blockHeader} onClick={onToggle}>
        <div style={ts.blockLeft}>
          {blockDone
            ? <CircleCheck size={16} color="#22C55E" />
            : <block.LucideIcon size={16} color={block.accent} />
          }
          <div>
            <div style={{
              ...ts.blockTitle,
              opacity: blockDone ? 0.5 : 1,
              textDecoration: blockDone ? "line-through" : "none",
            }}>
              {block.label}
            </div>
            <div style={ts.blockCount}>
              {blockCompleted}/{quests.length} complete
              {blockDone && <span style={{ ...ts.blockDoneBadge, display: "inline-flex", alignItems: "center", gap: 2 }}>✓ Done</span>}
            </div>
          </div>
        </div>

        <div style={ts.blockRight}>
          {/* Mini progress */}
          <div style={ts.miniProgress}>
            <div style={{
              ...ts.miniProgressFill,
              width: `${(blockCompleted / quests.length) * 100}%`,
              background: blockDone ? "#22C55E" : block.accent,
            }} />
          </div>
          <span style={{ fontSize: 12, opacity: 0.3, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.2s", color: colors.text }}>
            ▼
          </span>
        </div>
      </div>

      {/* Quest list */}
      {!isCollapsed && (
        <div style={ts.blockQuests}>
          {quests.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              done={completed.includes(q.id)}
              isDark={isDark}
              colors={colors}
              ts={ts}
              categoryStreaks={categoryStreaks}
              focusQuest={focusQuest}
              swipeHint={swipeHint}
              activeGuide={activeGuide}
              onCheck={onCheck}
              onUncheck={onUncheck}
              onSwipeHintShow={onSwipeHintShow}
              onSwipeHintClear={onSwipeHintClear}
              onToggleGuide={onToggleGuide}
              onNavigate={onNavigate}
              onOpenCustomQuest={onOpenCustomQuest}
              onRemoveCustomQuest={onRemoveCustomQuest}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              currentDay={currentDay}
            />
          ))}
        </div>
      )}
    </div>
  );
}
