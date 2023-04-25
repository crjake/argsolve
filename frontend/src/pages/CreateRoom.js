import { Button, ButtonGroup, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { API_URL } from '../config';

import { Frame } from '../components/Frame';

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
      <div className="flex flex-col mt-20 items-start w-full md:w-[75%] mx-auto">
        <div className="flex justify-start w-full">
          <p className="text-xl border-b-2 mt-2 w-full">Create a Room</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full" onKeyDown={(event) => event.key != 'Enter'}>
          <InputGroup size={{ base: 'xs', md: 'sm' }} fontSize={{ base: 'xs', md: 'sm' }} className="mt-4" width="100%">
            <InputLeftAddon children="Initial argument" />
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
          <ButtonGroup variant="outline" spacing="2" className="mt-4 flex justify-between w-full">
            <Button
              onClick={() => {
                navigate('/rooms');
              }}
              className="mb-6"
              size={{ base: 'xs', md: 'sm' }}
              width="lg"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit" className="mb-6" size={{ base: 'xs', md: 'sm' }} width="lg" variant="outline">
              Create
            </Button>
          </ButtonGroup>
        </form>
        {message && <p className="text-red-500">{message}</p>}
      </div>
    </Frame>
  );
};

export default CreateRoom;
