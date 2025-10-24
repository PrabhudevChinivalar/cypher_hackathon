import React, { useState, useEffect } from "react";
import "./Slider.css";

function Slider({ slides, interval = 3000 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides, interval]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slider-slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="slider-title">{slide.name}</div>
        </div>
      ))}
    </div>
  );
}

export default Slider;
