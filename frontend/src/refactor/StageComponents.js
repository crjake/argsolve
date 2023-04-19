import { Spinner } from '@chakra-ui/react';
import { GameStateContext, WebSocketStateContext } from './GameContext';
import { useContext } from 'react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

const StageMultiplexer = () => {
  // Handle connection refusal
  const gameState = useContext(GameStateContext);
  const webSocketState = useContext(WebSocketStateContext);

  return (
    <Frame>
      <ConnectionHandler gameState={gameState} webSocketState={webSocketState}>
        <div>Hey</div>
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

  if (!webSocketState.isConnected) {
    if (webSocketState.error) {
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
