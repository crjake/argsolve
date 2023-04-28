import { useContext, useState } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';
import { ReadyPill, WaitingPill } from './components/NotificationPill';

import { Button } from '@chakra-ui/react';

const RuleProposal = ({ gameState, sendMessage }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const username = useContext(UsernameContext);

  return (
    <div className="mt-4 mb-4">
      <p className="text-2xl mb-4 border-b-2">Relation Proposal</p>
      <div className="w-full space-y-2">
        <GraphView
          gameState={gameState}
          sendMessage={sendMessage}
          setIsWaiting={setIsWaiting}
          isEditable
          graphHeight="h-[20em] md:h-[28em]"
        />
        {isWaiting && gameState.roomData.waiting_for.length !== 0 && (
          <WaitingPill message={'Waiting for: ' + gameState.roomData.waiting_for.join(', ')} isTruncated />
        )}
        {isWaiting && gameState.roomData.waiting_for.length === 0 && username !== gameState.roomData.host && (
          <WaitingPill message="Waiting for the host to continue the debate..." />
        )}
        {isWaiting && gameState.roomData.waiting_for.length === 0 && username === gameState.roomData.host && (
          <ReadyPill message="All participants have submitted their proposals." />
        )}
        {gameState.roomData.host === username && gameState.roomData.waiting_for.length === 0 && (
          <Button
            colorScheme="green"
            width="200px"
            className=""
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
    </div>
  );
};

export default RuleProposal;
