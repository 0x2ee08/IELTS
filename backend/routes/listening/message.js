module.exports = {
    conversation: `Generate a IELTS listening task 1 about conversation between 2 peoples. \n
    Only give me the scripts structure, no anything else.\n
    The messages should contain many information.\n
    The two first sentences must be greetings.\n
    Before the spliter, there should be 15 messages\n
    After the spliter, there should be 35 messages\n
    The response should follow this structure:\n
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
    The response should follow this structure:
    - question: string
    - answer: [string, string, string, string] (3 or 4 elements)
    - explanation: string
    - question: string
    - answer: [string, string, string, string] (3 or 4 elements)
    - explanation: string
    ...`,

    saq: ` IELTS listening task 1 short answer question`,
};

