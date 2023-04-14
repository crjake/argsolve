import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Game from "./pages/Game";
import CreateRoom from "./pages/CreateRoom";
import Rooms from "./pages/Rooms";
import SetUsername from "./pages/SetUsername";

import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
	return (
        <div className="flex flex-col justify-between min-h-screen">
			<Header />
            <Routes className="flex-grow">
                <Route path="/" element={<SetUsername />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/create" element={<CreateRoom />} />
                {/* <Route path="/join" element={<Home />} /> */}
                {/* <Route path="/create" element={<Home />} /> */}
                {/* <Route path="/game" element={<Game />} /> */}
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
			<Footer />
		</div>
	);
}

export default App;
