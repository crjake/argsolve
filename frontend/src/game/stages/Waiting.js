// We can assume roomData is not null as we don't render these otherwise
import { Button, Spinner, Radio, RadioGroup } from '@chakra-ui/react';
import { useCallback, useContext, useState, useEffect } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { GameState } from '../ArgSolveContext';

const Waiting = ({ gameState, sendMessage }) => {
  const roomData = gameState.roomData;
  const username = useContext(UsernameContext);
  return (
    <div className="mt-5">
      <RoomInfoView username={username} roomData={roomData} sendMessage={sendMessage} />
      <TransitionBar username={username} host={roomData.host} sendMessage={sendMessage} />
    </div>
  );
};

function RoomInfoView({ username, roomData, sendMessage }) {
  const [supportNotion, setSupportNotion] = useState('deductive');

  const participants = roomData.users.map((user, _) => {
    return (
      <div key={user} className="font-normal mt-3 text-xs md:text-lg">
        {roomData.host === username ? user + ' (host)' : user}
      </div>
    );
  });

  const handleSupportNotion = (value) => {
    sendMessage({
      type: 'state_action',
      state: GameState.WAITING,
      action: {
        type: 'changed_support_notion',
        support_notion: value,
      },
    });
    setSupportNotion(value);
  };

  return (
    <>
      <p className="text-2xl border-b-2">Debate Lobby</p>
      <div className="mt-4 flex">
        <div className="w-2/3">
          <div className="md:text-xl sm:text-md border-b-2 w-[90%]">Configuration</div>
          <div className="space-y-2 mt-2">
            <KeyValue keyValue={['Initial Proposal', roomData.topic]} />
            <KeyValue keyValue={['Host', roomData.host]} />
            <KeyValue keyValue={['Aggregation Method', 'Majority']} />
          </div>
          <div className="md:text-xl text-md border-b-2 w-[90%] mt-5">Personal Settings</div>
          <div className="flex w-[90%] mt-3 items-center">
            <RadioGroup onChange={handleSupportNotion} value={supportNotion} className="w-full">
              <div className="flex items-center space-x-2 p-1.5 border-2 px-4 rounded flex-wrap space-y-1 text-xs md:text-base">
                <div>Support notion:</div>
                <Radio value="deductive">
                  <span className="text-xs md:text-base">deductive</span>
                </Radio>
                <Radio value="necessary" className="text-xs md:text-base">
                  <span className="text-xs md:text-base">necessary</span>
                </Radio>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="w-1/3">
          <div className="md:text-xl text-md border-b-2">Participants</div>
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
      <p className="md:text-lg text-sm font-normal itali">{value}</p>
      <p className="md:text-xs text-xs font-light">{key}</p>
    </div>
  );
};

export default Waiting;
