const beginnerCalisthenics = {
  id: "beginner-calisthenics",
  title: "Beginner Calisthenics",
  subtitle: "Master your bodyweight in 8 weeks",
  icon: "\u{1F938}",
  duration: "8 weeks",
  frequency: "3x/week",
  level: "Beginner",
  description:
    "Build a solid foundation of bodyweight strength. You'll progress from assisted variations to full movements, developing pushing, pulling, squatting, and core stability along the way.",
  weeks: [
    {
      week: 1,
      focus: "Foundation",
      days: [
        {
          day: 1,
          title: "Full Body A",
          exercises: [
            { name: "Wall Push-Ups", sets: 3, reps: "15", rest: "60s", cue: "Chest to wall, elbows 45\u00B0" },
            { name: "Chair-Assisted Squats", sets: 3, reps: "12", rest: "60s", cue: "Sit back onto chair, stand without rocking forward" },
            { name: "Inverted Rows (table)", sets: 3, reps: "10", rest: "60s", cue: "Body straight, pull chest to table edge" },
            { name: "Dead Hang", sets: 3, reps: "15s hold", rest: "45s", cue: "Relax shoulders down, grip tight" },
            { name: "Knee Plank", sets: 3, reps: "20s hold", rest: "45s", cue: "Hips level with shoulders, squeeze glutes" },
          ],
        },
        {
          day: 2,
          title: "Full Body B",
          exercises: [
            { name: "Incline Push-Ups (counter)", sets: 3, reps: "12", rest: "60s", cue: "Lower chest to edge, full lockout at top" },
            { name: "Glute Bridges", sets: 3, reps: "15", rest: "45s", cue: "Drive through heels, squeeze glutes at top" },
            { name: "Doorway Rows", sets: 3, reps: "10", rest: "60s", cue: "Lean back, pull chest to door frame" },
            { name: "Bird Dogs", sets: 3, reps: "8 each side", rest: "45s", cue: "Extend opposite arm and leg, keep hips square" },
            { name: "Side Plank (knees)", sets: 2, reps: "15s each side", rest: "45s", cue: "Stack hips, keep top hip from dropping" },
          ],
        },
        {
          day: 3,
          title: "Full Body C",
          exercises: [
            { name: "Wall Push-Ups", sets: 3, reps: "18", rest: "60s", cue: "Control the descent for 2 seconds" },
            { name: "Chair-Assisted Squats", sets: 3, reps: "15", rest: "60s", cue: "Hover above seat before standing" },
            { name: "Inverted Rows (table)", sets: 3, reps: "12", rest: "60s", cue: "Squeeze shoulder blades together at top" },
            { name: "Knee Plank", sets: 3, reps: "25s hold", rest: "45s", cue: "Breathe steadily, brace core" },
            { name: "Lying Leg Raises", sets: 3, reps: "10", rest: "45s", cue: "Press lower back into floor, lower legs slowly" },
          ],
        },
      ],
    },
    {
      week: 4,
      focus: "Building Strength",
      days: [
        {
          day: 1,
          title: "Push & Core",
          exercises: [
            { name: "Knee Push-Ups", sets: 3, reps: "12", rest: "60s", cue: "Chest to floor, elbows track back at 45\u00B0" },
            { name: "Diamond Knee Push-Ups", sets: 2, reps: "8", rest: "60s", cue: "Hands together under chest, flare elbows less" },
            { name: "Plank", sets: 3, reps: "30s hold", rest: "60s", cue: "Straight line from head to heels, no sagging" },
            { name: "Mountain Climbers", sets: 3, reps: "20 total", rest: "45s", cue: "Drive knees to chest, keep hips level" },
            { name: "Superman Hold", sets: 3, reps: "15s hold", rest: "45s", cue: "Lift arms and legs simultaneously, squeeze back" },
          ],
        },
        {
          day: 2,
          title: "Legs & Pull",
          exercises: [
            { name: "Bodyweight Squats", sets: 4, reps: "15", rest: "60s", cue: "Thighs parallel, weight in heels" },
            { name: "Reverse Lunges", sets: 3, reps: "10 each leg", rest: "60s", cue: "Step back, both knees at 90\u00B0" },
            { name: "Inverted Rows (low bar)", sets: 3, reps: "10", rest: "60s", cue: "Walk feet forward to increase difficulty" },
            { name: "Calf Raises", sets: 3, reps: "20", rest: "30s", cue: "Full range of motion, pause at top" },
            { name: "Glute Bridges", sets: 3, reps: "15", rest: "45s", cue: "Hold top for 2 seconds each rep" },
          ],
        },
        {
          day: 3,
          title: "Full Body",
          exercises: [
            { name: "Knee Push-Ups", sets: 4, reps: "12", rest: "60s", cue: "Slow 3-second lowering phase" },
            { name: "Bulgarian Split Squats (chair)", sets: 3, reps: "8 each leg", rest: "60s", cue: "Rear foot on chair, front knee tracks over toes" },
            { name: "Inverted Rows (low bar)", sets: 3, reps: "12", rest: "60s", cue: "Pause 1 second at top, control descent" },
            { name: "Plank Shoulder Taps", sets: 3, reps: "16 total", rest: "60s", cue: "Tap opposite shoulder without rocking hips" },
            { name: "Dead Hang", sets: 3, reps: "25s hold", rest: "45s", cue: "Active shoulders, pull shoulder blades down" },
          ],
        },
      ],
    },
    {
      week: 8,
      focus: "Putting It All Together",
      days: [
        {
          day: 1,
          title: "Push & Core",
          exercises: [
            { name: "Full Push-Ups", sets: 4, reps: "12", rest: "60s", cue: "Chest an inch from floor, full lockout" },
            { name: "Diamond Push-Ups", sets: 3, reps: "8", rest: "60s", cue: "Elbows tight to body, hands under sternum" },
            { name: "Pike Push-Ups", sets: 3, reps: "8", rest: "60s", cue: "Hips high, head between arms, lower forehead to floor" },
            { name: "Plank", sets: 3, reps: "45s hold", rest: "60s", cue: "Posterior pelvic tilt, hollow body position" },
            { name: "L-Sit Hold (on floor)", sets: 3, reps: "10s hold", rest: "60s", cue: "Press hands into floor, lift legs straight" },
          ],
        },
        {
          day: 2,
          title: "Legs & Pull",
          exercises: [
            { name: "Pistol Squat Negatives", sets: 3, reps: "5 each leg", rest: "90s", cue: "Slowly lower on one leg for 5 seconds, use support to stand" },
            { name: "Jump Squats", sets: 3, reps: "10", rest: "60s", cue: "Squat deep, explode up, land softly" },
            { name: "Australian Pull-Ups (low bar)", sets: 4, reps: "12", rest: "60s", cue: "Overhand grip, pull chest to bar" },
            { name: "Single-Leg Glute Bridge", sets: 3, reps: "10 each leg", rest: "60s", cue: "Drive through heel, keep hips level" },
            { name: "Nordic Curl Negatives", sets: 3, reps: "5", rest: "90s", cue: "Kneel, slowly lower chest toward floor, catch yourself" },
          ],
        },
        {
          day: 3,
          title: "Full Body Challenge",
          exercises: [
            { name: "Full Push-Ups", sets: 4, reps: "15", rest: "60s", cue: "Controlled tempo, no sagging" },
            { name: "Bodyweight Squats", sets: 4, reps: "20", rest: "60s", cue: "Full depth, chest up" },
            { name: "Australian Pull-Ups", sets: 4, reps: "12", rest: "60s", cue: "Squeeze shoulder blades, hold top for 1 second" },
            { name: "Plank to Push-Up", sets: 3, reps: "10", rest: "60s", cue: "Alternate leading arm each set, minimize hip rotation" },
            { name: "Hollow Body Hold", sets: 3, reps: "20s hold", rest: "60s", cue: "Lower back glued to floor, arms overhead" },
          ],
        },
      ],
    },
  ],
};

const couchTo5K = {
  id: "couch-to-5k",
  title: "Couch to 5K",
  subtitle: "From zero to 30-minute run in 9 weeks",
  icon: "\u{1F3C3}",
  duration: "9 weeks",
  frequency: "3x/week",
  level: "Beginner",
  description:
    "A proven walk-to-run program that gradually builds your aerobic endurance. Each session alternates walking and running intervals, progressively increasing run time until you can run 30 minutes continuously.",
  weeks: [
    {
      week: 1,
      focus: "Getting Started",
      days: [
        {
          day: 1,
          title: "Walk/Run Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Swing arms, gradually increase pace" },
            { name: "Run 60s / Walk 90s", sets: 8, reps: "cycle", rest: "-", cue: "Easy conversational pace, short strides" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Slow walk, let heart rate come down" },
          ],
        },
        {
          day: 2,
          title: "Walk/Run Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Loosen up, find your rhythm" },
            { name: "Run 60s / Walk 90s", sets: 8, reps: "cycle", rest: "-", cue: "Land midfoot, relax your shoulders" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Deep breathing, gentle stretch after" },
          ],
        },
        {
          day: 3,
          title: "Walk/Run Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Focus on posture, eyes forward" },
            { name: "Run 60s / Walk 90s", sets: 8, reps: "cycle", rest: "-", cue: "Breathe rhythmically, stay relaxed" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Walk it out, hydrate" },
          ],
        },
      ],
    },
    {
      week: 3,
      focus: "Building Confidence",
      days: [
        {
          day: 1,
          title: "Mixed Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Dynamic leg swings before starting" },
            { name: "Run 90s", sets: 1, reps: "90s", rest: "-", cue: "Settle into an easy pace" },
            { name: "Walk 90s", sets: 1, reps: "90s", rest: "-", cue: "Active recovery, keep moving" },
            { name: "Run 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Steady effort, you can talk in short sentences" },
            { name: "Walk 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Recover fully before next run" },
            { name: "Repeat Block (90s run, 90s walk, 3 min run, 3 min walk)", sets: 1, reps: "1x", rest: "-", cue: "Same pacing as first block" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Gradual slowdown, stretch calves and quads" },
          ],
        },
        {
          day: 2,
          title: "Mixed Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Light jog for last minute of warm-up" },
            { name: "Run 90s", sets: 1, reps: "90s", rest: "-", cue: "Short quick strides" },
            { name: "Walk 90s", sets: 1, reps: "90s", rest: "-", cue: "Shake out your legs" },
            { name: "Run 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Find a rhythm with your breathing" },
            { name: "Walk 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Sip water if needed" },
            { name: "Repeat Block (90s run, 90s walk, 3 min run, 3 min walk)", sets: 1, reps: "1x", rest: "-", cue: "Maintain the same effort level" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Walk and stretch hip flexors" },
          ],
        },
        {
          day: 3,
          title: "Mixed Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Warm up at a pace that feels easy" },
            { name: "Run 90s", sets: 1, reps: "90s", rest: "-", cue: "Light and quick" },
            { name: "Walk 90s", sets: 1, reps: "90s", rest: "-", cue: "Breathe deeply" },
            { name: "Run 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Relax your hands, no clenching" },
            { name: "Walk 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Stay loose and moving" },
            { name: "Repeat Block (90s run, 90s walk, 3 min run, 3 min walk)", sets: 1, reps: "1x", rest: "-", cue: "Finish strong, same pace throughout" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Cool down fully, stretch hamstrings" },
          ],
        },
      ],
    },
    {
      week: 5,
      focus: "Breakthrough Week",
      days: [
        {
          day: 1,
          title: "Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Include dynamic stretches" },
            { name: "Run 5 min", sets: 1, reps: "5 min", rest: "-", cue: "Easy pace, settle in" },
            { name: "Walk 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Active walk, arms swinging" },
            { name: "Run 5 min", sets: 1, reps: "5 min", rest: "-", cue: "Same pace as first interval" },
            { name: "Walk 3 min", sets: 1, reps: "3 min", rest: "-", cue: "Recover well" },
            { name: "Run 5 min", sets: 1, reps: "5 min", rest: "-", cue: "Push through, you've got this" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Slow to easy walk, stretch" },
          ],
        },
        {
          day: 2,
          title: "Longer Intervals",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Prepare mentally for longer runs" },
            { name: "Run 8 min", sets: 1, reps: "8 min", rest: "-", cue: "Slow and steady, pace yourself" },
            { name: "Walk 5 min", sets: 1, reps: "5 min", rest: "-", cue: "Full recovery walk" },
            { name: "Run 8 min", sets: 1, reps: "8 min", rest: "-", cue: "Match the pace of your first run" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Walk it out, celebrate the effort" },
          ],
        },
        {
          day: 3,
          title: "The Big Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Take it easy, big run ahead" },
            { name: "Run 20 min (no walking!)", sets: 1, reps: "20 min", rest: "-", cue: "Start slow, find your gear, trust your training" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "You just ran 20 minutes straight, amazing" },
          ],
        },
      ],
    },
    {
      week: 7,
      focus: "Building Endurance",
      days: [
        {
          day: 1,
          title: "Steady Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Easy warm-up, get blood flowing" },
            { name: "Run 25 min", sets: 1, reps: "25 min", rest: "-", cue: "Comfortable pace, enjoy the run" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Slow to a walk, stretch major muscle groups" },
          ],
        },
        {
          day: 2,
          title: "Steady Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Loosen hips and ankles" },
            { name: "Run 25 min", sets: 1, reps: "25 min", rest: "-", cue: "Focus on breathing pattern, in through nose" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Walk and hydrate" },
          ],
        },
        {
          day: 3,
          title: "Steady Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Include high knees and butt kicks" },
            { name: "Run 25 min", sets: 1, reps: "25 min", rest: "-", cue: "Maintain even effort, strong finish" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Full cool-down with stretching routine" },
          ],
        },
      ],
    },
    {
      week: 9,
      focus: "Race Ready",
      days: [
        {
          day: 1,
          title: "Full 30-Min Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Easy pace, dynamic stretches" },
            { name: "Run 30 min", sets: 1, reps: "30 min", rest: "-", cue: "You own this distance, settle in and enjoy" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Walk and full-body stretch" },
          ],
        },
        {
          day: 2,
          title: "Full 30-Min Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "Light warm-up, save energy for the run" },
            { name: "Run 30 min", sets: 1, reps: "30 min", rest: "-", cue: "Smooth strides, relaxed upper body" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Celebrate your progress" },
          ],
        },
        {
          day: 3,
          title: "Graduation Run",
          exercises: [
            { name: "Brisk Walk Warm-Up", sets: 1, reps: "5 min", rest: "-", cue: "This is your victory lap warm-up" },
            { name: "Run 30 min (or your first 5K!)", sets: 1, reps: "30 min", rest: "-", cue: "Run your pace, finish with a smile" },
            { name: "Cool-Down Walk", sets: 1, reps: "5 min", rest: "-", cue: "Congratulations, you're a runner now" },
          ],
        },
      ],
    },
  ],
};

const flexibilityMobility = {
  id: "flexibility-mobility",
  title: "Flexibility & Mobility",
  subtitle: "Move better in just 15 minutes a day",
  icon: "\u{1F9D8}",
  duration: "4 weeks",
  frequency: "Daily",
  level: "All Levels",
  description:
    "Short daily routines that improve your range of motion, reduce stiffness, and help prevent injury. Each session is 10\u201315 minutes, making it easy to stay consistent.",
  weeks: [
    {
      week: 1,
      focus: "Building the Habit",
      days: [
        {
          day: 1,
          title: "Morning Flow",
          exercises: [
            { name: "Cat-Cow Stretch", sets: 1, reps: "10 cycles", rest: "-", cue: "Inhale arch, exhale round, move with breath" },
            { name: "World's Greatest Stretch", sets: 1, reps: "5 each side", rest: "-", cue: "Lunge, rotate, open chest to ceiling" },
            { name: "Standing Forward Fold", sets: 1, reps: "30s hold", rest: "-", cue: "Bend knees slightly, let head hang heavy" },
            { name: "90/90 Hip Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Sit tall, both legs at 90\u00B0, lean gently forward" },
            { name: "Thread the Needle", sets: 1, reps: "5 each side", rest: "-", cue: "Reach under and through, feel upper back open" },
            { name: "Chest Doorway Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Arm on door frame at 90\u00B0, step through gently" },
          ],
        },
        {
          day: 2,
          title: "Lower Body Focus",
          exercises: [
            { name: "Deep Squat Hold", sets: 1, reps: "30s hold", rest: "-", cue: "Heels down, push knees out with elbows" },
            { name: "Half-Kneeling Hip Flexor Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Tuck tailbone, lean forward until you feel the stretch" },
            { name: "Supine Figure-4 Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Pull knee toward opposite shoulder, keep hips flat" },
            { name: "Standing Quad Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Pull heel to glute, keep knees together" },
            { name: "Seated Hamstring Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Hinge at hips, reach for toes with flat back" },
            { name: "Ankle Circles", sets: 1, reps: "10 each direction", rest: "-", cue: "Full range of motion, slow and controlled" },
          ],
        },
        {
          day: 3,
          title: "Upper Body & Spine",
          exercises: [
            { name: "Neck Circles", sets: 1, reps: "5 each direction", rest: "-", cue: "Slow and gentle, don't force range" },
            { name: "Shoulder Pass-Throughs (towel)", sets: 1, reps: "10", rest: "-", cue: "Wide grip, keep arms straight overhead and behind" },
            { name: "Cat-Cow Stretch", sets: 1, reps: "10 cycles", rest: "-", cue: "Slow, exaggerate each position" },
            { name: "Thoracic Spine Rotation", sets: 1, reps: "8 each side", rest: "-", cue: "On all fours, hand behind head, rotate open" },
            { name: "Cross-Body Shoulder Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Pull arm across chest, keep shoulder down" },
            { name: "Wrist Circles & Extensions", sets: 1, reps: "10 each direction", rest: "-", cue: "Extend fingers, rotate slowly both ways" },
          ],
        },
        {
          day: 4,
          title: "Full Body Flow",
          exercises: [
            { name: "Inchworm", sets: 1, reps: "5", rest: "-", cue: "Walk hands out to plank, walk feet to hands" },
            { name: "World's Greatest Stretch", sets: 1, reps: "5 each side", rest: "-", cue: "Hold each position for 2 breaths" },
            { name: "Supine Spinal Twist", sets: 1, reps: "30s each side", rest: "-", cue: "Knees to one side, arms out, look opposite" },
            { name: "Butterfly Stretch", sets: 1, reps: "30s hold", rest: "-", cue: "Soles together, gently press knees toward floor" },
            { name: "Child's Pose", sets: 1, reps: "30s hold", rest: "-", cue: "Reach arms forward, sink hips back" },
            { name: "Cobra Stretch", sets: 1, reps: "20s hold", rest: "-", cue: "Press hips into floor, gentle back extension" },
          ],
        },
        {
          day: 5,
          title: "Hip Opener Session",
          exercises: [
            { name: "Deep Squat Hold", sets: 1, reps: "45s hold", rest: "-", cue: "Rock gently side to side" },
            { name: "Pigeon Pose", sets: 1, reps: "45s each side", rest: "-", cue: "Square hips, fold forward over front leg" },
            { name: "Frog Stretch", sets: 1, reps: "30s hold", rest: "-", cue: "Knees wide, gently push hips back" },
            { name: "90/90 Hip Transitions", sets: 1, reps: "8 transitions", rest: "-", cue: "Windshield-wiper legs from side to side" },
            { name: "Happy Baby", sets: 1, reps: "30s hold", rest: "-", cue: "Grab feet, pull knees toward armpits" },
            { name: "Standing Figure-4 Balance", sets: 1, reps: "20s each side", rest: "-", cue: "Ankle on knee, sit back like a chair" },
          ],
        },
        {
          day: 6,
          title: "Recovery Flow",
          exercises: [
            { name: "Cat-Cow Stretch", sets: 1, reps: "8 cycles", rest: "-", cue: "Move gently, find any tight spots" },
            { name: "Child's Pose", sets: 1, reps: "45s hold", rest: "-", cue: "Breathe deeply into your back" },
            { name: "Supine Hamstring Stretch (towel)", sets: 1, reps: "30s each side", rest: "-", cue: "Loop towel around foot, keep leg straight" },
            { name: "Supine Spinal Twist", sets: 1, reps: "30s each side", rest: "-", cue: "Let gravity do the work" },
            { name: "Neck Side Stretch", sets: 1, reps: "20s each side", rest: "-", cue: "Ear toward shoulder, gentle hand pressure" },
            { name: "Savasana (relaxation)", sets: 1, reps: "2 min", rest: "-", cue: "Lie flat, close eyes, release all tension" },
          ],
        },
        {
          day: 7,
          title: "Active Rest & Breathing",
          exercises: [
            { name: "Diaphragmatic Breathing", sets: 1, reps: "2 min", rest: "-", cue: "Hand on belly, breathe so belly rises first" },
            { name: "Gentle Seated Twist", sets: 1, reps: "20s each side", rest: "-", cue: "Sit cross-legged, rotate from mid-back" },
            { name: "Seated Forward Fold", sets: 1, reps: "30s hold", rest: "-", cue: "Legs extended, hinge from hips" },
            { name: "Butterfly Stretch", sets: 1, reps: "30s hold", rest: "-", cue: "Let knees fall naturally, no forcing" },
            { name: "Lying Chest Opener", sets: 1, reps: "30s hold", rest: "-", cue: "Lie on foam roller or rolled towel along spine" },
            { name: "Legs Up the Wall", sets: 1, reps: "3 min", rest: "-", cue: "Hips close to wall, arms relaxed, breathe deeply" },
          ],
        },
      ],
    },
    {
      week: 4,
      focus: "Deeper Range of Motion",
      days: [
        {
          day: 1,
          title: "Advanced Morning Flow",
          exercises: [
            { name: "Sun Salutation Flow", sets: 1, reps: "3 rounds", rest: "-", cue: "Link each movement with one breath" },
            { name: "World's Greatest Stretch", sets: 1, reps: "8 each side", rest: "-", cue: "Add hamstring extension at the top of each rep" },
            { name: "Deep Squat with Rotation", sets: 1, reps: "5 each side", rest: "-", cue: "In deep squat, reach one arm to ceiling" },
            { name: "Pigeon Pose", sets: 1, reps: "60s each side", rest: "-", cue: "Walk hands forward, rest forehead on floor" },
            { name: "Puppy Pose", sets: 1, reps: "45s hold", rest: "-", cue: "Hips over knees, melt chest toward floor" },
            { name: "Standing Side Bend", sets: 1, reps: "30s each side", rest: "-", cue: "Reach overhead, lengthen through the side body" },
          ],
        },
        {
          day: 2,
          title: "Deep Lower Body",
          exercises: [
            { name: "Cossack Squats", sets: 1, reps: "8 each side", rest: "-", cue: "Shift side to side, keep heels grounded" },
            { name: "Pancake Stretch", sets: 1, reps: "45s hold", rest: "-", cue: "Legs wide, hinge forward with flat back" },
            { name: "Pigeon Pose", sets: 1, reps: "60s each side", rest: "-", cue: "Relax completely into the stretch" },
            { name: "Half Split (runner's stretch)", sets: 1, reps: "45s each side", rest: "-", cue: "Back knee on floor, front leg straight, fold forward" },
            { name: "Wall Calf Stretch", sets: 1, reps: "30s each side", rest: "-", cue: "Drive heel down, lean into wall" },
            { name: "Toe Touch Progression", sets: 1, reps: "8 reps", rest: "-", cue: "Roll down vertebra by vertebra, reach for toes" },
          ],
        },
        {
          day: 3,
          title: "Spine & Shoulders",
          exercises: [
            { name: "Jefferson Curl (bodyweight)", sets: 1, reps: "5 slow reps", rest: "-", cue: "Roll down one vertebra at a time, very slow" },
            { name: "Wall Slides", sets: 1, reps: "10", rest: "-", cue: "Back flat on wall, slide arms up and down" },
            { name: "Thoracic Bridge", sets: 1, reps: "5 each side", rest: "-", cue: "From seated, push hips up and reach over" },
            { name: "Shoulder Pass-Throughs", sets: 1, reps: "15", rest: "-", cue: "Narrower grip than week 1, keep arms locked" },
            { name: "Prone Y-T-W Raises", sets: 1, reps: "8 each position", rest: "-", cue: "Face down, lift arms in Y, T, then W shapes" },
            { name: "Thread the Needle", sets: 1, reps: "8 each side", rest: "-", cue: "Hold end position for 3 breaths" },
          ],
        },
        {
          day: 4,
          title: "Full Body Deep Stretch",
          exercises: [
            { name: "Sun Salutation Flow", sets: 1, reps: "3 rounds", rest: "-", cue: "Slow and controlled, hold each position" },
            { name: "Lizard Pose", sets: 1, reps: "45s each side", rest: "-", cue: "Forearms down inside front foot, open the hip" },
            { name: "Seated Straddle Stretch", sets: 1, reps: "45s hold", rest: "-", cue: "Legs wide, walk hands forward" },
            { name: "Supine Spinal Twist", sets: 1, reps: "45s each side", rest: "-", cue: "Both shoulders on the floor" },
            { name: "Sphinx Pose", sets: 1, reps: "45s hold", rest: "-", cue: "Forearms on floor, lift chest, gentle back bend" },
            { name: "Child's Pose", sets: 1, reps: "60s hold", rest: "-", cue: "Wide knees, arms extended, full surrender" },
          ],
        },
        {
          day: 5,
          title: "Advanced Hip Openers",
          exercises: [
            { name: "Cossack Squats", sets: 1, reps: "10 each side", rest: "-", cue: "Go deeper each rep, controlled movement" },
            { name: "Frog Stretch", sets: 1, reps: "60s hold", rest: "-", cue: "Rock gently forward and back" },
            { name: "Pigeon Pose with Quad Stretch", sets: 1, reps: "45s each side", rest: "-", cue: "Reach back and grab rear foot" },
            { name: "90/90 Transitions with Lift", sets: 1, reps: "8 transitions", rest: "-", cue: "Lift knees off ground during transitions" },
            { name: "Deep Squat Hold", sets: 1, reps: "60s hold", rest: "-", cue: "Shift weight side to side, explore the range" },
            { name: "Happy Baby", sets: 1, reps: "45s hold", rest: "-", cue: "Gently rock side to side" },
          ],
        },
        {
          day: 6,
          title: "Active Recovery",
          exercises: [
            { name: "Foam Roll Thoracic Spine", sets: 1, reps: "2 min", rest: "-", cue: "Slowly roll upper back, pause on tight spots" },
            { name: "Foam Roll Quads & IT Band", sets: 1, reps: "60s each side", rest: "-", cue: "Roll slowly, breathe through tender areas" },
            { name: "Supine Figure-4 Stretch", sets: 1, reps: "45s each side", rest: "-", cue: "Gentle pull, relax into it" },
            { name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", cue: "Use strap or towel, keep leg straight" },
            { name: "Chest Opener on Roller", sets: 1, reps: "60s hold", rest: "-", cue: "Arms out to sides, let gravity open your chest" },
            { name: "Legs Up the Wall", sets: 1, reps: "3 min", rest: "-", cue: "Close eyes, focus on slow exhales" },
          ],
        },
        {
          day: 7,
          title: "Celebration Flow",
          exercises: [
            { name: "Sun Salutation Flow", sets: 1, reps: "5 rounds", rest: "-", cue: "Move with confidence, appreciate your progress" },
            { name: "World's Greatest Stretch", sets: 1, reps: "8 each side", rest: "-", cue: "Feel the difference from week 1" },
            { name: "Deep Squat Hold", sets: 1, reps: "60s hold", rest: "-", cue: "Comfortable and grounded" },
            { name: "Pancake Stretch", sets: 1, reps: "45s hold", rest: "-", cue: "Notice your improved range" },
            { name: "Supine Spinal Twist", sets: 1, reps: "45s each side", rest: "-", cue: "Breathe and relax fully" },
            { name: "Savasana", sets: 1, reps: "3 min", rest: "-", cue: "Total relaxation, scan your body for new openness" },
          ],
        },
      ],
    },
  ],
};

const strengthFoundations = {
  id: "strength-foundations",
  title: "Strength Foundations",
  subtitle: "Learn the barbell lifts and build real strength",
  icon: "\u{1F3CB}\uFE0F",
  duration: "8 weeks",
  frequency: "3x/week",
  level: "Beginner",
  description:
    "A structured introduction to barbell training covering the five fundamental lifts: squat, bench press, deadlift, overhead press, and barbell row. Start with just the bar and add weight each session using linear progression.",
  weeks: [
    {
      week: 1,
      focus: "Learning the Movements",
      days: [
        {
          day: 1,
          title: "Workout A: Squat / Bench / Row",
          exercises: [
            { name: "Barbell Back Squat", sets: 3, reps: "5", rest: "90s", cue: "Bar on traps, break at hips and knees together, thighs to parallel" },
            { name: "Barbell Bench Press", sets: 3, reps: "5", rest: "90s", cue: "Feet flat, arch upper back, bar touches mid-chest" },
            { name: "Barbell Row", sets: 3, reps: "5", rest: "90s", cue: "Hinge to 45\u00B0, pull bar to lower chest, squeeze shoulder blades" },
            { name: "Plank", sets: 2, reps: "30s hold", rest: "45s", cue: "Brace like someone is about to punch your gut" },
          ],
        },
        {
          day: 2,
          title: "Workout B: Squat / OHP / Deadlift",
          exercises: [
            { name: "Barbell Back Squat", sets: 3, reps: "5", rest: "90s", cue: "Chest up, knees track over toes, drive through whole foot" },
            { name: "Barbell Overhead Press", sets: 3, reps: "5", rest: "90s", cue: "Bar starts at collarbones, press straight up, move head through at top" },
            { name: "Barbell Deadlift", sets: 1, reps: "5", rest: "120s", cue: "Bar over mid-foot, push floor away, lock hips at top" },
            { name: "Hanging Knee Raises", sets: 2, reps: "10", rest: "45s", cue: "Control the swing, curl knees to chest" },
          ],
        },
        {
          day: 3,
          title: "Workout A: Squat / Bench / Row",
          exercises: [
            { name: "Barbell Back Squat", sets: 3, reps: "5", rest: "90s", cue: "Brace core before each rep, control the descent" },
            { name: "Barbell Bench Press", sets: 3, reps: "5", rest: "90s", cue: "Lower bar under control, drive feet into floor on the press" },
            { name: "Barbell Row", sets: 3, reps: "5", rest: "90s", cue: "Keep lower back neutral, no jerking the weight" },
            { name: "Plank", sets: 2, reps: "30s hold", rest: "45s", cue: "Squeeze glutes, breathe steadily" },
          ],
        },
      ],
    },
    {
      week: 4,
      focus: "Building Volume",
      days: [
        {
          day: 1,
          title: "Workout A: Squat / Bench / Row",
          exercises: [
            { name: "Barbell Back Squat", sets: 5, reps: "5", rest: "2 min", cue: "Weight should feel challenging but form stays clean" },
            { name: "Barbell Bench Press", sets: 5, reps: "5", rest: "2 min", cue: "Controlled descent, pause briefly on chest" },
            { name: "Barbell Row", sets: 5, reps: "5", rest: "90s", cue: "Strict form, no body English" },
            { name: "Barbell Curl", sets: 2, reps: "10", rest: "60s", cue: "Elbows pinned to sides, full extension at bottom" },
            { name: "Plank", sets: 3, reps: "45s hold", rest: "45s", cue: "Hollow body position, shoulders over wrists" },
          ],
        },
        {
          day: 2,
          title: "Workout B: Squat / OHP / Deadlift",
          exercises: [
            { name: "Barbell Back Squat", sets: 5, reps: "5", rest: "2 min", cue: "Sit back and down, drive knees out" },
            { name: "Barbell Overhead Press", sets: 5, reps: "5", rest: "2 min", cue: "Squeeze glutes, no excessive back lean" },
            { name: "Barbell Deadlift", sets: 1, reps: "5", rest: "3 min", cue: "Wedge yourself into position, big breath, drive up" },
            { name: "Barbell Shrug", sets: 2, reps: "10", rest: "60s", cue: "Straight up, hold at top for 1 second" },
            { name: "Back Extension", sets: 3, reps: "12", rest: "60s", cue: "Controlled movement, squeeze glutes at top" },
          ],
        },
        {
          day: 3,
          title: "Workout A: Squat / Bench / Row",
          exercises: [
            { name: "Barbell Back Squat", sets: 5, reps: "5", rest: "2 min", cue: "Every rep should look the same" },
            { name: "Barbell Bench Press", sets: 5, reps: "5", rest: "2 min", cue: "Retract shoulder blades, stable base" },
            { name: "Barbell Row", sets: 5, reps: "5", rest: "90s", cue: "Initiate with lats, not biceps" },
            { name: "Tricep Dips (bench)", sets: 2, reps: "12", rest: "60s", cue: "Lower until upper arms are parallel, press up" },
            { name: "Dead Bug", sets: 3, reps: "8 each side", rest: "45s", cue: "Opposite arm and leg extend, lower back stays flat" },
          ],
        },
      ],
    },
    {
      week: 8,
      focus: "Testing Your Strength",
      days: [
        {
          day: 1,
          title: "Heavy A: Squat / Bench / Row",
          exercises: [
            { name: "Barbell Back Squat", sets: 5, reps: "5", rest: "3 min", cue: "Grind through the sticking point, keep chest up" },
            { name: "Barbell Bench Press", sets: 5, reps: "5", rest: "3 min", cue: "Leg drive, controlled descent, explosive press" },
            { name: "Barbell Row", sets: 5, reps: "5", rest: "2 min", cue: "Pull with intent, control the negative" },
            { name: "Barbell Curl", sets: 3, reps: "10", rest: "60s", cue: "Supinate hard at the top, slow negative" },
            { name: "Hanging Leg Raises", sets: 3, reps: "10", rest: "60s", cue: "Straight legs, toes to bar if possible" },
          ],
        },
        {
          day: 2,
          title: "Heavy B: Squat / OHP / Deadlift",
          exercises: [
            { name: "Barbell Back Squat", sets: 5, reps: "5", rest: "3 min", cue: "Own every rep, no dive-bombing" },
            { name: "Barbell Overhead Press", sets: 5, reps: "5", rest: "3 min", cue: "Lock out hard, shrug into the bar at the top" },
            { name: "Barbell Deadlift", sets: 1, reps: "5", rest: "3 min", cue: "This is your heaviest set yet, stay tight" },
            { name: "Barbell Shrug", sets: 3, reps: "10", rest: "60s", cue: "Heavy weight, hold top for 2 seconds" },
            { name: "Weighted Plank", sets: 3, reps: "30s hold", rest: "60s", cue: "Plate on upper back, maintain neutral spine" },
          ],
        },
        {
          day: 3,
          title: "PR Day: Test Your Maxes",
          exercises: [
            { name: "Barbell Back Squat", sets: 3, reps: "5 (top set)", rest: "3-5 min", cue: "Work up to your heaviest clean set of 5" },
            { name: "Barbell Bench Press", sets: 3, reps: "5 (top set)", rest: "3-5 min", cue: "Use a spotter, go for your best set of 5" },
            { name: "Barbell Deadlift", sets: 1, reps: "5 (top set)", rest: "5 min", cue: "One heavy set, make it count" },
            { name: "Barbell Overhead Press", sets: 3, reps: "5 (top set)", rest: "3-5 min", cue: "Strict press, no leg drive" },
            { name: "Barbell Row", sets: 3, reps: "5 (top set)", rest: "3 min", cue: "Heaviest clean set, no swinging" },
          ],
        },
      ],
    },
  ],
};

export const EXERCISE_PROGRAMS = [
  beginnerCalisthenics,
  couchTo5K,
  flexibilityMobility,
  strengthFoundations,
];
