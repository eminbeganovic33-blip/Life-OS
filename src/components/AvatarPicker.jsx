import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS, DARK_COLORS } from "../styles/theme";
import { ANIMAL_AVATARS } from "./AnimalAvatars";

const T = TOKENS;
const C = DARK_COLORS;

// Compress an image File to a base64 JPEG at maxDim × maxDim, ~10KB
async function compressImage(file, maxDim = 150) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AvatarPicker({ open, onClose, currentAvatar, onSave }) {
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onSave({ type: "photo", value: dataUrl });
      onClose();
    } catch {
      // silently fail — keep current avatar
    } finally {
      // reset so same file can be picked again
      e.target.value = "";
    }
  };

  const handleAnimal = (id) => {
    onSave({ type: "animal", value: id });
    onClose();
  };

  const handleRemove = () => {
    onSave({ type: "letter", value: null });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            style={overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            style={sheet}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          >
            {/* Handle */}
            <div style={handle} />

            <div style={sheetTitle}>Choose Avatar</div>

            {/* Upload photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            <button style={uploadBtn} onClick={() => fileInputRef.current?.click()}>
              <span style={{ fontSize: 20 }}>📷</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: T.font.md, fontWeight: T.weight.bold }}>Upload a Photo</div>
                <div style={{ fontSize: T.font.xs, color: C.textSecondary, marginTop: 1 }}>
                  JPG, PNG — compressed automatically
                </div>
              </div>
            </button>

            {/* Divider */}
            <div style={divider}>
              <div style={dividerLine} />
              <span style={dividerText}>or pick an animal</span>
              <div style={dividerLine} />
            </div>

            {/* Animal grid */}
            <div style={animalGrid}>
              {ANIMAL_AVATARS.map(({ id, name, Component }) => {
                const isSelected = currentAvatar?.type === "animal" && currentAvatar?.value === id;
                return (
                  <motion.button
                    key={id}
                    style={{ ...animalBtn, ...(isSelected ? animalBtnActive : {}) }}
                    onClick={() => handleAnimal(id)}
                    whileTap={{ scale: 0.9 }}
                    title={name}
                  >
                    <Component size={40} />
                    <span style={{ fontSize: 10, color: isSelected ? "#7C5CFC" : C.textSecondary, marginTop: 2 }}>
                      {name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Remove */}
            {currentAvatar?.type !== "letter" && (
              <button style={removeBtn} onClick={handleRemove}>
                Remove photo / avatar
              </button>
            )}

            <div style={{ height: 24 }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 600,
};

const sheet = {
  position: "fixed",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 430,
  background: "#0F172A",
  border: "1px solid rgba(255,255,255,0.08)",
  borderBottom: "none",
  borderRadius: `${T.radii.xl}px ${T.radii.xl}px 0 0`,
  zIndex: 601,
  padding: `${T.space.md}px ${T.space.lg}px 0`,
};

const handle = {
  width: 36,
  height: 4,
  borderRadius: 2,
  background: "rgba(255,255,255,0.15)",
  margin: `0 auto ${T.space.lg}px`,
};

const sheetTitle = {
  fontSize: T.font.lg,
  fontWeight: T.weight.black,
  textAlign: "center",
  marginBottom: T.space.lg,
};

const uploadBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: T.space.md,
  padding: T.space.lg,
  borderRadius: T.radii.md,
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: "inherit",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "left",
  marginBottom: T.space.md,
};

const divider = {
  display: "flex",
  alignItems: "center",
  gap: T.space.sm,
  margin: `${T.space.md}px 0`,
};

const dividerLine = {
  flex: 1,
  height: 1,
  background: "rgba(255,255,255,0.08)",
};

const dividerText = {
  fontSize: T.font.xs,
  color: C.textSecondary,
  whiteSpace: "nowrap",
};

const animalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: T.space.sm,
  marginBottom: T.space.md,
};

const animalBtn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: `${T.space.sm}px ${T.space.xs}px`,
  borderRadius: T.radii.md,
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  cursor: "pointer",
  fontFamily: "inherit",
};

const animalBtnActive = {
  background: "rgba(124,92,252,0.1)",
  border: "1px solid rgba(124,92,252,0.3)",
};

const removeBtn = {
  width: "100%",
  padding: `${T.space.md}px`,
  borderRadius: T.radii.sm,
  border: "none",
  background: "transparent",
  color: C.textSecondary,
  fontSize: T.font.xs,
  cursor: "pointer",
  fontFamily: "inherit",
  marginBottom: T.space.sm,
};
