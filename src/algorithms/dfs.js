import { getNeighbors } from './heuristics.js';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export function runDFS(grid, start, goal, allowDiagonal = false) {
  const startTime = performance.now();
  const stack = [{ ...start, steps: 0 }];
  const visited = new Set();
  const cameFrom = new Map();
  const nodeDetails = new Map();
  const visitedOrder = [];

  const startKey = `${start.r},${start.c}`;
  nodeDetails.set(startKey, { r: start.r, c: start.c, g: 0, h: 0, f: 0, parent: null });

  let found = false;

  while (stack.length > 0) {
    const current = stack.pop();
    const currentKey = `${current.r},${current.c}`;

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    visitedOrder.push({ r: current.r, c: current.c, g: current.steps, h: 0, f: current.steps });

    if (current.r === goal.r && current.c === goal.c) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(current, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;
      if (visited.has(nKey)) continue;

      const cellType = grid[neighbor.r][neighbor.c];
      if (cellType === CELL_TYPES.WALL || cellType === CELL_TYPES.ROADBLOCK) {
        continue;
      }

      cameFrom.set(nKey, current);
      const stepCost = current.steps + 1;
      nodeDetails.set(nKey, {
        r: neighbor.r,
        c: neighbor.c,
        g: stepCost,
        h: 0,
        f: stepCost,
        parent: { r: current.r, c: current.c }
      });
      stack.push({ r: neighbor.r, c: neighbor.c, steps: stepCost });
    }
  }

  const path = [];
  let totalCost = 0;
  if (found) {
    let curr = goal;
    while (curr) {
      path.unshift({ r: curr.r, c: curr.c });
      const cKey = `${curr.r},${curr.c}`;
      curr = cameFrom.get(cKey);
    }
    for (let i = 1; i < path.length; i++) {
      const cell = grid[path[i].r][path[i].c];
      totalCost += (CELL_WEIGHTS[cell] || 1);
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    algorithm: 'Depth-First Search (DFS)',
    id: 'dfs',
    found,
    path,
    visitedOrder,
    nodesVisited: visitedOrder.length,
    pathLength: path.length,
    pathCost: Math.round(totalCost * 10) / 10,
    executionTimeMs: Math.round(executionTime * 100) / 100,
    nodeDetails,
    isOptimal: false
  };
}
