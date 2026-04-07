import {
  Moon, Droplets, Dumbbell, Brain, MonitorOff, ShowerHead,
  Salad, BookOpen, Briefcase, Users, Wallet, Palette,
  Home, Swords, GraduationCap, Flame, Trophy,
  ChevronRight, Plus, X, Check, Sparkles, Target,
  Heart, TrendingUp, Clock, Zap, PenLine, BarChart3,
  Settings, User, Bell, Calendar, Star, ArrowRight,
  MessageCircle, Send, RotateCcw, Play, Pause, Search,
  Shield, Award, Crosshair, Eye, EyeOff, LogOut,
} from "lucide-react";

// Category ID → Lucide icon mapping
const CATEGORY_ICONS = {
  sleep: Moon,
  water: Droplets,
  exercise: Dumbbell,
  mind: Brain,
  screen: MonitorOff,
  shower: ShowerHead,
  nutrition: Salad,
  reading: BookOpen,
  work: Briefcase,
  social: Users,
  finance: Wallet,
  creative: Palette,
};

// Nav ID → Lucide icon mapping
const NAV_ICONS = {
  dashboard: Home,
  home: Swords,
  dojo: Dumbbell,
  forge: Flame,
  academy: GraduationCap,
};

// General icon mapping
const GENERAL_ICONS = {
  home: Home,
  swords: Swords,
  dumbbell: Dumbbell,
  flame: Flame,
  graduationCap: GraduationCap,
  trophy: Trophy,
  chevronRight: ChevronRight,
  plus: Plus,
  x: X,
  check: Check,
  sparkles: Sparkles,
  target: Target,
  heart: Heart,
  trendingUp: TrendingUp,
  clock: Clock,
  zap: Zap,
  penLine: PenLine,
  barChart: BarChart3,
  settings: Settings,
  user: User,
  bell: Bell,
  calendar: Calendar,
  star: Star,
  arrowRight: ArrowRight,
  messageCircle: MessageCircle,
  send: Send,
  rotateCcw: RotateCcw,
  play: Play,
  pause: Pause,
  search: Search,
  shield: Shield,
  award: Award,
  crosshair: Crosshair,
  eye: Eye,
  eyeOff: EyeOff,
  logOut: LogOut,
};

/**
 * Render a Lucide icon by name.
 * Usage: <Icon name="sparkles" size={16} color="#7C5CFC" />
 */
export default function Icon({ name, size = 16, color, strokeWidth = 1.75, style, className }) {
  const Component = GENERAL_ICONS[name];
  if (!Component) return null;
  return <Component size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} />;
}

/**
 * Get the Lucide icon component for a category ID.
 * Usage: const LucideIcon = getCategoryIcon("sleep"); <LucideIcon size={16} />
 */
export function getCategoryIcon(categoryId) {
  return CATEGORY_ICONS[categoryId] || Target;
}

/**
 * Render a category icon inline.
 * Usage: <CategoryIcon id="sleep" size={16} color="#7C5CFC" />
 */
export function CategoryIcon({ id, size = 16, color, strokeWidth = 1.75 }) {
  const Component = CATEGORY_ICONS[id] || Target;
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}

/**
 * Get the Lucide icon component for a nav item ID.
 */
export function getNavIcon(navId) {
  return NAV_ICONS[navId] || Home;
}

/**
 * Render a nav icon inline.
 */
export function NavIcon({ id, size = 20, color, strokeWidth = 1.75 }) {
  const Component = NAV_ICONS[id] || Home;
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}
