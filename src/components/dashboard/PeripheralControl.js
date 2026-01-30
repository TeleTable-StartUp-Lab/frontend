import React, { useMemo, useState } from 'react';
import { Lightbulb, Megaphone, SlidersHorizontal, Volume2, X } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const wsBadgeClass = (status) => {
  switch (status) {
    case 'connected':
      return 'bg-success/10 text-success border-success/20';
    case 'connecting':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'error':
      return 'bg-danger/10 text-danger border-danger/20';
    default:
      return 'bg-gray-700/40 text-gray-300 border-white/10';
  }
};

const hexToRgb = (hex) => {
  const sanitized = hex.replace('#', '');
  const value = sanitized.length === 3
    ? sanitized.split('').map((c) => c + c).join('')
    : sanitized.padEnd(6, '0');
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const PeripheralControl = ({ onClose }) => {
  const { wsStatus, sendCommand } = useRobotControl();
  const [ledEnabled, setLedEnabled] = useState(true);
  const [ledColor, setLedColor] = useState('#ffb450');
  const [brightness, setBrightness] = useState(40);
  const [volume, setVolume] = useState(0.3);
  const [beepHz, setBeepHz] = useState(880);
  const [beepMs, setBeepMs] = useState(150);
  const [feedback, setFeedback] = useState('');

  const ledPreviewStyle = useMemo(
    () => ({
      background: ledEnabled
        ? `rgba(${hexToRgb(ledColor).r}, ${hexToRgb(ledColor).g}, ${hexToRgb(ledColor).b}, ${Math.max(brightness, 5) / 100})`
        : 'rgba(255,255,255,0.05)',
      boxShadow: ledEnabled
        ? `0 0 20px rgba(${hexToRgb(ledColor).r}, ${hexToRgb(ledColor).g}, ${hexToRgb(ledColor).b}, 0.35)`
        : 'none',
    }),
    [ledColor, ledEnabled, brightness]
  );

  const handleLedSend = () => {
    const { r, g, b } = hexToRgb(ledColor);
    const ok = sendCommand({
      command: 'LED',
      enabled: ledEnabled,
      r,
      g,
      b,
      brightness: Math.max(0, Math.min(100, Math.round(Number(brightness)))) || 0,
    });
    setFeedback(ok ? 'LED command sent' : 'WebSocket not connected');
  };

  const handleVolumeSend = () => {
    const ok = sendCommand({
      command: 'AUDIO_VOLUME',
      value: Math.max(0, Math.min(1, Number(volume))),
    });
    setFeedback(ok ? 'Volume command sent' : 'WebSocket not connected');
  };

  const handleBeep = () => {
    const ok = sendCommand({
      command: 'AUDIO_BEEP',
      hz: Math.max(50, Math.min(5000, Math.round(Number(beepHz)))) || 0,
      ms: Math.max(10, Math.min(5000, Math.round(Number(beepMs)))) || 0,
    });
    setFeedback(ok ? 'Beep command sent' : 'WebSocket not connected');
  };

  return (
    <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-white">Robot Peripherals</h2>
            <p className="text-xs text-gray-400">Admin-only controls for lights and audio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded border text-xs font-mono ${wsBadgeClass(wsStatus)} min-w-[130px] text-left`}>
            WS: {wsStatus?.toUpperCase()}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close peripheral control"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {feedback && (
          <div className="text-xs text-primary bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-semibold">LED</h3>
            </div>
            <div className="h-24 rounded-lg border border-white/10" style={ledPreviewStyle}></div>
            <label className="flex items-center gap-3 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={ledEnabled}
                onChange={(e) => setLedEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-dark-900"
              />
              Enable LED strip
            </label>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Color</label>
              <input
                type="color"
                value={ledColor}
                onChange={(e) => setLedColor(e.target.value)}
                className="w-full h-10 rounded border border-white/10 bg-dark-900"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Brightness</span>
                <span className="font-mono text-white">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <button
              onClick={handleLedSend}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-dark-900 font-semibold text-xs hover:bg-primary-hover transition-colors"
              disabled={wsStatus !== 'connected'}
            >
              <span>Apply LED</span>
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Volume2 className="w-5 h-5 text-secondary" />
              <h3 className="text-sm font-semibold">Audio Volume</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Master Volume</span>
                <span className="font-mono text-white">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-secondary"
              />
            </div>
            <button
              onClick={handleVolumeSend}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-dark-900 font-semibold text-xs hover:brightness-110 transition-colors"
              disabled={wsStatus !== 'connected'}
            >
              <span>Set Volume</span>
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold">Audio Beep</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Frequency</span>
                <span className="font-mono text-white">{beepHz} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="10"
                value={beepHz}
                onChange={(e) => setBeepHz(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Duration</span>
                <span className="font-mono text-white">{beepMs} ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="10"
                value={beepMs}
                onChange={(e) => setBeepMs(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <button
              onClick={handleBeep}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/20 hover:bg-white/20 transition-colors"
              disabled={wsStatus !== 'connected'}
            >
              <span>Play Test Beep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeripheralControl;
