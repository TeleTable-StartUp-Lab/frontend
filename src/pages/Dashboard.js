import React, { useEffect } from 'react';
import Telemetry from '../components/dashboard/Telemetry';
import ManualControl from '../components/dashboard/ManualControl';
import AutoControl from '../components/dashboard/AutoControl';
import { RobotControlProvider } from '../context/RobotControlContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
    useEffect(() => {
        document.title = 'TeleTable - Dashboard';
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Control <span className="text-primary">Dashboard</span>
                </h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                    </span>
                    <span className="text-sm font-mono text-success">SYSTEM ONLINE</span>
                </div>
            </div>

            <RobotControlProvider autoConnect={false}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Status & Auto Control */}
                    <div className="lg:col-span-7 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Telemetry />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <AutoControl />
                        </motion.div>
                    </div>

                    {/* Right Column - Manual Control */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full"
                        >
                            <ManualControl />
                        </motion.div>
                    </div>
                </div>
            </RobotControlProvider>
        </div>
    );
};

export default Dashboard;