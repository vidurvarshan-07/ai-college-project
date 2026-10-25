import React from 'react';
import { Bot, Flag, Square, Trees, Users, Footprints, ShieldAlert, Navigation } from 'lucide-react';

export default function Legend() {
  const items = [
    { label: 'Rover Start', icon: Bot, color: '#10b981', desc: 'Starting node' },
    { label: 'Destination', icon: Flag, color: '#ef4444', desc: 'Target door' },
    { label: 'Optimal Path', icon: Navigation, color: '#00f2fe', desc: 'Calculated shortest route' },
    { label: 'Visited Frontier', icon: Square, color: '#8b5cf6', desc: 'Explored nodes' },
    { label: 'Walkway', icon: Square, color: '#1e293b', desc: 'Paved road (Cost: 1)' },
    { label: 'Lawn / Quad', icon: Trees, color: '#059669', desc: 'Grass terrain (Cost: 3)' },
    { label: 'Crowded Plaza', icon: Users, color: '#d97706', desc: 'Congestion (Cost: 5)' },
    { label: 'Stairs / Bridge', icon: Footprints, color: '#7c3aed', desc: 'Elevation (Cost: 7)' },
    { label: 'Wall / Barrier', icon: Square, color: '#334155', desc: 'Impassable barrier' },
    { label: 'Roadblock', icon: ShieldAlert, color: '#f43f5e', desc: 'Dynamic obstacle (Replanning)' },
  ];

  return (
    <div className="legend-container" id="legend-panel">
      <div className="legend-title">CAMPUS TERRAIN & MAP LEGEND</div>
      <div className="legend-grid">
        {items.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="legend-item" title={item.desc}>
              <span className="legend-icon-badge" style={{ backgroundColor: item.color }}>
                <IconComp size={12} color="#ffffff" />
              </span>
              <span className="legend-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
