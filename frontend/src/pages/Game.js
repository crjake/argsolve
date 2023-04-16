import cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ROOM_URL } from '../config';

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!/\d+/.test(id)) {
      navigate(-1);
    }
  }, [id, navigate]);

  const [socket, sendWebSocketMessage, message, isConnected, error] = useWebSocket(id);

  return (
    <div className="flex flex-col grow mx-auto mt-8 max-w-lg">
      <div className="text-xl">Room {id}</div>
      {message && message.message ? <div>{message.message}</div> : <div>No message yet</div>}
      <Graph />
    </div>
  );
};

const GameState = Object.freeze({
  ERROR: 'ERROR',
  WAITING: 'WAITING',
  ASSUMPTION_PROPOSAL: 'ASSUMPTION_PROPOSAL',
  ASSUMPTION_VALIDATION: 'ASSUMPTION_VALIDATION',
  RULE_PROPOSAL: 'RULE_PROPOSAL',
  RE_ITERATION_PROMPT: 'RE_ITERATION_PROMPT',
  SUMMARY: 'SUMMARY',
});

const useGameState = (roomId) => {
  const [socket, sendWebSocketMessage, message, isConnected, error] = useWebSocket(roomId);

  const [gameState, setGameState] = useState(GameState.ERROR);

  // useEffect(, [message]);
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

function Graph() {
  const cy = useRef();

  useEffect(() => {
    cy.current.on('click', 'edge', (event) => {
      const edge = event.target;
      cy.current.remove(edge);
    });
  }, []); // emppty == didMount?

  const elements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
  ];
  return (
    <div className="flex justify-center">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '600px', height: '600px' }}
        className="border-4"
        cy={(cyInstance) => (cy.current = cyInstance)}
      />
    </div>
  );
}

export default Game;
