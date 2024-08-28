'use client';

import React from 'react';

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
    <main style={{ width: '100%' }}>
      <Slider {...Slidersettings}>
        <div>
          <img src="banner.jpg" alt="Banner" style={{ width: '100%', height: 'auto' }} />
        </div>
      </Slider>
    </main>
  );
}
