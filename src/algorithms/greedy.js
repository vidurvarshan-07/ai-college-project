import { manhattan, getNeighbors } from './heuristics.js';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export function runGreedyBestFirst(grid, start, goal, heuristicFn = manhattan, allowDiagonal = false) {
  const startTime = performance.now();
  const startKey = `${start.r},${start.c}`;
  const openSet = [{ ...start, h: heuristicFn(start, goal) }];
  const closedSet = new Set();
  const cameFrom = new Map();
  const nodeDetails = new Map();
  const visitedOrder = [];

  let found = false;
  nodeDetails.set(startKey, { r: start.r, c: start.c, g: 0, h: heuristicFn(start, goal), f: heuristicFn(start, goal), parent: null });

  while (openSet.length > 0) {
    // Greedy strictly prioritizes lowest h
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift();
    const currentKey = `${current.r},${current.c}`;

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    visitedOrder.push({ r: current.r, c: current.c, g: 0, h: current.h, f: current.h });

    if (current.r === goal.r && current.c === goal.c) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(current, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      const nKey = `${neighbor.r},${neighbor.c}`;
      if (closedSet.has(nKey)) continue;

      const cellType = grid[neighbor.r][neighbor.c];
      if (cellType === CELL_TYPES.WALL || cellType === CELL_TYPES.ROADBLOCK) {
        continue;
      }

      const h = heuristicFn(neighbor, goal);
      cameFrom.set(nKey, current);
      nodeDetails.set(nKey, {
        r: neighbor.r,
        c: neighbor.c,
        g: 0,
        h,
        f: h,
        parent: { r: current.r, c: current.c }
      });
      openSet.push({ r: neighbor.r, c: neighbor.c, h });
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
    algorithm: 'Greedy Best-First Search',
    id: 'greedy',
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
