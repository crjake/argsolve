// We can assume roomData is not null as we don't render these otherwise
import { Button, ButtonGroup } from '@chakra-ui/react';

const Waiting = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl border-b-2">Debate Lobby</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['START', 'Start']]} />
      ) : null}
    </div>
  );
};

const AssumptionProposal = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Assumption Proposal</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const AssumptionValidation = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Assumption Validation</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const RuleProposal = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Rule Proposal</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const ReIterationPrompt = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Reiteration Prompt</p>
      {roomData.data.host === username ? (
        <HostControls
          triggerTransition={triggerTransition}
          buttons={[
            ['RESTART', 'Restart'],
            ['END', 'End'],
          ]}
        />
      ) : null}
    </div>
  );
};

const Summary = ({ roomData, username, triggerTransition }) => {
  return (
    <div className="flex flex-col grow mx-auto mt-8 w-1/2 max-w-xl">
      <p className="text-2xl mb-4 border-b-2">Rule Proposal</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

export { Waiting, AssumptionProposal, AssumptionValidation, RuleProposal, ReIterationPrompt, Summary };

const HostControls = ({ triggerTransition, buttons }) => {
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
          triggerTransition(command);
        }}
        key={label}
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
