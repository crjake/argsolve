import { useContext, useState } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';

import { CheckCircleIcon } from '@chakra-ui/icons';
import { Button, Spinner } from '@chakra-ui/react';

const RuleProposal = ({ gameState, sendMessage }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const username = useContext(UsernameContext);

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Relation Proposal</p>
      <div className="w-full h-[24em] md:h-[36em]">
        <GraphView gameState={gameState} sendMessage={sendMessage} setIsWaiting={setIsWaiting} isEditable />
        {isWaiting && gameState.roomData.waiting_for.length !== 0 && (
          <div className="mt-6 flex space-x-3 border-2 rounded-full p-2 mb-2 items-center">
            <Spinner />
            <div className="text-xs md:text-base truncate">
              {'Waiting for: ' + gameState.roomData.waiting_for.join(', ')}
            </div>
          </div>
        )}
        {isWaiting && gameState.roomData.waiting_for.length === 0 && username !== gameState.roomData.host && (
          <div className="mt-6 flex space-x-3 border-2 rounded-full p-2 mb-2 items-center">
            <Spinner />
            <div className="text-[10px] md:text-base">{'Waiting for the host to continue the debate...'}</div>
          </div>
        )}
        {isWaiting && gameState.roomData.waiting_for.length === 0 && username === gameState.roomData.host && (
          <div className="mt-6 flex space-x-2 border-2 rounded-full p-2 mb-2 items-center">
            <CheckCircleIcon boxSize={5} />
            <div className="text-xs">All participants have submitted their proposals.</div>
          </div>
        )}
        {gameState.roomData.host === username && gameState.roomData.waiting_for.length === 0 && (
          <Button
            colorScheme="green"
            width="200px"
            className="mb-2"
            onClick={() => {
              sendMessage({
                type: 'state_transition',
                command: 'NEXT',
              });
            }}
          >
            Next
          </Button>
        )}
      </div>
    </>
  );
};

export default RuleProposal;
