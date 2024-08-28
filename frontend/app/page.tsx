// app/page.tsx
'use client'

import React from 'react';

import Head from 'next/head';
import Link from 'next/link';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-200 via-white to-white dark:from-zinc-800 dark:via-black dark:to-black">
          <Head>
              <title>Virtual Staging AI</title>
              <link rel="icon" href="/favicon.ico" />
          </Head>

          <Header />

          <div style={{ width: '100%' }}>
            <Slider {...Slidersettings}>
              <div>
                <img src="banner.jpg" alt="Banner" style={{ width: '100%', height: 'auto' }} />
              </div>
            </Slider>
          </div>
          <br />
          <MainContent />
          <br />
          <Footer />
      </div>
    </div>
  );
}

