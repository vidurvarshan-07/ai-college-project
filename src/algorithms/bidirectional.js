import { manhattan, getNeighbors } from './heuristics.js';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export function runBidirectionalAStar(grid, start, goal, heuristicFn = manhattan, allowDiagonal = false) {
  const startTime = performance.now();

  const startKey = `${start.r},${start.c}`;
  const goalKey = `${goal.r},${goal.c}`;

  const openForward = [{ ...start, g: 0, h: heuristicFn(start, goal), f: heuristicFn(start, goal) }];
  const openBackward = [{ ...goal, g: 0, h: heuristicFn(goal, start), f: heuristicFn(goal, start) }];

  const closedForward = new Map();
  const closedBackward = new Map();

  const cameFromForward = new Map();
  const cameFromBackward = new Map();

  const visitedOrder = [];
  let intersectionNode = null;

  while (openForward.length > 0 && openBackward.length > 0) {
    // Step forward
    openForward.sort((a, b) => a.f - b.f);
    const currF = openForward.shift();
    const keyF = `${currF.r},${currF.c}`;

    if (!closedForward.has(keyF)) {
      closedForward.set(keyF, currF);
      visitedOrder.push({ r: currF.r, c: currF.c, g: currF.g, h: currF.h, f: currF.f, dir: 'forward' });

      if (closedBackward.has(keyF)) {
        intersectionNode = currF;
        break;
      }

      const neighborsF = getNeighbors(currF, grid, allowDiagonal);
      for (const n of neighborsF) {
        const nKey = `${n.r},${n.c}`;
        if (closedForward.has(nKey)) continue;

        const cell = grid[n.r][n.c];
        if (cell === CELL_TYPES.WALL || cell === CELL_TYPES.ROADBLOCK) continue;

        const weight = CELL_WEIGHTS[cell] || 1;
        const g = currF.g + (n.moveCost * weight);
        const h = heuristicFn(n, goal);
        cameFromForward.set(nKey, currF);
        openForward.push({ r: n.r, c: n.c, g, h, f: g + h });
      }
    }

    // Step backward
    openBackward.sort((a, b) => a.f - b.f);
    const currB = openBackward.shift();
    const keyB = `${currB.r},${currB.c}`;

    if (!closedBackward.has(keyB)) {
      closedBackward.set(keyB, currB);
      visitedOrder.push({ r: currB.r, c: currB.c, g: currB.g, h: currB.h, f: currB.f, dir: 'backward' });

      if (closedForward.has(keyB)) {
        intersectionNode = currB;
        break;
      }

      const neighborsB = getNeighbors(currB, grid, allowDiagonal);
      for (const n of neighborsB) {
        const nKey = `${n.r},${n.c}`;
        if (closedBackward.has(nKey)) continue;

        const cell = grid[n.r][n.c];
        if (cell === CELL_TYPES.WALL || cell === CELL_TYPES.ROADBLOCK) continue;

        const weight = CELL_WEIGHTS[cell] || 1;
        const g = currB.g + (n.moveCost * weight);
        const h = heuristicFn(n, start);
        cameFromBackward.set(nKey, currB);
        openBackward.push({ r: n.r, c: n.c, g, h, f: g + h });
      }
    }
  }

  // Construct full path through intersection
  const path = [];
  let totalCost = 0;
  if (intersectionNode) {
    const fPath = [];
    let curr = intersectionNode;
    while (curr) {
      fPath.unshift({ r: curr.r, c: curr.c });
      curr = cameFromForward.get(`${curr.r},${curr.c}`);
    }

    const bPath = [];
    curr = cameFromBackward.get(`${intersectionNode.r},${intersectionNode.c}`);
    while (curr) {
      bPath.push({ r: curr.r, c: curr.c });
      curr = cameFromBackward.get(`${curr.r},${curr.c}`);
    }

    path.push(...fPath, ...bPath);
    for (let i = 1; i < path.length; i++) {
      const cell = grid[path[i].r][path[i].c];
      totalCost += (CELL_WEIGHTS[cell] || 1);
    }
  }

  const executionTime = performance.now() - startTime;

  return {
    algorithm: 'Bi-Directional A*',
    id: 'bidirectional',
    found: !!intersectionNode,
    path,
    visitedOrder,
    nodesVisited: visitedOrder.length,
    pathLength: path.length,
    pathCost: Math.round(totalCost * 10) / 10,
    executionTimeMs: Math.round(executionTime * 100) / 100,
    nodeDetails: new Map(),
    isOptimal: true
  };
}
