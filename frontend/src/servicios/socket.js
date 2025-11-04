import { io } from "socket.io-client";

//URL del servidor
const SOCKET_URL = "http://localhost:3000";

//Creamos la conexión con el servidor con io()
const socket = io(SOCKET_URL);

export default socket;
