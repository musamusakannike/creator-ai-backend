const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");
const morgan = require("morgan");
require("dotenv").config();

// Routes
const authRoute = require("./src/routes/authRoute");
const oauth2callbackRoute = require("./src/routes/oauth2callbackRoute");
const verifyTokenRoute = require("./src/routes/verifyTokenRoute");
const youtubeAnalyticsRoute = require("./src/routes/youtubeAnalyticsRoute");
const savesRoutes = require("./src/routes/savesRoute");

// Database connection
const connectDB = require("./src/config/db");

connectDB()
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/data", (req, res) => {
  res.status(200).json({ status: "OK", message: "Hello World" });
});

app.use("/auth", authRoute);// Generate authorization URL
app.use("/oauth2callback", oauth2callbackRoute);// OAuth2 callback to exchange the code for tokens
app.use("/verify-token", verifyTokenRoute);// Route to verify the token
app.use("/youtube-analytics", youtubeAnalyticsRoute);// Route to fetch YouTube Analytics data
app.use('/api/saves', savesRoutes)// Route to save and get items

module.exports = app;
