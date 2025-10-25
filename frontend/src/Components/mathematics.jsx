import React from "react";
import "./mathematics.css";

export default function mathematics() {
  const topics = [
    { title: "Algebra", desc: "Understand equations, expressions, and polynomial relationships." },
    { title: "Geometry", desc: "Explore the world of shapes, angles, and measurements." },
    { title: "Trigonometry", desc: "Discover the relationships between sides and angles of triangles." },
    { title: "Calculus", desc: "Learn about change, motion, and the concept of derivatives and integrals." },
    { title: "Statistics", desc: "Analyze data, probability, and real-world patterns." },
  ];

  return (
    <div className="math-page">
      <section className="math-hero">
        <h1 className="math-glow">Mathematics Fundamentals</h1>
        <p className="math-desc">
          Explore the language of logic and patterns that shape our universe.
        </p>
      </section>

      <section className="math-topics">
        {topics.map((t, i) => (
          <div key={i} className="math-card">
            <div className="math-symbol">{["∑", "π", "√", "∞", "∆"][i]}</div>
            <h2>{t.title}</h2>
            <p>{t.desc}</p>
          </div>
        ))}
      </section>

      <div className="floating-shapes">
        <div className="shape square"></div>
        <div className="shape circle"></div>
        <div className="shape triangle"></div>
      </div>

      <footer className="math-footer">
        <p>Think • Solve • Visualize • Understand</p>
      </footer>
    </div>
  );
}
