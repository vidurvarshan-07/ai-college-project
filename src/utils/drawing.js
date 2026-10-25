// Drawing & Geometric Helpers for Advanced Obstacle Plotting & Live Pathfinding

/**
 * Bresenham's line algorithm to get all cells between (r0, c0) and (r1, c1)
 */
export function getLineCells(r0, c0, r1, c1, maxRows = 22, maxCols = 44) {
  const cells = [];
  const dx = Math.abs(c1 - c0);
  const dy = Math.abs(r1 - r0);
  const sx = c0 < c1 ? 1 : -1;
  const sy = r0 < r1 ? 1 : -1;
  let err = dx - dy;
  let r = r0;
  let c = c0;

  while (true) {
    if (r >= 0 && r < maxRows && c >= 0 && c < maxCols) {
      cells.push({ r, c });
    }
    if (r === r1 && c === c1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      c += sx;
    }
    if (e2 < dx) {
      err += dx;
      r += sy;
    }
  }
  return cells;
}

/**
 * Get cells forming a rectangle box (outline or filled)
 */
export function getRectCells(r0, c0, r1, c1, fill = false, maxRows = 22, maxCols = 44) {
  const cells = [];
  const minR = Math.max(0, Math.min(r0, r1));
  const maxR = Math.min(maxRows - 1, Math.max(r0, r1));
  const minC = Math.max(0, Math.min(c0, c1));
  const maxC = Math.min(maxCols - 1, Math.max(c0, c1));

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (fill || r === minR || r === maxR || c === minC || c === maxC) {
        cells.push({ r, c });
      }
    }
  }
  return cells;
}

/**
 * Get a natural organic cluster of obstacle cells around (centerR, centerC)
 */
export function getClusterCells(centerR, centerC, radius = 2, maxRows = 22, maxCols = 44) {
  const cells = [];
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const r = centerR + dr;
      const c = centerC + dc;
      if (r >= 0 && r < maxRows && c >= 0 && c < maxCols) {
        const dist = Math.sqrt(dr * dr + dc * dc);
        if (dist <= radius) {
          // Inner core is always placed; outer rim placed probabilistically
          if (dist <= 1 || Math.random() < 0.6) {
            cells.push({ r, c });
          }
        }
      }
    }
  }
  return cells;
}

/**
 * Multi-Waypoint piecewise path solver
 * Connects start -> waypoint[0] -> waypoint[1] -> ... -> goal
 */
export function solveMultiPointPath(start, waypoints = [], goal, grid, searchFn) {
  const points = [start, ...waypoints, goal];
  let combinedPath = [];
  let allVisited = [];
  let totalCost = 0;
  let allFound = true;
  let totalTime = 0;
  const combinedNodeDetails = new Map();

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segGoal = points[i + 1];
    const result = searchFn(grid, segStart, segGoal);
    totalTime += result.executionTimeMs || 0;

    if (!result.found) {
      allFound = false;
      break;
    }

    if (combinedPath.length > 0 && result.path.length > 0) {
      combinedPath = combinedPath.concat(result.path.slice(1));
    } else {
      combinedPath = combinedPath.concat(result.path);
    }

    allVisited = allVisited.concat(result.visitedOrder);
    totalCost += result.pathCost;

    if (result.nodeDetails) {
      for (const [k, v] of result.nodeDetails.entries()) {
        combinedNodeDetails.set(k, v);
      }
    }
  }

  return {
    found: allFound,
    path: combinedPath,
    visitedOrder: allVisited,
    pathCost: Math.round(totalCost * 10) / 10,
    pathLength: combinedPath.length,
    executionTimeMs: Math.round(totalTime * 100) / 100,
    nodeDetails: combinedNodeDetails
  };
}

/**
 * Compute LiDAR raycast lines around the rover
 */
export function calculateLidarRays(roverPos, grid, maxRange = 6) {
  if (!roverPos) return [];
  const rays = [];
  const numRays = 16;
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < numRays; i++) {
    const angle = (i * 2 * Math.PI) / numRays;
    let endR = roverPos.r;
    let endC = roverPos.c;
    let hit = false;

    for (let step = 1; step <= maxRange; step++) {
      const r = Math.round(roverPos.r + Math.sin(angle) * step);
      const c = Math.round(roverPos.c + Math.cos(angle) * step);

      if (r < 0 || r >= rows || c < 0 || c >= cols) {
        break;
      }
      endR = r;
      endC = c;
      if (grid[r][c] === 'wall' || grid[r][c] === 'roadblock') {
        hit = true;
        break;
      }
    }
    rays.push({ angle, endR, endC, hit });
  }
  return rays;
}
