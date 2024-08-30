'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ManagementPage: React.FC = () => {


    useEffect(() => {
        
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-row">
                {/* Options Row */}
                <div className="w-full flex flex-row">
                    <div className="w-full flex flex-row">
                        {/* Video */}
                        <div className="w-3/5 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md ml-4">
                        </div>

                        {/* Script */}
                        <div className="w-2/5 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md mr-4">
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="w-full flex flex-row">
                    <div className="w-full flex flex-row">
                        {/* Note */}
                        <div className="w-3/5 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md ml-4">
                        </div>

                        {/* Chatbot*/}
                        <div className="w-2/5 container mx-2 my-4 p-4 border border-gray-300 rounded shadow-md mr-4">
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ManagementPage;
