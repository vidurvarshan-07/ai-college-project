import React, { useState } from 'react';
import {
  Calculator, Zap, Compass, Activity, ArrowRight, CheckCircle2,
  Table, ChevronDown, ChevronUp, MapPin, Bot, Flag, ShieldCheck
} from 'lucide-react';
import { CELL_WEIGHTS, CELL_TYPES } from '../constants/gridConfig.js';

export default function CalculationConsole({
  selectedAlgo,
  heuristic,
  roverPos,
  start,
  goal,
  path = [],
  nodeDetailsMap,
  currentStep = 0,
  pathMetrics,
  isDriving,
  grid,
  isDestinationLocked = true
}) {
  const [showStepTable, setShowStepTable] = useState(false);

  // Active node to evaluate (rover position while driving or start position)
  const activeCoord = roverPos || start;
  const activeKey = `${activeCoord.r},${activeCoord.c}`;
  const details = nodeDetailsMap?.get(activeKey);

  // Calculate live delta coordinates to fixed destination
  const dr = Math.abs(activeCoord.r - goal.r);
  const dc = Math.abs(activeCoord.c - goal.c);

  // Live heuristic calculation breakdown
  let heuristicFormula = '';
  let heuristicVal = 0;

  if (heuristic === 'manhattan') {
    heuristicFormula = `|Δr| + |Δc| = |${activeCoord.r} - ${goal.r}| + |${activeCoord.c} - ${goal.c}| = ${dr} + ${dc}`;
    heuristicVal = dr + dc;
  } else if (heuristic === 'euclidean') {
    const rawEuc = Math.sqrt(dr * dr + dc * dc);
    heuristicFormula = `√((Δr)² + (Δc)²) = √(${dr}² + ${dc}²) = √${dr * dr + dc * dc}`;
    heuristicVal = Math.round(rawEuc * 10) / 10;
  } else {
    // Octile
    const rawOct = dr + dc + (Math.SQRT2 - 2) * Math.min(dr, dc);
    heuristicFormula = `Octile: dr + dc + (√2 - 2)·min(dr, dc)`;
    heuristicVal = Math.round(rawOct * 10) / 10;
  }

  // Cost g(n)
  const gVal = details?.g !== undefined ? Math.round(details.g * 10) / 10 : (currentStep > 0 ? currentStep : 0);
  const hVal = details?.h !== undefined ? Math.round(details.h * 10) / 10 : heuristicVal;
  const fVal = Math.round((gVal + hVal) * 10) / 10;

  // Build step-by-step calculation data for path
  const pathStepData = (path || []).map((pt, idx) => {
    const key = `${pt.r},${pt.c}`;
    const d = nodeDetailsMap?.get(key);
    const cellType = grid?.[pt.r]?.[pt.c] || 'empty';
    const weight = CELL_WEIGHTS[cellType] || 1;

    // Individual step heuristic to goal
    const sDr = Math.abs(pt.r - goal.r);
    const sDc = Math.abs(pt.c - goal.c);
    let sH = sDr + sDc;
    if (heuristic === 'euclidean') sH = Math.round(Math.sqrt(sDr * sDr + sDc * sDc) * 10) / 10;

    const stepG = d?.g !== undefined ? Math.round(d.g * 10) / 10 : idx;
    const stepH = d?.h !== undefined ? Math.round(d.h * 10) / 10 : sH;
    const stepF = Math.round((stepG + stepH) * 10) / 10;

    return {
      stepIndex: idx,
      r: pt.r,
      c: pt.c,
      terrain: cellType,
      weight,
      g: stepG,
      h: stepH,
      f: stepF,
      isActive: roverPos && roverPos.r === pt.r && roverPos.c === pt.c
    };
  });

  return (
    <div className="calculation-console-container" id="calculation-console">
      {/* Header Bar */}
      <div className="calc-header-row">
        <div className="calc-title-group">
          <div className="calc-icon-badge">
            <Calculator size={18} className="calc-icon" />
          </div>
          <div>
            <div className="calc-title">ALGORITHM CALCULATION ENGINE & LIVE MATH DISPLAY</div>
            <div className="calc-subtitle">
              Evaluating formula <code>f(n) = g(n) + h(n)</code> in real-time as robot moves towards fixed destination
            </div>
          </div>
        </div>

        <div className="calc-header-badges">
          <div className="badge-destination-fixed" title="Destination is anchored at this campus location">
            <Flag size={13} className="text-rose-400" />
            <span>Fixed Destination: <strong>Bay ({goal.r}, {goal.c})</strong></span>
          </div>

          <div className="badge-algo-mode">
            <Activity size={13} />
            <span>Algorithm: <strong>{selectedAlgo.toUpperCase()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Mathematical Cards Grid */}
      <div className="calc-math-grid">
        {/* Card 1: Position Anchors */}
        <div className="calc-card anchor-card">
          <div className="calc-card-label"><Compass size={13} /> Position Anchors</div>
          <div className="anchor-details">
            <div className="anchor-item">
              <Bot size={14} className="text-emerald-400" />
              <span>Robot Pos: <strong>({activeCoord.r}, {activeCoord.c})</strong></span>
            </div>
            <div className="anchor-arrow"><ArrowRight size={14} /></div>
            <div className="anchor-item">
              <Flag size={14} className="text-rose-400" />
              <span>Fixed Goal: <strong>({goal.r}, {goal.c})</strong></span>
            </div>
          </div>
          <div className="calc-formula-subtext">
            Distance: Δr = {dr} tiles | Δc = {dc} tiles
          </div>
        </div>

        {/* Card 2: g(n) Exact Accumulated Cost */}
        <div className="calc-card g-card">
          <div className="calc-card-label">
            <span>g(n) Actual Path Cost</span>
            <span className="calc-tag">Start ➔ Robot</span>
          </div>
          <div className="calc-card-value font-mono">{gVal} <span className="unit">units</span></div>
          <div className="calc-formula-subtext">
            Σ (Move Cost × Terrain Friction Weight)
          </div>
        </div>

        {/* Card 3: h(n) Heuristic Estimate to Goal */}
        <div className="calc-card h-card">
          <div className="calc-card-label">
            <span>h(n) Heuristic Estimate</span>
            <span className="calc-tag">{heuristic.toUpperCase()}</span>
          </div>
          <div className="calc-card-value font-mono">{hVal} <span className="unit">units</span></div>
          <div className="calc-formula-subtext">
            {heuristicFormula}
          </div>
        </div>

        {/* Card 4: f(n) Total Evaluation Score */}
        <div className="calc-card f-card">
          <div className="calc-card-label">
            <span>f(n) = g(n) + h(n) Total Score</span>
            <span className="calc-tag tag-total">Priority Key</span>
          </div>
          <div className="calc-card-value font-mono total-f-val">
            {fVal} <span className="unit">units</span>
          </div>
          <div className="calc-formula-subtext">
            Evaluation: {gVal} (cost) + {hVal} (heuristic) = {fVal}
          </div>
        </div>
      </div>

      {/* Path Calculation Telemetry Row */}
      <div className="calc-telemetry-strip">
        <div className="telemetry-stat">
          <span className="tel-label">Total Route Length:</span>
          <span className="tel-val font-mono">{pathMetrics?.pathLength || path.length} tiles</span>
        </div>
        <div className="telemetry-divider">|</div>

        <div className="telemetry-stat">
          <span className="tel-label">Cumulative Friction Cost:</span>
          <span className="tel-val font-mono">{pathMetrics?.pathCost || 0} units</span>
        </div>
        <div className="telemetry-divider">|</div>

        <div className="telemetry-stat">
          <span className="tel-label">Robot Travel Progress:</span>
          <span className="tel-val font-mono">
            {currentStep} / {path.length > 0 ? path.length - 1 : 0} steps ({path.length > 0 ? Math.round((currentStep / Math.max(1, path.length - 1)) * 100) : 0}%)
          </span>
        </div>
        <div className="telemetry-divider">|</div>

        <div className="telemetry-stat">
          <span className="tel-label">Algorithm Search Latency:</span>
          <span className="tel-val font-mono font-bold text-cyan-400">
            {pathMetrics?.executionTimeMs ? `${pathMetrics.executionTimeMs} ms` : '< 1 ms'}
          </span>
        </div>

        <button
          className="btn-toggle-step-table"
          onClick={() => setShowStepTable(prev => !prev)}
          id="btn-toggle-step-table"
          title="Toggle complete mathematical calculation breakdown for each step along the route"
        >
          <Table size={13} />
          <span>{showStepTable ? 'Hide Calculation Table' : `Show Step Calculations (${path.length} Steps)`}</span>
          {showStepTable ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Collapsible Step-by-Step Calculation Table */}
      {showStepTable && (
        <div className="step-calculation-table-wrapper" id="step-math-table">
          <table className="step-math-table">
            <thead>
              <tr>
                <th>Step #</th>
                <th>Coordinate (r, c)</th>
                <th>Terrain Type</th>
                <th>Friction Multiplier</th>
                <th>g(n) Accumulated</th>
                <th>h(n) To Goal</th>
                <th>f(n) = g + h</th>
                <th>Robot Status</th>
              </tr>
            </thead>
            <tbody>
              {pathStepData.map(step => (
                <tr
                  key={step.stepIndex}
                  className={`step-row ${step.isActive ? 'active-step-row' : ''}`}
                >
                  <td className="font-mono">#{step.stepIndex}</td>
                  <td className="font-mono font-bold">({step.r}, {step.c})</td>
                  <td>
                    <span className={`terrain-badge terrain-${step.terrain}`}>
                      {step.terrain.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-mono">{step.weight}x</td>
                  <td className="font-mono text-blue-400">{step.g}</td>
                  <td className="font-mono text-purple-400">{step.h}</td>
                  <td className="font-mono font-bold text-cyan-400">{step.f}</td>
                  <td>
                    {step.isActive ? (
                      <span className="status-pill-robot">
                        <Bot size={11} /> <strong>ROBOT HERE</strong>
                      </span>
                    ) : step.stepIndex === 0 ? (
                      <span className="status-pill-start">START</span>
                    ) : step.stepIndex === path.length - 1 ? (
                      <span className="status-pill-dest">DESTINATION BAY</span>
                    ) : step.stepIndex < currentStep ? (
                      <span className="status-pill-cleared">Traversed</span>
                    ) : (
                      <span className="status-pill-planned">Planned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
