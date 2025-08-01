'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import config from '../config';
import axios from 'axios';
import Link from 'next/link';

interface Submission {
    type: string;
    sid: string;
    cid: string;
    // correct: string,
    // wrong: string,
    // empty: string, 
    // total: string,
    result: any,
    submit_time: string,
    submit_by: string,
    status ?: boolean
}

function calculateBand(correct: string, total: string) {
    const correctNum = parseFloat(correct);
    const totalNum = parseFloat(total);
  
    // Avoid division by zero or invalid inputs
    if (isNaN(correctNum) || isNaN(totalNum) || totalNum === 0) {
      return 0;
    }
  
    const ratio = correctNum / totalNum;
  
    // Convert the ratio to base 9
    const base9Ratio = ratio * 9;
  
    // Round the result to the nearest 0.5 or 0
    const roundedBand = Math.round(base9Ratio * 2) / 2;
  
    return roundedBand;
  }

  function calculateSpeakingBand(submission: Record<string,any>[]) {
    let averageTotal = 0, averageFluency = 0, averageGrammar = 0, averageLexcial = 0, averagePronunciation = 0, averageResponse= 0;
    let Total = 0, Fluency = 0, Grammar = 0, Lexcial = 0, Pronunciation = 0, Response= 0;
    submission.forEach(element => {
        Total +=  element.band.total;
        Fluency += element.band.fluency;
        Grammar += element.band.grammar;
        Lexcial += element.band.lexical;
        Pronunciation += element.band.pronunciation;
        Response += element.band.response;
    })
    // console.log("HI", submission.length);
    averageTotal = Total / submission.length;
    averageFluency = Fluency / submission.length;
    averageGrammar = Grammar / submission.length;
    averageLexcial = Lexcial / submission.length;
    averagePronunciation = Pronunciation / submission.length;
    averageResponse = Response / submission.length;

    return {averageTotal, averageFluency, averageGrammar, averageLexcial, averagePronunciation, averageResponse}
  }


  function calcualteWritingBand(result: any[]) {

    const scores = result.map(r => Number(r.band) || 0); // Extract scores or default to 0
    const totalScore = scores.reduce((sum: any, score: any) => sum + score, 0); // Sum of scores
    const averageScore = totalScore / scores.length; // Calculate average score

    return Number(averageScore);
}

  
const ResultPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [titles, setTitles] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${config.API_BASE_URL}api/getAllSubmission`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = response.data;
                let submissionArray: Submission[] = Object.values(data); // Convert object to array
                
                // Sort the submissions by submit_time (descending order)
                submissionArray = submissionArray.sort((a, b) => {
                    const dateA = new Date(a.submit_time).getTime();
                    const dateB = new Date(b.submit_time).getTime();
                    return dateB - dateA; // Descending order
                });
    
                setSubmissions(submissionArray);
    
                // Fetch contest titles for each submission
                await Promise.all(
                    submissionArray.map(async (submission) => {
                        try {
                            const titleResponse = await axios.post(
                                `${config.API_BASE_URL}api/getContestTitle`,
                                { contestID: submission.cid },
                                { headers: { 'Authorization': `Bearer ${token}` } }
                            );
                            setTitles(prevTitles => ({
                                ...prevTitles,
                                [submission.cid]: titleResponse.data.title
                            }));
                        } catch (error) {
                            console.error(`Error fetching title for contest ${submission.cid}:`, error);
                        }
                    })
                );
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError('Failed to fetch submissions.');
            }
        };
    
        fetchSubmissions();
    }, []);
    console.log(submissions)
    return (
        <div>
            <Header />
            <div className="submission-list p-6">
                <h2 className="text-xl font-semibold mb-6">List of All Submissions</h2>
                {error && <p className="error text-red-500">{error}</p>}
                {!error && submissions.length === 0 && <p>No submissions found.</p>}
                {submissions.length > 0 && submissions && (
                    <ul className="space-y-6">
                        {submissions.map((submission, index) => {
                            let bandScore, bandColor, fluencyScore, grammarScore, lexicalScore, pronunciationScore, responseScore;
                            if(submission.status == false){
                                bandScore = 'In queue';
                                bandColor = "text-gray-600";
                            }
                            else{
                                if(submission.type === "Reading") bandScore = calculateBand(submission.result.correct, submission.result.total);
                                else if(submission.type === "Writing") bandScore = calcualteWritingBand(submission.result);
                                else{
                                    var results = calculateSpeakingBand(submission.result);
                                    bandScore = results.averageTotal;
                                    fluencyScore = results.averageFluency;
                                    grammarScore = results.averageGrammar;
                                    lexicalScore = results.averageLexcial;
                                    pronunciationScore = results.averagePronunciation;
                                    responseScore = results.averageResponse;
                                }
                                bandColor = "text-red-600"; // Default color for band < 5.0
                                if (bandScore >= 7.0) {
                                    bandColor = "text-green-600";
                                } else if (bandScore >= 5.0) {
                                    bandColor = "text-yellow-600";
                                }
                                bandScore = bandScore.toFixed(1);
                            }
    
                            return (
                                <li key={index} className="border p-6 rounded-lg shadow-md">
                                    {submission.type === 'Reading' && (
                                        <>
                                            <Link href={`/results/${submission.sid}`}>
                                                <div className="flex items-center">
                                                    {/* Band Score */}
                                                    <span className={`text-4xl font-bold ${bandColor} mr-6`}>
                                                        {bandScore}
                                                    </span>
            
                                                    {/* Contest Info */}
                                                    <div className="text-lg space-y-1">
                                                        <p className="font-semibold">
                                                            {titles[submission.cid] || 'Loading...'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Contest type: {submission.type}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit by: {submission.submit_by || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit time: {new Date(submission.submit_time).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
            
                                                {/* Answer Stats */}
                                                <div className="mt-4 text-base">
                                                    <span className="text-green-500 mr-4">Correct: {submission.result.correct}</span>
                                                    <span className="text-red-500 mr-4">Wrong: {submission.result.wrong}</span>
                                                    <span className="text-yellow-500">Empty: {submission.result.empty}</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}

                                    {submission.type === 'Speaking' && submission.status === false && (
                                        <>
                                                <div className="flex items-center">
                                                    {/* Band Score */}
                                                    <span className={`text-2xl font-bold ${bandColor} mr-6`}>
                                                        {bandScore}
                                                    </span>
            
                                                    {/* Contest Info */}
                                                    <div className="text-lg space-y-1">
                                                        <p className="font-semibold">
                                                            {titles[submission.cid] || 'Loading...'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Contest type: {submission.type}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit by: {submission.submit_by || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit time: {new Date(submission.submit_time).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                        </>
                                    )}

                                    {submission.type === 'Speaking' && submission.status !== false && (
                                        <>
                                            <Link href={`/results/${submission.sid}`}>
                                                <div className="flex items-center">
                                                    {/* Band Score */}
                                                    <span className={`text-4xl font-bold ${bandColor} mr-6`}>
                                                        {bandScore}
                                                    </span>
            
                                                    {/* Contest Info */}
                                                    <div className="text-lg space-y-1">
                                                        <p className="font-semibold">
                                                            {titles[submission.cid] || 'Loading...'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Contest type: {submission.type}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit by: {submission.submit_by || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit time: {new Date(submission.submit_time).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
            
                                                {/* Answer Stats */}
                                                <div className="mt-4 text-base">
                                                    <span className="text-gray-500 mr-4">Fluency: {fluencyScore}</span>
                                                    <span className="text-gray-500 mr-4">Grammar: {grammarScore}</span>
                                                    <span className="text-gray-500 mr-4">Lexical Resource: {lexicalScore}</span>
                                                    <span className="text-gray-500 mr-4">Pronunciation: {pronunciationScore}</span>
                                                    <span className="text-gray-500 mr-4">Response: {responseScore}</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    {submission.type === 'Writing' && (
                                        <>
                                            <Link href={`/results/${submission.sid}`}>
                                                <div className="flex items-center">
                                                    {/* Band Score */}
                                                    <span className={`text-4xl font-bold ${bandColor} mr-6`}>
                                                        {bandScore}
                                                    </span>
            
                                                    {/* Contest Info */}
                                                    <div className="text-lg space-y-1">
                                                        <p className="font-semibold">
                                                            {titles[submission.cid] || 'Loading...'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Contest type: {submission.type}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit by: {submission.submit_by || 'Unknown'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Submit time: {new Date(submission.submit_time).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
            
                                                {/* Answer Stats */}
                                                <div className="mt-4 text-base">
                                                    <span className="text-gray-500 mr-4">TR: {submission.result[0].band}</span>
                                                    <span className="text-gray-500 mr-4">CC: {submission.result[1].band}</span>
                                                    <span className="text-gray-500 mr-4">LR: {submission.result[2].band}</span>
                                                    <span className="text-gray-500 mr-4">GR: {submission.result[3].band}</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <Footer />
        </div>
    );
    
};

export default ResultPage;
