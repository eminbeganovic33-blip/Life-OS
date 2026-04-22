import { motion } from "framer-motion";
import { CircleCheck, ChevronDown } from "lucide-react";
import QuestCard from "./QuestCard";

export default function TimeBlockSection({
  blockKey, block, quests, completed, isCollapsed, onToggle, ts, colors,
  // QuestCard pass-through props
  isDark, categoryStreaks, categoryMastery, focusQuest, swipeHint, activeGuide,
  onCheck, onUncheck, onSwipeHintShow, onSwipeHintClear,
  onToggleGuide, onNavigate, onOpenCustomQuest, onRemoveCustomQuest,
  onRetireActiveQuest,
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
          {/* Quest count badge when collapsed */}
          {isCollapsed && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: block.accent,
              background: `${block.accent}15`,
              padding: "2px 7px",
              borderRadius: 6,
              border: `1px solid ${block.accent}25`,
            }}>
              {quests.length - blockCompleted} left
            </span>
          )}
          {/* Mini progress — only shown when expanded */}
          {!isCollapsed && (
            <div style={ts.miniProgress}>
              <div style={{
                ...ts.miniProgressFill,
                width: `${(blockCompleted / quests.length) * 100}%`,
                background: blockDone ? "#22C55E" : block.accent,
              }} />
            </div>
          )}
          <motion.span
            animate={{ rotate: isCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", opacity: 0.35, color: colors.text }}
          >
            <ChevronDown size={16} color={colors.text} />
          </motion.span>
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
              categoryMastery={categoryMastery}
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
              onRetireActiveQuest={onRetireActiveQuest}
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
