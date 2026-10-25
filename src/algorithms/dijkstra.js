import { getNeighbors } from './heuristics.js';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export function runDijkstra(grid, start, goal, allowDiagonal = false) {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const startKey = `${start.r},${start.c}`;
  const openSet = [{ ...start, g: 0 }];
  const openSetMap = new Map();
  openSetMap.set(startKey, openSet[0]);

  const closedSet = new Set();
  const cameFrom = new Map();
  const nodeDetails = new Map();

  const visitedOrder = [];
  let found = false;

  nodeDetails.set(startKey, { r: start.r, c: start.c, g: 0, h: 0, f: 0, parent: null });

  while (openSet.length > 0) {
    // Dijkstra picks node with lowest g
    openSet.sort((a, b) => a.g - b.g);
    const current = openSet.shift();
    const currentKey = `${current.r},${current.c}`;
    openSetMap.delete(currentKey);

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);
    visitedOrder.push({ r: current.r, c: current.c, g: current.g, h: 0, f: current.g });

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
        cameFrom.set(nKey, current);
        const nodeData = { r: neighbor.r, c: neighbor.c, g: tentativeG, h: 0, f: tentativeG };
        nodeDetails.set(nKey, { ...nodeData, parent: { r: current.r, c: current.c } });

        if (!existingOpen) {
          openSet.push(nodeData);
          openSetMap.set(nKey, nodeData);
        } else {
          existingOpen.g = tentativeG;
        }
      }
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
    algorithm: "Dijkstra's Algorithm",
    id: 'dijkstra',
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
