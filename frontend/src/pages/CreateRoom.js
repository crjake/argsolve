import { Button, ButtonGroup, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import API_URL from '../config';

const CreateRoom = (props) => {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(API_URL + '/create-room', {
        host: props.username,
        topic: proposal,
      });

      if (response.data && response.data.success) {
        console.log(response.data.roomId);
        console.log(response.data.success);
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
    <div className="flex flex-col grow mx-auto mt-8 max-w-lg">
      <p className="text-xl border-b-2">Create a Room</p>
      <form onSubmit={handleSubmit}>
        <InputGroup size="sm" className="mt-4" width="100%">
          <InputLeftAddon children="Initial Proposal" />
          <Input value={proposal} onChange={(event) => setProposal(event.target.value)}></Input>
        </InputGroup>
        <p className="mt-4">TODO: Aggregation method, number of rounds...</p>
        <ButtonGroup variant="outline" spacing="2" className="mt-4 flex justify-between">
          <Button
            onClick={() => {
              navigate('/rooms');
            }}
            className="mb-6"
            size="sm"
            width="250px"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit" className="mb-6" size="sm" width="250px" variant="outline">
            Create
          </Button>
        </ButtonGroup>
      </form>
      {message && <p className="text-red-500">{message}</p>}
    </div>
  );
};

export default CreateRoom;
