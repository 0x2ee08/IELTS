'use client'

import React from 'react';

interface SchoolLeftSideProps {
    school: string;
    schoollist: any[];
    onSchoolChange: (school: string) => void;
}

const SchoolLeftSide: React.FC<SchoolLeftSideProps> = ({ school, schoollist, onSchoolChange }) => {
    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSchool = e.target.value;
        onSchoolChange(selectedSchool);
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    School
                </label>
                <select
                    value={school}
                    onChange={handleSchoolChange}
                    className="border border-gray-300 px-3 py-2 rounded-md w-full"
                >
                    <option value="">Select a school</option>
                    {schoollist.map((schoolOption) => (
                        <option key={schoolOption.id} value={schoolOption.id}>
                            {schoolOption.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SchoolLeftSide;
