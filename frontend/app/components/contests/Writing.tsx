'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import config from '../../config';
import RankingPage from '../ranking/RankingPage';
import CustomPagination from '../pagination/CustomPagination';

interface UserInfo {
  username: string;
  score: number[];
}

const WritingContest = ({ contest }: { contest: any }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [userWriting, setUserWriting] = useState<string[]>(Array(contest.tasks.length).fill(""));
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const cookieData = Cookies.get(`userWriting-${contest.id}`);
    const cPage = Cookies.get(`Writing_Current_Page-${contest.id}`);
    if (cookieData) {
      const parsedData = JSON.parse(cookieData);
      setUserWriting(parsedData);
    }
    if (cPage) {
      setCurrentPage(Number(cPage));
    }
    fetchSubmission();
  }, []);

  useEffect(() => {
    if (currentPage >= contest.tasks.length) {
      fetchUsersScore();
    }
  }, [currentPage, contest.tasks]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(contest.endTime).getTime();
      const now = Date.now();
      const difference = endTime - now;
      setTimeLeft(difference > 0 ? difference : 0);
    };

    calculateTimeLeft();

    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [contest.endTime]);

  const fetchUsersScore = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${config.API_BASE_URL}api/getWritingUsersScore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: contest.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.users);
      }
    } catch (err) {
      console.error('Error fetching users score:', err);
    }
  };

  const fetchSubmission = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${config.API_BASE_URL}api/getWritingUserSubmissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: contest.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissions(result);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleTextareaChange = (taskId: number, value: string) => {
    const newUserWriting = [...userWriting];
    newUserWriting[taskId] = value;
    setUserWriting(newUserWriting);
    Cookies.set(`userWriting-${contest.id}`, JSON.stringify(newUserWriting), { expires: 7 });
  };

  const handleSubmit = async (taskId: number) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}api/submitWritingContest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: contest.id,
          taskId,
          prompt: contest.tasks[taskId].content,
          content: userWriting[taskId],
        }),
      });

      if (response.ok) {
        const newUserWriting = [...userWriting];
        newUserWriting[taskId] = "";
        setUserWriting(newUserWriting);
        Cookies.set(`userWriting-${contest.id}`, JSON.stringify(newUserWriting), { expires: 7 });
        window.location.reload();
      }
    } catch (err) {
      console.error('Error submitting task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTaskPage = (type: string, task_id: number, task: any) => {
    if (!type) return null;
    if (type === 'Writing Task 2' || type === 'Writing Task 1 General') {
      return (
        <div>
          <p className="font-black text-xl"> Question: </p>
          <p className='mt-4'> {task.content} </p>
          <p className="font-black text-xl mt-4"> Essay Drafting Section</p>
          <textarea
            id={`essay-${task_id}`}
            value={userWriting[task_id]}
            onChange={(e) => handleTextareaChange(task_id, e.target.value)}
            className="w-full h-80 p-4 border border-black rounded-lg mt-2 resize-none overflow-y-auto focus:border-black focus:outline-black"
            disabled={isLoading}
            placeholder="Write your essay here..."
            rows={6}
          />
          <div className="flex justify-center mt-2">
            <button
              className={`font-bold py-2 px-4 rounded-lg ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0077B6] hover:bg-[#3d5a80] text-white'
              }`}
              onClick={() => handleSubmit(task_id)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit Task'}
            </button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderUserSubmission = () => {
    const truncateSid = (sid: string) => {
      return sid.length > 8 ? `${sid.substring(0, 8)}...` : sid;
    };
    return (
      <div className="w-[20vw] border border-black rounded-lg overflow-hidden">
        <table className="w-full table-fixed border-collapse bg-white text-left text-sm">
          <thead className="bg-white text-xs uppercase">
            <tr>
              <th className="p-2 border-b border-black">Submission</th>
              <th className="p-2 border-b border-black">Time</th>
              <th className="p-2 border-b border-black">Band</th>
            </tr>
          </thead>
          <tbody>
            {submissions &&
              submissions
                .filter((submission) => submission.task_id === currentPage)
                .map((submission, index, array) => {
                  let bandColor = 'text-red-600';
                  const bandScore = submission.band;

                  if (bandScore >= 7.0) {
                    bandColor = 'text-green-600';
                  } else if (bandScore >= 5.0) {
                    bandColor = 'text-yellow-600';
                  }

                  return (
                    <tr
                      key={submission.sid}
                    >
                      <td className="p-2 border border-black border-b-0 border-l-0">
                        <Link
                          href={`/results/${submission.sid}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {truncateSid(submission.sid)}
                        </Link>
                      </td>
                      <td className="p-2 border border-black ">
                        {new Date(submission.time_created).toLocaleString()}
                      </td>
                      <td className="p-2 text-center border border-black">
                        <span className={bandColor}>{bandScore}</span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

    );
  };

  const renderRankingPage = () => {
    const indexToLetter = (index: number) => String.fromCharCode(65 + index);
    const questions = contest.tasks.map((_: any, index: any) => `Task ${indexToLetter(index)}`);

    return (
      <div>
        <RankingPage questions={questions} users={users} />
      </div>
    );
  };

  const formatTimeLeft = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, '0')}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${String(minutes).padStart(2, '0')}m`);
    parts.push(`${String(seconds).padStart(2, '0')}s`);

    return parts.join(' ');
  };

  return (
    <>
      <div
        style={{
          backgroundColor: '#fff8c4',
          color: '#333',
          padding: '8px 20px',
          fontSize: '14px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        This site is under development. This is the raw page.
      </div>

      <div className="flex flex-col min-h-screen">
        <div className="flex justify-between">
          <div className="w-4/5 bg-white ml-16 mt-2 p-8">
            <div className="flex justify-center m-4 mb-10">
              <CustomPagination
                total={contest.tasks.length}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  Cookies.set('Writing_Current_Page-' + contest.id, page.toString());
                }}
              />
            </div>
            {currentPage < contest.tasks.length
              ? renderTaskPage(contest.tasks[currentPage]?.type, currentPage, contest.tasks[currentPage])
              : renderRankingPage()}
          </div>

          <div className="w-1/5 bg-white mr-20 mt-16 flex flex-col">
            <div className="border border-black rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold text-center">{contest.problemName}</p>
            </div>
            <div className="border border-black rounded-lg p-4 mb-4">
              <p className="text-center text-xl">
                {timeLeft > 0 ? (
                  <>
                    <div className="text-blue-800 font-bold">Contest is running</div>
                    <div>{formatTimeLeft(timeLeft)}</div>
                  </>
                ) : (
                  <div className="font-bold">Finished</div>
                )}
              </p>
            </div>
            {currentPage < contest.tasks.length && renderUserSubmission()}
          </div>
        </div>
      </div>
    </>
  );
};

export default WritingContest;
