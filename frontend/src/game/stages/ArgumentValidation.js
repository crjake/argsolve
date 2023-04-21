// We can assume roomData is not null as we don't render these otherwise
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
import { produce } from 'immer';
import { useContext, useReducer, useState, useRef } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { GameState } from '../ArgSolveContext';

const ArgumentValidation = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;
  const [state, dispatch] = useReducer(reducer, { isSubmitted: false, arguments: roomData.pending_arguments });

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Argument Validation</p>
      <div className="flex justify-center">
        <ArgumentViewPanel state={state} dispatch={dispatch} sendMessage={sendMessage} />
        <div className="w-1/2 p-4">
          <div className="grow h-[24em] border-2">Temporary</div>
        </div>
      </div>
      {state.isSubmitted && roomData.waiting_for.length !== 0 && (
        <div className="mt-6 flex space-x-3 border-2 rounded-full p-2 mb-2">
          <Spinner />
          <div>{'Waiting for others: ' + roomData.waiting_for.join(', ')}</div>
        </div>
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
    case 'arguments_submitted': {
      return produce(state, (draftState) => {
        draftState.isSubmitted = true;
      });
    }
    default:
      throw Error('Unhandled action type: ' + action.type);
  }
};

function ArgumentViewPanel({ state, dispatch, sendMessage }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFinaliseOpen, onOpen: onFinaliseOpen, onClose: onFinaliseClose } = useDisclosure();

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
      <p className="text-xl mb-2 border-b-2">Arguments</p>
      {currentArguments}
      <Button onClick={onOpen} size="sm" width="100%" height="5" isDisabled={state.isSubmitted}>
        <AddIcon boxSize={3} />
      </Button>
      <ModifyArgumentModal
        state={state}
        dispatch={dispatch}
        initialValue={''}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <Button className="mt-2 w-full" onClick={onFinaliseOpen}>
        Finalise Arguments
      </Button>
      <FinaliseConfirmation
        isOpen={isFinaliseOpen}
        onClose={onFinaliseClose}
        state={state}
        dispatch={dispatch}
        sendMessage={sendMessage}
      />
    </div>
  );
}

const ModifyArgumentModal = ({ state, dispatch, initialValue, isEdit, isOpen, onOpen, onClose }) => {
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
      <Modal isOpen={isOpen} closeOnOverlayClick={false} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? 'Edit' : 'Add'} argument</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Textarea value={value} onChange={handleTextareaChange} placeholder="Argument description" size="sm" />
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
  const { isOpen: isModifyOpen, onOpen: onModifyOpen, onClose: onModifyClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  return (
    <div className="flex items-center space-x-1">
      <EditIcon className="hover:cursor-pointer" onClick={onModifyOpen} />
      <ModifyArgumentModal
        state={state}
        dispatch={dispatch}
        initialValue={argumentValue}
        isEdit
        isOpen={isModifyOpen}
        onOpen={onModifyOpen}
        onClose={onModifyClose}
      />
      <DeleteIcon className="hover:cursor-pointer" onClick={onDeleteOpen} />
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        dispatch={dispatch}
        argumentValue={argumentValue}
      />
    </div>
  );
}

function DeleteConfirmation({ isOpen, onClose, dispatch, argumentValue }) {
  const cancelRef = useRef();

  const handleDelete = () => {
    dispatch({
      type: 'deleted_argument',
      value: argumentValue,
    });
    onClose();
  };

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Argument
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

function FinaliseConfirmation({ isOpen, onClose, state, dispatch, sendMessage }) {
  const cancelRef = useRef();

  const handleSubmit = () => {
    // TODO Send validated arguments to backend
    dispatch({
      type: 'validated_arguments',
      arguments: state.arguments,
    });
    sendMessage({
      type: 'state_transition',
      command: 'NEXT',
    });
    onClose();
  };

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Submit Arguments
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSubmit} ml={3}>
                Submit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export { Controls, ArgumentValidation };
