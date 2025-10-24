import React, { useState } from "react";
import "./Educator.css"; 

import Navbar from "../Components/Navbar";

function Educator() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login as an educator to submit a course.");
        return;
      }

      const imageBase64 = formData.image ? await fileToBase64(formData.image) : null;

      const payload = {
        courseId: `C${Date.now()}`,
        courseName: formData.name,
        courseContents: [
          {
            name: formData.name,
            description: formData.description,
            image: imageBase64,
          },
        ],
        category: "general",
        difficulty: "beginner",
        duration: 0,
      };

      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create course");
        return;
      }

      alert("Course created successfully!");
      setShowForm(false);
      setFormData({ name: "", description: "", image: null });
    } catch (error) {
      console.error("Create course failed:", error);
      alert("Something went wrong while creating the course.");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="educator-container">
      {!showForm ? (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          Course Details
        </button>
      ) : (
        <form className="educator-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Enter Description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      )}
    </div>
    </>
  );
}

export default Educator;
