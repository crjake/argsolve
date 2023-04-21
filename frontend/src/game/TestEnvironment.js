import Waiting from './stages/Waiting';
import ArgumentProposal from './stages/ArgumentProposal';
import { ArgumentValidation, ModifyArgumentModal } from './stages/ArgumentValidation';
import UsernameContext from '../components/UsernameContext';

import { useEffect, useState } from 'react';

const TestEnvironment = () => {
  const sendMessage = (message) => {
    console.log(JSON.stringify(message));
  };

  const gameState = {
    meta: {
      connectionRefused: false,
    },
    roomData: {
      state: 'WAITING',
      host: 'crjake',
      users: ['crjake'],
      waiting_for: ['crjake'],
      pending_arguments: ['A', 'B', 'C', 'D'],
    },
  };

  // username is indeed overriden, the navbar just doesn't reflect that fact
  return (
    <UsernameContext.Provider value="crjake">
      <TestDataDisplay data={gameState} />
      <Frame>
        {/* <Waiting gameState={gameState} sendMessage={sendMessage} /> */}
        <ArgumentProposal gameState={gameState} sendMessage={sendMessage} />
        <ArgumentValidation gameState={gameState} sendMessage={sendMessage} />
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
      ;
    </>
  );
};

export { TestEnvironment, TestDataDisplay };
