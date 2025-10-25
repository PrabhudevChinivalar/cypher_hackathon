import React, { useState, useEffect } from 'react';
import './BeakerAnimation.css';

const BeakerAnimation = ({ 
  size = 'medium', 
  liquidColor = '#4CAF50', 
  liquidLevel = 60,
  bubbles = true,
  heat = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`beaker-container ${size} ${heat ? 'heated' : ''}`}>
      <div className="beaker-setup">
        <div className="beaker-glass">
          <div 
            className="beaker-liquid" 
            style={{ 
              '--liquid-color': liquidColor,
              '--liquid-level': `${liquidLevel}%`
            }}
          >
            {bubbles && (
              <>
                <div className="bubble bubble-1"></div>
                <div className="bubble bubble-2"></div>
                <div className="bubble bubble-3"></div>
                <div className="bubble bubble-4"></div>
                <div className="bubble bubble-5"></div>
              </>
            )}
            {heat && (
              <div className="steam">
                <div className="steam-particle steam-1"></div>
                <div className="steam-particle steam-2"></div>
                <div className="steam-particle steam-3"></div>
              </div>
            )}
          </div>
          <div className="beaker-graduations">
            <div className="graduation"></div>
            <div className="graduation"></div>
            <div className="graduation"></div>
            <div className="graduation"></div>
          </div>
        </div>
        <div className="beaker-label">H₂O</div>
      </div>
    </div>
  );
};

export default BeakerAnimation;
