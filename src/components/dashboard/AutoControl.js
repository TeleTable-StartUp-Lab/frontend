import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Send, CheckCircle, Navigation, XCircle } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { useAuth } from '../../context/AuthContext';

const AutoControl = () => {
  const { getNodes, selectRoute, sendCommand } = useRobotControl();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const canOperate = user?.role === 'Admin' || user?.role === 'Operator';
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('');
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState('');

  const fetchNodes = useCallback(async () => {
    setError('');
    try {
      const data = await getNodes();
      setNodes(data.nodes || []);
    } catch (e) {
      setError('Failed to fetch nodes');
    } finally {
      // no-op
    }
  }, [getNodes]);

  useEffect(() => {
    fetchNodes();
    const intervalId = setInterval(fetchNodes, 600000);
    return () => clearInterval(intervalId);
  }, [fetchNodes]);

  const locations = useMemo(() => nodes, [nodes]);

  const handleSelectRoute = async () => {
    if (!start || !destination) return;
    setStatus('sending');
    setError('');
    try {
      const res = await selectRoute(start, destination);
      if (res.status === 'error') {
        setError(res.message || 'Route selection failed');
        setStatus('');
      } else {
        setStatus('success');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (e) {
      setError('Route selection failed');
      setStatus('');
    }
  };

  const handleNavigateWs = () => {
    if (!start || !destination) return;
    const ok = sendCommand({
      command: 'NAVIGATE',
      start,
      destination,
    });
    if (!ok) {
      setError('WebSocket not connected');
    } else {
      setStatus('success');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleCancel = () => {
    const ok = sendCommand({ command: 'CANCEL' });
    if (!ok) {
      setError('WebSocket not connected');
    }
  };


  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-medium text-gray-400 mb-6 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-primary" />
        Autonomous Navigation
      </h3>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={handleNavigateWs}
              disabled={!start || !destination}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-dark-900 bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4 mr-2" />
              Navigate (WS)
            </button>
          )}
          <button
            type="button"
            onClick={handleSelectRoute}
            disabled={!canOperate || !start || !destination || status === 'sending'}
            className="w-full flex justify-center items-center py-3 px-4 border border-white/10 rounded-lg shadow-sm text-xs font-bold text-white bg-dark-800 hover:bg-dark-700 disabled:opacity-50 transition-all"
          >
            {status === 'sending' ? 'Selecting...' : 'Select Route (HTTP)'}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full flex justify-center items-center py-3 px-4 border border-red-500/30 rounded-lg shadow-sm text-xs font-bold text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel (WS)
            </button>
          )}
        </div>

        {!canOperate && (
          <p className="text-xs text-gray-500">
            Read-only access: route changes are disabled for Viewer accounts.
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-danger" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-danger">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-success">
                  Command acknowledged.
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