// src/routes/authRoute.js
const express = require("express");
const { generateAuthUrl } = require("../controllers/authController");
require("dotenv").config();

const router = express.Router();

// Generate the Google OAuth consent screen URL
router.get("/", generateAuthUrl);

module.exports = router;
