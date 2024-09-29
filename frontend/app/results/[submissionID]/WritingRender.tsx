'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config'; 
import './submission.css';
import Link from 'next/link';
import PieChart from './reading/donut_chart';
import Markdown from 'react-markdown'
import { Button, CircularProgress, Card, CardBody, CardFooter, Chip } from "@nextui-org/react"

export default function WritingRender() {
    const { submissionID } = useParams();

    const cardColors = ['bg-gradient-to-br from-red-500 to-fuchsia-400', 'bg-gradient-to-br from-cyan-500 to-teal-400', 'bg-gradient-to-br from-yellow-300 to-amber-300', 'bg-gradient-to-br from-indigo-500 to-violet-400'];

    const gridContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 2 equal-width columns
        gap: '20px', // Adjust the spacing between cards
        justifyContent: 'center', // Center the entire grid horizontally
        alignItems: 'center', // Center the entire grid vertically
    };

    const gridItemStyle = {
        display: 'flex',
        justifyContent: 'center', // Center each card horizontally within its cell
        alignItems: 'center', // Center each card vertically within its cell
    };

    // State for the prompt and essay inputs
    const [prompt, setPrompt] = useState("");
    const [essay, setEssay] = useState("");
    const [evaluation, setEvaluation] = useState([]);
    const [hasbeenGraded, setHasBeenGraded] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchSubmission = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}api/getWritingSubmissionsInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: submissionID }),
        });

        const result = await response.json();

        setEvaluation(result.evaluation);
        setPrompt(result.prompt);
        setEssay(result.essay);
        // console.log(result);
    };

    // useEffect
    useEffect(() => {
        fetchSubmission();
    }, []);

    // Function to auto-resize the textarea
    const handleTextareaChange = (e:any, setState:any) => {
        const textarea = e.target;
        setState(textarea.value);

        // Auto-resize logic
        textarea.style.height = "auto"; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set new height based on scrollHeight
    };

    return (
        <div className="flex flex-col min-h-screen w-full">

            {/* Two-panel layout */}
            <main className="flex-grow flex w-full h-screen">
                {/* Left panel for writing prompt and essay input */}
                <div className="w-1/2 p-6 border-r h-full overflow-y-auto">
                    <h1 className="text-3xl font-bold mb-6 text-left">IELTS Writing Grader (Task 2)</h1>

                    {/* Prompt Input (now a textarea) */}
                    <div>
                        <label className="block text-lg font-medium mb-2" htmlFor="prompt" style={{fontWeight:'bold'}}>Writing Prompt:</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => handleTextareaChange(e, setPrompt)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Enter the prompt here"
                            style={{ overflow: 'hidden', resize: 'none' }} // Disable manual resizing
                            rows={4} // Initial height for prompt
                            disabled = {true}
                        />
                    </div>
                    {/* Essay Textarea */}
                    <div>
                        <label className="block text-lg font-medium mb-2" htmlFor="essay" style={{fontWeight:'bold'}}>Your Essay:</label>
                        <textarea
                            id="essay"
                            value={essay}
                            onChange={(e) => handleTextareaChange(e, setEssay)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Write your essay here..."
                            style={{ overflow: 'hidden', resize: 'none' }} // Disable manual resizing
                            rows={6} // Initial height for essay
                            disabled = {true}
                        />
                    </div>
                </div>

                {/* Right panel for grading results or additional content */}
                <div className="w-1/2 p-6 h-full overflow-y-auto">
                        <h2 className="text-2xl font-semibold mb-4">Grading Results</h2>
                        <div>
                            {/* This section can display grading results, feedback, or additional info */}
                            {hasbeenGraded ? (
                                evaluation && evaluation.length > 0 ? (
                                    !loading ? (
                                        <div style={gridContainerStyle}>
                                        {evaluation.map((item, index) => (
                                            <div key={index} style={gridItemStyle}> {/* Wrap each card in a centered flex container */}
                                                <Card
                                                    className={`w-[240px] h-[240px] border-none ${cardColors[index % cardColors.length]}`}
                                                >
                                                    <CardBody className="flex justify-center items-center pb-0">
                                                        <CircularProgress
                                                            classNames={{
                                                                svg: "w-36 h-36 drop-shadow-md",
                                                                indicator: "stroke-white",
                                                                track: "stroke-white/10",
                                                                value: "text-3xl font-semibold text-white",
                                                            }}
                                                            value={Number(item['band'])}
                                                            formatOptions={{ style: "decimal" }}
                                                            minValue={0}
                                                            maxValue={9}
                                                            strokeWidth={4}
                                                            showValueLabel={true}
                                                        />
                                                    </CardBody>
                                                    <CardFooter className="flex justify-center items-center pt-0">
                                                        <Chip
                                                            classNames={{
                                                                base: "border-1 border-white/30",
                                                                content: "text-white/90 text-small font-semibold",
                                                            }}
                                                            variant="bordered"
                                                        >
                                                            {item['type']}
                                                        </Chip>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                    ):(
                                        <div className="border p-4 rounded-lg h-15 bg-gray-50"><p className="text-gray-700">Loading...</p></div>
                                    )
                                    
                                ) : (
                                    <p className="text-gray-700">No evaluation data returned.</p>
                                )
                            ) : (
                                <p className="text-gray-700">Grading results or feedback will appear here once the essay is submitted.</p>
                            )}
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">Detailed Feedback</h2>
                        <div className="border p-4 rounded-lg h-15 bg-gray-50">
                            {hasbeenGraded ? (
                                evaluation && evaluation.length > 0 ? (
                                    !loading ? (
                                        <div>
                                            {evaluation.map((item, index) => (
                                                <li key={index} className="padding_bottom:25px">
                                                    <Markdown>{`**${item['type']}**`}</Markdown>
                                                    <Markdown>{`${item['response']}`}</Markdown>
                                                </li>
                                            ))}
                                        </div>    
                                    ):(
                                        <p className="text-gray-700">Loading...</p>
                                    )
                                ) : (
                                    <p className="text-gray-700">No feedback data returned.</p>
                                )
                            ) : (
                                <p className="text-gray-700">Grading results or feedback will appear here once the essay is submitted.</p>
                            )}
                        </div>                
                </div>
            </main>
        </div>
    );
}
