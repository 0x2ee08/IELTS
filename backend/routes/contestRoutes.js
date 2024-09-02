const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { getVocab } = require('../utils/wordLevelDetermine/getVocab');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
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


router.post('/createContestReading', authenticateToken, async (req, res) => {
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

module.exports = router;