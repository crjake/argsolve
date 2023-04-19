import { useContext, useEffect, useReducer, useRef } from 'react';

import { produce } from 'immer';

import { Spinner } from '@chakra-ui/react';

import { useParams } from 'react-router-dom';
import { WEBSOCKET_URL } from '../config';
import { GameStage, GameStateContext, GameStateDispatchContext, ActionHandlerContext } from './GameContext';
import { UsernameContext } from './UsernameContext';
import useWebSocket from './WebSocket';

const ArgSolve = () => {
  const { id } = useParams();
  const username = useContext(UsernameContext);
  return (
    <GameContextWrapper username={username} id={id}>
      <Frame>
        <div>Hello</div>
      </Frame>
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

  return (
    <GameStateContext.Provider value={gameState}>
      <GameStateDispatchContext.Provider value={gameStateDispatch}>
        <ActionHandlerContext.Provider value={sendMessage.current}>
          {/* {!(webSocketState.isConnected || gameState.meta.connectionRefused) ? <ConnectingSpinner /> : (webSocketState.isConnected && !gameState.meta.connectionRefused ? children : )} */}
          {children}

          {/* {gameState && gameState.meta && !gameState.meta.connectionRefused && 'We good still'} */}
          {/* {!webSocketState.isConnected ? 'not connected' : 'connected'} */}
        </ActionHandlerContext.Provider>
      </GameStateDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

const ConnectingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-xl mb-4">Connecting to room...</p>
      <Spinner size="md"></Spinner>
    </div>
  );
};

// Deals with WS requests to backend from components
const generateWebSocketActionHandler = (sendWebSocketMessage) => {
  return (action) => {
    // Remember, action just says what happened
    switch (action.type) {
      case 'assumptions_submitted': {
        sendWebSocketMessage({
          type: 'assumptions_submitted',
          assumptions: action.assumptions,
        });
        break;
      }
      default: {
        throw Error('Unknown action: ' + action.type);
      }
    }
  };
};

const gameStateReducer = (gameState, action) => {
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
      });
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};

// const handleStateAction = (gameState, stateAction) => {
//   // returns state
//   const nextState = produce(gameState, (draftState) => {
//     // Modify draftState here
//   });
//   return nextState;
// };

// TODO Potentially add initial state
const initGameState = () => {
  return {
    meta: {
      connectionRefused: false,
    },
    state: GameStage.WAITING,
    data: {
      usersInLobby: ['crjake'],
    },
  };
};

const Frame = ({ children }) => {
  const outerStyling = 'flex grow justify-center';
  const innerStyling = 'flex flex-col border-2 w-[75%] max-w-3xl border-2 border-red-500';
  return (
    <div className={outerStyling}>
      <div className={innerStyling}>{children}</div>
    </div>
  );
};

export default ArgSolve;
