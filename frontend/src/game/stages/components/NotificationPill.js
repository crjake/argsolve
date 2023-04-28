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

import React from 'react';
export function WaitingPill({ message, isTruncated }) {
  const messageClassName = isTruncated ? 'text-xs md:text-base truncate' : 'text-xs md:text-base';
  return (
    <div className="flex space-x-3 border-2 rounded-full p-2 mb-2 items-center">
      <Spinner />
      <div className={messageClassName}>{message}</div>
    </div>
  );
}

export function ReadyPill({ message, isTruncated }) {
  const messageClassName = isTruncated ? 'text-xs md:text-base truncate' : 'text-xs md:text-base';
  return (
    <div className="flex space-x-3 border-2 rounded-full p-2 mb-2 items-center">
      <CheckCircleIcon boxSize={5} />
      <div className={messageClassName}>{message}</div>
    </div>
  );
}
