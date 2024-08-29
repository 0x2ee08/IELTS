// app/page.tsx
'use client'

import React from 'react';

import Head from 'next/head';
import Link from 'next/link';
import Footer from './components/Footer';
// import MainContent from './components/MainContent';
import Header from './components/Header';

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './globals.css'; // 

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

          <div style={{ width: '100%' }}>
            <Slider {...Slidersettings}>
                <div className="image-container">
                  <img src="https://s3-alpha-sig.figma.com/img/2744/8c9f/1306bcd9c4f0ba993bad319f136b4704?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ieA1DwqocUkxjA4h-9IudKnCqe1VDCuhVWMQRrMW2AQWMoi6E8lA2Yp0ddHsY2AY6rwNRo88Q0b8ckoZoCFvuVIGRw3nxDLw97yGTCSugbxbRSWwgK9o-LTvCQ9f1F91GtOXLvacfvAhMK7syf51YsWchjH5o2K23kAq9L8pKtFMt9ibJ2FBKgHteEAWRdLY1vqhN83PY4rudCBwcilkZrSYL73~Ku1OEDUnLDZ3Ybe6QoqWD5RFEtfv72~uB~ZIN4GWj8tPCR3Hk6VQd05508DbxADIOrzs1kIfzG-F~URcNHjPKuWIGI0crDGivyFOIvutcZYDQKjS45FhqgffTQ__" alt="Loading" className="cropped-image" />
                  <div className = "overlay"></div>
                  {/* <img src="https://s3-alpha-sig.figma.com/img/01ce/79c8/a6d9ead7e7a159eba7d17231e5323dae?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OTMAlDXOWuKaDISfvy6co~Rs1lKAXdYhv8BHXd1xfuX6iwNyDjNAWkbYBNW589uuIvDtXNtIHAkx0TgyANGfen9vSA8y2rk1glZMNlDXON7fvVhvNmoSh8yftGRfLz-EYoGHwfI39mu5cqR2cvFsSsXw5mpoPzEhDaar7S0rBdKZvNjVVXccuYZwzGiGFek~ikaKyWisXEMeRibteNc0HaxOjbDS684X0dG2op4e5UIXeTzt8reWQT0JS-EsaN049YEj5~DFlloIlo0pN-~~3BDqqOaoKpGQnRjsITm3Dfdd8fokH5sNXHCBn94lmFAnVjBk9fIydmdrV98s0Dp2fw__" alt="Loading" className="overlay-image" /> */}
                </div>
            </Slider>
          </div>
          <br />
          {/* <MainContent /> */}
          <br />
          <Footer />
      </div>
    </div>
  );
}

