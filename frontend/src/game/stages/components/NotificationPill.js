import { CheckCircleIcon } from '@chakra-ui/icons';
import { Spinner } from '@chakra-ui/react';

import React from 'react';
export function WaitingPill({ message, isTruncated }) {
  const messageClassName = isTruncated ? 'text-xs md:text-base truncate' : 'text-xs md:text-base';
  return (
    <div className="flex space-x-3 border-2 rounded-full p-2 mb-2 items-center w-full">
      <Spinner />
      <div className={messageClassName}>{message}</div>
    </div>
  );
}

export function ReadyPill({ message, isTruncated }) {
  const messageClassName = isTruncated ? 'text-xs md:text-base truncate' : 'text-xs md:text-base';
  return (
    <div className="flex space-x-3 border-2 rounded-full p-2 mb-2 items-center w-full">
      <CheckCircleIcon boxSize={5} />
      <div className={messageClassName}>{message}</div>
    </div>
  );
}
