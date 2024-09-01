const express = require('express');
const axios = require('axios');
const { connectToDatabase } = require('../utils/mongodb');
const router = express.Router();

const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY; // Store your API key securely
const TEDTALK_ID = process.env.TEDTALK_ID;

// Fetch all video IDs from TED channel and save them to MongoDB
router.post('/fetch_and_save_videos', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const videosCollection = db.collection('videos'); // Collection name for storing videos

        let allVideoIds = [];
        let pageToken = '';

        // Fetch all videos using pagination
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?key=${GOOGLE_CLOUD_API_KEY}&channelId=${TEDTALK_ID}&part=snippet,id&order=date`
            );
            const data = response.data;
            
            // Extract video IDs and filter only videos
            const videoIds = data.items
                .filter((item) => item.id.kind === 'youtube#video')
                .map((item) => item.id.videoId);

            allVideoIds = [...allVideoIds, ...videoIds]; // Append new video IDs
            pageToken = data.nextPageToken; // Update pageToken for the next iteration

        // Save all video IDs to MongoDB
        await videosCollection.insertOne({ videos: allVideoIds, fetchedAt: new Date() });

        res.json({ message: 'Videos fetched and saved successfully!', totalVideos: allVideoIds.length });
    } catch (error) {
        console.error('Error fetching or saving videos:', error);
        res.status(500).json({ message: 'Error fetching or saving videos.', error });
    }
});

// Retrieve all video IDs from MongoDB
router.get('/get_videos', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const videosCollection = db.collection('videos');

        const videosData = await videosCollection.findOne({}); // Get the most recent data
        if (videosData) {
            res.json({ videos: videosData.videos, fetchedAt: videosData.fetchedAt });
        } else {
            res.status(404).json({ message: 'No videos found.' });
        }
    } catch (error) {
        console.error('Error fetching videos from database:', error);
        res.status(500).json({ message: 'Error fetching videos from database.', error });
    }
});

module.exports = router;
