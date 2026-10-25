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
              <h3>A* Search Heuristics Benchmark</h3>
              <p className="modal-subtitle">Evaluating A* Performance across Different Heuristic Functions on Current Campus</p>
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
                  <th>A* Variant / Heuristic</th>
                  <th>Optimality</th>
                  <th>Nodes Explored</th>
                  <th>Path Cost (Weighted)</th>
                  <th>Path Steps</th>
                  <th>Runtime (ms)</th>
                  <th>Apply</th>
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
                            <span className="winner-badge" title="Overall Most Efficient Heuristic">
                              <Award size={12} /> Most Efficient
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge-optimal"><CheckCircle size={12} /> Guaranteed Optimal</span>
                      </td>
                      <td>
                        <div className="metric-cell">
                          <span className={isBestNodes ? 'best-val' : ''}>{res.nodesVisited} nodes</span>
                          {isBestNodes && <span className="mini-tag">Minimum search space</span>}
                        </div>
                      </td>
                      <td>
                        <div className="metric-cell">
                          <span className={isBestCost ? 'best-val' : ''}>{res.pathCost}</span>
                          {isBestCost && <span className="mini-tag">Optimal</span>}
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
                          Use Heuristic
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="insights-box">
            <h4><Award size={16} /> A* Heuristic Mathematical Insights:</h4>
            <ul>
              <li><strong>Admissibility Guarantee:</strong> When the heuristic never overestimates actual distance to the goal (h(n) &le; h*(n)), A* is guaranteed to produce an optimal path.</li>
              <li><strong>Manhattan Distance:</strong> Ideal for 4-directional grid layouts (|&Delta;r| + |&Delta;c|), driving the frontier directly along campus walkways.</li>
              <li><strong>Octile Distance:</strong> Optimized for 8-directional movement with diagonal moves (cost &radic;2), preventing diagonal overestimation.</li>
              <li><strong>h(n) = 0 Baseline:</strong> Without heuristic direction, A* devolves into uniform-cost exploration, expanding exponentially more nodes and proving why A*'s heuristic makes it far superior.</li>
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
