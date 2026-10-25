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
            <h4><Compass size={18} className="section-icon" /> 2. Breadth-First Search (BFS)</h4>
            <p>
              BFS explores the campus graph layer-by-layer expanding outward radially using a <strong>First-In, First-Out (FIFO) queue</strong>.
            </p>
            <div className="math-callout">
              <strong>Unweighted Shortest Path</strong>
              <ul>
                <li>Guarantees the minimum number of step hops on unweighted graphs.</li>
                <li><strong>Limitation:</strong> Unaware of terrain weights (e.g. treats grass lawns and muddy stairs identically to open paved roads).</li>
              </ul>
            </div>
          </section>

          <section className="guide-section">
            <h4><Zap size={18} className="section-icon" /> 3. Depth-First Search (DFS)</h4>
            <p>
              DFS explores as deeply as possible along each branch before backtracking, utilizing a <strong>Last-In, First-Out (LIFO) stack</strong>.
            </p>
            <div className="math-callout">
              <strong>Deep Path Exploration</strong>
              <ul>
                <li>Memory-efficient, but does not guarantee the shortest path or optimal cost.</li>
                <li>Frequently produces winding, convoluted detours around campus buildings.</li>
              </ul>
            </div>
          </section>

          <section className="guide-section">
            <h4><ShieldCheck size={18} className="section-icon" /> 4. Real-Time Dynamic Replanning</h4>
            <p>
              In real-world university campuses, unexpected obstacles (construction roadblocks, delivery carts, crowds) suddenly appear.
            </p>
            <p>
              This simulator equips the rover with simulated 360&deg; LiDAR sensors. Clicking <strong>"Inject Sudden Roadblock"</strong> simulates an unexpected obstacle detection: the rover instantly halts, marks the blockage, and recalculates an alternate optimal trajectory on the fly!
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
