const oauth2Client = require("../config/googleAuth");

const generateAuthUrl = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });

  // Redirect to Google's OAuth 2.0 consent screen
  res.redirect(authUrl);
};

module.exports = { generateAuthUrl };
