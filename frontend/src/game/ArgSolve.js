import { useContext, useEffect, useReducer, useRef, useState } from 'react';

import { produce } from 'immer';

import { useParams } from 'react-router-dom';
import { API_URL, WEBSOCKET_URL } from '../config';
import {
  GameState,
  GameContext,
  GameStateDispatchContext,
  ActionHandlerContext,
  WebSocketStateContext,
} from './ArgSolveContext';
import UsernameContext from '../components/UsernameContext';
import useWebSocket from './WebSocket';
import StageMultiplexer from './StageMultiplexer';
import axios from 'axios';
import { TestDataDisplay } from './TestEnvironment';

const ArgSolve = () => {
  const { id } = useParams();
  const username = useContext(UsernameContext);

  return (
    <GameContextWrapper username={username} id={id}>
      <StageMultiplexer />
    </GameContextWrapper>
  );
};

// TODO Make sure this is filled in properly.
const initGameState = () => {
  return {
    connection: {
      connectionRefused: false,
      shutdown: false,
    },
    roomData: {
      state: GameState.WAITING,
      users: [],
    },
  };
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
      console.log('attempt to fetch');
      try {
        const response = await axios.get(`${API_URL}get-room/${id}`);
        gameStateDispatch({ type: 'fetch_success', data: response.data });
      } catch (error) {
        gameStateDispatch({ type: 'fetch_error' });
      }
    };
    fetchRoomData();
    // if (gameState.fetchRequired) {
    //   fetchRoomData();
    // }
  }, [gameState.fetchRequired, id]);

  return (
    <WebSocketStateContext.Provider value={webSocketState}>
      <GameContext.Provider value={gameState}>
        <GameStateDispatchContext.Provider value={gameStateDispatch}>
          <ActionHandlerContext.Provider value={sendMessage.current}>
            {children}
            <TestDataDisplay data={gameState} />
          </ActionHandlerContext.Provider>
        </GameStateDispatchContext.Provider>
      </GameContext.Provider>
    </WebSocketStateContext.Provider>
  );
};

// Deals with WS requests to backend from components
const generateWebSocketActionHandler = (sendWebSocketMessage) => {
  return (action) => {
    console.log('Outgoing action: ' + JSON.stringify(action));
    switch (action.type) {
      case 'state_action': {
        sendWebSocketMessage(action);
        break;
      }
      case 'state_transition': {
        sendWebSocketMessage({
          type: 'state_transition',
          command: action.command,
        });
        break;
      }
      case 'fetch_aggregated_framework': {
        sendWebSocketMessage({
          type: 'fetch_aggregated_framework',
        });
        break;
      }
      case 'compute_extensions': {
        sendWebSocketMessage(action);
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

  switch (action.type) {
    case 'state_action': {
      return handleStateAction(gameState, action);
    }
    case 'connection_refused': {
      return produce(gameState, (draftState) => {
        draftState.connection.connectionRefused = true;
        draftState.connection.refusalReason = action.reason;
      });
    }
    case 'shutdown': {
      return produce(gameState, (draftState) => {
        draftState.connection.shutdown = true;
        draftState.connection.shutdownReason = action.reason;
        draftState.connection.perpetrator = action.perpetrator;
      });
    }
    case 'fetch_required': {
      return produce(gameState, (draftState) => {
        draftState.fetchRequired = !draftState.fetchRequired;
        draftState.fetchAggregatedRequired = !draftState.fetchAggregatedRequired; //hacky way to trigger aggregated fetch
      });
    }
    case 'fetch_success': {
      return produce(gameState, (draftState) => {
        draftState.roomData = action.data;
        // draftState.fetchRequired = false;
      });
    }
    case 'fetch_error': {
      console.log('Error fetching room data, we might be out of sync...');
      return gameState;
    }
    case 'fetched_aggregated_framework': {
      return produce(gameState, (draftState) => {
        draftState.aggregated_framework = JSON.parse(action.aggregated_framework);
      });
    }
    case 'computed_extensions': {
      return produce(gameState, (draftState) => {
        draftState.extensions = action.extensions;
      });
    }
    default: {
      throw Error('Unknown incoming action: ' + action.type);
    }
  }
};

const handleStateAction = (gameState, action) => {
  switch (action.state) {
    default:
      throw Error('Unknown incoming state action state: ' + action.state);
  }
};

export default ArgSolve;
