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
    <>
      <p className="text-2xl mb-4 border-b-2 mt-4">Results</p>
      <div className="flex justify-center flex-wrap mb-2">
        <div className="w-full md:w-1/2">
          <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[20em] md:h-[28em]" />
        </div>
        <div className="md:w-1/2 md:pl-4 w-full mt-4 md:mt-0">
          <ComputeExtensions
            gameState={gameState}
            framework={gameState.aggregated_framework}
            sendMessage={sendMessage}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 justify-center border-t-2 py-3">
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

const ComputeExtensions = ({ gameState, framework, sendMessage }) => {
  const extensions = gameState?.extensions;
  const handleCompute = () => {
    sendMessage({
      type: 'compute_extensions',
      framework: framework,
    });
  };
  return (
    <div className="flex flex-col w-full">
      <Button onClick={handleCompute}>Compute Extensions</Button>
      {extensions && <div>{JSON.stringify(extensions, null, 4)}</div>}
    </div>
  );
};

export default ReIterationPrompt;
