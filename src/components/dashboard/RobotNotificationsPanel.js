import React, { useMemo, useState } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';

const priorityClasses = {
  INFO: 'text-primary border-primary/30 bg-primary/10',
  WARN: 'text-warning border-warning/30 bg-warning/10',
  ERROR: 'text-danger border-danger/30 bg-danger/10',
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown time';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const RobotNotificationsPanel = () => {
  const { notifications, toasts, dismissToast, clearNotifications } = useRobotControl();
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(() => notifications.length, [notifications.length]);

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
          <span className="text-[10px] md:text-xs font-mono px-1.5 py-0.5 rounded bg-dark-800 border border-white/10">
            {unreadCount}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-[min(92vw,420px)] z-50 rounded-xl border border-white/10 bg-dark-900/95 backdrop-blur-lg shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Robot Notifications</h3>
              <button
                onClick={clearNotifications}
                className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                title="Clear list"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
              {notifications.length === 0 && (
                <div className="px-2 py-3 text-xs text-gray-400">No notifications yet.</div>
              )}

              {notifications.map((item) => {
                const cls = priorityClasses[item.priority] || priorityClasses.INFO;
                return (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-dark-800/70 p-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatTime(item.receivedAt)}</span>
                    </div>
                    <p className="text-xs text-gray-200 break-words">{item.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none">
        {toasts.map((toast) => {
          const cls = priorityClasses[toast.priority] || priorityClasses.INFO;
          return (
            <div key={toast.toastId} className="pointer-events-auto rounded-lg border border-white/10 bg-dark-900/95 backdrop-blur-lg p-3 shadow-xl">
              <div className="flex items-start gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
                  {toast.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-100 break-words">{toast.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">{formatTime(toast.receivedAt)}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.toastId)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RobotNotificationsPanel;
