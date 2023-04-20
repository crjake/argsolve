import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';

import CreateRoom from './pages/CreateRoom';
import Rooms from './pages/Rooms';
import SetUsername from './pages/SetUsername';
import ArgSolve from './refactor/ArgSolve';
import { UsernameContext } from './refactor/UsernameContext';
import TestEnviornment from './refactor/TestEnvironment';

function App() {
  const [username, setUsername] = useState(sessionStorage.getItem('username'));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername === null) {
      setUsername(null);
      navigate('/');
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  return (
    <UsernameContext.Provider value={username}>
      <div className="flex flex-col justify-between min-h-screen">
        <Header username={username} />
        <Routes className="flex-grow">
          <Route path="/" element={<SetUsername />} />
          <Route path="/rooms" element={<Rooms username={username} />} />
          <Route path="/rooms/create" element={<CreateRoom username={username} />} />
          <Route path="/rooms/:id" element={<ArgSolve />} />
          <Route path="/test" element={<TestEnviornment />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
        <Footer />
      </div>
    </UsernameContext.Provider>
  );
}

export default App;
