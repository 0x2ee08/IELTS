const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken, authorizeTeacher } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');

const app = express();

const router = express.Router();

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function convertToIELTSBand(score, maxScore) {
    const d = maxScore / 9;
    if (d === 0) return 0;

    const x = Math.floor(score / d);
    const lowerBound = x * d;
    const upperBound = (x + 1) * d;
    const middle1 = lowerBound + d / 3;
    const middle2 = lowerBound + 2 * (d / 3);
    
    let band = x;
    if (score >= middle1 && score <= middle2) {
        band += 0.5;
    } else if (score > middle2 && score <= upperBound) {
        band += 1;
    }
    
    return Math.round(Math.min(Math.max(band, 1), 9));
}

router.post('/get_problemlist', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('contest');

        const result = await problemsCollection.find({}, { projection: { id: 1, _id: 0 } })
            .sort({ time_created: -1 })
            .toArray();

        res.json({ problemlist: result });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/get_problem_type', authenticateToken, async (req, res) => {
    const { id } = req.body;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('contest');

        const result = await problemsCollection.findOne({id: id}, { projection: { type: 1,_id: 0 } })

        res.json({ type: result.type });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getProblemDescription', authenticateToken, async (req, res) => {
    const { id } = req.body;
    const username = req.user;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('contest');

        const result = await problemsCollection.findOne({id: id}, { projection: { problemName: 1, startTime: 1, endTime: 1, created_by: 1,_id: 0 } })

        res.json({ data: result });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/getSpeakingProblem', authenticateToken, async (req, res) => {
    const { id } = req.body;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('contest');

        const result = await problemsCollection.findOne({id: id})

        res.json({ task: result.taskArray });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/getSpeakingAnswer', authenticateToken, async (req, res) => {
    const { id } = req.body;
    const { username } = req.user;
    try {
        const db = await connectToDatabase();
        const problemsCollection = db.collection('user_answer');

        let query = {
            submit_by: username,
            contestID: id,
            $or: [
                { status: true },
                { status: { $exists: false } }
            ]
        };

        const result = await problemsCollection.find(query).toArray();
        // console.log("--------");
        // console.log(result);
        const extractedResults = result.map((item, index) => ({
            ...item.answer.result.reduce((acc, value, idx) => {
                acc[idx] = value; // Use the index of item.answer as the key and value as the value
                return acc;
            }, {}),
            task_id: item.task_id,
            time_created: item.submit_time
        }));
        // console.log(extractedResults)
        // const userAnswer = result.userAnswer.find(answer => answer.username === username);

        res.json({ answer: {username, "result": extractedResults} });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/add_new_speaking_answer', authenticateToken, async (req, res) => {
    let { id, task_id, task, audioData } = req.body;
    const { username } = req.user;
    const time_created = new Date();

    try {
        const db = await connectToDatabase();

        const contestCollection = db.collection('contest');
        const contest = await contestCollection.findOne({ id: id });

        if (contest.accessUser !== "" && !contest.accessUser.split(',').includes(username)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const submissionCollection = db.collection('user_answer');
        const newSubmission = {
            type: 'Speaking',
            id: generateRandomString(20),
            contestID: id,
            task_id: task_id,
            // answer: result,
            audioData: audioData,
            questions: task.questions,
            submit_by: username,
            // result: result,
            status: false,
            visibility: (contest.accessUser === '' ? 'public':'private'),
            submit_time: new Date().toISOString()
        };
        await submissionCollection.insertOne(newSubmission);

        try {
            const response = await fetch(`${config.API_PRONOUNCE_URL}api_pronounce/updateQueue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include token if required
                },
                body: JSON.stringify({ submission_id: newSubmission.id, contestID: newSubmission.contestID, task_id, submit_time })
            });
            if (response.ok) {
                const result = await response.json();
                console.log('Queue updated successfully:', result);
            }
            else{
                const errorData = await response.json();
                console.error(`Error updating queue: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending request to /updateQueue:', error);
        }

        // if (time_created <= new Date(contest.endTime)) {
        //     const rankingCollection = db.collection('ranking');
        //     let ranking = await rankingCollection.findOne({ id: id });

        //     if (!ranking) {
        //         await rankingCollection.insertOne({
        //             id: id,
        //             data: []
        //         });
        //         ranking = await rankingCollection.findOne({ id: id });
        //     }

        //     let userRanking = ranking.data.find(entry => entry.username === username);

        //     if (!userRanking) {
        //         await rankingCollection.updateOne(
        //             { id: id },
        //             {
        //                 $push: {
        //                     data: {
        //                         username: username,
        //                         score: Array(contest.taskArray.length).fill(0)
        //                     }
        //                 }
        //             }
        //         );
        //         ranking = await rankingCollection.findOne({ id: id });
        //         userRanking = ranking.data.find(entry => entry.username === username);
        //     }

        //     let total = 0, mx = 0;
        //     for(let i=0; i<result.length; i++) {
        //         total = total + result[i].band.total;
        //         mx = mx + 9;
        //     }

        //     const currentScore = userRanking.score[task_id] || 0;
        //     const updatedScore = Math.max(currentScore, convertToIELTSBand(total, mx));

        //     await rankingCollection.updateOne(
        //         { id: id, "data.username": username },
        //         {
        //             $set: {
        //                 [`data.$.score.${task_id}`]: updatedScore
        //             }
        //         }
        //     );
        // }

        res.json({ success: true, message: 'Answer updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getSpeakingGrading', authenticateToken, async (req, res) => {
    const { id, task_id } = req.body;
    const { username } = req.user;

    try {
        const db = await connectToDatabase();
        const problemCollection = db.collection('user_answer');
        let query = {
            contestID: id,
            task_id: task_id,
            $or: [
                { status: true },
                { status: { $exists: false } }
            ]
        };
        // console.log(query)
        const result = await problemCollection.find(query).toArray();
        console.log(result);
        const extractedResults = result.map(item => item.answer.result);
        // console.log(skibidi);
        // const extractedResults = skibidi.map(innerArray => 
        //     innerArray.map(item => ({ band: item.band }))
        //   );
          
        //   console.log(extractedResults);
        // console.log(result);
        // console.log(extractedResults)

        // const userAnswerIndex = problem.userAnswer.findIndex(answer => answer.username === username);

        // if(userAnswerIndex === -1) res.json({ success: true, band: [] });
        // else {
        //     const userAnswer = problem.userAnswer[userAnswerIndex];
        //     const band = userAnswer.result.filter(item => item.task_id === task_id);
        res.json({ success: true, band: extractedResults });
        // }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;