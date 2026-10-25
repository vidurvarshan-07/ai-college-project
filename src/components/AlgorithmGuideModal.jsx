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
            <h4><Navigation size={18} className="section-icon" /> 1. A* (A-Star) Search Algorithm</h4>
            <p>
              A* is the industry standard for autonomous robotics and game AI pathfinding. It evaluates each candidate node using the formula:
            </p>
            <div className="math-callout">
              <strong>f(n) = g(n) + h(n)</strong>
              <ul>
                <li><code>g(n)</code>: The actual exact cost accumulated from the start node to node <em>n</em> (including terrain friction like grass, stairs, crowds).</li>
                <li><code>h(n)</code>: The heuristic estimate of the remaining cost from node <em>n</em> to the goal.</li>
                <li><code>f(n)</code>: The total estimated path cost going through node <em>n</em>.</li>
              </ul>
            </div>
            <p>
              <strong>Why it excels:</strong> If the heuristic is <em>admissible</em> (never overestimates the true distance, e.g., Manhattan or Euclidean distance), A* is mathematically guaranteed to return the optimal shortest path while expanding far fewer nodes than blind searches.
            </p>
          </section>

          <section className="guide-section">
            <h4><Zap size={18} className="section-icon" /> 2. Dijkstra's Algorithm</h4>
            <p>
              Dijkstra is equivalent to A* with <code>h(n) = 0</code>. It always expands the node with the lowest cumulative cost <code>g(n)</code>.
            </p>
            <p>
              <strong>When to use:</strong> Ideal when you need to calculate paths to multiple destinations simultaneously, or when no reliable heuristic exists. However, for point-to-point campus navigation, it wastes computation exploring outward in concentric circles away from the target.
            </p>
          </section>

          <section className="guide-section">
            <h4><Compass size={18} className="section-icon" /> 3. Breadth-First Search (BFS)</h4>
            <p>
              BFS explores the graph layer by layer using a First-In, First-Out (FIFO) queue. It guarantees the minimum number of step hops on <strong>unweighted</strong> graphs.
            </p>
            <p>
              <strong>Limitation:</strong> BFS is blind to terrain costs. On a campus with steep stairwells (cost: 7) and open paved roads (cost: 1), BFS might choose the stairs because it has the same number of tile steps!
            </p>
          </section>

          <section className="guide-section">
            <h4><Cpu size={18} className="section-icon" /> 4. Greedy Best-First Search</h4>
            <p>
              Greedy evaluates nodes using only <code>f(n) = h(n)</code>, completely ignoring the distance already traveled.
            </p>
            <p>
              <strong>Trap:</strong> It charges directly towards the destination. When faced with large campus buildings or dead ends, it easily gets trapped and yields suboptimal, convoluted paths.
            </p>
          </section>

          <section className="guide-section">
            <h4><ShieldCheck size={18} className="section-icon" /> 5. Dynamic Replanning (D* / Dynamic A*)</h4>
            <p>
              In production autonomous vehicles, unforeseen obstacles (construction, crowds, delivery trucks) frequently block paths.
              In this simulator, clicking <strong>"Inject Sudden Roadblock"</strong> simulates unexpected sensor detection, immediately halting the rover and recalculating an alternate optimal route from its current position!
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
