// app/page.tsx
'use client'

import React from 'react';

import Head from 'next/head';
import Link from 'next/link';
import Footer from './components/Footer';
import Header from './components/Header';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  var Slidersettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div>
      <div className="flex flex-col min-h-screen">
          <Head>
              <title>IELTS</title>
              <link rel="icon" href="/favicon.ico" />
          </Head>

          <Header />

    
          <Footer />
      </div>
    </div>
  );
}

