'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import config from '../../config'; 


export default function DetailResultPage() {
  const { submissionID } = useParams(); // Use useParams to access dynamic route parameters
  return (
    <>
        <Header />
        {submissionID}
        <Footer />
    </>
  );
}
