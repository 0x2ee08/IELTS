'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config'; 
import './submission.css';
import Link from 'next/link';
import PieChart from './reading/donut_chart';

export default function WritingRender() {
    const { submissionID } = useParams();
    return (
    <>
        {submissionID}
    </>
    );
}
