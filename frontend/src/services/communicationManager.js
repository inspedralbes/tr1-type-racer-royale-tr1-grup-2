import { io } from "socket.io-client";

class CommunicationManager {
  constructor() {
    this.socket = io("http://typebet.daw.inspedralbes.cat:3000", {
      autoConnect: false, 
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

  reset() {
    if (!this.socket) return;

    this.socket.off();
    console.log("✅ Todos los listeners han sido eliminados.");

    this.socket.disconnect();
    console.log("✅ Socket desconectado.");

    this.socket = null;
  }
}

export default new CommunicationManager();
