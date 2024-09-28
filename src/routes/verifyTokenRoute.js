// Backend route to verify the token (Node.js / Express)
const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.post('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token with Google OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  oauth2Client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  })
  .then(ticket => {
    const payload = ticket.getPayload();
    // Token is valid
    res.status(200).json({ message: 'Token is valid', payload });
  })
  .catch(error => {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  });
});

module.exports = router;