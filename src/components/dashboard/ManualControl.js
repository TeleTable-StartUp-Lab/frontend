import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Link2, Power, MessageSquare } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { useAuth } from '../../context/AuthContext';

const DRIVE_COMMAND_INTERVAL_MS = 75;
const DRIVE_COMMAND_EPSILON = 0.02;

const ManualControl = () => {
  const { wsStatus, wsError, lastMessage, connectWs, disconnectWs, sendCommand, acquireLock, releaseLock } = useRobotControl();
  const { user } = useAuth();
  const canOperate = user?.role === 'Admin' || user?.role === 'Operator';
  const [lockStatus, setLockStatus] = useState('');
  const [lockError, setLockError] = useState('');
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const lastSendRef = useRef(0);
  const queuedCommandRef = useRef(null);
  const lastCommandRef = useRef(null);
  const flushTimeoutRef = useRef(null);
  const pressedKeysRef = useRef(new Set());
  const maxLinear = 1.0;
  const maxAngular = 2.0;

  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const touchPoints = navigator.maxTouchPoints > 0;
    return Boolean(coarsePointer || touchPoints);
  }, []);

  // Deaktiviere Scrolling wenn Joystick aktiv ist (nur mobile Geräte)
  useEffect(() => {
    if (!isTouchDevice) return;

    if (isDragging) {
      // Verhindere Scrolling auf dem gesamten Body
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      // Verhindere auch das Pull-to-Refresh auf mobilen Geräten
      document.documentElement.style.overscrollBehavior = 'none';
    } else {
      // Stelle Scrolling wieder her
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    }

    // Cleanup beim Unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [isDragging, isTouchDevice]);

  const clearScheduledFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
  }, []);

  const hasMeaningfulChange = useCallback((next, previous) => {
    if (!previous) return true;
    return (
      Math.abs(next.linear - previous.linear) >= DRIVE_COMMAND_EPSILON
      || Math.abs(next.angular - previous.angular) >= DRIVE_COMMAND_EPSILON
    );
  }, []);

  const flushDriveCommand = useCallback((force = false) => {
    const nextCommand = queuedCommandRef.current;
    if (!nextCommand) return;

    if (!force && !hasMeaningfulChange(nextCommand, lastCommandRef.current)) {
      queuedCommandRef.current = null;
      return;
    }

    const sent = sendCommand({
      command: 'DRIVE_COMMAND',
      linear_velocity: nextCommand.linear,
      angular_velocity: nextCommand.angular,
    });

    if (!sent) return;

    lastSendRef.current = Date.now();
    lastCommandRef.current = nextCommand;
    queuedCommandRef.current = null;
  }, [hasMeaningfulChange, sendCommand]);

  const sendDriveCommand = useCallback((linear, angular, force = false) => {
    const nextCommand = { linear, angular };
    queuedCommandRef.current = nextCommand;

    if (force) {
      clearScheduledFlush();
      flushDriveCommand(true);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastSendRef.current;

    if (elapsed >= DRIVE_COMMAND_INTERVAL_MS) {
      clearScheduledFlush();
      flushDriveCommand();
      return;
    }

    if (!flushTimeoutRef.current) {
      flushTimeoutRef.current = setTimeout(() => {
        flushTimeoutRef.current = null;
        flushDriveCommand();
      }, DRIVE_COMMAND_INTERVAL_MS - elapsed);
    }
  }, [clearScheduledFlush, flushDriveCommand]);

  useEffect(() => () => {
    clearScheduledFlush();
  }, [clearScheduledFlush]);

  const updateFromOffset = useCallback((x, y) => {
    const threshold = 8;

    if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
      return;
    }

    const bounds = constraintsRef.current?.getBoundingClientRect();
    const maxRadius = bounds ? (bounds.width / 2) - 20 : 90;
    const clampedX = Math.max(-maxRadius, Math.min(maxRadius, x));
    const clampedY = Math.max(-maxRadius, Math.min(maxRadius, y));

    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;

    const linear = Number((Math.max(-1, Math.min(1, -normY)) * maxLinear).toFixed(2));
    const angular = Number((Math.max(-1, Math.min(1, -normX)) * maxAngular).toFixed(2));

    sendDriveCommand(linear, angular);
  }, [maxAngular, maxLinear, sendDriveCommand]);

  const handleDragEnd = useCallback(() => {
    setDragPos({ x: 0, y: 0 });
    sendDriveCommand(0, 0, true);
  }, [sendDriveCommand]);

  const getMaxRadius = useCallback(() => {
    const bounds = constraintsRef.current?.getBoundingClientRect();
    return bounds ? (bounds.width / 2) - 20 : 90;
  }, []);

  const applyControlOffset = useCallback((x, y) => {
    setDragPos({ x, y });
    updateFromOffset(x, y);
  }, [updateFromOffset]);

  const setTargetFromKeyboard = useCallback((pressedKeys) => {
    const horizontal = (pressedKeys.has('d') ? 1 : 0) + (pressedKeys.has('a') ? -1 : 0);
    const vertical = (pressedKeys.has('s') ? 1 : 0) + (pressedKeys.has('w') ? -1 : 0);

    if (horizontal === 0 && vertical === 0) {
      handleDragEnd();
      return;
    }

    const maxRadius = getMaxRadius();
    applyControlOffset(horizontal * maxRadius, vertical * maxRadius);
  }, [applyControlOffset, getMaxRadius, handleDragEnd]);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const bounds = constraintsRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;

    const maxRadius = (bounds.width / 2) - 20;
    const clampedX = Math.max(-maxRadius, Math.min(maxRadius, rawX));
    const clampedY = Math.max(-maxRadius, Math.min(maxRadius, rawY));

    applyControlOffset(clampedX, clampedY);
  };

  const handlePointerUp = (event) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    handleDragEnd();
  };

  useEffect(() => {
    const movementKeys = new Set(['w', 'a', 's', 'd']);

    const isEditableElement = (target) => {
      if (!target) return false;
      if (target instanceof HTMLInputElement) return true;
      if (target instanceof HTMLTextAreaElement) return true;
      return target.isContentEditable;
    };

    const handleKeyDown = (event) => {
      if (!canOperate) return;
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      if (isEditableElement(event.target)) return;

      event.preventDefault();
      pressedKeysRef.current.add(key);
      setTargetFromKeyboard(pressedKeysRef.current);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (!movementKeys.has(key)) return;

      event.preventDefault();
      pressedKeysRef.current.delete(key);
      setTargetFromKeyboard(pressedKeysRef.current);
    };

    const resetKeyboardControl = () => {
      if (pressedKeysRef.current.size === 0) return;
      pressedKeysRef.current.clear();
      handleDragEnd();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetKeyboardControl();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetKeyboardControl);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeyboardControl);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resetKeyboardControl();
    };
  }, [canOperate, handleDragEnd, setTargetFromKeyboard]);

  const handleConnect = async () => {
    setLockError('');
    try {
      const res = await acquireLock();
      if (res.status === 'error') {
        setLockError(res.message || 'Failed to acquire lock');
      } else {
        setLockStatus(res.message || 'Lock acquired');
      }
    } catch (e) {
      setLockError('Failed to acquire lock');
    }
    connectWs();
  };

  const handleDisconnect = async () => {
    disconnectWs();
    setLockError('');
    try {
      const res = await releaseLock();
      if (res.status === 'error') {
        setLockError(res.message || 'Failed to release lock');
      } else {
        setLockStatus(res.message || 'Lock released');
      }
    } catch (e) {
      setLockError('Failed to release lock');
    }
  };

  const wsBadge = useMemo(() => {
    switch (wsStatus) {
      case 'connected':
        return 'bg-success/10 text-success border-success/20';
      case 'connecting':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-gray-700/40 text-gray-300 border-white/10';
    }
  }, [wsStatus]);

  if (!canOperate) {
    return (
      <div className="glass-panel rounded-xl p-6 border border-white/10 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-medium text-gray-400">Manual Override</h3>
        </div>
        <p className="text-sm text-gray-500">
          Read-only access: manual controls are disabled for Viewer accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 md:p-6 border border-white/10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className={`px-2 md:px-3 py-1 rounded border text-[10px] md:text-xs font-mono ${wsBadge} min-w-[100px] md:min-w-[130px] text-left`}>
            WS: {wsStatus.toUpperCase()}
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-400 flex items-center gap-2">
            <Gamepad2 className="w-4 md:w-5 h-4 md:h-5 text-secondary" />
            <span className="hidden sm:inline">Manual Override</span>
            <span className="sm:hidden">Manual</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
        <button
          type="button"
          onClick={handleConnect}
          disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
          className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-[10px] md:text-xs text-white hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="h-3.5 md:h-4 w-3.5 md:w-4 text-success" />
          <span className="hidden sm:inline">Connect WS</span>
          <span className="sm:hidden">Connect</span>
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-[10px] md:text-xs text-white hover:bg-dark-700 transition-colors"
        >
          <Power className="h-3.5 md:h-4 w-3.5 md:w-4 text-danger" />
          <span className="hidden sm:inline">Disconnect</span>
          <span className="sm:hidden">Stop</span>
        </button>
      </div>

      {(lockStatus || lockError || wsError || lastMessage) && (
        <div className="space-y-2 mb-4 md:mb-6">
          {lockStatus && (
            <div className="text-[10px] md:text-xs text-success bg-success/10 border border-success/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2">
              {lockStatus}
            </div>
          )}
          {(lockError || wsError) && (
            <div className="text-[10px] md:text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-2 md:px-3 py-1.5 md:py-2">
              {lockError || wsError}
            </div>
          )}
          {lastMessage && (
            <div className="text-[10px] md:text-xs text-gray-300 bg-dark-800/60 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2">
              <MessageSquare className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">{lastMessage}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-grow flex items-center justify-center min-h-[280px] md:min-h-0">
        {/* Joystick Base */}
        <div
          ref={constraintsRef}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-full bg-dark-800/50 border-2 border-white/5 shadow-inner flex items-center justify-center backdrop-blur-sm touch-none"
        >
          {/* Decorative Grid/Lines */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white"></div>
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white"></div>
            <div className="absolute inset-8 md:inset-12 border border-white/30 rounded-full"></div>
          </div>

          {/* Joystick Handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={(event) => {
              if (isDragging) {
                event.currentTarget.releasePointerCapture(event.pointerId);
                setIsDragging(false);
                handleDragEnd();
              }
            }}
            onPointerLeave={() => {
              if (isDragging) {
                setIsDragging(false);
                handleDragEnd();
              }
            }}
            style={{ transform: `translate(${dragPos.x}px, ${dragPos.y}px)`, touchAction: 'none' }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10 touch-none"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
          </div>
        </div>
      </div>

      <p className="mt-4 md:mt-6 text-center text-[10px] md:text-xs text-gray-500 font-mono">
        DRAG JOYSTICK OR USE WASD
      </p>
    </div>
  );
};

export default ManualControl;
