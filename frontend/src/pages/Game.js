import { Spinner } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@chakra-ui/react';
import { GameState, useGameState } from '../components/GameLogic';

import {
  Waiting,
  AssumptionProposal,
  AssumptionValidation,
  RuleProposal,
  ReIterationPrompt,
  Summary,
} from '../components/GameComponents';

const Game = ({ username }) => {
  // Add warning on reload or leaving page
  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', unloadCallback);
    return () => window.removeEventListener('beforeunload', unloadCallback);
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [sendWebSocketMessage, roomData, isConnected, triggerTransition, disconnectReason] = useGameState(id, username);

  let content;

  if (!isConnected) {
    if (disconnectReason) {
      let disconnectMessage;
      switch (disconnectReason.reason) {
        case 'normal':
          break;
        case 'room not found':
          disconnectMessage = 'Room not found';
          break;
        case 'host_disconnect':
          disconnectMessage = 'Room was abandoned by host (' + disconnectReason.perpetrator + ')';
          break;
        case 'user_disconnect':
          disconnectMessage = 'Room was abandoned by ' + disconnectReason.perpetrator;
          break;
        case 'room in progress':
          disconnectMessage = 'Room already in progress';
          break;
        default:
          console.log('Unknown disconnect reason', disconnectReason);
          disconnectMessage = 'Unknown disconnect reason';
      }
      content = (
        <div className="flex flex-col items-center">
          <p className="text-center text-xl mb-4">{disconnectMessage}</p>
          <Button
            onClick={() => {
              navigate('/rooms');
            }}
          >
            View Rooms
          </Button>
        </div>
      );
    } else {
      // Room is still loading
      content = (
        <div className="flex flex-col items-center justify-center">
          <p className="text-xl mb-4">Connecting to room...</p>
          <Spinner size="md"></Spinner>
        </div>
      );
    }
  } else {
    let gameComponent;
    if (roomData.status === 'success') {
      switch (roomData.data.state) {
        case GameState.WAITING:
          gameComponent = <Waiting username={username} roomData={roomData} triggerTransition={triggerTransition} />;
          break;
        case GameState.ASSUMPTION_PROPOSAL:
          gameComponent = (
            <AssumptionProposal username={username} roomData={roomData} triggerTransition={triggerTransition} />
          );
          break;
        case GameState.ASSUMPTION_VALIDATION:
          gameComponent = (
            <AssumptionValidation username={username} roomData={roomData} triggerTransition={triggerTransition} />
          );
          break;
        case GameState.RULE_PROPOSAL:
          gameComponent = (
            <RuleProposal username={username} roomData={roomData} triggerTransition={triggerTransition} />
          );
          break;
        case GameState.RE_ITERATION_PROMPT:
          gameComponent = (
            <ReIterationPrompt username={username} roomData={roomData} triggerTransition={triggerTransition} />
          );
          break;
        case GameState.SUMMARY:
          gameComponent = <Summary username={username} roomData={roomData} triggerTransition={triggerTransition} />;
          break;
        default:
          console.warn('Unknown game state');
      }
    }
    content = gameComponent;
  }

  return (
    <div className="flex flex-col grow mx-auto mt-8 w-[75%] max-w-3xl items-center">
      {
        <div
          className="text-sm
       border-2 mb-5 font-mono"
        >
          {JSON.stringify(roomData)}
        </div>
      }
      {content}
    </div>
  );
};

// const GameOld = ({ username }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [advanceGameState, isConnected, manualFetch, roomData] = useGameMaster(id, username);

//   // const [isAbandoned, setIsAbandoned] = useState(null);

//   useEffect(() => {
//     if (!/\d+/.test(id)) {
//       navigate(-1);
//     }
//   }, [id, navigate]);

//   useEffect(() => {
//     manualFetch();
//   }, []);

//   // useEffect(() => {
//   //   if (roomData && roomData.success && roomData.payload.state === GameState.ABANDONED) {
//   //     setIsAbandoned(true);
//   //   }
//   // }, [roomData])

//   if (!roomData) {
//     return (
//       <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//         <p className="text-center text-xl mb-4">Connecting to room...</p>
//         <Spinner size="xl"></Spinner>
//       </div>
//     );
//   }

//   if (roomData.success) {
//     switch (roomData.payload.state) {
//       case GameState.WAITING:
//         return <Waiting username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.ASSUMPTION_PROPOSAL:
//         return <AssumptionProposal username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.ASSUMPTION_VALIDATION:
//         return <AssumptionValidation username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.RULE_PROPOSAL:
//         return <RuleProposal username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.RE_ITERATION_PROMPT:
//         return <ReIterationPrompt username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.SUMMARY:
//         return <Summary username={username} roomData={roomData} advanceGameState={advanceGameState} />;
//       case GameState.ABANDONED:
//         return (
//           <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//             <p className="text-center text-xl mb-4">Room was abandoned by host.</p>
//             <Button
//               onClick={() => {
//                 navigate('/rooms');
//               }}
//             >
//               View Rooms
//             </Button>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//             <p className="text-center text-xl mb-4 text-red-500">Room is in unknown state:</p>
//             <p className="text-center text-xl mb-4">{roomData.payload.state}</p>
//           </div>
//         );
//     }
//   }

//   if (roomData.notResponding) {
//     return (
//       <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//         <p className="text-center text-xl mb-4">Connecting to room...</p>
//         <Spinner size="xl"></Spinner>
//       </div>
//     );
//   }

//   if (roomData.badRoomId) {
//     return (
//       <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//         <p className="text-center text-xl mb-4">This room doesn't exist</p>
//         <Button
//           onClick={() => {
//             navigate('/rooms');
//           }}
//         >
//           View Rooms
//         </Button>
//       </div>
//     );
//   }

//   if (!isConnected) {
//     return (
//       <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//         <p className="text-center text-xl mb-4">Room has already started.</p>
//         <Button
//           onClick={() => {
//             navigate('/rooms');
//           }}
//         >
//           View Rooms
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col grow mx-auto mt-8 max-w-lg items-center">
//       <p className="text-center text-xl mb-4 text-red-500">Something happened...</p>
//       <p className="text-center text-xl mb-4">{JSON.stringify(roomData)}</p>
//     </div>
//   );
// };

// function Graph() {
//   const cy = useRef();

//   useEffect(() => {
//     cy.current.on('click', 'edge', (event) => {
//       const edge = event.target;
//       cy.current.remove(edge);
//     });
//   }, []); // emppty == didMount?

//   const elements = [
//     { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
//     { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
//     { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } },
//   ];
//   return (
//     <div className="flex justify-center">
//       <CytoscapeComponent
//         elements={elements}
//         style={{ width: '600px', height: '600px' }}
//         className="border-4"
//         cy={(cyInstance) => (cy.current = cyInstance)}
//       />
//     </div>
//   );
// }

export default Game;
