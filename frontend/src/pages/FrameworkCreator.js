import { Frame } from '../components/Frame';
import PlaygroundGraphView from '../components/PlaygroundGraphView';
import { ArgumentViewPanel } from '../game/stages/components/ArgumentViewPanel';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { produce } from 'immer';
import { WEBSOCKET_URL } from '../config';
import { useNavigate } from 'react-router-dom';

import useWebSocket from '../game/WebSocket';

const FrameworkCreator = () => {
  const [state, sendWebSocketMessage] = useWebSocket(WEBSOCKET_URL + 'compute-extensions');
  const [extensions, setExtensions] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.message) {
      console.log('received', state.message);
      setExtensions(state.message.extensions);
    }
  }, [state.message]);
  return (
    <Frame>
      <Button
        className="mt-4"
        onClick={() => {
          navigate('/rooms');
        }}
      >
        Back
      </Button>
      <p className="text-2xl mb-4 border-b-2 mt-4">Framework Creator</p>
      <div className="w-full mb-2"></div>
      <div className="mb-2 h-full">
        <PlaygroundGraphView isEditable sendMessage={sendWebSocketMessage} extensions={extensions} />
      </div>
    </Frame>
  );
};

export default FrameworkCreator;
