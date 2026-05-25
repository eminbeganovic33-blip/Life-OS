import { useMemo } from "react";
import { TOKENS } from "../../styles/tokens";
import { dateToLocalDayKey } from "../../utils/helpers";

/**
 * 366-cell grid showing daily activity intensity for the past year.
 * One of the most-shared retention images in habit-app history.
 */
export default function YearInPixels({ state }) {
  const cells = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      // Quest data is keyed by LOCAL date (dateToLocalDayKey); using
      // toISOString() here would silently shift cells for non-UTC users.
      const key = dateToLocalDayKey(d);
      const ids = state.completedQuests?.[key] || [];
      const count = Array.isArray(ids) ? ids.length : 0;
      const month = d.getMonth();
      out.push({ date: key, count, month, day: d.getDate() });
    }
    return out;
  }, [state.completedQuests]);

  function intensity(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  function colorAt(level) {
    const base = "#7C5CFC";
    switch (level) {
      case 0: return TOKENS.color.surface;
      case 1: return `${base}30`;
      case 2: return `${base}60`;
      case 3: return `${base}A0`;
      case 4: return base;
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.grid}>
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={`${cell.date}: ${cell.count} quests`}
            style={{
              ...styles.cell,
              background: colorAt(intensity(cell.count)),
            }}
          />
        ))}
      </div>
      <div style={styles.legend}>
        <span style={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} style={{ ...styles.cell, background: colorAt(l) }} />
        ))}
        <span style={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 8 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(26, 1fr)",
    gridAutoRows: "1fr",
    gap: 2,
    aspectRatio: "26 / 14",
  },
  cell: {
    aspectRatio: "1",
    borderRadius: 2,
  },
  legend: {
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    gap: 4,
  },
  legendLabel: {
    fontSize: 10, color: TOKENS.color.textTertiary,
  },
};
