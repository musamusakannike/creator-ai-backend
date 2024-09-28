// src/routes/oauth2callbackRoute.js
const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User'); // Import the Mongoose model
require('dotenv').config();

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

router.post('/', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile data from Google People API
    const peopleAPI = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await peopleAPI.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    });

    const userProfile = {
      googleId: data.resourceName.split('/')[1], // Extract Google ID from resourceName
      username: data.names[0].displayName,
      email: data.emailAddresses ? data.emailAddresses[0].value : null, // Get the first email, if available
    };

    // Find or create a user in the database
    let user = await User.findOne({ googleId: userProfile.googleId });

    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({
        googleId: userProfile.googleId,
        username: userProfile.username,
        email: userProfile.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      await user.save();
    } else {
      // If user exists, update their tokens
      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token;
      await user.save();
    }

    // Set access token and refresh token in cookies
    res.cookie('accessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000, // 1 hour expiration for access token
      sameSite: 'Lax',
    });

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 3600 * 1000, // 30 days expiration for refresh token
      sameSite: 'Lax',
    });

    // Redirect or respond to the frontend
    return res.status(200).send('Tokens and user information stored successfully.');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return res.status(500).send('Failed to exchange code for tokens.');
  }
});

module.exports = router;
