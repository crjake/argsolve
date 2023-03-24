import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
	return (
		<div className="flex flex-col divide-y-2 divide-solid justify-between min-h-screen">
			<Header />
			<div className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Home />} />
          <Route path="/create" element={<Home />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
      <Footer />
		</div>
	);
}

export default App;
