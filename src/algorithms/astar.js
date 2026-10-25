import { manhattan, getNeighbors } from './heuristics.js';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export function runAStar(grid, start, goal, heuristicFn = manhattan, allowDiagonal = false) {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const startKey = `${start.r},${start.c}`;
  const goalKey = `${goal.r},${goal.c}`;

  const openSet = [{ ...start, g: 0, h: heuristicFn(start, goal), f: heuristicFn(start, goal) }];
  const openSetMap = new Map();
  openSetMap.set(startKey, openSet[0]);

  const closedSet = new Set();
  const cameFrom = new Map();
  const nodeDetails = new Map();

  const visitedOrder = [];
  let found = false;

  nodeDetails.set(startKey, {
    r: start.r,
    c: start.c,
    g: 0,
    h: heuristicFn(start, goal),
    f: heuristicFn(start, goal),
    parent: null
  });

  while (openSet.length > 0) {
    // Sort to get node with lowest f (or lowest h on tie)
    openSet.sort((a, b) => a.f === b.f ? a.h - b.h : a.f - b.f);
    const current = openSet.shift();
    const currentKey = `${current.r},${current.c}`;
    openSetMap.delete(currentKey);

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    visitedOrder.push({ r: current.r, c: current.c, g: current.g, h: current.h, f: current.f });

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

      const terrainWeight = CELL_WEIGHTS[cellType] || 1;
      const tentativeG = current.g + (neighbor.moveCost * terrainWeight);

      const existingOpen = openSetMap.get(nKey);
      if (!existingOpen || tentativeG < existingOpen.g) {
        const h = heuristicFn(neighbor, goal);
        const f = tentativeG + h;
        cameFrom.set(nKey, current);

        const nodeData = { r: neighbor.r, c: neighbor.c, g: tentativeG, h, f };
        nodeDetails.set(nKey, { ...nodeData, parent: { r: current.r, c: current.c } });

        if (!existingOpen) {
          openSet.push(nodeData);
          openSetMap.set(nKey, nodeData);
        } else {
          existingOpen.g = tentativeG;
          existingOpen.f = f;
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let totalCost = 0;
  if (found) {
    let curr = goal;
    while (curr) {
      path.unshift({ r: curr.r, c: curr.c });
      const cKey = `${curr.r},${curr.c}`;
      curr = cameFrom.get(cKey);
    }
    // Calculate total weighted path cost
    for (let i = 1; i < path.length; i++) {
      const cell = grid[path[i].r][path[i].c];
      totalCost += (CELL_WEIGHTS[cell] || 1);
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    algorithm: 'A* Search',
    id: 'astar',
    found,
    path,
    visitedOrder,
    nodesVisited: visitedOrder.length,
    pathLength: path.length,
    pathCost: Math.round(totalCost * 10) / 10,
    executionTimeMs: Math.round(executionTime * 100) / 100,
    nodeDetails,
    isOptimal: true
  };
}
