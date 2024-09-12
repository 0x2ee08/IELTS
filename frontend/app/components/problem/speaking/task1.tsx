'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';

export interface task1QuestionGeneral {
    type: string,
    number_of_task: string,
    length: number;
    questions: string[],
}

interface Task1PageProps {
    task: task1QuestionGeneral,
}

const Task1Page: React.FC<Task1PageProps> = ({ task }) => {
    

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);

    

    return (
        <div>
            
        </div>
    );
};

export default Task1Page;
