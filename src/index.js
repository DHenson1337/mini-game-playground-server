import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/conn.js";
import rateLimit from "express-rate-limit";

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

//Middleware
app.use(cors());
app.use(express.json());

//MongoDB Connection
connectDB();

//Socket connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increase this from your current limit
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a specific limiter for game fetching
const gameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Increased from 30 to 100 requests per minute
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
app.use("/api/scores", scoreRoutes);
app.use("/api/games", gameRoutes);

//Port Listener
httpServer.listen(PORT, () => {
  console.log(`Server is racing 🏍 Sanic on port  ${PORT}`);
});

//Error handling middleware
app.use(errorHandler);
