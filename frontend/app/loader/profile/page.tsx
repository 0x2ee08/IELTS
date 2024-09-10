'use client'

import React, { Suspense, useState, useEffect } from 'react';
import config from '../../config';
import axios from 'axios';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ProfileDetail from '../../components/profile/ProfileDetail';

const ProfileLoader: React.FC = () => {
    

    useEffect(() => {

    }, []);

    return (
        <div>
            <Header />
            
            <Suspense> 
                <ProfileDetail/> 
            </Suspense>

            <Footer />
        </div>
    );
};

export default ProfileLoader;
