'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface Contest {
    id: string;
    type: string;
    startTime: string;
    endTime: string;
    created_by: string;
    access: string;
    registerUser: number;
}

const ContestPage: React.FC = () => {
    const [upcomingContest, setUpcomingContest] = useState<Record<string, Contest> | null>(null);
    const [readingContest, setReadingContest] = useState<Record<string, Contest> | null>(null);
    const [listeningContest, setListeningContest] = useState<Record<string, Contest> | null>(null);
    const [speakingContest, setSpeakingContest] = useState<Record<string, Contest> | null>(null);
    const [writingContest, setWritingContest] = useState<Record<string, Contest> | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${config.API_BASE_URL}api/getAllContest`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                setUpcomingContest(response.data);
            })
            .catch(error => {
                console.error('Error fetching upcoming contest:', error);
            });
    }, []);

    const handleRegister = (contestId: string) => {
        // Handle registration logic here
        console.log(`Registering for contest with ID: ${contestId}`);
    };

    const handleJoin = (contestId: string) => {
        // Handle join logic here
        console.log(`Joining contest with ID: ${contestId}`);
    };

    return (
        <>
            <Header />
            <section>
                <h2>Upcoming Contest</h2>
                {upcomingContest ? (
                    Object.entries(upcomingContest).map(([key, contest]) => (
                        <div key={key}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {contest.startTime}</p>
                            <p>End Time: {contest.endTime}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <button onClick={() => handleRegister(contest.id)}>Register</button>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </section>

            <section>
                <h2>Reading Test</h2>
                {readingContest ? (
                    Object.entries(readingContest).map(([key, contest]) => (
                        <div key={key}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {contest.startTime}</p>
                            <p>End Time: {contest.endTime}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <button onClick={() => handleJoin(contest.id)}>Join</button>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </section>

            <section>
                <h2>Listening Test</h2>
                {listeningContest ? (
                    Object.entries(listeningContest).map(([key, contest]) => (
                        <div key={key}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {contest.startTime}</p>
                            <p>End Time: {contest.endTime}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <button onClick={() => handleJoin(contest.id)}>Join</button>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </section>

            <section>
                <h2>Speaking Test</h2>
                {speakingContest ? (
                    Object.entries(speakingContest).map(([key, contest]) => (
                        <div key={key}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {contest.startTime}</p>
                            <p>End Time: {contest.endTime}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <button onClick={() => handleJoin(contest.id)}>Join</button>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </section>

            <section>
                <h2>Writing Test</h2>
                {writingContest ? (
                    Object.entries(writingContest).map(([key, contest]) => (
                        <div key={key}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {contest.startTime}</p>
                            <p>End Time: {contest.endTime}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <button onClick={() => handleJoin(contest.id)}>Join</button>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </section>

            <Footer />
        </>
    );
};

export default ContestPage;
