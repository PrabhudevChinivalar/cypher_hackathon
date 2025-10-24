import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Student.css";

export default function Student() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-courses');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [selectedEducator, setSelectedEducator] = useState(null);

  // Student info from authenticated user
  const student = {
    name: user?.name || "Student",
    email: user?.email || "student@engjobhub.com",
    role: user?.role || "student",
  };

  // Fetch all available courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses/student/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setEnrollmentStatus(prev => ({ ...prev, [courseId]: 'enrolled' }));
        // Refresh enrolled courses
        fetchEnrolledCourses();
        alert('Successfully enrolled in course!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  // Delete enrolled course (unenroll)
  const deleteEnrolledCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/unenroll`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Successfully unenrolled from course!');
        fetchEnrolledCourses(); // Refresh enrolled courses
        fetchCourses(); // Refresh all courses to update enrollment status
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to unenroll from course');
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      alert('Failed to unenroll from course');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchEnrolledCourses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Check if student is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  // Get unique educators from courses
  const getUniqueEducators = () => {
    const educators = courses.map(course => course.educator).filter(educator => educator);
    const uniqueEducators = educators.filter((educator, index, self) => 
      index === self.findIndex(e => e._id === educator._id)
    );
    return uniqueEducators;
  };

  // Filter courses by educator
  const getFilteredCourses = () => {
    if (activeTab === 'by-educator' && selectedEducator) {
      return courses.filter(course => course.educator?._id === selectedEducator);
    }
    return courses;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Left Sidebar - Student Info */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Student Dashboard</h2>
          <div className="user-avatar">
            <span>{student.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        
        <div className="student-profile">
          <h3>{student.name}</h3>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Role:</strong> {student.role}</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-number">{courses.length}</span>
            <span className="stat-label">Available Courses</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{enrolledCourses.length}</span>
            <span className="stat-label">Enrolled Courses</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'all-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-courses')}
          >
            📚 All Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrolled')}
          >
            ✅ My Courses
          </button>
          <button 
            className={`nav-btn ${activeTab === 'by-educator' ? 'active' : ''}`}
            onClick={() => setActiveTab('by-educator')}
          >
            👨‍🏫 By Educator
          </button>
        </nav>
      </aside>

      {/* Main Content - Courses Section */}
      <main className="main-content">
        <div className="content-header">
          <h2 className="section-title">
            {activeTab === 'all-courses' ? 'Available Courses' : 
             activeTab === 'enrolled' ? 'My Enrolled Courses' : 
             activeTab === 'by-educator' ? 'Courses by Educator' : 'Available Courses'}
          </h2>
          <div className="course-count">
            {activeTab === 'all-courses' ? courses.length : 
             activeTab === 'enrolled' ? enrolledCourses.length : 
             activeTab === 'by-educator' ? getFilteredCourses().length : courses.length} courses
          </div>
        </div>

        {/* Educator Filter Section */}
        {activeTab === 'by-educator' && (
          <div className="educator-filter">
            <h3>Select Educator:</h3>
            <select 
              value={selectedEducator || ''} 
              onChange={(e) => setSelectedEducator(e.target.value || null)}
              className="educator-select"
            >
              <option value="">All Educators</option>
              {getUniqueEducators().map(educator => (
                <option key={educator._id} value={educator._id}>
                  {educator.name} ({courses.filter(c => c.educator?._id === educator._id).length} courses)
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'all-courses' ? (
          <div className="course-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-header">
                    <h3 className="course-title">{course.courseName}</h3>
                    <span className={`difficulty-badge ${course.difficulty}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <p className="course-educator">
                    👨‍🏫 {course.educator?.name || 'Unknown Educator'}
                  </p>
                  
                  {course.category && (
                    <p className="course-category">📂 {course.category}</p>
                  )}

                  {/* Course Content Preview */}
                  {course.courseContents && course.courseContents.length > 0 && (
                    <div className="course-content-preview">
                      {course.courseContents[0].description && (
                        <p className="course-description">
                          {course.courseContents[0].description}
                        </p>
                      )}
                      
                      <div className="course-media">
                        {course.courseContents[0].image && (
                          <div className="course-image">
                            <img 
                              src={course.courseContents[0].image} 
                              alt="Course preview" 
                              className="preview-image"
                            />
                          </div>
                        )}
                        
                        {course.courseContents[0].video && (
                          <div className="course-video">
                            <video 
                              src={course.courseContents[0].video} 
                              controls 
                              className="preview-video"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="course-meta">
                    <span><strong>Duration:</strong> {course.duration} weeks</span>
                    <span><strong>Rating:</strong> ⭐ {course.rating || 'N/A'}</span>
                  </div>
                  
                  <div className="course-actions">
                    {isEnrolled(course._id) ? (
                      <button className="enrolled-btn" disabled>
                        ✅ Enrolled
                      </button>
                    ) : (
                      <button 
                        className="enroll-btn"
                        onClick={() => enrollInCourse(course._id)}
                      >
                        Enroll Now
                      </button>
                    )}
                    <button className="view-btn">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>No courses available at the moment.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="course-grid">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <div key={course._id} className="course-card enrolled">
                  <div className="course-header">
                    <h3 className="course-title">{course.courseName}</h3>
                    <span className="enrolled-badge">✅ Enrolled</span>
                  </div>
                  
                  <p className="course-educator">
                    👨‍🏫 {course.educator?.name || 'Unknown Educator'}
                  </p>
                  
                  {course.category && (
                    <p className="course-category">📂 {course.category}</p>
                  )}

                  {/* Video Content for Enrolled Courses */}
                  {course.courseContents && course.courseContents.length > 0 && course.courseContents[0].video && (
                    <div className="course-video-section">
                      <h4>Course Video:</h4>
                      <div className="enrolled-video-container">
                        <video 
                          src={course.courseContents[0].video} 
                          controls 
                          className="enrolled-video"
                          poster={course.courseContents[0].image}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      {course.courseContents[0].description && (
                        <p className="video-description">
                          {course.courseContents[0].description}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="course-meta">
                    <span><strong>Duration:</strong> {course.duration} weeks</span>
                    <span><strong>Progress:</strong> 0%</span>
                  </div>
                  
                  <div className="course-actions">
                    <button className="continue-btn">Continue Learning</button>
                    <button className="view-btn">View Details</button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteEnrolledCourse(course._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>You haven't enrolled in any courses yet.</p>
                <button 
                  className="browse-btn"
                  onClick={() => setActiveTab('all-courses')}
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        ) }: activeTab === 'by-educator' ? (
          <div className="course-grid">
            {getFilteredCourses().length > 0 ? (
              getFilteredCourses().map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-header">
                    <h3 className="course-title">{course.courseName}</h3>
                    <span className={`difficulty-badge ${course.difficulty}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <p className="course-educator">
                    👨‍🏫 {course.educator?.name || 'Unknown Educator'}
                  </p>
                  
                  {course.category && (
                    <p className="course-category">📂 {course.category}</p>
                  )}

                  {/* Course Content Preview */}
                  {course.courseContents && course.courseContents.length > 0 && (
                    <div className="course-content-preview">
                      {course.courseContents[0].description && (
                        <p className="course-description">
                          {course.courseContents[0].description}
                        </p>
                      )}
                      
                      <div className="course-media">
                        {course.courseContents[0].image && (
                          <div className="course-image">
                            <img 
                              src={course.courseContents[0].image} 
                              alt="Course preview" 
                              className="preview-image"
                            />
                          </div>
                        )}
                        
                        {course.courseContents[0].video && (
                          <div className="course-video">
                            <video 
                              src={course.courseContents[0].video} 
                              controls 
                              className="preview-video"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="course-meta">
                    <span><strong>Duration:</strong> {course.duration} weeks</span>
                    <span><strong>Rating:</strong> ⭐ {course.rating || 'N/A'}</span>
                  </div>
                  
                  <div className="course-actions">
                    {isEnrolled(course._id) ? (
                      <button className="enrolled-btn" disabled>
                        ✅ Enrolled
                      </button>
                    ) : (
                      <button 
                        className="enroll-btn"
                        onClick={() => enrollInCourse(course._id)}
                      >
                        Enroll Now
                      </button>
                    )}
                    <button className="view-btn">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>
                  {selectedEducator ? 
                    'No courses found for the selected educator.' : 
                    'No courses available at the moment.'}
                </p>
                {!selectedEducator && (
                  <button 
                    className="browse-btn"
                    onClick={() => setActiveTab('all-courses')}
                  >
                    Browse All Courses
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null
      </main>
    </div>
  );
}
