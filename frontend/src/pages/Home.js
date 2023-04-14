// import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
	return (
		<div className="flex flex-col justify-center items-center">
			<div className="flex justify-between w-1/2 mt-5">
				<div>Join with Pin</div>
				<div>Create new game</div>
			</div>
		</div>
	);
}

// const UsernameInput = () => {
// 	const [username, setName] = useState(() => {
// 		 const saved = localStorage.getItem("username");
// 		 const initialValue = JSON.parse(saved);
// 		 return initialValue || "";
// 	});

// 	useEffect(() => {
// 		localStorage.setItem("username", JSON.stringify(name));
// 	}, [username]);

// 	return (
// 		<form>
// 			<input
// 				type="text"
// 				value={username}
// 				onChange={(e) => setName(e.target.value)}
// 				placeholder="Username"
// 				aria-label="username"
// 			/>
// 			<input type="submit" value="Submit"></input>
// 		</form>
// 	);
// };




export default Home;
