import React, { useState, useEffect } from "react";
import PendulumAnimation from "./PendulumAnimation";
import BeakerAnimation from "./BeakerAnimation";
import CalculusAnimation from "./CalculusAnimation";
import "./Slider.css";

function Slider({ slides, interval = 4000 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides, interval]);

  if (!slides || slides.length === 0) return null;

  const getAnimationComponent = (category, color) => {
    switch (category) {
      case "Physics":
        return <PendulumAnimation size="medium" color={color} />;
      case "Chemistry":
        return <BeakerAnimation size="medium" liquidColor={color} bubbles={true} heat={true} />;
      case "Mathematics":
        return <CalculusAnimation type="combined" size="medium" equation="f(x) = sin(x)" />;
      case "Biology":
        return <BeakerAnimation size="medium" liquidColor={color} bubbles={true} />;
      default:
        return <PendulumAnimation size="medium" color={color} />;
    }
  };

  return (
    <div className="slider-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slider-slide ${index === current ? "active" : ""}`}
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
            '--slide-color': slide.color
          }}
        >
          <div className="slider-content">
            <div className="slider-animation">
              {getAnimationComponent(slide.category, slide.color)}
            </div>
            <div className="slider-text">
              <div className="slide-category" style={{ color: slide.color }}>
                {slide.category}
              </div>
              <h2 className="slider-title">{slide.name}</h2>
              <p className="slider-description">{slide.description}</p>
              <button className="slider-button" style={{ backgroundColor: slide.color }}>
                Explore {slide.category}
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
