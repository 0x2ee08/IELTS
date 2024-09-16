'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import dayjs from 'dayjs';
import Link from 'next/link';
import { format } from 'path';

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
                const upcoming = contests
                    .filter((contest: Contest) => contest.endTime > currentTime)
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
                // Sort past contests by endTime in descending order
                const past = contests
                    .filter((contest: Contest) => contest.endTime < currentTime)
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
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

    const formatDate = (isoString: string): JSX.Element => {
        // Parse the ISO string into a Date object
        const date = new Date(isoString);
    
        // Shift the time to UTC+7
        const utc7Offset = 7 * 60; // Offset in minutes (UTC+7 is 7 hours ahead of UTC)
        const localTime = new Date(date.getTime() + utc7Offset * 60 * 1000);
        const formattedDate = localTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }).replace(',', '/').replace(' ', '/');
        
        const formattedTime = localTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    
        return (
                <>
                    {formattedDate} {formattedTime}
                    <span style={{ verticalAlign: 'super', fontSize: '10px' }}>UTC+7</span>
                </>
            );
        };

    return (
        <>
            <Header />

            <section style={{textAlign:"center",alignItems:"center",paddingLeft:'5%',paddingRight:'5%',marginTop:"25px",justifyContent:"space-between"}}>
                <div style={{padding:'3px', paddingBottom:'5px', borderRadius: '10px'}}>
                    <h2 style={{fontSize:'25px',fontWeight:'bold', padding:'30px'}}>Upcoming Contest</h2>
                    {upcomingContest ? (
                            <table style={{margin:"0 auto",borderCollapse:"collapse",border:"1px solid black",width:'100%'}}>
                                <tr style={{border:'1px solid #e1e1e1',backgroundColor:"white"}}>
                                    <th style={{border:'1px solid #e1e1e1'}}>Contest</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Author</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Start</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>End</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Participant</th>
                                    <th style={{border:'1px solid #e1e1e1'}}></th>
                                </tr>
                                {upcomingContest.map((contest, cnt) =>
                                    <tr key={contest.id} style={{background:cnt%2==0?"#F0F0F0":"white"}}>
                                        <td style={{padding:'10px',textAlign:"center",width:'40%',border:'1px solid #e1e1e1'}}>{contest.problemName}<br/>({contest.access})</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}>{
                                            <Link href={`/loader/profile?id=${contest.created_by}`}>
                                                <span className="text-blue-600 hover:underline cursor-pointer bold" 
                                                style={{fontWeight:'bold'}}>{contest.created_by}</span>
                                            </Link>}</td>
                                            <td style={{padding:'10px',textAlign:"center",width:'15%',border:'1px solid #e1e1e1'}}>{formatDate(contest.startTime)}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'15%',border:'1px solid #e1e1e1'}}>{formatDate(contest.endTime)}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}>{contest.registerUser}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}>
                                            <button className="text-blue-600 hover:underline cursor-pointer">Register</button></td>
                                    </tr>
                                )}
                            </table>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </section>
            <div style={{padding:'10px'}}></div>
            <section style={{textAlign:"center",alignItems:"center",paddingLeft:'5%',paddingRight:'5%',marginTop:"25px",justifyContent:"space-between"}}>
                <div style={{padding:'3px', paddingBottom:'5px', borderRadius: '10px'}}>
                    <h2 style={{fontSize:'25px', fontWeight:'bold', padding:'30px'}}>Past Contest</h2>
                    {pastContest ? (
                            <table style={{margin:"0 auto",borderCollapse:"collapse",border:"1px solid black",width:'100%'}}>
                                <tr style={{border:'1px solid #e1e1e1',backgroundColor:"white"}}>
                                    <th style={{border:'1px solid #e1e1e1'}}>Contest</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Author</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Start</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>End</th>
                                    <th style={{border:'1px solid #e1e1e1'}}>Participant</th>
                                    <th style={{border:'1px solid #e1e1e1'}}></th>
                                </tr>
                                {pastContest.map((contest,cnt) =>
                                    <tr key={contest.id} style={{background:cnt%2==0?"#F0F0F0":"white"}}>
                                        <td style={{padding:'10px',textAlign:"center",width:'40%',border:'1px solid #e1e1e1'}}>{contest.problemName}<br/>({contest.access})</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}>{
                                            <Link href={`/loader/profile?id=${contest.created_by}`}>
                                                <span className="text-blue-600 hover:underline cursor-pointer bold" 
                                                style={{fontWeight:'bold'}}>{contest.created_by}</span>
                                            </Link>}</td>
                                            <td style={{padding:'10px',textAlign:"center",width:'15%',border:'1px solid #e1e1e1'}}>{formatDate(contest.startTime)}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'15%',border:'1px solid #e1e1e1'}}>{formatDate(contest.endTime)}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}>{contest.registerUser}</td>
                                        <td style={{padding:'10px',textAlign:"center",width:'10%',border:'1px solid #e1e1e1'}}><Link href={`/contests/${contest.id}`}>
                                            <button className="text-blue-600 hover:underline cursor-pointer">Join</button></Link></td>
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
