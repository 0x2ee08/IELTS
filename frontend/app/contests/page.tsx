'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import dayjs from 'dayjs';
import Link from 'next/link';

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
    const [upcomingContest, setUpcomingContest] = useState<Contest[] | null>(null);
    const [pastContest, setPastContest] = useState<Contest[] | null>(null);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${config.API_BASE_URL}api/getAllContest`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                const contests = Object.values(response.data) as Contest[]; // Cast to Contest[]
                const currentTime = new Date().toISOString();

                // Split contests into upcoming and past contests
                const upcoming = contests.filter((contest: Contest) => contest.startTime > currentTime);
                const past = contests.filter((contest: Contest) => contest.endTime < currentTime);

                setUpcomingContest(upcoming);
                setPastContest(past);
            })
            .catch(error => {
                console.error('Error fetching contests:', error);
            });
    }, []);

    const handleRegister = (contestId: string) => {
        console.log(`Registering for contest with ID: ${contestId}`);
    };

    return (
        <>
            <Header />
            <section>
                <h2>Upcoming Contests</h2>
                {upcomingContest ? (
                    upcomingContest.map(contest => (
                        <div key={contest.id}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {dayjs(contest.startTime).format('YYYY-MM-DDTHH:mm')}</p>
                            <p>End Time: {dayjs(contest.endTime).format('YYYY-MM-DDTHH:mm')}</p>
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
                <h2>Past Contests</h2>
                {pastContest ? (
                    pastContest.map(contest => (
                        <div key={contest.id}>
                            <p>Type: {contest.type}</p>
                            <p>Start Time: {dayjs(contest.startTime).format('YYYY-MM-DDTHH:mm')}</p>
                            <p>End Time: {dayjs(contest.endTime).format('YYYY-MM-DDTHH:mm')}</p>
                            <p>Created By: {contest.created_by}</p>
                            <p>Access: {contest.access}</p>
                            <p>Registered Users: {contest.registerUser}</p>
                            <Link href={`/contests/${contest.id}`}>
                                <button>Join</button>
                            </Link>
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
