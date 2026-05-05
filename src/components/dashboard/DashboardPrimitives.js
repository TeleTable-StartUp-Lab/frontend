import React from 'react';

export const EMPTY_VALUE = '-';

export const cleanValue = (value, fallback = EMPTY_VALUE) => {
  if (value === null || value === undefined || value === '') return fallback;
  const normalized = String(value).trim();
  if (!normalized || normalized.toUpperCase() === 'UNKNOWN') return fallback;
  return normalized;
};

export const statusTone = (status) => {
  switch (status) {
    case 'connected':
    case 'READY':
    case 'OK':
      return {
        dot: 'bg-success',
        text: 'text-success',
        border: 'border-success/25',
        bg: 'bg-success/10',
      };
    case 'connecting':
    case 'MOVING':
    case 'WARNING':
      return {
        dot: 'bg-warning',
        text: 'text-warning',
        border: 'border-warning/25',
        bg: 'bg-warning/10',
      };
    case 'error':
    case 'ERROR':
      return {
        dot: 'bg-danger',
        text: 'text-danger',
        border: 'border-danger/25',
        bg: 'bg-danger/10',
      };
    default:
      return {
        dot: 'bg-gray-500',
        text: 'text-gray-300',
        border: 'border-white/10',
        bg: 'bg-white/5',
      };
  }
};

export const Button = ({
  children,
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'border-primary/40 bg-primary text-dark-900 hover:bg-primary-hover disabled:hover:bg-primary',
    secondary: 'border-white/10 bg-dark-800 text-gray-100 hover:bg-dark-700',
    danger: 'border-danger/35 bg-danger/10 text-danger hover:bg-danger/20',
    ghost: 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const ConnectionPill = ({ label, value, state = 'idle', detail }) => {
  const tone = statusTone(state);
  return (
    <div className={`min-w-0 rounded-lg border px-3 py-2 ${tone.border} ${tone.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone.dot} ${state === 'connected' || state === 'connecting' ? 'animate-pulse' : ''}`} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{label}</span>
      </div>
      <div className={`mt-1 truncate text-sm font-semibold ${tone.text}`}>{value}</div>
      {detail ? <div className="mt-0.5 truncate text-[11px] text-gray-500">{detail}</div> : null}
    </div>
  );
};

export const MetricCard = ({ label, value, icon: Icon, tone = 'neutral', detail }) => {
  const toneClass = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    primary: 'text-primary',
    neutral: 'text-white',
  }[tone] || 'text-white';

  return (
    <div className="rounded-lg border border-white/10 bg-dark-800/45 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] uppercase tracking-[0.18em] text-gray-500">{label}</div>
          <div className={`mt-1 truncate font-mono text-lg font-semibold ${toneClass}`}>{value}</div>
        </div>
        {Icon ? <Icon className={`h-5 w-5 shrink-0 ${toneClass}`} /> : null}
      </div>
      {detail ? <div className="mt-1 truncate text-xs text-gray-500">{detail}</div> : null}
    </div>
  );
};

export const SegmentedModeToggle = ({ value, onChange, disabled = false }) => {
  const options = [
    { value: 'manual', label: 'Manual' },
    { value: 'autonomous', label: 'Autonomous' },
  ];

  return (
    <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-dark-900/60 p-1">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? 'bg-primary text-dark-900'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export const DashboardSection = ({ title, eyebrow, children }) => (
  <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
    <div>
      {eyebrow ? <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{eyebrow}</div> : null}
      <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
    </div>
    {children}
  </section>
);
