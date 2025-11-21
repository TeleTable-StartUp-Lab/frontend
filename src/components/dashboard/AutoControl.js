import React, { useState } from 'react';
import { MapPin, Send, CheckCircle, Navigation } from 'lucide-react';

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
    <div className="glass-panel rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-medium text-gray-400 mb-6 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-primary" />
        Autonomous Navigation
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Start Location</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <select
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-white/10 rounded-lg bg-dark-800/50 text-gray-300 focus:outline-none focus:bg-dark-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all appearance-none cursor-pointer hover:bg-dark-800/80"
              >
                <option value="">Select Start</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
              </div>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-white/10 rounded-lg bg-dark-800/50 text-gray-300 focus:outline-none focus:bg-dark-800 focus:border-secondary focus:ring-1 focus:ring-secondary sm:text-sm transition-all appearance-none cursor-pointer hover:bg-dark-800/80"
              >
                <option value="">Select Destination</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!start || !destination || status === 'sending'}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-dark-900 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        >
          {status === 'sending' ? 'Initiating Sequence...' : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Execute Route
            </>
          )}
        </button>

        {status === 'success' && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-success">
                  Command acknowledged. Unit dispatching to target.
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