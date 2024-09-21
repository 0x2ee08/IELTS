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
                problemName: contest.problemName,
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

router.post('/getContest', async (req, res) => {
    try {
        const { idContest } = req.body; // Extract contest ID and title from the request body

        if (!idContest) {
            return res.status(400).json({ message: "Missing idContest" });
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

        res.status(200).json(contest);
    } catch (error) {
        console.error("Error retrieving vocab:", error);
        res.status(500).json({ message: "Error retrieving vocab" });
    }
});

function transformData(input) {
    let result = {};
    
    // Loop through paragraphs
    input.paragraphs.forEach((paragraph, pIndex) => {
      result[pIndex] = {}; // Create a new paragraph entry
  
      // Loop through sections within each paragraph
      paragraph.sections.forEach((section, sIndex) => {
        result[pIndex][sIndex] = {}; // Create a new section entry
  
        // Loop through questions within each section
        section.questions.forEach((question, qIndex) => {
          result[pIndex][sIndex][qIndex] = {"answer":question.answer, "explanation": question.explanation}; // Map question index to answer
        });
      });
    });
  
    return result;
}

function Reading_gradder(correctAnswer, userAnswer) {
    let result = {
      correct: 0,
      wrong: 0,
      empty: 0,
      total: 0 // Add total count of questions
    };
  
    // Iterate through paragraphs
    for (let pIndex in correctAnswer) {
      if (correctAnswer.hasOwnProperty(pIndex)) {
  
        // Iterate through sections within paragraphs
        for (let sIndex in correctAnswer[pIndex]) {
          if (correctAnswer[pIndex].hasOwnProperty(sIndex)) {
  
            // Iterate through questions within sections
            for (let qIndex in correctAnswer[pIndex][sIndex]) {
              if (correctAnswer[pIndex][sIndex].hasOwnProperty(qIndex)) {
                const correct = correctAnswer[pIndex][sIndex][qIndex];
                const user = userAnswer[pIndex]?.[sIndex]?.[qIndex] || ""; // Get user answer, or empty if undefined
  
                result.total++; // Increment total for every question
  
                if (user === "") {
                  result.empty++;
                } else if (user === correct) {
                  result.correct++;
                } else {
                  result.wrong++;
                }
              }
            }
          }
        }
      }
    }
  
    return result;
}
  

router.post('/submit_contest_reading', authenticateToken, async (req, res) => {
    try {
        const { contestID , answer } = req.body;
        const { username } = req.user;

        if (!contestID) {
            return res.status(400).json({ error: "Missing contestID." });
        }

        if (!answer) {
            return res.status(400).json({ error: "Missing answer." });
        }
        const db = await connectToDatabase();

        const contestCollection = db.collection('contest');
        const contest = await contestCollection.findOne({ id: contestID });

        if (contest.accessUser !== "" && !contest.accessUser.split(',').includes(username)) {
            return res.status(403).json({ message: "Access denied" });
        }

        let correctAnswer = transformData(contest);
        let sresult = Reading_gradder(correctAnswer, answer);

        const submissionCollection = db.collection('user_answer_reading');
        let sid = generateRandomString(20);
        const newSubmission = {
            type: 'Reading',
            id: sid,
            contestID: contestID,
            answer: answer,
            submit_by: username,
            result: sresult,
            visibility: (contest.accessUser === '' ? 'public':'private'),
            submit_time: new Date().toISOString()
        };
        await submissionCollection.insertOne(newSubmission);

        res.json({ submitID: sid});

        
    } catch (error) {
        console.error("Error submitting reading contest:", error);
        res.status(500).json({ message: "Error while submit. Try again!" });
    }
});

router.get('/getAllSubmission', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const Collection = db.collection('user_answer');
        const { username } = req.user;

        let query = {
            submit_by: username
        };

        const availableSubmission = await Collection.find(query).toArray();

        let response = {};
        availableSubmission.forEach((submission, index) => {
            response[index + 1] = {
                type: 'Reading',
                sid: submission.id,
                cid: submission.contestID,
                result: submission.result,
                submit_time: submission.submit_time,
                submit_by: submission.submit_by
            };
        });

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error retrieving submissions:", error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving submissions" });
        }
    }
});

router.get('/getGlobalSubmission', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const Collection = db.collection('user_answer');
        const { username } = req.user;

        let query = {
            // submit_by: username
            visibility: 'public'
        };

        const availableSubmission = await Collection.find(query).limit(50).toArray();

        let response = {};
        availableSubmission.forEach((submission, index) => {
            response[index + 1] = {
                type: submission.type,
                sid: submission.id,
                cid: submission.contestID,
                result: submission.result,
                submit_time: submission.submit_time,
                visibility: submission.visibility,
                submit_by: submission.submit_by
            };
        });

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error retrieving submissions:", error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving submissions" });
        }
    }
});

router.post('/getSubmission', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const Collection = db.collection('user_answer');
        const { username } = req.user;
        const { submissionID } = req.body;
        let query = {
            id: submissionID
            // submit_by: username //should it be private or not, hmmm...
        };

        // console.log(query);

        let submission = await Collection.find(query).toArray();

        submission = submission[0];
        if(!submission){
            return res.status(403).json({ message: "Access denied" });
        }

        // interface Submission {
        //     contest_title: string;
        //     correct_answer: Record<string, any>;
        //   }

        const contestCollection = db.collection('contest');
        const contest = await contestCollection.findOne({ id: submission.contestID });
        // console.log(submission.contestID);

        if (!contest || (contest.accessUser !== "" && !contest.accessUser.split(',').includes(username))) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        let response = {
                type: submission.type,
                sid: submission.id,
                cid: submission.contestID,
                result: submission.result,
                submit_time: submission.submit_time,
                user_answer: submission.answer,
                contest_title: contest.problemName,
                visibility: submission.visibility,
                correct_answer: transformData(contest)
        };

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error retrieving submissions:", error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving submissions" });
        }
    }
});

router.post('/getContestTitle', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const Collection = db.collection('user_answer');
        const { username } = req.user;
        const { contestID } = req.body;
        
        const contestCollection = db.collection('contest');
        const contest = await contestCollection.findOne({ id: contestID });
        // console.log(submission.contestID);

        if (!contest || (contest.accessUser !== "" && !contest.accessUser.split(',').includes(username))) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        let response = {
                title: contest.problemName
        };

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error retrieving submissions:", error);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving submissions" });
        }
    }
});

module.exports = router;