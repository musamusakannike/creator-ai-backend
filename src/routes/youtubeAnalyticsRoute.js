// src/routes/youtubeAnalyticsRoute.js
const express = require("express");
const { google } = require("googleapis");
const {
  getDashboardData,
  getYouTubeAnalytics,
} = require("../controllers/youtubeAnalyticsController");
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();

const router = express.Router();

router.get("/", authMiddleware, getDashboardData);

router.get("/all", getYouTubeAnalytics);

module.exports = router;
