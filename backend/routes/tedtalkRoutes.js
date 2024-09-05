const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { YoutubeTranscript } = require('youtube-transcript');
const router = express.Router();

const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const RSS_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsooa4yRKGN_zEE8iknghZA';
const MODEL_CHATBOT_NAME = process.env.MODEL_CHATBOT_NAME;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

router.post('/fetch_and_save_ted_videos', async (req, res) => {
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

router.post('/send_chat', authenticateToken, async (req, res) => {
    const { message } = req.body;

    console.log(message);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: MODEL_CHATBOT_NAME,
        "messages": message,
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    res.json({ message: response.data.choices[0].message.content.trim() });
});

router.post('/save_note', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { videoId, content } = req.body;
    const time_save = new Date();

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('ted_notes');

        const note = await noteCollection.findOne({ video_id: videoId });

        await noteCollection.updateOne(
            { video_id: videoId, "note_array.username": username },
            { $set: { "note_array.$.content": content, "note_array.$.time_created": time_save } }
        );
        res.json({ success: true, message: 'Note updated!' });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Get Note
router.post('/get_note', authenticateToken, async (req, res) => {
    const { video_id } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('ted_notes');

        const note = await noteCollection.findOne({ video_id: video_id });

        if(!note) {
            await noteCollection.insertOne({
                video_id: video_id,
                note_array: [],
            });
            res.json({ content: '' });
        }
        else {
            const userNote = note.note_array.find(n => n.username === username);
            if (userNote) {
                res.json({ content: userNote.content });
            } else {
                const newUserNote = {
                    username: username,
                    time_created: new Date(),
                    content: ''
                };
                await noteCollection.updateOne(
                    { video_id: video_id },
                    { $push: { note_array: newUserNote } }
                );
                res.json({ content: '' });
            }
        }

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
