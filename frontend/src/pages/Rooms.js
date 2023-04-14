import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

import axios from 'axios';
import API_URL from '../config';

const Rooms = () => {
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL + '/rooms')
      .then((response) => {
        console.log(response);
        setRoomData(response.data);
      })
      .catch((error) => {
        console.log(error);
        setRoomData({
          failure: 'Request failed, is the backend down?',
        });
      });
  }, []);

  let rooms =
    roomData.length === 0 ? (
      <Tr>
        <Td>There are currently no active debates.</Td>
        <Td></Td>
        <Td></Td>
        <Td></Td>
      </Tr>
    ) : (
      roomData.map((room) => (
        <Tr key={room.id + room.topic}>
          <Td>{room.topic}</Td>
          <Td>{room.host}</Td>
          <Td isNumeric>TODO</Td>
          <Td className="flex justify-center">
            <Button colorScheme="blue" px="16" variant="outline" width="75%" size="sm">
              Join
            </Button>
          </Td>
        </Tr>
      ))
    );

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
                  colorScheme="blue"
                  px="16"
                  variant="outline"
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
    <div className="flex flex-col w-1/2 grow mx-auto mt-8">
      <p className="text-xl border-b-2">Ongoing Debates</p>
      {content}
    </div>
  );
};

export default Rooms;
