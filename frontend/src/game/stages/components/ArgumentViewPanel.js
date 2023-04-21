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
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';

import { useRef, useState } from 'react';
export function ArgumentViewPanel({ state, dispatch }) {
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
    <>
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
    </>
  );
}

export const ModifyArgumentModal = ({ state, dispatch, initialValue, isEdit, isOpen, onOpen, onClose }) => {
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

export function Controls({ argumentValue, state, dispatch }) {
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
