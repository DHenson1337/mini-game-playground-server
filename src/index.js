import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/conn.js";

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

//Port Listener
httpServer.listen(PORT, () => {
  console.log(`Server is racing 🏍 Sanic on port  ${PORT}`);
});
