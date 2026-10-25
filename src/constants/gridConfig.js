export const GRID_ROWS = 22;
export const GRID_COLS = 44;

export const CELL_TYPES = {
  EMPTY: 'empty',
  WALL: 'wall',
  START: 'start',
  GOAL: 'goal',
  WAYPOINT: 'waypoint',
  LAWN: 'lawn',         // weight: 3
  CROWD: 'crowd',       // weight: 5
  STAIRS: 'stairs',     // weight: 7
  ROADBLOCK: 'roadblock' // dynamic obstacle
};

export const CELL_WEIGHTS = {
  [CELL_TYPES.EMPTY]: 1,
  [CELL_TYPES.LAWN]: 3,
  [CELL_TYPES.CROWD]: 5,
  [CELL_TYPES.STAIRS]: 7,
  [CELL_TYPES.WALL]: Infinity,
  [CELL_TYPES.ROADBLOCK]: Infinity,
  [CELL_TYPES.START]: 1,
  [CELL_TYPES.GOAL]: 1,
  [CELL_TYPES.WAYPOINT]: 1
};

export const DEFAULT_START = { r: 15, c: 5 };
export const DEFAULT_GOAL = { r: 6, c: 7 };

export const DRAW_TOOLS = [
  { id: 'brush', label: 'Freehand', icon: 'Pencil', desc: 'Click & drag freely across grid tiles' },
  { id: 'line', label: 'Wall Line', icon: 'Minus', desc: 'Drag straight barrier lines (Bresenham)' },
  { id: 'rect', label: 'Enclosure Box', icon: 'Square', desc: 'Drag rectangular obstacle perimeter/building' },
  { id: 'cluster', label: 'Hazard Cluster', icon: 'Sparkles', desc: 'Click to scatter random debris & barriers' },
  { id: 'eraser', label: 'Eraser', icon: 'Eraser', desc: 'Wipe obstacles & restore clean walkways' }
];

export const BRUSH_TYPES = [
  { id: 'wall', label: 'Building Wall', icon: 'Square', color: '#64748b', desc: 'Impassable architectural obstacle' },
  { id: 'roadblock', label: 'Roadblock', icon: 'ShieldAlert', color: '#f43f5e', desc: 'Dynamic barrier for live replanning' },
  { id: 'lawn', label: 'Great Lawn (3x)', icon: 'Trees', color: '#059669', desc: 'Grassy parkland terrain (Cost 3)' },
  { id: 'crowd', label: 'Crowded Plaza (5x)', icon: 'Users', color: '#d97706', desc: 'Heavy student congestion (Cost 5)' },
  { id: 'stairs', label: 'Stairs / Overpass (7x)', icon: 'Footprints', color: '#7c3aed', desc: 'Steep stairways (Cost 7)' },
  { id: 'start', label: 'Rover Start', icon: 'Bot', color: '#10b981', desc: 'Starting point of automaton rover' },
  { id: 'goal', label: 'Mission Goal', icon: 'Flag', color: '#ef4444', desc: 'Target destination building' },
  { id: 'empty', label: 'Clear Walkway', icon: 'Eraser', color: '#94a3b8', desc: 'Normal paved walkway (Cost 1)' }
];
