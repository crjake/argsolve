import { useState, useEffect } from "react";

const useUsername = () => {
	const [username, setUsername] = useState(
		sessionStorage.getItem("username")
	);

	useEffect(() => {
		const storedUsername = sessionStorage.getItem("username");
		if (storedUsername === null) {
			setUsername(null);
		} else {
			setUsername(storedUsername);
		}
	}, []);

	return username;
};

export { useUsername };
