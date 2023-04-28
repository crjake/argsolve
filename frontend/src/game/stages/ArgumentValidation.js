import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { produce } from 'immer';
import { useContext, useReducer, useRef } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { GameState } from '../ArgSolveContext';
import { ArgumentViewPanel } from './components/ArgumentViewPanel';
import GraphView from './components/GraphView';
import { WaitingPill } from './components/NotificationPill';

const ArgumentValidation = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;
  const [state, dispatch] = useReducer(reducer, { isSubmitted: false, arguments: roomData.pending_arguments });
  const { isOpen: isFinaliseOpen, onOpen: onFinaliseOpen, onClose: onFinaliseClose } = useDisclosure();

  if (username !== roomData.host) {
    return (
      <>
        <p className="text-2xl mb-1 border-b-2 mt-2">Argument Validation</p>
        <div className="flex flex-col items-center">
          <div className="mt-4 mb-2 w-full">
            <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[22em] md:h-[30em]" />
          </div>
          <WaitingPill message="Waiting for host to validate arguments..." />
        </div>
      </>
    );
  }

  return (
    <div className="mt-4 mb-4">
      <p className="text-2xl mb-4 border-b-2">Argument Validation</p>
      <div className="flex justify-center flex-wrap">
        <div className="md:w-1/2 w-full">
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
        <div className="md:w-1/2 md:pl-4 w-full mt-4 md:mt-0 mb-4">
          <p className="text-xl mb-2 border-b-2">Aggregate</p>
          <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[18em] md:h-[22em]" />
        </div>
      </div>
    </div>
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
