import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

import axios from 'axios';
import { API_URL } from '../config';
import { GameState } from '../components/GameLogic';

const Rooms = () => {
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL + 'rooms')
      .then((response) => {
        // console.log(response);
        setRoomData(response.data);
      })
      .catch((error) => {
        console.log(error);
        setRoomData([]);
      });
  }, []);

  let rooms = [];
  roomData.forEach((room) => {
    if (room.state !== GameState.ABANDONED) {
      rooms.push(
        <Tr key={room.id}>
          <Td>{room.topic}</Td>
          <Td>{room.host}</Td>
          <Td isNumeric>TODO</Td>
          <Td className="flex justify-center">
            <Button
              colorScheme="twitter"
              px="16"
              variant="solid"
              width="75%"
              size="sm"
              onClick={() => {
                navigate('/rooms/' + room.id);
              }}
            >
              Join
            </Button>
          </Td>
        </Tr>
      );
    }
  });

  if (rooms.length === 0) {
    rooms = (
      <Tr>
        <Td>There are currently no active debates.</Td>
        <Td></Td>
        <Td></Td>
        <Td></Td>
      </Tr>
    );
  }

  let content;

  if (Object.keys(roomData).length !== 0 && roomData.hasOwnProperty('failure')) {
    content = <p className="text-red-500">{roomData.failure}</p>;
  } else {
    content = (
      <TableContainer className="mt-4">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th textTransform="none">Topic</Th>
              <Th>Host</Th>
              <Th isNumeric>Participants</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {rooms}
            <Tr>
              <Td>
                <Button
                  onClick={() => {
                    navigate('/rooms/create');
                  }}
                  colorScheme="twitter"
                  px="16"
                  variant="solid"
                  width="150px"
                  size="sm"
                >
                  Create
                </Button>
              </Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-[75%] mt-8 grow">
      <p className="text-xl border-b-2">Ongoing Debates</p>
      {content}
    </div>
  );
};

export default Rooms;
