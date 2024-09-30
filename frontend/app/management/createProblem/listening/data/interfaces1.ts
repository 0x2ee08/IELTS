export interface task1QuestionGeneral {
    type: string;
    typeOfAudio: string;
    languageTone: string;
    difficulty: string;
    topic: string;
    number_of_task: string;
    questions: string[];
    audioData: string;
    script: Discussion;
}

export interface Character {
    NAME: string;
    GENDER: string;
}

export interface Script {
    NAME: string;
    MESSAGE: string;
}

export interface Discussion {
    TITLE: string;
    DESCRIPTION: string;
    CHARACTER1: Character;
    CHARACTER2: Character;
    SCRIPTS: Script[];
}

export interface Task1PageProps {
    onTaskUpdate: (task: task1QuestionGeneral) => void;
}