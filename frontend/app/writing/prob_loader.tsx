'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

interface SchoolLeftSideProps {
    school: string;
    schoollist: any[];
    onSchoolChange: (school: string) => void;
    onNewSchool: (school: string) => void;
}

const SchoolLeftSide: React.FC<SchoolLeftSideProps> = ({ school, schoollist, onSchoolChange, onNewSchool }) => {

    return (
        <div>
            
        </div>
    );
};

export default SchoolLeftSide;
