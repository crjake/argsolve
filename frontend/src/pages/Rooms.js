import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

import axios from 'axios';
import { API_URL, WEBSOCKET_URL } from '../config';
import { GameState } from '../game/ArgSolveContext';

import useWebSocket from '../game/WebSocket';

const Rooms = () => {
  return <DesktopRoom />;
  //   const isMobile = useMediaQuery({ query: '(max-width: 760px)' });
  //   const [webSocketState, sendMessage] = useWebSocket(`${WEBSOCKET_URL}lobby`);

  //   if (isMobile) {
  //     return <MobileRoom />;
  //   } else {
  //     return <DesktopRoom />;
  //   }
};

const MobileRoom = () => {};

const DesktopRoom = () => {
  const navigate = useNavigate();

  const [state, sendWebSocketMessage] = useWebSocket(WEBSOCKET_URL + 'lobby');
  const [fetchRequired, setFetchRequired] = useState(true);

  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    console.log('Received message', state.message);
    if (state.message?.type === 'fetch_required') {
      setFetchRequired(true);
    }
  }, [state.message]);

  useEffect(() => {
    if (fetchRequired) {
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
      setFetchRequired(false);
    }
  }, [fetchRequired]);

  let rooms = [];
  roomData.forEach((room) => {
    if (room.state !== GameState.ABANDONED) {
      rooms.push(
        <Tr key={room.id}>
          <Td>{room.topic}</Td>
          <Td>{room.host}</Td>
          <Td isNumeric>{room.users.length}</Td>
          <Td>{room.state}</Td>
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
              isDisabled={room.state !== GameState.WAITING}
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
        <Table variant="striped" size="md">
          <Thead>
            <Tr>
              <Th textTransform="none">Topic</Th>
              <Th>Host</Th>
              <Th isNumeric>Participants</Th>
              <Th>State</Th>
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
              <Td></Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-[75%] mt-8 grow">
      <p className="text-xl border-b-2">Ongoing Debates</p>
      {content}
      <p className="text-xl border-b-2 mt-8">Tools</p>
      <Button
        onClick={() => {
          navigate('/framework-creator');
        }}
        className="w-[200px] mt-2"
      >
        Framework Creator
      </Button>
    </div>
  );
};

export default Rooms;
