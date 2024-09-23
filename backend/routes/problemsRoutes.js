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
        const problemsCollection = db.collection('contest');

        const result = await problemsCollection.findOne({id: id})
        const userAnswer = result.userAnswer.find(answer => answer.username === username);

        res.json({ answer: userAnswer });
    } catch (error) {
        console.error('Error fetching blog list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/add_new_speaking_answer', authenticateToken, async (req, res) => {
    const { id, result, task_id, task } = req.body;
    const { username } = req.user;
    const time_created = new Date();

    try {
        const db = await connectToDatabase();
        const problemCollection = db.collection('contest');

        const problem = await problemCollection.findOne({ id });
        const userAnswerIndex = problem.userAnswer.findIndex(answer => answer.username === username);

        if (userAnswerIndex === -1) {
            await problemCollection.updateOne(
                { id },
                {
                    $push: {
                        userAnswer: {
                            username,
                            result: [{ ...result, task_id, time_created }]
                        }
                    }
                }
            );
        } else {
            await problemCollection.updateOne(
                { id, 'userAnswer.username': username },
                {
                    $push: {
                        'userAnswer.$.result': { ...result, task_id, time_created }
                    }
                }
            );
        }

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
            answer: result,
            questions: task.questions,
            submit_by: username,
            result: result,
            visibility: (contest.accessUser === '' ? 'public':'private'),
            submit_time: new Date().toISOString()
        };
        await submissionCollection.insertOne(newSubmission);

        res.json({ success: true, message: 'Answer updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/addSpeakingGrading', authenticateToken, async (req, res) => {
    const { id, task_id, choosenRecord, choosenMessage, band, feedback } = req.body;
    const { username } = req.user;

    console.log(task_id);

    try {
        const db = await connectToDatabase();
        const problemCollection = db.collection('contest');

        const problem = await problemCollection.findOne({ id });
        const userAnswerIndex = problem.userAnswer.findIndex(answer => answer.username === username);

        const userAnswer = problem.userAnswer[userAnswerIndex];

        let cnt = -1;
        let correctRecord = choosenRecord;
        for(let i=userAnswer.result.length-1; i>=0; i--) {
            if(userAnswer.result[i].task_id === task_id) {
                cnt += 1;
                if(cnt === choosenRecord) {
                    correctRecord = i;
                    break;
                }
            }
        }

        console.log(correctRecord, choosenMessage);

        userAnswer.result[correctRecord][choosenMessage] = {
            data: userAnswer.result[correctRecord][choosenMessage].data,
            audioData: userAnswer.result[correctRecord][choosenMessage].audioData,
            band: band !== undefined ? band : userAnswer.result[correctRecord][choosenMessage].band,
            feedback: feedback !== undefined ? feedback : userAnswer.result[correctRecord][choosenMessage].feedback
        };

        await problemCollection.updateOne(
            { id },
            { $set: { [`userAnswer.${userAnswerIndex}`]: userAnswer } }
        );

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
        const problemCollection = db.collection('contest');

        const problem = await problemCollection.findOne({ id });
        const userAnswerIndex = problem.userAnswer.findIndex(answer => answer.username === username);

        if(userAnswerIndex === -1) res.json({ success: true, band: [] });
        else {
            const userAnswer = problem.userAnswer[userAnswerIndex];
            const band = userAnswer.result.filter(item => item.task_id === task_id);
            res.json({ success: true, band: band });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;