const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

router.post('/get_bloglist', authenticateToken, async (req, res) => {
    // const { username } = req.user;
    // const { prob_id } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`blogs`);

    const result = await blogsCollection.find({}, { projection: { title: 1, _id: 0 } }).toArray();
    const result2 = await blogsCollection.find({}, { projection: { blog_id: 1, _id: 0 } }).toArray();

    res.json({ idlist: result2, bloglist: result});
});

router.post('/get_blog', authenticateToken, async (req, res) => {
    // const { username } = req.user;
    const { blog_id } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`blogs`);

    const result = await blogsCollection.findOne({ blog_id: blog_id });

    res.json({id: result.insertedId, result});
});

router.post('/update_emotion', async (req, res) => {
    // const { username } = req.user;
    const { blog_id, like, dislike } = req.body;
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('blogs');

        const result = await usersCollection.updateOne(
            { blog_id: blog_id },
            { $set: { like: like, dislike: dislike } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_user_emotion', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id } = req.body; // Expecting blog_id in the request body

    try {
        const db = await connectToDatabase();
        const userCollection = db.collection('user_emotion_list');

        const result = await userCollection.findOne({ username: username });

        const likeArray = result.like || [];
        const dislikeArray = result.dislike || [];

        // Check if the arrays contain the blog_id
        const liked = likeArray.includes(blog_id);
        const disliked = dislikeArray.includes(blog_id);

        res.json({ liked: liked, disliked: disliked });
    } catch (error) {
        console.error('Error fetching user emotion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update_user_emotion', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id, action } = req.body;

    try {
        const db = await connectToDatabase();
        const userCollection = db.collection('user_emotion_list');
        const result = await userCollection.findOne({ username });

        if (!result) {
            await userCollection.insertOne({
                username,
                like: action === 'like' ? [blog_id] : [],
                dislike: action === 'dislike' ? [blog_id] : []
            });
        } else {
            let update = {};

            if (action === 'like') {
                if (result.like.includes(blog_id)) {
                    update = { $pull: { like: blog_id } };
                } else {
                    update = { $addToSet: { like: blog_id }, $pull: { dislike: blog_id } };
                }
            } else if (action === 'dislike') {
                if (result.dislike.includes(blog_id)) {
                    update = { $pull: { dislike: blog_id } };
                } else {
                    update = { $addToSet: { dislike: blog_id }, $pull: { like: blog_id } };
                }
            }
            await userCollection.updateOne({ username }, update);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user emotion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;