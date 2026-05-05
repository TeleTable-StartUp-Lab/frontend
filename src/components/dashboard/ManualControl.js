import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Gauge } from 'lucide-react';
import { useRobotControl } from '../../context/RobotControlContext';
import { useAuth } from '../../context/AuthContext';

const DRIVE_COMMAND_INTERVAL_MS = 75;
const DRIVE_COMMAND_EPSILON = 0.02;
const DEFAULT_MANUAL_SPEED_CAP_PERCENT = 60;
const MIN_MANUAL_SPEED_CAP_PERCENT = 10;
const MAX_MANUAL_SPEED_CAP_PERCENT = 100;
const MANUAL_SPEED_CAP_STEP = 5;
const GAMEPAD_DEADZONE = 0.14;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const applyDeadzone = (value, deadzone = GAMEPAD_DEADZONE) => {
  if (Math.abs(value) < deadzone) {
    return 0;
  }

  const normalized = (Math.abs(value) - deadzone) / (1 - deadzone);
  return Math.sign(value) * normalized;
};

const ManualControl = ({ dashboardState }) => {
  const { wsStatus, sendCommand } = useRobotControl();
  const { user } = useAuth();
  const canOperate = user?.role === 'Admin' || user?.role === 'Operator';
  const isCommandReady = wsStatus === 'connected';
  const canDrive = canOperate && isCommandReady && (!dashboardState || dashboardState.state === 'manual_ready');
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [manualSpeedCap, setManualSpeedCap] = useState(DEFAULT_MANUAL_SPEED_CAP_PERCENT);
  const [connectedGamepadLabel, setConnectedGamepadLabel] = useState('');
  const constraintsRef = useRef(null);
  const lastSendRef = useRef(0);
  const queuedCommandRef = useRef(null);
  const lastCommandRef = useRef(null);
  const flushTimeoutRef = useRef(null);
  const pressedKeysRef = useRef(new Set());
  const lastSentSpeedCapRef = useRef(null);
  const gamepadAnimationFrameRef = useRef(null);
  const activeGamepadIndexRef = useRef(null);
  const gamepadDrivingRef = useRef(false);
  const gamepadSpeedCapArmedRef = useRef(true);
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

  useEffect(() => {
    if (wsStatus !== 'connected') {
      lastSentSpeedCapRef.current = null;
      return;
    }

    if (lastSentSpeedCapRef.current === manualSpeedCap) {
      return;
    }

    const sent = sendCommand({
      command: 'SET_MANUAL_SPEED_CAP',
      max_speed_percent: manualSpeedCap,
    });

    if (sent) {
      lastSentSpeedCapRef.current = manualSpeedCap;
    }
  }, [manualSpeedCap, sendCommand, wsStatus]);

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

  const setSpeedCapFromGamepadAxis = useCallback((axisValue) => {
    const normalizedAxis = applyDeadzone(axisValue);

    if (normalizedAxis === 0) {
      gamepadSpeedCapArmedRef.current = true;
      return;
    }

    if (!gamepadSpeedCapArmedRef.current) {
      return;
    }

    const normalizedPercent = (1 - normalizedAxis) / 2;
    const rawSpeedCap = MIN_MANUAL_SPEED_CAP_PERCENT
      + (normalizedPercent * (MAX_MANUAL_SPEED_CAP_PERCENT - MIN_MANUAL_SPEED_CAP_PERCENT));
    const steppedSpeedCap = Math.round(rawSpeedCap / MANUAL_SPEED_CAP_STEP) * MANUAL_SPEED_CAP_STEP;
    const nextSpeedCap = clamp(steppedSpeedCap, MIN_MANUAL_SPEED_CAP_PERCENT, MAX_MANUAL_SPEED_CAP_PERCENT);

    gamepadSpeedCapArmedRef.current = false;
    setManualSpeedCap((current) => (current === nextSpeedCap ? current : nextSpeedCap));
  }, []);

  const applyGamepadDrive = useCallback((horizontalAxis, verticalAxis) => {
    const normX = clamp(applyDeadzone(horizontalAxis), -1, 1);
    const normY = clamp(applyDeadzone(verticalAxis), -1, 1);

    if (normX === 0 && normY === 0) {
      if (gamepadDrivingRef.current) {
        gamepadDrivingRef.current = false;
        handleDragEnd();
      }
      return;
    }

    const maxRadius = getMaxRadius();
    gamepadDrivingRef.current = true;
    applyControlOffset(normX * maxRadius, normY * maxRadius);
  }, [applyControlOffset, getMaxRadius, handleDragEnd]);

  const handlePointerDown = (event) => {
    if (!canDrive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !canDrive) return;
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
    if (!isDragging) return;
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
      if (!canDrive) return;
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
  }, [canDrive, handleDragEnd, setTargetFromKeyboard]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return undefined;
    }

    const updateConnectedGamepad = () => {
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const activeGamepad = gamepads.find((gamepad) => gamepad.mapping === 'standard')
        || gamepads[0]
        || null;

      activeGamepadIndexRef.current = activeGamepad ? activeGamepad.index : null;
      setConnectedGamepadLabel(activeGamepad?.id || '');
    };

    const pollGamepadState = () => {
      if (!canDrive || document.hidden) {
        if (gamepadDrivingRef.current) {
          gamepadDrivingRef.current = false;
          handleDragEnd();
        }
        gamepadAnimationFrameRef.current = window.requestAnimationFrame(pollGamepadState);
        return;
      }

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const activeIndex = activeGamepadIndexRef.current;
      const gamepad = activeIndex !== null ? gamepads[activeIndex] : null;

      if (gamepad) {
        const leftStickY = gamepad.axes[1] ?? 0;
        const rightStickX = gamepad.axes[2] ?? 0;
        const rightStickY = gamepad.axes[3] ?? gamepad.axes[5] ?? 0;

        setSpeedCapFromGamepadAxis(leftStickY);
        applyGamepadDrive(rightStickX, rightStickY);
      } else if (gamepadDrivingRef.current) {
        gamepadDrivingRef.current = false;
        handleDragEnd();
      }

      gamepadAnimationFrameRef.current = window.requestAnimationFrame(pollGamepadState);
    };

    const handleGamepadConnected = () => {
      updateConnectedGamepad();
    };

    const handleGamepadDisconnected = () => {
      updateConnectedGamepad();
      if (activeGamepadIndexRef.current === null && gamepadDrivingRef.current) {
        gamepadDrivingRef.current = false;
        handleDragEnd();
      }
    };

    updateConnectedGamepad();
    gamepadAnimationFrameRef.current = window.requestAnimationFrame(pollGamepadState);
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      if (gamepadAnimationFrameRef.current) {
        window.cancelAnimationFrame(gamepadAnimationFrameRef.current);
        gamepadAnimationFrameRef.current = null;
      }
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      activeGamepadIndexRef.current = null;
      gamepadDrivingRef.current = false;
      gamepadSpeedCapArmedRef.current = true;
    };
  }, [applyGamepadDrive, canDrive, handleDragEnd, setSpeedCapFromGamepadAxis]);

  const handleManualSpeedCapChange = useCallback((event) => {
    setManualSpeedCap(Number(event.target.value));
  }, []);

  useEffect(() => {
    if (canDrive) return;
    if (!isDragging && dragPos.x === 0 && dragPos.y === 0) return;
    setIsDragging(false);
    handleDragEnd();
  }, [canDrive, dragPos.x, dragPos.y, handleDragEnd, isDragging]);

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
      <div className="rounded-lg bg-dark-900/45 p-4">
        <div className="mb-3 flex items-center gap-3">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-gray-100">Joystick unavailable</h3>
        </div>
        <p className="text-sm text-gray-500">
          Read-only access: manual controls are disabled for Viewer accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold text-gray-100">Joystick</div>
            <div className="text-xs text-gray-500">Direct drive input</div>
          </div>
        </div>
        <div className={`rounded border px-2 py-1 text-[10px] font-mono ${wsBadge}`}>
          {wsStatus.toUpperCase()}
        </div>
      </div>

      <div className="mb-5 px-1">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="manual-speed-cap" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            Max Speed
          </label>
          <span className="text-sm font-mono text-primary">{manualSpeedCap}%</span>
        </div>
        <input
          id="manual-speed-cap"
          type="range"
          min={MIN_MANUAL_SPEED_CAP_PERCENT}
          max={MAX_MANUAL_SPEED_CAP_PERCENT}
          step={MANUAL_SPEED_CAP_STEP}
          value={manualSpeedCap}
          onChange={handleManualSpeedCapChange}
          disabled={!canDrive}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-2 text-[11px] text-gray-500">
          {connectedGamepadLabel ? `Controller: ${connectedGamepadLabel}` : 'Drag the stick, use WASD, or connect a standard gamepad.'}
        </p>
      </div>

      <div className="flex min-h-[280px] flex-grow items-center justify-center">
        <div
          ref={constraintsRef}
          className={`relative flex h-64 w-64 items-center justify-center rounded-full bg-dark-800/50 shadow-inner backdrop-blur-sm touch-none md:h-72 md:w-72 ${canDrive ? 'ring-2 ring-primary/25' : 'opacity-50 ring-1 ring-white/10'}`}
        >
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white"></div>
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white"></div>
            <div className="absolute inset-8 md:inset-12 border border-white/30 rounded-full"></div>
          </div>

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
            className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-[0_0_18px_rgba(0,240,255,0.22)] touch-none md:h-28 md:w-28 ${canDrive ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed grayscale'}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] font-mono text-gray-500 md:text-xs">
        {canDrive ? 'MANUAL DRIVE ACTIVE' : 'MANUAL DRIVE DISABLED'}
      </p>
    </div>
  );
};

export default ManualControl;
