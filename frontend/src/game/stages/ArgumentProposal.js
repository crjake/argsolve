import { WaitingPill, ReadyPill } from './components/NotificationPill';
// We can assume roomData is not null as we don't render these otherwise
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
import { CheckCircleIcon } from '@chakra-ui/icons';
import { produce } from 'immer';
import { useContext, useReducer, useRef } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { GameState } from '../ArgSolveContext';
import { ArgumentViewPanel } from './components/ArgumentViewPanel';
import GraphView from './components/GraphView';

const ArgumentProposal = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const roomData = gameState.roomData;
  const [state, dispatch] = useReducer(reducer, { isSubmitted: false, arguments: [] });
  const { isOpen: isFinaliseOpen, onOpen: onFinaliseOpen, onClose: onFinaliseClose } = useDisclosure();

  return (
    <div className="mt-4 mb-4">
      <p className="flex flex-col text-2xl mb-4 border-b-2">Argument Proposal</p>
      <div className="flex justify-center flex-wrap mb-2">
        <div className="md:w-1/2 w-full">
          <ArgumentViewPanel state={state} dispatch={dispatch} sendMessage={sendMessage} />
          <Button className="mt-4" onClick={onFinaliseOpen} isDisabled={state.isSubmitted}>
            <div className="text-xs md:text-base">Submit</div>
          </Button>
          <FinaliseConfirmation
            isOpen={isFinaliseOpen}
            onClose={onFinaliseClose}
            state={state}
            dispatch={dispatch}
            sendMessage={sendMessage}
          />
        </div>
        <div className="md:w-1/2 md:pl-4 w-full mt-4 md:mt-0">
          <p className="text-xl mb-2 border-b-2">Aggregate</p>
          <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[22em]" />
        </div>
      </div>
      {state.isSubmitted && roomData.waiting_for.length !== 0 && (
        <WaitingPill message={'Waiting for others: ' + roomData.waiting_for.join(', ')} isTruncated />
      )}
      {state.isSubmitted && roomData.waiting_for.length === 0 && username !== roomData.host && (
        <WaitingPill message={'Waiting for the host to continue the debate...'} />
      )}
      {state.isSubmitted && roomData.waiting_for.length === 0 && username === roomData.host && (
        <ReadyPill message={'All participants have submitted their proposals.'} />
      )}
      {roomData.host === username && roomData.waiting_for.length === 0 && (
        <Button
          colorScheme="green"
          className="w-full"
          onClick={() => {
            sendMessage({
              type: 'state_transition',
              command: 'NEXT',
            });
          }}
        >
          Validate Arguments
        </Button>
      )}
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

  const handleArgumentSubmission = () => {
    dispatch({
      type: 'arguments_submitted',
    });
    sendMessage({
      type: 'state_action',
      state: GameState.ARGUMENT_PROPOSAL,
      action: {
        type: 'added_arguments',
        arguments: state.arguments,
      },
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
              <Button colorScheme="green" onClick={handleArgumentSubmission} ml={3}>
                Submit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default ArgumentProposal;
