import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#7C5CFC", "#EC4899", "#FBBF24", "#22C55E", "#3B82F6", "#F97316", "#A78BFA", "#10B981"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(originX, originY, type) {
  const angle = randomBetween(0, Math.PI * 2);
  const velocity = type === "burst" ? randomBetween(200, 500) : randomBetween(100, 350);
  const size = type === "burst" ? randomBetween(4, 10) : randomBetween(3, 7);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const shape = Math.random() > 0.5 ? "circle" : "rect";
  const rotation = randomBetween(0, 360);

  return {
    id: Math.random().toString(36).slice(2),
    x: originX,
    y: originY,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity - (type === "burst" ? 200 : 100), // upward bias
    size,
    color,
    shape,
    rotation,
    rotationSpeed: randomBetween(-720, 720),
    opacity: 1,
    gravity: type === "burst" ? 600 : 400,
    drag: 0.97,
    lifetime: type === "burst" ? randomBetween(1.2, 2.0) : randomBetween(0.8, 1.5),
  };
}

/**
 * Confetti celebration overlay.
 * Usage: <Confetti trigger={triggerCount} type="burst" />
 *
 * type: "burst" (big celebration), "pop" (small quest completion)
 * trigger: increment to fire. When it changes, confetti fires.
 */
export default function Confetti({ trigger, type = "burst", originX = 0.5, originY = 0.5 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const count = type === "burst" ? 60 : 20;
    const ox = window.innerWidth * originX;
    const oy = window.innerHeight * originY;

    const newParticles = Array.from({ length: count }, () => createParticle(ox, oy, type));
    setParticles(newParticles);

    // Animate frame by frame
    let frame;
    let lastTime = performance.now();

    function animate(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta
      lastTime = now;

      setParticles((prev) => {
        const next = prev
          .map((p) => {
            const age = p.lifetime - dt;
            if (age <= 0) return null;
            return {
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              vx: p.vx * p.drag,
              vy: p.vy * p.drag + p.gravity * dt,
              rotation: p.rotation + p.rotationSpeed * dt,
              opacity: Math.min(1, age / 0.3), // fade in last 0.3s
              lifetime: age,
            };
          })
          .filter(Boolean);

        if (next.length === 0) return [];
        return next;
      });

      if (particles.length > 0) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div style={styles.container}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.6 : p.size,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            background: p.color,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Simple sparkle burst for small celebrations.
 * Shows 3 expanding rings + sparkle dots.
 */
export function SparkleRing({ trigger, color = "#7C5CFC" }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 800);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!active) return null;

  return (
    <div style={styles.sparkleContainer}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${color}`,
          }}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 2 + i * 0.5, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 10000,
    overflow: "hidden",
  },
  sparkleContainer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
};
