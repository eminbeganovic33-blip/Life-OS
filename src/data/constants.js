export const SOBRIETY_DEFAULTS = [
  { id: "smoking", label: "Smoking", icon: "🚭", color: "#EF4444" },
  { id: "alcohol", label: "Alcohol", icon: "🍺", color: "#F59E0B" },
  { id: "junkfood", label: "Junk Food", icon: "🍔", color: "#F97316" },
  { id: "social_media", label: "Doomscrolling", icon: "📱", color: "#8B5CF6" },
];

export const MOTIVATION_CARDS = [
  // Discipline
  { category: "Discipline", quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { category: "Discipline", quote: "We do not rise to the level of our goals. We fall to the level of our systems.", author: "James Clear" },
  { category: "Discipline", quote: "The successful person has the habit of doing things failures don't like to do.", author: "Thomas Edison" },
  { category: "Discipline", quote: "You will never always be motivated. You have to learn to be disciplined.", author: "Unknown" },
  // Strength
  { category: "Strength", quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { category: "Strength", quote: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { category: "Strength", quote: "Hard times create strong men. Strong men create good times.", author: "G. Michael Hopf" },
  { category: "Strength", quote: "What stands in the way becomes the way.", author: "Marcus Aurelius" },
  // Focus
  { category: "Focus", quote: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { category: "Focus", quote: "The man who chases two rabbits catches neither.", author: "Confucius" },
  { category: "Focus", quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { category: "Focus", quote: "You can do anything, but not everything.", author: "David Allen" },
  // Wisdom
  { category: "Wisdom", quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { category: "Wisdom", quote: "No man is free who is not master of himself.", author: "Epictetus" },
  { category: "Wisdom", quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { category: "Wisdom", quote: "The unexamined life is not worth living.", author: "Socrates" },
  // Confidence
  { category: "Confidence", quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { category: "Confidence", quote: "You are what you do, not what you say you'll do.", author: "Carl Jung" },
  { category: "Confidence", quote: "The way to develop self-confidence is to do the thing you fear.", author: "William Jennings Bryan" },
  { category: "Confidence", quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  // Growth
  { category: "Growth", quote: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { category: "Growth", quote: "The comfort zone is a beautiful place, but nothing ever grows there.", author: "Unknown" },
  { category: "Growth", quote: "Every master was once a disaster.", author: "T. Harv Eker" },
  { category: "Growth", quote: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
  // Resilience
  { category: "Resilience", quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { category: "Resilience", quote: "A smooth sea never made a skilled sailor.", author: "Franklin D. Roosevelt" },
  { category: "Resilience", quote: "The oak fought the wind and was broken. The willow bent when it must and survived.", author: "Robert Jordan" },
  { category: "Resilience", quote: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary" },
  // Courage
  { category: "Courage", quote: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
  { category: "Courage", quote: "He who is brave is free.", author: "Seneca" },
  { category: "Courage", quote: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { category: "Courage", quote: "Fortune favors the bold.", author: "Virgil" },
  // Health
  { category: "Health", quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { category: "Health", quote: "The greatest wealth is health.", author: "Virgil" },
  { category: "Health", quote: "Your body hears everything your mind says. Stay positive.", author: "Naomi Judd" },
  { category: "Health", quote: "Sleep is the best meditation.", author: "Dalai Lama" },
  // Habits
  { category: "Habits", quote: "First we make our habits, then our habits make us.", author: "Charles C. Noble" },
  { category: "Habits", quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { category: "Habits", quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { category: "Habits", quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  // Mindset
  { category: "Mindset", quote: "The mind is everything. What you think you become.", author: "Buddha" },
  { category: "Mindset", quote: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { category: "Mindset", quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  { category: "Mindset", quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
];

export const MOODS = [
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😔", label: "Low" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😊", label: "Great" },
  { emoji: "🔥", label: "On Fire" },
];

export const LEVELS = [
  { name: "Beginner", xpReq: 0 },
  { name: "Apprentice", xpReq: 100 },
  { name: "Warrior", xpReq: 300 },
  { name: "Champion", xpReq: 600 },
  { name: "Master", xpReq: 1000 },
  { name: "Legend", xpReq: 1500 },
  { name: "Mythic", xpReq: 2200 },
  { name: "Transcended", xpReq: 3000 },
  { name: "Ascendant", xpReq: 4000 },
  { name: "Sovereign", xpReq: 5200 },
  { name: "Titan", xpReq: 6600 },
  { name: "Immortal", xpReq: 8200 },
  { name: "Archon", xpReq: 10000 },
  { name: "Paragon", xpReq: 12500 },
  { name: "Eternal", xpReq: 15500 },
  { name: "Apex", xpReq: 19000 },
  { name: "Omega", xpReq: 23000 },
  { name: "Prestige I", xpReq: 28000 },
  { name: "Prestige II", xpReq: 34000 },
  { name: "Prestige III", xpReq: 42000 },
];
