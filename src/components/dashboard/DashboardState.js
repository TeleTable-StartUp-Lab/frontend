import { cleanValue } from './DashboardPrimitives';

const isKnown = (value) => cleanValue(value, '') !== '';

export const formatBattery = (statusData) => {
  const rawLevel = statusData?.batteryLevel;
  const hasTelemetry = Boolean(statusData?.robotConnected) || isKnown(statusData?.systemHealth);
  const numeric = Number(rawLevel);

  if (!hasTelemetry || rawLevel === null || rawLevel === undefined || rawLevel === '') {
    return '—';
  }

  if (!Number.isFinite(numeric)) {
    return '—';
  }

  return `${Math.max(0, Math.min(100, Math.round(numeric)))}%`;
};

export const telemetryAvailable = (statusData) => (
  Boolean(statusData?.robotConnected)
  || isKnown(statusData?.position)
  || isKnown(statusData?.systemHealth)
  || isKnown(statusData?.driveMode)
  || isKnown(statusData?.cargoStatus)
);

export const computeDashboardState = ({
  mode,
  statusData,
  eventsWsStatus,
  eventsWsError,
  wsStatus,
  wsError,
  canOperate,
  isNavigating,
}) => {
  const backendConnected = eventsWsStatus === 'connected';
  const backendConnecting = eventsWsStatus === 'connecting';
  const commandConnected = wsStatus === 'connected';
  const robotConnected = Boolean(statusData?.robotConnected);
  const health = cleanValue(statusData?.systemHealth, '—');
  const driveMode = cleanValue(statusData?.driveMode, '—');
  const battery = formatBattery(statusData);
  const robotPosition = cleanValue(statusData?.position, '');
  const hasTelemetry = telemetryAvailable(statusData);
  const reportedMoving = health === 'MOVING' || driveMode === 'NAVIGATING' || driveMode === 'AUTO';
  const navigating = Boolean(isNavigating || reportedMoving);

  let state = 'manual_ready';
  let primaryState = 'READY';
  let explanation = mode === 'manual'
    ? 'Manual control is available.'
    : 'Autonomous controls are available.';
  let blocker = '';
  let severity = 'success';
  let primaryAction = null;

  if (!backendConnected) {
    state = 'backend_offline';
    primaryState = backendConnecting ? 'SYSTEM NOT READY' : 'SYSTEM NOT READY';
    explanation = backendConnecting
      ? 'Waiting for the backend telemetry feed to connect.'
      : (eventsWsError || 'Backend telemetry is not connected.');
    blocker = explanation;
    severity = 'warning';
  } else if (!robotConnected) {
    state = 'robot_offline';
    primaryState = 'ROBOT OFFLINE';
    explanation = 'Backend is connected, but no recent robot telemetry has been received.';
    blocker = explanation;
    severity = 'danger';
  } else if (navigating) {
    state = 'navigating';
    primaryState = 'NAVIGATING';
    explanation = 'Robot is executing or has an active planned route.';
    severity = 'primary';
  } else if (!commandConnected && canOperate) {
    state = 'command_disconnected';
    primaryState = 'COMMAND DISCONNECTED';
    explanation = mode === 'manual'
      ? 'Robot telemetry is online, but manual driving needs the command socket.'
      : 'Robot telemetry is online. Connect the command socket before starting navigation.';
    blocker = explanation;
    severity = 'warning';
    primaryAction = 'connect_command';
  } else if (!canOperate) {
    state = 'error';
    primaryState = 'SYSTEM NOT READY';
    explanation = 'Your account is read-only, so robot controls are unavailable.';
    blocker = explanation;
    severity = 'warning';
  } else {
    state = mode === 'manual' ? 'manual_ready' : 'autonomous_ready';
  }

  return {
    state,
    primaryState,
    explanation,
    blocker,
    severity,
    primaryAction,
    mode,
    canOperate,
    backendConnected,
    commandConnected,
    robotConnected,
    navigating,
    hasTelemetry,
    robotPosition,
    chips: [
      { label: 'Backend', value: backendConnected ? 'Online' : backendConnecting ? 'Connecting' : 'Offline', tone: backendConnected ? 'success' : 'warning' },
      { label: 'Robot', value: robotConnected ? 'Online' : 'Offline', tone: robotConnected ? 'success' : 'danger' },
      { label: 'Command', value: commandConnected ? 'Connected' : 'Disconnected', tone: commandConnected ? 'success' : 'warning' },
      { label: 'Mode', value: mode === 'manual' ? 'Manual' : 'Auto', tone: mode === 'manual' ? 'success' : 'primary' },
      { label: 'Battery', value: battery, tone: battery === '—' ? 'neutral' : 'success' },
      { label: 'Health', value: health, tone: health === 'ERROR' ? 'danger' : health === 'MOVING' ? 'primary' : health === 'READY' ? 'success' : 'neutral' },
    ],
    diagnostics: {
      backend: eventsWsError || eventsWsStatus,
      command: wsError || wsStatus,
      health,
      driveMode,
      battery,
      robotPosition: robotPosition || '—',
    },
  };
};
