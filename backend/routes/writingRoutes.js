const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');

const axios = require('axios');

const { MODEL_NAME, OPENROUTER_API_KEY } = require('../config/config');

const model = MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY;

const router = express.Router();

router.post('/get_writing_prob_data', async (req, res) => {
    // const { username } = req.user;
    const { prob_id } = req.body;

    const db = await connectToDatabase();
    const tasksCollection = db.collection(`tasks`);

    const result = await tasksCollection.findOne({ prob_id: prob_id });

    res.json({ result });
});

router.post('/generateWritingPrompt', authenticateToken, async(req, res)  => {
    var {type, content} = req.body;

    if(content === '') content = 'random'

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me a IELTS ${type} problem. Base on ${content} topic. Only output the prompt, print nothing else`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var evaluation = response.data.choices[0].message.content.trim();
    res.json({content: evaluation});
});
// router.post('/get_class_list', async (req, res) => {
//     const { school } = req.body;

//     const db = await connectToDatabase();
//     const tasksCollection = db.collection(`school_list`);

//     const result = await tasksCollection.findOne({name: school});
//     const lst = (result.class || []).sort();
//     if (!result) return;

//     res.json({id: result.insertedId, classlist: lst});
// });

// router.post('/update_class_list', async (req, res) => {
//     // const { username } = req.user;
//     const { school, classlist } = req.body;
//     try {
//         const db = await connectToDatabase();
//         const usersCollection = db.collection('school_list');

//         const result = await usersCollection.updateOne(
//             { name: school },
//             { $set: { class: classlist } }
//         );

//         if (result.modifiedCount === 0) {
//             return res.status(500).json({ error: 'Not found' });
//         }
//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error updating user info:', error);
//         res.status(500).json({ error: 'Failed to update class list' });
//     }
// });

// router.post('/add_school', async (req, res) => {
//     const { role, newschool } = req.body;

//     const db = await connectToDatabase();
//     const tasksCollection = db.collection(`school_list`);

//     const check = await tasksCollection.findOne({name: newschool});
//     if(check) return res.status(400).json({ error: 'This school has already inserted' });

//     if(role !== 'admin' && role !== 'teacher') {
//         return res.status(400).json({ error: 'You have no permissions to do this.' });
//     } 

//     const result = await tasksCollection.insertOne({name: newschool, class: null});

//     res.json({id: result.insertedId, result});
// });

module.exports = router;