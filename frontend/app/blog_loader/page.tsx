'use client'

import React, { Suspense, useState, useEffect } from 'react';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Blogdetail from '../components/Blogdetail';

const BlogLoader: React.FC = () => {
    

    useEffect(() => {

    }, []);

    return (
        <div>
            <Header />
            
            <Suspense> 
                <Blogdetail/> 
            </Suspense>

            <Footer />
        </div>
    );
};

export default BlogLoader;
