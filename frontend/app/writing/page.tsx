'use client'

import React, { useState } from "react";
import Head from "next/head";
import Header from '../components/Header';
import { Button } from "@nextui-org/react"


export default function WritingGrader() {

    // State for the prompt and essay inputs
    const [prompt, setPrompt] = useState("");
    const [essay, setEssay] = useState("");

    // Handle the form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add logic to grade the essay or send the data to a backend API
        console.log("Prompt:", prompt);
        console.log("Essay:", essay);
    };

    // Function to auto-resize the textarea
    const handleTextareaChange = (e, setState) => {
        const textarea = e.target;
        setState(textarea.value);

        // Auto-resize logic
        textarea.style.height = "auto"; // Reset the height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set new height based on scrollHeight
    };

    return (
        <div className="flex flex-col min-h-screen w-full">
            <Head>
                <title>IELTS Writing Grader</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            {/* Two-panel layout */}
            <main className="flex-grow flex w-full">
                {/* Left panel for writing prompt and essay input */}
                <div className="w-1/2 p-6 border-r">
                    <h1 className="text-3xl font-bold mb-6 text-left">IELTS Writing Grader (Task 2)</h1>

                    {/* Form for entering prompt and essay */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Prompt Input (now a textarea) */}
                        <div>
                            <label className="block text-lg font-medium mb-2" htmlFor="prompt">
                                Enter Writing Prompt:
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => handleTextareaChange(e, setPrompt)}
                                className="w-full p-3 border rounded-lg"
                                placeholder="Enter the task 2 prompt here"
                                style={{ overflow: 'hidden', resize: 'none' }} // Disable manual resizing
                                rows={4} // Initial height for prompt
                            />
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">Grading Results</h2>
                        <div className="border p-4 rounded-lg h-15 bg-gray-50">
                            {/* This section can display grading results, feedback, or additional info */}
                            <p className="text-gray-700">Grading results or feedback will appear here once the essay is submitted.</p>
                        </div>
                    </form>
                </div>

                {/* Right panel for grading results or additional content */}
                <div className="w-1/2 p-6">
                    {/* Essay Textarea */}
                    <div>
                        <label className="block text-lg font-medium mb-2" htmlFor="essay">
                            Enter Your Essay:
                        </label>
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
                        <Button
                            color="success"
                            type="submit"
                            className="w-full py-2 px-4 rounded-lg transition-colors"
                            onClick={handleSubmit}
                        >
                            Grade Essay
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
