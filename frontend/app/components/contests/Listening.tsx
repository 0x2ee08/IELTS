'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomPagination from '../pagination/CustomPagination';

const ListeningContest = ({ contest }: { contest: any }) => {
    const hasInitialized = useRef(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [taskArray, setTaskArray] = useState<any[]>([]);

    useEffect(() => {
        if (!hasInitialized.current) {
            
            hasInitialized.current = true;
        }
    }, []);

    return (
        <div>
            {hasInitialized.current && (
                <>
                    <div className='flex justify-center m-4 ml-20 mr-20 mb-10'>
                        <CustomPagination
                            total={taskArray.length}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                    {/* {currentPage < taskArray.length 
                        ? renderTaskPage(taskArray[currentPage]?.type, currentPage, taskArray[currentPage])
                        : (currentPage === taskArray.length
                            ? renderRankingPage() 
                            : renderQueuePage()
                        )
                    } */}
                </>
            )}
            <div className='flex justify-between w-full'>
                <div className='flex w-4/5'>
                    {/* Content for the left section can go here */}
                </div>
                <div className='flex w-1/5'>
                    {contest.problemName}       
                </div>
            </div>
        </div>
    );
};

export default ListeningContest;