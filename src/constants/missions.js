export const CAMPUS_MISSIONS = [
  {
    id: 'exam-dispatch',
    title: 'Mission 1: Urgent AI Exam Paper Transport',
    category: 'Urgent Delivery',
    badge: 'High Priority',
    start: { r: 16, c: 7 },   // Admin Door
    goal: { r: 6, c: 7 },      // Turing CS Door
    startBuilding: 'Campus Administration & Dean Suite',
    goalBuilding: 'Alan Turing AI & Robotics Hall',
    description: 'Autonomous rover must transport encrypted midterm examination USBs from Admin to the CS Hall avoiding student crowd clusters.',
    recommendedAlgo: 'astar',
    tip: 'A* with Manhattan heuristic finds the optimal straight-shot corridor route.'
  },
  {
    id: 'medical-emergency',
    title: 'Mission 2: Emergency Defibrillator Transport',
    category: 'Medical Urgent',
    badge: 'Critical Life-Safety',
    start: { r: 13, c: 7 },   // Medical Center
    goal: { r: 16, c: 37 },    // Sports Arena
    startBuilding: 'Health & Medical Center',
    goalBuilding: 'Olympic Gymnasium & Sports Complex',
    description: 'A sports arena student needs urgent automated first-aid. Deliver an AED unit across the campus through the quad lawn.',
    recommendedAlgo: 'astar',
    tip: 'A* evaluates terrain weights (3x lawn vs 1x paved) while remaining guided by the heuristic.'
  },
  {
    id: 'night-book-return',
    title: 'Mission 3: Late-Night Textbook Return',
    category: 'Routine Logistics',
    badge: 'Standard',
    start: { r: 13, c: 37 },  // Dorms
    goal: { r: 6, c: 22 },     // Library
    startBuilding: 'East Residential Towers & Dorms',
    goalBuilding: 'Ada Lovelace Central Library',
    description: 'Return heavy robotics textbooks from dormitories to the Central Library before midnight closing.',
    recommendedAlgo: 'astar',
    tip: 'A* with Euclidean heuristic finds the shortest straight line across open campus corridors.'
  },
  {
    id: 'vip-tour',
    title: 'Mission 4: Autonomous Campus VIP Tour',
    category: 'Tour Guide',
    badge: 'Exploration',
    start: { r: 16, c: 7 },   // Admin
    goal: { r: 6, c: 37 },     // Quantum Lab
    startBuilding: 'Campus Administration',
    goalBuilding: 'Tesla Quantum Engineering Lab',
    description: 'Lead visiting distinguished professors across the campus from Administration to the Quantum Engineering Lab.',
    recommendedAlgo: 'astar',
    tip: 'Watch how A* balances distance and terrain costs.'
  },
  {
    id: 'construction-reroute',
    title: 'Mission 5: Dynamic Obstacle & Live Replanning',
    category: 'Autonomous Reaction',
    badge: 'Dynamic D* Demo',
    start: { r: 16, c: 22 },  // Student Union
    goal: { r: 6, c: 7 },      // CS Hall
    startBuilding: 'Student Union & Dining Pavilion',
    goalBuilding: 'Alan Turing AI Hall',
    description: 'While the rover is en route, a sudden construction roadblock appears in the central hallway. The rover sensor detects it and replans instantly!',
    recommendedAlgo: 'astar',
    tip: 'Click "Inject Sudden Roadblock" while the rover is driving to trigger instant replanning.'
  }
];
