'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomPagination from '../pagination/CustomPagination';
import {Card, CardHeader, CardBody, Divider, Image, Link} from "@nextui-org/react";
import {Chip} from "@nextui-org/react";

import ListeningTaskContest from './listening/task';
import RankingPage from '../ranking/ranking';

interface UserInfo {
    username: string;
    score: number[];
}

const ListeningContest = ({ contest }: { contest: any }) => {
    const hasInitialized = useRef(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [users, setUsers] = useState<UserInfo[]>([]);

    useEffect(() => {
        if (!hasInitialized.current) {
            
            hasInitialized.current = true;
        }
    }, []);

    // const renderRankingPage = () => {
    //     const indexToLetter = (index: number) => String.fromCharCode(65 + index);
    //     const questions = contest.taskArray.map((_, index) => `Task ${indexToLetter(index)}`);

    //     return (
    //         <div>
    //             <RankingPage questions={questions} users={users} />
    //         </div>
    //     );
    // };

    return (
        <div>
            {hasInitialized.current && (
                <>
                    <div className='flex justify-center m-4 ml-20 mr-20 mb-10'>
                        <CustomPagination
                            total={contest.taskArray.length}
                            currentPage={currentPage}
                            queuePage={false}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </>
            )}
            <div className='flex justify-between w-full'>
                <div className='w-4/5 ml-10 mr-2'>
                    {currentPage < contest.taskArray.length 
                        ? ListeningTaskContest({contest: contest, currentPage: currentPage})
                        : null
                    }
                </div>
                <div className='w-1/5 mr-10 ml-2'>
                    <div className="w-full container mx-2 my-4 p-4 border border-gray-300 rounded-xl">
                        <div className='mb-2 flex flex-row items-center justify-between'>
                            <div className='text-lg font-bold mr-2'>Time Left</div>
                            <Chip radius="sm" color="primary" className='flex items-center'>
                                <p className='text-[1.125rem] font-semibold'>Hello</p>
                            </Chip>
                        </div>
                        <Divider className='mb-2'/>
                        <p className='text-lg font-bold mb-2'>{contest.problemName}</p>
                        <p className='text-lg mb-2'>
                            Start: {new Date(contest.startTime).toLocaleString()}
                        </p>
                        <p className='text-lg mb-2'>
                            End: {new Date(contest.endTime).toLocaleString()}
                        </p>
                        <p className='text-lg mb-2'>
                            Author: {contest && contest.created_by ? (
                                <Link className="text-lg" href={`/loader/profile?id=${contest.created_by}`}>
                                    {contest.created_by}
                                </Link>
                            )
                                : null
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeningContest;