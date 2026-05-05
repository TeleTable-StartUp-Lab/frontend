import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bug, ListOrdered, SlidersHorizontal, X } from 'lucide-react';
import ControlPanel from '../components/dashboard/ControlPanel';
import DashboardStatusBar from '../components/dashboard/DashboardStatusBar';
import DebugPanel from '../components/dashboard/DebugPanel';
import { Button } from '../components/dashboard/DashboardPrimitives';
import { computeDashboardState } from '../components/dashboard/DashboardState';
import { MAP_ZONES } from '../components/dashboard/RobotMap';
import PeripheralControl from '../components/dashboard/PeripheralControl';
import RobotMap from '../components/dashboard/RobotMap';
import RobotNotificationsPanel from '../components/dashboard/RobotNotificationsPanel';
import Telemetry from '../components/dashboard/Telemetry';
import { RobotControlProvider, useRobotControl } from '../context/RobotControlContext';
import { useAuth } from '../context/AuthContext';
import QueueControl from './QueueControl';

const modeFromDriveMode = (driveMode) => {
    const normalized = String(driveMode || '').trim().toUpperCase();
    if (normalized === 'MANUAL') return 'manual';
    if (normalized && normalized !== 'UNKNOWN') return 'autonomous';
    return 'manual';
};

const UtilityButton = ({ icon: Icon, children, ...props }) => (
    <Button variant="ghost" className="px-2.5 py-2 text-xs" {...props}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{children}</span>
    </Button>
);

const DashboardContent = ({ isAdmin }) => {
    const {
        statusData,
        wsStatus,
        wsError,
        eventsWsStatus,
        eventsWsError,
        connectWs,
        acquireLock,
    } = useRobotControl();
    const { user } = useAuth();
    const canOperate = user?.role === 'Admin' || user?.role === 'Operator';
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isPeripheralsOpen, setIsPeripheralsOpen] = useState(false);
    const [isDebugOpen, setIsDebugOpen] = useState(false);
    const [routeStart, setRouteStart] = useState('');
    const [routeDestination, setRouteDestination] = useState('');
    const [activeRoute, setActiveRoute] = useState(null);
    const [isNavigationActive, setIsNavigationActive] = useState(false);
    const [commandBusy, setCommandBusy] = useState(false);
    const [controlMode, setControlMode] = useState(() => modeFromDriveMode(statusData.driveMode));
    const modeTouchedRef = useRef(false);

    useEffect(() => {
        if (modeTouchedRef.current) return;
        setControlMode(modeFromDriveMode(statusData.driveMode));
    }, [statusData.driveMode]);

    const handleModeChange = (nextMode) => {
        modeTouchedRef.current = true;
        setControlMode(nextMode);
    };

    const handleZoneSelect = (zone) => {
        if (controlMode !== 'autonomous') return;

        if (!routeStart) {
            setRouteStart(zone.id);
            setRouteDestination('');
            setActiveRoute(null);
            return;
        }

        if (zone.id === routeStart) {
            setRouteDestination('');
            setActiveRoute(null);
            return;
        }

        setRouteDestination(zone.id);
        setActiveRoute({ start: routeStart, destination: zone.id });
    };

    const handleStartChange = (value) => {
        setRouteStart(value);
        setActiveRoute(value && routeDestination ? { start: value, destination: routeDestination } : null);
        if (value && value === routeDestination) {
            setRouteDestination('');
            setActiveRoute(null);
        }
    };

    const handleDestinationChange = (value) => {
        setRouteDestination(value);
        setActiveRoute(routeStart && value ? { start: routeStart, destination: value } : null);
    };

    const handleRouteSelected = (route) => {
        if (!route?.start || !route?.destination) return;
        setActiveRoute(route);
    };

    const handleConnectCommand = async () => {
        if (!canOperate || commandBusy || wsStatus === 'connected' || wsStatus === 'connecting') return;

        setCommandBusy(true);
        try {
            const response = await acquireLock();
            if (response.status === 'error') {
                return;
            }
            connectWs();
        } finally {
            setCommandBusy(false);
        }
    };

    const canUseDom = typeof document !== 'undefined';
    const actions = (
        <>
            <RobotNotificationsPanel />
            {isAdmin ? (
                <>
                    <UtilityButton icon={ListOrdered} onClick={() => setIsQueueOpen(true)} title="Queue Control">
                        Queue
                    </UtilityButton>
                    <UtilityButton icon={SlidersHorizontal} onClick={() => setIsPeripheralsOpen(true)} title="LED & Audio Control">
                        Peripherals
                    </UtilityButton>
                    <UtilityButton icon={Bug} onClick={() => setIsDebugOpen(true)} title="Debug Telemetry">
                        Debug
                    </UtilityButton>
                </>
            ) : null}
        </>
    );

    const queueModal = isQueueOpen && canUseDom
        ? createPortal(
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm md:p-4"
                onMouseDown={() => setIsQueueOpen(false)}
            >
                <div
                    className="glass-panel max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-white/10 shadow-2xl md:max-h-[85vh] md:rounded-2xl"
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-center gap-2">
                            <ListOrdered className="h-4 w-4 text-primary md:h-5 md:w-5" />
                            <h2 className="text-base font-bold text-white md:text-lg">Queue Control</h2>
                        </div>
                        <button
                            onClick={() => setIsQueueOpen(false)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:p-2"
                            aria-label="Close queue control"
                            type="button"
                        >
                            <X className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>
                    <div className="p-4 md:p-6">
                        <QueueControl embedded />
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    const peripheralsModal = isPeripheralsOpen && canUseDom
        ? createPortal(
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm md:p-4"
                onMouseDown={() => setIsPeripheralsOpen(false)}
            >
                <PeripheralControl onClose={() => setIsPeripheralsOpen(false)} />
            </div>,
            document.body
        )
        : null;

    const debugModal = isDebugOpen && canUseDom
        ? createPortal(
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm md:p-4"
                onMouseDown={() => setIsDebugOpen(false)}
            >
                <DebugPanel onClose={() => setIsDebugOpen(false)} />
            </div>,
            document.body
        )
        : null;

    const activeMapRoute = useMemo(() => {
        if (activeRoute?.start && activeRoute?.destination) return activeRoute;
        if (routeStart && routeDestination) return { start: routeStart, destination: routeDestination };
        return null;
    }, [activeRoute, routeDestination, routeStart]);

    const zonesById = useMemo(() => new Set(MAP_ZONES.map((zone) => zone.id)), []);
    const normalizedStart = zonesById.has(routeStart) ? routeStart : '';
    const normalizedDestination = zonesById.has(routeDestination) ? routeDestination : '';
    const dashboardState = useMemo(() => computeDashboardState({
        mode: controlMode,
        statusData,
        eventsWsStatus,
        eventsWsError,
        wsStatus,
        wsError,
        canOperate,
        isNavigating: isNavigationActive,
    }), [
        canOperate,
        controlMode,
        eventsWsError,
        eventsWsStatus,
        isNavigationActive,
        statusData,
        wsError,
        wsStatus,
    ]);

    return (
        <div className="space-y-5">
            <DashboardStatusBar
                dashboardState={dashboardState}
                actions={actions}
                onPrimaryAction={handleConnectCommand}
                primaryActionBusy={commandBusy}
            />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(340px,0.78fr)] lg:items-start">
                <div className="order-2 lg:order-1">
                    <RobotMap
                        mode={controlMode}
                        selectedStart={normalizedStart}
                        selectedDestination={normalizedDestination}
                        activeRoute={activeMapRoute}
                        interactive={controlMode === 'autonomous'}
                        onZoneSelect={handleZoneSelect}
                        dashboardState={dashboardState}
                    />
                </div>
                <div className="order-1 lg:order-2">
                    <ControlPanel
                        mode={controlMode}
                        onModeChange={handleModeChange}
                        start={routeStart}
                        destination={routeDestination}
                        onStartChange={handleStartChange}
                        onDestinationChange={handleDestinationChange}
                        onRouteSelected={handleRouteSelected}
                        onNavigationStart={() => setIsNavigationActive(true)}
                        onNavigationCancel={() => setIsNavigationActive(false)}
                        dashboardState={dashboardState}
                        onConnectCommand={handleConnectCommand}
                        commandBusy={commandBusy}
                    />
                </div>
            </div>

            <Telemetry dashboardState={dashboardState} />

            {queueModal}
            {peripheralsModal}
            {debugModal}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        document.title = 'TeleTable - Dashboard';
    }, []);

    return (
        <RobotControlProvider autoConnect>
            <DashboardContent isAdmin={isAdmin} />
        </RobotControlProvider>
    );
};

export default Dashboard;
