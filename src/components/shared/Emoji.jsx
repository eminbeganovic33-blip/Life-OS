// Renders emoji as real images (Microsoft Fluent Emoji, MIT — see CREDITS.md)
// instead of the phone's emoji font, so icons look the same everywhere.
//
//   <Emoji e="🔥" size={24} />          one emoji (data icons: quest.icon, …)
//   <EmojiText>{"Day 1 🧠"}</EmojiText>  a string that may contain emoji
//
// Unknown emoji fall back to the plain character, so nothing ever disappears.
import { EMOJI_IMAGES } from "../../data/emojiImages";

const VS16 = /️/g;
// Emoji sequences: a pictographic char, optional VS16, optional ZWJ chains.
const EMOJI_RE = /(\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)/u;
const EMOJI_SPLIT = new RegExp(EMOJI_RE.source, "gu");

export function emojiImage(e) {
  if (typeof e !== "string") return null;
  return EMOJI_IMAGES[e.replace(VS16, "").trim()] || null;
}

export function Emoji({ e, size = 24, label, style, className = "" }) {
  const name = emojiImage(e);
  if (!name) {
    const fs = typeof size === "number" ? size * 0.9 : undefined;
    return <span style={{ fontSize: fs, lineHeight: 1, ...style }} aria-hidden={label ? undefined : true}>{e}</span>;
  }
  return (
    <img
      src={`/emoji/${name}.webp`}
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      loading="lazy"
      decoding="async"
      draggable={false}
      alt={label ?? name.replace(/-/g, " ")}
      className={`emoji-img ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
    />
  );
}

// Splits text and swaps each emoji for an inline image sized to the text.
export function EmojiText({ children, size = "1.15em" }) {
  if (typeof children !== "string" || !EMOJI_RE.test(children)) return children ?? null;
  const parts = children.split(EMOJI_SPLIT);
  return parts.map((part, i) => {
    if (i % 2 === 1 && emojiImage(part)) {
      return <Emoji key={i} e={part} size={size} style={{ width: size, height: size }} />;
    }
    return part;
  });
}

export default Emoji;
