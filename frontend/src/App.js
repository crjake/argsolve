import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import CreateRoom from './pages/CreateRoom';
import Rooms from './pages/Rooms';
import SetUsername from './pages/SetUsername';

import Footer from './components/Footer';
import Header from './components/Header';

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
  }, [sessionStorage.getItem('username')]);

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Header username={username} />
      <Routes className="flex-grow">
        <Route path="/" element={<SetUsername />} />
        <Route path="/rooms" element={<Rooms username={username} />} />
        <Route path="/rooms/create" element={<CreateRoom username={username} />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
