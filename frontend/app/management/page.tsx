'use client'

import React, { useState, useEffect } from 'react';
import config from '../config';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ManagementPage: React.FC = () => {
    

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <Footer />
        </div>
    );
};

export default ManagementPage;
