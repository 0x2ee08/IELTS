interface Character {
    NAME: string;
    GENDER: string;
}

interface Script {
    NAME: string;
    MESSAGE: string;
}

interface Discussion {
    TITLE: string;
    DESCRIPTION: string;
    CHARACTER1: Character;
    CHARACTER2: Character;
    SCRIPTS: Script[];
}

function parseDiscussionData(input: string): Discussion {
    const formattedInput = input.replace(/\n\n/g, '\n').trim();
    const lines = formattedInput.split('\n');

    const title = lines[0].split(': ')[1].trim();
    const description = lines[1].split(': ')[1].trim();

    const character1Data = lines[2].split(': ')[1].split('-');
    const character1: Character = {
        NAME: character1Data[0].trim(),
        GENDER: character1Data[1].trim(),
    };

    const character2Data = lines[3].split(': ')[1].split('-');
    const character2: Character = {
        NAME: character2Data[0].trim(),
        GENDER: character2Data[1].trim(),
    };

    const scripts: Script[] = lines.slice(5).map(line => {
        const [name, message] = line.split(': ');
        return {
            NAME: name.replace(/-/g, '').trim(),
            MESSAGE: message.trim(),
        };
    });

    return {
        TITLE: title,
        DESCRIPTION: description,
        CHARACTER1: character1,
        CHARACTER2: character2,
        SCRIPTS: scripts,
    };
}

export const conversationConverter = async (message: string): Promise<Discussion> => {
    const discussionJson = parseDiscussionData(message);
    return discussionJson;
};