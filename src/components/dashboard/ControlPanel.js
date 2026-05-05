import React from 'react';
import { CheckCircle2, PlugZap, TriangleAlert } from 'lucide-react';
import AutoControl from './AutoControl';
import ManualControl from './ManualControl';
import { Button, SegmentedModeToggle } from './DashboardPrimitives';

const readinessTone = {
  success: 'text-success',
  primary: 'text-primary',
  warning: 'text-warning',
  danger: 'text-danger',
  neutral: 'text-gray-300',
};

const ControlPanel = ({
  mode,
  onModeChange,
  start,
  destination,
  onStartChange,
  onDestinationChange,
  onRouteSelected,
  onNavigationStart,
  onNavigationCancel,
  dashboardState,
  onConnectCommand,
  commandBusy = false,
}) => {
  const isReady = dashboardState.state === 'manual_ready' || dashboardState.state === 'autonomous_ready';
  const canUseMode = mode === 'manual'
    ? dashboardState.state === 'manual_ready'
    : dashboardState.state === 'autonomous_ready' || dashboardState.state === 'navigating';
  const disabledReason = canUseMode ? '' : dashboardState.blocker;
  const tone = readinessTone[dashboardState.severity] || readinessTone.neutral;

  return (
    <aside className="lg:sticky lg:top-48">
      <section className="glass-panel rounded-xl border border-white/10 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Control panel</div>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {mode === 'manual' ? 'Manual Control' : 'Autonomous Control'}
            </h2>
          </div>
          <div className={`flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold ${tone}`}>
            {isReady ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            {isReady ? 'Ready' : 'Blocked'}
          </div>
        </div>

        <div className="mb-5 border-b border-white/10 pb-5">
          <SegmentedModeToggle value={mode} onChange={onModeChange} />
        </div>

        {disabledReason ? (
          <div className="mb-5 rounded-lg border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
            {disabledReason}
          </div>
        ) : null}

        {dashboardState.primaryAction === 'connect_command' ? (
          <div className="mb-5">
            <Button
              variant="primary"
              className="w-full py-3 text-base"
              onClick={onConnectCommand}
              disabled={commandBusy}
            >
              <PlugZap className="h-4 w-4" />
              {commandBusy ? 'Connecting' : 'Connect and Acquire Lock'}
            </Button>
          </div>
        ) : null}

        {mode === 'manual' ? (
          <ManualControl dashboardState={dashboardState} />
        ) : (
          <AutoControl
            start={start}
            destination={destination}
            onStartChange={onStartChange}
            onDestinationChange={onDestinationChange}
            onRouteSelected={onRouteSelected}
            onNavigationStart={onNavigationStart}
            onNavigationCancel={onNavigationCancel}
            dashboardState={dashboardState}
          />
        )}
      </section>
    </aside>
  );
};

export default ControlPanel;
