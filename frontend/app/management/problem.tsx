'use client';

import React, { useState } from 'react';

const AddContest: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState('Listening');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div className="container">
            <label htmlFor="type-select" className="label">
                Type
            </label>
            <select
                id="type-select"
                value={selectedOption}
                onChange={handleChange}
                className="dropdown"
            >
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
            </select>
            <style jsx>{`
                .container {
                    display: flex;
                    align-items: center;
                    height: 100vh;
                    justify-content: center;
                    gap: 16px;
                }

                .label {
                    font-size: 18px;
                    color: #333;
                }

                .dropdown {
                    padding: 12px;
                    font-size: 16px;
                    border: 2px solid #00B4D8;
                    border-radius: 8px;
                    background-color: white;
                    color: #333;
                    cursor: pointer;
                    transition: border-color 0.3s ease;
                }

                .dropdown:hover {
                    border-color: #005f73;
                }
            `}</style>
        </div>
    );
};

export default AddContest;
