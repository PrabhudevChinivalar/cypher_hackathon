import React from "react";
import Navbar from "../Components/Navbar";
import Cards from "../Components/Cards";
import Slider from "../Components/Slider";
import Footer from "../Components/Footer";
import ScientificShowcase from "../Components/ScientificShowcase";
import PendulumAnimation from "../Components/PendulumAnimation";
import BeakerAnimation from "../Components/BeakerAnimation";
import CalculusAnimation from "../Components/CalculusAnimation";
import "./HomePage.css";

export default function HomePage() {
  const slides = [
    {
      name: "Advanced Physics Laboratory",
      description: "Interactive simulations of quantum mechanics, thermodynamics, and wave phenomena",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Physics",
      color: "#007bff"
    },
    {
      name: "Molecular Chemistry Lab",
      description: "Real-time chemical reactions, molecular modeling, and advanced analytical techniques",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Chemistry",
      color: "#4CAF50"
    },
    {
      name: "Mathematical Analysis Center",
      description: "Advanced calculus, differential equations, and statistical modeling with interactive graphs",
      image: "https://images.unsplash.com/photo-1509228468518-180f486eb53b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Mathematics",
      color: "#ff6b6b"
    },
    {
      name: "Biotechnology Research",
      description: "Cutting-edge molecular biology, genetics, and bioinformatics research tools",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Biology",
      color: "#9c27b0"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Aarav Patel",
      feedback:
        "SciLearnHub's interactive physics simulations helped me understand complex concepts like never before!",
      role: "Physics Professor, MIT",
    },
    {
      name: "Dr. Priya Sharma",
      feedback:
        "The calculus animations made differential equations so much clearer for my students!",
      role: "Mathematics Professor, Stanford",
    },
  ];

  return (
    <>
      <Navbar />

      {/* Slider Section */}
      <div style={{ marginBottom: "40px" }}>
        <Slider slides={slides} />
      </div>

      {/* Scientific Showcase */}
      <ScientificShowcase />

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-animations">
            <PendulumAnimation size="medium" color="#007bff" />
            <BeakerAnimation size="medium" liquidColor="#4CAF50" bubbles={true} />
            <CalculusAnimation type="combined" size="medium" />
          </div>
          <h2 className="about-title">About SciLearnHub</h2>
          <p className="about-description">
            SciLearnHub is your ultimate platform for scientific learning, discovery, and innovation.
            Explore interactive physics simulations, chemistry experiments, and calculus visualizations
            that make complex scientific concepts come alive through engaging animations and hands-on learning.
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="cards-section">
        <h2 className="section-title">Explore Scientific Categories</h2>
        <div className="cards-container">
          <Cards />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Scientists Say</h2>
        <div className="testimonials-container">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-animation">
                {index === 0 ? (
                  <PendulumAnimation size="small" color="#007bff" />
                ) : (
                  <CalculusAnimation type="equation" size="small" />
                )}
              </div>
              <p className="testimonial-feedback">"{item.feedback}"</p>
              <h3 className="testimonial-name">{item.name}</h3>
              <p className="testimonial-role">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
