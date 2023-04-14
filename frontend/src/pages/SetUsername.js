import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import axios from "axios";

const SetUsername = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (sessionStorage.getItem("username") !== null) {
			navigate("/rooms");
		}
	}, [navigate]);

	const handleSubmit = async (event) => {
		event.preventDefault();

		try {
			const response = await axios.post(API_URL + "/create-user", {
				username: username,
			});

			if (response.data && response.data.success) {
				sessionStorage.setItem("username", username);
				navigate("/rooms");
			} else {
				setMessage("Username already taken.");
			}
		} catch (error) {
			console.log(error);
			setMessage("An error occurred. Please try again later.");
		}
	};

	return (
		<div className="flex flex-col w-1/2 grow mx-auto mt-32 w-1/2 mx-auto max-w-xl">
			<Heading title="Welcome" />
			<p className="text-lg max-w-md text-left mb-4 mt-4">
				Enter a username to begin.
			</p>
			<form onSubmit={handleSubmit} className="flex space-x-4">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					aria-label="username"
					className="border-blue-500 border rounded p-1"
				/>
				<input
					type="submit"
					value="Submit"
					className="border-2 py-1 px-5 rounded hover:bg-blue-400 hover:text-white"
				></input>
			</form>
			{message && <p className="text-red-500">{message}</p>}
		</div>
	);
};

const Heading = ({ title }) => {
	return <div className="text-3xl border-b-2">{title}</div>;
};

export default SetUsername;
