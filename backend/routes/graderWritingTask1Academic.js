const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch')
const { connectToDatabase } = require('../utils/mongodb');
const { authenticateToken } = require('../middleware/authMiddleware');
const { secret } = require('../config/config');
const { OPENROUTER_API_KEY } = require('../config/config');

const router = express.Router();

// the main part of the code, asks ai to evaluate the response
// -------------------------------------------------------------------------------------------------------

let typeList = ["the content and logic that the response presented", "the coherence, cohesion and the overall clarity", "the lexical resource", "the grammatical range and its accuracy"];
let category = ["Task Response", "Cohesion and Coherence", "Lexical Resource", "Grammatical Range and Accuracy"];

function getFeedback(str) {
    // Split the string into an array of lines
    const lines = str.split('\n');
    
    // Remove the first line and join the rest
    lines.shift(); // Remove the first line from the array
    return lines.join('\n'); // Join the remaining lines back into a single string
}

function getBand(str) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= '0' && str[i] <= '9') {
            return str[i];
        }
    }
    return 0;
}

async function askAiTaskResponse(prompt, response, type, chartData) {
    let criterion = {
        "type": category[type],
        "band": 1,
    }

    let formattedPromptResponse =
        `Please grade this IELTS Task 1 Academic Response for me, in terms of solely ${typeList[type]} or more widely known as ${category[type]}.
Alongside with the prompt, you will also be given information raw data.
Here's the raw data: 
"${chartData}"
Here's the prompt: 
"${prompt}"
Here's the candidate response: 
"${response}"
Please produce the output in the format (without the square brackets please):
[Band Score]
[Concise feedback]
      `;

    try {
        let verdict = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5",
                "messages": [
                    { "role": "user", "content": formattedPromptResponse }
                ],
                "top_p": 1,
                "temperature": 0.7,
                "repetition_penalty": 1,
            })
        });

        let apiResponse = await verdict.json();
        let response = apiResponse.choices[0].message.content
        criterion.response = getFeedback(response);
        criterion.band = getBand(response);
    } catch (error) {
        console.error("Error:", error);
        criterion.detailed_response = error;
        criterion.band = 1;
    }
    return criterion;
}

async function extrapolateChart(img) {
    try {
        let verdict = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5",
                "messages": [
                    {
                        "role": "user",
                        "content": "Can you break down the data into text in this but still retain every single detail? Please only output the data from the chart and/or table (no summaries, opinion, just data ok?) in plain text and no markdown/html formatting and styling",
                    },
                    {
                        "role": "user",
                        "content": { "image_url": img }
                    }
                ],
                "top_p": 1,
                "temperature": 0.7,
                "repetition_penalty": 1,
            })
        });

        let apiResponse = await verdict.json();
        return apiResponse.choices[0].message.content;  // Return the chart data as text
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function grader(prompt, response, img) {
    let evaluation = [];
    const chartData = await extrapolateChart(img)
    for (let i = 0; i < 4; i++) {
        let criterion = await askAiTaskResponse(prompt, response, i, chartData);
        evaluation.push(criterion);
    }
    return evaluation;
}
// -------------------------------------------------------------------------------------------------------

router.post("/writingtask1", authenticateToken, async (req, res) => {
    try {
        const { prompt, response, image } = req.body;

        if (!prompt || !response) {
            return res.status(400).json({ error: "'prompt', 'response' and 'image' are required." });
        }

        let evaluation = await grader(prompt, response, image);

        return res.status(200).json(evaluation);
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;