import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Info, TriangleAlert, CircleAlert } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const priorityStyles = {
  INFO: {
    badge: 'text-sky-200 border-sky-300/35 bg-sky-400/15',
    iconWrap: 'bg-sky-400/15 text-sky-200 border-sky-300/30',
    icon: Info,
    accent: 'from-sky-300/75 to-sky-500/85',
  },
  WARN: {
    badge: 'text-amber-200 border-amber-300/40 bg-amber-400/15',
    iconWrap: 'bg-amber-400/15 text-amber-200 border-amber-300/30',
    icon: TriangleAlert,
    accent: 'from-amber-300/80 to-amber-500/90',
  },
  ERROR: {
    badge: 'text-rose-200 border-rose-300/40 bg-rose-400/15',
    iconWrap: 'bg-rose-400/15 text-rose-200 border-rose-300/30',
    icon: CircleAlert,
    accent: 'from-rose-300/75 to-rose-500/90',
  },
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown time';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const RobotNotificationsPanel = () => {
  const { notifications, toasts, dismissToast } = useRobotControl();
  const [open, setOpen] = useState(false);
  const canUseDom = typeof document !== 'undefined';

  const notificationsModal = open && canUseDom
    ? createPortal(
      <div
        className="fixed inset-0 z-[65] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm"
        onMouseDown={() => setOpen(false)}
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto glass-panel rounded-xl md:rounded-2xl border border-white/10 shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
            <h3 className="text-base md:text-lg font-bold text-white">Robot Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 md:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 md:w-5 h-4 md:h-5" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-2 md:space-y-3">
            {notifications.length === 0 && (
              <div className="px-2 py-3 text-xs md:text-sm text-gray-400">No notifications yet.</div>
            )}

            {notifications.map((item) => {
              const style = priorityStyles[item.priority] || priorityStyles.INFO;
              return (
                <div key={item.id} className="rounded-lg border border-white/10 bg-dark-800/70 p-3 md:p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.badge}`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{formatTime(item.receivedAt)}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-200 break-words">{item.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Robot notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium hidden sm:inline">Alerts</span>
          <span className="text-xs md:text-sm font-medium sm:hidden">Alerts</span>
        </button>
      </div>

      {notificationsModal}

      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none">
        {toasts.map((toast) => {
          const style = priorityStyles[toast.priority] || priorityStyles.INFO;
          const PriorityIcon = style.icon;
          return (
            <div
              key={toast.toastId}
              className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-dark-800/95 via-dark-900/95 to-dark-900/90 backdrop-blur-xl p-3 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
            >
              <span className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.accent}`} />
              <div className="pl-1">
                <div className="flex items-start gap-2.5">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${style.iconWrap}`}>
                    <PriorityIcon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] tracking-[0.14em] font-bold px-1.5 py-0.5 rounded border ${style.badge}`}>
                        {toast.priority}
                      </span>
                      <p className="text-[10px] text-gray-400 font-mono">{formatTime(toast.receivedAt)}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-100 break-words leading-relaxed">{toast.message}</p>
                    <div className="mt-2 h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`toast-progress h-full w-full rounded-full bg-gradient-to-r ${style.accent}`}
                        style={{ animationDuration: `${toast.durationMs ?? 5000}ms` }}
                        onAnimationEnd={() => dismissToast(toast.toastId)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => dismissToast(toast.toastId)}
                    className="text-gray-400 hover:text-white rounded-md hover:bg-white/10 p-1 transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RobotNotificationsPanel;
