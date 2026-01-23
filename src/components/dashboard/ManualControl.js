import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Gamepad2, Link2, Power, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRobotControl } from '../../context/RobotControlContext';

const ManualControl = () => {
  const { wsStatus, wsError, lastMessage, connectWs, disconnectWs, sendCommand, acquireLock, releaseLock } = useRobotControl();
  const [activeDirection, setActiveDirection] = useState('STOP');
  const [lockStatus, setLockStatus] = useState('');
  const [lockError, setLockError] = useState('');
  const constraintsRef = useRef(null);
  const lastCommandRef = useRef('stop');
  const lastSendRef = useRef(0);
  const maxLinear = 1.0;
  const maxAngular = 2.0;

  const sendDriveCommand = useCallback((linear, angular) => {
    const now = Date.now();
    if (now - lastSendRef.current < 80) return;
    lastSendRef.current = now;
    sendCommand({
      command: 'DRIVE_COMMAND',
      linear_velocity: linear,
      angular_velocity: angular,
    });
  }, [sendCommand]);

  const handleCommand = useCallback((cmd) => {
    if (lastCommandRef.current !== cmd) {
      lastCommandRef.current = cmd;
      setActiveDirection(cmd.toUpperCase());
    }
  }, []);

  const getDirectionLabel = useCallback((x, y) => {
    const angle = Math.atan2(-y, x) * (180 / Math.PI);
    if (angle >= -22.5 && angle < 22.5) return 'RIGHT';
    if (angle >= 22.5 && angle < 67.5) return 'FORWARD RIGHT';
    if (angle >= 67.5 && angle < 112.5) return 'FORWARD';
    if (angle >= 112.5 && angle < 157.5) return 'FORWARD LEFT';
    if (angle >= 157.5 || angle < -157.5) return 'LEFT';
    if (angle >= -157.5 && angle < -112.5) return 'BACKWARD LEFT';
    if (angle >= -112.5 && angle < -67.5) return 'BACKWARD';
    return 'BACKWARD RIGHT';
  }, []);

  const handleDrag = (event, info) => {
    const { x, y } = info.offset;
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

    const linear = Math.max(-1, Math.min(1, -normY)) * maxLinear;
    const angular = Math.max(-1, Math.min(1, -normX)) * maxAngular;

    handleCommand(getDirectionLabel(clampedX, clampedY));
    sendDriveCommand(linear, angular);
  };

  const handleDragEnd = () => {
    handleCommand('stop');
    setActiveDirection('STOP');
    sendDriveCommand(0, 0);
  };

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

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded border text-xs font-mono ${wsBadge} min-w-[130px] text-left`}>
            WS: {wsStatus.toUpperCase()}
          </div>
          <h3 className="text-lg font-medium text-gray-400 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-secondary" />
            Manual Override
          </h3>
        </div>
        <div className="px-3 py-1 rounded bg-dark-800 border border-white/10 text-xs font-mono text-primary">
          {activeDirection}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={handleConnect}
          disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-xs text-white hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Link2 className="h-4 w-4 text-success" />
          Connect WS
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-xs text-white hover:bg-dark-700 transition-colors"
        >
          <Power className="h-4 w-4 text-danger" />
          Disconnect
        </button>
      </div>

      {(lockStatus || lockError || wsError || lastMessage) && (
        <div className="space-y-2 mb-6">
          {lockStatus && (
            <div className="text-xs text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2">
              {lockStatus}
            </div>
          )}
          {(lockError || wsError) && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {lockError || wsError}
            </div>
          )}
          {lastMessage && (
            <div className="text-xs text-gray-300 bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-primary" />
              {lastMessage}
            </div>
          )}
        </div>
      )}

      <div className="flex-grow flex items-center justify-center">
        {/* Joystick Base */}
        <div
          ref={constraintsRef}
          className="relative w-64 h-64 rounded-full bg-dark-800/50 border-2 border-white/5 shadow-inner flex items-center justify-center backdrop-blur-sm"
        >
          {/* Decorative Grid/Lines */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white"></div>
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white"></div>
            <div className="absolute inset-12 border border-white/30 rounded-full"></div>
          </div>

          {/* Joystick Handle */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            dragSnapToOrigin
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
          </motion.div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500 font-mono">
        DRAG JOYSTICK TO MOVE
      </p>
    </div>
  );
};

export default ManualControl;