import { useContext, useState } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';

import { CheckCircleIcon } from '@chakra-ui/icons';
import { Button, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { produce } from 'immer';

const ReIterationPrompt = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);
  const navigate = useNavigate();

  const download = () => {
    const data = {
      topic: gameState.roomData.topic,
      elements: gameState.aggregated_framework,
      supportNotion: gameState.roomData.support_notions[username],
    };
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link and click it to download the file
    const link = document.createElement('a');
    link.href = url;
    const date = new Date();
    link.download = `${date.toLocaleString()}.json`;
    link.click();

    // Release the URL object
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Results</p>
      <div className="w-full h-[28em] md:h-[36em]">
        <GraphView gameState={gameState} sendMessage={sendMessage} />
      </div>
      <div className="mt-[-2em] md:mt-[-3.5em] flex items-center space-x-2 justify-center border-t-2 py-4">
        <Button onClick={download} className="w-[200px]" colorScheme="blue">
          Export (JSON)
        </Button>
        <Button
          onClick={() => {
            navigate('/rooms');
          }}
          className="w-[200px]"
          colorScheme="red"
        >
          Leave
        </Button>
      </div>
    </>
  );
};

export default ReIterationPrompt;
