import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/conn.js";
import rateLimit from "express-rate-limit";
import SocketService from "./services/socketService.js";
import cookieParser from "cookie-parser";

//Importing routes
import userRoutes from "./routes/userRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import errorHandler from "./utils/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://your-netlify-app.netlify.app", "http://localhost:5173"] // Add your Netlify URL later
      : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Initialize Socket Service
const socketService = new SocketService(io);
socketService.initialize();

// Middleware
app.use(cookieParser()); // Add cookie parser before other middleware
app.use(cors(corsOptions));
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
  windowMs: 15 * 60 * 1000, //15 minutes time out
  max: 1000, // 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const gameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300, // Max  300 requests per minute
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
app.use("/api/auth", authRoutes); // Needs to be before other routes
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes(socketService));
app.use("/api/games", gameRoutes);

//Port Listener
httpServer.listen(PORT, () => {
  console.log(`Server is racing 🏍 Sanic on port ${PORT}`);
});

//Error handling middleware
app.use(errorHandler);
