import React, { useMemo } from 'react';
import { useRobotControl } from '../../context/RobotControlContext';

const ROOM_COORDS = {
  Raum1: { x: 125, y: 250 },
  Raum2: { x: 125, y: 100 },
  Raum3: { x: 350, y: 175 },
  Raum4: { x: 550, y: 75 },
  Raum5: { x: 775, y: 105 },
  Raum6: { x: 775, y: 255 },
  Mensa: { x: 175, y: 400 },
  Apotheke: { x: 725, y: 400 },
};

const ROOM_LABELS = [
  { label: 'Raum2', x: 125, y: 130, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Raum1', x: 125, y: 280, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Mensa', x: 175, y: 430, textClassName: 'fill-[#00A896] uppercase tracking-[0.18em]' },
  { label: 'Raum3', x: 350, y: 205, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Raum4', x: 550, y: 105, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Raum5', x: 775, y: 130, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Raum6', x: 775, y: 280, textClassName: 'fill-[#E0E0E0]' },
  { label: 'Apotheke', x: 725, y: 430, textClassName: 'fill-[#00A896] uppercase tracking-[0.18em]' },
];

const ROOM_CODES = [
  { code: 'R-02', x: 125, y: 145 },
  { code: 'R-01', x: 125, y: 295 },
  { code: 'R-03', x: 350, y: 220 },
  { code: 'R-04', x: 550, y: 120 },
  { code: 'R-05', x: 775, y: 145 },
  { code: 'R-06', x: 775, y: 295 },
];

const ROOM_BLOCKS = [
  { x: 50, y: 50, width: 150, height: 150 },
  { x: 50, y: 200, width: 150, height: 150 },
  { x: 50, y: 350, width: 250, height: 150 },
  { x: 300, y: 150, width: 100, height: 100 },
  { x: 500, y: 50, width: 100, height: 100 },
  { x: 700, y: 50, width: 150, height: 150 },
  { x: 700, y: 200, width: 150, height: 150 },
  { x: 600, y: 350, width: 250, height: 150 },
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

const RobotMap = () => {
  const { statusData } = useRobotControl();

  const activePosition = useMemo(() => {
    if (!statusData?.position) {
      return null;
    }

    const driveMode = String(statusData.driveMode || '').trim().toUpperCase();
    if (driveMode === 'MANUAL') {
      return null;
    }

    const position = String(statusData.position).trim();
    return ROOM_COORDS[position] ? { ...ROOM_COORDS[position], label: position } : null;
  }, [statusData?.driveMode, statusData?.position]);

  return (
    <div className="glass-panel rounded-xl p-4 md:p-6 border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Live Floorplan</div>
          <h3 className="mt-1 text-lg font-medium text-gray-200">Robot position map</h3>
        </div>
        <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">Auto hide in manual</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0D0D10] shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden">
        <svg viewBox="0 0 900 550" className="block h-auto w-full" role="img" aria-label="Robot floorplan map">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
            </pattern>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4158D0" />
              <stop offset="50%" stopColor="#8054c7" />
              <stop offset="100%" stopColor="#C850C0" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="#0D0D10" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform="translate(50, 30)">
            <circle cx="5" cy="-5" r="4" fill="#00A896" />
            <text
              x="18"
              y="0"
              fill="#00A896"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="11"
              fontWeight="700"
              letterSpacing="2"
            >
              MAP TELEMETRY // LIVE
            </text>
          </g>

          <path
            d="M 200,350 L 200,50 L 500,50 L 500,150 L 600,150 L 600,50 L 700,50 L 700,350 L 600,350 L 600,250 L 400,250 L 400,150 L 300,150 L 300,350 Z"
            fill="#061817"
            fillOpacity="0.8"
            stroke="#00A896"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <g fill="#15161A" stroke="#2A2B33" strokeWidth="1.5">
            {ROOM_BLOCKS.map((block) => (
              <rect
                key={`${block.x}-${block.y}`}
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                rx="4"
              />
            ))}
          </g>

          <g stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" filter="url(#glow)">
            {ROOM_WALLS.map((wall) => (
              <line key={`${wall.x1}-${wall.y1}-${wall.x2}-${wall.y2}`} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />
            ))}
          </g>

          <g fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" fill="#E0E0E0" textAnchor="middle">
            {ROOM_LABELS.map((room) => (
              <text
                key={room.label}
                x={room.x}
                y={room.y}
                className={room.textClassName}
                fontSize={room.label === 'Mensa' || room.label === 'Apotheke' ? '16' : '14'}
                letterSpacing={room.label === 'Mensa' || room.label === 'Apotheke' ? '1' : '0'}
              >
                {room.label}
              </text>
            ))}
          </g>

          <g fontFamily="monospace" fontSize="10" fill="#4B4D56" textAnchor="middle">
            {ROOM_CODES.map((room) => (
              <text key={room.code} x={room.x} y={room.y}>
                {room.code}
              </text>
            ))}
          </g>

          {activePosition ? (
            <g>
              <circle cx={activePosition.x} cy={activePosition.y} r="10" fill="url(#robotGradient)" filter="url(#dotGlow)" />
              <circle cx={activePosition.x} cy={activePosition.y} r="4" fill="#ffffff" />
              <text
                x={activePosition.x}
                y={activePosition.y + 22}
                fill="#ffffff"
                fontFamily="monospace"
                fontSize="10"
                textAnchor="middle"
              >
                {activePosition.label.toUpperCase()}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

export default RobotMap;