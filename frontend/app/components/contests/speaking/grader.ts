import config from '../../../config';

export const grader = async (data: any, question: string): Promise<[any, any]> => {
    let feedback: any = {};
    let band: any = {};

    feedback.pronunciation = data.is_letter_correct_all_words;
    feedback.fluency = "none";
    band.pronunciation = Number(data.pronunciation_accuracy);
    band.fluency = convertToIELTSBand(calculateFluency(data), 1);

    const [lexicalResource, grammar, response] = await Promise.all([
        getSpeakingLexicalResource(question, data.matched_transcripts),
        getSpeakingGrammar(question, data.matched_transcripts),
        getSpeakingTaskResponse(question, data.matched_transcripts),
    ]);

    feedback.lexical = lexicalResource;
    feedback.grammar = grammar;
    feedback.response = response;
    band.lexical = extractBandNumber(lexicalResource);
    band.grammar = extractBandNumber(grammar);
    band.response = extractBandNumber(response);
    band.total = convertToIELTSBand(band.fluency + band.pronunciation + 
        band.grammar + band.response + band.lexical, 45);

    return [band, feedback];
};

const extractBandNumber = (input: string): number => {
    const bandRegex = /\[BAND\]:\s*(\d+(\.\d+)?)/;
    const match = bandRegex.exec(input);
    return match ? parseFloat(match[1]) : 0;
};

const calculateFluency = (detailResult: any): number => {
    const transcriptWords: string[] = detailResult.real_transcript.trim().split(' ');
    const totalWords: number = transcriptWords.length;
    const audioLength: number = detailResult.end_time[detailResult.end_time.length - 1] - detailResult.start_time[0];
    const SR: number = totalWords / audioLength;
    const SRmin: number = Math.min(...transcriptWords.map((_, i) => (transcriptWords[i + 1] ? 1 / (detailResult.end_time[i] - detailResult.start_time[i]) : 0)));
    const SRmax: number = Math.max(...transcriptWords.map((_, i) => (transcriptWords[i + 1] ? 1 / (detailResult.end_time[i] - detailResult.start_time[i]) : 0)));
    const SRnorm: number = (SR - SRmin) / (SRmax - SRmin);

    const pauses: number[] = detailResult.start_time.map((_: number, i: number) =>
        (detailResult.start_time[i + 1] || 0) - (detailResult.end_time[i] || 0)
    );

    const APW: number = pauses.reduce((acc: number, pause: number) => acc + pause, 0) / pauses.length;

    const APWmin: number = Math.min(...pauses);
    const APWmax: number = Math.max(...pauses);
    const APWnorm: number = 1 - (APW - APWmin) / (APWmax - APWmin);

    const APS: number = 2.0; 
    const APSnorm: number = (3.0 - APS) / (3.0 - 1.5); 

    const fillerWords: string[] = ["um", "uh", "like"]; 
    const FWC: number = transcriptWords.filter((word: string) => fillerWords.includes(word)).length;

    const pauseDurations: number[] = pauses.filter((pause: number) => pause > 0);
    const meanPause: number = pauseDurations.reduce((acc: number, pause: number) => acc + pause, 0) / pauseDurations.length;
    const stdDevPause: number = Math.sqrt(pauseDurations.reduce((acc: number, pause: number) => acc + Math.pow(pause - meanPause, 2), 0) / pauseDurations.length);

    const threshold: number = meanPause + 1 * stdDevPause;  
    const PPH: number = pauses.filter((pause: number) => pause > threshold).length;  

    const HFmin: number = 0;  
    const HFmax: number = Math.max(FWC + PPH, 20);
    const HF: number = FWC + PPH;
    const HFnorm: number = 1 - (HF - HFmin) / (HFmax - HFmin);

    let R: number = 0;
    for (let i: number = 0; i < transcriptWords.length - 1; i++) {
        if (transcriptWords[i] === transcriptWords[i + 1]) {
            R++; 
        }
    }

    const Rmin: number = 0;  
    const Rmax: number = Math.max(R, 10);  
    const Rnorm: number = 1 - (R - Rmin) / (Rmax - Rmin);

    const fluency: number = (0.25 * SRnorm) + (0.20 * APWnorm) + (0.15 * APSnorm) + (0.25 * HFnorm) + (0.15 * Rnorm);
    // console.log(fluency, fluency*9.0);
    return fluency;
};

const getSpeakingLexicalResource = async (question: string, answer: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_BASE_URL}api/getSpeakingLexicalResource`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
    });
    const result = await response.json();
    return result.content;
}

const getSpeakingGrammar = async (question: string, answer: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_BASE_URL}api/getSpeakingGrammar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
    });
    const result = await response.json();
    return result.content;
}

const getSpeakingTaskResponse = async (question: string, answer: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${config.API_BASE_URL}api/getSpeakingTaskResponse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
    });
    const result = await response.json();
    return result.content;
}

const convertToIELTSBand = (score: number, maxScore: number) => {
    const d = maxScore / 9;
    if(d == 0) return 0;
    const x = Math.floor(score / d);
    const lowerBound = x * d;
    const upperBound = (x + 1) * d;
    const middle1 = lowerBound + d / 3;
    const middle2 = lowerBound + 2 * (d / 3);
    let band = x;
    if (score >= middle1 && score <= middle2) {
        band += 0.5;
    } else if (score > middle2 && score <= upperBound) {
        band += 1;
    }
    return Math.round(Math.min(Math.max(band, 1), 9));
}
