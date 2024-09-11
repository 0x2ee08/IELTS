// app/page.tsx
'use client'

import React from 'react';

import Head from 'next/head';
import Link from 'next/link';
import SpeakingDetail from '../../components/speaking/speakingdetail';

const SpeakingPage: React.FC = () => {
    return (
        <div>
            <div className="flex flex-col min-h-screen">
                
                <SpeakingDetail />
                
            </div>
        </div>
    );
}
export default SpeakingPage;

