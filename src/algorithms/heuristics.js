// Heuristic Distance Functions for Grid Pathfinding
export const manhattan = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export const euclidean = (a, b) => Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.c - b.c, 2));

export const octile = (a, b) => {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return dr + dc + (Math.SQRT2 - 2) * Math.min(dr, dc);
};

/**
 * Get valid neighbors for pathfinding.
 * Includes strict obstacle checking and ANTI-CORNER-CUTTING:
 * - Cardinal directions (Up, Down, Left, Right): neighbor must not be wall or roadblock.
 * - Diagonal directions: neighbor must not be wall/roadblock AND both adjacent orthogonal
 *   cells must also be clear to prevent cutting through/clipping obstacle corners.
 */
export const getNeighbors = (node, grid, allowDiagonal = false) => {
  const { r, c } = node;
  const rows = grid.length;
  const cols = grid[0].length;
  const neighbors = [];

  const isBlocked = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
    const type = grid[row][col];
    return type === 'wall' || type === 'roadblock';
  };

  // 4 Orthogonal Cardinal Directions
  const cardinals = [
    { dr: -1, dc: 0, cost: 1 }, // Up
    { dr: 1, dc: 0, cost: 1 },  // Down
    { dr: 0, dc: -1, cost: 1 }, // Left
    { dr: 0, dc: 1, cost: 1 }   // Right
  ];

  for (const { dr, dc, cost } of cardinals) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !isBlocked(nr, nc)) {
      neighbors.push({ r: nr, c: nc, moveCost: cost });
    }
  }

  // 4 Diagonal Directions with STRICT Anti-Corner-Cutting Prevention
  if (allowDiagonal) {
    const diagonals = [
      { dr: -1, dc: -1, cost: 1.414, adjR: -1, adjC: -1 }, // Up-Left
      { dr: -1, dc: 1, cost: 1.414, adjR: -1, adjC: 1 },   // Up-Right
      { dr: 1, dc: -1, cost: 1.414, adjR: 1, adjC: -1 },   // Down-Left
      { dr: 1, dc: 1, cost: 1.414, adjR: 1, adjC: 1 }      // Down-Right
    ];

    for (const { dr, dc, cost } of diagonals) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        // Target cell must not be blocked
        if (isBlocked(nr, nc)) continue;

        // Anti-Corner-Cutting Rule:
        // When moving diagonally, robot cannot clip the corner of an obstacle.
        // Both adjacent orthogonal cells (r + dr, c) and (r, c + dc) must be clear!
        const adj1Blocked = isBlocked(r + dr, c);
        const adj2Blocked = isBlocked(r, c + dc);

        if (!adj1Blocked && !adj2Blocked) {
          neighbors.push({ r: nr, c: nc, moveCost: cost });
        }
      }
    }
  }

  return neighbors;
};
