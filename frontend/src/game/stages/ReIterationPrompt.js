import { useContext, useState } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';

import { CheckCircleIcon } from '@chakra-ui/icons';
import { Button, Spinner } from '@chakra-ui/react';

const ReIterationPrompt = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Aggregated Framework</p>
      <div className="w-full h-[36em]">
        <GraphView gameState={gameState} sendMessage={sendMessage} />
        {username !== gameState.roomData.host && (
          <div className="mt-[-3.5em] flex space-x-3 border-2 rounded-full p-2 mb-2">
            <Spinner />
            <div>{'Waiting for the host to continue the debate...'}</div>
          </div>
        )}
        {gameState.roomData.host === username && (
          <div className="mt-[-3.5em] flex space-x-2">
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
              Perform another iteration
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
              End the debate
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ReIterationPrompt;
