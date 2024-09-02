const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { YoutubeTranscript } = require('youtube-transcript');
const router = express.Router();

// YouTube Data API credentials
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY; // Store your Google API key in .env file
const RSS_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAuUUnT6oDeKwE6v1NGQxug';

router.post('/fetch_and_save_ted_videos', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get(RSS_FEED_URL);
        const xml = response.data;

        const result = await xml2js.parseStringPromise(xml);
        const entries = result.feed.entry || [];
        const videoIds = entries.map(entry => entry['yt:videoId'][0]);

        const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                key: GOOGLE_CLOUD_API_KEY,
                id: videoIds.join(','),
                part: 'snippet,contentDetails,statistics'
            }
        });

        const videos = detailsResponse.data.items.map(video => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            publishDate: video.snippet.publishedAt,
            videoId: video.id,
            channelId: video.snippet.channelId,
            duration: video.contentDetails.duration,
            views: video.statistics.viewCount,
            likes: video.statistics.likeCount
        }));

        const db = await connectToDatabase();
        const collection = db.collection('ted_videos');
        await collection.insertMany(videos);

        res.json({ message: 'Videos fetched and saved successfully' });
    } catch (error) {
        console.error('Error fetching or saving videos:', error.message);
        res.status(500).json({ message: 'Error fetching or saving videos' });
    }
});

router.get('/get_ted_videos', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('ted_videos');

        const videos = await collection.aggregate([
            {
                $sort: { publishDate: -1 }
            },
            {
                $group: {
                    _id: "$videoId",
                    title: { $first: "$title" },
                    thumbnail: { $first: "$thumbnail" },
                    publishDate: { $first: "$publishDate" },
                    channelId: { $first: "$channelId" },
                    duration: { $first: "$duration" },
                    views: { $first: "$views" },
                    likes: { $first: "$likes" }
                }
            },
            {
                $sort: { publishDate: -1 }
            }
        ]).toArray();

        res.json({ videos });
    } catch (error) {
        console.error('Error fetching videos from MongoDB:', error.message);
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

router.post('/get_ted_video_by_id', authenticateToken, async (req, res) => {
    const { videoId } = req.body; 

    try {
        const db = await connectToDatabase();
        const collection = db.collection('ted_videos');

        const video = await collection.findOne({ videoId: videoId });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({ video });
    } catch (error) {
        console.error('Error fetching video from MongoDB:', error.message);
        res.status(500).json({ message: 'Error fetching video' });
    }
});

router.post('/get_transcript', async (req, res) => {
    const { videoId } = req.body;

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en'
        });

        if (!transcript || transcript.length === 0) {
            return res.status(404).json({ message: 'Transcript not available' });
        }

        res.json({ transcript });
    } catch (error) {
        console.error('Error fetching transcript:', error.message);
        res.status(500).json({ message: 'Error fetching transcript' });
    }
});

module.exports = router;
