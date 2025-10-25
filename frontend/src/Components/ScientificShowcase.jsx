import React, { useState, useEffect } from 'react';
import PendulumAnimation from './PendulumAnimation';
import BeakerAnimation from './BeakerAnimation';
import CalculusAnimation from './CalculusAnimation';
import './ScientificShowcase.css';

const ScientificShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const demos = [
    {
      title: "Physics Laboratory",
      description: "Interactive pendulum simulations demonstrating harmonic motion and wave mechanics",
      animation: <PendulumAnimation size="large" color="#007bff" />,
      color: "#007bff"
    },
    {
      title: "Chemistry Experiments", 
      description: "Animated beaker reactions showing molecular interactions and chemical processes",
      animation: <BeakerAnimation size="large" liquidColor="#4CAF50" bubbles={true} heat={true} />,
      color: "#4CAF50"
    },
    {
      title: "Mathematical Analysis",
      description: "Dynamic calculus visualizations with real-time graphing and derivative calculations",
      animation: <CalculusAnimation type="combined" size="large" equation="f(x) = sin(x)" />,
      color: "#ff6b6b"
    }
  ];

  return (
    <div className={`scientific-showcase ${isVisible ? 'visible' : ''}`}>
      <div className="showcase-header">
        <h2 className="showcase-title">Interactive Scientific Learning</h2>
        <p className="showcase-subtitle">
          Experience cutting-edge educational animations that bring complex scientific concepts to life
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-display">
          <div className="demo-animation">
            {demos[activeDemo].animation}
          </div>
          <div className="demo-info">
            <h3 className="demo-title" style={{ color: demos[activeDemo].color }}>
              {demos[activeDemo].title}
            </h3>
            <p className="demo-description">
              {demos[activeDemo].description}
            </p>
          </div>
        </div>

        <div className="demo-controls">
          {demos.map((demo, index) => (
            <button
              key={index}
              className={`demo-button ${activeDemo === index ? 'active' : ''}`}
              onClick={() => setActiveDemo(index)}
              style={{ '--button-color': demo.color }}
            >
              <span className="button-indicator"></span>
              <span className="button-text">{demo.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <PendulumAnimation size="medium" color="#007bff" />
          <h4>Physics Simulations</h4>
          <p>Real-time pendulum motion with customizable parameters</p>
        </div>
        <div className="feature-card">
          <BeakerAnimation size="medium" liquidColor="#4CAF50" bubbles={true} />
          <h4>Chemistry Labs</h4>
          <p>Interactive chemical reactions with bubbling effects</p>
        </div>
        <div className="feature-card">
          <CalculusAnimation type="graph" size="medium" />
          <h4>Math Visualizations</h4>
          <p>Dynamic graphing with calculus concepts</p>
        </div>
      </div>
    </div>
  );
};

export default ScientificShowcase;
