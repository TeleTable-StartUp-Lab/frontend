import React, { useMemo } from 'react';
import { Activity, Navigation, RefreshCcw, Zap } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const getHealthColor = (status) => {
  switch (status) {
    case 'READY':
      return 'text-success';
    case 'MOVING':
      return 'text-primary';
    case 'ERROR':
      return 'text-danger';
    case 'UNKNOWN':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const getFrontendConnectionState = (wsStatus, wsError) => {
  switch (wsStatus) {
    case 'connected':
      return {
        label: 'Connected',
        detail: '',
        dotClassName: 'bg-success animate-pulse',
        textClassName: 'text-success',
      };
    case 'connecting':
      return {
        label: 'Connecting',
        detail: 'Opening frontend to backend event feed',
        dotClassName: 'bg-warning animate-pulse',
        textClassName: 'text-warning',
      };
    case 'error':
      return {
        label: wsError === 'Offline' ? 'Offline' : 'Disconnected',
        detail: wsError || 'Frontend cannot reach backend events feed',
        dotClassName: 'bg-danger',
        textClassName: 'text-danger',
      };
    case 'disconnected':
    default:
      return {
        label: 'Disconnected',
        detail: wsError || 'Frontend is not connected to backend events',
        dotClassName: 'bg-warning',
        textClassName: 'text-warning',
      };
  }
};

const getRobotConnectionState = (robotConnected, wsStatus) => {
  if (wsStatus === 'connecting') {
    return {
      label: 'Checking status',
      detail: 'Waiting for backend telemetry snapshot',
      dotClassName: 'bg-warning animate-pulse',
      textClassName: 'text-warning',
    };
  }

  if (robotConnected) {
    return {
      label: 'Robot connected',
      detail: 'Backend is receiving fresh robot updates',
      dotClassName: 'bg-success animate-pulse',
      textClassName: 'text-success',
    };
  }

  return {
    label: 'No recent robot updates',
    detail: '',
    dotClassName: 'bg-danger',
    textClassName: 'text-danger',
  };
};

const ConnectionStatusCard = ({ title, state }) => (
  <div className="rounded-lg border border-white/10 bg-dark-900/40 px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{title}</div>
        <div className={`mt-1 text-sm font-semibold ${state.textClassName}`}>{state.label}</div>
      </div>
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${state.dotClassName}`} aria-hidden="true"></span>
    </div>
    {state.detail ? (
      <div className="mt-2 text-xs text-gray-400">{state.detail}</div>
    ) : null}
  </div>
);

const Telemetry = () => {
  const { statusData, eventsWsStatus, eventsWsError } = useRobotControl();

  const lastOrder = useMemo(() => {
    if (!statusData.lastRoute) return '—';
    return `${statusData.lastRoute.startNode || statusData.lastRoute.start_node} -> ${statusData.lastRoute.endNode || statusData.lastRoute.end_node}`;
  }, [statusData.lastRoute]);

  const frontendConnection = useMemo(
    () => getFrontendConnectionState(eventsWsStatus, eventsWsError),
    [eventsWsError, eventsWsStatus]
  );

  const robotConnection = useMemo(
    () => getRobotConnectionState(statusData.robotConnected, eventsWsStatus),
    [eventsWsStatus, statusData.robotConnected]
  );

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-24 h-24 text-primary" />
      </div>

      <h3 className="text-lg font-medium text-gray-400 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Telemetry Status
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Status Display */}
        <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
          <div className="text-sm text-gray-500 mb-1">System Status</div>
          <div className={`text-3xl font-bold font-mono tracking-wider ${getHealthColor(statusData.systemHealth)}`}>
            {statusData.systemHealth}
          </div>
          <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
            <ConnectionStatusCard title="Frontend -> Backend" state={frontendConnection} />
            <ConnectionStatusCard title="Robot -> Backend" state={robotConnection} />
          </div>
        </div>

        {/* Battery Display */}
        <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm text-gray-500">Battery Level</div>
            <div className="text-2xl font-bold font-mono text-white">{statusData.batteryLevel}%</div>
          </div>
          <div className="w-full bg-dark-900 rounded-full h-2 border border-white/10">
            <div
              className="bg-gradient-to-r from-primary to-success h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${statusData.batteryLevel}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Mode: {statusData.driveMode}</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-warning" /> {statusData.cargoStatus}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Navigation className="w-4 h-4 mr-2 text-primary" />
            Last Route
          </div>
          <div className="font-mono text-white bg-dark-800 px-3 py-1 rounded border border-white/10">
            {lastOrder}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
          <div className="bg-dark-800/50 rounded-lg p-3 border border-white/5">
            <div className="text-gray-500">Position</div>
            <div className="text-white font-mono text-sm">{statusData.position}</div>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-3 border border-white/5">
            <div className="text-gray-500">Drive Mode</div>
            <div className="text-white font-mono text-sm">{statusData.driveMode}</div>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-3 border border-white/5">
            <div className="text-gray-500">Lock Holder</div>
            <div className="text-white font-mono text-sm">{statusData.manualLockHolderName || 'None'}</div>
          </div>
        </div>

        <div className="flex items-center justify-end text-xs text-gray-400">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-white/10">
            <RefreshCcw className={`h-3 w-3 ${eventsWsStatus === 'connected' ? 'animate-spin' : ''}`} />
            Live backend event updates
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemetry;
