// Run all algorithms helper
import { runAStar } from './astar.js';
import { runDijkstra } from './dijkstra.js';
import { runBFS } from './bfs.js';
import { runGreedyBestFirst } from './greedy.js';
import { runBidirectionalAStar } from './bidirectional.js';
import { runDFS } from './dfs.js';

export function runAllAlgorithms(grid, start, goal, heuristicFn, allowDiagonal) {
  return [
    runAStar(grid, start, goal, heuristicFn, allowDiagonal),
    runDijkstra(grid, start, goal, allowDiagonal),
    runBFS(grid, start, goal, allowDiagonal),
    runGreedyBestFirst(grid, start, goal, heuristicFn, allowDiagonal),
    runBidirectionalAStar(grid, start, goal, heuristicFn, allowDiagonal),
    runDFS(grid, start, goal, allowDiagonal)
  ];
}
