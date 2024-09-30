module.exports = {
    conversation: `Generate a IELTS listening task 1 about conversation between 2 peoples about 30 messages. \n
    Only give me the scripts structure, no anything else.\n
    The two first sentences must be greetings.\n
    The response should follow this structure:\n
    TITLE: string (For example: A project conversation)\n
    DESCRIPTION: string (For example: You will hear two school students talk about their science project)\n
    CHARACTOR1: name-(male/female) (For example: Emily-female)\n
    CHARACTOR2: name-(male/female) (For example: John-male)\n
    SCRIPTS:\n
    -name1: string\n
    -name2: string\n
    ...\n`
};
