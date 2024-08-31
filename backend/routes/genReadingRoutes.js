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

router.post('/generateReadingParagraph', authenticateToken, async (req, res) => {
    const { title, content } = req.body;

    const db = await connectToDatabase();
    const blogsCollection = db.collection(`problemset`);

    console.log(title, content);

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me a paragraph of IELTS Reading around 800 words with this topic "${title}"(if empty then random) and some of first line content: "${content}"(if empty then random) [ONLY GIVE THE TITLE AND THE PARAGRAPH, DO NOT SAY ANYTHING ELSE, HAVE AT LEAST 3 SMALLER SECTION, 800 WORD MINIMUM, DO NOT HAVE TITLE FOR EACH SECTION]`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();

    var lines = evaluation.split('\n');

    var title_ = lines[0].trim();

    var content_ = lines.slice(1).join('\n').trim();

    res.json({title: title_, content: content_});

    // const result = await blogsCollection.findOne({ blog_id: blog_id });

    // res.json({id: result.insertedId, result});
});



module.exports = router;