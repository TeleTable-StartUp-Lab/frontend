import React from 'react';
import { Activity, CheckCircle } from 'lucide-react';

const Telemetry = () => {
  // Mock data - in a real app this would come from the backend via polling or websocket
  const status = "Bereit"; // "Bereit", "Fährt", "Fehler"
  const batteryLevel = 85;
  const lastOrder = "Mensa -> Zimmer 101";

  const getStatusColor = (s) => {
    switch (s) {
      case 'Bereit': return 'text-green-500';
      case 'Fährt': return 'text-blue-500';
      case 'Fehler': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
              <dd className="flex items-baseline">
                <div className={`text-2xl font-semibold ${getStatusColor(status)}`}>
                  {status}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700">Battery Level</span>
            <span className="text-gray-700">{batteryLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${batteryLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-5 py-3">
         <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-400" />
            Last Order: {lastOrder}
         </div>
      </div>
    </div>
  );
};

export default Telemetry;