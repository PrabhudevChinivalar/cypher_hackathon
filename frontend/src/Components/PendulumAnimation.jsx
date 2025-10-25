import React from 'react';
import './PendulumAnimation.css';

const PendulumAnimation = ({ size = 'medium', color = '#007bff' }) => {
  return (
    <div className={`pendulum-container ${size}`}>
      <div className="pendulum-setup">
        <div className="pendulum-stand"></div>
        <div className="pendulum-string" style={{ '--pendulum-color': color }}>
          <div className="pendulum-bob"></div>
        </div>
      </div>
    </div>
  );
};

export default PendulumAnimation;
