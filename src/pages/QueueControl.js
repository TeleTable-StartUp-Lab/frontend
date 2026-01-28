import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Zap, RefreshCw, AlertCircle, MapPin, ArrowRight } from 'lucide-react';

const QueueControl = ({ embedded = false }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/routes');
      setRoutes(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load routes:', err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!embedded) {
      document.title = 'TeleTable - Queue Control';
    }
    fetchRoutes();
    
    // Auto refresh every 5 seconds to show new routes coming from WS/HTTP
    const interval = setInterval(fetchRoutes, 5000);
    return () => clearInterval(interval);
  }, [embedded]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await api.delete(`/routes/${id}`);
      setSuccessMessage('Route deleted successfully');
      fetchRoutes(); // Refresh list immediately
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete route');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const response = await api.post('/routes/optimize');
      setSuccessMessage(response.data.message || 'Optimization triggered successfully');
      fetchRoutes();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Optimize error:', err);
      setError('Failed to optimize routes');
      setTimeout(() => setError(''), 3000);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div className="glass-panel rounded-xl p-6 border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Drive Queue Control</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and optimize robot navigation routes</p>
          </div>
          <div className="flex gap-3">
              <button
              onClick={fetchRoutes}
              className="p-2 rounded-lg bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
              title="Refresh"
              >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
              onClick={handleOptimize}
              disabled={optimizing || routes.length < 2}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-dark-900 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
              <Zap className={`h-5 w-5 mr-2 ${optimizing ? 'animate-pulse' : ''}`} />
              {optimizing ? 'Optimizing...' : 'Optimize Queue'}
              </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-3">
          <button
            onClick={fetchRoutes}
            className="p-2 rounded-lg bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOptimize}
            disabled={optimizing || routes.length < 2}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-dark-900 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Zap className={`h-5 w-5 mr-2 ${optimizing ? 'animate-pulse' : ''}`} />
            {optimizing ? 'Optimizing...' : 'Optimize Queue'}
          </button>
        </div>
      )}

      {error && (
        <div className="glass-error rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-danger" />
          <p className="text-danger font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="glass-panel rounded-lg p-4 flex items-center gap-3 border-l-4 border-success bg-success/10">
          <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
            <svg className="w-3 h-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-success font-medium">{successMessage}</p>
        </div>
      )}

      {loading && routes.length === 0 ? (
        <div className="glass-panel rounded-xl border border-white/10 flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
            {routes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No routes in queue</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">From / To</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Added By</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {routes.map((route, index) => (
                              <tr key={route.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-white">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">{route.start}</span>
                                            <ArrowRight className="h-4 w-4 text-gray-500" />
                                            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-mono">{route.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {route.added_by || route.addedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(route.added_at || route.addedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(route.id)}
                                            className="text-gray-400 hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"
                                            title="Delete Route"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                  </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default QueueControl;
