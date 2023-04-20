import { useContext, useEffect, useReducer, useRef, useState } from 'react';

import { produce } from 'immer';

import { useParams } from 'react-router-dom';
import { API_URL, WEBSOCKET_URL } from '../config';
import {
  GameStage,
  GameStateContext,
  GameStateDispatchContext,
  ActionHandlerContext,
  WebSocketStateContext,
} from './GameContext';
import UsernameContext from './UsernameContext';
import useWebSocket from './WebSocket';
import StageMultiplexer from './StageMultiplexer';
import axios from 'axios';

const ArgSolve = () => {
  const { id } = useParams();
  const username = useContext(UsernameContext);
  return (
    <GameContextWrapper username={username} id={id}>
      <StageMultiplexer />
    </GameContextWrapper>
  );
};

const GameContextWrapper = ({ username, id, children }) => {
  const [webSocketState, sendWebSocketMessage] = useWebSocket(`${WEBSOCKET_URL}room/${id}/${username}`);
  const [gameState, gameStateDispatch] = useReducer(gameStateReducer, initGameState());

  const sendMessage = useRef(null);

  // Forward new WebSocket message to game state dispatcher (so they can handle state changes)
  useEffect(() => {
    if (webSocketState.message) {
      gameStateDispatch(webSocketState.message);
    }
  }, [webSocketState.message]);

  // Generate a function to sendWebSocketMessages via middleware (i.e. the action handler below)
  useEffect(() => {
    sendMessage.current = generateWebSocketActionHandler(sendWebSocketMessage);
  }, [sendWebSocketMessage]);

  // If fetch is required, fetch, then pass to gameState
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(`${API_URL}get-room/${id}`);
        gameStateDispatch({ type: 'fetch_success', data: response.data });
      } catch (error) {
        gameStateDispatch({ type: 'fetch_error' });
      }
    };
    if (gameState.fetchRequired) {
      fetchRoomData();
    }
  }, [gameState.fetchRequired, id]);

  return (
    <WebSocketStateContext.Provider value={webSocketState}>
      <GameStateContext.Provider value={gameState}>
        <GameStateDispatchContext.Provider value={gameStateDispatch}>
          <ActionHandlerContext.Provider value={sendMessage.current}>
            {children}
            <TestDataDisplay data={gameState} />
          </ActionHandlerContext.Provider>
        </GameStateDispatchContext.Provider>
      </GameStateContext.Provider>
    </WebSocketStateContext.Provider>
  );
};

// Deals with WS requests to backend from components
const generateWebSocketActionHandler = (sendWebSocketMessage) => {
  return (action) => {
    console.log('Outgoing action: ' + JSON.stringify(action));
    // Remember, action just says what happened
    switch (action.type) {
      case 'assumptions_submitted': {
        sendWebSocketMessage({
          type: 'assumptions_submitted',
          assumptions: action.assumptions,
        });
        break;
      }
      case 'state_transition': {
        sendWebSocketMessage({
          type: 'state_transition',
          command: action.command,
        });
        break;
      }
      default: {
        throw Error('Unknown outgoing action: ' + action.type);
      }
    }
  };
};

const gameStateReducer = (gameState, action) => {
  console.log('Incoming action: ' + JSON.stringify(action));
  // TODO Handle notifications from the backend (e.g. update gameState by sending a HTTP fetch)
  // Returns a new state (conditional on the action and previous state)

  switch (action.type) {
    case 'state_action': {
      // Don't forget to break or return!
      return gameState;
    }
    case 'websocket_message': {
      return gameState;
    }
    case 'disconnect': {
      return produce(gameState, (draftState) => {
        draftState.meta.connectionRefused = true;
        draftState.meta.disconnectReason = action.data;
      });
    }
    case 'notification': {
      return produce(gameState, (draftState) => {
        draftState.fetchRequired = true;
      });
    }
    case 'fetch_success': {
      return produce(gameState, (draftState) => {
        draftState.roomData = action.data;
        draftState.fetchRequired = false;
      });
    }
    case 'fetch_error': {
      console.log('Error fetching room data');
      return gameState;
      // if (gameState.isConnected) {
      //   throw Error('could not fetch data');
      // }
    }
    default: {
      throw Error('Unknown incoming action: ' + action.type);
    }
  }
};

// TODO Make sure this is filled in properly.
const initGameState = () => {
  return {
    meta: {
      connectionRefused: false,
    },
    roomData: {
      state: GameStage.WAITING,
      users: [],
    },
  };
};

// A cool debug panel, press CTRL+S to hide/show
const TestDataDisplay = (data) => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === 's') {
        setIsHidden((s) => {
          return s ? false : true;
        });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {!isHidden && (
        <pre className="text-sm border-2 mb-5 font-mono fixed top-40 left-5">{JSON.stringify(data, null, 4)}</pre>
      )}
      ;
    </>
  );
};

export default ArgSolve;
