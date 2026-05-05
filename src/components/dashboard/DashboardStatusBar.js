import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, PlugZap, Route } from 'lucide-react';
import { Button } from './DashboardPrimitives';

const toneStyles = {
  success: {
    icon: CheckCircle2,
    wrap: 'border-success/25 bg-success/10',
    title: 'text-success',
    chip: 'bg-success/10 text-success',
  },
  warning: {
    icon: AlertTriangle,
    wrap: 'border-warning/30 bg-warning/10',
    title: 'text-warning',
    chip: 'bg-warning/10 text-warning',
  },
  danger: {
    icon: AlertTriangle,
    wrap: 'border-danger/30 bg-danger/10',
    title: 'text-danger',
    chip: 'bg-danger/10 text-danger',
  },
  primary: {
    icon: Route,
    wrap: 'border-primary/25 bg-primary/10',
    title: 'text-primary',
    chip: 'bg-primary/10 text-primary',
  },
  neutral: {
    icon: CheckCircle2,
    wrap: 'border-white/10 bg-white/[0.03]',
    title: 'text-white',
    chip: 'bg-white/5 text-gray-300',
  },
};

const chipClass = (tone) => {
  const styles = toneStyles[tone] || toneStyles.neutral;
  return styles.chip;
};

const DashboardStatusBar = ({
  dashboardState,
  actions = null,
  onPrimaryAction,
  primaryActionBusy = false,
}) => {
  const styles = toneStyles[dashboardState.severity] || toneStyles.neutral;
  const StateIcon = styles.icon;

  return (
    <section className={`sticky top-16 z-30 rounded-xl border p-4 shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur-xl ${styles.wrap}`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dark-900/70">
            {primaryActionBusy ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <StateIcon className={`h-5 w-5 ${styles.title}`} />
            )}
          </div>
          <div className="min-w-0">
            <div className={`text-xl font-semibold tracking-tight md:text-2xl ${styles.title}`}>
              {dashboardState.primaryState}
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-300 md:text-base">
              {dashboardState.explanation}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboardState.chips.map((chip) => (
                <span
                  key={chip.label}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chipClass(chip.tone)}`}
                >
                  <span className="text-gray-500">{chip.label}</span>
                  <span>{chip.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {dashboardState.primaryAction === 'connect_command' ? (
            <Button
              variant="primary"
              className="px-4 py-2.5 text-base"
              onClick={onPrimaryAction}
              disabled={primaryActionBusy}
            >
              <PlugZap className="h-4 w-4" />
              {primaryActionBusy ? 'Connecting' : 'Connect Command Socket'}
            </Button>
          ) : null}
          {actions}
        </div>
      </div>
    </section>
  );
};

export default DashboardStatusBar;
