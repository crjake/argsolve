import { Spinner } from '@chakra-ui/react';
import { ActionHandlerContext, GameStage, GameStateContext, WebSocketStateContext } from './GameContext';
import { useContext } from 'react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import Waiting from './stages/Waiting';

const StageMultiplexer = () => {
  const gameState = useContext(GameStateContext);
  const webSocketState = useContext(WebSocketStateContext);
  const sendMessage = useContext(ActionHandlerContext);

  let stageComponent;
  switch (gameState?.roomData?.state) {
    case GameStage.WAITING: {
      stageComponent = <Waiting gameState={gameState} sendMessage={sendMessage} />;
      break;
    }
    case undefined:
      break;
    default: {
      throw Error('Unhandled game stage: ' + gameState.roomData.state);
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
    return <GenericError message={disconnectMessage} />;
  }

  if (!webSocketState.isConnected) {
    if (webSocketState.error !== null) {
      return <GenericError message="Looks like the server is down." />;
    }

    if (webSocketState.closeCode && webSocketState.closeCode !== 1000) {
      return <GenericError message={`Abnormal disconnect from game server (${webSocketState.closeCode})`} />;
    }

    return <ConnectingSpinner />;
  }

  return children;
};

const Frame = ({ children }) => {
  const outerStyling = 'flex grow justify-center';
  const innerStyling = 'flex flex-col w-[75%] max-w-3xl';
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

function GenericError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-xl mb-4">{message}</p>
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

export default StageMultiplexer;
