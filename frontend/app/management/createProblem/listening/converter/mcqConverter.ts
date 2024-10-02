export interface mcq {
    statement: string[];
    choices: string[];
    answers: string[];
    explanation: string[];
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
        if (line.startsWith('- question:')) {
            if (currentQuestion && currentAnswer && currentExplanation) {
                statement.push(currentQuestion);
                choices.push(currentChoices.join(', '));
                answers.push(currentAnswer);
                explanation.push(currentExplanation);
            }
    
            currentQuestion = line.split(': ')[1].trim();
            currentChoices = [];
        } else if (line.startsWith('  - answer:')) {
            currentChoices = line
            .split(': ')[1]
            .replace('[', '')
            .replace(']', '')
            .split(', ')
            .map((choice) => choice.trim().replace(/^"|"$/g, ''));
        } else if (line.startsWith('  - explanation:')) {
            currentExplanation = line.split(': ')[1].trim();
            currentAnswer = currentChoices[0];
        }
    });
  
    if (currentQuestion && currentAnswer && currentExplanation) {
        statement.push(currentQuestion);
        choices.push(currentChoices.join(', '));
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
    return mcqJson;
};