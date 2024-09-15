'use client';

import React, { useEffect, useState, useRef } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import config from '../config';

const ProblemsPage: React.FC = () => {
    const [problems, setProblems] = useState<any[]>([]); // State for blog data

    const get_problem_list = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.API_BASE_URL}api/get_problemlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            const result = await response.json();

            console.log(result.problemlist);
            // Update state with the list of problems
            setProblems(result.problemlist || []); // Ensure it's an array
        } catch (error) {
            console.error('Error getting list:', error);
            alert('Internal server error');
        }
    };

    const hasInitialize = useRef(false);

    useEffect(() => {
        if (!hasInitialize.current) {
            get_problem_list();
            hasInitialize.current = true;
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div
            style={{
                maxWidth: '100%', // Adjust this as needed to fit your layout
                paddingLeft: '100px', // Padding on all sides
                paddingRight: '300px'
            }}>
                {problems.length > 0 ? (
                    problems.map((problem, idx) => {
                        const link = `/loader/problem?id=${problem.id}`;
                        return (
                            <div key={idx}>
                                <div className="my-1"></div> 
                                <a href={link}>
                                    <div 
                                        className="p-4 rounded-lg"
                                    > 
                                        <p className="font-bold">{problem.id}</p>
                                    </div>  
                                </a>
                            </div>
                        );
                    })
                ) : (
                    <p>No problems found.</p>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ProblemsPage;
