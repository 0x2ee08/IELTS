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
    problemName: string;
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

            <section style={{textAlign:"center",alignItems:"center",marginLeft:"1%",marginRight:"5%",paddingRight:"5%",marginTop:"25px",justifyContent:"space-between"}}>
                <h2>Upcoming Contest</h2>
                <div style={{margin:"10px",padding:"10px"}}>
                {upcomingContest ? (
                        <table style={{margin:"0 auto",borderSpacing:"0 10px",borderCollapse:"separate"}}>
                            <tr style={{borderBottom:"1px solid #000"}}>
                                <th>Contest</th>
                                <th>Author</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Participant</th>
                                <th></th>
                            </tr>
                            {upcomingContest.map((contest, cnt) =>
                                <tr key={contest.id} style={{borderBottom:"1px solid #000",background:cnt%2==0?"#E2FAFF":"#CAF0F8"}}>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.problemName}<br/>({contest.access})</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.created_by}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.startTime}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.endTime}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.registerUser}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}><button type='button'>Register</button></td>
                                </tr>
                            )}
                        </table>
                ) : (
                    <p>Loading...</p>
                )}
                </div>
            </section>
            
            <section style={{textAlign:"center",alignItems:"center",marginLeft:"1%",marginRight:"5%",paddingRight:"5%",marginTop:"25px",justifyContent:"space-between"}}>
                <h2>Past Contest</h2>
                <div style={{margin:"10px",padding:"10px"}}>
                {pastContest ? (
                        <table style={{margin:"0 auto",borderSpacing:"0 10px",borderCollapse:"separate"}}>
                            <tr style={{borderBottom:"1px solid #000"}}>
                                <th>Contest</th>
                                <th>Author</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Participant</th>
                                <th></th>
                            </tr>
                            {pastContest.map((contest,cnt) =>
                                <tr key={contest.id} style={{borderBottom:"1px solid #000",background:cnt%2==0?"#E2FAFF":"#CAF0F8"}}>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.problemName}<br/>({contest.access})</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.created_by}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.startTime}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.endTime}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}>{contest.registerUser}</td>
                                    <td style={{padding:"10px",textAlign:"center"}}><Link href={`/contests/${contest.id}`}><button>Join</button></Link></td>
                                </tr>
                            )}
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
