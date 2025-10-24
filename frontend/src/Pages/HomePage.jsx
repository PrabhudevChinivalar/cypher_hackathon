import React from "react";
import Navbar from "../Components/Navbar";
import Cards from "../Components/Cards";
import Slider from "../Components/Slider";
import Footer from "../Components/Footer";

export default function HomePage() {
  const slides = [
    {
      name: "Welcome to EngJobHub",
      image:
        "https://img.freepik.com/free-photo/hands-typing-keyboard-top-view_23-2149762478.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      name: "Upload Your Courses",
      image:
        "https://media.istockphoto.com/id/1325786046/vector/tiny-characters-creating-content-copywriting-marketing-concept-home-based-copywriter-writer.jpg?s=612x612&w=0&k=20&c=mBwFjw011d94o1Y57aajyrQP0E6j0FlYdKPZHqE8Lp0=",
    },
    {
      name: "Boost Your Skills",
      image:
        "https://blog.iilm.edu/wp-content/uploads/2020/05/Guide-to-Professional-Networking-and-Job-Search.jpg",
    },
  ];

  const testimonials = [
    {
      name: "Aarav Patel",
      feedback:
        "EngJobHub helped me find the right engineering job faster than any other platform!",
      role: "Software Engineer, Infosys",
    },
    {
      name: "Priya Sharma",
      feedback:
        "I loved uploading my mini-courses — the community here is so supportive!",
      role: "Mechanical Engineer, Siemens",
    },
  ];

  return (
    <>
      <Navbar />

      {/* Slider Section */}
      <div style={{ marginBottom: "40px" }}>
        <Slider slides={slides} />
      </div>

      {/* About Section */}
      <section style={{ padding: "60px 20px", backgroundColor: "#f8f8f8", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", color: "#0a66c2" }}>About EngJobHub</h2>
        <p style={{ maxWidth: "800px", margin: "20px auto", fontSize: "1.1rem", color: "#333" }}>
          EngJobHub is your go-to platform for engineering learning, growth, and career
          development. Discover free courses, connect with experts, and showcase your skills
          to potential employers — all in one place.
        </p>
      </section>

      {/* Cards Section */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", color: "#0a66c2", marginBottom: "20px" }}>
          Explore Categories
        </h2>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px" }}>
          <Cards />
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: "60px 20px", backgroundColor: "#f0f0f0" }}>
        <h2 style={{ fontSize: "2rem", color: "#0a66c2", textAlign: "center" }}>Testimonials</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "30px",
            marginTop: "30px",
          }}
        >
          {testimonials.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "300px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontStyle: "italic", color: "#555" }}>"{item.feedback}"</p>
              <h3 style={{ marginTop: "15px", color: "#0a66c2" }}>{item.name}</h3>
              <p style={{ color: "#777", fontSize: "0.9rem" }}>{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
