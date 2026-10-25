import React from 'react';
import { X, BookOpen, Navigation, Zap, Compass, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export default function AlgorithmGuideModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} id="guide-modal-backdrop">
      <div className="modal-card guide-card" onClick={e => e.stopPropagation()} id="guide-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen className="modal-icon" size={22} />
            <div>
              <h3>AI College Pathfinding & Navigation Guide</h3>
              <p className="modal-subtitle">Comprehensive theory, mathematical formulas, and algorithm comparison</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-guide">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body guide-content">
          <section className="guide-section">
            <h4><Navigation size={18} className="section-icon" /> 1. The A* (A-Star) Evaluation Function</h4>
            <p>
              A* is the benchmark algorithm for autonomous ground vehicles and robotics. At each step, it selects the node from the open frontier with the lowest estimated total cost:
            </p>
            <div className="math-callout">
              <strong>f(n) = g(n) + h(n)</strong>
              <ul>
                <li><code>g(n)</code>: The exact accumulated cost to travel from the start position to current tile <em>n</em> (factoring in terrain friction like walkways: 1x, lawns: 3x, stairwells: 7x).</li>
                <li><code>h(n)</code>: The admissible heuristic estimate of the remaining cost from node <em>n</em> directly to the target goal.</li>
                <li><code>f(n)</code>: The total estimated cost of the cheapest path through node <em>n</em> to the destination.</li>
              </ul>
            </div>
          </section>

          <section className="guide-section">
            <h4><Compass size={18} className="section-icon" /> 2. Admissibility & Optimality Guarantee</h4>
            <p>
              An A* heuristic is <strong>admissible</strong> if it never overestimates the actual distance to the goal:
            </p>
            <div className="math-callout">
              <strong>0 &le; h(n) &le; h*(n)</strong>
            </div>
            <p>
              Because our heuristics (Manhattan, Euclidean, Octile) never overestimate the straight-line distance, A* is mathematically guaranteed to find the absolute shortest path while expanding the minimum necessary nodes.
            </p>
          </section>

          <section className="guide-section">
            <h4><Zap size={18} className="section-icon" /> 3. Campus Heuristic Strategies</h4>
            <div className="math-callout">
              <ul>
                <li><strong>Manhattan Distance:</strong> <code>h(n) = |&Delta;r| + |&Delta;c|</code>. Optimal for standard 4-directional grid walkways where diagonal movement is constrained.</li>
                <li><strong>Euclidean Distance:</strong> <code>h(n) = &radic;((&Delta;r)&sup2; + (&Delta;c)&sup2;)</code>. Straight-line distance; provides smooth, direct vector orientation.</li>
                <li><strong>Octile Distance:</strong> <code>h(n) = &Delta;r + &Delta;c + (&radic;2 - 2)&middot;min(&Delta;r, &Delta;c)</code>. The ideal admissible heuristic when 8-directional diagonal movement is enabled.</li>
              </ul>
            </div>
          </section>

          <section className="guide-section">
            <h4><ShieldCheck size={18} className="section-icon" /> 4. Real-Time Dynamic Replanning</h4>
            <p>
              In real-world university campuses, unexpected obstacles (construction roadblocks, delivery carts, crowds) suddenly appear.
            </p>
            <p>
              This simulator equips the rover with simulated 360&deg; LiDAR sensors. Clicking <strong>"Inject Sudden Roadblock"</strong> simulates an unexpected obstacle detection: the rover instantly halts, marks the blockage, and recalculates an alternate optimal A* trajectory on the fly!
            </p>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} id="btn-close-guide-footer">Understood</button>
        </div>
      </div>
    </div>
  );
}
