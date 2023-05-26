import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Button,
  Radio,
  RadioGroup,
  useCheckbox,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react';
import { produce } from 'immer';
import { useContext, useState, useEffect } from 'react';
import UsernameContext from '../../components/UsernameContext';
import { GameState } from '../ArgSolveContext';
import { WaitingPill } from './components/NotificationPill';
import GraphView from './components/GraphView';

const ProcedureSelection = ({ gameState, sendMessage }) => {
  const username = useContext(UsernameContext);

  const [procedure, setProcedure] = useState('quota');

  const [previewed, setPreviewed] = useState(false);

  useEffect(() => {
    sendMessage({
      type: 'fetch_aggregated_framework',
    });
  }, [gameState.fetchAggregatedRequired]);

  if (gameState.roomData.host !== username) {
    return (
      <div className="">
        <p className="text-2xl mb-4 border-b-2 mt-4">Aggregation Procedure Selection</p>
        <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[20em] md:h-[28em]" />
        <div className="mt-4">
          <WaitingPill message="Waiting for host to select aggregation procedure"></WaitingPill>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <p className="text-2xl mb-4 border-b-2 mt-4">Aggregation Procedure Selection</p>
      <div className="mb-2">
        <GraphView gameState={gameState} sendMessage={sendMessage} graphHeight="h-[20em] md:h-[28em]" />
      </div>
      <RadioGroup onChange={setProcedure} value={procedure}>
        <div className="flex items-center space-x-2 p-1.5 border-2 px-4 rounded">
          <div className="flex items-center">Procedure:</div>
          <Radio value="quota">
            <div className="flex items-center">Quota</div>
          </Radio>
          <Radio value="oligarchy">
            <div className="flex items-center">Oligarchy</div>
          </Radio>
        </div>
      </RadioGroup>
      {procedure === 'quota' && (
        <QuotaSelection gameState={gameState} sendMessage={sendMessage} setPreviewed={setPreviewed} />
      )}
      {procedure === 'oligarchy' && (
        <OligarchySelection gameState={gameState} sendMessage={sendMessage} setPreviewed={setPreviewed} />
      )}
      <div className="w-full flex justify-center">
        <Button
          className="mt-4"
          width={200}
          onClick={() => {
            sendMessage({
              type: 'state_transition',
              command: 'NEXT',
            });
          }}
          isDisabled={!previewed}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

const QuotaSelection = ({ gameState, sendMessage, setPreviewed }) => {
  const minQuota = 1;
  const maxQuota = gameState.roomData.users.length;
  const listOfQuotaValues = Array.from({ length: maxQuota }, (_, i) => i + 1);

  const labelStyles = {
    mt: '3',
    ml: '-1',
    fontSize: 'md',
  };

  const [sliderValue, setSliderValue] = useState(minQuota);

  const handleSubmit = () => {
    sendMessage({
      type: 'state_action',
      state: GameState.PROCEDURE_SELECTION,
      action: {
        type: 'set_quota',
        quota: sliderValue,
      },
    });
    setPreviewed(true);
  };

  return (
    <div className="flex justify-center pt-4">
      <Stack
        spacing={1}
        direction="column"
        w={{ sm: '100%', md: '75%' }}
        h="full"
        border="2px"
        p="10px"
        borderColor="gray.200"
        borderRadius="0"
      >
        <p className="text-lg border-b-2 w-full">Set Quota</p>
        <div className="w-full h-full px-4 py-4 flex space-x-4">
          <span>Quota:</span>
          <Slider
            defaultValue={minQuota}
            min={minQuota}
            max={maxQuota}
            step={1}
            onChangeEnd={(value) => {
              setSliderValue(value);
            }}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            {listOfQuotaValues.map((currentQuotaValue) => {
              return (
                <SliderMark key={currentQuotaValue} value={currentQuotaValue} {...labelStyles}>
                  {currentQuotaValue}
                </SliderMark>
              );
            })}
            <SliderThumb boxSize={4} />
          </Slider>
        </div>
        <Button onClick={handleSubmit}>Preview</Button>
      </Stack>
    </div>
  );
};

const OligarchySelection = ({ gameState, sendMessage, setPreviewed }) => {
  const initialiseSelectedUsers = () => {
    const users = gameState.roomData.users;
    const state = {};
    users.forEach((user) => {
      state[user] = false;
    });
    return state;
  };

  const handleSubmission = () => {
    sendMessage({
      type: 'state_action',
      state: GameState.PROCEDURE_SELECTION,
      action: {
        type: 'set_veto_powers',
        selectedUsers: selectedUsers,
      },
    });
    setPreviewed(true);
  };

  const [selectedUsers, setSelectedUsers] = useState(initialiseSelectedUsers());
  return (
    <div className="flex pt-4 justify-center">
      <Stack
        spacing={1}
        direction="column"
        w={{ sm: '100%', md: '50%' }}
        border="2px"
        p="10px"
        borderColor="gray.200"
        borderRadius="0"
      >
        <CheckboxGroup colorScheme="blue">
          <p className="text-lg border-b-2">Assign Veto Powers</p>
          {gameState.roomData.users.map((user) => {
            return (
              <Checkbox
                key={user}
                value={user}
                onChange={(e) => {
                  setSelectedUsers(
                    produce(selectedUsers, (draftState) => {
                      draftState[user] = e.target.checked;
                    })
                  );
                }}
                className="w-full truncate ..."
              >
                {user}
              </Checkbox>
            );
          })}
          <Button onClick={handleSubmission}>Preview</Button>
        </CheckboxGroup>
      </Stack>
    </div>
  );
};

export default ProcedureSelection;
