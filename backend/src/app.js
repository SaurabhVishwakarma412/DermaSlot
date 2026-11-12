// backend/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { isAllowedOrigin } = require("./config/cors");
const { recordRequest, getMetrics } = require("./utils/metrics");

const app = express();

// Request metrics tracking middleware for Prometheus
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    recordRequest(req.method, route, res.statusCode, duration);
  });
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Liveness probe endpoint for Kubernetes / Docker
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root ping
app.get("/", (req, res) => res.json({ message: "Dermaslot API is running" }));

// Readiness probe & database health check
app.get("/api/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

// Prometheus metrics endpoint
app.get("/metrics", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.send(getMetrics({ databaseConnected }));
});

// Routes
app.use("/api/patients", require("./routes/authRoutes"));
app.use("/api/cases", require("./routes/caseRoutes"));
app.use("/api/doctors", require("./routes/doctorRoute"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api", require("./routes/contactRoutes"));

module.exports = app;
