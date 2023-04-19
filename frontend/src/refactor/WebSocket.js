import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const [state, setState] = useState({ isConnected: false, error: null, message: null, closeCode: null });

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setState((s) => {
        return { ...s, isConnected: true };
      });
    };

    socketRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      setState((s) => {
        return { ...s, message: JSON.parse(event.data) };
      });
    };

    socketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setState((s) => {
        return { ...s, error: event };
      });
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket disconnected with code', event.code);
      setState((s) => {
        return { ...s, isConnected: false, closeCode: event.code };
      });
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket message sent:', message);
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return [state, sendMessage];
};

export default useWebSocket;
