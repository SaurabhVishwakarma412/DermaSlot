require("dotenv").config({ quiet: true });
const http = require("http");
const socketIO = require("socket.io");
const connectDB = require("./config/db.js");
const Message = require("./models/Message");
const app = require("./app");
const { getAllowedOrigins, isAllowedOrigin } = require("./config/cors");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active connections
const userSockets = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Store user socket
  socket.on("user_join", (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} joined with socket ${socket.id}`);
    console.log("Current online users:", Object.keys(userSockets));
  });

  // Handle sending messages
  socket.on("send_message", async (data, acknowledgement) => {
    const { from, to, message, timestamp } = data;
    console.log(`Message received from ${from} to ${to}`);

    // Save message to database
    let newMessage;
    try {
      newMessage = new Message({
        from,
        to,
        message,
        timestamp: new Date(timestamp)
      });
      await newMessage.save();
      console.log("Message saved to database");
    } catch (err) {
      console.error("Error saving message:", err);
      if (typeof acknowledgement === "function") {
        acknowledgement({ success: false });
      }
      return;
    }

    // Send to recipient if online
    const recipientSocketId = userSockets[to];
    if (recipientSocketId) {
      console.log(`Sending message to recipient socket ${recipientSocketId}`);
      io.to(recipientSocketId).emit("receive_message", {
        _id: newMessage._id,
        from,
        to,
        message,
        timestamp,
        senderSocketId: socket.id
      });
    } else {
      console.log(`Recipient ${to} is not online. Message saved to DB.`);
    }

    if (typeof acknowledgement === "function") {
      acknowledgement({ success: true, data: newMessage });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}. Allowed origins: ${getAllowedOrigins().join(", ")}`)
    );
  } catch (error) {
    console.error(`Server startup failed: ${error.name || "Error"}${error.code ? ` (${error.code})` : ""}`);
    process.exitCode = 1;
  }
};

startServer();
