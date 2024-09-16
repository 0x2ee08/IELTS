'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';

interface SpeakingPageProps {
    
}

const SpeakingPage: React.FC<SpeakingPageProps> = ({  }) => {
    

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

export default SpeakingPage;
