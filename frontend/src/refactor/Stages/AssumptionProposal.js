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
import { useState, useContext } from 'react';
import { UsernameContext } from '../UsernameContext';

const AssumptionProposal = ({ gameState, sendMessage }) => {
  const [assumptions, setAssumptions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;

  const handleSubmit = () => {
    // TODO Send assumptions to server and notify people?
    // Temporary assumptions somewhere via HTTP POST/UPDATE?
    setIsSubmitted(true);
    sendMessage({
      type: 'state_action',
      data: { state: 'ASSUMPTION_PROPOSAL', action: 'add_assumptions', assumptions: assumptions },
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
  if (roomData.submitted_users.length !== 0) {
    submissions = roomData.submitted_users.map((user, _) => {
      return <div key={user}>{user}</div>;
    });
    submissions.unshift(<div key="title">Submissions</div>);
  }

  return (
    <>
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
      {roomData.host === username && roomData.submitted_users.length === roomData.users.length && (
        <Button
          onClick={() => {
            sendMessage({
              type: 'state_transition',
              command: 'NEXT',
            });
          }}
        >
          Validate Assumptions
        </Button>
      )}
    </>
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

export default AssumptionProposal;
