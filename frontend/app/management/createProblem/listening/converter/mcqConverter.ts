export interface mcq {
    statement: string[];
    choices: string[];
    answers: string[];
    explanation: string[];
}
  
function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = array.slice();
    const n = shuffledArray.length;

    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
}

function parseMcqData(input: string): mcq {
    const formattedInput = input.replace(/\n\n/g, '\n').trim();
    const lines = formattedInput.split('\n');

    const statement: string[] = [];
    const choices: string[] = [];
    const answers: string[] = [];
    const explanation: string[] = [];

    let currentQuestion = '';
    let currentChoices: string[] = [];
    let currentAnswer = '';
    let currentExplanation = '';

    lines.forEach((line) => {
        line = line.trimStart();
        console.log(line);
        if (line.startsWith('- question:')) {
            if (currentQuestion && currentAnswer && currentExplanation) {
                statement.push(currentQuestion);
                choices.push(shuffleArray(currentChoices).join(', '));
                answers.push(currentAnswer);
                explanation.push(currentExplanation);
            }
    
            currentQuestion = line.split(': ')[1].trim();
            currentChoices = [];
        } else if (line.startsWith('- choices:')) {
            currentChoices = line
            .split(': ')[1]
            .replace('[', '')
            .replace(']', '')
            .split(', ')
            .map((choice) => choice.trim().trimStart().trimEnd().replace(/^"|"$/g, ''));
        } else if (line.startsWith('- explanation:')) {
            currentExplanation = line.split(': ')[1].trim();
        } else if (line.startsWith('- answer:')) {
            currentAnswer = line.split(': ')[1].trim();
        }
    });

    if (currentQuestion && currentAnswer && currentExplanation) {
        statement.push(currentQuestion);
        choices.push(shuffleArray(currentChoices).join(', '));
        answers.push(currentAnswer);
        explanation.push(currentExplanation);
    }

    return {
        statement,
        choices,
        answers,
        explanation,
    };
}

export const mcqConverter = async (message: string): Promise<mcq> => {
    const mcqJson = parseMcqData(message);
    console.log(mcqJson);
    return mcqJson;
};