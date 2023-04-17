import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';

const GameState = Object.freeze({
  ERROR: 'ERROR',
  WAITING: 'WAITING',
  ASSUMPTION_PROPOSAL: 'ASSUMPTION_PROPOSAL',
  ASSUMPTION_VALIDATION: 'ASSUMPTION_VALIDATION',
  RULE_PROPOSAL: 'RULE_PROPOSAL',
  RE_ITERATION_PROMPT: 'RE_ITERATION_PROMPT',
  SUMMARY: 'SUMMARY',
});

const useGameMaster = (roomId) => {
  const [advanceGameState, notification, setNotification] = useNotifier(roomId);
  const [roomData, setRoomData] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(API_URL + 'get-room/' + roomId);
        if (response && response.data) {
          setRoomData({ success: 'Successfully fetched room/' + roomId, payload: response.data });
        } else {
          setRoomData({ notResponding: 'Server not responding' });
        }
      } catch (error) {
        console.log(error);
        setRoomData({ badRoomId: 'Room not created' });
      }
    };

    console.log('Notification received or fetch triggered manually');

    if (triggerFetch) {
      setTriggerFetch(false);
      fetchRoomData();
    } else {
      switch (notification) {
        case Notification.FETCH:
          fetchRoomData();
          setNotification(null);
          break;
        default:
          break;
      }
    }
  }, [notification, triggerFetch]);

  const manualFetch = () => {
    setTriggerFetch(true);
  };

  return [advanceGameState, manualFetch, roomData];
};

const Notification = Object.freeze({
  FETCH: 'FETCH',
});

const useNotifier = (roomId) => {
  const [socket, sendWebSocketMessage, message, isConnected, error] = useWebSocket(roomId);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    console.log('Attempting to parse message...');
    try {
      if (message) {
        switch (message.notification) {
          case 'fetch':
            console.log('Message was fetch, notifying game master');
            setNotification(Notification.FETCH);
            break;
          default:
            console.log('Received unknown notification:', message.notification, 'from message', message);
        }
      }
    } catch (error) {
      console.log('Failed to parse message:', message);
    }
  }, [message]);

  const advanceGameState = (command) => {
    // TODO Take a command argument
    console.log('Advancing state via button click?');
    sendWebSocketMessage(command);
  };

  return [advanceGameState, notification, setNotification];
};

const useWebSocket = (roomId) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8000/room/' + roomId);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      setMessage(JSON.parse(event.data));
    };

    socketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError(event);
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
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
      socketRef.current.send(message);
    }
  };

  return [socket, sendWebSocketMessage, message, isConnected, error];
};

export { GameState, useGameMaster };
