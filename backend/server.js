const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./utils/mongodb');
const {authenticateToken, authorizeTeacher, authenticateTokenContest} = require('./middleware/authMiddleware');
const multer = require('multer');
const cors = require('cors');

require('dotenv').config();

const databaseRoutes = require('./routes/databaseRoutes');
const userRoutes = require('./routes/userRoutes');
const sendcodeRoutes = require('./routes/sendcodeRoutes');
const schoolclassRoutes = require('./routes/schoolclassRoutes');
const writingRoutes = require('./routes/writingRoutes');
const blogsRoutes = require('./routes/blogsRoutes');
const tedtalkRoutes = require('./routes/tedtalkRoutes');
const generateReadingParagraphRoutes = require('./routes/genReadingRoutes');
const contestRoutes = require('./routes/contestRoutes');

const app = express();
const PORT = process.env.PORT || 8080;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: [' Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json()); 

app.use('/api', databaseRoutes);
app.use('/api', userRoutes);
app.use('/api', sendcodeRoutes);
app.use('/api', schoolclassRoutes);
app.use('/api', writingRoutes);
app.use('/api', blogsRoutes);
app.use('/api', tedtalkRoutes);
app.use('/api', generateReadingParagraphRoutes);
app.use('/api', contestRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
