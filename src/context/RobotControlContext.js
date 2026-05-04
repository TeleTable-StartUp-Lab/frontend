import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const RobotControlContext = createContext(null);
const TOAST_DURATION_MS = 5000;
const AUDIO_SAMPLE_RATE_HZ = 16000;
const AUDIO_CHUNK_SAMPLES = 320;
const AUDIO_CHUNK_DELAY_MS = 20;

const getBaseUrl = () => api.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:3003';

const toWsUrl = () => {
  const base = getBaseUrl();
  return base.replace(/^http/, 'ws');
};

export const RobotControlProvider = ({ children, autoConnect = true }) => {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const eventsWsRef = useRef(null);
  const debugPollIntervalRef = useRef(null);
  const debugRequestInFlightRef = useRef(false);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [wsError, setWsError] = useState('');
  const [eventsWsStatus, setEventsWsStatus] = useState('disconnected');
  const [eventsWsError, setEventsWsError] = useState('');
  const [debugStatus, setDebugStatus] = useState('idle');
  const [debugError, setDebugError] = useState('');
  const [lastMessage, setLastMessage] = useState(null);
  const [statusData, setStatusData] = useState({
    systemHealth: 'UNKNOWN',
    batteryLevel: 0,
    driveMode: 'UNKNOWN',
    cargoStatus: 'UNKNOWN',
    position: 'UNKNOWN',
    lastRoute: null,
    manualLockHolderName: null,
    robotConnected: false,
    nodes: [],
  });
  const [debugSnapshot, setDebugSnapshot] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [hasLock, setHasLock] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioStreamMessage, setAudioStreamMessage] = useState('No file selected');
  const [audioStreamProgress, setAudioStreamProgress] = useState(0);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const [isMicStreaming, setIsMicStreaming] = useState(false);
  const [micStreamMessage, setMicStreamMessage] = useState('Microphone idle');
  const [isTtsStreaming, setIsTtsStreaming] = useState(false);
  const [ttsStreamMessage, setTtsStreamMessage] = useState('Robot voice idle');
  const [ttsStreamProgress, setTtsStreamProgress] = useState(0);
  const hasLockRef = useRef(false);
  const canManageDriveRef = useRef(false);
  const audioAbortRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const micStreamRef = useRef(null);
  const canManageDrive = user?.role === 'Admin' || user?.role === 'Operator';

  useEffect(() => {
    hasLockRef.current = hasLock;
  }, [hasLock]);

  useEffect(() => {
    canManageDriveRef.current = canManageDrive;
  }, [canManageDrive]);

  const normalizeNode = useCallback((node) => {
    if (!node) {
      return null;
    }

    const id = typeof node === 'string'
      ? node
      : (node.id ?? node.value ?? '');
    const label = typeof node === 'string'
      ? node
      : (node.label ?? node.name ?? id);

    if (!id) {
      return null;
    }

    return { id, label: label || id };
  }, []);

  const normalizeStatusPayload = useCallback((data = {}) => ({
    systemHealth: data.systemHealth ?? data.system_health ?? 'UNKNOWN',
    batteryLevel: data.batteryLevel ?? data.battery_level ?? 0,
    driveMode: data.driveMode ?? data.drive_mode ?? 'UNKNOWN',
    cargoStatus: data.cargoStatus ?? data.cargo_status ?? 'UNKNOWN',
    position: data.position ?? 'UNKNOWN',
    lastRoute: data.lastRoute ?? data.last_route ?? null,
    manualLockHolderName: data.manualLockHolderName ?? data.manual_lock_holder_name ?? null,
    robotConnected: data.robotConnected ?? data.robot_connected ?? false,
    nodes: Array.isArray(data.nodes)
      ? data.nodes.map(normalizeNode).filter(Boolean)
      : [],
  }), [normalizeNode]);

  const normalizeNotification = useCallback((data = {}) => ({
    id: data.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    priority: (data.priority ?? 'INFO').toUpperCase(),
    message: data.message ?? '',
    receivedAt: data.receivedAt ?? data.received_at ?? new Date().toISOString(),
  }), []);

  const normalizeDebugSnapshot = useCallback((data = {}) => ({
    telemetry: data.telemetry ?? null,
    lock: data.lock ?? null,
    routing: data.routing ?? null,
    connection: data.connection ?? null,
    sensors: data.sensors ?? null,
  }), []);

  const fetchDebugSnapshot = useCallback(async () => {
    if (debugRequestInFlightRef.current) {
      return null;
    }

    debugRequestInFlightRef.current = true;
    try {
      const response = await api.get('/robot/debug');
      setDebugSnapshot(normalizeDebugSnapshot(response.data));
      setDebugStatus('connected');
      setDebugError('');
      return response.data;
    } catch (error) {
      setDebugStatus('error');
      setDebugError(error?.response?.data?.error || error?.message || 'Failed to load debug snapshot');
      throw error;
    } finally {
      debugRequestInFlightRef.current = false;
    }
  }, [normalizeDebugSnapshot]);

  const stopDebugPolling = useCallback(() => {
    if (debugPollIntervalRef.current) {
      window.clearInterval(debugPollIntervalRef.current);
      debugPollIntervalRef.current = null;
    }
    debugRequestInFlightRef.current = false;
    setDebugStatus('idle');
  }, []);

  const startDebugPolling = useCallback(async () => {
    if (debugPollIntervalRef.current) {
      return;
    }

    setDebugStatus((prev) => (prev === 'connected' ? prev : 'connecting'));
    setDebugError('');

    try {
      await fetchDebugSnapshot();
    } catch {
      // Keep polling even if the initial request fails.
    }

    debugPollIntervalRef.current = window.setInterval(() => {
      fetchDebugSnapshot().catch(() => {});
    }, 1000);
  }, [fetchDebugSnapshot]);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const connectWs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setWsError('Not logged in');
      setWsStatus('error');
      return;
    }

    const url = `${toWsUrl()}/ws/drive/manual?token=${token}`;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus('connecting');
    setWsError('');
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus('connected');
      setWsError('');
    };

    socket.onclose = () => {
      setWsStatus('disconnected');
      if (!navigator.onLine) {
        setWsError('Offline');
      } else {
        setWsError('WebSocket disconnected');
      }
    };

    socket.onerror = () => {
      setWsStatus('error');
      setWsError('WebSocket error');
    };

    socket.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (parsed?.event === 'status_update' && parsed?.data) {
          setStatusData(normalizeStatusPayload(parsed.data));
          return;
        }

        if (parsed?.event === 'robot_notification' && parsed?.data) {
          const notification = normalizeNotification(parsed.data);
          setLastMessage(`[${notification.priority}] ${notification.message}`);
          setNotifications((prev) => [
            notification,
            ...prev.filter((item) => item.id !== notification.id),
          ].slice(0, 200));

          const toastId = `${notification.id}-${Date.now()}`;
          const toast = {
            ...notification,
            toastId,
            durationMs: TOAST_DURATION_MS,
          };
          setToasts((prev) => [toast, ...prev].slice(0, 5));
          return;
        }

        setLastMessage(msg.data);
      } catch {
        setLastMessage(msg.data);
      }
    };
  }, [normalizeNotification, normalizeStatusPayload]);

  const connectEventsWs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setEventsWsError('Not logged in');
      setEventsWsStatus('error');
      return;
    }

    const url = `${toWsUrl()}/ws/robot/events?token=${token}`;

    if (eventsWsRef.current) {
      eventsWsRef.current.close();
      eventsWsRef.current = null;
    }

    setEventsWsStatus('connecting');
    setEventsWsError('');
    const socket = new WebSocket(url);
    eventsWsRef.current = socket;

    socket.onopen = () => {
      setEventsWsStatus('connected');
      setEventsWsError('');
    };

    socket.onclose = () => {
      setEventsWsStatus('disconnected');
      if (!navigator.onLine) {
        setEventsWsError('Offline');
      } else {
        setEventsWsError('WebSocket disconnected');
      }
    };

    socket.onerror = () => {
      setEventsWsStatus('error');
      setEventsWsError('WebSocket error');
    };

    socket.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (parsed?.event === 'status_update' && parsed?.data) {
          setStatusData(normalizeStatusPayload(parsed.data));
          return;
        }

        if (parsed?.event === 'robot_notification' && parsed?.data) {
          const notification = normalizeNotification(parsed.data);
          setLastMessage(`[${notification.priority}] ${notification.message}`);
          setNotifications((prev) => [
            notification,
            ...prev.filter((item) => item.id !== notification.id),
          ].slice(0, 200));

          const toastId = `${notification.id}-${Date.now()}`;
          const toast = {
            ...notification,
            toastId,
            durationMs: TOAST_DURATION_MS,
          };
          setToasts((prev) => [toast, ...prev].slice(0, 5));
          return;
        }

        setLastMessage(msg.data);
      } catch {
        setLastMessage(msg.data);
      }
    };
  }, [normalizeNotification, normalizeStatusPayload]);

  const disconnectWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const disconnectEventsWs = useCallback(() => {
    if (eventsWsRef.current) {
      eventsWsRef.current.close();
      eventsWsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((command) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(JSON.stringify(command));
    return true;
  }, []);

  const sendBinary = useCallback((data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(data);
    return true;
  }, []);

  const selectAudioFile = useCallback((file) => {
    setAudioFile(file || null);
    setAudioFileName(file?.name || '');
    setAudioStreamProgress(0);
    setAudioStreamMessage(file?.name || 'No file selected');
  }, []);

  const downmixToMono = useCallback((audioBuffer, audioContext) => {
    if (audioBuffer.numberOfChannels === 1) {
      return audioBuffer;
    }

    const mono = audioContext.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
    const monoData = mono.getChannelData(0);
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i += 1) {
        monoData[i] += channelData[i] / audioBuffer.numberOfChannels;
      }
    }

    return mono;
  }, []);

  const decodeToPcm = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    const OfflineAudioContextConstructor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextConstructor || !OfflineAudioContextConstructor) {
      throw new Error('Web Audio API not supported in this browser');
    }

    const audioContext = new AudioContextConstructor();
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    const monoBuffer = downmixToMono(decoded, audioContext);

    const offline = new OfflineAudioContextConstructor(
      1,
      Math.ceil(monoBuffer.duration * AUDIO_SAMPLE_RATE_HZ),
      AUDIO_SAMPLE_RATE_HZ
    );

    const source = offline.createBufferSource();
    source.buffer = monoBuffer;
    source.connect(offline.destination);
    source.start(0);

    const rendered = await offline.startRendering();
    await audioContext.close();

    const floatData = rendered.getChannelData(0);
    const pcm = new Int16Array(floatData.length);
    for (let i = 0; i < floatData.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, floatData[i]));
      pcm[i] = Math.round(sample * 32767);
    }

    return pcm;
  }, [downmixToMono]);

  const streamPcm = useCallback(async (pcmData, signal) => {
    const totalSamples = pcmData.length;
    let sentSamples = 0;

    while (sentSamples < totalSamples) {
      if (signal.aborted) {
        break;
      }

      const end = Math.min(sentSamples + AUDIO_CHUNK_SAMPLES, totalSamples);
      const chunk = pcmData.subarray(sentSamples, end);
      const buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
      const ok = sendBinary(buffer);
      if (!ok) {
        throw new Error('WebSocket not connected');
      }

      sentSamples = end;
      setAudioStreamProgress(Math.round((sentSamples / totalSamples) * 100));

      await new Promise((resolve) => setTimeout(resolve, AUDIO_CHUNK_DELAY_MS));
    }
  }, [sendBinary]);

  const createLivePcmEncoder = useCallback((sourceSampleRate) => {
    const resampleRatio = sourceSampleRate / AUDIO_SAMPLE_RATE_HZ;
    let bufferedInput = new Float32Array(0);
    let bufferedOutput = new Int16Array(0);

    const downsampleChunk = (inputChunk) => {
      const merged = new Float32Array(bufferedInput.length + inputChunk.length);
      merged.set(bufferedInput, 0);
      merged.set(inputChunk, bufferedInput.length);

      if (sourceSampleRate === AUDIO_SAMPLE_RATE_HZ) {
        const pcm = new Int16Array(merged.length);
        for (let i = 0; i < merged.length; i += 1) {
          const sample = Math.max(-1, Math.min(1, merged[i]));
          pcm[i] = Math.round(sample * 32767);
        }
        bufferedInput = new Float32Array(0);
        return pcm;
      }

      const outputLength = Math.floor(merged.length / resampleRatio);
      if (outputLength <= 0) {
        bufferedInput = merged;
        return new Int16Array(0);
      }

      const pcm = new Int16Array(outputLength);
      let offsetBuffer = 0;
      for (let i = 0; i < outputLength; i += 1) {
        const nextOffsetBuffer = Math.round((i + 1) * resampleRatio);
        let accum = 0;
        let count = 0;
        for (let j = offsetBuffer; j < nextOffsetBuffer && j < merged.length; j += 1) {
          accum += merged[j];
          count += 1;
        }
        const sample = count ? accum / count : 0;
        pcm[i] = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
        offsetBuffer = nextOffsetBuffer;
      }

      bufferedInput = merged.slice(offsetBuffer);
      return pcm;
    };

    return {
      push(floatChunk) {
        const nextPcm = downsampleChunk(floatChunk);
        if (!nextPcm.length) {
          return [];
        }

        const combined = new Int16Array(bufferedOutput.length + nextPcm.length);
        combined.set(bufferedOutput, 0);
        combined.set(nextPcm, bufferedOutput.length);

        const chunks = [];
        let offset = 0;
        while (offset + AUDIO_CHUNK_SAMPLES <= combined.length) {
          chunks.push(combined.slice(offset, offset + AUDIO_CHUNK_SAMPLES));
          offset += AUDIO_CHUNK_SAMPLES;
        }

        bufferedOutput = combined.slice(offset);
        return chunks;
      },
      flush() {
        const tailPcm = downsampleChunk(new Float32Array(0));
        if (tailPcm.length) {
          const combined = new Int16Array(bufferedOutput.length + tailPcm.length);
          combined.set(bufferedOutput, 0);
          combined.set(tailPcm, bufferedOutput.length);
          bufferedOutput = combined;
        }

        if (!bufferedOutput.length) {
          return [];
        }
        const remainder = bufferedOutput;
        bufferedOutput = new Int16Array(0);
        return [remainder];
      },
    };
  }, []);

  const synthesizeRobotSpeech = useCallback((text) => {
    const normalizedText = String(text || '')
      .trim()
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss');

    if (!normalizedText) {
      throw new Error('Enter text first');
    }

    const vowelFormants = {
      a: [800, 1200],
      e: [500, 1900],
      i: [320, 2400],
      o: [520, 900],
      u: [350, 800],
      y: [380, 1700],
    };

    const consonantShapes = {
      b: { duration: 0.05, noise: 0.08, tone: 135 },
      c: { duration: 0.06, noise: 0.28, tone: 150 },
      d: { duration: 0.05, noise: 0.1, tone: 145 },
      f: { duration: 0.055, noise: 0.34, tone: 180 },
      g: { duration: 0.06, noise: 0.08, tone: 125 },
      h: { duration: 0.05, noise: 0.2, tone: 160 },
      j: { duration: 0.055, noise: 0.15, tone: 175 },
      k: { duration: 0.05, noise: 0.24, tone: 150 },
      l: { duration: 0.06, noise: 0.03, tone: 170 },
      m: { duration: 0.07, noise: 0.02, tone: 120 },
      n: { duration: 0.065, noise: 0.02, tone: 128 },
      p: { duration: 0.045, noise: 0.28, tone: 160 },
      q: { duration: 0.05, noise: 0.22, tone: 150 },
      r: { duration: 0.06, noise: 0.04, tone: 155 },
      s: { duration: 0.065, noise: 0.38, tone: 210 },
      t: { duration: 0.045, noise: 0.26, tone: 185 },
      v: { duration: 0.06, noise: 0.24, tone: 170 },
      w: { duration: 0.06, noise: 0.08, tone: 145 },
      x: { duration: 0.07, noise: 0.32, tone: 210 },
      z: { duration: 0.065, noise: 0.26, tone: 195 },
    };

    const sampleRate = AUDIO_SAMPLE_RATE_HZ;
    const segments = [];
    let charIndex = 0;

    const createSilence = (durationSec) => {
      segments.push(new Float32Array(Math.max(1, Math.round(durationSec * sampleRate))));
    };

    const createSegment = (char, durationSec, generator) => {
      const length = Math.max(1, Math.round(durationSec * sampleRate));
      const segment = new Float32Array(length);
      for (let i = 0; i < length; i += 1) {
        const t = i / sampleRate;
        const fade = Math.min(i / (length * 0.15), (length - i) / (length * 0.18), 1);
        segment[i] = generator(t, fade);
      }
      segments.push(segment);
      if (char !== ' ') {
        createSilence(0.012);
      }
    };

    for (const char of normalizedText) {
      charIndex += 1;
      if (char === ' ') {
        createSilence(0.06);
        continue;
      }

      if (/[.,!?;:]/.test(char)) {
        createSilence(0.1);
        continue;
      }

      if (vowelFormants[char]) {
        const [f1, f2] = vowelFormants[char];
        const fundamental = 105 + ((charIndex % 5) * 18);
        createSegment(char, 0.11, (t, fade) => {
          const saw = (
            Math.sin(2 * Math.PI * fundamental * t)
            + 0.5 * Math.sin(2 * Math.PI * fundamental * 2 * t)
            + 0.25 * Math.sin(2 * Math.PI * fundamental * 3 * t)
          ) / 1.75;
          const formants = (
            0.45 * Math.sin(2 * Math.PI * f1 * t)
            + 0.28 * Math.sin(2 * Math.PI * f2 * t)
          );
          const ring = Math.sin(2 * Math.PI * (fundamental * 0.5) * t) * 0.2 + 0.8;
          return fade * (0.42 * saw + 0.22 * formants * ring);
        });
        continue;
      }

      const shape = consonantShapes[char] || { duration: 0.05, noise: 0.18, tone: 165 };
      createSegment(char, shape.duration, (t, fade) => {
        const pulse = Math.sign(Math.sin(2 * Math.PI * shape.tone * t));
        const metallic = Math.sin(2 * Math.PI * shape.tone * 2.4 * t);
        const deterministicNoise = (
          Math.sin(2 * Math.PI * (shape.tone * 7.3) * t)
          + 0.5 * Math.sin(2 * Math.PI * (shape.tone * 11.1) * t)
          + 0.33 * Math.sin(2 * Math.PI * (shape.tone * 13.7) * t)
        ) / 1.83;
        return fade * (0.18 * pulse + 0.12 * metallic + shape.noise * deterministicNoise);
      });
    }

    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    const floatData = new Float32Array(totalLength);
    let offset = 0;
    segments.forEach((segment) => {
      floatData.set(segment, offset);
      offset += segment.length;
    });

    const pcm = new Int16Array(floatData.length);
    for (let i = 0; i < floatData.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, floatData[i] * 1.6));
      pcm[i] = Math.round(sample * 32767);
    }

    return pcm;
  }, []);

  const cleanupMicStream = useCallback(async ({ sendStop = true, message } = {}) => {
    const activeMicStream = micStreamRef.current;
    micStreamRef.current = null;

    if (activeMicStream?.processor) {
      activeMicStream.processor.onaudioprocess = null;
      activeMicStream.processor.disconnect();
    }

    if (activeMicStream?.source) {
      activeMicStream.source.disconnect();
    }

    if (activeMicStream?.mediaStream) {
      activeMicStream.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (activeMicStream?.audioContext && activeMicStream.audioContext.state !== 'closed') {
      await activeMicStream.audioContext.close().catch(() => {});
    }

    if (sendStop) {
      sendCommand({ command: 'AUDIO_STREAM_STOP' });
    }

    setIsMicStreaming(false);
    if (message) {
      setMicStreamMessage(message);
    }
  }, [sendCommand]);

  const stopAudioStream = useCallback(() => {
    if (audioAbortRef.current) {
      audioAbortRef.current.abort();
      audioAbortRef.current = null;
    }
    sendCommand({ command: 'AUDIO_STREAM_STOP' });
    setIsAudioStreaming(false);
    setAudioStreamMessage('Stop sent');
  }, [sendCommand]);

  const stopMicrophoneStream = useCallback(() => {
    cleanupMicStream({ sendStop: true, message: 'Microphone stopped' }).catch(() => {});
  }, [cleanupMicStream]);

  const stopTextToSpeechStream = useCallback(() => {
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    sendCommand({ command: 'AUDIO_STREAM_STOP' });
    setIsTtsStreaming(false);
    setTtsStreamMessage('Robot voice stopped');
  }, [sendCommand]);

  const startAudioStream = useCallback(async () => {
    if (!audioFile) {
      setAudioStreamMessage('Choose an audio file first');
      return;
    }

    if (wsStatus !== 'connected') {
      setAudioStreamMessage('WebSocket not connected');
      return;
    }

    if (isAudioStreaming || isMicStreaming || isTtsStreaming) {
      return;
    }

    const abortController = new AbortController();
    audioAbortRef.current = abortController;
    setIsAudioStreaming(true);
    setAudioStreamProgress(0);
    setAudioStreamMessage('Decoding audio...');

    let started = false;

    try {
      const pcmData = await decodeToPcm(audioFile);
      if (abortController.signal.aborted) {
        return;
      }

      const ok = sendCommand({
        command: 'AUDIO_STREAM_START',
        sample_rate_hz: AUDIO_SAMPLE_RATE_HZ,
        channels: 1,
        bits_per_sample: 16,
        little_endian: true,
      });
      if (!ok) {
        throw new Error('WebSocket not connected');
      }

      started = true;
      setAudioStreamMessage('Streaming audio...');
      await streamPcm(pcmData, abortController.signal);
      if (!abortController.signal.aborted) {
        setAudioStreamMessage('Stream complete');
      }
    } catch (error) {
      setAudioStreamMessage(error?.message || 'Stream failed');
    } finally {
      if (started) {
        sendCommand({ command: 'AUDIO_STREAM_STOP' });
      }
      setIsAudioStreaming(false);
    }
  }, [audioFile, decodeToPcm, isAudioStreaming, isMicStreaming, isTtsStreaming, sendCommand, streamPcm, wsStatus]);

  const startMicrophoneStream = useCallback(async () => {
    if (wsStatus !== 'connected') {
      setMicStreamMessage('WebSocket not connected');
      return;
    }

    if (isAudioStreaming || isMicStreaming || isTtsStreaming) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStreamMessage('Microphone capture not supported');
      return;
    }

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      setMicStreamMessage('Web Audio API not supported in this browser');
      return;
    }

    setAudioStreamProgress(0);
    setMicStreamMessage('Requesting microphone access...');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const ok = sendCommand({
        command: 'AUDIO_STREAM_START',
        sample_rate_hz: AUDIO_SAMPLE_RATE_HZ,
        channels: 1,
        bits_per_sample: 16,
        little_endian: true,
      });
      if (!ok) {
        mediaStream.getTracks().forEach((track) => track.stop());
        throw new Error('WebSocket not connected');
      }

      const audioContext = new AudioContextConstructor();
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const encodePcm = createLivePcmEncoder(audioContext.sampleRate);

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const chunks = encodePcm.push(input);

        for (const chunk of chunks) {
          const buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          const sent = sendBinary(buffer);
          if (!sent) {
            cleanupMicStream({ sendStop: true, message: 'WebSocket not connected' }).catch(() => {});
            break;
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      micStreamRef.current = {
        mediaStream,
        audioContext,
        source,
        processor,
      };

      setIsMicStreaming(true);
      setMicStreamMessage('Streaming microphone...');

      const track = mediaStream.getAudioTracks()[0];
      if (track) {
        track.onended = () => {
          const tailChunks = encodePcm.flush();
          for (const chunk of tailChunks) {
            const buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
            sendBinary(buffer);
          }
          cleanupMicStream({ sendStop: true, message: 'Microphone stopped' }).catch(() => {});
        };
      }
    } catch (error) {
      setIsMicStreaming(false);
      setMicStreamMessage(error?.message || 'Microphone stream failed');
    }
  }, [cleanupMicStream, createLivePcmEncoder, isAudioStreaming, isMicStreaming, isTtsStreaming, sendBinary, sendCommand, wsStatus]);

  const startTextToSpeechStream = useCallback(async (text) => {
    if (wsStatus !== 'connected') {
      setTtsStreamMessage('WebSocket not connected');
      return;
    }

    if (isAudioStreaming || isMicStreaming || isTtsStreaming) {
      return;
    }

    const normalizedText = String(text || '').trim();
    if (!normalizedText) {
      setTtsStreamMessage('Enter text first');
      return;
    }

    const abortController = new AbortController();
    ttsAbortRef.current = abortController;
    setIsTtsStreaming(true);
    setTtsStreamProgress(0);
    setTtsStreamMessage('Synthesizing robot voice...');

    let started = false;

    try {
      const pcmData = synthesizeRobotSpeech(normalizedText);
      if (abortController.signal.aborted) {
        return;
      }

      const ok = sendCommand({
        command: 'AUDIO_STREAM_START',
        sample_rate_hz: AUDIO_SAMPLE_RATE_HZ,
        channels: 1,
        bits_per_sample: 16,
        little_endian: true,
      });
      if (!ok) {
        throw new Error('WebSocket not connected');
      }

      started = true;
      setTtsStreamMessage('Streaming robot voice...');

      const totalSamples = pcmData.length;
      let sentSamples = 0;

      while (sentSamples < totalSamples) {
        if (abortController.signal.aborted) {
          break;
        }

        const end = Math.min(sentSamples + AUDIO_CHUNK_SAMPLES, totalSamples);
        const chunk = pcmData.subarray(sentSamples, end);
        const buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
        const sent = sendBinary(buffer);
        if (!sent) {
          throw new Error('WebSocket not connected');
        }

        sentSamples = end;
        setTtsStreamProgress(Math.round((sentSamples / totalSamples) * 100));
        await new Promise((resolve) => setTimeout(resolve, AUDIO_CHUNK_DELAY_MS));
      }

      if (!abortController.signal.aborted) {
        setTtsStreamMessage('Robot voice sent');
      }
    } catch (error) {
      setTtsStreamMessage(error?.message || 'Robot voice failed');
    } finally {
      if (started) {
        sendCommand({ command: 'AUDIO_STREAM_STOP' });
      }
      ttsAbortRef.current = null;
      setIsTtsStreaming(false);
    }
  }, [isAudioStreaming, isMicStreaming, isTtsStreaming, sendBinary, sendCommand, synthesizeRobotSpeech, wsStatus]);

  const acquireLock = useCallback(async () => {
    if (!canManageDriveRef.current) {
      return { status: 'error', message: 'Insufficient permissions to acquire lock' };
    }

    const response = await api.post('/drive/lock');
    if (response.data?.status !== 'error') {
      setHasLock(true);
    }
    return response.data;
  }, []);

  const releaseLock = useCallback(async () => {
    if (!canManageDriveRef.current) {
      return { status: 'skipped', message: 'Unlock skipped: role cannot hold drive lock' };
    }

    if (!hasLockRef.current) {
      return { status: 'skipped', message: 'Unlock skipped: no active drive lock' };
    }

    const response = await api.delete('/drive/lock');
    if (response.data?.status !== 'error') {
      setHasLock(false);
    }
    return response.data;
  }, []);

  const releaseLockOnExit = useCallback(() => {
    if (!canManageDriveRef.current || !hasLockRef.current) {
      disconnectWs();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      disconnectWs();
      return;
    }

    const url = `${getBaseUrl()}/drive/lock`;
    try {
      fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        keepalive: true,
      });
    } catch (error) {
      // Ignore errors on page exit
    }

    disconnectWs();
  }, [disconnectWs]);

  const getNodes = useCallback(async () => {
    const response = await api.get('/nodes');
    const nodes = Array.isArray(response.data?.nodes)
      ? response.data.nodes.map(normalizeNode).filter(Boolean)
      : [];
    return { ...response.data, nodes };
  }, [normalizeNode]);

  const selectRoute = useCallback(async (start, destination) => {
    const response = await api.post('/routes/select', { start, destination });
    return response.data;
  }, []);

  const checkRobotConnection = useCallback(async () => {
    const response = await api.get('/robot/check');
    return response.data;
  }, []);

  const loadNotificationHistory = useCallback(async () => {
    const response = await api.get('/robot/notifications?limit=100');
    const history = Array.isArray(response.data)
      ? response.data.map(normalizeNotification)
      : [];
    setNotifications(history);
  }, [normalizeNotification]);

  useEffect(() => {
    if (autoConnect && localStorage.getItem('token')) {
      connectEventsWs();
    }
    return () => {
      if (localStorage.getItem('token') && canManageDriveRef.current && hasLockRef.current) {
        releaseLock().catch(() => {});
      }
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
        ttsAbortRef.current = null;
      }
      cleanupMicStream({ sendStop: false }).catch(() => {});
      disconnectWs();
      disconnectEventsWs();
      stopDebugPolling();
    };
  }, [autoConnect, cleanupMicStream, connectEventsWs, disconnectEventsWs, disconnectWs, releaseLock, stopDebugPolling]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return;
    }

    loadNotificationHistory().catch(() => {});
  }, [loadNotificationHistory]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return;
    }

    getNodes()
      .then((response) => {
        if (!response.nodes.length) {
          return;
        }

        setStatusData((prev) => (
          prev.nodes.length
            ? prev
            : { ...prev, nodes: response.nodes }
        ));
      })
      .catch(() => {});
  }, [getNodes]);

  useEffect(() => {
    const handlePageLeave = () => {
      releaseLockOnExit();
    };

    window.addEventListener('pagehide', handlePageLeave);
    window.addEventListener('beforeunload', handlePageLeave);

    return () => {
      window.removeEventListener('pagehide', handlePageLeave);
      window.removeEventListener('beforeunload', handlePageLeave);
    };
  }, [releaseLockOnExit]);

  useEffect(() => {
    const handleOffline = () => {
      setWsStatus('error');
      setWsError('Offline');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setEventsWsStatus('error');
      setEventsWsError('Offline');
      if (eventsWsRef.current) {
        eventsWsRef.current.close();
        eventsWsRef.current = null;
      }
      setDebugStatus('error');
      setDebugError('Offline');
    };

    const handleOnline = () => {
      setWsError('');
      setWsStatus((prev) => (prev === 'error' ? 'disconnected' : prev));
      setEventsWsError('');
      setEventsWsStatus((prev) => (prev === 'error' ? 'disconnected' : prev));
      setDebugError('');
      setDebugStatus((prev) => (prev === 'error' ? 'idle' : prev));
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (wsStatus !== 'connected') {
      if (isAudioStreaming) {
        stopAudioStream();
      }
      if (isMicStreaming) {
        stopMicrophoneStream();
      }
      if (isTtsStreaming) {
        stopTextToSpeechStream();
      }
    }
  }, [isAudioStreaming, isMicStreaming, isTtsStreaming, stopAudioStream, stopMicrophoneStream, stopTextToSpeechStream, wsStatus]);

  const nodeLabelMap = useMemo(() => {
    const entries = statusData.nodes.map((node) => [node.id, node.label]);
    return new Map(entries);
  }, [statusData.nodes]);

  const resolveNodeLabel = useCallback((nodeId, fallback = '—') => {
    if (!nodeId) {
      return fallback;
    }

    return nodeLabelMap.get(nodeId) || nodeId;
  }, [nodeLabelMap]);

  const value = useMemo(
    () => ({
      wsStatus,
      wsError,
      eventsWsStatus,
      eventsWsError,
      debugStatus,
      debugError,
      lastMessage,
      statusData,
      debugSnapshot,
      nodes: statusData.nodes,
      resolveNodeLabel,
      notifications,
      toasts,
      dismissToast,
      clearNotifications,
      connectWs,
      connectEventsWs,
      startDebugPolling,
      stopDebugPolling,
      disconnectWs,
      disconnectEventsWs,
      sendCommand,
      sendBinary,
      audioFile,
      audioFileName,
      audioStreamMessage,
      audioStreamProgress,
      isAudioStreaming,
      isMicStreaming,
      micStreamMessage,
      isTtsStreaming,
      ttsStreamMessage,
      ttsStreamProgress,
      selectAudioFile,
      startAudioStream,
      stopAudioStream,
      startMicrophoneStream,
      stopMicrophoneStream,
      startTextToSpeechStream,
      stopTextToSpeechStream,
      acquireLock,
      releaseLock,
      getNodes,
      selectRoute,
      checkRobotConnection,
    }),
    [
      wsStatus,
      wsError,
      eventsWsStatus,
      eventsWsError,
      debugStatus,
      debugError,
      lastMessage,
      statusData,
      debugSnapshot,
      resolveNodeLabel,
      notifications,
      toasts,
      dismissToast,
      clearNotifications,
      connectWs,
      connectEventsWs,
      startDebugPolling,
      stopDebugPolling,
      disconnectWs,
      disconnectEventsWs,
      sendCommand,
      sendBinary,
      audioFile,
      audioFileName,
      audioStreamMessage,
      audioStreamProgress,
      isAudioStreaming,
      isMicStreaming,
      micStreamMessage,
      isTtsStreaming,
      ttsStreamMessage,
      ttsStreamProgress,
      selectAudioFile,
      startAudioStream,
      stopAudioStream,
      startMicrophoneStream,
      stopMicrophoneStream,
      startTextToSpeechStream,
      stopTextToSpeechStream,
      acquireLock,
      releaseLock,
      getNodes,
      selectRoute,
      checkRobotConnection,
    ]
  );

  return (
    <RobotControlContext.Provider value={value}>
      {children}
    </RobotControlContext.Provider>
  );
};

export const useRobotControl = () => useContext(RobotControlContext);
