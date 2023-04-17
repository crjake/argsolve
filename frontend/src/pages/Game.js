import { Spinner } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@chakra-ui/react';
import { GameState, useGameMaster } from '../components/GameLogic';

import {
  Waiting,
  AssumptionProposal,
  AssumptionValidation,
  RuleProposal,
  ReIterationPrompt,
  Summary,
} from '../components/GameComponents';

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

  // useEffect(() => {
  //   console.log('Trigger fetch');
  //   // if (roomData && roomData.success) {
  //   //   setIsHost(roomData.payload.host === username);
  //   // }
  // }, [roomData]);

  if (!roomData) {
    return (
      <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
        <p className="text-center text-xl mb-4">Connecting to room...</p>
        <Spinner size="xl"></Spinner>
      </div>
    );
  }

  if (roomData.success) {
    switch (roomData.payload.state) {
      case GameState.WAITING:
        return <Waiting username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      case GameState.ASSUMPTION_PROPOSAL:
        return <AssumptionProposal username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      case GameState.ASSUMPTION_VALIDATION:
        return <AssumptionValidation username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      case GameState.RULE_PROPOSAL:
        return <RuleProposal username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      case GameState.RE_ITERATION_PROMPT:
        return <ReIterationPrompt username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      case GameState.SUMMARY:
        return <Summary username={username} roomData={roomData} advanceGameState={advanceGameState} />;
      default:
        return (
          <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
            <p className="text-center text-xl mb-4 text-red-500">Room is in unknown state:</p>
            <p className="text-center text-xl mb-4">{roomData.payload.state}</p>
          </div>
        );
    }
  }

  if (roomData.notResponding) {
    return (
      <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
        <p className="text-center text-xl mb-4">Connecting to room...</p>
        <Spinner size="xl"></Spinner>
      </div>
    );
  }

  if (roomData.badRoomId) {
    return (
      <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
        <p className="text-center text-xl mb-4">This room doesn't exist</p>
        <Button
          onClick={() => {
            navigate('/rooms');
          }}
        >
          View Rooms
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
      <p className="text-center text-xl mb-4 text-red-500">Something happened...</p>
      <p className="text-center text-xl mb-4">{JSON.stringify(roomData)}</p>
    </div>
  );
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
