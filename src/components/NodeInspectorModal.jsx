import React from 'react';
import { X, Calculator, Info, Sparkles, Navigation2 } from 'lucide-react';

export default function NodeInspectorModal({ node, start, goal, onClose }) {
  if (!node) return null;

  const manhattanDist = Math.abs(node.r - goal.r) + Math.abs(node.c - goal.c);
  const euclideanDist = Math.round(Math.sqrt(Math.pow(node.r - goal.r, 2) + Math.pow(node.c - goal.c, 2)) * 100) / 100;
  const startDist = Math.abs(node.r - start.r) + Math.abs(node.c - start.c);

  return (
    <div className="modal-backdrop" onClick={onClose} id="inspector-modal-backdrop">
      <div className="modal-card" onClick={e => e.stopPropagation()} id="node-inspector-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Calculator className="modal-icon" size={20} />
            <h3>Node Mathematical Inspector</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-inspector">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="coord-badge">
            Grid Coordinate: <span>Row {node.r}, Column {node.c}</span>
          </div>

          <div className="math-cards-grid">
            <div className="math-card g-card">
              <div className="math-card-label">g(n) // Exact Traversal Cost</div>
              <div className="math-card-val">{typeof node.g === 'number' ? Math.round(node.g * 10) / 10 : startDist}</div>
              <div className="math-card-desc">Accumulated terrain cost from Start to this cell</div>
            </div>

            <div className="math-card h-card">
              <div className="math-card-label">h(n) // Heuristic Estimate</div>
              <div className="math-card-val">{typeof node.h === 'number' ? Math.round(node.h * 10) / 10 : manhattanDist}</div>
              <div className="math-card-desc">Admissible estimated distance from this cell to Goal</div>
            </div>

            <div className="math-card f-card">
              <div className="math-card-label">f(n) = g(n) + h(n)</div>
              <div className="math-card-val">{typeof node.f === 'number' ? Math.round(node.f * 10) / 10 : (startDist + manhattanDist)}</div>
              <div className="math-card-desc">Total priority ranking used by A* to prioritize exploration</div>
            </div>
          </div>

          <div className="heuristic-comparison-box">
            <h4><Sparkles size={16} /> Distance Metrics to Destination</h4>
            <div className="metrics-row">
              <div className="metric-chip">
                <strong>Manhattan:</strong> {manhattanDist} units (|Δr| + |Δc|)
              </div>
              <div className="metric-chip">
                <strong>Euclidean:</strong> {euclideanDist} units (√(Δr² + Δc²))
              </div>
              <div className="metric-chip">
                <strong>Terrain Type:</strong> {node.type || 'Paved Walkway'} (Weight: {node.weight || 1}x)
              </div>
            </div>
          </div>

          <div className="formula-explanation">
            <Info size={16} className="info-icon" />
            <p>
              In <strong>A* Search</strong>, nodes with lower <code>f(n)</code> are expanded first. Because the heuristic <code>h(n)</code> is admissible (never overestimates the true distance), A* is mathematically guaranteed to find the true optimal shortest path while visiting far fewer nodes than blind searches like BFS or Dijkstra!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} id="btn-inspector-dismiss">Close Inspector</button>
        </div>
      </div>
    </div>
  );
}
