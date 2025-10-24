import React, { useState } from "react";
import "./Educator.css"; 
import Navbar from "../Components/Navbar";

function Educator() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
    video: null,
  });

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else if (name === "video") {
      setFormData({ ...formData, video: files[0] });
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

      const data = new FormData();
      data.append("courseName", formData.name);
      data.append("category", "general");
      data.append("difficulty", "beginner");
      data.append("duration", 0);
      data.append("courseContents", JSON.stringify([
        {
          name: formData.name,
          description: formData.description,
        },
      ]));

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (formData.video) {
        data.append("video", formData.video);
      }

      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create course");
        return;
      }

      alert("Course created successfully!");
      setShowForm(false);
      setFormData({ name: "", description: "", image: null, video: null });
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

            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleChange}
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
