import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { API_URL, WEBSOCKET_URL } from '../config';

const GameState = Object.freeze({
  ERROR: 'ERROR',
  WAITING: 'WAITING',
  ASSUMPTION_PROPOSAL: 'ASSUMPTION_PROPOSAL',
  ASSUMPTION_VALIDATION: 'ASSUMPTION_VALIDATION',
  RULE_PROPOSAL: 'RULE_PROPOSAL',
  RE_ITERATION_PROMPT: 'RE_ITERATION_PROMPT',
  SUMMARY: 'SUMMARY',
  ABANDONED: 'ABANDONED',
});

const Command = Object.freeze({
  START: 'START',
  NEXT: 'NEXT',
  END: 'END',
  RESTART: 'RESTART',
});

const useGameState = (roomId, username) => {
  const [setDisconnectReason, disconnectReason, socket, sendWebSocketMessage, message, isConnected, error] =
    useWebSocket(roomId, username);

  const [roomData, setRoomData] = useState({ status: 'loading' });
  const [isFetchRequired, setIsFetchRequired] = useState(true);

  const triggerTransition = (command) => {
    if (!Command.hasOwnProperty(command)) {
      console.warn('Invalid command', command);
      return;
    }
    sendWebSocketMessage({ type: 'transition', data: { command: command } });
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(API_URL + 'get-room/' + roomId);
        setRoomData({ status: 'success', data: response.data });
      } catch (error) {
        if (!error.response) {
          setRoomData({ status: 'error', data: 'Server not responding' });
          return;
        }
        switch (error.response.status) {
          case 400:
            setRoomData({ status: 'error', data: 'Bad Request' });
            break;
          case 404:
            setRoomData({ status: 'error', data: 'Room not found' });
            break;
          default:
            console.warn('Unknown error response', error.response.status);
            setRoomData({ status: 'error', data: 'Unknown' });
            break;
        }
      }
    };

    if (isFetchRequired) {
      fetchRoomData();
      setIsFetchRequired(false);
    }
  }, [isFetchRequired]);

  useEffect(() => {
    // Handle different WebSocket message types
    if (!message) {
      return;
    }

    switch (message.type) {
      case 'notification':
        if (message.data.type === 'fetch') {
          setIsFetchRequired(true);
        }
        if (message.data.type === 'shutdown') {
          setDisconnectReason({ reason: message.data.reason, perpetrator: message.data.perpetrator });
        }
        break;
      case 'disconnect':
        setDisconnectReason({ reason: message.data });
        break;
      default:
        console.warn('Unrecognised message type', message.type);
    }
  }, [message]);

  return [sendWebSocketMessage, roomData, isConnected, triggerTransition, disconnectReason];
};

const useWebSocket = (roomId, username) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const [disconnectReason, setDisconnectReason] = useState(null);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket(WEBSOCKET_URL + 'room/' + roomId + '/' + username);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // User will attempt to be registered in backend based on username param in url.
    };

    socketRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      setMessage(JSON.parse(event.data));
    };

    socketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError(event);
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket disconnected with code', event.code, event.reason);
      if (event.code === 10006) {
        setDisconnectReason({ reason: 'abnormal' });
      }
      setIsConnected(false);
    };

    setSocket(socketRef.current);

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomId]);

  const sendWebSocketMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket message sent:', message);
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return [setDisconnectReason, disconnectReason, socket, sendWebSocketMessage, message, isConnected, error];
};

export { GameState, useGameState };
