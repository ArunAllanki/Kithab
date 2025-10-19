// src/Components/Carousel.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import slide1 from "../Assets/CR1.png";
import slide2 from "../Assets/CR2.png";
import slide3 from "../Assets/CR3.png";
import slide4 from "../Assets/CR4.png";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Import modules correctly for Swiper v10+
import { Navigation } from "swiper/modules";
import { Pagination } from "swiper/modules";
import { Autoplay } from "swiper/modules";

import "./Carousel.css";

const Carousel = () => {
  const slides = [slide1, slide2, slide3, slide4];

  return (
    <div className="dashboard-carousel">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
      >
        {slides.map((src, index) => (
          <SwiperSlide key={index}>
            <img src={src} alt={`Slide ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
