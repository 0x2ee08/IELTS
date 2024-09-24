'use client'

import React, { useEffect, useState } from 'react';
import './table.css';
import config from '../../config';

interface UserInfo {
    username: string;
    score: number[];
}

interface UserDetail {
    name: string;
    class_: string;
    school: string;
}

interface RankingTableProps {
    questions: string[];
    users: UserInfo[];
}

const RankingPage: React.FC<RankingTableProps> = ({ questions, users }) => {
    const [userDetails, setUserDetails] = useState<Map<string, UserDetail>>(new Map());

    useEffect(() => {
        const fetchUserDetails = async () => {
            const detailsPromises = users.map(async (user) => {
                const response = await fetch(`${config.API_BASE_URL}api/getUserRankingDetail`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ username: user.username }),
                });

                if (!response.ok) {
                    console.error(`Failed to fetch details for user: ${user.username}`);
                    return null;
                }

                const result = await response.json();
                return { username: user.username, ...result }; // Combine user info with fetched details
            });

            const details = await Promise.all(detailsPromises);
            const validDetails = details.filter(Boolean); // Filter out any null responses
            const detailsMap = new Map(validDetails.map(detail => [detail.username, detail]));
            setUserDetails(detailsMap);
        };

        fetchUserDetails();
    }, [users]);

    const usersWithTotalScores = users.map(user => ({
        ...user,
        totalScore: user.score.reduce((acc, score) => acc + score, 0),
    }));

    const sortedUsers = [...usersWithTotalScores].sort(
        (a, b) => b.totalScore - a.totalScore
    );

    const getScoreClass = (score: number) => {
        if (score >= 8) return 'score-green';
        if (score >= 6) return 'score-orange';
        return 'score-red';
    };

    return (
        <div className="p-8">
            <table className="min-w-full border-collapse text-lg">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-2 py-2 text-center border-r">Rank</th>
                        <th className="px-2 py-2 text-center border-r">Username</th>
                        <th className="px-2 py-2 text-center border-r">Name</th>
                        <th className="px-2 py-2 text-center border-r">Class</th>
                        <th className="px-2 py-2 text-center border-r">School</th>
                        {questions.map((question, index) => (
                            <th key={index} className="px-2 py-2 text-center border-r">
                                {question}
                            </th>
                        ))}
                        <th className="px-2 py-2 text-center border-r">Total Score</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((user, index) => {
                        const details = userDetails.get(user.username) || { name: '', class_: '', school: '' }; // Fallback to empty strings if details are not available
                        return (
                            <tr key={user.username}>
                                <td className="px-2 py-2 text-center border-r">{index + 1}</td>
                                <td className="px-2 py-2 text-center border-r username-column">{user.username}</td>
                                <td className="px-2 py-2 text-center border-r">{details.name}</td>
                                <td className="px-2 py-2 text-center border-r">{details.class_}</td>
                                <td className="px-2 py-2 text-center border-r">{details.school}</td>
                                {user.score.map((score, scoreIndex) => (
                                    <td key={scoreIndex} className={`px-2 py-2 text-center border-r score-column ${getScoreClass(score)}`}>
                                        {score}
                                    </td>
                                ))}
                                <td className="px-2 py-2 text-center border-r score-column">{user.totalScore}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RankingPage;
