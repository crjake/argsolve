import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { produce } from 'immer';
import { useContext, useReducer, useRef } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { ArgumentViewPanel } from './components/ArgumentViewPanel';
import { GameState } from '../ArgSolveContext';
import GraphView from './components/GraphView';

const ArgumentValidation = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;
  const [state, dispatch] = useReducer(reducer, { isSubmitted: false, arguments: roomData.pending_arguments });
  const { isOpen: isFinaliseOpen, onOpen: onFinaliseOpen, onClose: onFinaliseClose } = useDisclosure();

  if (username !== roomData.host) {
    return (
      <>
        <p className="text-2xl mb-4 border-b-2 mt-4">Argument Validation</p>
        <div className="flex flex-col items-center">
          <div className="mt-6 flex space-x-3 border-2 rounded-full p-2 mb-2 w-1/2">
            <Spinner />
            <div>Waiting for the host to validate arguments</div>
          </div>
          <div className="w-[500px] h-[500px] border-2 mt-4">
            <GraphView />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Argument Validation</p>
      <div className="flex justify-center">
        <div className="w-1/2">
          <ArgumentViewPanel state={state} dispatch={dispatch} sendMessage={sendMessage} />
          <Button className="mt-2 w-full" onClick={onFinaliseOpen} isDisabled={state.isSubmitted}>
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

function FinaliseConfirmation({ isOpen, onClose, state, dispatch, sendMessage }) {
  const cancelRef = useRef();

  const handleSubmit = () => {
    dispatch({
      type: 'arguments_submitted',
    });
    sendMessage({
      type: 'state_action',
      state: GameState.ARGUMENT_VALIDATION,
      action: {
        type: 'validated_arguments',
        validated_arguments: state.arguments,
      },
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

export default ArgumentValidation;
