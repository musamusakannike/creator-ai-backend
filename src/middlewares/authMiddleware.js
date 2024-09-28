// src/middleware/authMiddleware.js
const oauth2Client = require("../config/googleAuth");
const { google } = require("googleapis");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Extract accessToken from cookies
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Access token is missing. Please login." });
    }

    // Verify the access token
    oauth2Client.setCredentials({ access_token: accessToken });

    const peopleAPI = google.people({ version: "v1", auth: oauth2Client });
    const { data } = await peopleAPI.people.get({
      resourceName: "people/me",
      personFields: "names,emailAddresses",
    });

    // check the user from the database
    const user = await User.findOne({ googleId: data.resourceName.split("/")[1]});

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found. Please login again." });
    }

    // Attach the user info to req.user
    req.user = {
      _id: user._id,
      googleId: data.resourceName.split("/")[1],
      username: data.names[0].displayName,
      email: data.emailAddresses ? data.emailAddresses[0].value : null,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    return res
      .status(401)
      .json({ error: "Invalid access token. Please login again." });
  }
};

module.exports = authMiddleware;
