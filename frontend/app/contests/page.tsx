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

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getUTCMonth()]; // Get the month name
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();
        let hours = date.getUTCHours() + 7; // Adding 7 hours for UTC+7
        let minutes = date.getUTCMinutes();
        if (hours >= 24) {
          hours = hours - 24;
        }
        
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      
        return `${month}/${day}/${year} ${hours}:${minutesStr}`;
      };

    return (
        <>
            <Header />

            <section style={{textAlign:"center",alignItems:"center",marginLeft:"1%",marginRight:"5%",paddingLeft:'5%',paddingRight:'5%',marginTop:"25px",justifyContent:"space-between"}}>
                <h2 style={{fontSize:'25px',fontWeight:'bold'}}>Upcoming Contest</h2>
                <div style={{margin:"10px"}}>
                {upcomingContest ? (
                        <table style={{margin:"0 auto",borderSpacing:"0 10px",borderCollapse:"separate"}}>
                            <tr style={{borderBottom:"1px solid #000",backgroundColor:"#E8E8E8"}}>
                                <th>Contest</th>
                                <th>Author</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Participant</th>
                                <th></th>
                            </tr>
                            {upcomingContest.map((contest, cnt) =>
                                <tr key={contest.id} style={{borderBottom:"1px solid #000",background:cnt%2==0?"#E2FAFF":"#CAF0F8"}}>
                                    <td style={{padding:"10px",textAlign:"center",width:'40%'}}>{contest.problemName}<br/>({contest.access})</td>
                                    <td style={{padding:"10px",textAlign:"center",width:'5%'}}>{
                                        <Link href={`/loader/profile?id=${contest.created_by}`}>
                                            <span className="text-blue-600 hover:underline cursor-pointer" 
                                            style={{fontWeight:'bold'}}>{contest.created_by}</span>
                                        </Link>}</td>
                                    <td style={{padding:"10px",textAlign:"center",width:'15%'}}>{formatDate(contest.startTime)}
                                        <span style={{ verticalAlign: 'super', fontSize:'10px' }}>UTC+7</span></td>
                                    <td style={{padding:"10px",textAlign:"center",width:'15%'}}>{formatDate(contest.endTime)}
                                        <span style={{ verticalAlign: 'super', fontSize:'10px' }}>UTC+7</span></td>
                                    <td style={{padding:"10px",textAlign:"center",width:'5%'}}>{contest.registerUser}</td>
                                    <td style={{padding:"10px",textAlign:"center",width:'10%'}}>
                                        <button className="text-blue-600 hover:underline cursor-pointer">Register</button></td>
                                </tr>
                            )}
                        </table>
                ) : (
                    <p>Loading...</p>
                )}
                </div>
            </section>
            
            <section style={{textAlign:"center",alignItems:"center",marginLeft:"1%",marginRight:"5%",paddingLeft:'5%',paddingRight:'5%',marginTop:"25px",justifyContent:"space-between"}}>
                <h2 style={{fontSize:'25px', fontWeight:'bold'}}>Past Contest</h2>
                <div style={{margin:"10px",padding:"10px"}}>
                {pastContest ? (
                        <table style={{margin:"0 auto",borderSpacing:"0 10px",borderCollapse:"separate"}}>
                            <tr style={{borderBottom:"1px solid #000",backgroundColor:"#E8E8E8"}}>
                                <th>Contest</th>
                                <th>Author</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Participant</th>
                                <th></th>
                            </tr>
                            {pastContest.map((contest,cnt) =>
                                <tr key={contest.id} style={{borderBottom:"1px solid #000",background:cnt%2==0?"#E2FAFF":"#CAF0F8"}}>
                                    <td style={{padding:"10px",textAlign:"center",width:'40%'}}>{contest.problemName}<br/>({contest.access})</td>
                                    <td style={{padding:"10px",textAlign:"center",width:'5%'}}>{
                                        <Link href={`/loader/profile?id=${contest.created_by}`}>
                                            <span className="text-blue-600 hover:underline cursor-pointer bold" 
                                            style={{fontWeight:'bold'}}>{contest.created_by}</span>
                                        </Link>}</td>
                                        <td style={{padding:"10px",textAlign:"center",width:'15%'}}>{formatDate(contest.startTime)}
                                        <span style={{ verticalAlign: 'super', fontSize:'10px' }}>UTC+7</span></td>
                                    <td style={{padding:"10px",textAlign:"center",width:'15%'}}>{formatDate(contest.endTime)}
                                        <span style={{ verticalAlign: 'super', fontSize:'10px' }}>UTC+7</span></td>
                                    <td style={{padding:"10px",textAlign:"center",width:'5%'}}>{contest.registerUser}</td>
                                    <td style={{padding:"10px",textAlign:"center",width:'10%'}}><Link href={`/contests/${contest.id}`}>
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
