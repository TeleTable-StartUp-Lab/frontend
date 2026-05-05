import React, { useMemo, useState } from 'react';
import { Battery, Box, ChevronDown, ChevronRight, LockKeyhole, MapPin, Radio } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { cleanValue } from './DashboardPrimitives';
import { formatBattery } from './DashboardState';

const MetricChip = ({ label, value, icon: Icon }) => (
  <div className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm">
    {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
    <span className="shrink-0 text-gray-500">{label}</span>
    <span className="truncate font-mono text-gray-100">{value}</span>
  </div>
);

const Telemetry = ({ dashboardState }) => {
  const { statusData, resolveNodeLabel } = useRobotControl();
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const position = useMemo(
    () => cleanValue(resolveNodeLabel(statusData.position, statusData.position), '—'),
    [resolveNodeLabel, statusData.position]
  );

  const metrics = [
    { label: 'Battery', value: formatBattery(statusData), icon: Battery },
    { label: 'Position', value: position, icon: MapPin },
    { label: 'Drive', value: cleanValue(statusData.driveMode, '—'), icon: Radio },
    { label: 'Lock', value: cleanValue(statusData.manualLockHolderName, 'None'), icon: LockKeyhole },
    { label: 'Cargo', value: cleanValue(statusData.cargoStatus, '—'), icon: Box },
  ];

  const diagnostics = dashboardState?.diagnostics || {};
  const unavailable = !dashboardState?.hasTelemetry;

  return (
    <section className="glass-panel rounded-xl border border-white/10 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Telemetry</div>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {unavailable ? 'Waiting for robot telemetry' : 'Robot telemetry'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setDiagnosticsOpen((open) => !open)}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white md:self-auto"
        >
          {diagnosticsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Show diagnostics
        </button>
      </div>

      {unavailable ? (
        <p className="mt-3 text-sm text-gray-400">
          No reliable telemetry has arrived yet. The dashboard will expand this row when robot data is available.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <MetricChip key={metric.label} {...metric} />
          ))}
        </div>
      )}

      {diagnosticsOpen ? (
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm text-gray-400 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(diagnostics).map(([label, value]) => (
            <div key={label} className="flex min-w-0 justify-between gap-3">
              <span className="capitalize text-gray-500">{label}</span>
              <span className="truncate font-mono text-gray-300">{value || '—'}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Telemetry;
