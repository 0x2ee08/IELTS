export interface task1QuestionGeneral {
    type: string;
    typeOfAudio: string;
    languageTone: string;
    difficulty: string;
    topic: string;
    audioData: string;
    script: Discussion;
    exercise: Exercise[];
}

export interface Exercise {
    typeOfQuestion: string;
    numbefOfQuestion: number;
    difficulty: string;
    data: any; 
}

export interface Character {
    name: string;
    gender: string;
    speaker: string;
}

export interface Script {
    name: string;
    message: string;
}

export interface Discussion {
    title: string;
    description: string;
    character1: Character;
    character2: Character;
    scripts: Script[];
}

export interface Task1PageProps {
    onTaskUpdate: (task: task1QuestionGeneral) => void;
}