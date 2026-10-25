import React from 'react';
import { Bot, Compass, Volume2, VolumeX, BarChart2, BookOpen, Sparkles, Navigation } from 'lucide-react';
import { CAMPUS_MISSIONS } from '../constants/missions.js';

export default function Header({
  selectedMission,
  onSelectMission,
  heuristic = 'manhattan',
  onSelectHeuristic,
  onOpenBenchmark,
  onOpenGuide,
  isMuted,
  onToggleMute
}) {
  const heuristics = [
    { id: 'manhattan', label: 'Manhattan', formula: '|Δr| + |Δc|', badge: 'Standard L1' },
    { id: 'euclidean', label: 'Euclidean', formula: '√(Δr² + Δc²)', badge: 'Direct Line' },
    { id: 'octile', label: 'Octile', formula: 'Diagonal Metric', badge: '8-Dir Grid' }
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
            <div className="brand-subtitle">AI College Automaton A* Pathfinding Simulator</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-pill-btn benchmark-btn"
            onClick={onOpenBenchmark}
            id="btn-open-benchmark"
            title="Compare A* heuristics side-by-side"
          >
            <BarChart2 size={16} />
            <span>A* Heuristics Benchmark</span>
          </button>

          <button
            className="action-pill-btn guide-btn"
            onClick={onOpenGuide}
            id="btn-open-guide"
            title="Read A* mathematical theory & formula guide"
          >
            <BookOpen size={16} />
            <span>A* Guide</span>
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
          <div className="active-algo-tag-group">
            <span className="control-label"><Navigation size={14} /> Algorithm:</span>
            <div className="algo-badge-main">
              <strong>A* Search</strong>
              <span className="algo-code-pill">f(n) = g(n) + h(n)</span>
            </div>
          </div>

          <span className="control-label" style={{ marginLeft: 8 }}><Sparkles size={14} /> Heuristic h(n):</span>
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
                <span className="algo-badge">{h.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
