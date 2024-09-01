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

router.post('/createContest', authenticateToken, async (req, res) => {
    const { type, accessUser, startTime, endTime, problemName,  paragraphs} = req.body;

    const db = await connectToDatabase();
    const contestCollection = db.collection(`contest`);

    console.log(paragraphs)
    //paragraph là toàn bộ đề (gồm 3 secontion, mỗi section có 3 bài...)
    //xem file json t gửi trên discord để bt thêm)
    //nhớ thêm 1 phần kiểm tra tất cả các từ trong paragraphs thuộc trình độ CEFR nào
    // rồi add vào 1 cái mảng vocab nào đấy để lưu vào db

    res.json({"Status" : "Success"});
});

module.exports = router;