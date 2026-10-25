import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import RoverHUD from './components/RoverHUD.jsx';
import CalculationConsole from './components/CalculationConsole.jsx';
import CampusGrid from './components/CampusGrid.jsx';
import Legend from './components/Legend.jsx';
import AlgorithmComparison from './components/AlgorithmComparison.jsx';
import NodeInspectorModal from './components/NodeInspectorModal.jsx';
import AlgorithmGuideModal from './components/AlgorithmGuideModal.jsx';

import {
  GRID_ROWS,
  GRID_COLS,
  CELL_TYPES,
  CELL_WEIGHTS,
  DEFAULT_START,
  DEFAULT_GOAL
} from './constants/gridConfig.js';
import { CAMPUS_BUILDINGS } from './constants/campusBuildings.js';
import { CAMPUS_MISSIONS } from './constants/missions.js';

import { runAStar } from './algorithms/astar.js';
import { manhattan, euclidean, octile } from './algorithms/heuristics.js';
import { runAllAlgorithms } from './algorithms/comparisonHelper.js';
import { generateRecursiveDivision } from './algorithms/mazeGenerator.js';
import {
  getLineCells,
  getRectCells,
  getClusterCells,
  solveMultiPointPath
} from './utils/drawing.js';
import { sounds } from './utils/audio.js';

export default function App() {
  // Grid Initialization
  const createEmptyGrid = () => {
    return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(CELL_TYPES.EMPTY));
  };

  const populateCampusBlueprint = () => {
    const newGrid = createEmptyGrid();

    // 1. Fill building footprints & doors
    CAMPUS_BUILDINGS.forEach(b => {
      const isLawn = b.type === 'lawn' || b.id === 'quad-lawn';
      for (let r = b.r; r < b.r + b.h; r++) {
        for (let c = b.c; c < b.c + b.w; c++) {
          if (isLawn) {
            newGrid[r][c] = CELL_TYPES.LAWN;
          } else {
            newGrid[r][c] = CELL_TYPES.WALL;
          }
        }
      }
      if (b.door && newGrid[b.door.r] && newGrid[b.door.r][b.door.c] !== undefined) {
        newGrid[b.door.r][b.door.c] = CELL_TYPES.EMPTY;
      }
    });

    // 2. Add realistic campus terrain zones
    // Central Plaza crowd zone around dining hall
    for (let r = 8; r <= 13; r++) {
      for (let c = 18; c <= 25; c++) {
        if (newGrid[r][c] === CELL_TYPES.EMPTY) {
          newGrid[r][c] = CELL_TYPES.CROWD;
        }
      }
    }

    // Overpass stairs bridge
    for (let c = 26; c <= 30; c++) {
      if (newGrid[7][c] === CELL_TYPES.EMPTY) {
        newGrid[7][c] = CELL_TYPES.STAIRS;
      }
    }

    // Ensure Start and Goal locations are open walkways
    if (newGrid[DEFAULT_START.r]) newGrid[DEFAULT_START.r][DEFAULT_START.c] = CELL_TYPES.EMPTY;
    if (newGrid[DEFAULT_GOAL.r]) newGrid[DEFAULT_GOAL.r][DEFAULT_GOAL.c] = CELL_TYPES.EMPTY;

    return newGrid;
  };

  // State
  const [grid, setGrid] = useState(populateCampusBlueprint);
  const [start, setStart] = useState(DEFAULT_START);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [waypoints, setWaypoints] = useState([]);

  // Algorithm & Search Settings
  const [selectedAlgo, setSelectedAlgo] = useState('astar');
  const [heuristic, setHeuristic] = useState('manhattan');
  const [allowDiagonal, setAllowDiagonal] = useState(true);
  const [speed, setSpeed] = useState(12); // ms per step
  const [selectedMission, setSelectedMission] = useState(CAMPUS_MISSIONS[0].id);

  // Advanced Plotting & Live Autoplan Tools
  const [isLiveCalculate, setIsLiveCalculate] = useState(true);
  const [isPlacingRobot, setIsPlacingRobot] = useState(false);
  const [drawTool, setDrawTool] = useState('brush'); // 'brush' | 'line' | 'rect' | 'cluster' | 'eraser'
  const [currentBrush, setCurrentBrush] = useState('wall');
  const [showLidar, setShowLidar] = useState(true);

  // Drawing Interaction State
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [dragOrigin, setDragOrigin] = useState(null);
  const [previewCells, setPreviewCells] = useState([]);
  const [dragTarget, setDragTarget] = useState(null); // null | 'start' | 'goal' | { type: 'waypoint', id }

  // Search Results & Path
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [path, setPath] = useState([]);
  const [pathMetrics, setPathMetrics] = useState({
    found: true,
    pathLength: 0,
    pathCost: 0,
    executionTimeMs: 0
  });
  const [nodeDetailsMap, setNodeDetailsMap] = useState(new Map());

  // Execution & Rover State
  const [isFinding, setIsFinding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [roverPos, setRoverPos] = useState(DEFAULT_START);
  const [roverHeading, setRoverHeading] = useState('N');
  const [battery, setBattery] = useState(100);
  const [currentStep, setCurrentStep] = useState(0);
  const [traversedCost, setTraversedCost] = useState(0);
  const [roverStatus, setRoverStatus] = useState('STANDBY'); // STANDBY | PLANNING | NAVIGATING | OBSTACLE_DETECTED | REPLANNING | MISSION_COMPLETE | BLOCKED

  // Modals & Audio
  const [inspectedNode, setInspectedNode] = useState(null);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState([]);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for animation loop
  const animTimeoutRef = useRef(null);
  const driveTimeoutRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Map heuristic string to function
  const getHeuristicFn = useCallback(() => {
    switch (heuristic) {
      case 'euclidean': return euclidean;
      case 'octile': return octile;
      case 'manhattan':
      default: return manhattan;
    }
  }, [heuristic]);

  // Execute single A-to-B Search Algorithm (A* Algorithm)
  const executeSearch = useCallback((startNode, goalNode, currentGrid) => {
    const hFn = getHeuristicFn();
    return runAStar(currentGrid, startNode, goalNode, hFn, allowDiagonal);
  }, [getHeuristicFn, allowDiagonal]);

  // Fast Full Path Calculation (with Waypoint support)
  const calculatePath = useCallback((customGrid, customStart, customGoal, customWaypoints) => {
    const activeGrid = customGrid || grid;
    const activeStart = customStart || start;
    const activeGoal = customGoal || goal;
    const activeWaypoints = customWaypoints || waypoints;

    if (!activeWaypoints || activeWaypoints.length === 0) {
      return executeSearch(activeStart, activeGoal, activeGrid);
    }

    return solveMultiPointPath(
      activeStart,
      activeWaypoints,
      activeGoal,
      activeGrid,
      (g, s, t) => executeSearch(s, t, g)
    );
  }, [grid, start, goal, waypoints, executeSearch]);

  // Live Auto-Calculate Effect: Recalculates immediately when grid, points, or algorithm changes
  const runLiveAutoplan = useCallback((newGrid, newStart, newGoal, newWaypoints) => {
    if (!isLiveCalculate || isDriving) return;

    const result = calculatePath(newGrid, newStart, newGoal, newWaypoints);
    setPath(result.path || []);
    setVisitedNodes(result.visitedOrder || []);
    setNodeDetailsMap(result.nodeDetails || new Map());
    setPathMetrics({
      found: result.found,
      pathLength: result.pathLength || 0,
      pathCost: result.pathCost || 0,
      executionTimeMs: result.executionTimeMs || 0
    });

    if (!result.found) {
      setRoverStatus('BLOCKED');
    } else {
      setRoverStatus('STANDBY');
    }
  }, [isLiveCalculate, isDriving, calculatePath]);

  // Initial Path Calculation on Mount
  useEffect(() => {
    runLiveAutoplan(grid, start, goal, waypoints);
  }, []);

  // Recalculate when algorithm, heuristic, or diagonal movement changes
  useEffect(() => {
    if (isLiveCalculate && !isDriving && !isFinding) {
      runLiveAutoplan(grid, start, goal, waypoints);
    }
  }, [selectedAlgo, heuristic, allowDiagonal, isLiveCalculate]);

  // Quick Place Robot Anywhere
  const handlePlaceRobot = (r, c) => {
    if ((r === goal.r && c === goal.c) || grid[r][c] === CELL_TYPES.WALL) {
      sounds.playObstacleAlert();
      return;
    }
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    if (driveTimeoutRef.current) clearTimeout(driveTimeoutRef.current);
    setIsFinding(false);
    setIsDriving(false);
    setIsPaused(false);

    const newPos = { r, c };
    setStart(newPos);
    setRoverPos(newPos);
    setRoverHeading('N');
    setRoverStatus('STANDBY');
    setCurrentStep(0);
    setTraversedCost(0);
    setIsPlacingRobot(false);

    sounds.playWaypoint();
    runLiveAutoplan(grid, newPos, goal, waypoints);
  };

  // Animate Pathfinding Search Steps (Manual explore button)
  const handleRunAlgorithm = () => {
    if (isFinding || isDriving) return;

    clearRouteOnly();
    setIsFinding(true);
    setRoverStatus('PLANNING');

    const result = calculatePath(grid, start, goal, waypoints);
    setNodeDetailsMap(result.nodeDetails || new Map());

    if (speed === 0) {
      // Instant execution
      setVisitedNodes(result.visitedOrder);
      setPath(result.path);
      setIsFinding(false);
      setRoverStatus(result.found ? 'STANDBY' : 'BLOCKED');
      setPathMetrics({
        found: result.found,
        pathLength: result.pathLength,
        pathCost: result.pathCost,
        executionTimeMs: result.executionTimeMs
      });
      if (result.found) sounds.playWaypoint();
      else sounds.playObstacleAlert();
      return;
    }

    // Step-by-step exploration animation
    let index = 0;
    const animateSteps = () => {
      if (pausedRef.current) {
        animTimeoutRef.current = setTimeout(animateSteps, 100);
        return;
      }

      const batchSize = speed < 20 ? 4 : 1;
      const nextBatch = [];

      for (let i = 0; i < batchSize && index < result.visitedOrder.length; i++) {
        nextBatch.push(result.visitedOrder[index]);
        index++;
      }

      setVisitedNodes(prev => [...prev, ...nextBatch]);
      if (index % 12 === 0) sounds.playBlip(320 + (index % 5) * 60);

      if (index < result.visitedOrder.length) {
        animTimeoutRef.current = setTimeout(animateSteps, speed);
      } else {
        animateShortestPath(result.path, result.found, result);
      }
    };

    animateSteps();
  };

  // Animate Final Shortest Path Line
  const animateShortestPath = (pathNodes, found, fullResult) => {
    if (!found || !pathNodes || pathNodes.length === 0) {
      setIsFinding(false);
      setRoverStatus('BLOCKED');
      sounds.playObstacleAlert();
      return;
    }

    let pIdx = 0;
    const animPath = () => {
      const batch = pathNodes.slice(0, pIdx + 1);
      setPath(batch);
      pIdx++;

      if (pIdx < pathNodes.length) {
        animTimeoutRef.current = setTimeout(animPath, 16);
      } else {
        setIsFinding(false);
        setRoverStatus('STANDBY');
        setPathMetrics({
          found: true,
          pathLength: fullResult.pathLength,
          pathCost: fullResult.pathCost,
          executionTimeMs: fullResult.executionTimeMs
        });
        sounds.playWaypoint();
      }
    };

    animPath();
  };

  // Drive Rover along the computed path
  const handleDriveRover = () => {
    if (isDriving) return;

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    if (driveTimeoutRef.current) clearTimeout(driveTimeoutRef.current);

    // Ensure we have a valid computed path starting from current robot position
    let activePath = path;
    const isPathValidForRover = activePath && activePath.length > 0 &&
      activePath[0].r === start.r && activePath[0].c === start.c;

    if (!isPathValidForRover) {
      const calcResult = calculatePath(grid, start, goal, waypoints);
      if (calcResult.found && calcResult.path.length > 0) {
        activePath = calcResult.path;
        setPath(activePath);
        setVisitedNodes(calcResult.visitedOrder || []);
        setNodeDetailsMap(calcResult.nodeDetails || new Map());
      } else {
        sounds.playObstacleAlert();
        setRoverStatus('BLOCKED');
        return;
      }
    }

    setIsDriving(true);
    setRoverStatus('NAVIGATING');
    setRoverPos(start);
    setCurrentStep(0);
    setTraversedCost(0);

    let stepIndex = 0;
    let accumulatedCost = 0;

    const driveStep = () => {
      if (pausedRef.current) {
        driveTimeoutRef.current = setTimeout(driveStep, 100);
        return;
      }

      if (stepIndex >= activePath.length) {
        // Destination reached!
        setIsDriving(false);
        setRoverStatus('MISSION_COMPLETE');
        sounds.playSuccess();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        return;
      }

      const nextNode = activePath[stepIndex];

      // Dynamic Collision Detection: Check if newly placed obstacle is blocking next node!
      const nextCellType = grid[nextNode.r][nextNode.c];
      if (nextCellType === CELL_TYPES.WALL || nextCellType === CELL_TYPES.ROADBLOCK) {
        sounds.playObstacleAlert();
        setRoverStatus('OBSTACLE_DETECTED');

        // Dynamic Detour Replanning from current position!
        setTimeout(() => {
          setRoverStatus('REPLANNING');
          const currentRoverLocation = activePath[Math.max(0, stepIndex - 1)] || start;
          const replanResult = calculatePath(grid, currentRoverLocation, goal, waypoints);

          if (replanResult.found) {
            setPath(replanResult.path);
            activePath = replanResult.path;
            sounds.playWaypoint();
            setRoverStatus('NAVIGATING');
            stepIndex = 1;
            const delay = speed === 0 ? 30 : (speed === 12 ? 85 : (speed === 35 ? 150 : 250));
            driveTimeoutRef.current = setTimeout(driveStep, delay);
          } else {
            setIsDriving(false);
            setRoverStatus('BLOCKED');
            sounds.playObstacleAlert();
          }
        }, 500);
        return;
      }

      // Update orientation heading to exact movement angle (degrees)
      if (stepIndex > 0) {
        const prev = activePath[stepIndex - 1];
        const dr = nextNode.r - prev.r;
        const dc = nextNode.c - prev.c;
        const angleDeg = Math.round(Math.atan2(dr, dc) * (180 / Math.PI));
        setRoverHeading(angleDeg);
      } else if (activePath.length > 1) {
        const next = activePath[1];
        const dr = next.r - nextNode.r;
        const dc = next.c - nextNode.c;
        const angleDeg = Math.round(Math.atan2(dr, dc) * (180 / Math.PI));
        setRoverHeading(angleDeg);
      }

      setRoverPos(nextNode);
      setCurrentStep(stepIndex + 1);

      // Battery & Cost Consumption
      const cellWeight = CELL_WEIGHTS[nextCellType] || 1;
      accumulatedCost += cellWeight;
      setTraversedCost(Math.round(accumulatedCost * 10) / 10);
      setBattery(prev => Math.max(5, prev - 1));

      if (stepIndex % 3 === 0) sounds.playFootstep();

      stepIndex++;
      const stepDelay = speed === 0 ? 30 : (speed === 12 ? 85 : (speed === 35 ? 150 : 250));
      driveTimeoutRef.current = setTimeout(driveStep, stepDelay);
    };

    driveStep();
  };

  // Dynamic Obstacle Injection ahead of the rover
  const handleInjectRoadblock = () => {
    if (!path || path.length === 0) return;

    const roverPathIndex = path.findIndex(p => p.r === roverPos.r && p.c === roverPos.c);
    const targetPathIndex = Math.min(path.length - 2, roverPathIndex + 2);

    if (targetPathIndex <= roverPathIndex || targetPathIndex < 0) return;

    const blockCoord = path[targetPathIndex];

    const newGrid = grid.map((row, r) =>
      row.map((val, c) => (r === blockCoord.r && c === blockCoord.c ? CELL_TYPES.ROADBLOCK : val))
    );

    setGrid(newGrid);
    sounds.playObstacleAlert();
    setRoverStatus('OBSTACLE_DETECTED');

    if (driveTimeoutRef.current) clearTimeout(driveTimeoutRef.current);

    setTimeout(() => {
      setRoverStatus('REPLANNING');
      const replanResult = calculatePath(newGrid, roverPos, goal, waypoints);

      if (replanResult.found) {
        setVisitedNodes(replanResult.visitedOrder);
        setPath(replanResult.path);
        setRoverStatus('NAVIGATING');
        sounds.playWaypoint();

        if (isDriving) {
          handleDriveRover();
        }
      } else {
        setRoverStatus('BLOCKED');
        setIsDriving(false);
        sounds.playObstacleAlert();
      }
    }, 450);
  };

  // Reset & Clear Handlers
  const clearRouteOnly = () => {
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    if (driveTimeoutRef.current) clearTimeout(driveTimeoutRef.current);
    setIsFinding(false);
    setIsDriving(false);
    setIsPaused(false);
    setPath([]);
    setVisitedNodes([]);
    setRoverPos(start);
    setRoverHeading('N');
    setRoverStatus('STANDBY');
    setCurrentStep(0);
    setTraversedCost(0);
  };

  const handleResetCampus = () => {
    clearRouteOnly();
    const newGrid = populateCampusBlueprint();
    setGrid(newGrid);
    setWaypoints([]);
    runLiveAutoplan(newGrid, start, goal, []);
  };

  const handleGenerateMaze = () => {
    clearRouteOnly();
    const walls = generateRecursiveDivision(GRID_ROWS, GRID_COLS, start, goal);
    const newGrid = createEmptyGrid();
    walls.forEach(({ r, c }) => {
      newGrid[r][c] = CELL_TYPES.WALL;
    });
    setGrid(newGrid);
    setWaypoints([]);
    runLiveAutoplan(newGrid, start, goal, []);
  };

  const handleClearObstacles = () => {
    clearRouteOnly();
    // Clears user-drawn walls/roadblocks and restores solid campus buildings
    const newGrid = populateCampusBlueprint();
    setGrid(newGrid);
    setWaypoints([]);
    runLiveAutoplan(newGrid, start, goal, []);
  };

  // Plotting / Modification on Grid
  const applyCellsToGrid = (cells, brushType) => {
    const newGrid = grid.map((row, r) =>
      row.map((val, c) => {
        const isMatched = cells.some(pt => pt.r === r && pt.c === c);
        if (!isMatched) return val;

        // Never overwrite start or goal with walls
        if ((r === start.r && c === start.c) || (r === goal.r && c === goal.c)) {
          return val;
        }
        return brushType;
      })
    );
    setGrid(newGrid);
    sounds.playDraw();
    runLiveAutoplan(newGrid, start, goal, waypoints);

    // If rover is actively driving and user plots obstacle on its route:
    if (isDriving) {
      const isPathIntersected = path.slice(currentStep).some(pt =>
        cells.some(c => c.r === pt.r && c.c === pt.c)
      );
      if (isPathIntersected && (brushType === CELL_TYPES.WALL || brushType === CELL_TYPES.ROADBLOCK)) {
        handleInjectRoadblock();
      }
    }
  };

  // Mouse Handlers for Obstacle Plotting & Node Dragging
  const handleCellMouseDown = (r, c, { isStart, isGoal, waypointInfo }) => {
    if (isFinding) return;

    // In Place Robot mode
    if (isPlacingRobot) {
      handlePlaceRobot(r, c);
      return;
    }

    // 1. Dragging Start Marker
    if (isStart) {
      setDragTarget('start');
      setMouseIsDown(true);
      return;
    }

    // 2. Dragging Goal Marker (if unlocked)
    if (isGoal) {
      setDragTarget('goal');
      setMouseIsDown(true);
      return;
    }

    // 3. Dragging or Interacting with Waypoint
    if (waypointInfo) {
      setDragTarget({ type: 'waypoint', id: waypointInfo.id });
      setMouseIsDown(true);
      return;
    }

    // 4. Adding a Waypoint Mode
    if (currentBrush === 'waypoint') {
      const newWaypoints = [...waypoints, { id: `wp-${Date.now()}`, r, c }];
      setWaypoints(newWaypoints);
      sounds.playWaypoint();
      runLiveAutoplan(grid, start, goal, newWaypoints);
      setCurrentBrush('wall');
      return;
    }

    setMouseIsDown(true);

    // 5. Draw Tools: Line or Rect requires drag origin
    if (drawTool === 'line' || drawTool === 'rect') {
      setDragOrigin({ r, c });
      setPreviewCells([{ r, c }]);
      return;
    }

    // 6. Hazard Cluster Tool
    if (drawTool === 'cluster') {
      const clusterCells = getClusterCells(r, c, 2, GRID_ROWS, GRID_COLS);
      applyCellsToGrid(clusterCells, currentBrush === 'empty' ? CELL_TYPES.EMPTY : currentBrush);
      return;
    }

    // 7. Freehand Brush or Eraser
    const targetBrush = drawTool === 'eraser' ? CELL_TYPES.EMPTY : currentBrush;
    applyCellsToGrid([{ r, c }], targetBrush);
  };

  const handleCellMouseEnter = (r, c) => {
    if (!mouseIsDown) return;

    // 1. Dragging Start Node (Repositioning robot)
    if (dragTarget === 'start') {
      if ((r === goal.r && c === goal.c) || grid[r][c] === CELL_TYPES.WALL) return;
      setStart({ r, c });
      setRoverPos({ r, c });
      runLiveAutoplan(grid, { r, c }, goal, waypoints);
      return;
    }

    // 2. Dragging Goal Node
    if (dragTarget === 'goal') {
      if ((r === start.r && c === start.c) || grid[r][c] === CELL_TYPES.WALL) return;
      setGoal({ r, c });
      runLiveAutoplan(grid, start, { r, c }, waypoints);
      return;
    }

    // 3. Dragging Waypoint Node
    if (dragTarget?.type === 'waypoint') {
      const updatedWaypoints = waypoints.map(w => w.id === dragTarget.id ? { ...w, r, c } : w);
      setWaypoints(updatedWaypoints);
      runLiveAutoplan(grid, start, goal, updatedWaypoints);
      return;
    }

    // 4. Drawing Line Preview (Bresenham)
    if (dragOrigin && drawTool === 'line') {
      const lineCells = getLineCells(dragOrigin.r, dragOrigin.c, r, c, GRID_ROWS, GRID_COLS);
      setPreviewCells(lineCells);
      return;
    }

    // 5. Drawing Rectangle Preview
    if (dragOrigin && drawTool === 'rect') {
      const rectCells = getRectCells(dragOrigin.r, dragOrigin.c, r, c, false, GRID_ROWS, GRID_COLS);
      setPreviewCells(rectCells);
      return;
    }

    // 6. Freehand Continuous Drag
    if (drawTool === 'brush' || drawTool === 'eraser') {
      const targetBrush = drawTool === 'eraser' ? CELL_TYPES.EMPTY : currentBrush;
      applyCellsToGrid([{ r, c }], targetBrush);
    }
  };

  const handleCellMouseUp = () => {
    setMouseIsDown(false);
    setDragTarget(null);

    // Commit preview cells from Line or Rect tool
    if (dragOrigin && previewCells.length > 0) {
      const targetBrush = drawTool === 'eraser' ? CELL_TYPES.EMPTY : currentBrush;
      applyCellsToGrid(previewCells, targetBrush);
    }

    setDragOrigin(null);
    setPreviewCells([]);
  };

  // Remove a Waypoint
  const handleRemoveWaypoint = (waypointId) => {
    const updated = waypoints.filter(w => w.id !== waypointId);
    setWaypoints(updated);
    sounds.playObstacleAlert();
    runLiveAutoplan(grid, start, goal, updated);
  };

  // Node Inspector Modal
  const handleInspectNode = (cell) => {
    const key = `${cell.r},${cell.c}`;
    const details = nodeDetailsMap.get(key);
    setInspectedNode({
      ...cell,
      g: details?.g,
      h: details?.h,
      f: details?.f
    });
    setIsInspectorModalOpen(true);
  };

  // Benchmark Comparisons
  const handleOpenBenchmark = () => {
    const results = runAllAlgorithms(grid, start, goal, getHeuristicFn(), allowDiagonal);
    setBenchmarkResults(results);
    setIsBenchmarkModalOpen(true);
  };

  // Mission Selection Preset
  const handleSelectMission = (missionId) => {
    const mission = CAMPUS_MISSIONS.find(m => m.id === missionId);
    if (!mission) return;

    setSelectedMission(missionId);
    setStart(mission.start);
    setRoverPos(mission.start);
    setGoal(mission.goal);
    setSelectedAlgo(mission.recommendedAlgo || 'astar');
    clearRouteOnly();
    setWaypoints([]);
    runLiveAutoplan(grid, mission.start, mission.goal, []);
  };

  return (
    <div className="app-container" id="ai-college-app">
      {/* Top Header */}
      <Header
        selectedMission={selectedMission}
        onSelectMission={handleSelectMission}
        heuristic={heuristic}
        onSelectHeuristic={(h) => {
          setHeuristic(h);
          runLiveAutoplan(grid, start, goal, waypoints);
        }}
        onOpenBenchmark={handleOpenBenchmark}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          sounds.toggleMute();
          setIsMuted(!isMuted);
        }}
      />

      {/* Main Interactive Workspace */}
      <main className="main-content" id="main-content-layout">
        {/* Rover Telemetry HUD */}
        <RoverHUD
          roverPos={roverPos}
          heading={roverHeading}
          battery={battery}
          status={roverStatus}
          currentStep={currentStep}
          totalSteps={path.length}
          traversedCost={traversedCost}
          onInjectRoadblock={handleInjectRoadblock}
          isNavigating={isDriving}
          hasPath={path.length > 0}
          inspectedNode={inspectedNode}
        />

        {/* Live Mathematical Calculations Console */}
        <CalculationConsole
          selectedAlgo={selectedAlgo}
          heuristic={heuristic}
          roverPos={roverPos}
          start={start}
          goal={goal}
          path={path}
          nodeDetailsMap={nodeDetailsMap}
          currentStep={currentStep}
          pathMetrics={pathMetrics}
          isDriving={isDriving}
          grid={grid}
          isDestinationLocked={true}
        />

        {/* Control Panel: Place Robot Anywhere, Tools, Palettes & Speeds */}
        <ControlPanel
          onRunAlgorithm={handleRunAlgorithm}
          onDriveRover={handleDriveRover}
          onPauseResume={() => setIsPaused(prev => !prev)}
          onStepForward={() => {}}
          onResetPath={clearRouteOnly}
          onResetCampus={handleResetCampus}
          onGenerateMaze={handleGenerateMaze}
          onClearObstacles={handleClearObstacles}
          isFinding={isFinding}
          isPaused={isPaused}
          isDriving={isDriving}
          hasPath={path.length > 0}
          isLiveCalculate={isLiveCalculate}
          onToggleLiveCalculate={() => setIsLiveCalculate(prev => !prev)}
          drawTool={drawTool}
          onSelectDrawTool={setDrawTool}
          currentBrush={currentBrush}
          onSelectBrush={setCurrentBrush}
          speed={speed}
          onSelectSpeed={setSpeed}
          allowDiagonal={allowDiagonal}
          onToggleDiagonal={() => {
            setAllowDiagonal(prev => !prev);
            runLiveAutoplan(grid, start, goal, waypoints);
          }}
          heuristic={heuristic}
          onSelectHeuristic={(h) => {
            setHeuristic(h);
            runLiveAutoplan(grid, start, goal, waypoints);
          }}
          selectedAlgo={selectedAlgo}
          showLidar={showLidar}
          onToggleLidar={() => setShowLidar(prev => !prev)}
          pathMetrics={pathMetrics}
          waypoints={waypoints}
          onAddWaypointMode={() => setCurrentBrush('waypoint')}
          isPlacingRobot={isPlacingRobot}
          onTogglePlaceRobot={() => setIsPlacingRobot(prev => !prev)}
          goal={goal}
        />

        {/* 2D Interactive Campus Grid with Live Obstacle Plotting & Fixed Destination */}
        <CampusGrid
          grid={grid}
          start={start}
          goal={goal}
          waypoints={waypoints}
          path={path}
          visitedNodes={visitedNodes}
          roverPos={roverPos}
          roverHeading={roverHeading}
          isNavigating={isDriving}
          drawTool={drawTool}
          currentBrush={currentBrush}
          showLidar={showLidar}
          isPlacingRobot={isPlacingRobot}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
          onInspectNode={handleInspectNode}
          inspectedNode={inspectedNode}
          onRemoveWaypoint={handleRemoveWaypoint}
          onPlaceRobot={handlePlaceRobot}
          previewCells={previewCells}
        />

        {/* Map Legend */}
        <Legend />
      </main>

      {/* Modals */}
      {isInspectorModalOpen && (
        <NodeInspectorModal
          node={inspectedNode}
          start={start}
          goal={goal}
          onClose={() => setIsInspectorModalOpen(false)}
        />
      )}

      {isBenchmarkModalOpen && (
        <AlgorithmComparison
          results={benchmarkResults}
          onClose={() => setIsBenchmarkModalOpen(false)}
          onSelectAndRun={(resId) => {
            if (resId === 'astar-manhattan') setHeuristic('manhattan');
            else if (resId === 'astar-euclidean') setHeuristic('euclidean');
            else if (resId === 'astar-octile') setHeuristic('octile');
            runLiveAutoplan(grid, start, goal, waypoints);
          }}
        />
      )}

      {isGuideModalOpen && (
        <AlgorithmGuideModal onClose={() => setIsGuideModalOpen(false)} />
      )}
    </div>
  );
}
