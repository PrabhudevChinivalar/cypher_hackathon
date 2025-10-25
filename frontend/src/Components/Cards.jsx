import React, { useState } from "react";
import PendulumAnimation from "./PendulumAnimation";
import BeakerAnimation from "./BeakerAnimation";
import CalculusAnimation from "./CalculusAnimation";
import "./Cards.css";

function Card({ name, description, image, animationType = "pendulum", color = "#007bff" }) {
  const [showDescription, setShowDescription] = useState(false);

  const renderAnimation = () => {
    switch (animationType) {
      case "pendulum":
        return <PendulumAnimation size="small" color={color} />;
      case "beaker":
        return <BeakerAnimation size="small" liquidColor={color} bubbles={true} />;
      case "calculus":
        return <CalculusAnimation type="equation" size="small" equation="f(x) = x²" />;
      case "graph":
        return <CalculusAnimation type="graph" size="small" />;
      default:
        return <PendulumAnimation size="small" color={color} />;
    }
  };

  return (
    <div className="card scientific-card" onClick={() => setShowDescription(!showDescription)}>
      <div className="card-animation">
        {renderAnimation()}
      </div>
      {image && <img src={image} alt={name} className="card-image" />}
      <h3 className="card-title">{name}</h3>
      {showDescription && <p className="card-description">{description}</p>}
      <div className="card-glow"></div>
    </div>
  );
}

export default Card;
