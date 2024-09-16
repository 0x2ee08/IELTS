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
let contextTaskResponse = `
* NOTE: DO NOT TELL PEOPLE TO ADD STATISTICS OR NUMBERS UNLESS THE PROMPT EXPLICITLY REQUIRES TO DO SO
You are a specialist in grading IELTS Writing Part 2 responses, especially when grading how well an essay has responded to the prompt.

Your grading criteria is:
Band 9: The prompt is appropriately addressed and explored in depth. A clear and fully developed position is presented which directly answers the question(s). Ideas are relevant, fully extended and well supported. Any lapses in content or support are extremely rare.

Band 8: The same thing as Band 9, but there are a few lapses in content or logic within the essay. If you think you should give a Band 8, you should give a Band 9 instead.

Band 7: The main parts of the prompt are appropriately addressed. There exists a clear and developed position. Main ideas are extended, but rarely, material might be inaccurate/irrelevant. If you think you should give a Band 7, you should give a Band 8 instead.

Band 6: The main parts of the prompt are appropriately addressed. The main ideas of the essay are appropriately developed. There is an attempt to present a clear position, but the conclusions might be unclear, unjustified, or repetitive. Main ideas are relevant, although not fully developed or lack clarity, while some supporting arguments and evidence may be inadequate or irrelevant.

Band 5: Do NOT give an essay higher than a Band 5 if the essay fails to fully address the prompt. There is an unclear development of positions. Main ideas might be repetitive, limited, or irrelevant.

Band 4: Do NOT give an essay higher than a Band 4 if the format of the response is inappropriate (the response was not in the form of an essay). The prompt is only partially tackled. A position is discernible, the reader would most likely have a hard time finding it. Main ideas lack support, relevance, or clarity.

Band 3: There is no attempt to tackle the prompt, likely stemming from a misunderstanding. No relevant positions can be identified, and there is little direct response to the questions. There are few ideas and these might be irrelevant or insufficiently developed.

Band 2: The response is hardly related to the prompt. There might be an attempt in developing ideas, but most of those would be irrelevant.

Band 1: ALL RESPONSES THAT HAVE 20 WORDS OR LESS are rated at Band 1. The response is completely irrelevant.

Band 0: The response is completely empty or written in a language that is not English.
`;
let contextCohesionCoherence =
    `
You are a specialist in grading IELTS Writing Part 2 responses, especially grading the coherence and cohesion of the responses itself.

Here's your grading criteria:
Band 9: The message can be followed effortlessly. Cohesion is used in such a way that it very rarely attracts attention. Any lapses in coherence or cohesion are minimal. Paragraphing is skilfully managed.

Band 8: The same thing as Band 9, but there are a few lapses in sequencing information and ideas within the essay. If you think you should give a Band 8, you should give a Band 9 instead.

Band 7: Information and ideas are logically organised, and there is a clear progression, (a few lapses may occur, but these are minor). A range of cohesive devices including reference and substitution is used flexibly but with some inaccuracies. It might read a bit mechanical or robotic, but if it doesn't disrupt the flow too much, it should get a Band 7. Paragraphing is generally used effectively to support overall coherence, and the sequencing of ideas within a paragraph is generally logical. If you think you should give a Band 7, you should give a Band 8 instead.

Band 6: Information and ideas are generally arranged coherently and there is a clear overall progression. Cohesive devices are used to some good effect but cohesion within and/or between sentences may be faulty or feel mechanical (ranging from making the flow unnatral to faults in sequencing ideas) due to misuse, overuse or omission. The use of referencing may lack flexibility or clarity and result in some repetition or error. Paragraphing may not always be logical and/or the central topic may lack clarity.

Band 5: Do NOT give an essay higher than a Band 5 if the essay has inadequate paragraphing (missing paragraphs, unconventional format). There is an attempt in organizing ideas logically, but not wholly, and there may be a lack of clear progression. The relationship of ideas can be followed but nevertheless, there is an unnatural flow of ideas. There is limited/overuse of cohesive devices and usage may lack accuracy. Referencing and subsitution lacks accuracy/may be inadequate.

Band 4: Organization of ideas and information is not coherent, and there is no clear progression within the response. The relationship between ideas and information is terribly presented. Referencing is inaccurate and inadequate. There maybe no paragraphing/no clear main topic within paragraphs.

Band 3: Organizaion of ideas are non-existent. Everything else related to cohesion and coherence is the same thing as Band 4.

Band 2: Do NOT give a response higher than a Band 2 if the entire response is off-topic. Everything else is the same thing as Band 3.

Band 1: ALL RESPONSES THAT HAS 20 WORDS OR LESS are rated at Band 1. The response fails to convey any message.

Band 0: The response is completely empty or written in a language other than English.
`;
let contextLexicalResource =
    `
You are a specialist in grading IELTS Writing Part 2 responses, especially grading the lexical resource used in the responses itself.
Here's your grading criteria:
Band 9: The response presents a wide range of vocabulary and the usage is precise with very natural and sophisticated control of lexical features. Minor errors in spelling and word formation are extremely rare and have minimal impact on communication 

Band 8: The same thing as Band 9, but there are a few inaccuracies in word choice and collocation. If you think you should give a Band 8, you should give a Band 9 instead.

Band 7: The lexical resource is sufficient enough to allow some flexibility and precision. An awareness of style and collocation is evident, though there are some inappropriacies. There are a few errors in spelling or word formation, but they do not affect overall clarity. If you think you should give a Band 7, you should give a Band 8 instead.

Band 6: The vocabulary might sound very simple but generally adequate to tackle the prompt. The meaning is generally clear in spite of a rather restricted range or a lack of precision in word choice. If there is a wide range of vocabulary, there will be higher degrees of inaccuracy and inappropriacy. There are some errors in spelling or word formation, but these do not impede communication. 

Band 5: The resource is limited but minimally adequate for the task. There will be a very small range of vocabulary used, consisting of mostly simple words. There may be frequent lapses in the appropriacy of word choice, and there are frequent word repetitions/simplications.
Errors in spelling or word formation may be noticable and impede communication.

Band 4: DO NOT give a response higher than a Band 4 if the vocabulary used is unrelated to the task. There may be inappropriate use of lexical chunks (memorised phrases, formulaic language, and unrelated lexical material). Inappropriate word choice or errors in word formation may impede meaning.

Band 3: The resource is inadequate for the prompt. Over-dependency on input material and memorised language is evident. Control of word choice and/or spelling is very limited, and errors predominate. These errors may severely impede meaning.

Band 2: The resource is extremely limited with few recognisable strings, apart from memorised phrases. There is no apparent control of word formation and/or spelling.

Band 1: ALL RESPONSES THAT HAS 20 WORDS OR LESS are rated at Band 1. No resource is apparent, except for a few isolated words.

Band 0: The response is completely empty or written in a language other than English.
`;
let contextGrammaticalRangeAccuracy =
    `
You are a specialist in grading IELTS Writing Part 2 responses, especially in grading the grammatical range of a response.
Here's your grading criteria:
Band 9: A wide range of structures within the scope of the task is used with full flexibility and control. Punctuation and grammar are used appropriately throughout. Minor errors are extremely rare and have
minimal impact on communication.

Band 8: The same thing as Band 9, but there are a few grammatical error/inappropriacies, which only have minimal impact on communication. If you think you should give a Band 8, you should give a Band 9 instead.

Band 7: A variety of complex structures is used with some flexibility and accuracy. Grammar and punctuation are generally well controlled, and error-free sentences are frequent. A few errors in grammar may persist, but these do not impede communication. If you think you should give a Band 7, you should give a Band 8 instead.

Band 6: A mix of simple and complex sentence forms is used but flexibility is limited. Examples of more complex structures are not marked by the same level of accuracy as in simple structures. Errors in grammar and punctuation occur, but rarely impede communication.

Band 5: The range of structures is limited and rather repetitive. Although complex sentences are attempted, they tend to be faulty, and the greatest accuracy is achieved on simple sentences. Grammatical errors may be frequent and cause some difficulty for the reader. Punctuation may be faulty.

Band 4: DO NOT give a response higher than a Band 4 if most of the sentences only have one clause and subordinate clauses are rare. Some structures are produced accurately but grammatical errors are frequent and may impede meaning. Punctuation is often faulty or inadequate.

Band 3: Sentence forms are attempted, but errors in grammar and punctuation predominate (except in memorised phrases or those taken from the input material). This prevents most meaning from coming through.

Band 2: There is little or no evidence of sentence forms (except in memorised phrases).

Band 1: ALL RESPONSES THAT HAS 20 WORDS OR LESS are rated at Band 1. No rateable language is evident.

Band 0: The response is completely empty or written in a language other than English.
`;

let contextList = [contextTaskResponse, contextCohesionCoherence, contextLexicalResource, contextGrammaticalRangeAccuracy];
let typeList = ["the content and logic that the response presented", "the coherence, cohesion and the overall clarity", "the lexical resource", "the grammatical range and its accuracy"];
let category = ["Task Response", "Cohesion and Coherence", "Lexical Resource", "Grammatical Range and Accuracy"];

async function grader(prompt, response) {
    let evaluation = [];
    for (let i = 0; i < 4; i++) {
        let criterion = await askAiTaskResponse(prompt, response, i);
        evaluation.push(criterion);
    }
    return evaluation;
}
const response_schema = {
    "type": "object",
    "properties": {
        band: {
            "description": "The band of the respective criterion (Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy) when marking the IELTS essay",
            "type": "integer"
        },
        positiveresponse: {
            "description": "The detailed positive feedback on the IELTS essay",
            "type": "string"
        },
        negativeresponse: {
            "description": "The detailed negative feedback on the IELTS essay and suggestions",
            "type": "string"
        }
    },
    "additionalProperties": false,
    "required": [
        "band",
        "positiveresponse",
        "negativeresponse"
    ]
}

async function askAiTaskResponse(prompt, response, type) {
    let formattedPromptResponse =
        `Please grade this IELTS Task 2 Response for me, in terms of solely ${typeList[type]} or more widely known as ${category[type]}.
      Here's the prompt: "${prompt}"
      Here's the candidate response: "${response}"
      DO NOT RECOMMEND THE USER TO INCLUDE STATISTIC UNLESS STATED IN THE PROMPT OTHERWISE.
      Also it is worth noting that if a point has evidence that make sense, it is considered expanded **deep enough**. DO NOT RECOMMEND THE USER TO EXPAND A POINT IF THERE IS AN EXAMPLE OR EVIDENCE
      For the 'band' field in the json output, you return the band for ${category[type]}, in 'positiveresponse', you put the detailed positive feedback on the essay (how good was it,..), and in 'negativeresponse', you put the negative feedback on the essay and suggestions to make it better`;

    try {
        let verdict = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini-2024-07-18",
                "messages": [
                    { "role": "system", "content": contextList[type] },
                    { "role": "user", "content": formattedPromptResponse }
                ],
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "description": "Grading of the IELTS Writing Task 2 response",
                        "name": "json_response",
                        "schema": response_schema,
                        "strict": true
                    }
                },
                "top_p": 1,
                "temperature": 0.3,
                "repetition_penalty": 1,
            })
        });

        let apiResponse = await verdict.json();
        let criterion = JSON.parse(apiResponse.choices[0].message.content);
        criterion["type"] = category[type];
        if (criterion["band"] >= 8){
            criterion["response"] = criterion["positiveresponse"];
            criterion["band"] = 9;
            return criterion
        }
        else if (criterion["band"] >= 6 && criterion["positiveresponse"].length > ((criterion["negativeresponse"].length)/4)*3){
            criterion["band"] = criterion["band"] + 1;
        }
        criterion["response"] = criterion["positiveresponse"] + "\n" + criterion["negativeresponse"];
        return criterion;
    } catch (error) {
        console.error("Error:", error);
    }
}

// -------------------------------------------------------------------------------------------------------

router.post("/writing", authenticateToken, async (req, res) => {
    try {
        const { prompt, response } = req.body;

        if (!prompt || !response) {
            return res.status(400).json({ error: "Both 'prompt' and 'response' are required." });
        }

        let evaluation = await grader(prompt, response);

        return res.status(200).json(evaluation);
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;