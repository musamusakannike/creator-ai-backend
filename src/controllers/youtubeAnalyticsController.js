const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const getDashboardData = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    oauth2Client.setCredentials({ access_token: accessToken });

    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const analyticsResponse = await youtubeAnalytics.reports.query({
      ids: "channel==MINE",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      metrics: "views,subscribersGained,estimatedMinutesWatched",
      dimensions: "day",
    });

    const channelResponse = await youtube.channels.list({
      part: "snippet,statistics",
      mine: true,
    });

    const channelId = channelResponse.data.items[0].id;
    const channelName = channelResponse.data.items[0].snippet.title;
    const channelLogo =
      channelResponse.data.items[0].snippet.thumbnails.default.url;
    const totalSubscribers =
      channelResponse.data.items[0].statistics.subscriberCount;

    const videoResponse = await youtube.search.list({
      part: "snippet",
      channelId: channelId,
      maxResults: 5,
      order: "date",
    });

    const videoIds = videoResponse.data.items.map((item) => item.id.videoId);

    const videoStatsResponse = await youtube.videos.list({
      part: "statistics",
      id: videoIds.join(","),
    });

    const latestVideos = videoResponse.data.items.map((item, index) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.default.url,
      views: videoStatsResponse.data.items[index].statistics.viewCount,
      likes: videoStatsResponse.data.items[index].statistics.likeCount,
      comments: videoStatsResponse.data.items[index].statistics.commentCount,
    }));

    const data = {
      analytics: analyticsResponse.data,
      latestVideos,
      channelInfo: {
        name: channelName,
        logo: channelLogo,
        subscribers: totalSubscribers,
      },
    };

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

// Set credentials from access token
const getYouTubeAnalytics = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token is missing' });
    }

    // Set access token
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

    // Step 1: Get Channel Details (Logo, Name, Total Views, Total Subscribers, Total Uploads)
    const channelResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true,
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = channelResponse.data.items[0];
    const channelDetails = {
      name: channel.snippet.title,
      logo: channel.snippet.thumbnails.default.url,
      totalViews: channel.statistics.viewCount,
      totalSubscribers: channel.statistics.subscriberCount,
      totalUploads: channel.statistics.videoCount,
    };

    // Step 2: Get Views Gained and Subscribers Gained for the Last 28 Days and the 28 Days Before That
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28);

    const prevStartDate = new Date();
    prevStartDate.setDate(endDate.getDate() - 56);
    const prevEndDate = new Date();
    prevEndDate.setDate(endDate.getDate() - 28);

    // Query for the last 28 days
    const last28DaysResponse = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,subscribersGained',
    });

    // Query for the 28 days before that
    const prev28DaysResponse = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: prevStartDate.toISOString().split('T')[0],
      endDate: prevEndDate.toISOString().split('T')[0],
      metrics: 'views,subscribersGained',
    });

    const last28Days = last28DaysResponse.data.rows ? last28DaysResponse.data.rows[0] : [0, 0];
    const prev28Days = prev28DaysResponse.data.rows ? prev28DaysResponse.data.rows[0] : [0, 0];

    const analyticsData = {
      last28Days: {
        viewsGained: last28Days[0],
        subscribersGained: last28Days[1],
      },
      prev28Days: {
        viewsGained: prev28Days[0],
        subscribersGained: prev28Days[1],
      },
    };

    // Step 3: Get Total Watch Time in Minutes
    const watchTimeResponse = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: '2000-01-01', // Fetch watch time from the start of the channel
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'estimatedMinutesWatched',
    });

    const totalWatchTimeMinutes = watchTimeResponse.data.rows ? watchTimeResponse.data.rows[0][0] : 0;
    const totalWatchTimeHours = (totalWatchTimeMinutes / 60).toFixed(2); // Convert minutes to hours and format to 2 decimal places

    // Step 4: Return Response
    res.status(200).json({
      channelDetails,
      analyticsData,
      totalWatchTimeHours, // Include the total watch time in hours
    });
  } catch (error) {
    console.error('Error fetching YouTube Analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube analytics data' });
  }
};

module.exports = {
  getDashboardData,
  getYouTubeAnalytics,
};
