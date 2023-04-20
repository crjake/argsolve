// We can assume roomData is not null as we don't render these otherwise
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { useContext, useReducer, useState } from 'react';
import { UsernameContext } from '../UsernameContext';
import { produce } from 'immer';

const AssumptionProposal = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;
  const [state, dispatch] = useReducer(reducer, { isSubmitted: false, arguments: [] });

  let submissions;
  if (roomData.submitted_users.length !== 0) {
    submissions = roomData.submitted_users.map((user, _) => {
      return <div key={user}>{user}</div>;
    });
    submissions.unshift(<div key="title">Submissions</div>);
  }

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Assumption Proposal</p>
      <div className="flex justify-center">
        <AssumptionView state={state} dispatch={dispatch} />
        <div className="w-1/2 p-4">
          <div className="grow h-[24em] border-2">Temporary</div>
        </div>
      </div>
      {state.isSubmitted && (
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

const reducer = (state, action) => {
  switch (action.type) {
    case 'added_argument': {
      return produce(state, (draftState) => {
        draftState.arguments.push(action.value);
      });
    }
    case 'edited_argument': {
      return produce(state, (draftState) => {
        const arr = draftState.arguments;
        const index = arr.indexOf(action.previousValue);
        if (index > -1) {
          arr.splice(index, 1);
        }
        draftState.arguments = arr;
        draftState.arguments.push(action.value);
      });
    }
    case 'deleted_argument': {
      return produce(state, (draftState) => {
        const arr = draftState.arguments;
        const index = arr.indexOf(action.value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        draftState.arguments = arr;
      });
    }
    default:
      throw Error('Unhandled action type: ' + action.type);
  }
};

function AssumptionView({ state, dispatch }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentArguments = state.arguments.map((value) => {
    return (
      <div key={value} className="flex justify-between w-full">
        <div className="font-light truncate w-full max-w-lg">{value}</div>
        {!state.isSubmitted && <Controls argumentValue={value} state={state} dispatch={dispatch} />}
      </div>
    );
  });

  return (
    <div className="w-1/2">
      <p className="text-xl mb-2 border-b-2">Assumptions</p>
      {currentArguments}
      <Button onClick={onOpen} size="sm" width="100%" height="5" isDisabled={state.isSubmitted}>
        <AddIcon boxSize={3} />
      </Button>
      <AssumptionModal
        state={state}
        dispatch={dispatch}
        initialValue={''}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <Button className="mt-4" onClick={null} isDisabled={state.isSubmitted}>
        Submit
      </Button>
    </div>
  );
}

const AssumptionModal = ({ state, dispatch, initialValue, isEdit, isOpen, onOpen, onClose }) => {
  const CHAR_LIMIT = 280;
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  const handleTextareaChange = (e) => {
    if (e.target.value.length <= CHAR_LIMIT) {
      setValue(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (isEdit) {
      if (state.arguments.includes(value) && value !== initialValue) {
        // We've duplicated some other argument
        setError('Argument already exists');
        return;
      }

      dispatch({
        type: 'edited_argument',
        value: value,
        previousValue: initialValue,
      });

      setValue('');
      onClose();
      return;
    }

    if (state.arguments.includes(value)) {
      setError('Argument already exists');
      return;
    }

    dispatch({
      type: 'added_argument',
      value: value,
    });

    setValue('');
    onClose();
    return;
  };

  return (
    <>
      {/* <Button onClick={onOpen} size="sm" width="100%" height="5" isDisabled={state.isSubmitted}>
        <AddIcon boxSize={3} />
      </Button> */}
      <Modal isOpen={isOpen} closeOnOverlayClick={false} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? 'Edit' : 'Add'} Assumption</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Textarea value={value} onChange={handleTextareaChange} placeholder="Assumption description" size="sm" />
            </FormControl>
            <div className="flex justify-between">
              <div className="mt-1 text-xs text-red-500">{error}</div>
              <div className="text-xs mt-1">{Math.max(CHAR_LIMIT - value.length, 0)} characters remaining</div>
            </div>
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

function Controls({ argumentValue, state, dispatch }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div className="flex items-center space-x-1">
      <EditIcon className="hover:cursor-pointer" onClick={onOpen} />
      <AssumptionModal
        state={state}
        dispatch={dispatch}
        initialValue={argumentValue}
        isEdit
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <DeleteIcon
        className="hover:cursor-pointer"
        onClick={() => {
          dispatch({
            type: 'deleted_argument',
            value: argumentValue,
          });
        }}
      />
    </div>
  );
}

export default AssumptionProposal;
