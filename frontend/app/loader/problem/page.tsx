'use client'

import React, { Suspense, useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ProblemDetail from '../../components/problem/problemDetail';

const ProblemLoader: React.FC = () => {
    

    useEffect(() => {

    }, []);

    return (
        <div>
            <Header />
            
            <Suspense> 
                <ProblemDetail/> 
            </Suspense>

            <Footer />
        </div>
    );
};

export default ProblemLoader;
