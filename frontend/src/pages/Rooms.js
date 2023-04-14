import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUsername } from "../components/Utils";

import { Button, ButtonGroup } from "@chakra-ui/react";
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer } from "@chakra-ui/react";

import API_URL from "../config";
import axios from "axios";

const Rooms = () => {
	const navigate = useNavigate();
	const username = useUsername();

	const [roomData, setRoomData] = useState([]);

	useEffect(() => {
		if (username === null) {
			navigate("/");
		}
	}, [navigate, username]);

	useEffect(() => {
		axios
			.get(API_URL + "/rooms")
			.then((response) => {
				setRoomData(JSON.parse(response.data));
			})
			.catch((error) => {
				console.log("ERROR")
				setRoomData({
					failure: "Request failed, is the backend down?",
				});
			});
	}, []);

	let content;

	if (Object.keys(roomData).length !== 0 && roomData.hasOwnProperty("failure")) {
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
						{Object.keys(roomData).length === 0 ? (
							<Tr>
								<Td>There are currently no active debates.</Td>
								<Td></Td>
								<Td></Td>
								<Td></Td>
							</Tr>
						) : Object.keys(roomData).forEach((key) => {
							// put the key in the button
							const room = roomData[key];
							return (
								<Tr>
									<Td>{room.topic}</Td>
									<Td>{room.host}</Td>
									<Td isNumeric>3</Td>
									<Td>
										<Button colorScheme="blue" px="16" variant="outline" width="150px">
											Join
										</Button>
									</Td>
								</Tr>
							);
						})}
						<Tr>
							<Td>
								<Button onClick={() => {navigate("/rooms/create")}} colorScheme="blue" px="16" variant="outline" width="150px">
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
