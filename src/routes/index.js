const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const memberRoutes = require("./member.routes");
const eventRoutes = require("./events.routes");
const paymentRoutes = require("./payments.routes");
const notificationRoutes = require("./notification.routes");
const reportRoutes = require("./report.routes");
const zoneRoutes = require("./zone.routes");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Membership Management API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

router.get("/status", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      success: true,
      message: "API Status",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: "running",
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/events", eventRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);
router.use("/zones", zoneRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
