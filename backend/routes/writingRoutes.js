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

// Endpoint to get all unique topics
router.post('/get_topic_array_writing', authenticateToken, async (req, res) => {
try {
    const db = await connectToDatabase();
    const problemsetCollection = db.collection('problemset');

    // Use aggregation to group by topic and get unique topics
    const result = await problemsetCollection.aggregate([
    { $match: { "skill": "Writing" } },
    { $group: { _id: "$topic" } },
    { $project: { topic: "$_id", _id: 0 } }
    ]).toArray();

    const topics = result.map(item => item.topic); // Extract topics from result

    res.json({ topic: topics });
} catch (error) {
    console.error('Error fetching topics:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch topics' });
}
});

// Endpoint to get statements for a specific topic
router.post('/get_array_writing_statement_by_topic', authenticateToken, async (req, res) => {
const { topic } = req.body;

if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
}

try {
    const db = await connectToDatabase();
    const problemsetCollection = db.collection('problemset');

    // Find the document with the specified topic
    const result = await problemsetCollection.findOne({ skill: "Writing", topic: topic });
    
    // Check if statements were found for the topic
    if (result && result.statements) {
    res.json({ statements: result.statements });
    } else {
    res.status(404).json({ error: 'No statements found for this topic' });
    }
} catch (error) {
    console.error('Error fetching statements:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch statements' });
}
});


// Endpoint to get all unique topics
router.post('/get_topic_array_reading', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const problemsetCollection = db.collection('problemset');
    
        // Use aggregation to group by topic and get unique topics
        const result = await problemsetCollection.aggregate([
        { $match: { "skill": "Reading" } },
        { $group: { _id: "$topic" } },
        { $project: { topic: "$_id", _id: 0 } }
        ]).toArray();
    
        const topics = result.map(item => item.topic); // Extract topics from result
    
        res.json({ topic: topics });
    } catch (error) {
        console.error('Error fetching topics:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

router.post('/get_array_reading_problem_by_topic', authenticateToken, async (req, res) => {
    console.log("Request received for fetching titles by topic");

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const db = await connectToDatabase();
        const problemsetCollection = db.collection('problemset');

        // Find the document with the specified skill and topic
        const result = await problemsetCollection.findOne({ skill: "Reading", topic: topic });

        if (result && result.problems && Array.isArray(result.problems)) {
            // Extract the titles from the problems array
            const titles = result.problems.map(problem => problem.title || "Untitled");

            return res.json({
                success: true,
                titles // Array of titles
            });
        } else {
            return res.status(404).json({ error: 'No problems found for this topic' });
        }
    } catch (error) {
        console.error('Error fetching titles:', error.message || error);
        return res.status(500).json({ error: 'Failed to fetch titles' });
    }
});


// Fetches the full paragraph data when a title is selected
router.post('/get_full_paragraph_by_title', authenticateToken, async (req, res) => {
    const { topic, title } = req.body;

    if (!topic || !title) {
        return res.status(400).json({ error: 'Topic and title are required' });
    }

    try {
        const db = await connectToDatabase();
        const problemsetCollection = db.collection('problemset');

        // Find the document with the specified topic and title
        const result = await problemsetCollection.findOne({
            skill: "Reading",
            topic: topic,
            "problems.title": title, // Use 'problems' instead of 'statements'
        });

        if (result && result.problems) {
            // Find the full paragraph data for the selected title
            const paragraph = result.problems.find(problem => problem.title === title);

            // Return the full paragraph data
            res.json({
                paragraph,
            });
        } else {
            res.status(404).json({ error: 'No paragraph found for this title' });
        }
    } catch (error) {
        console.error('Error fetching paragraph:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch paragraph' });
    }
});


router.post('/generateWritingPrompt', authenticateToken, async(req, res)  => {
    var {type, content, subtype} = req.body;
    if(content === '') content = 'random';
    var prp = '';
    if(subtype !== '' && type === "Writing Task 2")  prp = ('The question should require user to discuss "' + subtype + '"')
    else if(subtype !== '') prp = ('The chart is a ' + subtype); 
    var ntble = '';
    if(subtype.includes('Table')) ntble = "Output no table data."
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `Give me a IELTS ${type} problem. ${prp}. Base on ${content} topic. ${ntble}.Only output the prompt, print nothing else`}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    var task = response.data.choices[0].message.content.trim();

    // console.log(task);
    //2 graph: Two pie chart & Multiple graphs

    // if(subtype.includes('Two') || subtype.includes('Multiple')){

    // }
    // else{
    //     const response_2 = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    //         model: model,
    //         messages: [{ role: 'system', content: `Give me an data as a json to create a chart (graph/table) for IELTS ${type} problem. ${prp}. Prompt: ${task}. ${ntble}. Data must contain randomness, have significant fluctuations (increase, decrease,...) for participant to describe. Only output the data, print nothing else`}],
    //     }, {
    //         headers: {
    //             'Authorization': `Bearer ${openRouterApiKey}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });

    //     var data = response_2.data.choices[0].message.content.trim();
    //     res.json({content: data});
    // }


    res.json({content: task});
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