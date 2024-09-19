'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState, useRef } from 'react';
import config from '../config';
import axios from 'axios';
import { convertDuration } from '../components/tedtalk/convertDuration';
import { useRouter } from 'next/navigation';

const ResultPage: React.FC = () => {

    return (
        <div>
            <Header />
            List all submission
            <Footer />
        </div>
    );
};

export default ResultPage;
