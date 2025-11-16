import { io } from "socket.io-client";


export function getApiUrl(path) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  console.log(base);
  return `${base}${path}`;
}



export function createSocket() {
  return io(import.meta.env.VITE_SOCKET_URL);
}