import React, { useState } from 'react';
import { MapPin, Send, CheckCircle } from 'lucide-react';

const AutoControl = () => {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('');

  const locations = [
    "Mensa",
    "Apotheke",
    "Zimmer 101",
    "Zimmer 102",
    "Empfang"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!start || !destination) return;
    
    setStatus('sending');
    // Mock API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus(''), 3000);
    }, 1000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Autonomous Navigation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Location</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            >
              <option value="">Select Start</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            >
              <option value="">Select Destination</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!start || !destination || status === 'sending'}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Start Route
            </>
          )}
        </button>

        {status === 'success' && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Order received! Table is on the way.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AutoControl;