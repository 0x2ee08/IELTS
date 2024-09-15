export const prompt1 = `Based on the text: "
`, prompt2 = `
    ", generate some multiple-choice questions. Each question should have four answer options:

    - Exactly one correct answer, randomly placed.
    - Exactly three incorrect answers.
    
    Please format each question as follows:

    Question text?
    A. First answer option
    B. Second answer option
    C. Third answer option
    D. Fourth answer option
    Correct answer: [A/B/C/D]

    Additional requirements:

    - Ensure that the questions are distinct and not similar to one another.
    - The answer options for each question should be almost similar to one another, but it should be difficult to distinguish the correct one from the incorrect ones.
    - Feel free to rephrase both the questions and the answers without changing their meaning to increase difficulty.
    - Avoid obvious answers by making sure that the correct answer does not stand out compared to the incorrect ones.
    - Ensure that all answer options are short and concise.
    - Randomly place the correct answer in one of the options.

        **IMPORTANT:** The number of questions MUST be `,
prompt3 = `

    Here's an example format:

    **Example:**

    Question 1: What is the main concern for the mad scientist without a spacesuit in space?

    A. He'll freeze due to low temperature
    B. He'll suffocate due to lack of oxygen
    C. He'll explode due to air pressure
    D. He'll vaporize due to extreme heat

    Correct answer: B. He'll suffocate due to lack of oxygen

    (Continue this example format, but make sure your output has the predetermined number of questions above.)
`;
