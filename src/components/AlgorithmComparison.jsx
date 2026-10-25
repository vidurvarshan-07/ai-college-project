import React from 'react';
import { X, Award, CheckCircle, AlertCircle, BarChart3, Clock, Route, Activity } from 'lucide-react';

export default function AlgorithmComparison({ results, onClose, onSelectAndRun }) {
  if (!results || results.length === 0) return null;

  // Find best performers
  const lowestTime = Math.min(...results.filter(r => r.found).map(r => r.executionTimeMs));
  const lowestNodes = Math.min(...results.filter(r => r.found).map(r => r.nodesVisited));
  const lowestCost = Math.min(...results.filter(r => r.found).map(r => r.pathCost));

  return (
    <div className="modal-backdrop" onClick={onClose} id="benchmark-modal-backdrop">
      <div className="modal-card benchmark-card" onClick={e => e.stopPropagation()} id="benchmark-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BarChart3 className="modal-icon" size={22} />
            <div>
              <h3>Algorithm Benchmark & Comparison</h3>
              <p className="modal-subtitle">Direct side-by-side performance on the current campus layout</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-benchmark">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="table-responsive">
            <table className="benchmark-table" id="benchmark-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Optimality</th>
                  <th>Nodes Explored</th>
                  <th>Path Cost (Weighted)</th>
                  <th>Path Steps</th>
                  <th>Runtime (ms)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => {
                  const isBestTime = res.executionTimeMs === lowestTime;
                  const isBestNodes = res.nodesVisited === lowestNodes;
                  const isBestCost = res.pathCost === lowestCost;

                  return (
                    <tr key={res.id} className={isBestCost && isBestNodes ? 'highlight-row' : ''}>
                      <td>
                        <div className="algo-cell-title">
                          <strong>{res.algorithm}</strong>
                          {isBestNodes && isBestCost && (
                            <span className="winner-badge" title="Overall Most Efficient">
                              <Award size={12} /> Best
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {res.isOptimal ? (
                          <span className="badge-optimal"><CheckCircle size={12} /> Guaranteed Optimal</span>
                        ) : (
                          <span className="badge-suboptimal"><AlertCircle size={12} /> Suboptimal / Unweighted</span>
                        )}
                      </td>
                      <td>
                        <div className="metric-cell">
                          <span className={isBestNodes ? 'best-val' : ''}>{res.nodesVisited} nodes</span>
                          {isBestNodes && <span className="mini-tag">Least search space</span>}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell">
                          <span className={isBestCost ? 'best-val' : ''}>{res.pathCost}</span>
                          {isBestCost && <span className="mini-tag">Shortest</span>}
                        </div>
                      </td>
                      <td>
                        <span>{res.pathLength} steps</span>
                      </td>
                      <td>
                        <span className={isBestTime ? 'best-val' : ''}>{res.executionTimeMs} ms</span>
                      </td>
                      <td>
                        <button
                          className="btn-table-action"
                          onClick={() => {
                            onSelectAndRun(res.id);
                            onClose();
                          }}
                          id={`btn-run-from-table-${res.id}`}
                        >
                          Visualize
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="insights-box">
            <h4><Award size={16} /> Key Theoretical Takeaways:</h4>
            <ul>
              <li><strong>A* vs Dijkstra:</strong> A* reaches the destination expanding significantly fewer nodes because the admissible heuristic drives the search directly toward the goal.</li>
              <li><strong>BFS Limitations:</strong> BFS guarantees the fewest step hops, but completely ignores terrain penalties like crowds or stairwells.</li>
              <li><strong>Greedy Best-First Pitfall:</strong> Greedy is fast because it only considers distance to goal, but it often gets trapped behind complex campus buildings, taking awkward detours.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} id="btn-close-benchmark-footer">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
