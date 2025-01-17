// services/socketService.js

class SocketService {
  constructor(io) {
    this.io = io;
    this.activeUsers = new Map(); // Track active users
  }

  initialize() {
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Handle joining game-specific rooms
      socket.on("join_game", (gameId) => {
        socket.join(`game:${gameId}`);
        console.log(`Socket ${socket.id} joined game:${gameId}`);
      });

      // Handle leaving game-specific rooms
      socket.on("leave_game", (gameId) => {
        socket.leave(`game:${gameId}`);
        console.log(`Socket ${socket.id} left game:${gameId}`);
      });

      // Handle user authentication
      socket.on("auth_user", (userData) => {
        if (userData?.username) {
          this.activeUsers.set(socket.id, userData);
          socket.join(`user:${userData.username}`);
          this.broadcastUserCount();
        }
      });

      // Handle new score submissions
      socket.on("new_score", (scoreData) => {
        // Broadcast to all clients watching the specific game
        this.io.to(`game:${scoreData.gameId}`).emit("score_update", {
          ...scoreData,
          timestamp: new Date(),
        });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.activeUsers.delete(socket.id);
        this.broadcastUserCount();
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  // Broadcast new scores to specific game room
  broadcastScore(gameId, scoreData) {
    this.io.to(`game:${gameId}`).emit("score_update", scoreData);
  }

  // Broadcast active user count
  broadcastUserCount() {
    this.io.emit("active_users", this.activeUsers.size);
  }

  // Notify specific user
  notifyUser(username, event, data) {
    this.io.to(`user:${username}`).emit(event, data);
  }
}

export default SocketService;
