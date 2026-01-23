import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';

const RobotControlContext = createContext(null);

const getBaseUrl = () => api.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:3003';

const toWsUrl = () => {
  const base = getBaseUrl();
  return base.replace(/^http/, 'ws');
};

export const RobotControlProvider = ({ children, autoConnect = true }) => {
  const wsRef = useRef(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [wsError, setWsError] = useState('');
  const [lastMessage, setLastMessage] = useState(null);

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
    };

    socket.onerror = () => {
      setWsStatus('error');
      setWsError('WebSocket error');
    };

    socket.onmessage = (msg) => {
      setLastMessage(msg.data);
    };
  }, []);

  const disconnectWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((command) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    wsRef.current.send(JSON.stringify(command));
    return true;
  }, []);

  const getStatus = useCallback(async () => {
    const response = await api.get('/status');
    return response.data;
  }, []);

  const acquireLock = useCallback(async () => {
    const response = await api.post('/drive/lock');
    return response.data;
  }, []);

  const releaseLock = useCallback(async () => {
    const response = await api.delete('/drive/lock');
    return response.data;
  }, []);

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

  useEffect(() => {
    if (autoConnect && localStorage.getItem('token')) {
      connectWs();
    }
    return () => disconnectWs();
  }, [autoConnect, connectWs, disconnectWs]);

  const value = useMemo(
    () => ({
      wsStatus,
      wsError,
      lastMessage,
      connectWs,
      disconnectWs,
      sendCommand,
      getStatus,
      acquireLock,
      releaseLock,
      getNodes,
      selectRoute,
      checkRobotConnection,
    }),
    [
      wsStatus,
      wsError,
      lastMessage,
      connectWs,
      disconnectWs,
      sendCommand,
      getStatus,
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