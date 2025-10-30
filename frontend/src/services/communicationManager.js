import { io } from "socket.io-client";

class CommunicationManager {
  constructor() {
    // Asegúrate de que la URL coincida con tu backend
    this.socket = io("http://localhost:3000", {
      autoConnect: false, // No se conecta automáticamente al crear la instancia
    });

    this.socket.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });
  }

  connect() {
    if (this.socket.disconnected) {
      this.socket.connect();
      console.log("Connecting to server...");
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
      console.log("Disconnected from server.");
    }
  }

  on(event, callback) {
    this.socket.on(event, callback);
    console.log(`Registered callback for event: ${event}`);
  }

  emit(event, data) {
    this.socket.emit(event, data);
    console.log(`Emitting event: ${event} with data:`, data);
  }

  off(event, callback) {
    this.socket.off(event, callback);
    console.log(`Unregistered callback for event: ${event}`);
  }
}

export default new CommunicationManager();