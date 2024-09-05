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

        // Check for missing fields
        if (!problemName || !startTime || !endTime || !paragraphs || paragraphs.length === 0) {
            return res.status(400).json({ error: "Missing content." });
        }

        // Validate each paragraph, section, and question
        for (let paragraph of paragraphs) {
            var content = '';

            if (!paragraph.content || !paragraph.sections || paragraph.sections.length === 0) {
                return res.status(400).json({ error: "Missing content in paragraphs." });
            }

            content += paragraph.content;
            content += ' || '

            for (let section of paragraph.sections) {
                for (let question of section.questions) {
                    if (!question.question || !question.answer) {
                        return res.status(400).json({ error: "Missing content in questions." });
                    }
                    content += section.questions.question;
                    content += ' || ';
                    content += section.questions.answer;
                    content += ' || ';
                    content += section.questions.explaination;
                    content += ' || ';
                }
            }

            // If useVocab is true, get the vocab for this paragraph's content
            if (useVocab) {
                paragraph.vocab = await getVocab(content);
            }
        }

        try {
            const db = await connectToDatabase();
            const contestCollection = db.collection('contest');

            // Save the contest data to the database
            const newContest = {
                id: generateRandomString(8),
                type,
                accessUser,
                startTime,
                endTime,
                problemName,
                paragraphs,
                created_by: username,
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

router.get('/getAllParagraph', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const contestCollection = db.collection('contest');

        // Authenticate user
        let username = null;
        try {
            const user = await authenticateTokenCheck(req, res);
            if (req.user['username']) {
                username = req.user['username'];
            }
        } catch (err) {
            username = null;
        }

        // Define the query to find contests that have ended
        let query = {
            $and: [
                { accessUser: "" },
                { endTime: { $lt: new Date().toISOString() } }
            ]
        }; // Use ISO string format for comparison
        if (username) {
            // Include user-specific access conditions if authenticated
            query = {
                $and: [
                    { endTime: { $lt: new Date().toISOString() } }, // Contests that have ended
                    {
                        $or: [
                            { accessUser: "" }, // Public contests
                            { accessUser: { $regex: `(^|,)${username}(,|$)` } } // Private contests accessible to the user
                        ]
                    }
                ]
            };
        }

        // Fetch contests from the database
        const availableContests = await contestCollection.find(query).toArray();

        // Prepare response with paragraph details
        const response = [];
        availableContests.forEach(contest => {
            const paragraphs = contest.paragraphs || {};
            for (const [key, value] of Object.entries(paragraphs)) {
                response.push({
                    idContest: contest.id,
                    title: value.title,
                    contestName: contest.problemName
                });
            }
        });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving paragraphs:", error);
        res.status(500).json({ message: "Error retrieving paragraphs" });
    }
});

router.post('/getVocab', async (req, res) => {
    try {
        const { idContest, title } = req.body; // Extract contest ID and title from the request body

        if (!idContest || !title) {
            return res.status(400).json({ message: "Missing idContest or title" });
        }

        const db = await connectToDatabase();
        const contestCollection = db.collection('contest');

        // Authenticate user
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

        // Find the specific contest
        const contest = await contestCollection.findOne({ id: idContest });

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Check if the contest has ended
        const contestEndTime = new Date(contest.endTime);
        if (isNaN(contestEndTime.getTime()) || contestEndTime >= new Date()) {
            return res.status(403).json({ message: "Contest is still ongoing or endTime is invalid" });
        }

        // Check user access permissions
        if (contest.accessUser !== "" && !contest.accessUser.split(',').includes(username)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Extract vocab from the paragraphs
        const paragraphs = contest.paragraphs || {};
        const vocab = {};

        for (const [key, value] of Object.entries(paragraphs)) {
            if (value.title === title && value.vocab) {
                for (const [level, words] of Object.entries(value.vocab)) {
                    if (!vocab[level]) {
                        vocab[level] = []; // Initialize array for the level if it doesn't exist
                    }
                    vocab[level].push(...words);
                }
                break; // Assuming title is unique in each contest
            }
        }

        res.status(200).json(vocab);
    } catch (error) {
        console.error("Error retrieving vocab:", error);
        res.status(500).json({ message: "Error retrieving vocab" });
    }
});


module.exports = router;