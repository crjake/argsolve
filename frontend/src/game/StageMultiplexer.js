import { Spinner } from '@chakra-ui/react';
import { ActionHandlerContext, GameState, GameContext, WebSocketStateContext } from './ArgSolveContext';
import { useContext, useEffect } from 'react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import Waiting from './stages/Waiting';
import ArgumentProposal from './stages/ArgumentProposal';
import ArgumentValidation from './stages/ArgumentValidation';
import RuleProposal from './stages/RelationProposal';
import ReIterationPrompt from './stages/ReIterationPrompt';
import Summary from './stages/Summary';

const StageMultiplexer = () => {
  const gameState = useContext(GameContext);
  const webSocketState = useContext(WebSocketStateContext);
  const sendMessage = useContext(ActionHandlerContext);

  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', unloadCallback);
    return () => window.removeEventListener('beforeunload', unloadCallback);
  }, []);

  let stageComponent;
  switch (gameState?.roomData?.state) {
    case GameState.WAITING: {
      stageComponent = <Waiting gameState={gameState} sendMessage={sendMessage} />;
      break;
    }
    case GameState.ARGUMENT_PROPOSAL: {
      stageComponent = <ArgumentProposal gameState={gameState} sendMessage={sendMessage} />;
      break;
    }
    case GameState.ARGUMENT_VALIDATION:
      stageComponent = <ArgumentValidation gameState={gameState} sendMessage={sendMessage} />;
      break;
    case GameState.RELATION_PROPOSAL:
      stageComponent = <RuleProposal gameState={gameState} sendMessage={sendMessage} />;
      break;
    case GameState.RE_ITERATION_PROMPT:
      stageComponent = <ReIterationPrompt gameState={gameState} sendMessage={sendMessage} />;
      break;
    case GameState.SUMMARY:
      stageComponent = <Summary gameState={gameState} sendMessage={sendMessage} />;
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
  if (gameState.connection.connectionRefused) {
    let disconnectMessage = '';
    switch (gameState.connection.refusalReason) {
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

  if (gameState.connection.shutdown) {
    let shutdownMessage = '';
    switch (gameState.connection.shutdownReason) {
      case 'host_disconnect': {
        shutdownMessage = `${gameState.connection.perpetrator} (host) left the room`;
        break;
      }
      case 'user_disconnect': {
        shutdownMessage = `${gameState.connection.perpetrator} left the room`;
        break;
      }
      case 'bug': {
        shutdownMessage = `The room shutdown unexpectedly`;
        break;
      }
      default:
        throw Error('Unhandled shutdown reason');
    }
    return <GenericError message={shutdownMessage} />;
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
    <div className="flex flex-col items-center mt-8">
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
