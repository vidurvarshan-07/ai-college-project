import React from 'react';
import {
  Play, Pause, SkipForward, RotateCcw, Bot, Sparkles, RefreshCw,
  Sliders, Grid, Trash2, Wand2, Compass, ArrowRight, CornerDownRight,
  Pencil, Minus, Square, MapPin, Radio, Zap, ShieldAlert, CheckCircle2,
  AlertOctagon, Activity, Lock, Flag
} from 'lucide-react';
import { BRUSH_TYPES, DRAW_TOOLS } from '../constants/gridConfig.js';

export default function ControlPanel({
  onRunAlgorithm,
  onDriveRover,
  onPauseResume,
  onStepForward,
  onResetPath,
  onResetCampus,
  onGenerateMaze,
  onClearObstacles,
  isFinding,
  isPaused,
  isDriving,
  hasPath,
  isLiveCalculate,
  onToggleLiveCalculate,
  drawTool,
  onSelectDrawTool,
  currentBrush,
  onSelectBrush,
  speed,
  onSelectSpeed,
  allowDiagonal,
  onToggleDiagonal,
  heuristic,
  onSelectHeuristic,
  selectedAlgo,
  showLidar,
  onToggleLidar,
  pathMetrics,
  waypoints = [],
  onAddWaypointMode,
  isPlacingRobot,
  onTogglePlaceRobot,
  goal
}) {
  const speeds = [
    { label: 'Instant', val: 0 },
    { label: 'Fast', val: 12 },
    { label: 'Normal', val: 35 },
    { label: 'Cinematic', val: 90 }
  ];

  const heuristics = [
    { id: 'manhattan', label: 'Manhattan (|Δx|+|Δy|)' },
    { id: 'euclidean', label: 'Euclidean (Straight Line)' },
    { id: 'octile', label: 'Octile (Diagonal Grid)' }
  ];

  return (
    <div className="control-panel-container" id="control-panel">
      {/* Top Playback Actions & Primary Robot Deploy */}
      <div className="playback-actions-bar">
        {/* Place Robot Anywhere Quick Action */}
        <button
          className={`btn-primary-action btn-place-robot ${isPlacingRobot ? 'placing-active pulse-glow' : ''}`}
          onClick={onTogglePlaceRobot}
          disabled={isFinding || isDriving}
          id="btn-place-robot-toggle"
          title="Click this, then click ANY tile on the map to deploy the robot at that exact position"
        >
          <Bot size={16} />
          <span>{isPlacingRobot ? '📍 Click Map to Deploy Robot' : '🤖 Place Robot Anywhere'}</span>
        </button>

        {/* Live Auto-Calculate Master Toggle */}
        <button
          className={`btn-live-toggle ${isLiveCalculate ? 'live-active' : ''}`}
          onClick={onToggleLiveCalculate}
          id="btn-toggle-live-calc"
          title="When enabled, path and mathematical formulas recalculate live as you plot obstacles or move the robot"
        >
          <Zap size={15} className={isLiveCalculate ? 'zap-glow' : ''} />
          <span>{isLiveCalculate ? '⚡ Live Path: ON' : '⚡ Live Path: OFF'}</span>
        </button>

        {/* Drive Rover / Follow Algorithm */}
        <button
          className={`btn-primary-action btn-drive-rover ${hasPath && !isDriving ? 'pulse-glow' : ''}`}
          onClick={onDriveRover}
          disabled={!hasPath || isFinding || isDriving}
          id="btn-drive-rover"
          title="Make the robot follow the algorithm step-by-step to the fixed destination"
        >
          <Play size={16} fill="currentColor" />
          <span>Follow Algorithm to Goal</span>
        </button>

        {(isFinding || isDriving) && (
          <button
            className="btn-playback-control"
            onClick={onPauseResume}
            id="btn-pause-resume"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        )}

        {isPaused && (
          <button
            className="btn-playback-control"
            onClick={onStepForward}
            id="btn-step-forward"
          >
            <SkipForward size={16} />
            <span>Step</span>
          </button>
        )}

        <button
          className="btn-secondary-action"
          onClick={onResetPath}
          disabled={isFinding || isDriving}
          id="btn-reset-path"
          title="Clear search trail and path"
        >
          <RotateCcw size={15} />
          <span>Clear Route</span>
        </button>

        {/* Fixed Destination Anchor Pill */}
        <div className="badge-destination-fixed-pill" title="Destination remains in this fixed area while robot moves">
          <Flag size={13} className="text-rose-400" />
          <span>Fixed Destination: <strong>Bay ({goal?.r ?? 4}, {goal?.c ?? 8})</strong></span>
          <Lock size={11} className="lock-subtle" />
        </div>
      </div>

      {/* Row 2: Obstacle Plotting Tools & Shapes */}
      <div className="drawing-toolbar-row">
        <div className="tool-selector-group">
          <span className="setting-label"><Wand2 size={13} /> Plot Obstacles:</span>
          <div className="tool-buttons-track">
            {DRAW_TOOLS.map(tool => {
              const IconComponent =
                tool.id === 'brush' ? Pencil :
                tool.id === 'line' ? Minus :
                tool.id === 'rect' ? Square :
                tool.id === 'cluster' ? Sparkles : Trash2;

              return (
                <button
                  key={tool.id}
                  className={`draw-tool-btn ${drawTool === tool.id && !isPlacingRobot ? 'active' : ''}`}
                  onClick={() => onSelectDrawTool(tool.id)}
                  title={tool.desc}
                  id={`tool-${tool.id}`}
                >
                  <IconComponent size={14} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Waypoint Button */}
        <div className="waypoint-control-group">
          <button
            className={`btn-add-waypoint ${currentBrush === 'waypoint' ? 'active' : ''}`}
            onClick={onAddWaypointMode}
            id="btn-add-waypoint"
            title="Click anywhere on the campus to add an intermediate mission stop"
          >
            <MapPin size={14} />
            <span>+ Add Waypoint ({waypoints.length})</span>
          </button>
        </div>

        {/* LiDAR Radar Vision Toggle */}
        <div className="sensor-toggle-group">
          <label className="checkbox-toggle" title="Visualize real-time 360-degree LiDAR sensor rays on the rover">
            <input
              type="checkbox"
              checked={showLidar}
              onChange={onToggleLidar}
              id="check-toggle-lidar"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text"><Radio size={13} style={{ display: 'inline', marginRight: 4 }} /> LiDAR Vision</span>
          </label>
        </div>
      </div>

      {/* Row 3: Brush Material Selector & Campus Presets */}
      <div className="tools-row">
        <div className="brush-palette-wrap">
          <span className="setting-label">Obstacle / Terrain Type:</span>
          <div className="brush-chips-track">
            {BRUSH_TYPES.filter(b => b.id !== 'start' && b.id !== 'goal').map(brush => (
              <button
                key={brush.id}
                className={`brush-chip ${currentBrush === brush.id && !isPlacingRobot ? 'active' : ''}`}
                onClick={() => onSelectBrush(brush.id)}
                title={brush.desc}
                id={`brush-${brush.id}`}
                style={{
                  borderColor: currentBrush === brush.id && !isPlacingRobot ? brush.color : 'transparent',
                  backgroundColor: currentBrush === brush.id && !isPlacingRobot ? `${brush.color}26` : 'rgba(255,255,255,0.03)'
                }}
              >
                <span className="brush-dot" style={{ backgroundColor: brush.color }}></span>
                <span>{brush.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="campus-presets-wrap">
          <button
            className="preset-btn"
            onClick={onResetCampus}
            id="btn-reset-campus-blueprint"
            title="Reset to default College Campus Blueprint"
          >
            <Grid size={14} />
            <span>Campus Blueprint</span>
          </button>

          <button
            className="preset-btn"
            onClick={onGenerateMaze}
            id="btn-generate-maze"
            title="Generate random corridors and obstacles"
          >
            <Sparkles size={14} />
            <span>Generate Maze</span>
          </button>

          <button
            className="preset-btn danger-text"
            onClick={onClearObstacles}
            id="btn-clear-obstacles"
            title="Remove all walls and weight zones"
          >
            <Trash2 size={14} />
            <span>Clear Obstacles</span>
          </button>
        </div>
      </div>

      {/* Row 4: Speed, Heuristic, Diagonals */}
      <div className="settings-row">
        <div className="setting-group">
          <span className="setting-label"><Sliders size={13} /> Animation Speed:</span>
          <div className="speed-pills">
            {speeds.map(s => (
              <button
                key={s.val}
                className={`speed-pill ${speed === s.val ? 'active' : ''}`}
                onClick={() => onSelectSpeed(s.val)}
                id={`speed-${s.label.toLowerCase()}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {selectedAlgo === 'astar' && (
          <div className="setting-group">
            <span className="setting-label"><Compass size={13} /> A* Heuristic:</span>
            <select
              className="custom-select"
              value={heuristic}
              onChange={e => onSelectHeuristic(e.target.value)}
              id="select-heuristic"
            >
              {heuristics.map(h => (
                <option key={h.id} value={h.id}>{h.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="setting-group diagonal-group">
          <label className="checkbox-toggle" id="toggle-diagonal-wrap">
            <input
              type="checkbox"
              checked={allowDiagonal}
              onChange={onToggleDiagonal}
              id="check-allow-diagonal"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">8-Directional Diagonal Movement</span>
          </label>
        </div>
      </div>
    </div>
  );
}
