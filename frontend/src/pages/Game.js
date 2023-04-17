import cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { API_URL, ROOM_URL } from '../config';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';

import { GameState, useGameMaster } from '../components/GameLogic';
import { Button, ButtonGroup, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';

// If a notification occurs, the gamemaster will trigger a rerender and re-fetch

const Game = ({ username }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advanceGameState, manualFetch, roomData] = useGameMaster(id);

  useEffect(() => {
    if (!/\d+/.test(id)) {
      navigate(-1);
    }
  }, [id, navigate]);

  useEffect(() => {
    manualFetch();
  }, []);

  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    console.log('Trigger fetch');
    if (roomData && roomData.success) {
      setIsHost(roomData.payload.host === username);
    }
  }, [roomData]);

  let buttons = [];

  if (!roomData) {
    return (
      <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
        <p className="text-center text-xl mb-4">Connecting to room...</p>
        <Spinner size="xl"></Spinner>
      </div>
    );
  } else {
    if (roomData && roomData.success) {
      switch (roomData.payload.state) {
        case GameState.WAITING:
          buttons = [['START', 'Start']];
          break;
        case GameState.ASSUMPTION_PROPOSAL:
          buttons = [['NEXT', 'Next']];
          break;
        case GameState.ASSUMPTION_VALIDATION:
          buttons = [['NEXT', 'Next']];
          break;
        case GameState.RULE_PROPOSAL:
          buttons = [['NEXT', 'Next']];
          break;
        case GameState.RE_ITERATION_PROMPT:
          buttons = [
            ['END', 'End'],
            ['RESTART', 'Restart'],
          ];
          break;
        case GameState.SUMMARY:
          // No buttons
          break;
        default:
      }

      return (
        <div className="flex flex-col grow mx-auto mt-8 max-w-lg">
          <p>{JSON.stringify(roomData)}</p>
          <p>{roomData.payload.state}</p>
          <div className="flex flex-col space-y-2 w-1/2 justify-center">
            {buttons.map(([command, label], index) => {
              return (
                <Button
                  key={command}
                  onClick={() => {
                    advanceGameState(command);
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      );
    } else if (roomData.notResponding) {
      return (
        <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
          <p className="text-center text-xl mb-4">Connecting to room...</p>
          <Spinner size="xl"></Spinner>
        </div>
      );
      // return <div className="flex flex-col grow mx-auto mt-8 max-w-lg">Loading...</div>;
    } else if (roomData.badRoomId) {
      return (
        <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
          <p className="text-center text-xl mb-4">This room doesn't exist</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
          <p className="text-center text-xl mb-4">{JSON.stringify(roomData)}</p>
        </div>
      );
    }
  }
};

function Graph() {
  const cy = useRef();

  useEffect(() => {
    cy.current.on('click', 'edge', (event) => {
      const edge = event.target;
      cy.current.remove(edge);
    });
  }, []); // emppty == didMount?

  const elements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
    { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
  ];
  return (
    <div className="flex justify-center">
      <CytoscapeComponent
        elements={elements}
        style={{ width: '600px', height: '600px' }}
        className="border-4"
        cy={(cyInstance) => (cy.current = cyInstance)}
      />
    </div>
  );
}

export default Game;
