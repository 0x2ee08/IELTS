'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config'; 
import './submission.css';
import Link from 'next/link';


export default function SpeakingRender() {
  const { submissionID } = useParams();
  
  return (
    <>
        Speaking page : {submissionID}
    </>
  );
}
