'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import config from '../../config';
import ReadingContest from '../../components/contests/Reading';
import ListeningContest from '../../components/contests/Listening';
import WritingContest from '../../components/contests/Writing';
import SpeakingContest from '../../components/contests/Speaking';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useSearchParams, useParams } from 'next/navigation';

const ContestDetailPage = () => {
    const [contest, setContest] = useState<any>(null);
    const { idContest } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (idContest) {
            axios.post(`${config.API_BASE_URL}api/getContest`, { idContest }, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(response => {
                    setContest(response.data);
                })
                .catch(error => {
                    if (error.response.status === 404) {
                        alert('Contest not found');
                    } else if (error.response.status === 401) {
                        alert('Unauthorized access');
                    } else {
                        console.error('Error fetching contest:', error);
                    }
                });
        }
    }, [idContest]);

    if (!contest) return (<><Header/><p>Loading contest...</p><Footer /></>);

    // Render the contest component based on contest type
    switch (contest.type) {
        case 'Reading':
            return (<><Header/><ReadingContest contest={contest} /><Footer /></>);
        case 'Listening':
            return (<><Header/><ListeningContest contest={contest} /><Footer /></>);
        case 'Writing':
            return (<><Header/><WritingContest contest={contest} /><Footer /></>);
        case 'Speaking':
            return (<><Header/><SpeakingContest contest={contest} /><Footer /></>);
        default:
            return (<><Header/><p>Unknown contest type.</p><Footer /></>);
    }
};

export default ContestDetailPage;
