const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

router.post('/get_bloglist', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const result = await blogsCollection.find({}, { projection: { blog_id: 1, author: 1, title: 1, content: 1, time_created: 1, _id: 0 } })
            .sort({ time_created: -1 })  // Add sorting here
            .toArray();

        res.json({ bloglist: result });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/get_comments_by_blog_id', authenticateToken, async (req, res) => {
    const { blog_id } = req.body;
    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const result = await blogsCollection.findOne(
            { blog_id: blog_id }, 
            { projection: { comments: 1, _id: 0 } }
        );

        res.json({ comments: result.comments });
    } catch (error) {
        console.error('Error Getting Comments', error);
        res.status(500).json({ error: 'Error Getting Comments' });
    }
});


router.post('/get_home_page_bloglist', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const blogs = await blogsCollection.find({ })
            .sort({ time_created: -1 })
            .toArray();

        res.json({ blogs });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/get_blog', authenticateToken, async (req, res) => {
    // const { username } = req.user;
    const { blog_id } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`blogs`);

    const result = await blogsCollection.findOne(
        { blog_id: blog_id }, 
        { projection: { comments: 0 } }
    );

    res.json({ result });
});

router.post('/get_blog_like_dislike_view', authenticateToken, async (req, res) => {
    // const { username } = req.user;
    const { blog_id } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`blogs`);

    const result = await blogsCollection.findOne(
        { blog_id: blog_id }, 
        { projection: { like: 1, dislike: 1, view: 1, _id: 0 } }
    );

    res.json({ like: result.like, dislike: result.dislike, view: result.view });
});

router.post('/update_blog_like_dislike_view', async (req, res) => {
    const { blog_id, like, dislike, view } = req.body;
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('blogs');

        const result = await usersCollection.updateOne(
            { blog_id: blog_id },
            {
                $inc: { like: like, dislike: dislike, view: view },
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: `Error updating blog: ${error}` });
    }
});


router.post('/get_user_blog_list', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id } = req.body; // Expecting blog_id in the request body

    try {
        const db = await connectToDatabase();
        const userCollection = db.collection('user_blog_list');

        const result = await userCollection.findOne({ username: username });
        let op = false;

        if (!result) { 
            await userCollection.insertOne({
                username,
                like: [],
                dislike: [],
                view: [blog_id],
            });
            res.json({ liked: false, disliked: false, op: true });
        } else {
            const likeArray = result.like || [];
            const dislikeArray = result.dislike || [];
            const viewArray = result.view || [];

            // Check if the arrays contain the blog_id
            const liked = likeArray.includes(blog_id);
            const disliked = dislikeArray.includes(blog_id);
            op = viewArray.includes(blog_id);

            if (!op) {
                await userCollection.updateOne(
                    { username: username },
                    { $push: { view: blog_id, }}
                )
            }

            res.json({ liked: liked, disliked: disliked, op: !op });
        }
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

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user emotion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add_comment', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id, content } = req.body;

    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const count = await blogsCollection.findOne({ blog_id: blog_id });
        const nextCommentId = Number(count.comments_count + 1); 

        const newComment = {
            username: username,
            time_created: new Date(),
            children: [],
            parent: -1,
            comment_id: nextCommentId,
            content: content,
        };

        const result = await blogsCollection.updateOne(
            { blog_id: blog_id },
            { 
                $push: { comments: newComment } ,      
                $set: { comments_count: nextCommentId } 
            },
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

router.post('/add_reply', authenticateToken, async (req, res) => {
    const { username } = req.user;
    const { blog_id, parent, content } = req.body;

    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const count = await blogsCollection.findOne({ blog_id: blog_id });
        const nextCommentId = Number(count.comments_count + 1); 

        const newComment = {
            username: username,
            time_created: new Date(),
            children: [],
            parent: parent,
            comment_id: nextCommentId,
            content: content,
        };

        const result = await blogsCollection.updateOne(
            { blog_id: blog_id },
            { 
                $push: { comments: newComment } ,      
                $set: { comments_count: nextCommentId } 
            },
        );

        const updateChildren = await blogsCollection.updateOne(
            { blog_id: blog_id, 'comments.comment_id': parent },
            { $push: { 'comments.$.children': nextCommentId } }
        );

        if (updateChildren.modifiedCount > 0 && result.modifiedCount > 0) {
            res.json({ success: true, message: 'Comment added successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Blog not found' });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/create_blog', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const { username } = req.user;
    const time_created = new Date();

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
    }

    try {
        const db = await connectToDatabase();
        const blogsCollection = db.collection('blogs');

        const count = await blogsCollection.countDocuments();
        const nextBlogId = count + 1;

        // Create a new blog
        const result = await blogsCollection.insertOne({
            title: title,
            content: content,
            blog_id: String(nextBlogId),
            author: username,
            time_created: time_created,
            like: 0,
            dislike: 0,
            view: 0,
            comments: [],
            comments_count: 0,
        });

        res.json({ success: true, message: 'Blog created successfully', blog_id: nextBlogId });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;