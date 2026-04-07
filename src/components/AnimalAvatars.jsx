import React from 'react';

// ─── Cat ───────────────────────────────────────────────
const CatAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="catBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFB74D" />
        <stop offset="100%" stopColor="#FF9800" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#catBg)" />
    {/* Ears */}
    <polygon points="18,28 30,12 38,36" fill="#F5F5F5" />
    <polygon points="62,36 70,12 82,28" fill="#F5F5F5" />
    <polygon points="22,28 30,17 35,34" fill="#FFB3C1" />
    <polygon points="65,34 70,17 78,28" fill="#FFB3C1" />
    {/* Face */}
    <ellipse cx="50" cy="55" rx="28" ry="25" fill="#F5F5F5" />
    {/* Eyes */}
    <ellipse cx="39" cy="50" rx="5" ry="5.5" fill="#4A4A4A" />
    <ellipse cx="61" cy="50" rx="5" ry="5.5" fill="#4A4A4A" />
    <ellipse cx="40.5" cy="48.5" rx="2" ry="2" fill="#FFFFFF" />
    <ellipse cx="62.5" cy="48.5" rx="2" ry="2" fill="#FFFFFF" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="3.5" ry="2.5" fill="#FFB3C1" />
    {/* Mouth */}
    <path d="M50 60.5 Q46 65 43 63" fill="none" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 60.5 Q54 65 57 63" fill="none" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
    {/* Whiskers */}
    <line x1="18" y1="55" x2="35" y2="58" stroke="#CCC" strokeWidth="1" />
    <line x1="18" y1="60" x2="35" y2="60" stroke="#CCC" strokeWidth="1" />
    <line x1="65" y1="58" x2="82" y2="55" stroke="#CCC" strokeWidth="1" />
    <line x1="65" y1="60" x2="82" y2="60" stroke="#CCC" strokeWidth="1" />
  </svg>
);

// ─── Dog ───────────────────────────────────────────────
const DogAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dogBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#81D4FA" />
        <stop offset="100%" stopColor="#42A5F5" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#dogBg)" />
    {/* Floppy ears */}
    <ellipse cx="24" cy="44" rx="14" ry="22" fill="#8D6E63" transform="rotate(-10 24 44)" />
    <ellipse cx="76" cy="44" rx="14" ry="22" fill="#8D6E63" transform="rotate(10 76 44)" />
    {/* Face */}
    <ellipse cx="50" cy="52" rx="26" ry="24" fill="#D7CCC8" />
    {/* Brow patches */}
    <ellipse cx="38" cy="42" rx="10" ry="8" fill="#8D6E63" />
    <ellipse cx="62" cy="42" rx="10" ry="8" fill="#8D6E63" />
    {/* Eyes */}
    <circle cx="39" cy="47" r="5" fill="#3E2723" />
    <circle cx="61" cy="47" r="5" fill="#3E2723" />
    <circle cx="40.5" cy="45.5" r="2" fill="#FFF" />
    <circle cx="62.5" cy="45.5" r="2" fill="#FFF" />
    {/* Muzzle */}
    <ellipse cx="50" cy="60" rx="14" ry="10" fill="#EFEBE9" />
    {/* Nose */}
    <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#3E2723" />
    <ellipse cx="51.5" cy="55" rx="1.5" ry="1" fill="#5D4037" />
    {/* Mouth */}
    <path d="M50 59.5 L50 63" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 63 Q45 67 41 65" fill="none" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 63 Q55 67 59 65" fill="none" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
    {/* Tongue */}
    <ellipse cx="50" cy="68" rx="4" ry="5" fill="#EF9A9A" />
  </svg>
);

// ─── Fox ───────────────────────────────────────────────
const FoxAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="foxBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A5D6A7" />
        <stop offset="100%" stopColor="#66BB6A" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#foxBg)" />
    {/* Ears */}
    <polygon points="20,30 32,8 40,34" fill="#E65100" />
    <polygon points="60,34 68,8 80,30" fill="#E65100" />
    <polygon points="24,30 32,14 37,33" fill="#FFF3E0" />
    <polygon points="63,33 68,14 76,30" fill="#FFF3E0" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="27" ry="24" fill="#EF6C00" />
    {/* White face patch */}
    <ellipse cx="50" cy="60" rx="18" ry="18" fill="#FFF8E1" />
    {/* Eyes */}
    <ellipse cx="38" cy="48" rx="4.5" ry="5" fill="#3E2723" />
    <ellipse cx="62" cy="48" rx="4.5" ry="5" fill="#3E2723" />
    <ellipse cx="39.5" cy="46.5" rx="1.8" ry="2" fill="#FFF" />
    <ellipse cx="63.5" cy="46.5" rx="1.8" ry="2" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="57" rx="4" ry="3" fill="#3E2723" />
    {/* Mouth */}
    <path d="M50 60 Q46 64 43 62" fill="none" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 60 Q54 64 57 62" fill="none" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
    {/* Cheek tufts */}
    <path d="M22 56 Q28 52 32 58" fill="#EF6C00" stroke="none" />
    <path d="M78 56 Q72 52 68 58" fill="#EF6C00" stroke="none" />
  </svg>
);

// ─── Bear ──────────────────────────────────────────────
const BearAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bearBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#CE93D8" />
        <stop offset="100%" stopColor="#AB47BC" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#bearBg)" />
    {/* Ears */}
    <circle cx="26" cy="26" r="12" fill="#795548" />
    <circle cx="74" cy="26" r="12" fill="#795548" />
    <circle cx="26" cy="26" r="7" fill="#A1887F" />
    <circle cx="74" cy="26" r="7" fill="#A1887F" />
    {/* Face */}
    <ellipse cx="50" cy="52" rx="28" ry="26" fill="#8D6E63" />
    {/* Muzzle */}
    <ellipse cx="50" cy="60" rx="15" ry="12" fill="#D7CCC8" />
    {/* Eyes */}
    <circle cx="38" cy="47" r="5" fill="#3E2723" />
    <circle cx="62" cy="47" r="5" fill="#3E2723" />
    <circle cx="39.5" cy="45.5" r="2" fill="#FFF" />
    <circle cx="63.5" cy="45.5" r="2" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#3E2723" />
    <ellipse cx="51.5" cy="55" rx="1.5" ry="1" fill="#5D4037" />
    {/* Mouth */}
    <path d="M50 59.5 L50 63" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 63 Q46 66 43 65" fill="none" stroke="#5D4037" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 63 Q54 66 57 65" fill="none" stroke="#5D4037" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ─── Rabbit ────────────────────────────────────────────
const RabbitAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rabbitBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F48FB1" />
        <stop offset="100%" stopColor="#EC407A" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#rabbitBg)" />
    {/* Long ears */}
    <ellipse cx="36" cy="20" rx="8" ry="22" fill="#F5F5F5" transform="rotate(-8 36 20)" />
    <ellipse cx="64" cy="20" rx="8" ry="22" fill="#F5F5F5" transform="rotate(8 64 20)" />
    <ellipse cx="36" cy="20" rx="4.5" ry="16" fill="#FFB3C1" transform="rotate(-8 36 20)" />
    <ellipse cx="64" cy="20" rx="4.5" ry="16" fill="#FFB3C1" transform="rotate(8 64 20)" />
    {/* Face */}
    <ellipse cx="50" cy="56" rx="26" ry="24" fill="#F5F5F5" />
    {/* Cheeks */}
    <circle cx="34" cy="62" r="6" fill="#FFCDD2" opacity="0.6" />
    <circle cx="66" cy="62" r="6" fill="#FFCDD2" opacity="0.6" />
    {/* Eyes */}
    <circle cx="39" cy="52" r="5" fill="#4A4A4A" />
    <circle cx="61" cy="52" r="5" fill="#4A4A4A" />
    <circle cx="40.5" cy="50.5" r="2" fill="#FFF" />
    <circle cx="62.5" cy="50.5" r="2" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="61" rx="3" ry="2.5" fill="#FFB3C1" />
    {/* Mouth */}
    <path d="M50 63.5 Q46 67 44 65.5" fill="none" stroke="#BDBDBD" strokeWidth="1" strokeLinecap="round" />
    <path d="M50 63.5 Q54 67 56 65.5" fill="none" stroke="#BDBDBD" strokeWidth="1" strokeLinecap="round" />
    {/* Teeth */}
    <rect x="47.5" y="63.5" width="5" height="4" rx="1.5" fill="#FFF" stroke="#DDD" strokeWidth="0.5" />
    <line x1="50" y1="63.5" x2="50" y2="67.5" stroke="#DDD" strokeWidth="0.5" />
  </svg>
);

// ─── Panda ─────────────────────────────────────────────
const PandaAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pandaBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#80DEEA" />
        <stop offset="100%" stopColor="#26C6DA" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#pandaBg)" />
    {/* Ears */}
    <circle cx="24" cy="26" r="12" fill="#37474F" />
    <circle cx="76" cy="26" r="12" fill="#37474F" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="28" ry="26" fill="#FAFAFA" />
    {/* Eye patches */}
    <ellipse cx="36" cy="48" rx="11" ry="10" fill="#37474F" transform="rotate(-10 36 48)" />
    <ellipse cx="64" cy="48" rx="11" ry="10" fill="#37474F" transform="rotate(10 64 48)" />
    {/* Eyes */}
    <circle cx="37" cy="48" r="5" fill="#FFF" />
    <circle cx="63" cy="48" r="5" fill="#FFF" />
    <circle cx="38" cy="47" r="3" fill="#37474F" />
    <circle cx="64" cy="47" r="3" fill="#37474F" />
    <circle cx="39" cy="46" r="1.2" fill="#FFF" />
    <circle cx="65" cy="46" r="1.2" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="4" ry="3" fill="#37474F" />
    {/* Mouth */}
    <path d="M50 61 Q46 65 43 63" fill="none" stroke="#78909C" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 61 Q54 65 57 63" fill="none" stroke="#78909C" strokeWidth="1.2" strokeLinecap="round" />
    {/* Blush */}
    <circle cx="32" cy="60" r="5" fill="#FFCDD2" opacity="0.4" />
    <circle cx="68" cy="60" r="5" fill="#FFCDD2" opacity="0.4" />
  </svg>
);

// ─── Lion ──────────────────────────────────────────────
const LionAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lionBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFCC80" />
        <stop offset="100%" stopColor="#FFA726" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#lionBg)" />
    {/* Mane */}
    <circle cx="50" cy="50" r="38" fill="#E65100" />
    <circle cx="50" cy="50" r="35" fill="#EF6C00" />
    {/* Mane tufts */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
      <circle
        key={angle}
        cx={50 + 36 * Math.cos((angle * Math.PI) / 180)}
        cy={50 + 36 * Math.sin((angle * Math.PI) / 180)}
        r="8"
        fill="#BF360C"
        opacity="0.5"
      />
    ))}
    {/* Face */}
    <ellipse cx="50" cy="52" rx="24" ry="22" fill="#FFCC80" />
    {/* Muzzle */}
    <ellipse cx="50" cy="60" rx="13" ry="10" fill="#FFF8E1" />
    {/* Eyes */}
    <ellipse cx="40" cy="47" rx="4.5" ry="5" fill="#3E2723" />
    <ellipse cx="60" cy="47" rx="4.5" ry="5" fill="#3E2723" />
    <ellipse cx="41.5" cy="45.5" rx="1.8" ry="2" fill="#FFF" />
    <ellipse cx="61.5" cy="45.5" rx="1.8" ry="2" fill="#FFF" />
    {/* Nose */}
    <path d="M46 56 L50 59 L54 56 Z" fill="#5D4037" />
    {/* Mouth */}
    <path d="M50 59 L50 63" stroke="#8D6E63" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M50 63 Q46 66 43 64.5" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M50 63 Q54 66 57 64.5" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// ─── Owl ───────────────────────────────────────────────
const OwlAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="owlBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B39DDB" />
        <stop offset="100%" stopColor="#7E57C2" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#owlBg)" />
    {/* Ear tufts */}
    <polygon points="24,24 32,10 38,30" fill="#795548" />
    <polygon points="62,30 68,10 76,24" fill="#795548" />
    {/* Body */}
    <ellipse cx="50" cy="56" rx="28" ry="26" fill="#8D6E63" />
    {/* Belly */}
    <ellipse cx="50" cy="64" rx="16" ry="14" fill="#D7CCC8" />
    {/* Belly pattern */}
    <path d="M42 58 Q50 62 58 58" fill="none" stroke="#BCAAA4" strokeWidth="1" />
    <path d="M40 63 Q50 67 60 63" fill="none" stroke="#BCAAA4" strokeWidth="1" />
    <path d="M42 68 Q50 72 58 68" fill="none" stroke="#BCAAA4" strokeWidth="1" />
    {/* Eye discs */}
    <circle cx="38" cy="46" r="12" fill="#D7CCC8" />
    <circle cx="62" cy="46" r="12" fill="#D7CCC8" />
    {/* Eyes */}
    <circle cx="38" cy="46" r="8" fill="#FFF" />
    <circle cx="62" cy="46" r="8" fill="#FFF" />
    <circle cx="38" cy="46" r="5" fill="#FF8F00" />
    <circle cx="62" cy="46" r="5" fill="#FF8F00" />
    <circle cx="38" cy="46" r="3" fill="#3E2723" />
    <circle cx="62" cy="46" r="3" fill="#3E2723" />
    <circle cx="39.5" cy="44.5" r="1.5" fill="#FFF" />
    <circle cx="63.5" cy="44.5" r="1.5" fill="#FFF" />
    {/* Beak */}
    <polygon points="47,52 50,58 53,52" fill="#FF8F00" />
  </svg>
);

// ─── Penguin ───────────────────────────────────────────
const PenguinAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="penguinBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#90CAF9" />
        <stop offset="100%" stopColor="#42A5F5" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#penguinBg)" />
    {/* Body */}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#37474F" />
    {/* Belly */}
    <ellipse cx="50" cy="58" rx="18" ry="22" fill="#FAFAFA" />
    {/* Eyes */}
    <circle cx="39" cy="44" r="6" fill="#FFF" />
    <circle cx="61" cy="44" r="6" fill="#FFF" />
    <circle cx="40" cy="44" r="3.5" fill="#37474F" />
    <circle cx="62" cy="44" r="3.5" fill="#37474F" />
    <circle cx="41" cy="43" r="1.3" fill="#FFF" />
    <circle cx="63" cy="43" r="1.3" fill="#FFF" />
    {/* Beak */}
    <polygon points="44,52 50,57 56,52" fill="#FF8F00" />
    {/* Cheeks */}
    <circle cx="34" cy="52" r="5" fill="#FFCDD2" opacity="0.5" />
    <circle cx="66" cy="52" r="5" fill="#FFCDD2" opacity="0.5" />
    {/* Feet */}
    <ellipse cx="40" cy="82" rx="6" ry="3" fill="#FF8F00" />
    <ellipse cx="60" cy="82" rx="6" ry="3" fill="#FF8F00" />
  </svg>
);

// ─── Koala ─────────────────────────────────────────────
const KoalaAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="koalaBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A5D6A7" />
        <stop offset="100%" stopColor="#43A047" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#koalaBg)" />
    {/* Ears */}
    <circle cx="24" cy="32" r="14" fill="#78909C" />
    <circle cx="76" cy="32" r="14" fill="#78909C" />
    <circle cx="24" cy="32" r="9" fill="#FFCDD2" />
    <circle cx="76" cy="32" r="9" fill="#FFCDD2" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="26" ry="24" fill="#90A4AE" />
    {/* Light face */}
    <ellipse cx="50" cy="58" rx="18" ry="16" fill="#CFD8DC" />
    {/* Eyes */}
    <circle cx="40" cy="48" r="4.5" fill="#263238" />
    <circle cx="60" cy="48" r="4.5" fill="#263238" />
    <circle cx="41.5" cy="46.5" r="1.8" fill="#FFF" />
    <circle cx="61.5" cy="46.5" r="1.8" fill="#FFF" />
    {/* Big nose */}
    <ellipse cx="50" cy="57" rx="7" ry="5" fill="#455A64" />
    <ellipse cx="52" cy="56" rx="2" ry="1.5" fill="#546E7A" />
    {/* Mouth */}
    <path d="M50 62 Q46 66 43 64" fill="none" stroke="#78909C" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M50 62 Q54 66 57 64" fill="none" stroke="#78909C" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ─── Tiger ─────────────────────────────────────────────
const TigerAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tigerBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EF9A9A" />
        <stop offset="100%" stopColor="#EF5350" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#tigerBg)" />
    {/* Ears */}
    <circle cx="26" cy="26" r="11" fill="#EF6C00" />
    <circle cx="74" cy="26" r="11" fill="#EF6C00" />
    <circle cx="26" cy="26" r="6" fill="#FFF3E0" />
    <circle cx="74" cy="26" r="6" fill="#FFF3E0" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="28" ry="26" fill="#EF6C00" />
    {/* Stripes on forehead */}
    <path d="M42 32 L44 40" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 30 L50 38" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M58 32 L56 40" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
    {/* Side stripes */}
    <path d="M24 44 Q30 46 28 52" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M22 52 Q28 54 26 60" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M76 44 Q70 46 72 52" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M78 52 Q72 54 74 60" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* White muzzle */}
    <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFF8E1" />
    {/* Eyes */}
    <ellipse cx="38" cy="48" rx="5" ry="5.5" fill="#FFF" />
    <ellipse cx="62" cy="48" rx="5" ry="5.5" fill="#FFF" />
    <ellipse cx="39" cy="48" rx="3" ry="3.5" fill="#FF8F00" />
    <ellipse cx="63" cy="48" rx="3" ry="3.5" fill="#FF8F00" />
    <ellipse cx="39" cy="48" rx="1.8" ry="2.2" fill="#3E2723" />
    <ellipse cx="63" cy="48" rx="1.8" ry="2.2" fill="#3E2723" />
    <circle cx="40" cy="46.5" r="1.2" fill="#FFF" />
    <circle cx="64" cy="46.5" r="1.2" fill="#FFF" />
    {/* Nose */}
    <path d="M46 56 L50 59 L54 56 Z" fill="#3E2723" />
    {/* Mouth */}
    <path d="M50 59 L50 62" stroke="#8D6E63" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M50 62 Q46 66 42 64" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M50 62 Q54 66 58 64" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// ─── Wolf ──────────────────────────────────────────────
const WolfAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wolfBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B0BEC5" />
        <stop offset="100%" stopColor="#78909C" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#wolfBg)" />
    {/* Ears */}
    <polygon points="20,32 30,8 40,32" fill="#546E7A" />
    <polygon points="60,32 70,8 80,32" fill="#546E7A" />
    <polygon points="24,30 30,14 36,30" fill="#CFD8DC" />
    <polygon points="64,30 70,14 76,30" fill="#CFD8DC" />
    {/* Face */}
    <ellipse cx="50" cy="54" rx="28" ry="26" fill="#607D8B" />
    {/* Forehead light patch */}
    <path d="M36 36 Q50 30 64 36 Q58 44 50 42 Q42 44 36 36Z" fill="#78909C" />
    {/* Muzzle */}
    <ellipse cx="50" cy="62" rx="16" ry="12" fill="#CFD8DC" />
    {/* Eyes */}
    <ellipse cx="38" cy="48" rx="5" ry="4.5" fill="#FFF" />
    <ellipse cx="62" cy="48" rx="5" ry="4.5" fill="#FFF" />
    <ellipse cx="39" cy="48" rx="3" ry="3.5" fill="#FF8F00" />
    <ellipse cx="63" cy="48" rx="3" ry="3.5" fill="#FF8F00" />
    <ellipse cx="39" cy="48" rx="1.8" ry="2" fill="#263238" />
    <ellipse cx="63" cy="48" rx="1.8" ry="2" fill="#263238" />
    <circle cx="40" cy="46.5" r="1" fill="#FFF" />
    <circle cx="64" cy="46.5" r="1" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#37474F" />
    <ellipse cx="51.5" cy="57" rx="1.5" ry="1" fill="#455A64" />
    {/* Mouth */}
    <path d="M50 61.5 L50 65" stroke="#78909C" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M50 65 Q46 68 42 66" fill="none" stroke="#78909C" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M50 65 Q54 68 58 66" fill="none" stroke="#78909C" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// ─── Deer ──────────────────────────────────────────────
const DeerAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="deerBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFAB91" />
        <stop offset="100%" stopColor="#FF7043" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#deerBg)" />
    {/* Antlers */}
    <path d="M32 30 L28 14 L24 20" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 30 L30 18 L34 12" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 30 L72 14 L76 20" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 30 L70 18 L66 12" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Ears */}
    <ellipse cx="24" cy="38" rx="7" ry="12" fill="#A1887F" transform="rotate(-20 24 38)" />
    <ellipse cx="76" cy="38" rx="7" ry="12" fill="#A1887F" transform="rotate(20 76 38)" />
    <ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFCDD2" transform="rotate(-20 24 38)" />
    <ellipse cx="76" cy="38" rx="4" ry="8" fill="#FFCDD2" transform="rotate(20 76 38)" />
    {/* Face */}
    <ellipse cx="50" cy="56" rx="24" ry="24" fill="#A1887F" />
    {/* Light face */}
    <ellipse cx="50" cy="60" rx="16" ry="16" fill="#D7CCC8" />
    {/* Spots */}
    <circle cx="34" cy="44" r="2.5" fill="#8D6E63" opacity="0.5" />
    <circle cx="66" cy="44" r="2.5" fill="#8D6E63" opacity="0.5" />
    <circle cx="30" cy="52" r="2" fill="#8D6E63" opacity="0.4" />
    <circle cx="70" cy="52" r="2" fill="#8D6E63" opacity="0.4" />
    {/* Eyes */}
    <circle cx="40" cy="52" r="5.5" fill="#3E2723" />
    <circle cx="60" cy="52" r="5.5" fill="#3E2723" />
    <circle cx="41.5" cy="50.5" r="2.2" fill="#FFF" />
    <circle cx="61.5" cy="50.5" r="2.2" fill="#FFF" />
    {/* Nose */}
    <ellipse cx="50" cy="63" rx="4" ry="3" fill="#5D4037" />
    {/* Mouth */}
    <path d="M50 66 Q46 70 43 68" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M50 66 Q54 70 57 68" fill="none" stroke="#8D6E63" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// ─── Monkey ────────────────────────────────────────────
const MonkeyAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="monkeyBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF176" />
        <stop offset="100%" stopColor="#FDD835" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#monkeyBg)" />
    {/* Ears */}
    <circle cx="22" cy="46" r="12" fill="#795548" />
    <circle cx="78" cy="46" r="12" fill="#795548" />
    <circle cx="22" cy="46" r="8" fill="#FFCC80" />
    <circle cx="78" cy="46" r="8" fill="#FFCC80" />
    {/* Face */}
    <ellipse cx="50" cy="52" rx="26" ry="26" fill="#8D6E63" />
    {/* Light face area */}
    <ellipse cx="50" cy="58" rx="18" ry="18" fill="#FFCC80" />
    {/* Eyes */}
    <circle cx="40" cy="48" r="5" fill="#FFF" />
    <circle cx="60" cy="48" r="5" fill="#FFF" />
    <circle cx="41" cy="48" r="3" fill="#3E2723" />
    <circle cx="61" cy="48" r="3" fill="#3E2723" />
    <circle cx="42" cy="47" r="1.2" fill="#FFF" />
    <circle cx="62" cy="47" r="1.2" fill="#FFF" />
    {/* Nostrils */}
    <ellipse cx="46" cy="58" rx="2.5" ry="2" fill="#6D4C41" />
    <ellipse cx="54" cy="58" rx="2.5" ry="2" fill="#6D4C41" />
    {/* Smile */}
    <path d="M42 64 Q50 72 58 64" fill="none" stroke="#6D4C41" strokeWidth="1.5" strokeLinecap="round" />
    {/* Hair tuft */}
    <path d="M42 28 Q46 22 50 26 Q54 22 58 28" fill="#5D4037" />
  </svg>
);

// ─── Elephant ──────────────────────────────────────────
const ElephantAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="elephantBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E1BEE7" />
        <stop offset="100%" stopColor="#BA68C8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#elephantBg)" />
    {/* Ears */}
    <ellipse cx="20" cy="46" rx="16" ry="20" fill="#90A4AE" transform="rotate(-10 20 46)" />
    <ellipse cx="80" cy="46" rx="16" ry="20" fill="#90A4AE" transform="rotate(10 80 46)" />
    <ellipse cx="20" cy="46" rx="10" ry="14" fill="#B0BEC5" transform="rotate(-10 20 46)" />
    <ellipse cx="80" cy="46" rx="10" ry="14" fill="#B0BEC5" transform="rotate(10 80 46)" />
    {/* Head */}
    <ellipse cx="50" cy="50" rx="26" ry="28" fill="#90A4AE" />
    {/* Eyes */}
    <circle cx="38" cy="42" r="5" fill="#FFF" />
    <circle cx="62" cy="42" r="5" fill="#FFF" />
    <circle cx="39" cy="42" r="3" fill="#37474F" />
    <circle cx="63" cy="42" r="3" fill="#37474F" />
    <circle cx="40" cy="41" r="1.2" fill="#FFF" />
    <circle cx="64" cy="41" r="1.2" fill="#FFF" />
    {/* Trunk */}
    <path d="M50 52 Q50 60 48 66 Q46 72 44 74 Q42 76 44 77 Q46 78 48 76 Q52 72 52 66 Q52 60 50 52Z" fill="#B0BEC5" stroke="#90A4AE" strokeWidth="1" />
    {/* Cheeks */}
    <circle cx="34" cy="54" r="5" fill="#CE93D8" opacity="0.3" />
    <circle cx="66" cy="54" r="5" fill="#CE93D8" opacity="0.3" />
    {/* Eyebrows */}
    <path d="M33 37 Q38 34 43 37" fill="none" stroke="#607D8B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M57 37 Q62 34 67 37" fill="none" stroke="#607D8B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Frog ──────────────────────────────────────────────
const FrogAvatar = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="frogBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#80CBC4" />
        <stop offset="100%" stopColor="#26A69A" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#frogBg)" />
    {/* Eye bumps */}
    <circle cx="34" cy="32" r="14" fill="#66BB6A" />
    <circle cx="66" cy="32" r="14" fill="#66BB6A" />
    {/* Face */}
    <ellipse cx="50" cy="56" rx="30" ry="22" fill="#66BB6A" />
    {/* Eyes */}
    <circle cx="34" cy="32" r="10" fill="#FFF" />
    <circle cx="66" cy="32" r="10" fill="#FFF" />
    <circle cx="35" cy="32" r="6" fill="#2E7D32" />
    <circle cx="67" cy="32" r="6" fill="#2E7D32" />
    <circle cx="35" cy="32" r="3.5" fill="#1B5E20" />
    <circle cx="67" cy="32" r="3.5" fill="#1B5E20" />
    <circle cx="36.5" cy="30.5" r="1.8" fill="#FFF" />
    <circle cx="68.5" cy="30.5" r="1.8" fill="#FFF" />
    {/* Nostrils */}
    <circle cx="44" cy="50" r="2" fill="#388E3C" />
    <circle cx="56" cy="50" r="2" fill="#388E3C" />
    {/* Mouth */}
    <path d="M30 60 Q50 72 70 60" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
    {/* Cheeks */}
    <circle cx="30" cy="56" r="5" fill="#A5D6A7" opacity="0.5" />
    <circle cx="70" cy="56" r="5" fill="#A5D6A7" opacity="0.5" />
    {/* Belly hint */}
    <ellipse cx="50" cy="64" rx="18" ry="8" fill="#A5D6A7" opacity="0.4" />
  </svg>
);

// ─── Avatar Registry ───────────────────────────────────
export const ANIMAL_AVATARS = [
  { id: 'cat', name: 'Cat', Component: CatAvatar, bgColor: '#FF9800' },
  { id: 'dog', name: 'Dog', Component: DogAvatar, bgColor: '#42A5F5' },
  { id: 'fox', name: 'Fox', Component: FoxAvatar, bgColor: '#66BB6A' },
  { id: 'bear', name: 'Bear', Component: BearAvatar, bgColor: '#AB47BC' },
  { id: 'rabbit', name: 'Rabbit', Component: RabbitAvatar, bgColor: '#EC407A' },
  { id: 'panda', name: 'Panda', Component: PandaAvatar, bgColor: '#26C6DA' },
  { id: 'lion', name: 'Lion', Component: LionAvatar, bgColor: '#FFA726' },
  { id: 'owl', name: 'Owl', Component: OwlAvatar, bgColor: '#7E57C2' },
  { id: 'penguin', name: 'Penguin', Component: PenguinAvatar, bgColor: '#42A5F5' },
  { id: 'koala', name: 'Koala', Component: KoalaAvatar, bgColor: '#43A047' },
  { id: 'tiger', name: 'Tiger', Component: TigerAvatar, bgColor: '#EF5350' },
  { id: 'wolf', name: 'Wolf', Component: WolfAvatar, bgColor: '#78909C' },
  { id: 'deer', name: 'Deer', Component: DeerAvatar, bgColor: '#FF7043' },
  { id: 'monkey', name: 'Monkey', Component: MonkeyAvatar, bgColor: '#FDD835' },
  { id: 'elephant', name: 'Elephant', Component: ElephantAvatar, bgColor: '#BA68C8' },
  { id: 'frog', name: 'Frog', Component: FrogAvatar, bgColor: '#26A69A' },
];

export function renderAnimalAvatar(id, size = 58) {
  const avatar = ANIMAL_AVATARS.find((a) => a.id === id);
  if (!avatar) return null;
  const { Component } = avatar;
  return <Component size={size} />;
}

export default ANIMAL_AVATARS;
