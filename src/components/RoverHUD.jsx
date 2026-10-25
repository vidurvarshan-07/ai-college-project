import React from 'react';
import { Bot, BatteryCharging, Zap, Compass, AlertTriangle, ShieldAlert, CheckCircle, Radio, Clock, Activity } from 'lucide-react';

export default function RoverHUD({
  roverPos,
  heading,
  battery,
  status,
  currentStep,
  totalSteps,
  traversedCost,
  onInjectRoadblock,
  isNavigating,
  hasPath,
  inspectedNode
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'PLANNING':
        return { label: 'CALCULATING ROUTE...', color: '#38bdf8', icon: Activity };
      case 'NAVIGATING':
        return { label: 'EN ROUTE TO GOAL', color: '#10b981', icon: Radio };
      case 'OBSTACLE_DETECTED':
        return { label: 'OBSTACLE DETECTED! REPLANNING...', color: '#f43f5e', icon: AlertTriangle };
      case 'MISSION_COMPLETE':
        return { label: 'MISSION ACCOMPLISHED', color: '#00f2fe', icon: CheckCircle };
      default:
        return { label: 'STANDBY // READY', color: '#94a3b8', icon: Bot };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  const getHeadingArrow = () => {
    switch (heading) {
      case 'N': return '▲ North';
      case 'S': return '▼ South';
      case 'E': return '► East';
      case 'W': return '◄ West';
      default: return '► East';
    }
  };

  return (
    <div className="rover-hud-container" id="rover-hud-panel">
      <div className="hud-header">
        <div className="hud-title-wrap">
          <Bot size={18} className="hud-bot-icon" />
          <span className="hud-title">AUTOMATON ROVER // AGV-TITAN v3.4</span>
        </div>
        <div className="hud-status-badge" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
          <StatusIcon size={12} className="spin-slow" />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="hud-metrics-grid">
        {/* Coordinates */}
        <div className="hud-metric-box">
          <div className="hud-label"><Compass size={12} /> Position</div>
          <div className="hud-val">R: {roverPos?.r ?? '--'} , C: {roverPos?.c ?? '--'}</div>
          <div className="hud-subval">Heading: {getHeadingArrow()}</div>
        </div>

        {/* Battery */}
        <div className="hud-metric-box">
          <div className="hud-label"><BatteryCharging size={12} /> Power Cell</div>
          <div className="hud-val">{battery}%</div>
          <div className="hud-battery-track">
            <div
              className="hud-battery-bar"
              style={{
                width: `${battery}%`,
                backgroundColor: battery > 50 ? '#10b981' : battery > 20 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="hud-metric-box">
          <div className="hud-label"><Activity size={12} /> Progress</div>
          <div className="hud-val">{currentStep} / {totalSteps || 0}</div>
          <div className="hud-subval">Cost: {traversedCost} units</div>
        </div>

        {/* Heuristic Snapshot */}
        <div className="hud-metric-box">
          <div className="hud-label"><Zap size={12} /> Mathematical Node State</div>
          <div className="hud-val">
            f: {inspectedNode ? Math.round(inspectedNode.f * 10) / 10 : '--'}
          </div>
          <div className="hud-subval">
            g: {inspectedNode ? Math.round(inspectedNode.g * 10) / 10 : '--'} | h: {inspectedNode ? Math.round(inspectedNode.h * 10) / 10 : '--'}
          </div>
        </div>
      </div>

      <div className="hud-actions-row">
        <button
          className="btn-danger-inject"
          onClick={onInjectRoadblock}
          disabled={!hasPath}
          id="btn-inject-roadblock"
          title="Simulate sudden unexpected construction/crowd barrier in front of the rover"
        >
          <ShieldAlert size={16} />
          <span>Inject Sudden Roadblock (Trigger Dynamic Replanning)</span>
        </button>
      </div>
    </div>
  );
}
