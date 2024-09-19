const axios = require('axios');

const { secret } = require('../../config/config');
const { VOCAB_MODEL_NAME, OPENROUTER_API_KEY } = require('../../config/config');

const model = VOCAB_MODEL_NAME;
const openRouterApiKey = OPENROUTER_API_KEY

const getVocab = async (content) => {
    const vocab = {
        "A1": [],
        "A2": [],
        "B1": [],
        "B2": [],
        "C1": [],
        "C2": [],
        "undefined": []
    };

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: model,
        messages: [{ role: 'system', content: `
            Giving this content """${content}""". List all vocabulary that appear in this document.
            (Skip common word, linking word, prep, ...)f each word,
            then for ALL WORDS give the CEFR level (A1/A2/B1/B2/C1/C2) o phonetics and translation of each word to vietnamse.
            Output this format (print nothing else):
            [WORD 1], [CEFR level], [PHONETICS], [TRANSLATIONS (VIETNAMESE)]
            [WORD 2], [CEFR level], [PHONETICS], [TRANSLATIONS (VIETNAMESE)]
            ... 
            `}],
    }, {
        headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
        }
    });
    var evaluation = response.data.choices[0].message.content.trim();
    const lines = evaluation.split('\n');

    lines.forEach(line => {
        const [word, level, phonetics, meaning] = line.split(',').map(item => item.trim());

        if (vocab[level]) {
            vocab[level].push({
                word: word,
                phonetics: phonetics,
                meaning: meaning
            });
        }
    });
    return vocab;
};

// Export the function using CommonJS syntax
module.exports = { getVocab };
