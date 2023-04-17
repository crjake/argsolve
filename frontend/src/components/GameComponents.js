// We can assume roomData is not null as we don't render these otherwise
import { Button, ButtonGroup } from '@chakra-ui/react';

const Waiting = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl border-b-2">Debate Lobby</p>
      {roomData.payload.host === username ? (
        <HostControls advanceGameState={advanceGameState} buttons={[['START', 'Start']]} />
      ) : null}
    </div>
  );
};

const AssumptionProposal = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Assumption Proposal</p>
      {roomData.payload.host === username ? (
        <HostControls advanceGameState={advanceGameState} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const AssumptionValidation = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Assumption Validation</p>
      {roomData.payload.host === username ? (
        <HostControls advanceGameState={advanceGameState} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const RuleProposal = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Rule Proposal</p>
      {roomData.payload.host === username ? (
        <HostControls advanceGameState={advanceGameState} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const ReIterationPrompt = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Reiteration Prompt</p>
      {roomData.payload.host === username ? (
        <HostControls
          advanceGameState={advanceGameState}
          buttons={[
            ['RESTART', 'Restart'],
            ['END', 'End'],
          ]}
        />
      ) : null}
    </div>
  );
};

const Summary = ({ roomData, username, advanceGameState }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Rule Proposal</p>
      {roomData.payload.host === username ? (
        <HostControls advanceGameState={advanceGameState} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

export { Waiting, AssumptionProposal, AssumptionValidation, RuleProposal, ReIterationPrompt, Summary };

const HostControls = ({ advanceGameState, buttons }) => {
  if (!buttons) {
    return null;
  }

  const desiredButtons = buttons.map(([command, label], index) => {
    return (
      <Button
        className="mb-6"
        size="sm"
        width="250px"
        variant="outline"
        onClick={() => {
          advanceGameState(command);
        }}
      >
        {label}
      </Button>
    );
  });

  return (
    <ButtonGroup variant="outline" spacing="2" className="mt-4 flex justify-between">
      {desiredButtons}
    </ButtonGroup>
  );
};
