// Comparison Helper for A*, BFS, and DFS
import { runAStar } from './astar.js';
import { runBFS } from './bfs.js';
import { runDFS } from './dfs.js';

export function runAllAlgorithms(grid, start, goal, activeHeuristicFn, allowDiagonal = false) {
  const resAStar = runAStar(grid, start, goal, activeHeuristicFn, allowDiagonal);
  const resBFS = runBFS(grid, start, goal, allowDiagonal);
  const resDFS = runDFS(grid, start, goal, allowDiagonal);

  return [resAStar, resBFS, resDFS];
}

