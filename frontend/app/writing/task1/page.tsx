'use client'

import React, { use, useState } from "react";
import Head from "next/head";
import Header from '../../components/Header';
import { Button, CircularProgress, Card, CardBody, CardFooter, Chip } from "@nextui-org/react"
import config from '../../config';
import { createRoot } from 'react-dom/client'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


export default function WritingGrader() {
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
    const [hasbeenGraded, setHasBeenGraded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle the form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    };

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
            <Header />

            {/* Two-panel layout */}
            <main className="flex-grow flex w-full h-screen">
                {/* Left panel for writing prompt and essay input */}
                <div className="w-1/2 p-6 border-r h-full overflow-y-auto">
                    <h1 className="text-3xl font-bold mb-6 text-left">IELTS Writing Grader (Task 1 Academic)</h1>

                    {/* Form for entering prompt and essay */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            />
                        </div>
                    </form>
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
                        />
                    </div>

                    {/* Submit Button */}
                    <div>
                        <form onSubmit={handleSubmit}>
                            <Button
                                color="success"
                                type="submit"
                                className="w-full py-2 px-4 rounded-lg transition-colors"
                                // onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Grade Essay'}
                            </Button>    
                        </form>
                    </div>
                </div>

                {/* Right panel for grading results or additional content */}
                <div className="w-1/2 p-6 h-full overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                    </form>                   
                </div>
            </main>
        </div>
    );
}
