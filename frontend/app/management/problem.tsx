// AddProblem.tsx
'use client';

import React, { useState } from 'react';
import ReadingRender from './createProblem/ReadingRender';
import ListeningRender from './createProblem/ListeningRender';
import SpeakingRender from './createProblem/SpeakingRender';
import WritingRender from './createProblem/WritingRender';

const AddProblem: React.FC = () => {
    const [problemType, setProblemType] = useState<string | null>(null);
    const skill = [
        'Choose skill',
        'Reading',
        'Listening',
        'Writing',
        'Speaking'
    ];

    const handleProblemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProblemType(e.target.value);
    };

    const renderProblemOptions = () => {
        switch (problemType) {
            case 'Reading':
                return <ReadingRender />;
            case 'Listening':
                return <ListeningRender />;
            case 'Writing':
                return <WritingRender />;
            case 'Speaking':
                return <SpeakingRender />;
            default:
                return null;
        }
    };

    return (
        <div>
            <h2 className='py-3'>Select Problem Type</h2>
            <select className="border border-gray-300 px-3 py-2 rounded-md w-full" onChange={handleProblemTypeChange}>
                {skill.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                ))}
            </select>

            {renderProblemOptions()}
        </div>
    );
};

export default AddProblem;
