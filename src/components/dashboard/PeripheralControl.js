import React, { useMemo, useState } from 'react';
import { Lightbulb, Megaphone, Mic, SlidersHorizontal, Square, Volume2, X } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const LOCAL_TTS_PRESET_FALLBACKS = [
  { id: 'assistive-computer', label: 'Assistive Computer', description: 'Flat, clear, monotone computer speech.' },
  { id: 'anime-uwu', label: 'Anime Uwu', description: 'Bright, playful, high-pitched synthetic voice.' },
  { id: 'creepy', label: 'Creepy', description: 'Breathy, eerie voice with a slower delivery.' },
  { id: 'deep-radio', label: 'Deep Radio', description: 'Low, broadcast-like robotic announcer.' },
  { id: 'glitch-bot', label: 'Glitch Bot', description: 'Sharper, more mechanical synth texture.' },
  { id: 'soft-narrator', label: 'Soft Narrator', description: 'Smoother and gentler but still synthetic.' },
];

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
  const {
    wsStatus,
    sendCommand,
    audioFile,
    audioFileName,
    audioStreamMessage,
    audioStreamProgress,
    isAudioStreaming,
    isMicStreaming,
    micStreamMessage,
    isTtsStreaming,
    ttsVoicePresets,
    defaultTtsVoicePreset,
    ttsStreamMessage,
    ttsStreamProgress,
    selectAudioFile,
    startAudioStream,
    stopAudioStream,
    startMicrophoneStream,
    stopMicrophoneStream,
    startTextToSpeechStream,
    stopTextToSpeechStream,
  } = useRobotControl();
  const [ledEnabled, setLedEnabled] = useState(true);
  const [ledColor, setLedColor] = useState('#ffb450');
  const [brightness, setBrightness] = useState(40);
  const [ledMode, setLedMode] = useState('static');
  const [volume, setVolume] = useState(0.3);
  const [beepHz, setBeepHz] = useState(880);
  const [beepMs, setBeepMs] = useState(150);
  const [feedback, setFeedback] = useState('');
  const [ttsText, setTtsText] = useState('');
  const availableTtsVoicePresets = ttsVoicePresets?.length ? ttsVoicePresets : LOCAL_TTS_PRESET_FALLBACKS;
  const [ttsVoicePreset, setTtsVoicePreset] = useState(defaultTtsVoicePreset || availableTtsVoicePresets[0].id);
  const isAnyAudioStreamActive = isAudioStreaming || isMicStreaming || isTtsStreaming;

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
      mode: ledMode,
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

  const handleTextToSpeech = () => {
    startTextToSpeechStream(ttsText, ttsVoicePreset);
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
              <label className="text-xs text-gray-400">Mode</label>
              <select
                value={ledMode}
                onChange={(e) => setLedMode(e.target.value)}
                className="w-full h-10 rounded border border-white/10 bg-dark-900 text-white px-3 text-xs"
              >
                <option value="static">Static</option>
                <option value="breathing">Breathing</option>
                <option value="loop">Loop</option>
                <option value="rainbow">Rainbow</option>
              </select>
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
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Stream audio file</label>
                <input
                  type="file"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;
                    selectAudioFile(nextFile);
                  }}
                  className="w-full text-xs text-gray-200 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startAudioStream}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-dark-900 font-semibold text-xs hover:bg-primary-hover transition-colors"
                  disabled={wsStatus !== 'connected' || !audioFile || isAnyAudioStreamActive}
                >
                  <span>{isAudioStreaming ? 'Streaming...' : 'Play File'}</span>
                </button>
                <button
                  onClick={stopAudioStream}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/20 hover:bg-white/20 transition-colors"
                  disabled={!isAudioStreaming}
                >
                  <span>Stop</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{audioStreamMessage || audioFileName || 'No file selected'}</span>
                  <span className="font-mono text-white">{audioStreamProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${audioStreamProgress}%` }}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Stream microphone</label>
                  <p className="text-[11px] text-gray-500">
                    Sends live mic audio directly to the ESP in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={startMicrophoneStream}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-danger text-white font-semibold text-xs hover:brightness-110 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={wsStatus !== 'connected' || isAnyAudioStreamActive}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isMicStreaming ? 'Recording...' : 'Record Mic'}</span>
                  </button>
                  <button
                    onClick={stopMicrophoneStream}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!isMicStreaming}
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                </div>
                <div className="text-[11px] text-gray-400">
                  {micStreamMessage}
                </div>
              </div>
            </div>
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
              disabled={wsStatus !== 'connected' || isAnyAudioStreamActive}
            >
              <span>Play Test Beep</span>
            </button>
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Robot speech text</label>
                  <label className="text-xs text-gray-400">Voice preset</label>
                  <select
                    value={ttsVoicePreset}
                    onChange={(event) => setTtsVoicePreset(event.target.value)}
                    className="w-full h-10 rounded border border-white/10 bg-dark-900 text-white px-3 text-xs"
                    disabled={isAnyAudioStreamActive}
                  >
                    {availableTtsVoicePresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                <textarea
                  value={ttsText}
                  onChange={(event) => setTtsText(event.target.value)}
                  placeholder="Type what the robot should say..."
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-dark-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
                <p className="text-[11px] text-gray-500">
                  {availableTtsVoicePresets.find((preset) => preset.id === ttsVoicePreset)?.description || 'Uses a local speech engine in the browser, then streams the generated voice to the ESP.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTextToSpeech}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-dark-900 font-semibold text-xs hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={wsStatus !== 'connected' || !ttsText.trim() || isAnyAudioStreamActive}
                >
                  <span>{isTtsStreaming ? 'Sending Voice...' : 'Speak Text'}</span>
                </button>
                <button
                  onClick={stopTextToSpeechStream}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isTtsStreaming}
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{ttsStreamMessage}</span>
                  <span className="font-mono text-white">{ttsStreamProgress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${ttsStreamProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeripheralControl;
