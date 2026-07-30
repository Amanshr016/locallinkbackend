const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

//------Load env vars-----
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          "http://127.0.0.1:5175",
          "http://localhost:3000",
        ],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (data) => {
    if (data.room) {
      socket.to(data.room).emit("receive_message", data);
    } else {
      socket.broadcast.emit("receive_message", data);
    }
  });

  socket.on("typing", (data) => {
    if (data.room) {
      socket.to(data.room).emit("user_typing", data);
    }
  });

  socket.on("stop_typing", (data) => {
    if (data.room) {
      socket.to(data.room).emit("user_stopped_typing", data);
    }
  });

  socket.on("message_read", (data) => {
    if (data.room) {
      socket.to(data.room).emit("message_read_update", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          "http://127.0.0.1:5175",
          "http://localhost:3000",
        ],
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const workerRoutes = require("./routes/workerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const postRoutes = require("./routes/postRoutes");
const contactRoutes = require("./routes/contactRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const offerRoutes = require("./routes/offerRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LocalConnect India Backend API Running",
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/workers",
      "/api/bookings",
      "/api/reviews",
      "/api/posts",
      "/api/contact",
      "/api/services",
      "/api/offers",
      "/api/messages",
    ],
  });
});

// Serve static frontend files in production if available
const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.method === "GET") {
      return res.sendFile(path.join(frontendDistPath, "index.html"));
    }
    next();
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 LocalConnect Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});