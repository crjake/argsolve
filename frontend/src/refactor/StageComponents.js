import { Spinner } from '@chakra-ui/react';
import { ActionHandlerContext, GameStage, GameStateContext, WebSocketStateContext } from './GameContext';
import { useContext } from 'react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { Waiting } from '../components/GameComponents';
import { UsernameContext } from './UsernameContext';

const StageMultiplexer = () => {
  // Handle connection refusal
  const gameState = useContext(GameStateContext);
  const webSocketState = useContext(WebSocketStateContext);
  const username = useContext(UsernameContext);
  const sendMessage = useContext(ActionHandlerContext);

  const triggerTransition = (command) => {
    sendMessage({ type: 'state_transition', command: command });
  };

  let stageComponent;
  if (gameState.roomData !== null) {
    switch (gameState.roomData.state) {
      case GameStage.WAITING: {
        stageComponent = (
          <Waiting roomData={gameState.roomData} username={username} triggerTransition={triggerTransition} />
        );
        break;
      }
      default:
        throw Error('Unrecognized game stage: ' + gameState.state);
    }
  }

  return (
    <Frame>
      <ConnectionHandler gameState={gameState} webSocketState={webSocketState}>
        {stageComponent}
      </ConnectionHandler>
    </Frame>
  );
};

const ConnectionHandler = ({ gameState, webSocketState, children }) => {
  const navigate = useNavigate();
  if (gameState.meta.connectionRefused) {
    let disconnectMessage = '';
    switch (gameState.meta.disconnectReason) {
      case 'room_not_found': {
        disconnectMessage = 'Room not found';
        break;
      }
      case 'room_in_progress': {
        disconnectMessage = 'Room already in progress';
        break;
      }
      default:
        throw Error('Unhandled disconnect reason');
    }
    return (
      <div className="flex flex-col items-center">
        <p className="text-center text-xl mb-4">{disconnectMessage}</p>
        <Button
          onClick={() => {
            navigate('/rooms');
          }}
        >
          View Rooms
        </Button>
      </div>
    );
  }

  // TODO abstract error template
  if (!webSocketState.isConnected) {
    if (webSocketState.error !== null) {
      return (
        <div className="flex flex-col items-center">
          <p className="text-center text-xl mb-4 text-red-500">Looks like the server is down</p>
          <Button
            onClick={() => {
              navigate('/rooms');
            }}
          >
            View Rooms
          </Button>
        </div>
      );
    }

    if (webSocketState.closedCode && webSocketState.closeCode !== 1000) {
      return (
        <div className="flex flex-col items-center">
          <p className="text-center text-xl mb-4 text-red-500">
            Abnormal disconnect from game server ({webSocketState.closeCode})
          </p>
          <Button
            onClick={() => {
              navigate('/rooms');
            }}
          >
            View Rooms
          </Button>
        </div>
      );
    }

    return <ConnectingSpinner />;
  }

  return children;
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

const ConnectingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-xl mb-4">Connecting to room...</p>
      <Spinner size="lg"></Spinner>
    </div>
  );
};

export { StageMultiplexer };
