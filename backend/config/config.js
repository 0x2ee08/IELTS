require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5001,
    secret: process.env.JWT_SECRET,
    MODEL_NAME: process.env.MODEL_NAME,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    URL_SERVER: process.env.URL_SERVER,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
    TEDTALK_ID: process.env.TEDTALK_ID,
    RAPID_API_KEY: process.env.RAPID_API_KEY,
    MODEL_CHATBOT_NAME: process.env.MODEL_CHATBOT_NAME,
    VOCAB_MODEL_NAME: process.env.VOCAB_MODEL_NAME,
    STScoreAPIKey: process.env.STS_CORE_API_KEY,
    SPEAKING_MODEL_NAME: process.env.SPEAKING_MODEL_NAME,
    MODEL_QUIZZ_NAME: process.env.MODEL_QUIZZ_NAME,
    LISTENING_GENERATE_MODEL_NAME: process.env.LISTENING_GENERATE_MODEL_NAME,
};
