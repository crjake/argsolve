// We can assume roomData is not null as we don't render these otherwise
import { Button, ButtonGroup } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useDisclosure, Textarea } from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { GameState, useGameState } from '../components/GameLogic';

const container = 'flex flex-col grow mt-8 w-full';

const KeyValue = ({ keyValue }) => {
  const [key, value] = keyValue;
  return (
    <div>
      <p className="text-lg font-normal itali">{value}</p>
      <p className="text-xs font-light">{key}</p>
    </div>
  );
};

const Waiting = ({ roomData, username, triggerTransition }) => {
  return (
    <div className={container}>
      <p className="text-2xl border-b-2">Debate Lobby</p>
      <div className="mt-4 flex">
        <div className="w-2/3">
          <div className="text-xl border-b-2 w-[90%]">Configuration</div>
          <div className="space-y-2 mt-2">
            <KeyValue keyValue={['Initial Proposal', roomData.topic]} />
            <KeyValue keyValue={['Host', roomData.host]} />
            <KeyValue keyValue={['Aggregation Method', 'Majority']} />
          </div>
        </div>
        <div className="w-1/3">
          <div className="text-xl border-b-2">Participants</div>
          {roomData.users.map((user, _) => {
            return (
              <div key={user} className="font-normal mt-3">
                {roomData.host === user ? user + ' (host)' : user}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t-2 mt-4">
        {roomData.host === username ? (
          <div className="flex justify-center items-center">
            <Button
              className="mt-3"
              colorScheme="green"
              width="50%"
              onClick={() => {
                triggerTransition('START');
              }}
            >
              Start
            </Button>
          </div>
        ) : (
          // <HostControls triggerTransition={triggerTransition} buttons={[['START', 'Start']]} />
          <div className="mt-6 flex space-x-3 border-2 rounded-full p-2">
            <Spinner />
            <div>Waiting for the host to start</div>
          </div>
        )}
      </div>
    </div>
  );
};

const AssumptionProposal = ({ roomData, username, triggerTransition, sendWebSocketMessage, gameData }) => {
  const [assumptions, setAssumptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO Send assumptions to server and notify people?
    // Temporary assumptions somewhere via HTTP POST/UPDATE?
    setIsSubmitted(true);
    sendWebSocketMessage({
      type: 'state_action',
      data: { state: GameState.ASSUMPTION_PROPOSAL, action: 'add_assumptions', assumptions: assumptions },
    });
  };

  const controls = (
    <div className="flex items-center space-x-1">
      <EditIcon
        className="hover:cursor-pointer"
        onClick={() => {
          console.log('Edit');
        }}
      />
      <DeleteIcon
        className="hover:cursor-pointer"
        onClick={() => {
          console.log('Delete');
        }}
      />
    </div>
  );

  let submissions;
  if (roomData.data.submitted_users.length !== 0) {
    submissions = roomData.data.submitted_users.map((user, _) => {
      return <div key={user}>{user}</div>;
    });
    submissions.unshift(<div key="title">Submissions</div>);
  }

  return (
    <div className={container}>
      <p className="text-2xl mb-4 border-b-2">Assumption Proposal</p>
      <div className="flex justify-center">
        <div className="w-1/2">
          <p className="text-xl mb-2 border-b-2">Assumptions</p>
          {assumptions.map((value) => {
            return (
              <div key={value} className="flex justify-between w-full">
                <div className="font-light truncate w-full max-w-lg">{value}</div>
                {!isSubmitted && controls}
              </div>
            );
          })}
          <AddAssumptionModal assumptions={assumptions} setAssumptions={setAssumptions} isSubmitted={isSubmitted} />
          <Button className="mt-4" onClick={handleSubmit} isDisabled={isSubmitted}>
            Submit
          </Button>
        </div>
        <div className="w-1/2 p-4">
          {/* <div className="w-48 h-48 border-2"></div> */}
          <div className="grow h-[24em] border-2"></div>
        </div>
      </div>
      {isSubmitted && (
        <div className="mt-6 flex space-x-3 border-2 rounded-full p-2 mb-2">
          <Spinner />
          <div>Waiting for others</div>
        </div>
      )}
      {submissions}
      {roomData.data.host === username && roomData.data.submitted_users.length === roomData.data.users.length && (
        <Button
          onClick={() => {
            triggerTransition('NEXT');
          }}
        >
          Validate Assumptions
        </Button>
      )}
    </div>
  );
};

const AddAssumptionModal = ({ assumptions, setAssumptions, isSubmitted }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState('');

  const handleTextareaChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = () => {
    setAssumptions([...assumptions, value]);
    setValue('');
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} size="sm" width="100%" height="5" isDisabled={isSubmitted}>
        <AddIcon boxSize={3} />
      </Button>

      <Modal isOpen={isOpen} closeOnOverlayClick={false} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Assumption</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Textarea value={value} onChange={handleTextareaChange} placeholder="Assumption description" size="sm" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const AssumptionValidation = ({ roomData, username, triggerTransition }) => {
  return (
    <div className={container}>
      <p className="text-2xl mb-4 border-b-2">Assumption Validation</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const RuleProposal = ({ roomData, username, triggerTransition }) => {
  return (
    <div className={container}>
      <p className="text-2xl mb-4 border-b-2">Rule Proposal</p>
      {roomData.data.host === username ? (
        <HostControls triggerTransition={triggerTransition} buttons={[['NEXT', 'Next']]} />
      ) : null}
    </div>
  );
};

const ReIterationPrompt = ({ roomData, username, triggerTransition }) => {
  return (
    <div className={container}>
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
    <div className={container}>
      <p className="text-2xl mb-4 border-b-2">Summary</p>
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
