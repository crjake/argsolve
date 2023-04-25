import { Button, ButtonGroup, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { API_URL } from '../config';

const CreateRoom = (props) => {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(API_URL + 'create-room', {
        host: props.username,
        topic: proposal,
      });

      if (response.data && response.data.success) {
        navigate('/rooms/' + response.data.roomId);
      }
    } catch (error) {
      if (error.response.data && error.response.data.failure) {
        setMessage(error.response.data.failure);
      } else {
        setMessage('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <Frame>
      <p className="text-xl border-b-2 mt-2">Create a Room</p>
      <form onSubmit={handleSubmit} onKeyDown={(event) => event.key != 'Enter'}>
        <InputGroup size={{ base: 'xs', md: 'sm' }} fontSize={{ base: 'xs', md: 'sm' }} className="mt-4" width="100%">
          <InputLeftAddon children="Initial Proposal" />
          <Input
            value={proposal}
            onChange={(event) => setProposal(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
          ></Input>
        </InputGroup>
        {/* <p className="mt-4">TODO: Aggregation method, number of rounds...</p> */}
        <ButtonGroup variant="outline" spacing="1" className="mt-4 flex justify-start w-full">
          <Button
            onClick={() => {
              navigate('/rooms');
            }}
            className="mb-6"
            size={{ base: 'xs', md: 'sm' }}
            width="250px"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit" className="mb-6" size={{ base: 'xs', md: 'sm' }} width="250px" variant="outline">
            Create
          </Button>
        </ButtonGroup>
      </form>
      {message && <p className="text-red-500">{message}</p>}
    </Frame>
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

export default CreateRoom;
