/**
 * 30-Day Quit Programs for each Forge tracker.
 * Each program provides phase-based daily guidance with practical tips and actions.
 */

const FORGE_PROGRAMS = {
  smoking: {
    title: "30-Day Smoke-Free Program",
    description: "A science-backed daily guide through nicotine withdrawal and beyond, helping you reclaim your lungs and your freedom.",
    days: [
      // === ACUTE PHASE (Days 1-7) ===
      {
        day: 1,
        phase: "Acute Phase",
        tip: "Nicotine leaves your bloodstream within 72 hours. The next three days will be the hardest, but every craving only lasts 3-5 minutes.",
        action: "Remove all cigarettes, lighters, and ashtrays from your home, car, and workspace. Tell at least one person you're quitting today."
      },
      {
        day: 2,
        phase: "Acute Phase",
        tip: "Your body is already healing. Within 20 minutes of your last cigarette, your heart rate dropped to normal. Carbon monoxide levels in your blood are normalizing right now.",
        action: "Practice the 4-7-8 breathing technique when a craving hits: inhale for 4 seconds, hold for 7, exhale for 8. Do this at least 5 times today."
      },
      {
        day: 3,
        phase: "Acute Phase",
        tip: "Day 3 is typically the peak of nicotine withdrawal. You may feel irritable, anxious, or have headaches. This is your body flushing out the last of the nicotine.",
        action: "Keep your hands and mouth busy: carry a pack of sugar-free gum, a stress ball, or toothpicks. Use them every time you feel the urge."
      },
      {
        day: 4,
        phase: "Acute Phase",
        tip: "The nicotine is now completely out of your system. Cravings from here are psychological habit loops, not chemical dependence. You can outsmart a habit.",
        action: "Identify your top 3 smoking triggers (coffee, stress, after meals) and write down one alternative behavior for each."
      },
      {
        day: 5,
        phase: "Acute Phase",
        tip: "Your sense of taste and smell are starting to return. Food may taste more vivid. This is your nerve endings regenerating.",
        action: "Eat a meal slowly and notice flavors you haven't tasted in a while. Drink a full glass of water before and after every meal."
      },
      {
        day: 6,
        phase: "Acute Phase",
        tip: "Coughing more than usual is normal and actually a good sign. Your lungs are clearing out tar and debris. This is recovery in action.",
        action: "Take a 15-minute walk outside. Focus on breathing deeply through your nose. Notice how much easier it already feels."
      },
      {
        day: 7,
        phase: "Acute Phase",
        tip: "You made it through the hardest week. The frequency of cravings will start to decline from here. Each one you ride out weakens the habit circuit in your brain.",
        action: "Write down 3 benefits you've already noticed this week, no matter how small. Put the note somewhere you'll see it daily."
      },
      // === ADJUSTMENT (Days 8-14) ===
      {
        day: 8,
        phase: "Adjustment",
        tip: "Your circulation is improving. You may notice warmer hands and feet, and walking feels a bit easier. Your body is rerouting blood that was being constricted by nicotine.",
        action: "Try a slightly more vigorous exercise today: a brisk walk, bike ride, or some bodyweight exercises. Notice your improved lung capacity."
      },
      {
        day: 9,
        phase: "Adjustment",
        tip: "Mood swings are common during weeks 2-3. Your brain is recalibrating its dopamine system without nicotine. This is temporary.",
        action: "When irritation spikes, do 10 slow belly breaths before reacting. Tell people close to you that you might be edgy and it's not about them."
      },
      {
        day: 10,
        phase: "Adjustment",
        tip: "Social situations are a major relapse trigger. Having a plan before you encounter smokers is far more effective than relying on willpower in the moment.",
        action: "Plan how you'll handle the next social situation where people smoke. Practice saying 'No thanks, I don't smoke' out loud."
      },
      {
        day: 11,
        phase: "Adjustment",
        tip: "Many ex-smokers experience increased appetite as taste returns and the oral fixation seeks a replacement. This is manageable with the right substitutes.",
        action: "Stock up on crunchy, low-calorie snacks: carrot sticks, celery, apple slices, or sunflower seeds. Keep them within arm's reach."
      },
      {
        day: 12,
        phase: "Adjustment",
        tip: "Your lung cilia (tiny hair-like structures) are regrowing and beginning to function again. They sweep mucus and debris out of your lungs. Expect some continued coughing.",
        action: "Do 5 minutes of deep breathing exercises: inhale slowly for 5 counts, hold for 2, exhale for 7. Repeat 10 times."
      },
      {
        day: 13,
        phase: "Adjustment",
        tip: "Stress was never actually reduced by smoking. Nicotine created the stress of withdrawal, then relieved it temporarily. You're breaking free from that artificial cycle.",
        action: "Find one new stress relief method and try it today: a 10-minute meditation, journaling, or a cold water face splash."
      },
      {
        day: 14,
        phase: "Adjustment",
        tip: "Two weeks in. The worst of the physical withdrawal is behind you. Your risk of heart attack has already started to decrease. The cravings will keep fading.",
        action: "Calculate the money you've saved in 14 days. Set it aside or transfer it to a savings account. Watch your freedom fund grow."
      },
      // === BUILDING MOMENTUM (Days 15-21) ===
      {
        day: 15,
        phase: "Building Momentum",
        tip: "Your brain's nicotine receptors are starting to downregulate. The 'volume' on cravings is being turned down at a biological level. Each week they get quieter.",
        action: "Notice how many hours pass between cravings now compared to week one. Write it down to see your progress objectively."
      },
      {
        day: 16,
        phase: "Building Momentum",
        tip: "Beware of the 'just one' trap. A single cigarette re-primes the entire addiction circuit. There is no such thing as one cigarette for an ex-smoker.",
        action: "Write a brief letter to yourself explaining why you quit. Keep it on your phone for moments of weakness."
      },
      {
        day: 17,
        phase: "Building Momentum",
        tip: "Your lung function is measurably improving. Activities that left you winded before are becoming easier. This trend will continue for months.",
        action: "Try an activity that used to leave you breathless: climb stairs, jog a short distance, or sing along to a song. Notice the difference."
      },
      {
        day: 18,
        phase: "Building Momentum",
        tip: "Dreams about smoking are very common and do not mean you want to smoke. They're your brain processing the identity shift. Many long-term quitters still have them occasionally.",
        action: "If you have a smoking dream, write it down when you wake up. Then remind yourself it was just your brain reorganizing, not a desire."
      },
      {
        day: 19,
        phase: "Building Momentum",
        tip: "By now, you've likely encountered most of your regular triggers at least once. Each successful navigation makes the next one easier. You're building real resilience.",
        action: "Deliberately face a trigger situation you've been avoiding (a coffee break spot, a bar, a stressful call) and prove to yourself you can handle it."
      },
      {
        day: 20,
        phase: "Building Momentum",
        tip: "Your energy levels should be noticeably better. Without carbon monoxide competing for oxygen in your blood, every cell in your body is getting more fuel.",
        action: "Channel your extra energy into something productive: clean a room, start a small project, or cook an elaborate meal."
      },
      {
        day: 21,
        phase: "Building Momentum",
        tip: "Three weeks is a major milestone. Research shows that most habitual behavior patterns start to weaken significantly after 21 days of consistent change.",
        action: "Reward yourself with something meaningful that a smoker's budget wouldn't have allowed. You've earned it."
      },
      // === CONSOLIDATION (Days 22-30) ===
      {
        day: 22,
        phase: "Consolidation",
        tip: "Start thinking of yourself as a non-smoker, not someone who is 'trying to quit.' Identity drives behavior. You are someone who does not smoke.",
        action: "When the topic of smoking comes up today, say 'I don't smoke' instead of 'I'm trying to quit.' Notice how different it feels."
      },
      {
        day: 23,
        phase: "Consolidation",
        tip: "Your immune system is recovering. White blood cell counts are normalizing. You'll likely get fewer colds and infections going forward.",
        action: "Boost your recovery with a meal rich in antioxidants: berries, leafy greens, nuts, or citrus fruits."
      },
      {
        day: 24,
        phase: "Consolidation",
        tip: "Occasional cravings may still appear, especially during high-stress moments. They're echoes, not emergencies. They pass faster now and carry less intensity.",
        action: "Create a 'craving emergency kit' for your bag: gum, a fidget tool, a motivational note, and a photo of why you quit."
      },
      {
        day: 25,
        phase: "Consolidation",
        tip: "Your skin is improving. Better circulation and oxygen delivery are reducing that grayish pallor. Collagen production is recovering.",
        action: "Take a photo of yourself today. Compare it with one from a month ago. The differences in skin tone and eye clarity may surprise you."
      },
      {
        day: 26,
        phase: "Consolidation",
        tip: "If you slipped at any point during this program, that doesn't erase your progress. Relapse is a data point, not a failure. What matters is that you're still here on day 26.",
        action: "Reflect on the hardest moment of the past 26 days. Write down what got you through it. That's your personal relapse prevention strategy."
      },
      {
        day: 27,
        phase: "Consolidation",
        tip: "Your sense of smell is now significantly sharper. Many ex-smokers are surprised by how much they were missing. The world literally smells different now.",
        action: "Go somewhere with pleasant scents: a garden, a bakery, a forest path. Breathe deeply and appreciate what you've regained."
      },
      {
        day: 28,
        phase: "Consolidation",
        tip: "Anger and grief about lost years of smoking are normal. Don't dwell on regret. Every day smoke-free is adding years back to your life expectancy.",
        action: "Write a short goodbye letter to cigarettes. Acknowledge what they were to you, then firmly close that chapter."
      },
      {
        day: 29,
        phase: "Consolidation",
        tip: "Your blood pressure and resting heart rate have improved. Your cardiovascular system is functioning more efficiently than it has in a long time.",
        action: "Check your resting heart rate. If you have an older measurement, compare them. If not, save today's as your new baseline."
      },
      {
        day: 30,
        phase: "Consolidation",
        tip: "Thirty days smoke-free. Your lung function has improved by up to 30%. Your risk of heart disease is already dropping. You are physically a different person than you were a month ago.",
        action: "Celebrate this milestone. Tell someone who supported you. Then set your next goal: 60 days, 90 days, or a full year. The hardest part is behind you."
      }
    ]
  },

  alcohol: {
    title: "30-Day Alcohol-Free Program",
    description: "A structured daily guide through the social, physical, and emotional challenges of living without alcohol.",
    days: [
      // === ACUTE PHASE (Days 1-7) ===
      {
        day: 1,
        phase: "Acute Phase",
        tip: "The first 48-72 hours can bring anxiety, restlessness, and sweating. If you were a heavy daily drinker, monitor for severe symptoms and seek medical advice if needed.",
        action: "Remove all alcohol from your home. Replace it with sparkling water, herbal tea, and your favorite non-alcoholic beverages."
      },
      {
        day: 2,
        phase: "Acute Phase",
        tip: "Use the HALT check whenever you feel a craving: are you Hungry, Angry, Lonely, or Tired? Address the root cause instead of reaching for a drink.",
        action: "Set 4 alarms throughout the day labeled 'HALT Check.' When they go off, honestly assess which of the four states you're in and address it directly."
      },
      {
        day: 3,
        phase: "Acute Phase",
        tip: "Your sleep may actually get worse before it gets better. Alcohol suppresses REM sleep, and your brain is now trying to catch up. Expect vivid dreams and restless nights for 1-2 weeks.",
        action: "Establish a strict bedtime routine: no screens 30 minutes before bed, dim lights, herbal tea, and keep your room cool. Your sleep will normalize."
      },
      {
        day: 4,
        phase: "Acute Phase",
        tip: "Dehydration from alcohol takes days to fully reverse. Your kidneys are working hard to rebalance your electrolytes. Help them out.",
        action: "Drink at least 8 glasses of water today. Add a pinch of salt and squeeze of lemon to a few of them for electrolyte support."
      },
      {
        day: 5,
        phase: "Acute Phase",
        tip: "Sugar cravings are extremely common when quitting alcohol. Your body is used to getting easy calories from ethanol and is looking for a substitute. This is temporary.",
        action: "Keep healthy sweet snacks on hand: fruit, dark chocolate, or yogurt with honey. Don't fight the sweet tooth too hard this week."
      },
      {
        day: 6,
        phase: "Acute Phase",
        tip: "Your liver is already beginning to shed excess fat. It is one of the most regenerative organs in the body. Even a week of sobriety creates measurable liver improvement.",
        action: "Eat a liver-friendly meal today: leafy greens, lean protein, garlic, and foods rich in B vitamins. Avoid excessive sugar and processed food."
      },
      {
        day: 7,
        phase: "Acute Phase",
        tip: "One week done. The acute physical withdrawal phase is ending. Your blood sugar is stabilizing and your stomach lining is beginning to heal.",
        action: "Do a HALT check right now. Then write down the three hardest moments of this week and what you did instead of drinking."
      },
      // === ADJUSTMENT (Days 8-14) ===
      {
        day: 8,
        phase: "Adjustment",
        tip: "Social pressure is the number one relapse trigger. Having a plan for social situations is essential. Deciding in the moment is too late.",
        action: "Choose your go-to non-alcoholic drink order and practice saying it confidently. 'Club soda with lime' or 'tonic with bitters' work well."
      },
      {
        day: 9,
        phase: "Adjustment",
        tip: "You may notice emotions feel raw and amplified. Alcohol numbed your emotional responses for a long time. Feeling things fully again is uncomfortable but healthy.",
        action: "Journal for 10 minutes about how you're feeling today. No filter, no structure. Just get the emotions onto paper."
      },
      {
        day: 10,
        phase: "Adjustment",
        tip: "Your sleep is starting to improve. REM rebound is settling down. You may notice you're dreaming more vividly, which is a sign your brain is recovering its natural sleep architecture.",
        action: "Rate your sleep quality from 1-10 this morning. Start tracking it daily. You'll see the upward trend over the next few weeks."
      },
      {
        day: 11,
        phase: "Adjustment",
        tip: "Boredom is a hidden trigger. Alcohol filled time and created artificial excitement. Learning to sit with ordinary moments is a real skill that takes practice.",
        action: "Make a list of 10 activities you can do instead of drinking when boredom hits. Try at least one new one today."
      },
      {
        day: 12,
        phase: "Adjustment",
        tip: "Your skin and complexion are improving. Alcohol is a diuretic that dehydrates skin cells. Hydration is restoring elasticity and reducing puffiness.",
        action: "Take a photo of your face today. Compare it with one from two weeks ago. The reduction in bloating and redness is often striking."
      },
      {
        day: 13,
        phase: "Adjustment",
        tip: "If your social circle revolves around drinking, you may need to temporarily adjust who you spend time with. This isn't permanent, but protecting your early sobriety is critical.",
        action: "Reach out to a friend who doesn't drink much and make plans to do something together that doesn't involve alcohol."
      },
      {
        day: 14,
        phase: "Adjustment",
        tip: "Two weeks sober. Your liver fat can be reduced by up to 15% in this time. Your stomach acid production is normalizing. Digestion is improving.",
        action: "Calculate how much money you've saved by not drinking for 14 days. Plan something meaningful to do with it."
      },
      // === BUILDING MOMENTUM (Days 15-21) ===
      {
        day: 15,
        phase: "Building Momentum",
        tip: "The 'pink cloud' phase may arrive: a rush of optimism and energy. Enjoy it, but stay grounded. Overconfidence can lead to underestimating triggers.",
        action: "While you're feeling good, prepare for a harder day. Write down your top 5 reasons for staying sober and keep them accessible."
      },
      {
        day: 16,
        phase: "Building Momentum",
        tip: "Your cognitive function is improving. Alcohol impairs memory formation and executive function. You may notice sharper thinking and better recall.",
        action: "Try a mentally demanding task you've been putting off: a complex work project, learning something new, or a strategic game. Notice your clarity."
      },
      {
        day: 17,
        phase: "Building Momentum",
        tip: "Weekends can still be tricky. The association between free time and drinking is deeply wired. New rituals need to replace old ones.",
        action: "Plan your next weekend hour by hour. Fill drinking times with specific activities: morning hike, afternoon cooking, evening movie or game night."
      },
      {
        day: 18,
        phase: "Building Momentum",
        tip: "Your blood pressure is likely lower than it was three weeks ago. Alcohol raises blood pressure both acutely and chronically. Your cardiovascular system is thanking you.",
        action: "If you have access to a blood pressure monitor, take a reading. If not, notice how your resting heart rate has calmed."
      },
      {
        day: 19,
        phase: "Building Momentum",
        tip: "Romantic situations and dating can be anxiety triggers without liquid courage. Learning to be socially present without alcohol is genuinely courageous.",
        action: "Practice being fully present in one social interaction today. Make eye contact, listen actively, and notice that you don't need alcohol to connect."
      },
      {
        day: 20,
        phase: "Building Momentum",
        tip: "Your immune system is strengthening. Alcohol suppresses immune cell production and weakens your body's defenses. You're now more resistant to illness.",
        action: "Support your recovery with a nutrient-dense meal: salmon or legumes, colorful vegetables, and whole grains. Feed your healing body well."
      },
      {
        day: 21,
        phase: "Building Momentum",
        tip: "Three weeks. Research shows this is when the brain's reward pathways start finding satisfaction in natural pleasures again. Food, exercise, and social connection begin to feel more rewarding.",
        action: "Do something that gives you a natural dopamine boost: exercise, cook a great meal, or have a deep conversation with someone you care about."
      },
      // === CONSOLIDATION (Days 22-30) ===
      {
        day: 22,
        phase: "Consolidation",
        tip: "Start reframing your identity. You're not 'depriving' yourself of alcohol. You're choosing clarity, health, and presence. This is addition by subtraction.",
        action: "When someone asks about drinking, try saying 'I don't drink' instead of 'I'm not drinking right now.' Notice the power of a present-tense identity statement."
      },
      {
        day: 23,
        phase: "Consolidation",
        tip: "Grief for your old social identity is normal. Alcohol was likely part of your persona. Letting go of that version of yourself is a real loss, even if it's a net positive.",
        action: "Write about who you were as a drinker and who you're becoming without it. Acknowledge both versions with honesty."
      },
      {
        day: 24,
        phase: "Consolidation",
        tip: "Your gut microbiome is rebalancing. Alcohol devastates beneficial bacteria. You may notice improved digestion, less bloating, and more regular bowel movements.",
        action: "Add a probiotic food to your diet today: yogurt, kimchi, sauerkraut, or kombucha. Support the gut bacteria that are finally recovering."
      },
      {
        day: 25,
        phase: "Consolidation",
        tip: "Post-acute withdrawal symptoms (PAWS) can include random anxiety or low mood weeks after quitting. They're temporary neurological adjustments, not reasons to drink.",
        action: "If you hit an unexplained low mood today, label it: 'This is PAWS. It will pass. It's not a reason to drink.' Then do something physical."
      },
      {
        day: 26,
        phase: "Consolidation",
        tip: "Your weight may be shifting. Alcohol carries significant empty calories and disrupts fat metabolism. Many people lose noticeable weight in the first month.",
        action: "Try on clothes that felt tight a month ago. Even if the scale hasn't moved much, body composition changes are often visible."
      },
      {
        day: 27,
        phase: "Consolidation",
        tip: "Build a sober toolkit for the long term. Recovery is not a 30-day event. The habits and strategies you're building now need to become permanent infrastructure.",
        action: "Identify your three most effective coping strategies from this month. Write them down as your personal 'emergency protocol' for future cravings."
      },
      {
        day: 28,
        phase: "Consolidation",
        tip: "Your relationships are likely clearer. Without alcohol blurring boundaries and fueling arguments, you can see which connections are genuine and which were drinking partnerships.",
        action: "Reach out to someone you may have hurt or neglected during your drinking. A simple honest message can begin real repair."
      },
      {
        day: 29,
        phase: "Consolidation",
        tip: "Your mornings are different now. No hangovers, no anxiety about what you said last night, no lost time. This is what freedom feels like.",
        action: "Wake up tomorrow and spend the first 10 minutes appreciating the clarity. No headache, no nausea, no regret. Let that feeling motivate your next 30 days."
      },
      {
        day: 30,
        phase: "Consolidation",
        tip: "Thirty days alcohol-free. Your liver enzymes are normalizing, your sleep architecture is restored, and your brain chemistry is rebalancing. You've proven you can do this.",
        action: "Celebrate with intention: a great meal, an experience you've wanted, or time with people who support you. Then decide your next milestone."
      }
    ]
  },

  junkfood: {
    title: "30-Day Clean Eating Reset",
    description: "A practical daily guide to breaking the junk food cycle by stabilizing blood sugar, retraining your palate, and building sustainable eating habits.",
    days: [
      // === ACUTE PHASE (Days 1-7) ===
      {
        day: 1,
        phase: "Acute Phase",
        tip: "Ultra-processed foods are engineered to hijack your brain's reward system with precise combinations of sugar, salt, and fat. Withdrawal from these is real and can include headaches and irritability.",
        action: "Clear your pantry of the top 3 junk foods you reach for most. If it's not in the house, you have to make a deliberate trip to get it."
      },
      {
        day: 2,
        phase: "Acute Phase",
        tip: "Blood sugar crashes are the main driver of junk food cravings. When blood sugar drops, your brain screams for the fastest fix: refined carbs and sugar. Stable blood sugar means fewer cravings.",
        action: "Eat a breakfast with protein and healthy fat within an hour of waking: eggs, Greek yogurt with nuts, or avocado toast on whole grain bread."
      },
      {
        day: 3,
        phase: "Acute Phase",
        tip: "Cravings for sugar and salt are most intense in the first 3-5 days. Your taste receptors are calibrated to hyperpalatable food and need time to reset. This will pass.",
        action: "When a craving hits, eat a piece of fruit with a handful of nuts first. Wait 15 minutes. The craving will often dissolve once blood sugar stabilizes."
      },
      {
        day: 4,
        phase: "Acute Phase",
        tip: "Emotional eating accounts for a large portion of junk food consumption. Boredom, stress, loneliness, and sadness all trigger the urge to eat for comfort rather than hunger.",
        action: "Before eating anything today, pause and ask: 'Am I physically hungry, or am I trying to change how I feel?' Write down what you discover."
      },
      {
        day: 5,
        phase: "Acute Phase",
        tip: "Meal prep is your strongest weapon. Decisions made when you're calm and full are vastly better than decisions made when you're hungry and stressed.",
        action: "Spend 30 minutes preparing snacks for the next 3 days: cut vegetables, portion nuts, boil eggs, or make overnight oats."
      },
      {
        day: 6,
        phase: "Acute Phase",
        tip: "Reading nutrition labels reveals how much hidden sugar and sodium is in 'healthy' packaged foods. Many granola bars have as much sugar as a candy bar.",
        action: "Check the labels on 3 foods in your kitchen that you thought were healthy. Look at sugar (in grams) and ingredient lists. Anything with sugar in the first 3 ingredients is candy in disguise."
      },
      {
        day: 7,
        phase: "Acute Phase",
        tip: "One week in. Your blood sugar swings are starting to smooth out. The desperate urgency of cravings is beginning to soften. Your gut bacteria are already shifting toward healthier populations.",
        action: "Cook a full meal from scratch today using whole ingredients: a protein, a vegetable, and a complex carbohydrate. Notice how satisfying real food is becoming."
      },
      // === ADJUSTMENT (Days 8-14) ===
      {
        day: 8,
        phase: "Adjustment",
        tip: "Your taste buds regenerate every 10-14 days. By the end of next week, you'll literally have new taste receptors that aren't desensitized by excessive sugar and salt.",
        action: "Eat something simple and whole today: a ripe tomato with salt, a crisp apple, or plain roasted vegetables. Pay attention to the flavors. They're getting louder."
      },
      {
        day: 9,
        phase: "Adjustment",
        tip: "The afternoon energy crash is often caused by a high-carb lunch followed by an insulin spike and crash. Protein and fiber at lunch keep you steady through the afternoon.",
        action: "Make sure your lunch today includes at least 20g of protein and a serving of vegetables. Skip the white bread and sugary drinks."
      },
      {
        day: 10,
        phase: "Adjustment",
        tip: "Social eating is a major challenge. Offices, parties, and gatherings are minefields of processed food. Having a strategy prevents impulsive choices.",
        action: "Eat a solid meal or snack before your next social event. Arriving full makes it far easier to decline the pizza and donuts."
      },
      {
        day: 11,
        phase: "Adjustment",
        tip: "Hydration is often confused with hunger. Many cravings are actually thirst signals that your brain misinterprets. Drinking water before eating can reduce calorie intake significantly.",
        action: "Drink a full glass of water every time you feel a craving. Wait 10 minutes. If you're still hungry, eat something whole and nutritious."
      },
      {
        day: 12,
        phase: "Adjustment",
        tip: "Your digestion is improving. Whole foods provide fiber that feeds beneficial gut bacteria. You may notice less bloating, more regularity, and reduced gas compared to your processed food days.",
        action: "Add a high-fiber food you don't normally eat: lentils, black beans, broccoli, or chia seeds. Your gut microbiome is rebuilding and needs the fuel."
      },
      {
        day: 13,
        phase: "Adjustment",
        tip: "Late-night eating is often the last habit to break. It's driven by routine and tiredness more than hunger. Your willpower is lowest at the end of the day.",
        action: "Set a kitchen closing time tonight. Brush your teeth after your last meal. The mint flavor signals 'done eating' to your brain."
      },
      {
        day: 14,
        phase: "Adjustment",
        tip: "Two weeks. Your taste buds have substantially regenerated. Foods that tasted bland on day 1 are now more flavorful. Your palate is recalibrating to appreciate real food.",
        action: "Retry a whole food you thought was boring two weeks ago: plain oatmeal, unsweetened yogurt, or raw vegetables. Notice how your perception has shifted."
      },
      // === BUILDING MOMENTUM (Days 15-21) ===
      {
        day: 15,
        phase: "Building Momentum",
        tip: "Cravings are now more about habit and emotion than physical need. When they arise, they're information about your emotional state, not commands you must obey.",
        action: "Track your cravings today with a simple log: time, what you craved, and what was happening emotionally. Patterns will emerge."
      },
      {
        day: 16,
        phase: "Building Momentum",
        tip: "Building a rotation of go-to meals eliminates the 'what should I eat' paralysis that leads to ordering takeout. You need about 5-7 reliable meals to sustain a clean diet indefinitely.",
        action: "Write down your 5 favorite healthy meals from the past two weeks. These are your core rotation. Grocery shop for next week based on this list."
      },
      {
        day: 17,
        phase: "Building Momentum",
        tip: "Your energy levels should be more stable throughout the day. Without blood sugar rollercoasters, you're avoiding the spikes and crashes that made you reach for quick fixes.",
        action: "Notice your energy at 3 PM today. Compare it to how you felt at 3 PM two weeks ago. Stable energy is one of the first rewards of clean eating."
      },
      {
        day: 18,
        phase: "Building Momentum",
        tip: "Perfection is the enemy of consistency. If you eat something processed, that's one meal out of the 42+ meals you've eaten in 14 days. It doesn't erase your progress.",
        action: "If you've had any 'slip' moments, write down what triggered them and what you'd do differently. Then move on. No guilt spirals."
      },
      {
        day: 19,
        phase: "Building Momentum",
        tip: "Restaurants and delivery apps use the same hyperpalatable formulas as packaged food. Cooking at home gives you control over ingredients, portions, and your relationship with food.",
        action: "Try a new recipe today that excites you. Cooking should feel creative, not restrictive. Find a dish that makes clean eating feel like a choice, not a punishment."
      },
      {
        day: 20,
        phase: "Building Momentum",
        tip: "Your inflammatory markers are likely decreasing. Processed foods drive chronic low-grade inflammation linked to joint pain, skin issues, and fatigue. Clean eating is anti-inflammatory by default.",
        action: "Notice changes in your body beyond weight: skin clarity, joint comfort, digestion, and energy. Write down three physical improvements you've observed."
      },
      {
        day: 21,
        phase: "Building Momentum",
        tip: "Three weeks. You've proven that cravings are not commands. Your gut microbiome has significantly shifted. The bacteria that thrived on sugar are declining, and the ones that thrive on fiber are multiplying.",
        action: "Cook a meal for someone else using your new skills. Sharing healthy food reinforces your identity as someone who eats well."
      },
      // === CONSOLIDATION (Days 22-30) ===
      {
        day: 22,
        phase: "Consolidation",
        tip: "Start building long-term systems: a weekly meal prep day, a go-to grocery list, and a few reliable recipes. Habits beat willpower over any meaningful timeframe.",
        action: "Choose one day this week as your meal prep day. Spend 1-2 hours preparing lunches and snacks for the week ahead."
      },
      {
        day: 23,
        phase: "Consolidation",
        tip: "Mindful eating is a powerful long-term tool. Eating slowly, without screens, and actually tasting your food leads to natural portion control and greater satisfaction.",
        action: "Eat one meal today with no phone, no TV, and no reading. Chew slowly. Put your fork down between bites. Notice when you feel satisfied, not stuffed."
      },
      {
        day: 24,
        phase: "Consolidation",
        tip: "Understanding the food industry's tactics helps you stay free. 'Low fat' usually means high sugar. 'Natural flavors' is a meaningless label. Marketing is designed to deceive.",
        action: "Next time you're at a store, spend 5 minutes comparing labels on a 'health food' product and its regular counterpart. Learn to see through the marketing."
      },
      {
        day: 25,
        phase: "Consolidation",
        tip: "Your relationship with food is evolving. Food is becoming fuel and pleasure rather than medication and escape. This shift in relationship matters more than any specific diet rule.",
        action: "Reflect on how your emotional connection to food has changed. Are you eating to nourish or to numb? Write a brief note about where you are now."
      },
      {
        day: 26,
        phase: "Consolidation",
        tip: "Treats and indulgences are part of a healthy life. The goal isn't perfection; it's removing the compulsive, automatic nature of junk food consumption.",
        action: "Plan a conscious treat for this week: something you genuinely enjoy, eaten slowly and with full attention. This is what a healthy relationship with indulgence looks like."
      },
      {
        day: 27,
        phase: "Consolidation",
        tip: "Your grocery cart tells the story of your health. If you win the battle at the store, the kitchen takes care of itself. Never shop hungry or without a list.",
        action: "Do your next grocery shop with a written list and a full stomach. Stick to the perimeter of the store where whole foods live."
      },
      {
        day: 28,
        phase: "Consolidation",
        tip: "Environmental design matters more than willpower. Keep healthy food visible and accessible. Keep junk food out of the house entirely or in hard-to-reach places.",
        action: "Reorganize your kitchen: put fruit on the counter, vegetables at eye level in the fridge, and healthy snacks in the front of the pantry."
      },
      {
        day: 29,
        phase: "Consolidation",
        tip: "Your body composition is changing even if the scale doesn't show it. Reduced inflammation, better hydration, and improved gut health alter how your body looks and feels.",
        action: "Try on an outfit you haven't worn in a while. Notice how your body feels different. Not just thinner, but less puffy, more energetic, more alive."
      },
      {
        day: 30,
        phase: "Consolidation",
        tip: "Thirty days of clean eating. Your taste buds are recalibrated, your blood sugar is stable, and your gut microbiome has transformed. You've built a foundation that can last a lifetime.",
        action: "Write down the version of yourself you want to be in 6 months. Then identify the 3 daily habits from this month that will get you there. Keep going."
      }
    ]
  },

  social_media: {
    title: "30-Day Digital Detox Program",
    description: "A structured guide to breaking compulsive scrolling habits, resetting your dopamine system, and reclaiming your attention for what matters.",
    days: [
      // === ACUTE PHASE (Days 1-7) ===
      {
        day: 1,
        phase: "Acute Phase",
        tip: "Social media apps are designed by teams of engineers to maximize time-on-app using variable reward schedules, the same mechanism that makes slot machines addictive. You're not weak; the product is engineered to be irresistible.",
        action: "Delete social media apps from your phone. Don't just log out; delete them. You can still access them from a browser if absolutely necessary, but the friction matters enormously."
      },
      {
        day: 2,
        phase: "Acute Phase",
        tip: "The first 48 hours are when 'phantom scrolling' is worst. You'll reach for your phone reflexively, unlock it, and stare at the screen with nothing to scroll. This is the habit loop firing without a reward.",
        action: "Set your phone to grayscale mode (accessibility settings). Color is a major engagement driver. A gray phone is a boring phone, and that's the point."
      },
      {
        day: 3,
        phase: "Acute Phase",
        tip: "Boredom will feel almost unbearable at first. Your brain's dopamine baseline has been artificially elevated by constant novelty. Sitting with nothing to do feels wrong because your reward system is recalibrating.",
        action: "When boredom hits today, set a timer for 5 minutes and do absolutely nothing. No phone, no book, no music. Practice tolerating the discomfort. It gets easier."
      },
      {
        day: 4,
        phase: "Acute Phase",
        tip: "FOMO (Fear of Missing Out) is a manufactured emotion. Social media creates the illusion that important things are constantly happening without you. In reality, you're missing curated highlight reels, not real life.",
        action: "Text or call one friend directly instead of checking their social media. A real 5-minute conversation provides more connection than an hour of scrolling their posts."
      },
      {
        day: 5,
        phase: "Acute Phase",
        tip: "Your attention span has been fragmented by constant switching between short-form content. The average social media session trains your brain to expect new stimulation every few seconds.",
        action: "Read a physical book or long article for 20 uninterrupted minutes. If your mind wanders, gently bring it back. You're rebuilding your attention muscle."
      },
      {
        day: 6,
        phase: "Acute Phase",
        tip: "Notifications are interruption machines. Each one pulls you out of whatever you're doing and fragments your focus. Even seeing a notification without acting on it reduces cognitive performance.",
        action: "Turn off ALL non-essential notifications on your phone. Keep calls, texts, and calendar alerts. Disable everything else: news, email, and any remaining app notifications."
      },
      {
        day: 7,
        phase: "Acute Phase",
        tip: "One week without compulsive scrolling. You've probably noticed chunks of time you didn't know you had. The average person spends 2-4 hours daily on social media. That's 14-28 hours you've reclaimed this week.",
        action: "Check your screen time stats for this week. Compare it to last week or your average. Write down what you did with the extra time."
      },
      // === ADJUSTMENT (Days 8-14) ===
      {
        day: 8,
        phase: "Adjustment",
        tip: "Your dopamine system is resetting. Activities that felt 'boring' compared to scrolling (cooking, walking, reading) are starting to feel more engaging. This is your reward baseline normalizing.",
        action: "Do an activity you used to enjoy before social media took over: drawing, playing an instrument, building something, or going for a walk without headphones."
      },
      {
        day: 9,
        phase: "Adjustment",
        tip: "News anxiety and doomscrolling create a stress cycle: you scroll to feel informed, but the constant negativity raises your cortisol, which makes you scroll more for resolution that never comes.",
        action: "If you need news, set a specific 10-minute window once per day. Use a single trusted source. Read it, then close it. No comment sections, no rabbit holes."
      },
      {
        day: 10,
        phase: "Adjustment",
        tip: "Comparison is the thief of joy, and social media is a comparison engine. Without the constant feed of other people's curated highlights, your self-perception starts to stabilize.",
        action: "Write down 3 things you're genuinely proud of or grateful for in your own life. Not performative gratitude; real things that matter to you."
      },
      {
        day: 11,
        phase: "Adjustment",
        tip: "Your phone should be a tool, not a slot machine. Reorganize it so that opening your phone leads to useful actions rather than mindless consumption.",
        action: "Rearrange your home screen: put only utility apps on the first page (maps, camera, calendar, notes). Move any remaining social or entertainment apps to the last page or a folder."
      },
      {
        day: 12,
        phase: "Adjustment",
        tip: "Sleep quality improves significantly without pre-bed scrolling. Blue light suppresses melatonin, but more importantly, emotionally activating content raises cortisol right when you need to wind down.",
        action: "Establish a phone-free zone for the last hour before bed. Charge your phone outside your bedroom. Use a physical alarm clock if needed."
      },
      {
        day: 13,
        phase: "Adjustment",
        tip: "Social media creates an illusion of connection while often increasing loneliness. Real connection requires presence, vulnerability, and reciprocity, none of which happen through likes and comments.",
        action: "Have a face-to-face conversation or a phone call lasting at least 15 minutes today. No texting, no voice notes. Real-time human connection."
      },
      {
        day: 14,
        phase: "Adjustment",
        tip: "Two weeks. Your brain's dopamine receptors are upregulating, meaning you need less stimulation to feel the same level of engagement. Simple pleasures are becoming genuinely pleasurable again.",
        action: "Do something simple that would have bored you two weeks ago: sit in a park, people-watch, or listen to a full album. Notice how your capacity for presence has grown."
      },
      // === BUILDING MOMENTUM (Days 15-21) ===
      {
        day: 15,
        phase: "Building Momentum",
        tip: "You may start rationalizing a return: 'I'll just check once a day' or 'I need it for work.' These are the addiction talking. If you truly need it for work, use a desktop browser during work hours only.",
        action: "Write down every reason your brain has generated for going back. Next to each one, write the honest counter-argument. Keep this list for when the rationalizations return."
      },
      {
        day: 16,
        phase: "Building Momentum",
        tip: "Creative output increases when you stop consuming compulsively. Your brain, freed from constant input, starts generating its own ideas. Many people report a surge in creativity around week 3.",
        action: "Start a small creative project today: write something, sketch something, build something, or plan something. Use the mental space you've reclaimed."
      },
      {
        day: 17,
        phase: "Building Momentum",
        tip: "Your ability to focus for extended periods is returning. Deep work, the kind that produces your best output, requires sustained attention that social media systematically destroys.",
        action: "Block out 45 minutes for focused work with no interruptions. No phone in the room. When you finish, notice how productive the session was."
      },
      {
        day: 18,
        phase: "Building Momentum",
        tip: "Physical spaces affect digital habits. If you always scrolled on the couch, your brain associates that location with scrolling. Changing your environment can break spatial triggers.",
        action: "Rearrange your primary scrolling spot: move the couch, sit in a different chair, or change the room's layout. Break the environmental trigger."
      },
      {
        day: 19,
        phase: "Building Momentum",
        tip: "You're building tolerance for uncertainty. Social media creates an illusion of omniscience, knowing what everyone thinks and does. Accepting that you don't need to know everything is deeply freeing.",
        action: "Practice saying 'I don't know what's happening online and that's fine.' Sit with the slight discomfort. Notice that nothing bad happens."
      },
      {
        day: 20,
        phase: "Building Momentum",
        tip: "Your relationships are shifting. Without the parasocial illusion of connection, you're investing in fewer, deeper relationships. Quality is replacing quantity.",
        action: "Make plans with someone for this week that involve being fully present together: a meal, a walk, a game night. No phones on the table."
      },
      {
        day: 21,
        phase: "Building Momentum",
        tip: "Three weeks. Your brain has substantially adapted to lower levels of digital stimulation. The compulsive urge to check has faded into occasional thoughts that pass quickly.",
        action: "Reflect on what you've done with your reclaimed time over three weeks. Make a list. You'll be surprised by how much life fits into the space scrolling used to occupy."
      },
      // === CONSOLIDATION (Days 22-30) ===
      {
        day: 22,
        phase: "Consolidation",
        tip: "If you decide to return to any platform after this program, do it intentionally. Set strict time limits, follow only accounts that genuinely add value, and use the platform; don't let it use you.",
        action: "Write your personal rules for technology use going forward. How much time per day? Which platforms? When? These boundaries are your long-term defense."
      },
      {
        day: 23,
        phase: "Consolidation",
        tip: "Your self-esteem has likely improved without the constant comparison engine. Research consistently shows a correlation between social media use and anxiety, depression, and body image issues.",
        action: "Rate your overall mood and self-confidence today from 1-10. Compare it honestly to how you felt a month ago. The numbers tell the story."
      },
      {
        day: 24,
        phase: "Consolidation",
        tip: "Analog activities you've rediscovered need to become fixtures in your weekly routine. If you don't schedule them, the digital vacuum will reassert itself.",
        action: "Pick 3 analog activities from this month that you enjoyed and schedule them as recurring weekly events. Put them in your calendar like appointments."
      },
      {
        day: 25,
        phase: "Consolidation",
        tip: "Your attention is now your most valuable asset. Protect it like you would protect your money. Every app, notification, and platform is competing for it. Be intentional about who gets access.",
        action: "Audit every app on your phone. For each one, ask: 'Does this serve me, or do I serve it?' Delete anything that fails the test."
      },
      {
        day: 26,
        phase: "Consolidation",
        tip: "Boredom is no longer your enemy; it's your creative fuel. The moments when your mind wanders are when your best ideas emerge. Protect your idle time.",
        action: "Leave your phone at home for a short errand or walk. Experience being unreachable and unstimulated for 30 minutes. This used to be normal life."
      },
      {
        day: 27,
        phase: "Consolidation",
        tip: "The people who matter will still be in your life without social media. If the only connection you have with someone is liking their posts, that wasn't really a connection.",
        action: "Send a personal message to 3 people you lost touch with during the detox. Real relationships survive platform changes."
      },
      {
        day: 28,
        phase: "Consolidation",
        tip: "Your memory and recall are improving. Constant information input without processing prevents memory consolidation. Your brain now has space to encode and store experiences properly.",
        action: "Try to recall specific details from the past week without checking photos or messages. Notice how much more present and vivid your memories have become."
      },
      {
        day: 29,
        phase: "Consolidation",
        tip: "You have demonstrated that you control your technology, not the other way around. This self-knowledge is more valuable than any content you could have consumed in 30 days of scrolling.",
        action: "Write a message to yourself from 30 days ago. What would you tell that version of you who was about to start this journey? Keep it somewhere safe."
      },
      {
        day: 30,
        phase: "Consolidation",
        tip: "Thirty days free from compulsive scrolling. Your dopamine baseline has normalized, your attention span has expanded, and you've reclaimed roughly 60-120 hours of your life. That time became real experiences, real conversations, and real growth.",
        action: "Decide your path forward: stay off entirely, return with strict boundaries, or keep certain platforms and delete others. Whatever you choose, you're choosing from a position of strength, not compulsion."
      }
    ]
  }
};

/**
 * Returns the program day object for a given tracker and day number.
 * @param {string} trackerId - One of: smoking, alcohol, junkfood, social_media
 * @param {number} dayNumber - Day number (1-30)
 * @returns {object|null} The day object, or null if tracker or day is invalid
 */
export function getProgramDay(trackerId, dayNumber) {
  const program = FORGE_PROGRAMS[trackerId];
  if (!program) return null;

  const day = program.days.find((d) => d.day === dayNumber);
  return day || null;
}

export { FORGE_PROGRAMS };
export default FORGE_PROGRAMS;
