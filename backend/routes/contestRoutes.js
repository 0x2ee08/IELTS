const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY
const router = express.Router();

router.post('/createContestReading', authenticateToken, async (req, res) => {
    try {
        const { type, accessUser, startTime, endTime, problemName, paragraphs } = req.body;

        // Check for missing fields
        if (!problemName || !startTime || !endTime || !paragraphs || paragraphs.length === 0) {
            return res.status(400).json({ error: "Missing content." });
        }

        // Validate each paragraph, section, and question
        for (let paragraph of paragraphs) {
            if (!paragraph.content || !paragraph.sections || paragraph.sections.length === 0) {
                return res.status(400).json({ error: "Missing content in paragraphs." });
            }

            for (let section of paragraph.sections) {
                // if (!section.content || !section.questions || section.questions.length === 0) {
                //     return res.status(400).json({ error: "Missing content in sections." });
                // }

                for (let question of section.questions) {
                    // console.log(question);
                    if (!question.question || !question.answer) {
                        return res.status(400).json({ error: "Missing content in questions." });
                    }
                }
            }
        }

        // Categorize vocabulary for all paragraphs
        let vocab = [];
        // for (let paragraph of paragraphs) {
        //     let words = paragraph.content.split(/\s+/); // Split content into words
        //     let categorizedWords = categorizeVocabulary(words);
        //     vocab.push(...categorizedWords); // Add to the vocab array
        // }

        // Connect to the database
        const db = await connectToDatabase();
        const contestCollection = db.collection('contest');

        // Save the contest data to the database
        const newContest = {
            type,
            accessUser,
            startTime,
            endTime,
            problemName,
            paragraphs,
            vocab
        };
        await contestCollection.insertOne(newContest);

        res.json({ status: "Success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;