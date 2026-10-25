// A* Search Heuristics Comparison Helper
import { runAStar } from './astar.js';
import { manhattan, euclidean, octile } from './heuristics.js';

export function runAllAlgorithms(grid, start, goal, _activeHeuristic, allowDiagonal = false) {
  const zeroHeuristic = () => 0;

  const resManhattan = runAStar(grid, start, goal, manhattan, allowDiagonal);
  resManhattan.algorithm = 'A* (Manhattan Distance)';
  resManhattan.id = 'astar-manhattan';
  resManhattan.heuristicName = 'Manhattan';

  const resEuclidean = runAStar(grid, start, goal, euclidean, allowDiagonal);
  resEuclidean.algorithm = 'A* (Euclidean Distance)';
  resEuclidean.id = 'astar-euclidean';
  resEuclidean.heuristicName = 'Euclidean';

  const resOctile = runAStar(grid, start, goal, octile, allowDiagonal);
  resOctile.algorithm = 'A* (Octile Diagonal)';
  resOctile.id = 'astar-octile';
  resOctile.heuristicName = 'Octile';

  const resZero = runAStar(grid, start, goal, zeroHeuristic, allowDiagonal);
  resZero.algorithm = 'A* with h(n)=0 (Dijkstra Baseline)';
  resZero.id = 'astar-zero';
  resZero.heuristicName = 'Zero Heuristic';

  return [resManhattan, resEuclidean, resOctile, resZero];
}

