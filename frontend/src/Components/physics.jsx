import React from "react";
import "./Physics.css";

export default function Physics() {
  const topics = [
    {
      title: "Newton's Laws",
      desc: "Understand motion, inertia, and force relationships.",
    },
    {
      title: "Electromagnetism",
      desc: "Explore electric and magnetic field interactions.",
    },
    {
      title: "Waves & Optics",
      desc: "Learn how light and sound propagate and interfere.",
    },
    {
      title: "Thermodynamics",
      desc: "Discover energy, heat, and work in physical systems.",
    },
    {
      title: "Quantum Mechanics",
      desc: "Dive into the world of probabilities and particles.",
    },
  ];

  return (
    <div className="physics-page">
      <header className="physics-header">
        <h1>⚛️ Physics Fundamentals</h1>
        <p>Learn the core concepts of physics with interactive visuals and animations.</p>
      </header>

      <section className="hero">
        <div className="atom">
          <div className="electron"></div>
        </div>
        <h2>Explore the Universe of Motion & Energy</h2>
        <p>
          From Newton’s laws to Quantum phenomena, dive into the principles
          that govern the physical world.
        </p>
      </section>

      <section className="topics">
        {topics.map((topic, index) => (
          <div key={index} className="card">
            <h3>{topic.title}</h3>
            <p>{topic.desc}</p>
          </div>
        ))}
      </section>

      <footer className="physics-footer">
        <p>© {new Date().getFullYear()} SciLearnHub — Learn, Explore, Discover ⚡</p>
      </footer>
    </div>
  );
}
