// const BASE_URL = 'http://127.0.0.1:8000/';
const BASE_IP = '192.168.1.144:8000';
const BASE_URL = 'http://' + BASE_IP + '/';
const API_URL = BASE_URL + 'api/';
const ROOM_URL = BASE_URL + 'ws/room/';
const WEBSOCKET_URL = 'ws://' + BASE_IP + '/';

export { API_URL, ROOM_URL, WEBSOCKET_URL };
