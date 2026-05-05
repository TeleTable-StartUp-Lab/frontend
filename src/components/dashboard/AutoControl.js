import React, { useMemo, useState } from 'react';
import { CheckCircle, MapPin, Navigation, Route, Send, XCircle } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { useAuth } from '../../context/AuthContext';
import { Button, cleanValue } from './DashboardPrimitives';
import { MAP_ZONES } from './RobotMap';

const InlineState = ({ type, children }) => {
  const styles = {
    success: 'border-success/20 bg-success/10 text-success',
    error: 'border-danger/20 bg-danger/10 text-danger',
    info: 'border-primary/20 bg-primary/10 text-primary',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${styles[type]}`}>
      {children}
    </div>
  );
};

const LocationSelect = ({ label, value, onChange, nodes, accent = 'text-primary', disabled = false }) => {
  const mapOptions = MAP_ZONES.map((zone) => ({ id: zone.id, label: zone.label }));
  const baseOptions = nodes.length ? nodes : mapOptions;
  const hasValue = !value || baseOptions.some((node) => node.id === value);
  const options = hasValue ? baseOptions : [{ id: value, label: value }, ...baseOptions];

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
        {label}
      </label>
      <div className="relative">
        <MapPin className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${accent}`} />
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full appearance-none rounded-lg border border-white/10 bg-dark-800/70 py-2.5 pl-10 pr-9 text-sm text-gray-100 transition-colors hover:bg-dark-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select location</option>
          {options.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const AutoControl = ({
  start = '',
  destination = '',
  onStartChange,
  onDestinationChange,
  onRouteSelected,
  onNavigationStart,
  onNavigationCancel,
  dashboardState,
}) => {
  const { nodes, selectRoute, sendCommand, wsStatus } = useRobotControl();
  const { user } = useAuth();
  const canOperate = user?.role === 'Admin' || user?.role === 'Operator';
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isCommandReady = wsStatus === 'connected';
  const hasRoute = Boolean(start && destination);
  const stateAllowsNavigation = dashboardState?.state === 'autonomous_ready';
  const canNavigate = canOperate && isCommandReady && hasRoute && stateAllowsNavigation;
  const canSelectRoute = canOperate && hasRoute && status !== 'selecting' && dashboardState?.robotConnected;
  const selectorsDisabled = !dashboardState?.robotConnected;

  const routeLabel = useMemo(() => {
    if (!hasRoute) return 'Choose start and destination';
    const startLabel = nodes.find((node) => node.id === start)?.label || start;
    const destinationLabel = nodes.find((node) => node.id === destination)?.label || destination;
    return `${startLabel} -> ${destinationLabel}`;
  }, [destination, hasRoute, nodes, start]);

  const handleSelectRoute = async () => {
    if (!canSelectRoute) return;
    setStatus('selecting');
    setError('');

    try {
      const response = await selectRoute(start, destination);
      if (response.status === 'error') {
        setError(response.message || 'Route selection failed');
        setStatus('');
        return;
      }

      setStatus('selected');
      onRouteSelected?.({ start, destination });
      window.setTimeout(() => setStatus((current) => (current === 'selected' ? '' : current)), 3000);
    } catch (event) {
      setError(event?.message || 'Route selection failed');
      setStatus('');
    }
  };

  const handleNavigate = () => {
    if (!canNavigate) return;
    const ok = sendCommand({
      command: 'NAVIGATE',
      start,
      destination,
    });

    if (!ok) {
      setError('Command WebSocket is not connected');
      setStatus('');
      return;
    }

    setError('');
    setStatus('navigating');
    onRouteSelected?.({ start, destination });
    onNavigationStart?.({ start, destination });
    window.setTimeout(() => setStatus((current) => (current === 'navigating' ? '' : current)), 3000);
  };

  const handleCancel = () => {
    if (!canOperate) return;
    const ok = sendCommand({ command: 'CANCEL' });
    if (!ok) {
      setError('Command WebSocket is not connected');
      setStatus('');
      return;
    }
    setError('');
    setStatus('cancelled');
    onNavigationCancel?.();
    window.setTimeout(() => setStatus((current) => (current === 'cancelled' ? '' : current)), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-dark-900/45 px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          <Route className="h-3.5 w-3.5 text-primary" />
          Selected route
        </div>
        <div className="mt-1 truncate font-mono text-sm text-white">{cleanValue(routeLabel)}</div>
      </div>

      <div className="grid gap-3">
        <LocationSelect
          label="Start"
          value={start}
          onChange={onStartChange}
          nodes={nodes}
          accent="text-primary"
          disabled={selectorsDisabled}
        />
        <LocationSelect
          label="Destination"
          value={destination}
          onChange={onDestinationChange}
          nodes={nodes}
          accent="text-warning"
          disabled={selectorsDisabled}
        />
      </div>

      <div className="grid gap-2">
        <Button variant="secondary" onClick={handleSelectRoute} disabled={!canSelectRoute}>
          <Navigation className="h-4 w-4 text-primary" />
          {status === 'selecting' ? 'Planning route' : 'Plan Route'}
        </Button>
        <Button variant="primary" onClick={handleNavigate} disabled={!canNavigate}>
          <Send className="h-4 w-4" />
          Start Navigation
        </Button>
        {dashboardState?.navigating ? (
          <Button variant="danger" onClick={handleCancel} disabled={!canOperate}>
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        ) : null}
      </div>

      {!canOperate ? (
        <InlineState type="info">Read-only role: route commands are disabled.</InlineState>
      ) : null}
      {canOperate && !isCommandReady && dashboardState?.robotConnected ? (
        <InlineState type="info">Connect the command WebSocket before navigating.</InlineState>
      ) : null}
      {error ? (
        <InlineState type="error">
          <span className="inline-flex items-center gap-2">
            <XCircle className="h-3.5 w-3.5" />
            {error}
          </span>
        </InlineState>
      ) : null}
      {status === 'selected' || status === 'navigating' || status === 'cancelled' ? (
        <InlineState type="success">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5" />
            {status === 'selected' ? 'Route selected.' : status === 'navigating' ? 'Navigation sent.' : 'Cancel sent.'}
          </span>
        </InlineState>
      ) : null}
    </div>
  );
};

export default AutoControl;
