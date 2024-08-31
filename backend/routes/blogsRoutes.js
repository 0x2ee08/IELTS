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

router.post('/update_blog', async (req, res) => {
    // const { username } = req.user;
    const { blog_id, like, dislike, view } = req.body;
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('blogs');

        const result = await usersCollection.updateOne(
            { blog_id: blog_id },
            { $set: { like: like, dislike: dislike, view: view } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/get_user_blog_list', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id } = req.body; // Expecting blog_id in the request body

    try {
        const db = await connectToDatabase();
        const userCollection = db.collection('user_blog_list');

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
        const userCollection = db.collection('user_blog_list');
        const result = await userCollection.findOne({ username });

        if (!result) {
            await userCollection.insertOne({
                username,
                like: action === 'like' ? [blog_id] : [],
                dislike: action === 'dislike' ? [blog_id] : [],
                view: [],
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

router.post('/update_blog_view', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id } = req.body;

    try {
        const db = await connectToDatabase();
        const userCollection = db.collection('user_blog_list');
        const result = await userCollection.findOne({ username });

        if (!result) {
            await userCollection.insertOne({
                username,
                like: [],
                dislike: [],
                view: [ blog_id ],
            });
            res.json({ op: true });
        } else {
            let update = {};
            let op = false;

            if (!result.view.includes(blog_id)) {
                update = { $addToSet: { view: blog_id } };
                await userCollection.updateOne({ username }, update);
                op = true;
            }

            res.json({ op: op });
        }
    } catch (error) {
        console.error('Error updating blog view:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add_comment', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id, content } = req.body;

    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const newComment = {
            username: username,
            time_created: new Date(),
            content: content,
        };

        const result = await blogsCollection.updateOne(
            { blog_id: blog_id },
            { $push: { comments: newComment } }
        );

        if (result.modifiedCount > 0) {
            res.json({ success: true, message: 'Comment added successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Blog not found' });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;