import React from 'react';
import Telemetry from '../components/dashboard/Telemetry';
import ManualControl from '../components/dashboard/ManualControl';
import AutoControl from '../components/dashboard/AutoControl';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Control Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Telemetry />
          <AutoControl />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ManualControl />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;