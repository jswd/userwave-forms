
import { io, Socket } from 'socket.io-client';
import { useState, useEffect, useRef, useCallback } from 'react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Socket instance shared across components
let socket: Socket | null = null;

export const initializeSocket = (userId: string, userRole: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      query: {
        userId,
        userRole
      }
    });

    // Set up base listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Hook for using socket in components
export const useSocket = (userId: string | undefined, userRole: string | undefined) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !userRole) return;

    socketRef.current = initializeSocket(userId, userRole);
    
    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
    };
    
    socketRef.current.on('connect', onConnect);
    socketRef.current.on('disconnect', onDisconnect);
    
    if (socketRef.current.connected) {
      setIsConnected(true);
    }
    
    return () => {
      socketRef.current?.off('connect', onConnect);
      socketRef.current?.off('disconnect', onDisconnect);
    };
  }, [userId, userRole]);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const off = useCallback((event: string) => {
    socketRef.current?.off(event);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  };
};

// Typing events
export const emitTypingStart = (userId: string, field: string, value: string) => {
  socket?.emit('typing:start', { userId, field, value });
};

export const emitTypingUpdate = (userId: string, field: string, value: string) => {
  socket?.emit('typing:update', { userId, field, value });
};

export const emitTypingEnd = (userId: string, field: string) => {
  socket?.emit('typing:end', { userId, field });
};
