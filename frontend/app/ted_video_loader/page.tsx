'use client'

import React, { Suspense, useState, useEffect } from 'react';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';
import TedVideoDetail from '../components/tedtalk/tedvideodetail';

const TedVideoLoader: React.FC = () => {
    

    useEffect(() => {

    }, []);

    return (
        <div>
            <Header />
            
            <Suspense> 
                <TedVideoDetail/> 
            </Suspense>

            <Footer />
        </div>
    );
};

export default TedVideoLoader;
