import { useContext } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';

import { Button } from '@chakra-ui/react';
import { WaitingPill } from './components/NotificationPill';

const ReIterationPrompt = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);

  return (
    <div className="mt-2 mb-2">
      <p className="text-2xl mb-4 border-b-2">Aggregated Framework</p>
      <div className="w-full space-y-2">
        <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[20em] md:h-[28em]" />
        {username !== gameState.roomData.host && (
          <WaitingPill message="Waiting for the host to continue the debate..." />
        )}
        {gameState.roomData.host === username && (
          <div className="flex space-x-2">
            <Button
              colorScheme="green"
              width="200px"
              onClick={() => {
                sendMessage({
                  type: 'state_transition',
                  command: 'RESTART',
                });
              }}
            >
              <div className="text-[10px] md:text-base">Perform another iteration</div>
            </Button>
            <Button
              colorScheme="red"
              width="200px"
              onClick={() => {
                sendMessage({
                  type: 'state_transition',
                  command: 'END',
                });
              }}
            >
              <div className="text-[10px] md:text-base">End the debate</div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReIterationPrompt;
