const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');
const { connectToDatabase } = require('../utils/mongodb');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Multer setup for file upload


module.exports = router;
