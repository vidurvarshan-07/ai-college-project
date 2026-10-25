import React, { useState, useMemo } from 'react';
import {
  Bot, Flag, Trees, Users, Footprints, ShieldAlert,
  Sparkles, Navigation2, MapPin, Radio, Zap, Lock, Crosshair
} from 'lucide-react';
import { CELL_TYPES, CELL_WEIGHTS } from '../constants/gridConfig.js';
import { CAMPUS_BUILDINGS } from '../constants/campusBuildings.js';
import { getLineCells, getRectCells, calculateLidarRays } from '../utils/drawing.js';

export default function CampusGrid({
  grid,
  start,
  goal,
  waypoints = [],
  path = [],
  visitedNodes = [],
  roverPos,
  roverHeading,
  isNavigating,
  drawTool = 'brush',
  currentBrush = 'wall',
  isPlacingRobot = false,
  showLidar = true,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onInspectNode,
  inspectedNode,
  onMoveStart,
  onMoveGoal,
  onMoveWaypoint,
  onRemoveWaypoint,
  onPlaceRobot,
  previewCells = []
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const pathSet = useMemo(() => new Set((path || []).map(p => `${p.r},${p.c}`)), [path]);
  const visitedSet = useMemo(() => new Set((visitedNodes || []).map(v => `${v.r},${v.c}`)), [visitedNodes]);
  const previewSet = useMemo(() => new Set((previewCells || []).map(p => `${p.r},${p.c}`)), [previewCells]);

  // Waypoints map for O(1) lookup
  const waypointMap = useMemo(() => {
    const map = new Map();
    waypoints.forEach((w, idx) => {
      map.set(`${w.r},${w.c}`, { ...w, index: idx + 1 });
    });
    return map;
  }, [waypoints]);

  // Rover rotation angle (degrees)
  const getRoverRotation = () => {
    if (typeof roverHeading === 'number') {
      return roverHeading;
    }
    switch (roverHeading) {
      case 'N': return -90;
      case 'S': return 90;
      case 'E': return 0;
      case 'W': return 180;
      case 'NE': return -45;
      case 'NW': return -135;
      case 'SE': return 45;
      case 'SW': return 135;
      default: return 0;
    }
  };

  // LiDAR raycasting calculation
  const lidarRays = useMemo(() => {
    if (!showLidar || !roverPos) return [];
    return calculateLidarRays(roverPos, grid, 7);
  }, [showLidar, roverPos, grid]);

  // Calculate SVG laser path points (grid coordinates converted to percentage or cell centers)
  const svgPathD = useMemo(() => {
    if (!path || path.length < 2) return '';
    const numRows = grid.length;
    const numCols = grid[0].length;
    return path.reduce((acc, pt, idx) => {
      const x = ((pt.c + 0.5) / numCols) * 100;
      const y = ((pt.r + 0.5) / numRows) * 100;
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [path, grid]);

  return (
    <div
      className={`campus-grid-container ${isPlacingRobot ? 'placing-robot-cursor' : ''}`}
      id="campus-grid-wrapper"
      onMouseLeave={onCellMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Viewport Stage: Guarantees 100% exact sub-pixel alignment of Grid, Buildings, and SVG Laser */}
      <div className="grid-viewport-stage" id="grid-viewport-stage">
        {/* Grid Matrix of Cells */}
        <div
          className="grid-matrix"
          style={{
            gridTemplateRows: `repeat(${grid.length}, 1fr)`,
            gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`
          }}
          id="campus-grid-cells"
        >
          {grid.map((row, r) =>
            row.map((cellType, c) => {
              const key = `${r},${c}`;
              const isStart = r === start.r && c === start.c;
              const isGoal = r === goal.r && c === goal.c;
              const isRover = roverPos && r === roverPos.r && c === roverPos.c;
              const isPath = pathSet.has(key);
              const isVisited = visitedSet.has(key) && !isPath;
              const isInspected = inspectedNode && inspectedNode.r === r && inspectedNode.c === c;
              const isPreview = previewSet.has(key);
              const waypointInfo = waypointMap.get(key);
              const isHoveredForPlacing = isPlacingRobot && hoveredCell && hoveredCell.r === r && hoveredCell.c === c && !isGoal && cellType !== CELL_TYPES.WALL && cellType !== CELL_TYPES.ROADBLOCK;

              // Class generation
              const cellClasses = ['grid-cell'];
              if (isStart) cellClasses.push('cell-start');
              else if (isGoal) cellClasses.push('cell-goal cell-fixed-destination');
              else if (waypointInfo) cellClasses.push('cell-waypoint');
              else if (cellType === CELL_TYPES.WALL) cellClasses.push('cell-wall');
              else if (cellType === CELL_TYPES.ROADBLOCK) cellClasses.push('cell-roadblock');
              else if (cellType === CELL_TYPES.LAWN) cellClasses.push('cell-lawn');
              else if (cellType === CELL_TYPES.CROWD) cellClasses.push('cell-crowd');
              else if (cellType === CELL_TYPES.STAIRS) cellClasses.push('cell-stairs');

              if (isPreview) cellClasses.push('cell-preview-obstacle');
              if (isVisited) cellClasses.push('cell-visited');
              if (isPath) cellClasses.push('cell-path');
              if (isInspected) cellClasses.push('cell-inspected');
              if (isHoveredForPlacing) cellClasses.push('cell-placing-hover');

              return (
                <div
                  key={key}
                  className={cellClasses.join(' ')}
                  id={`cell-${r}-${c}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (e.button === 2 && waypointInfo) {
                      onRemoveWaypoint && onRemoveWaypoint(waypointInfo.id);
                      return;
                    }
                    if (isPlacingRobot) {
                      onPlaceRobot && onPlaceRobot(r, c);
                      return;
                    }
                    onCellMouseDown(r, c, { isStart, isGoal, waypointInfo });
                  }}
                  onMouseEnter={() => {
                    onCellMouseEnter(r, c);
                    setHoveredCell({
                      r,
                      c,
                      type: isGoal ? 'FIXED DESTINATION BAY' : (isStart ? 'ROBOT DEPLOY' : (waypointInfo ? 'WAYPOINT' : cellType)),
                      weight: CELL_WEIGHTS[cellType] || 1,
                      isPath,
                      waypointIndex: waypointInfo?.index
                    });
                  }}
                  onMouseUp={onCellMouseUp}
                  onClick={(e) => {
                    if (isPlacingRobot) {
                      onPlaceRobot && onPlaceRobot(r, c);
                      return;
                    }
                    if (e.shiftKey) {
                      onInspectNode({ r, c, type: cellType, weight: CELL_WEIGHTS[cellType] || 1 });
                    }
                  }}
                >
                  {/* Visual Icons */}
                  {isStart && !isRover && (
                    <div className="icon-pulse green-pulse" title="Rover Spawn Point (Drag or click Place Robot to move)">
                      <Bot size={13} color="#ffffff" />
                    </div>
                  )}

                  {/* Fixed Destination Bay Marker */}
                  {isGoal && (
                    <div className="icon-pulse red-pulse fixed-destination-beacon" title="Fixed Destination Loading Bay (Docking Hub)">
                      <Flag size={13} color="#ffffff" />
                      <span className="dest-lock-icon"><Lock size={8} /></span>
                    </div>
                  )}

                  {/* Holographic Ghost Preview when Placing Robot */}
                  {isHoveredForPlacing && !isStart && (
                    <div className="ghost-robot-preview">
                      <Bot size={14} className="ghost-robot-icon" />
                    </div>
                  )}

                  {waypointInfo && (
                    <div className="icon-pulse amber-pulse waypoint-badge" title={`Waypoint #${waypointInfo.index} (Right-click to remove)`}>
                      <MapPin size={11} color="#f59e0b" />
                      <span className="waypoint-num">{waypointInfo.index}</span>
                    </div>
                  )}

                  {/* Animated Rover Avatar */}
                  {isRover && (
                    <div
                      className="rover-avatar"
                      style={{ transform: `rotate(${getRoverRotation()}deg)` }}
                      id="rover-active-avatar"
                      title="Active Rover (Running Algorithm Path)"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <rect x="4" y="6" width="16" height="12" rx="3" fill="#00f2fe" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="16" cy="12" r="3" fill="#ef4444" />
                        <path d="M16 12 L22 8 M16 12 L22 16" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                        <rect x="6" y="3" width="12" height="3" rx="1" fill="#1e293b" />
                        <rect x="6" y="18" width="12" height="3" rx="1" fill="#1e293b" />
                      </svg>
                    </div>
                  )}

                  {cellType === CELL_TYPES.LAWN && !isPath && !isVisited && (
                    <span className="cell-mini-icon lawn-icon"><Trees size={10} /></span>
                  )}
                  {cellType === CELL_TYPES.CROWD && !isPath && !isVisited && (
                    <span className="cell-mini-icon crowd-icon"><Users size={10} /></span>
                  )}
                  {cellType === CELL_TYPES.STAIRS && !isPath && !isVisited && (
                    <span className="cell-mini-icon stairs-icon"><Footprints size={10} /></span>
                  )}
                  {cellType === CELL_TYPES.ROADBLOCK && (
                    <span className="cell-mini-icon roadblock-icon"><ShieldAlert size={10} /></span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Building Overlays: Exactly coincident with grid cells */}
        <div className="buildings-layer">
          {CAMPUS_BUILDINGS.map(b => (
            <div
              key={b.id}
              className={`building-overlay-card ${b.type === 'lawn' ? 'building-card-lawn' : ''}`}
              style={{
                gridRowStart: b.r + 1,
                gridRowEnd: b.r + b.h + 1,
                gridColumnStart: b.c + 1,
                gridColumnEnd: b.c + b.w + 1,
                borderColor: b.border,
                backgroundColor: b.bg
              }}
              title={`${b.name} (${b.code}): ${b.desc}`}
              id={`building-${b.id}`}
            >
              <div className="building-header-tag" style={{ color: b.color }}>
                <span className="building-code">{b.code}</span>
              </div>
              <div className="building-name" style={{ color: '#f8fafc' }}>{b.name}</div>
              <div className="building-door-indicator" style={{ borderColor: b.color }}>
                <span>ENTRANCE DOCK</span>
              </div>
            </div>
          ))}
        </div>

        {/* SVG Path Laser Beam & LiDAR Radar Overlay */}
        <svg className="grid-laser-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* LiDAR Radar Scanner Rays */}
          {showLidar && roverPos && lidarRays.map((ray, idx) => {
            const numRows = grid.length;
            const numCols = grid[0].length;
            const x1 = ((roverPos.c + 0.5) / numCols) * 100;
            const y1 = ((roverPos.r + 0.5) / numRows) * 100;
            const x2 = ((ray.endC + 0.5) / numCols) * 100;
            const y2 = ((ray.endR + 0.5) / numRows) * 100;

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={ray.hit ? 'rgba(244, 63, 94, 0.45)' : 'rgba(0, 242, 254, 0.22)'}
                  strokeWidth="0.25"
                  strokeDasharray={ray.hit ? '0.5, 0.5' : 'none'}
                />
                {ray.hit && (
                  <circle
                    cx={x2}
                    cy={y2}
                    r="0.55"
                    fill="#f43f5e"
                    className="lidar-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Dynamic Neon Laser Path Line */}
          {svgPathD && (
            <>
              <path
                d={svgPathD}
                fill="none"
                stroke="#00f2fe"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="svg-path-glow"
              />
              <path
                d={svgPathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1.2, 0.8"
                className="svg-path-dash-anim"
              />
            </>
          )}
        </svg>
      </div>

      {/* Floating Coordinate Status Tooltip */}
      {hoveredCell && (
        <div className="grid-status-bar" id="grid-status-info">
          <span>Coordinate: <strong>({hoveredCell.r}, {hoveredCell.c})</strong></span>
          <span className="divider">|</span>
          <span>Target Area: <strong style={{ color: '#ef4444' }}>FIXED DESTINATION BAY ({goal.r}, {goal.c})</strong></span>
          <span className="divider">|</span>
          <span>Mode: <strong style={{ color: isPlacingRobot ? '#10b981' : '#00f2fe' }}>
            {isPlacingRobot ? '📍 CLICK ANYWHERE TO PLACE ROBOT' : `${drawTool.toUpperCase()} (${currentBrush.toUpperCase()})`}
          </strong></span>
          <span className="divider">|</span>
          <span className="tip-text">Draw obstacles or place robot • System calculates path & displays math</span>
        </div>
      )}
    </div>
  );
}
