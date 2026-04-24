import React, { useEffect } from 'react';
import {
  Activity,
  Bug,
  Cpu,
  Database,
  Route,
  Shield,
  Wifi,
  X,
} from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
const EMPTY_VALUE = '-';

const formatValue = (value, fallback = EMPTY_VALUE) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : fallback;
  return String(value);
};

const formatTimestamp = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : date.toLocaleString();
};

const formatRoute = (route, resolveNodeLabel) => {
  if (!route) return EMPTY_VALUE;
  const start = route.startNode || route.start_node || route.start || EMPTY_VALUE;
  const end = route.endNode || route.end_node || route.destination || EMPTY_VALUE;
  return `${resolveNodeLabel(start, start)} -> ${resolveNodeLabel(end, end)}`;
};

const sensorValue = (value, formatter = formatValue) => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE;
  }

  return formatter(value);
};

const MetricGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    {items.map((item) => (
      <div
        key={item.label}
        className="rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3"
      >
        <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
          {item.label}
        </div>
        <div className="mt-1 text-sm font-mono text-white break-words">
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

const Section = ({ icon: Icon, title, children, actions = null }) => (
  <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {actions}
    </div>
    {children}
  </section>
);

const QueueTable = ({ routes, resolveNodeLabel }) => {
  if (!routes.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-sm text-gray-400 text-center">
        Queue is empty
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Start</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Destination</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Added By</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Added At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {routes.map((route) => (
            <tr key={route.id} className="bg-dark-900/30">
              <td className="px-4 py-3 font-mono text-white">{resolveNodeLabel(route.start, route.start)}</td>
              <td className="px-4 py-3 font-mono text-white">{resolveNodeLabel(route.destination, route.destination)}</td>
              <td className="px-4 py-3 text-gray-300">{route.addedBy || route.added_by || EMPTY_VALUE}</td>
              <td className="px-4 py-3 text-gray-400">
                {formatTimestamp(route.addedAt || route.added_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DebugPanel = ({ onClose }) => {
  const {
    debugSnapshot,
    debugStatus,
    debugError,
    resolveNodeLabel,
    startDebugPolling,
    stopDebugPolling,
  } = useRobotControl();

  useEffect(() => {
    startDebugPolling();
    return () => {
      stopDebugPolling();
    };
  }, [startDebugPolling, stopDebugPolling]);
  const snapshot = debugSnapshot;
  const loading = !snapshot && debugStatus === 'connecting';
  const error = !snapshot && debugStatus !== 'connected'
    ? (debugError || 'Waiting for debug data from HTTP endpoint.')
    : '';

  const telemetry = snapshot?.telemetry;
  const lock = snapshot?.lock;
  const routing = snapshot?.routing;
  const connection = snapshot?.connection;
  const sensors = snapshot?.sensors;

  return (
    <div
      className="w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Bug className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Robot Debug Snapshot</h2>
            <p className="text-xs text-gray-400">Structured admin-only backend and sensor diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close debug panel"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-white/10 bg-dark-900/40 px-4 py-3">
          <div className="text-sm text-gray-300">
            {error ? (
              <span className="text-danger">{error}</span>
            ) : (
              <span>
                Debug polling: <span className="font-mono text-white">{debugStatus}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 font-mono">
            GET /robot/debug every 1s
          </div>
        </div>

        {loading && !snapshot ? (
          <div className="rounded-xl border border-white/10 bg-dark-900/40 px-6 py-10 text-center text-gray-400">
            Loading debug snapshot...
          </div>
        ) : (
          <>
            <Section icon={Activity} title="Telemetry">
              <MetricGrid
                items={[
                  { label: 'System Health', value: formatValue(telemetry?.systemHealth) },
                  { label: 'Battery Level', value: telemetry?.batteryLevel !== undefined ? `${formatValue(telemetry?.batteryLevel)}%` : EMPTY_VALUE },
                  { label: 'Drive Mode', value: formatValue(telemetry?.driveMode) },
                  { label: 'Cargo Status', value: formatValue(telemetry?.cargoStatus) },
                  { label: 'Position', value: resolveNodeLabel(telemetry?.position, formatValue(telemetry?.position)) },
                  { label: 'Last Route', value: formatRoute(telemetry?.lastRoute, resolveNodeLabel) },
                  { label: 'Robot Connected', value: formatValue(telemetry?.robotConnected) },
                ]}
              />
            </Section>

            <Section icon={Shield} title="Lock & Runtime">
              <MetricGrid
                items={[
                  { label: 'Lock Active', value: formatValue(lock?.active) },
                  { label: 'Lock Holder', value: formatValue(lock?.holderName) },
                  { label: 'Lock Expires At', value: formatTimestamp(lock?.expiresAt) },
                  { label: 'Robot URL', value: formatValue(connection?.robotUrl) },
                  { label: 'Last State Update', value: formatTimestamp(connection?.lastStateUpdate) },
                  { label: 'Robot Status Reachable', value: formatValue(connection?.robotStatusReachable) },
                ]}
              />
            </Section>

            <Section icon={Route} title="Routing">
              <MetricGrid
                items={[
                  { label: 'Active Route', value: formatRoute(routing?.activeRoute, resolveNodeLabel) },
                  { label: 'Queue Length', value: formatValue(routing?.queueLength) },
                  {
                    label: 'Known Nodes',
                    value: routing?.nodes?.length
                      ? routing.nodes.map((node) => node.label || node.id).join(', ')
                      : EMPTY_VALUE,
                  },
                ]}
              />
              <QueueTable routes={routing?.queue || []} resolveNodeLabel={resolveNodeLabel} />
            </Section>

            <Section icon={Cpu} title="Sensors">
              <MetricGrid
                items={[
                  {
                    label: 'Light Lux',
                    value: sensorValue(sensors?.light?.lux),
                  },
                  {
                    label: 'Light Valid',
                    value: formatValue(sensors?.light?.valid),
                  },
                  {
                    label: 'Light Source',
                    value: formatValue(sensors?.light?.source),
                  },
                  {
                    label: 'IR Front',
                    value: sensorValue(sensors?.infrared?.front),
                  },
                  {
                    label: 'IR Left',
                    value: sensorValue(sensors?.infrared?.left),
                  },
                  {
                    label: 'IR Right',
                    value: sensorValue(sensors?.infrared?.right),
                  },
                  {
                    label: 'IR Source',
                    value: formatValue(sensors?.infrared?.source),
                  },
                  {
                    label: 'Voltage (V)',
                    value: sensorValue(sensors?.power?.voltageV),
                  },
                  {
                    label: 'Current (A)',
                    value: sensorValue(sensors?.power?.currentA),
                  },
                  {
                    label: 'Power (W)',
                    value: sensorValue(sensors?.power?.powerW),
                  },
                  {
                    label: 'Power Source',
                    value: formatValue(sensors?.power?.source),
                  },
                  {
                    label: 'Gyroscope X (dps)',
                    value: sensorValue(sensors?.gyroscope?.xDps),
                  },
                  {
                    label: 'Gyroscope Y (dps)',
                    value: sensorValue(sensors?.gyroscope?.yDps),
                  },
                  {
                    label: 'Gyroscope Z (dps)',
                    value: sensorValue(sensors?.gyroscope?.zDps),
                  },
                  {
                    label: 'Gyroscope Source',
                    value: formatValue(sensors?.gyroscope?.source),
                  },
                  {
                    label: 'Last Read UUID',
                    value: sensorValue(sensors?.rfid?.lastReadUuid),
                  },
                  {
                    label: 'RFID Source',
                    value: formatValue(sensors?.rfid?.source),
                  },
                ]}
              />
            </Section>

            <Section
              icon={Database}
              title="Source Summary"
              actions={
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-dark-900/60 px-3 py-1.5 text-xs font-mono text-gray-400">
                  <Wifi className="w-3.5 h-3.5 text-primary" />
                  backend + robot status merge
                </div>
              }
            >
              <MetricGrid
                items={[
                  { label: 'Snapshot Source', value: 'GET /robot/debug' },
                  { label: 'Sensor Enrichment', value: connection?.robotStatusReachable ? 'robot /status reachable' : 'robot /status unavailable' },
                  { label: 'Refresh Mode', value: '1 second HTTP polling while open' },
                ]}
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
