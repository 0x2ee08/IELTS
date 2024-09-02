const axios = require('axios');
const fs = require('fs');
const path = require('path');
const lemmatize = require('wink-lemmatizer');
const csv = require('csv-parser');

// Define the cache file path
const cacheFilePath = path.join(__dirname, 'word_cache.json');

// Load cache from file
const loadCache = () => {
    if (fs.existsSync(cacheFilePath)) {
        const data = fs.readFileSync(cacheFilePath, 'utf8');
        return JSON.parse(data);
    }
    return {};
};

// Save cache to file
const saveCache = (cache) => {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
};

// Function to fetch word details from Dictionary API
const fetchWordDetails = async (word) => {
    const cache = loadCache();
    // Check if the word is in the cache
    if (cache[word]) {
        // console.log(`Cache hit for word: ${word}`);
        return cache[word];
    }

    try {
        // console.log(`Fetching details for word: ${word}`);
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const { phonetic = 'none', meanings = [] } = response.data[0] || {};
        const firstMeaning = meanings.length > 0 ? meanings[0].definitions[0].definition : null;
        const wordDetails = { phonetic, definition: firstMeaning };

        // Update cache with the new response
        const updatedCache = { ...cache, [word]: wordDetails };
        saveCache(updatedCache);

        // console.log("Details fetched and cache updated.");
        return wordDetails;
    } catch (error) {
        // console.log(error);
        if (error.response && error.response.data.title === "No Definitions Found") {
            // Update cache with no definition
            const updatedCache = { ...cache, [word]: { phonetic: 'none', definition: null } };
            saveCache(updatedCache);
            return { phonetic: 'none', definition: null };
        }
        throw error;
    }
};

// Load CEFR data from CSV file
const loadCEFRData = () => {
    return new Promise((resolve, reject) => {
        const cefrMap = {};
        fs.createReadStream(path.join(__dirname, 'CEFR.csv'))
            .pipe(csv())
            .on('data', (row) => {
                const headword = row.headword.split('/')[0].toLowerCase(); // Handle variants like 'a.m./A.M./am/AM'
                cefrMap[headword] = row.CEFR;
            })
            .on('end', () => {
                resolve(cefrMap);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Utility function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get vocabulary from content
const getVocab = async (content) => {
    const cefrMap = await loadCEFRData();
    const vocab = {
        "A1": [],
        "A2": [],
        "B1": [],
        "B2": [],
        "C1": [],
        "C2": [],
        "undefined": []
    };

    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'so', 'because', 'although', 'if', 'when', 'while', 'before', 'after', 'since', 'until', 'unless',
        'in', 'on', 'at', 'with', 'to', 'for', 'of', 'by', 'about', 'as', 'like', 'between', 'among', 'under', 'over', 'have', 'has', 'these', 'there', 'are', 'is', 'am', 'she', 'he', 'it', 'who', 'what', 'when', 'why', 'by', 'how', 'many', 'much', 'less',
        'from', 'as', 'not', 'had', 'also', 'as', 'their', 'him', 'her', 'its', 'themself', 'theirself', 'itself', 'herself', 'himself', 'be', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'can', 'cannot', 'cant'
    ]);

    let all_words = content.split(/\s+/)
        .map(word => word.toLowerCase().replace(/[^\w\s]|[\d]/g, '').trim())
        .filter(word => word !== '' && !commonWords.has(word));

    all_words = Array.from(new Set(all_words));

    const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2", "undefined"];

    for (let _word of all_words) {
        let l1 = lemmatize.adjective(_word);
        let l2 = lemmatize.noun(_word);
        let l3 = lemmatize.verb(_word);

        let fword;
        if (l1.length !== _word.length) {
            fword = l1;
        } else if (l2.length !== _word.length) {
            fword = l2;
        } else if (l3.length !== _word.length) {
            fword = l3;
        } else {
            fword = _word;
        }

        if (commonWords.has(fword)) continue;

        const cefrLevel = cefrMap[fword] || 'undefined';
        
        // Add a delay before fetching details
        await delay(200); // Adjust the delay as needed (e.g., 200ms)

        const wordDetails = await fetchWordDetails(_word);

        // Skip the word if no definition is found
        if (wordDetails.definition === null) continue;

        let currentLevelIndex = cefrLevels.indexOf(cefrLevel);
        let existingLevelIndex = cefrLevels.length;

        for (let level of cefrLevels) {
            if (vocab[level].find(w => w.word === _word)) {
                existingLevelIndex = cefrLevels.indexOf(level);
                break;
            }
        }

        if (currentLevelIndex < existingLevelIndex) {
            if (existingLevelIndex < cefrLevels.length) {
                vocab[cefrLevels[existingLevelIndex]] = vocab[cefrLevels[existingLevelIndex]].filter(w => w.word !== _word);
            }

            vocab[cefrLevel].push({
                'word': _word,
                'lemmatizer': fword,
                'phonetic': wordDetails.phonetic,
                'definition': wordDetails.definition
            });
        }
    }

    return vocab;
};

// Export the function using CommonJS syntax
module.exports = { getVocab };
