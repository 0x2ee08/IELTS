module.exports = {
    conversation: `Generate a IELTS listening task 1 about conversation between 2 peoples. \n
    Only give me the scripts structure, no anything else.\n
    The messages should contain a huge number of informations.\n
    The two first sentences must be greetings.\n
    Before the spliter, there should be 10 messages\n
    After the spliter, there should be 40 messages\n
    The response must follow this structure:\n
    title: string (For example: A project conversation)\n
    description: string (For example: You will hear two school students talk about their science project)\n
    charactor1: name-(male/female) (For example: Emily-female)\n
    charactor2: name-(male/female) (For example: John-male)\n
    scripts:\n
    -name1: string\n
    -name2: string\n
    ...
    -spliter: before hearing the rest of the conversation, you will have some time to look at question \n
    -name1: string\n
    -name2: string\n
    ...`,

    mcq: ` IELTS listening task 1 multiple choice question
    Only give me the questions structure, no anything else.
    The response must follow this structure:
    - question: 
    - choices: [string, string, string, string] (3 or 4 elements, without quotes)
    - answer: (equal to one element of choices)
    - explanation: 
    - question: 
    - choices: [string, string, string, string] (3 or 4 elements, without quotes)
    - answer: (equal to one element of choices)
    - explanation: 
    ...`,

    saq: ` IELTS listening task 1 short-answer question
    Only give me the questions structure, no anything else.
    The question should be paraphrased (but it should remain the same meaning)
    The questions are paraphrased versions, keeping the same meaning.
    The answers include all possible variations of the text (without quotes).
    The response must follow this structure exactly (only one line with wordLimit):
    - question:
    - answer: (short without quotes)
    - explanation:
    - question:
    - answer: (short without quotes)
    - explanation:
    ...`,
};

