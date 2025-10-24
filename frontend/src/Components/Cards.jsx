import React, { useState } from "react";
import "./Cards.css";

function Card({ name, description, image }) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="card" onClick={() => setShowDescription(!showDescription)}>
      {image && <img src={image} alt={name} className="card-image" />}
      <h3 className="card-title">{name}</h3>
      {showDescription && <p className="card-description">{description}</p>}
    </div>
  );
}

export default Card;
