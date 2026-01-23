import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Zap, Navigation, RefreshCcw } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const Telemetry = () => {
  const { getStatus, wsStatus } = useRobotControl();
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState({
    systemHealth: 'UNKNOWN',
    batteryLevel: 0,
    driveMode: 'UNKNOWN',
    cargoStatus: 'UNKNOWN',
    position: 'UNKNOWN',
    lastRoute: null,
    manualLockHolderName: null,
  });

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStatus();
      setStatusData({
        systemHealth: data.systemHealth ?? data.system_health ?? 'UNKNOWN',
        batteryLevel: data.batteryLevel ?? data.battery_level ?? 0,
        driveMode: data.driveMode ?? data.drive_mode ?? 'UNKNOWN',
        cargoStatus: data.cargoStatus ?? data.cargo_status ?? 'UNKNOWN',
        position: data.position ?? 'UNKNOWN',
        lastRoute: data.lastRoute ?? data.last_route ?? null,
        manualLockHolderName: data.manualLockHolderName ?? data.manual_lock_holder_name ?? null,
      });
    } catch (e) {
      // ignore transient errors
    } finally {
      setLoading(false);
    }
  }, [getStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const id = setInterval(fetchStatus, 3000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const getStatusColor = (s) => {
    switch (s) {
      case 'READY': return 'text-success';
      case 'MOVING': return 'text-primary';
      case 'ERROR': return 'text-danger';
      case 'UNKNOWN': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const lastOrder = useMemo(() => {
    if (!statusData.lastRoute) return '—';
    return `${statusData.lastRoute.startNode || statusData.lastRoute.start_node} -> ${statusData.lastRoute.endNode || statusData.lastRoute.end_node}`;
  }, [statusData.lastRoute]);

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
          <div className={`text-3xl font-bold font-mono tracking-wider ${getStatusColor(statusData.systemHealth)}`}>
            {statusData.systemHealth}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-success animate-pulse' : 'bg-warning'}`}></span>
            WS: {wsStatus.toUpperCase()}
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
            <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Auto refresh (3s)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemetry;