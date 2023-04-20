// We can assume roomData is not null as we don't render these otherwise
import { Button, Spinner } from '@chakra-ui/react';
import { useCallback, useContext } from 'react';
import { UsernameContext } from '../UsernameContext';

const Waiting = ({ gameState, sendMessage }) => {
  const roomData = gameState.roomData;
  const username = useContext(UsernameContext);
  return (
    <div className="mt-5">
      <RoomInfoView user={username} roomData={roomData} />
      <TransitionBar username={username} host={roomData.host} sendMessage={sendMessage} />
    </div>
  );
};

function RoomInfoView({ username, roomData }) {
  const participants = roomData.users.map((user, _) => {
    return (
      <div key={user} className="font-normal mt-3">
        {roomData.host === username ? user + ' (host)' : user}
      </div>
    );
  });

  return (
    <>
      <p className="text-2xl border-b-2">Debate Lobby</p>
      <div className="mt-4 flex">
        <div className="w-2/3">
          <div className="text-xl border-b-2 w-[90%]">Configuration</div>
          <div className="space-y-2 mt-2">
            <KeyValue keyValue={['Initial Proposal', roomData.topic]} />
            <KeyValue keyValue={['Host', roomData.host]} />
            <KeyValue keyValue={['Aggregation Method', 'Majority']} />
          </div>
        </div>
        <div className="w-1/3">
          <div className="text-xl border-b-2">Participants</div>
          {participants}
        </div>
      </div>
    </>
  );
}

function TransitionBar({ username, host, sendMessage }) {
  const handleOnClick = useCallback(() => {
    sendMessage({
      type: 'state_transition',
      command: 'START',
    });
  }, [sendMessage]);

  let content;
  if (host === username) {
    content = (
      <div className="flex justify-center items-center">
        <Button className="mt-3" colorScheme="green" width="50%" onClick={handleOnClick}>
          Start
        </Button>
      </div>
    );
  } else {
    content = (
      <div className="mt-6 flex space-x-3 border-2 rounded-full p-2">
        <Spinner />
        <div>Waiting for the host to start</div>
      </div>
    );
  }
  return <div className="border-t-2 mt-4">{content}</div>;
}

const KeyValue = ({ keyValue }) => {
  const [key, value] = keyValue;
  return (
    <div>
      <p className="text-lg font-normal itali">{value}</p>
      <p className="text-xs font-light">{key}</p>
    </div>
  );
};

export default Waiting;
