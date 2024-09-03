const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { getVocab } = require('../utils/wordLevelDetermine/getVocab');
const { authenticateToken, authorizeTeacher, authenticateTokenCheck } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const router = express.Router();

// router.get('/test', async(req, res) =>{
//     console.log(lemmatize.adjective( 'studying' ));
//     console.log(lemmatize.noun( 'sheaves' ));
//     console.log(lemmatize.verb( 'studying' ));
//     res.json({status : 'ok'})
// })

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


router.post('/createContestReading', authenticateToken, authorizeTeacher, async (req, res) => {
    try {
        const { type, accessUser, startTime, endTime, problemName, paragraphs, useVocab } = req.body;
        const { username } = req.user;

        //created by and contest id

        // Check for missing fields
        if (!problemName || !startTime || !endTime || !paragraphs || paragraphs.length === 0) {
            return res.status(400).json({ error: "Missing content." });
        }
        let content = '';

        // Validate each paragraph, section, and question
        for (let paragraph of paragraphs) {
            if (!paragraph.content || !paragraph.sections || paragraph.sections.length === 0) {
                return res.status(400).json({ error: "Missing content in paragraphs." });
            }

            content += paragraph.content + ' ';

            for (let section of paragraph.sections) {
                // if (!section.content || !section.questions || section.questions.length === 0) {
                //     return res.status(400).json({ error: "Missing content in sections." });
                // }

                for (let question of section.questions) {
                    // console.log(question);
                    if (!question.question || !question.answer) {
                        return res.status(400).json({ error: "Missing content in questions." });
                    }

                    content += question.question + ' ';
                    content += question.answer + ' ';
                }
            }
        }

        try {
            let vocab = [];
            if(useVocab) vocab = await getVocab(content);
            const db = await connectToDatabase();
            const contestCollection = db.collection('contest');

            // Save the contest data to the database
            const newContest = {
                'id' : generateRandomString(8),
                type,
                accessUser,
                startTime,
                endTime,
                problemName,
                paragraphs,
                'created_by' : username,
                vocab
            };
            await contestCollection.insertOne(newContest);

            res.json({ status: "Success" });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process content.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});


router.get('/getAllContest', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const contestCollection = db.collection('contest');

        let username = null;
        try {
            const user = await authenticateTokenCheck(req, res);
            if (req.user['username']) {
                username = req.user['username'];
            }
        } catch (err) {
            // Handle error in authentication (e.g., invalid token), but don't send a response yet
            username = null;
        }

        let query = { accessUser: "" }; // Public contests
        // console.log(username);
        if (username) {
            // For authenticated users, create a query to find contests either public or accessible by this user
            query = {
                $or: [
                    { accessUser: "" }, // Public contests
                    { accessUser: { $regex: `(^|,)${username}(,|$)` } } // Private contests accessible to the user
                ]
            };
        }

        const availableContests = await contestCollection.find(query).toArray();

        // console.log(availableContests);

        let response = {};
        availableContests.forEach((contest, index) => {
            response[index + 1] = {
                id: contest.id,
                type: contest.type,
                startTime: contest.startTime,
                endTime: contest.endTime,
                created_by: contest.created_by,
                access: contest.accessUser ? "Private" : "Public",
                registerUser: contest.accessUser ? 1 : 0
            };
        });

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error retrieving contests:", error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving contests" });
        }
    }
});

module.exports = router;