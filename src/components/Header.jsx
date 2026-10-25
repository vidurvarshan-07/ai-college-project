import React from 'react';
import { Bot, Compass, Volume2, VolumeX, BarChart2, BookOpen, Sparkles, Navigation } from 'lucide-react';
import { CAMPUS_MISSIONS } from '../constants/missions.js';

export default function Header({
  selectedMission,
  onSelectMission,
  selectedAlgo = 'astar',
  onSelectAlgo,
  heuristic = 'manhattan',
  onSelectHeuristic,
  onOpenBenchmark,
  onOpenGuide,
  isMuted,
  onToggleMute
}) {
  const algorithms = [
    { id: 'astar', label: 'A* Search', badge: 'f(n) = g + h', desc: 'Optimal & Informed' },
    { id: 'bfs', label: 'BFS', badge: 'Queue (FIFO)', desc: 'Fewest Step Hops' },
    { id: 'dfs', label: 'DFS', badge: 'Stack (LIFO)', desc: 'Deep Exploration' }
  ];

  const heuristics = [
    { id: 'manhattan', label: 'Manhattan', formula: '|Δr| + |Δc|' },
    { id: 'euclidean', label: 'Euclidean', formula: '√(Δr² + Δc²)' },
    { id: 'octile', label: 'Octile', formula: 'Diagonal Metric' }
  ];

  return (
    <header className="app-header" id="main-header">
      <div className="header-top-row">
        <div className="brand-wrap">
          <div className="brand-logo-glow">
            <Bot size={28} className="brand-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">CAMPUS AUTO-NAV</div>
            <div className="brand-subtitle">AI College Automaton Pathfinding Simulator (A*, BFS, DFS)</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-pill-btn benchmark-btn"
            onClick={onOpenBenchmark}
            id="btn-open-benchmark"
            title="Compare A*, BFS, and DFS side-by-side"
          >
            <BarChart2 size={16} />
            <span>Compare Algorithms</span>
          </button>

          <button
            className="action-pill-btn guide-btn"
            onClick={onOpenGuide}
            id="btn-open-guide"
            title="Read algorithm theory and comparisons"
          >
            <BookOpen size={16} />
            <span>Algorithm Guide</span>
          </button>

          <button
            className="action-pill-btn sound-btn"
            onClick={onToggleMute}
            id="btn-toggle-sound"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} color="#94a3b8" /> : <Volume2 size={16} color="#00f2fe" />}
          </button>
        </div>
      </div>

      <div className="header-bottom-row">
        {/* Missions Selector */}
        <div className="mission-selector-wrap">
          <span className="control-label"><Compass size={14} /> Mission:</span>
          <select
            className="mission-dropdown"
            value={selectedMission?.id || ''}
            onChange={(e) => {
              const m = CAMPUS_MISSIONS.find(item => item.id === e.target.value);
              if (m) onSelectMission(m);
            }}
            id="select-mission-dropdown"
          >
            {CAMPUS_MISSIONS.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Algorithm & Heuristic Bar */}
        <div className="algo-selector-pills" id="algo-pills-container">
          <span className="control-label"><Navigation size={14} /> Algorithm:</span>
          <div className="pills-track">
            {algorithms.map(algo => (
              <button
                key={algo.id}
                className={`algo-pill-btn ${selectedAlgo === algo.id ? 'active' : ''}`}
                onClick={() => onSelectAlgo(algo.id)}
                id={`btn-algo-${algo.id}`}
                title={algo.desc}
              >
                <span className="algo-name">{algo.label}</span>
                <span className="algo-badge">{algo.badge}</span>
              </button>
            ))}
          </div>

          {selectedAlgo === 'astar' && (
            <div className="active-algo-tag-group" style={{ marginLeft: 8 }}>
              <span className="control-label"><Sparkles size={14} /> Heuristic:</span>
              <div className="pills-track">
                {heuristics.map(h => (
                  <button
                    key={h.id}
                    className={`algo-pill-btn ${heuristic === h.id ? 'active' : ''}`}
                    onClick={() => onSelectHeuristic?.(h.id)}
                    id={`btn-heuristic-${h.id}`}
                    title={`Heuristic formula: ${h.formula}`}
                  >
                    <span className="algo-name">{h.label}</span>
                    <span className="algo-badge">{h.formula}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
