import React, { useState, useEffect } from 'react';
import './CalculusAnimation.css';

const CalculusAnimation = ({ 
  type = 'graph', 
  size = 'medium',
  equation = 'f(x) = x²',
  showDerivative = true 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderGraph = () => (
    <div className="calculus-graph">
      <svg viewBox="0 0 200 120" className="graph-svg">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="200" height="120" fill="url(#grid)" />
        
        {/* Axes */}
        <line x1="20" y1="100" x2="180" y2="100" stroke="#333" strokeWidth="2"/>
        <line x1="100" y1="20" x2="100" y2="100" stroke="#333" strokeWidth="2"/>
        
        {/* Function curve */}
        <path 
          d="M 20 100 Q 60 80 100 60 T 180 20" 
          fill="none" 
          stroke="#007bff" 
          strokeWidth="3"
          className="function-curve"
        />
        
        {/* Tangent line */}
        <line 
          x1="60" y1="80" x2="140" y2="40" 
          stroke="#ff6b6b" 
          strokeWidth="2" 
          strokeDasharray="5,5"
          className="tangent-line"
        />
        
        {/* Moving point */}
        <circle 
          cx="100" cy="60" r="4" 
          fill="#ff6b6b" 
          className="moving-point"
        />
      </svg>
    </div>
  );

  const renderEquation = () => (
    <div className="calculus-equation">
      <div className="equation-container">
        <div className="equation-main">
          <span className="equation-text">{equation}</span>
        </div>
        {showDerivative && (
          <div className="derivative">
            <span className="derivative-label">d/dx</span>
            <span className="derivative-text">2x</span>
          </div>
        )}
        <div className="integral">
          <span className="integral-symbol">∫</span>
          <span className="integral-text">x³/3 + C</span>
        </div>
      </div>
    </div>
  );

  const renderParticles = () => (
    <div className="calculus-particles">
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
    </div>
  );

  return (
    <div className={`calculus-container ${size} ${type}`}>
      {type === 'graph' && renderGraph()}
      {type === 'equation' && renderEquation()}
      {type === 'particles' && renderParticles()}
      {type === 'combined' && (
        <>
          {renderGraph()}
          {renderEquation()}
          {renderParticles()}
        </>
      )}
    </div>
  );
};

export default CalculusAnimation;
