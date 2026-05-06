import React, { useMemo, useState } from 'react';
import { MapPin, MousePointer2, Route } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { cleanValue } from './DashboardPrimitives';

export const MAP_ZONES = [
  { id: 'kitchen', label: 'Raum 2', code: 'R-02', x: 50, y: 50, width: 150, height: 150, coord: { x: 125, y: 100 } },
  { id: 'Raum1', label: 'Raum 1', code: 'R-01', x: 50, y: 200, width: 150, height: 150, coord: { x: 125, y: 250 } },
  { id: 'home', label: 'Mensa', code: 'DINING', x: 50, y: 350, width: 250, height: 150, coord: { x: 175, y: 400 }, accent: true },
  { id: 'Raum3', label: 'Raum 3', code: 'R-03', x: 300, y: 150, width: 100, height: 100, coord: { x: 350, y: 175 } },
  { id: 'Raum4', label: 'Raum 4', code: 'R-04', x: 500, y: 50, width: 100, height: 100, coord: { x: 550, y: 75 } },
  { id: 'office', label: 'Raum 5', code: 'R-05', x: 700, y: 50, width: 150, height: 150, coord: { x: 775, y: 105 } },
  { id: 'Raum6', label: 'Raum 6', code: 'R-06', x: 700, y: 200, width: 150, height: 150, coord: { x: 775, y: 255 } },
  { id: 'grave', label: 'Apotheke', code: 'PHARM', x: 600, y: 350, width: 250, height: 150, coord: { x: 725, y: 400 }, accent: true },
];

const ROOM_WALLS = [
  { x1: 200, y1: 160, x2: 200, y2: 190 },
  { x1: 200, y1: 210, x2: 200, y2: 240 },
  { x1: 230, y1: 350, x2: 270, y2: 350 },
  { x1: 400, y1: 160, x2: 400, y2: 190 },
  { x1: 500, y1: 60, x2: 500, y2: 90 },
  { x1: 700, y1: 160, x2: 700, y2: 190 },
  { x1: 700, y1: 260, x2: 700, y2: 290 },
  { x1: 630, y1: 350, x2: 670, y2: 350 },
];

const zoneById = (id) => MAP_ZONES.find((zone) => zone.id === id || zone.label === id);

const RobotMarker = ({ position }) => (
  <g>
    <circle cx={position.x} cy={position.y} r="24" fill="#00F0FF" opacity="0.18" />
    <circle cx={position.x} cy={position.y} r="17" fill="#050505" stroke="#ffffff" strokeWidth="3" />
    <circle cx={position.x} cy={position.y} r="10" fill="#00F0FF" />
    <path
      d={`M ${position.x},${position.y - 24} L ${position.x + 8},${position.y - 8} L ${position.x - 8},${position.y - 8} Z`}
      fill="#ffffff"
    />
    <text
      x={position.x}
      y={position.y + 30}
      fill="#ffffff"
      fontFamily="monospace"
      fontSize="11"
      textAnchor="middle"
    >
      ROBOT
    </text>
  </g>
);

const RouteOverlay = ({ start, destination }) => {
  if (!start || !destination) return null;

  return (
    <g>
      <line
        x1={start.coord.x}
        y1={start.coord.y}
        x2={destination.coord.x}
        y2={destination.coord.y}
        stroke="#00F0FF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="12 10"
        opacity="0.92"
      />
      <circle cx={start.coord.x} cy={start.coord.y} r="9" fill="#00FF94" stroke="#050505" strokeWidth="3" />
      <circle cx={destination.coord.x} cy={destination.coord.y} r="10" fill="#FFB800" stroke="#050505" strokeWidth="3" />
    </g>
  );
};

const RobotMap = ({
  mode = 'manual',
  selectedStart = '',
  selectedDestination = '',
  activeRoute = null,
  onZoneSelect,
  interactive = false,
  dashboardState,
}) => {
  const { statusData, resolveNodeLabel } = useRobotControl();
  const [hoveredZone, setHoveredZone] = useState(null);

  const robotPosition = useMemo(() => {
    const position = cleanValue(statusData?.position, '');
    const zone = zoneById(position);
    return zone ? { ...zone.coord, label: zone.label } : null;
  }, [statusData?.position]);

  const startZone = zoneById(activeRoute?.start || selectedStart);
  const destinationZone = zoneById(activeRoute?.destination || selectedDestination);
  const showRoute = mode === 'autonomous' && startZone && destinationZone;
  const hovered = hoveredZone ? zoneById(hoveredZone) : null;
  const zonesUnavailable = !dashboardState?.robotConnected;
  const canSelectZones = interactive && !zonesUnavailable;

  const handleZoneClick = (zone) => {
    if (!canSelectZones) return;
    onZoneSelect?.(zone);
  };

  return (
    <section className="glass-panel relative overflow-hidden rounded-xl border border-white/10 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Live floorplan</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Where is the robot?</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-dark-800/60 px-3 py-1.5 text-gray-300">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {robotPosition ? robotPosition.label : 'No position'}
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-dark-800/60 px-3 py-1.5 text-gray-300">
            {canSelectZones ? <MousePointer2 className="h-3.5 w-3.5 text-primary" /> : <Route className="h-3.5 w-3.5 text-gray-500" />}
            {canSelectZones ? 'Rooms selectable' : mode === 'manual' ? 'Passive map' : 'Rooms unavailable'}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D10]">
        <svg viewBox="0 0 900 550" className="block h-auto w-full" role="img" aria-label="Robot floorplan map">
          <defs>
            <pattern id="floor-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeOpacity="0.035" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="#0D0D10" />
          <rect width="100%" height="100%" fill="url(#floor-grid)" />

          <path
            d="M 200,350 L 200,50 L 500,50 L 500,150 L 600,150 L 600,50 L 700,50 L 700,350 L 600,350 L 600,250 L 400,250 L 400,150 L 300,150 L 300,350 Z"
            fill="#061817"
            fillOpacity="0.72"
            stroke="#00A896"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <g>
            {MAP_ZONES.map((zone) => {
              const isHovered = hoveredZone === zone.id;
              const isStart = selectedStart === zone.id;
              const isDestination = selectedDestination === zone.id;
              const selected = isStart || isDestination;
              const unavailable = zonesUnavailable;
              const fill = unavailable
                ? '#111216'
                : selected
                ? (isStart ? '#003D2E' : '#3D3100')
                : isHovered && canSelectZones
                  ? '#1C2630'
                  : '#15161A';
              const stroke = unavailable
                ? '#24262E'
                : selected
                ? (isStart ? '#00FF94' : '#FFB800')
                : isHovered && canSelectZones
                  ? '#00F0FF'
                  : '#343640';

              return (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    rx="4"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={selected || (isHovered && interactive) ? '3' : '1.5'}
                    opacity={unavailable ? '0.48' : '1'}
                    className={canSelectZones ? 'cursor-pointer transition-colors' : ''}
                    role={canSelectZones ? 'button' : undefined}
                    tabIndex={canSelectZones ? 0 : undefined}
                    aria-label={`${zone.label} zone`}
                    onClick={() => handleZoneClick(zone)}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onFocus={() => setHoveredZone(zone.id)}
                    onBlur={() => setHoveredZone(null)}
                    onKeyDown={(event) => {
                      if (!canSelectZones) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleZoneClick(zone);
                      }
                    }}
                  >
                    <title>{canSelectZones ? `Select ${zone.label}` : `${zone.label} unavailable`}</title>
                  </rect>
                  <text
                    x={zone.coord.x}
                    y={zone.coord.y + 30}
                    fill={zone.accent ? '#00A896' : '#E0E0E0'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize={zone.accent ? '16' : '14'}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {zone.label}
                  </text>
                  <text
                    x={zone.coord.x}
                    y={zone.coord.y + 45}
                    fill="#636670"
                    fontFamily="monospace"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {zone.code}
                  </text>
                </g>
              );
            })}
          </g>

          <g stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" opacity="0.75">
            {ROOM_WALLS.map((wall) => (
              <line key={`${wall.x1}-${wall.y1}-${wall.x2}-${wall.y2}`} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />
            ))}
          </g>

          {showRoute ? <RouteOverlay start={startZone} destination={destinationZone} /> : null}
          {robotPosition ? <RobotMarker position={robotPosition} /> : null}

          {!robotPosition ? (
            <g pointerEvents="none">
              <rect x="275" y="238" width="350" height="74" rx="10" fill="#050505" fillOpacity="0.92" stroke="#ffffff" strokeOpacity="0.12" />
              <text x="450" y="268" fill="#ffffff" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" textAnchor="middle">
                Position unavailable
              </text>
              <text x="450" y="292" fill="#9CA3AF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="13" textAnchor="middle">
                Waiting for robot telemetry
              </text>
            </g>
          ) : null}

          {hovered && canSelectZones ? (
            <g pointerEvents="none">
              <rect x={hovered.coord.x - 58} y={hovered.coord.y - 48} width="116" height="28" rx="6" fill="#050505" stroke="#00F0FF" strokeOpacity="0.5" />
              <text x={hovered.coord.x} y={hovered.coord.y - 30} fill="#ffffff" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="700" textAnchor="middle">
                {resolveNodeLabel(hovered.id, hovered.label)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </section>
  );
};

export default RobotMap;
