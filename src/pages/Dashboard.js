import React, { useEffect, useState } from 'react';
import Telemetry from '../components/dashboard/Telemetry';
import ManualControl from '../components/dashboard/ManualControl';
import AutoControl from '../components/dashboard/AutoControl';
import { RobotControlProvider } from '../context/RobotControlContext';
import { useAuth } from '../context/AuthContext';
import { ListOrdered, SlidersHorizontal, X } from 'lucide-react';
import QueueControl from './QueueControl';
import PeripheralControl from '../components/dashboard/PeripheralControl';

const Dashboard = () => {
    const { user } = useAuth();
    const isViewer = user?.role === 'Viewer';
    const isAdmin = user?.role === 'Admin';
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isPeripheralsOpen, setIsPeripheralsOpen] = useState(false);

    useEffect(() => {
        document.title = 'TeleTable - Dashboard';
    }, []);

    if (isViewer) {
        return (
            <RobotControlProvider autoConnect={false}>
                <div className="w-full">
                    <div className="w-full">
                        <Telemetry />
                    </div>
                </div>
            </RobotControlProvider>
        );
    }

    return (
        <RobotControlProvider autoConnect={false}>
            <div className="space-y-4 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Control <span className="text-primary">Dashboard</span>
                </h1>
                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setIsQueueOpen(true)}
                                className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                title="Queue Control"
                            >
                                <ListOrdered className="w-4 h-4" />
                                <span className="text-xs md:text-sm font-medium">Queue</span>
                            </button>
                            <button
                                onClick={() => setIsPeripheralsOpen(true)}
                                className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                title="LED & Audio Control"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="text-xs md:text-sm font-medium hidden sm:inline">Peripherals</span>
                                <span className="text-xs md:text-sm font-medium sm:hidden">LED</span>
                            </button>
                        </>
                    )}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-success"></span>
                        </span>
                        <span className="text-[10px] md:text-sm font-mono text-success hidden sm:inline">SYSTEM ONLINE</span>
                        <span className="text-[10px] md:text-sm font-mono text-success sm:hidden">ONLINE</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
                {/* Mobile: Manual Control zuerst, Desktop: Rechte Spalte */}
                <div className="lg:col-span-5 lg:order-2">
                    <div className="h-full">
                        <ManualControl />
                    </div>
                </div>

                {/* Mobile: Status & Auto Control danach, Desktop: Linke Spalte */}
                <div className="lg:col-span-7 lg:order-1 space-y-4 md:space-y-6">
                    <div>
                        <Telemetry />
                    </div>
                    <div>
                        <AutoControl />
                    </div>
                </div>
            </div>

            {isQueueOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
                    onMouseDown={() => setIsQueueOpen(false)}
                >
                    <div
                        className="w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto glass-panel rounded-xl md:rounded-2xl border border-white/10 shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <ListOrdered className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                                <h2 className="text-base md:text-lg font-bold text-white">Queue Control</h2>
                            </div>
                            <button
                                onClick={() => setIsQueueOpen(false)}
                                className="p-1.5 md:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close queue control"
                            >
                                <X className="w-4 md:w-5 h-4 md:h-5" />
                            </button>
                        </div>
                        <div className="p-4 md:p-6">
                            <QueueControl embedded />
                        </div>
                    </div>
                </div>
            )}

            {isPeripheralsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
                    onMouseDown={() => setIsPeripheralsOpen(false)}
                >
                    <PeripheralControl onClose={() => setIsPeripheralsOpen(false)} />
                </div>
            )}
            </div>
        </RobotControlProvider>
    );
};

export default Dashboard;