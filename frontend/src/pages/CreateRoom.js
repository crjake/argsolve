import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUsername } from "../components/Utils";

import { Button, ButtonGroup, Input, InputGroup, InputLeftAddon } from "@chakra-ui/react";

import API_URL from "../config";
import axios from "axios";

const CreateRoom = () => {
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
				console.log("ERROR");
				setRoomData({
					failure: "Request failed, is the backend down?",
				});
			});
	}, []);

	return (
		<div className="flex flex-col grow mx-auto mt-8 max-w-lg">
			<p className="text-xl border-b-2">Create a Room</p>
			<InputGroup size='sm' className="mt-4" width="100%">
			<InputLeftAddon children='Initial Proposal'/>
			<Input placeholder='Initial Propsal / Topic'></Input>
			</InputGroup>
			<ButtonGroup variant="outline" spacing="2" className="mt-4 flex justify-between">
				<Button
					onClick={() => {
						navigate("/rooms");
					}}
					className="mb-6"
					size="sm"
					width="250px"
					variant="outline"
				>
					Cancel
				</Button>
				<Button
					onClick={() => {
						navigate("/rooms");
					}}
					className="mb-6"
					size="sm"
					width="250px"
					variant="outline"
				>
					Create
				</Button>
			</ButtonGroup>
		</div>
	);
};

export default CreateRoom;
