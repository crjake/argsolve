import Waiting from './stages/Waiting';
import ArgumentProposal from './stages/ArgumentProposal';
import ArgumentValidation from './stages/ArgumentValidation';
import ReIterationPrompt from './stages/ReIterationPrompt';
import Summary from './stages/Summary';

import UsernameContext from '../components/UsernameContext';

import { useEffect, useState } from 'react';
import GraphView from './stages/components/GraphView';
import RuleProposal from './stages/RelationProposal';

const TestEnvironment = () => {
  const sendMessage = (message) => {
    console.log(JSON.stringify(message));
  };

  const testUsername = 'crjake';

  const gameState = {
    meta: {
      connectionRefused: false,
    },
    roomData: {
      state: 'WAITING',
      host: 'crjake',
      topic: 'Cars should be banned.',
      users: ['crjake', 'murphy'],
      waiting_for: [],
      pending_arguments: ['A', 'B', 'C', 'D'],
      support_notions: {
        crjake: 'deductive',
      },
    },
    currentUser: testUsername,
    aggregated_framework: elements,
  };

  // username is indeed overriden, the navbar just doesn't reflect that fact
  return (
    <UsernameContext.Provider value={testUsername}>
      <TestDataDisplay data={gameState} />
      <Frame>
        {/* <Waiting gameState={gameState} sendMessage={sendMessage} /> */}
        {/* <ArgumentProposal gameState={gameState} sendMessage={sendMessage} /> */}
        {/* <ArgumentValidation gameState={gameState} sendMessage={sendMessage} /> */}
        {/* <div className="w-full h-[48em]">
          <GraphView gameState={gameState} sendMessage={sendMessage} />
        </div> */}
        {/* <RuleProposal gameState={gameState} sendMessage={sendMessage} /> */}
        {/* <ReIterationPrompt gameState={gameState} sendMessage={sendMessage} /> */}
        <Summary gameState={gameState} sendMessage={sendMessage} />
      </Frame>
    </UsernameContext.Provider>
  );
};

const Frame = ({ children }) => {
  const outerStyling = 'flex grow justify-center';
  const innerStyling = 'flex flex-col w-[75%] max-w-3xl';
  return (
    <div className={outerStyling}>
      <div className={innerStyling}>{children}</div>
    </div>
  );
};

// A cool debug panel, press CTRL+S to hide/show
const TestDataDisplay = (data) => {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === 's') {
        setIsHidden((s) => {
          return s ? false : true;
        });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {!isHidden && (
        <pre className="text-sm border-2 mb-5 font-mono fixed top-40 left-5">{JSON.stringify(data, null, 4)}</pre>
      )}
    </>
  );
};

const elements = JSON.parse(`{
	"nodes":[
		{
			"group": "nodes",
			"data": {
				"id": "Banning cars hurts people with accessibility issues"
			}
		},
		{
			"group": "nodes",
			"data": {
				"id": "Cars pollute the environment"
			}
		},
		{
			"group": "nodes",
			"data": {
				"id": "Cars should be banned"
			}
		}

	],
	"edges":[
		{
			"group": "edges",
			"data": {
				"id": "Banning cars hurts people with accessibility issues_attacks_Cars should be banned",
				"source": "Banning cars hurts people with accessibility issues",
				"target": "Cars should be banned",
				"type": "attack"
			}
		},
		{
			"group": "edges",
			"data": {
				"id": "Cars pollute the environment_supports_Cars should be banned",
				"source": "Cars pollute the environment",
				"target": "Cars should be banned",
				"type": "support"
			}
		}
	]
}`);

export { TestEnvironment, TestDataDisplay };
