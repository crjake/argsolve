import { useContext, useEffect } from 'react';
import UsernameContext from '../../components/UsernameContext';
import GraphView from './components/GraphView';

import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <p className="text-2xl mb-4 border-b-2 mt-4">Results</p>
      <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[20em] md:h-[28em]" />
      <div className="flex items-center space-x-2 justify-start py-3">
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
    </div>
  );
};

export default ReIterationPrompt;
