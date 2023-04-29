const getBaseUrl = () => {
  let url;
  switch (process.env.NODE_ENV) {
    case 'production':
      url = 'argsolve.onrender.com';
      break;
    case 'development':
    default:
      url = '192.168.1.144:8000';
  }

  return url;
};

// const BASE_URL = 'http://127.0.0.1:8000/';
// const BASE_IP = '192.168.1.144:8000';
// const BASE_URL = 'http://' + BASE_IP + '/';

const DEBUG = false;

const BASE_IP = DEBUG ? 'argsolve.onrender.com' : getBaseUrl();

const BASE_URL = (process.env.NODE_ENV === 'production' || DEBUG ? 'https://' : 'http://') + BASE_IP;

// const BASE_URL = 'https://argsolve.onrender.com/';
const API_URL = BASE_URL + '/' + 'api/';
const ROOM_URL = BASE_URL + '/' + 'ws/room/';
// const WEBSOCKET_URL = 'ws://' + BASE_IP + '/';
const WEBSOCKET_URL = (process.env.NODE_ENV === 'production' || DEBUG ? 'wss://' : 'ws://') + BASE_IP + '/';

export { API_URL, ROOM_URL, WEBSOCKET_URL };
