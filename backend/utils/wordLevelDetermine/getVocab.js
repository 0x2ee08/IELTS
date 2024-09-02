var lemmatize = require('wink-lemmatizer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

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

const getVocab = async (content) => {
    const cefrMap = await loadCEFRData();

    let vocab = {
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
            vocab[cefrLevel].push({'word': _word, 'lemmatizer' : fword});
        }

        // console.log(`${_word} -> ${fword} (CEFR: ${cefrLevel})`);
    }

    // console.log(vocab);

    return vocab;
};

// Export the function using CommonJS syntax
module.exports = { getVocab };
