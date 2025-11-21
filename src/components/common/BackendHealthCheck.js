import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AlertTriangle } from 'lucide-react';

const BackendHealthCheck = () => {
    const [isBackendDown, setIsBackendDown] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Try to hit the root endpoint or a known public endpoint
                // Since we don't have a dedicated health endpoint, we'll try the root
                // Note: api instance might have baseURL set, so we might need to be careful.
                // Assuming api.get('/') hits the backend root.
                await api.get('/');
                setIsBackendDown(false);
            } catch (error) {
                console.error('Backend health check failed:', error);
                // If it's a network error or 500, we consider it down
                if (!error.response || error.response.status >= 500) {
                    setIsBackendDown(true);
                }
            }
        };

        checkHealth();

        // Optional: Poll every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isBackendDown || !isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in-right">
            <div className="bg-danger/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(255,59,48,0.3)] border border-danger/50 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
                <div>
                    <h4 className="font-bold text-lg mb-1">Backend Connection Failed</h4>
                    <p className="text-sm opacity-90">
                        Cannot connect to the server. Please ensure the Docker backend is running.
                    </p>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="mt-3 text-xs font-bold uppercase tracking-wider hover:text-dark-900 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackendHealthCheck;
