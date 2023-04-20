import AssumptionProposal from './stages/AssumptionProposal';
import Waiting from './stages/Waiting';
import UsernameContext from '../components/UsernameContext';

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
      submitted_users: ['crjake'],
    },
  };

  // username is indeed overriden, the navbar just doesn't reflect that fact
  return (
    <UsernameContext.Provider value="crjake">
      <Frame>
        {/* <Waiting gameState={gameState} sendMessage={sendMessage} /> */}
        <AssumptionProposal gameState={gameState} sendMessage={sendMessage} />
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

export default TestEnvironment;
