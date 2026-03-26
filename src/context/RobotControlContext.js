import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const RobotControlContext = createContext(null);

const getBaseUrl = () => api.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:3003';

const toWsUrl = () => {
  const base = getBaseUrl();
  return base.replace(/^http/, 'ws');
};

export const RobotControlProvider = ({ children, autoConnect = true }) => {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const eventsWsRef = useRef(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [wsError, setWsError] = useState('');
  const [eventsWsStatus, setEventsWsStatus] = useState('disconnected');
  const [eventsWsError, setEventsWsError] = useState('');
  const [lastMessage, setLastMessage] = useState(null);
  const [statusData, setStatusData] = useState({
    systemHealth: 'UNKNOWN',
    batteryLevel: 0,
    driveMode: 'UNKNOWN',
    cargoStatus: 'UNKNOWN',
    position: 'UNKNOWN',
    lastRoute: null,
    manualLockHolderName: null,
    robotConnected: false,
    nodes: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [hasLock, setHasLock] = useState(false);
  const hasLockRef = useRef(false);
  const canManageDriveRef = useRef(false);
  const canManageDrive = user?.role === 'Admin' || user?.role === 'Operator';

  useEffect(() => {
    hasLockRef.current = hasLock;
  }, [hasLock]);

  useEffect(() => {
    canManageDriveRef.current = canManageDrive;
  }, [canManageDrive]);

  const normalizeStatusPayload = useCallback((data = {}) => ({
    systemHealth: data.systemHealth ?? data.system_health ?? 'UNKNOWN',
    batteryLevel: data.batteryLevel ?? data.battery_level ?? 0,
    driveMode: data.driveMode ?? data.drive_mode ?? 'UNKNOWN',
    cargoStatus: data.cargoStatus ?? data.cargo_status ?? 'UNKNOWN',
    position: data.position ?? 'UNKNOWN',
    lastRoute: data.lastRoute ?? data.last_route ?? null,
    manualLockHolderName: data.manualLockHolderName ?? data.manual_lock_holder_name ?? null,
    robotConnected: data.robotConnected ?? data.robot_connected ?? false,
    nodes: data.nodes ?? [],
  }), []);

  const normalizeNotification = useCallback((data = {}) => ({
    id: data.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    priority: (data.priority ?? 'INFO').toUpperCase(),
    message: data.message ?? '',
    receivedAt: data.receivedAt ?? data.received_at ?? new Date().toISOString(),
  }), []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const connectWs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setWsError('Not logged in');
      setWsStatus('error');
      return;
    }

    const url = `${toWsUrl()}/ws/drive/manual?token=${token}`;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsStatus('connecting');
    setWsError('');
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus('connected');
      setWsError('');
    };

    socket.onclose = () => {
      setWsStatus('disconnected');
      if (!navigator.onLine) {
        setWsError('Offline');
      } else {
        setWsError('WebSocket disconnected');
      }
    };

    socket.onerror = () => {
      setWsStatus('error');
      setWsError('WebSocket error');
    };

    socket.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (parsed?.event === 'status_update' && parsed?.data) {
          setStatusData(normalizeStatusPayload(parsed.data));
          return;
        }

        if (parsed?.event === 'robot_notification' && parsed?.data) {
          const notification = normalizeNotification(parsed.data);
          setLastMessage(`[${notification.priority}] ${notification.message}`);
          setNotifications((prev) => [
            notification,
            ...prev.filter((item) => item.id !== notification.id),
          ].slice(0, 200));

          const toastId = `${notification.id}-${Date.now()}`;
          const toast = {
            ...notification,
            toastId,
          };
          setToasts((prev) => [toast, ...prev].slice(0, 5));
          window.setTimeout(() => {
            dismissToast(toastId);
          }, 5000);
          return;
        }

        setLastMessage(msg.data);
      } catch {
        setLastMessage(msg.data);
      }
    };
  }, [dismissToast, normalizeNotification, normalizeStatusPayload]);

  const connectEventsWs = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setEventsWsError('Not logged in');
      setEventsWsStatus('error');
      return;
    }

    const url = `${toWsUrl()}/ws/robot/events?token=${token}`;

    if (eventsWsRef.current) {
      eventsWsRef.current.close();
      eventsWsRef.current = null;
    }

    setEventsWsStatus('connecting');
    setEventsWsError('');
    const socket = new WebSocket(url);
    eventsWsRef.current = socket;

    socket.onopen = () => {
      setEventsWsStatus('connected');
      setEventsWsError('');
    };

    socket.onclose = () => {
      setEventsWsStatus('disconnected');
      if (!navigator.onLine) {
        setEventsWsError('Offline');
      } else {
        setEventsWsError('WebSocket disconnected');
      }
    };

    socket.onerror = () => {
      setEventsWsStatus('error');
      setEventsWsError('WebSocket error');
    };

    socket.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        if (parsed?.event === 'status_update' && parsed?.data) {
          setStatusData(normalizeStatusPayload(parsed.data));
          return;
        }

        if (parsed?.event === 'robot_notification' && parsed?.data) {
          const notification = normalizeNotification(parsed.data);
          setLastMessage(`[${notification.priority}] ${notification.message}`);
          setNotifications((prev) => [
            notification,
            ...prev.filter((item) => item.id !== notification.id),
          ].slice(0, 200));

          const toastId = `${notification.id}-${Date.now()}`;
          const toast = {
            ...notification,
            toastId,
          };
          setToasts((prev) => [toast, ...prev].slice(0, 5));
          window.setTimeout(() => {
            dismissToast(toastId);
          }, 5000);
          return;
        }

        setLastMessage(msg.data);
      } catch {
        setLastMessage(msg.data);
      }
    };
  }, [dismissToast, normalizeNotification, normalizeStatusPayload]);

  const disconnectWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const disconnectEventsWs = useCallback(() => {
    if (eventsWsRef.current) {
      eventsWsRef.current.close();
      eventsWsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((command) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(JSON.stringify(command));
    return true;
  }, []);

  const acquireLock = useCallback(async () => {
    if (!canManageDriveRef.current) {
      return { status: 'error', message: 'Insufficient permissions to acquire lock' };
    }

    const response = await api.post('/drive/lock');
    if (response.data?.status !== 'error') {
      setHasLock(true);
    }
    return response.data;
  }, []);

  const releaseLock = useCallback(async () => {
    if (!canManageDriveRef.current) {
      return { status: 'skipped', message: 'Unlock skipped: role cannot hold drive lock' };
    }

    if (!hasLockRef.current) {
      return { status: 'skipped', message: 'Unlock skipped: no active drive lock' };
    }

    const response = await api.delete('/drive/lock');
    if (response.data?.status !== 'error') {
      setHasLock(false);
    }
    return response.data;
  }, []);

  const releaseLockOnExit = useCallback(() => {
    if (!canManageDriveRef.current || !hasLockRef.current) {
      disconnectWs();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      disconnectWs();
      return;
    }

    const url = `${getBaseUrl()}/drive/lock`;
    try {
      fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        keepalive: true,
      });
    } catch (error) {
      // Ignore errors on page exit
    }

    disconnectWs();
  }, [disconnectWs]);

  const getNodes = useCallback(async () => {
    const response = await api.get('/nodes');
    return response.data;
  }, []);

  const selectRoute = useCallback(async (start, destination) => {
    const response = await api.post('/routes/select', { start, destination });
    return response.data;
  }, []);

  const checkRobotConnection = useCallback(async () => {
    const response = await api.get('/robot/check');
    return response.data;
  }, []);

  const loadNotificationHistory = useCallback(async () => {
    const response = await api.get('/robot/notifications?limit=100');
    const history = Array.isArray(response.data)
      ? response.data.map(normalizeNotification)
      : [];
    setNotifications(history);
  }, [normalizeNotification]);

  useEffect(() => {
    if (autoConnect && localStorage.getItem('token')) {
      connectEventsWs();
    }
    return () => {
      if (localStorage.getItem('token') && canManageDriveRef.current && hasLockRef.current) {
        releaseLock().catch(() => {});
      }
      disconnectWs();
      disconnectEventsWs();
    };
  }, [autoConnect, connectEventsWs, disconnectEventsWs, disconnectWs, releaseLock]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return;
    }

    loadNotificationHistory().catch(() => {});
  }, [loadNotificationHistory]);

  useEffect(() => {
    const handlePageLeave = () => {
      releaseLockOnExit();
    };

    window.addEventListener('pagehide', handlePageLeave);
    window.addEventListener('beforeunload', handlePageLeave);

    return () => {
      window.removeEventListener('pagehide', handlePageLeave);
      window.removeEventListener('beforeunload', handlePageLeave);
    };
  }, [releaseLockOnExit]);

  useEffect(() => {
    const handleOffline = () => {
      setWsStatus('error');
      setWsError('Offline');
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setEventsWsStatus('error');
      setEventsWsError('Offline');
      if (eventsWsRef.current) {
        eventsWsRef.current.close();
        eventsWsRef.current = null;
      }
    };

    const handleOnline = () => {
      setWsError('');
      setWsStatus((prev) => (prev === 'error' ? 'disconnected' : prev));
      setEventsWsError('');
      setEventsWsStatus((prev) => (prev === 'error' ? 'disconnected' : prev));
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const value = useMemo(
    () => ({
      wsStatus,
      wsError,
      eventsWsStatus,
      eventsWsError,
      lastMessage,
      statusData,
      nodes: statusData.nodes,
      notifications,
      toasts,
      dismissToast,
      clearNotifications,
      connectWs,
      connectEventsWs,
      disconnectWs,
      disconnectEventsWs,
      sendCommand,
      acquireLock,
      releaseLock,
      getNodes,
      selectRoute,
      checkRobotConnection,
    }),
    [
      wsStatus,
      wsError,
      eventsWsStatus,
      eventsWsError,
      lastMessage,
      statusData,
      notifications,
      toasts,
      dismissToast,
      clearNotifications,
      connectWs,
      connectEventsWs,
      disconnectWs,
      disconnectEventsWs,
      sendCommand,
      acquireLock,
      releaseLock,
      getNodes,
      selectRoute,
      checkRobotConnection,
    ]
  );

  return (
    <RobotControlContext.Provider value={value}>
      {children}
    </RobotControlContext.Provider>
  );
};

export const useRobotControl = () => useContext(RobotControlContext);