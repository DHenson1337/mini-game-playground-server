import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/conn.js";
import rateLimit from "express-rate-limit";
import SocketService from "./services/socketService.js";

//Importing routes
import userRoutes from "./routes/userRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import errorHandler from "./utils/errorHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

//Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Initialize Socket Service
const socketService = new SocketService(io);
socketService.initialize();

//Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    body: req.body,
    params: req.params,
    query: req.query,
  });
  next();
});

//MongoDB Connection
connectDB();

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const gameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//Applies to all routes (Rate limiter)
app.use(limiter);

// Apply the specific limiter only to game routes
app.use("/api/games", gameLimiter);

//Routes
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes(socketService));
app.use("/api/games", gameRoutes);

//Port Listener
httpServer.listen(PORT, () => {
  console.log(`Server is racing 🏍 Sanic on port ${PORT}`);
});

//Error handling middleware
app.use(errorHandler);
