'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from 'next/link';
import { format } from 'path';
import './style.css';

interface Contest {
    id: string;
    type: string;
    problemName: string;
    startTime: string;
    endTime: string;
    created_by: string;
    access: string;
    registerUser: number;
    registered: boolean;
}

const ContestPage: React.FC = () => {
    const [upcomingContest, setUpcomingContest] = useState<Contest[] | null>(null);
    const [pastContest, setPastContest] = useState<Contest[] | null>(null);
    const [onGoingContest, setOnGoingContest] = useState<Contest[] | null>(null); 
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${config.API_BASE_URL}api/getAllContest`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                const contests = Object.values(response.data) as Contest[]; // Cast to Contest[]
                const currentTime = new Date().toISOString();
    
                // Split contests into upcoming and past contests
                const upcoming = contests
                    .filter((contest: Contest) => contest.startTime > currentTime)
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
                // Sort past contests by endTime in descending order
                const past = contests
                    .filter((contest: Contest) => contest.endTime < currentTime)
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                
                const ongoing = contests
                    .filter((contest: Contest) => contest.endTime > currentTime && contest.startTime < currentTime)
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

                setUpcomingContest(upcoming);
                setPastContest(past);
                setOnGoingContest(ongoing);
            })
            .catch(error => {
                console.error('Error fetching contests:', error);
            });
    }, []);    

    const handleRegister = (contestId: string) => {
        // console.log(`Registering for contest with ID: ${contestId}`);
        const token = localStorage.getItem('token');
        axios.post(`${config.API_BASE_URL}api/registerContest`, {contestID: contestId}, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error('Error fetching contests:', error);
            }).finally(() => {
                window.location.reload();
            });
    };

    dayjs.extend(utc);
    dayjs.extend(timezone);
    const formatDate = (isoString: string): JSX.Element => {
        // Convert to UTC+7 timezone
        const timeInUTC7 = dayjs(isoString).tz('Asia/Bangkok');

        const sufday = (day: number) => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        const day = timeInUTC7.format('DD');
        const formattedDate = timeInUTC7.format('MMM YYYY');
        const formattedTime = timeInUTC7.format('HH:mm');
        
        if (day === "Invalid Date") return (
            <>
                <div className='text-red-500 font-normal'>Invalid date</div>
            </>
        );

        return (
            <>
                {day}<sup>{sufday(timeInUTC7.date())}</sup> {formattedDate} {formattedTime}
                <span style={{ verticalAlign: 'super', fontSize: '10px' }}>UTC+7</span>
            </>
        );
    };

    return (
        <>
    <Header />
    <section className="contest-section">
        <div className="contest-container">
            <h2 className="contest-title">Ongoing Contest</h2>
            {onGoingContest ? onGoingContest.length ? (
                <table className="contest-table">
                    <thead>
                        <tr>
                            <th>Contest</th>
                            <th>Author</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Participants</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {onGoingContest.map((contest, cnt) =>  (
                            <tr key={contest.id} className={cnt % 2 === 0 ? "even-row" : "odd-row"}>
                                <td className="contest-name">
                                    {contest.problemName}<br />({contest.access})
                                </td>
                                <td className="contest-author">
                                    <Link href={`/loader/profile?id=${contest.created_by}`}>
                                        <span className="text-blue-600 hover:underline">{contest.created_by}</span>
                                    </Link>
                                </td>
                                <td>{formatDate(contest.startTime)}</td>
                                <td>{formatDate(contest.endTime)}</td>
                                <td>{contest.registerUser}</td>
                                <td>
                                    {contest.registered ? (
                                        <Link href={`/contests/${contest.id}`}>
                                            <button className="custom-button join-button">
                                                <p className='font-normal'>Join</p>
                                            </button>
                                        </Link>
                                    ) : (
                                        <button 
                                            className="custom-button register-button" 
                                            onClick={() => handleRegister(contest.id)}
                                        >
                                            <p className='font-normal'>Register</p>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className='text-gray-300 font-bold disable-pointer-events'>No ongoing contest yet.</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    </section>

    <section className="contest-section">
        <div className="contest-container">
            <h2 className="contest-title">Upcoming Contest</h2>
            {upcomingContest ? upcomingContest.length ? (
                <table className="contest-table">
                    <thead>
                        <tr>
                            <th>Contest</th>
                            <th>Author</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Participants</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {upcomingContest.map((contest, cnt) => (
                            <tr key={contest.id} className={cnt % 2 === 0 ? "even-row" : "odd-row"}>
                                <td className="contest-name">{contest.problemName}<br />({contest.access})</td>
                                <td className="contest-author">
                                    <Link href={`/loader/profile?id=${contest.created_by}`}>
                                        <span className="text-blue-600 hover:underline cursor-pointer">{contest.created_by}</span>
                                    </Link>
                                </td>
                                <td>{formatDate(contest.startTime)}</td>
                                <td>{formatDate(contest.endTime)}</td>
                                <td>{contest.registerUser}</td>
                                <td>
                                    {contest.registered ? (
                                        <div className='text-gray-500 font-bold'>Already registered</div>
                                    ) : (
                                        <button onClick={() => handleRegister(contest.id)} className="custom-button register-button">Register</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className='text-gray-300 font-bold'>No upcoming contest yet.</p>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    </section>

    <section className="contest-section">
        <div className="contest-container">
            <h2 className="contest-title">Past Contest</h2>
            {pastContest ? (
                <table className="contest-table">
                    <thead>
                        <tr>
                            <th>Contest</th>
                            <th>Author</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Participants</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastContest.map((contest, cnt) => (
                            <tr key={contest.id} className={cnt % 2 === 0 ? "even-row" : "odd-row"}>
                                <td className="contest-name">{contest.problemName}<br />({contest.access})</td>
                                <td className="contest-author">
                                    <Link href={`/loader/profile?id=${contest.created_by}`}>
                                        <span className="text-blue-600 hover:underline cursor-pointer">{contest.created_by}</span>
                                    </Link>
                                </td>
                                <td>{formatDate(contest.startTime)}</td>
                                <td>{formatDate(contest.endTime)}</td>
                                <td>{contest.registerUser}</td>
                                <td>
                                    <Link href={`/contests/${contest.id}`}>
                                        <button className='custom-button join-button'>Join</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    </section>

    <Footer />
</>

    );
};

export default ContestPage;
