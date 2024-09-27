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
    const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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
                return { username: user.username, ...result };
            });

            const details = await Promise.all(detailsPromises);
            const validDetails = details.filter(Boolean);
            const detailsMap = new Map(validDetails.map(detail => [detail.username, detail]));
            setUserDetails(detailsMap);
        };

        fetchUserDetails();
    }, [users]);

    // Filter users based on selected school and class
    const filteredUsers = users.filter((user) => {
        const details = userDetails.get(user.username);
        if (!details) return true;
        return (
            (!selectedSchool || details.school === selectedSchool) &&
            (!selectedClass || details.class_ === selectedClass)
        );
    });

    const usersWithTotalScores = filteredUsers.map(user => ({
        ...user,
        totalScore: user.score.reduce((acc, score) => acc + score, 0),
    }));

    // Handle sorting for scores and total score
    const sortedUsers = [...usersWithTotalScores].sort((a, b) => {
        if (!sortConfig) {
            // Default sorting by totalScore in descending order
            return b.totalScore - a.totalScore;
        }
    
        const { key, direction } = sortConfig;
        const order = direction === 'asc' ? 1 : -1;
    
        if (key === 'totalScore') {
            return (b.totalScore - a.totalScore) * order;
        } else if (key.startsWith('score_')) {
            const index = parseInt(key.split('_')[1]);
            return (b.score[index] - a.score[index]) * order;
        }
    
        return 0;
    });
    

    const getScoreClass = (score: number) => {
        if (score >= 8) return 'score-green';
        if (score >= 6) return 'score-orange';
        return 'score-red';
    };

    const handleSort = (key: string) => {
        setSortConfig((prevConfig) => {
            if (prevConfig?.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // Generate CSV
    const downloadCSV = () => {
        const header = ['Rank', 'Username', 'Name', 'Class', 'School', ...questions, 'Total Score'];
        const rows = sortedUsers.map((user, index) => {
            const details = userDetails.get(user.username) || { name: '', class_: '', school: '' };
            return [
                index + 1,
                user.username,
                details.name,
                details.class_,
                details.school,
                ...user.score,
                user.totalScore,
            ];
        });

        // Convert the data into CSV format
        const csvContent = [
            header.join(','), // Add header row
            ...rows.map(row => row.join(',')), // Add each data row
        ].join('\n');

        // Create a Blob from the CSV data
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ranking.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8">
            <div className="mb-4">
                <label className="mr-4">
                    Filter by School:
                    <select value={selectedSchool || ''} onChange={(e) => setSelectedSchool(e.target.value || null)}>
                        <option value="">All</option>
                        {Array.from(new Set(Array.from(userDetails.values()).map((d) => d.school))).map((school) => (
                            <option key={school} value={school}>
                                {school}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Filter by Class:
                    <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)}>
                        <option value="">All</option>
                        {Array.from(new Set(Array.from(userDetails.values()).map((d) => d.class_))).map((class_) => (
                            <option key={class_} value={class_}>
                                {class_}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mb-4">
                <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Download CSV
                </button>
            </div>

            <table className="min-w-full border-collapse text-lg">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-2 py-2 text-center border-r">Rank</th>
                        <th className="px-2 py-2 text-center border-r">Username</th>
                        <th className="px-2 py-2 text-center border-r">Name</th>
                        <th className="px-2 py-2 text-center border-r">Class</th>
                        <th className="px-2 py-2 text-center border-r">School</th>
                        {questions.map((question, index) => (
                            <th
                                key={index}
                                className="px-2 py-2 text-center border-r cursor-pointer"
                                onClick={() => handleSort(`score_${index}`)}
                            >
                                {question}
                            </th>
                        ))}
                        <th
                            className="px-2 py-2 text-center border-r cursor-pointer"
                            onClick={() => handleSort('totalScore')}
                        >
                            Total Score
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((user, index) => {
                        const details = userDetails.get(user.username) || { name: '', class_: '', school: '' };
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
