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

const fetchAllVideoDetails = async (videoIds) => {
    let allVideos = [];
    let nextPageToken = null;

    do {
        const params = {
            key: GOOGLE_CLOUD_API_KEY,
            id: videoIds.join(','),
            part: 'snippet,contentDetails,statistics',
            maxResults: 50,
        };

        if (nextPageToken) {
            params.pageToken = nextPageToken;
        }

        const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', { params });

        const { items, nextPageToken: newToken } = detailsResponse.data;

        allVideos = allVideos.concat(items.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            publishDate: video.snippet.publishedAt,
            channelId: video.snippet.channelId,
            duration: video.contentDetails.duration,
            views: video.statistics.viewCount,
            likes: video.statistics.likeCount
        })));
        nextPageToken = newToken;
    } while (nextPageToken); 

    return allVideos;
};

router.get('/get_ted_videos', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const videoCollection = db.collection('ted_videos');
        const timeCollection = db.collection('history_trace');
        const currentDate = new Date();
        const lastAccessRecord = await timeCollection.findOne({ isTedTime: true });
        await timeCollection.updateOne(
            { isTedTime: true },
            { $set: { lastAccess: currentDate } }
        );
        const storedVideos = await videoCollection.aggregate([
            { $sort: { publishDate: -1 } },
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
            { $sort: { publishDate: -1 } }
        ]).toArray();
        const timeDifference = currentDate - lastAccessRecord.lastAccess;
        let fetchedVideos = [];
        if (timeDifference >= 60 * 60 * 1000) {
            console.log("Fetching new data from RSS feed...");
            const rssResponse = await axios.get(RSS_FEED_URL);
            const rssData = rssResponse.data;
            const parsedRss = await xml2js.parseStringPromise(rssData);
            const rssEntries = parsedRss.feed.entry || [];
            const videoIds = rssEntries.map(entry => entry['yt:videoId'][0]);
            fetchedVideos = await fetchAllVideoDetails(videoIds);
        }
        const existingVideoIds = new Set(storedVideos.map(video => video._id));
        const newVideos = fetchedVideos.filter(video => !existingVideoIds.has(video.videoId));

        if (newVideos.length > 0) {
            await videoCollection.insertMany(newVideos);
        }

        const mergedVideosMap = new Map();
        storedVideos.forEach(video => mergedVideosMap.set(video._id, video));
        fetchedVideos.forEach(video => mergedVideosMap.set(video.videoId, video));

        const mergedVideos = Array.from(mergedVideosMap.values());
        res.json({ videos: mergedVideos });

    } catch (error) {
        console.error('Error fetching videos:', error.message);
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


router.post('/check_quiz', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { videoId } = req.body;
    try {
        const db = await connectToDatabase();
        const tedCollection = db.collection('ted_videos');

        const video = await tedCollection.findOne({ videoId: videoId });
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.hasOwnProperty('quiz')) res.json({ message: 1 });
        else res.json({ message: 0 });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/generate_quiz', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { fulltranscript } = req.body;
    const time_save = new Date();

    const prompt1 = `Based on the text: "
`, prompt2 = `
    ", generate exactly 15 multiple-choice questions. Each question should have four answer options:

    - Exactly one correct answer, randomly placed.
    - Exactly three incorrect answers.
    
    Please format each question as follows:

    Question text?
    A. First answer option
    B. Second answer option
    C. Third answer option
    D. Fourth answer option
    Correct answer: [A/B/C/D]

    Additional requirements:

    - Ensure that the questions are distinct and not similar to one another.
    - The answer options for each question should be almost similar to one another, but it should be difficult to distinguish the correct one from the incorrect ones.
    - Feel free to rephrase both the questions and the answers without changing their meaning to increase difficulty.
    - Avoid obvious answers by making sure that the correct answer does not stand out compared to the incorrect ones.
    - Ensure that all answer options are short and concise.
    - Randomly place the correct answer in one of the options.

        **IMPORTANT:** The number of questions MUST be 15!
        **IMPORTANT:** Each question and each answer must have at most 20 words
        `,
        prompt3 = `

    Here's an example format:

    **Example:**

    Question 1: What is the main concern for the mad scientist without a spacesuit in space?

    A. He'll freeze due to low temperature
    B. He'll suffocate due to lack of oxygen
    C. He'll explode due to air pressure
    D. He'll vaporize due to extreme heat

    Correct answer: B. He'll suffocate due to lack of oxygen

    (Continue this example format, but make sure your output has the predetermined number of questions above.)
`;

    let reworked = prompt1 + fulltranscript + prompt2 + prompt3;
    const newMessage = {
        role: 'user',
        content: reworked
    };
    const formattedMessages = [
        newMessage
    ];
    try {


        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3-8b-instruct:free',
            "messages": formattedMessages,
        }, {
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const result = response.data.choices[0].message.content.trim();

        res.json({ message: result });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' + reworked });
    }
});

router.post('/save_quiz', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { videoId, quest } = req.body;

    try {
        const db = await connectToDatabase();
        const noteCollection = db.collection('ted_videos');

        await noteCollection.updateOne(
            { videoId: videoId },
            { $set: { "quiz": quest } }
        );
        res.json({ success: true });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_real_quiz', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { videoId } = req.body;
    try {
        const db = await connectToDatabase();
        const tedCollection = db.collection('ted_videos');

        const video = await tedCollection.findOne({ videoId: videoId });
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const quizArray = video.quiz;
        if (!quizArray || quizArray.length === 0) {
            return res.status(404).json({ message: 'No quiz found for this video' });
        }

        // Get 5 random elements from the "quiz" array
        const shuffledQuiz = quizArray.sort(() => 0.5 - Math.random());
        const selectedQuiz = shuffledQuiz.slice(0, 5);

        res.status(200).json({
            quiz: selectedQuiz
        });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
