import {
  Waiting,
  AssumptionProposal,
  AssumptionValidation,
  RuleProposal,
  ReIterationPrompt,
  Summary,
} from '../components/GameComponents';
import { GameState } from '../components/GameLogic';

const Test = () => {
  const roomData = {
    data: {
      host: 'ditto',
      topic: 'Cars should be banned?',
      id: '1',
      state: GameState.WAITING,
      users: ['ditto', 'crjake', 'dirtywart'],
    },
  };
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-[75%] max-w-3xl items-center min-w-fit">
      {false ? (
        <pre
          className="text-sm
		   border-2 mb-5 font-mono fixed top-40 left-5"
        >
          {JSON.stringify(roomData, null, 4)}
        </pre>
      ) : null}
      <AssumptionProposal
        roomData={roomData}
        username={'ditto'}
        triggerTransition={(command) => {
          console.log('Attempted to transition using ' + command);
        }}
      />
    </div>
  );
};

export default Test;
