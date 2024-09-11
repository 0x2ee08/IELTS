import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';

interface SpeakingPagProps {
    
}

const SpeakingPage: React.FC<SpeakingPagProps> = ({  }) => {
    

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            hasInitialize.current = true;
        }
    }, []);


    return (
        <div>
            1
        </div>
    );
};

export default SpeakingPage;
