import React, { useState, useEffect } from "react";
import "./Educator.css"; 
import Navbar from "../Components/Navbar";

function Educator() {
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-courses');
  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    category: "general",
    difficulty: "beginner",
    duration: 0,
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

  // Fetch courses created by this educator
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/courses/educator/my-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Course deleted successfully!");
        fetchMyCourses(); // Refresh the courses list
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login as an educator to submit a course.");
        return;
      }

      const data = new FormData();
      data.append("courseName", formData.courseName);
      data.append("category", formData.category);
      data.append("difficulty", formData.difficulty);
      data.append("duration", formData.duration);
      data.append("description", formData.description);

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
      setFormData({ 
        courseName: "", 
        description: "", 
        category: "general",
        difficulty: "beginner",
        duration: 0,
        image: null, 
        video: null 
      });
      fetchMyCourses(); // Refresh the courses list
    } catch (error) {
      console.error("Create course failed:", error);
      alert("Something went wrong while creating the course.");
    }
  };

  return (
    <>
      <Navbar/>
      <div className="educator-container">
        {/* Navigation Tabs */}
        <div className="educator-nav">
          <button 
            className={`nav-btn ${activeTab === 'my-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-courses')}
          >
            📚 My Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'create-course' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-course')}
          >
            ➕ Create Course
          </button>
        </div>

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="courses-section">
            <div className="section-header">
              <h2>My Courses ({courses.length})</h2>
              <button className="add-btn" onClick={() => setActiveTab('create-course')}>
                Create New Course
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading courses...</div>
            ) : (
              <div className="courses-grid">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course._id} className="course-card">
                      <div className="course-header">
                        <h3>{course.courseName}</h3>
                        <span className={`difficulty-badge ${course.difficulty}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      
                      <div className="course-content">
                        {course.courseContents && course.courseContents.length > 0 && (
                          <>
                            <p className="course-description">
                              {course.courseContents[0].description}
                            </p>
                            
                            <div className="course-media">
                              {course.courseContents[0].image && (
                                <img 
                                  src={course.courseContents[0].image} 
                                  alt="Course preview" 
                                  className="course-image"
                                />
                              )}
                              {course.courseContents[0].video && (
                                <video 
                                  src={course.courseContents[0].video} 
                                  controls 
                                  className="course-video"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="course-meta">
                        <span><strong>Category:</strong> {course.category}</span>
                        <span><strong>Duration:</strong> {course.duration} weeks</span>
                        <span><strong>Students:</strong> {course.enrolledStudents?.length || 0}</span>
                      </div>
                      
                      <div className="course-actions">
                        <button 
                          className="delete-btn"
                          onClick={() => deleteCourse(course._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-courses">
                    <p>No courses created yet.</p>
                    <button 
                      className="add-btn"
                      onClick={() => setActiveTab('create-course')}
                    >
                      Create Your First Course
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Course Tab */}
        {activeTab === 'create-course' && (
          <div className="create-course-section">
            <div className="section-header">
              <h2>Create New Course</h2>
              <button className="back-btn" onClick={() => setActiveTab('my-courses')}>
                ← Back to Courses
              </button>
            </div>

            <form className="educator-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="courseName"
                  placeholder="Enter Course Name"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Enter Course Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <input
                    type="number"
                    name="duration"
                    placeholder="0"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Video</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="submit-btn">
                Create Course
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default Educator;
