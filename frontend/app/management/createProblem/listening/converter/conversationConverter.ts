interface Character {
    name: string;
    gender: string;
}

interface Script {
    name: string;
    message: string;
}

interface Discussion {
    title: string;
    description: string;
    character1: Character;
    character2: Character;
    scripts: Script[];
}

function parseDiscussionData(input: string): Discussion {
    const formattedInput = input.replace(/\n\n/g, '\n').trim();
    const lines = formattedInput.split('\n');

    const title = lines[0].split(': ')[1].trim();
    const description = lines[1].split(': ')[1].trim();

    const character1Data = lines[2].split(': ')[1].split('-');
    const character1: Character = {
        name: character1Data[0].trim(),
        gender: character1Data[1].trim(),
    };

    const character2Data = lines[3].split(': ')[1].split('-');
    const character2: Character = {
        name: character2Data[0].trim(),
        gender: character2Data[1].trim(),
    };

    const scripts: Script[] = lines.slice(5).map(line => {
        const [name, message] = line.split(': ');
        return {
            name: name.replace(/-/g, '').trim(),
            message: message.trim(),
        };
    });

    return {
        title: title,
        description: description,
        character1: character1,
        character2: character2,
        scripts: scripts,
    };
}

export const conversationConverter = async (message: string): Promise<Discussion> => {
    const discussionJson = parseDiscussionData(message);
    return discussionJson;
};