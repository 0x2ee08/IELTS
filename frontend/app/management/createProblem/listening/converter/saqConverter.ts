export interface saq {
    statement: string[];
    answers: string[];
    explanation: string[];
}

function parseSaqData(input: string): saq {
    const formattedInput = input.replace(/\n\n/g, '\n').trim();
    const lines = formattedInput.split('\n');

    const statement: string[] = [];
    const answers: string[] = [];
    const explanation: string[] = [];

    let currentQuestion = '';
    let currentAnswer = '';
    let currentExplanation = '';

    lines.forEach((line) => {
        line = line.trimStart();
        if (line.startsWith('- question:')) {
            if (currentQuestion && currentAnswer.length && currentExplanation) {
                statement.push(currentQuestion);
                answers.push(currentAnswer); 
                explanation.push(currentExplanation);
            }

            currentQuestion = line.split(': ')[1].trim();
            currentAnswer = '';
        } else if (line.startsWith('- answer:')) {
            currentAnswer = line.split(': ')[1].trim();
        } else if (line.startsWith('- explanation:')) {
            currentExplanation = line.split(': ')[1].trim();
        }
    });

    if (currentQuestion && currentAnswer.length && currentExplanation) {
        statement.push(currentQuestion);
        answers.push(currentAnswer);
        explanation.push(currentExplanation);
    }

    return {
        statement,
        answers,
        explanation,
    };
}

export const saqConverter = async (message: string): Promise<saq> => {
    const saqJson = parseSaqData(message);
    console.log(saqJson);
    return saqJson;
};
