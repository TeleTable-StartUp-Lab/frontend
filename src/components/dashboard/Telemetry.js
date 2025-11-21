import React from 'react';
import { Activity, Zap, Navigation } from 'lucide-react';

const Telemetry = () => {
  // Mock data
  const status = "READY";
  const batteryLevel = 85;
  const lastOrder = "Mensa -> Zimmer 101";

  const getStatusColor = (s) => {
    switch (s) {
      case 'READY': return 'text-success';
      case 'MOVING': return 'text-primary';
      case 'ERROR': return 'text-danger';
      default: return 'text-gray-500';
    }
  };

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
          <div className={`text-3xl font-bold font-mono tracking-wider ${getStatusColor(status)}`}>
            {status}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Connection Stable
          </div>
        </div>

        {/* Battery Display */}
        <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm text-gray-500">Battery Level</div>
            <div className="text-2xl font-bold font-mono text-white">{batteryLevel}%</div>
          </div>
          <div className="w-full bg-dark-900 rounded-full h-2 border border-white/10">
            <div
              className="bg-gradient-to-r from-primary to-success h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${batteryLevel}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>24.5V</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-warning" /> Discharging</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-400">
            <Navigation className="w-4 h-4 mr-2 text-primary" />
            Last Route
          </div>
          <div className="font-mono text-white bg-dark-800 px-3 py-1 rounded border border-white/10">
            {lastOrder}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemetry;