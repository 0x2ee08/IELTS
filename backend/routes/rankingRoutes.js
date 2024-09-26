const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const router = express.Router();

// User registration
router.post('/getUsersScore', async (req, res) => {
    const { id } = req.body;

    try {
        const db = await connectToDatabase();
        const userAnswerCollection = db.collection('user_answer');

        const contestCollection = db.collection('contest');
        const cts = await contestCollection.find({id}).toArray();

        const totalTask = cts[0].taskArray.length;
        const userScores = {};

        for (let task_id = 0; task_id < totalTask; task_id++) {
            const submissions = await userAnswerCollection.find({ contestID: id, task_id: task_id, $or: [
                { status: true },
                { status: { $exists: false } }
            ]}).toArray();
            // console.log(submissions);
            submissions.forEach(submission => {
                const username = submission.submit_by; 
                if (submission.result && submission.result.length > 0) {
                    const scores = submission.result.map(r => r.band.total || 0); // Extract scores or default to 0
                    const totalScore = scores.reduce((sum, score) => sum + score, 0); // Sum of scores
                    const averageScore = totalScore / scores.length; // Calculate average score
    
                    // Aggregate scores in the userScores object
                    if (!userScores[username]) {
                        userScores[username] = { username, score: Array(totalTask).fill(0) }; // Set initial scores to an array of zeros
                    }
                    // userScores[username].score.push(averageScore); // Add average score to the user's score array
                    userScores[username].score[task_id] = Math.max(userScores[username].score[task_id], averageScore);
                }
            });
        }
    
        const scoresArray = Object.values(userScores);
    
        const rankingResponse = {
            id: id,
            users: scoresArray
        };
    
        res.json(rankingResponse);
    } catch (error) {
        console.error('Error fetching ranking data:', error);
        res.status(500).json({ error: 'Failed to fetch ranking data' });
    }

    // try {
    //     const db = await connectToDatabase();
    //     const rankingCollection = db.collection('ranking');

    //     const ranking = await rankingCollection.findOne({ id });

    //     if (!ranking) {
    //         await rankingCollection.insertOne({
    //             id: id,
    //             data: []
    //         });
    //         ranking = await rankingCollection.findOne({ id: id });
    //     }

    //     res.json({users: ranking.data});
    // } catch (error) {
    //     console.error('Error fetching ranking data:', error);
    //     res.status(500).json({ error: 'Failed to fetch ranking data' });
    // }
});

router.post('/getUserRankingDetail', async (req, res) => {
    const { username } = req.body;

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username });
        const { name, class_, school } = user;
        res.json({ name, class_, school });
        
    } catch (error) {
        console.error('Error fetching ranking data:', error);
        res.status(500).json({ error: 'Failed to fetch ranking data' });
    }
});

module.exports = router;