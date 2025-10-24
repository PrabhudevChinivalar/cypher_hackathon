import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import QuizComponent from "../Components/QuizComponent";
import "./Student.css";

export default function Student() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-courses');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [quizData, setQuizData] = useState({});
  const [showQuiz, setShowQuiz] = useState({});
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState({});

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

  // Fetch enrolled courses with progress data
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
        
        // Fetch progress data for each enrolled course
        await fetchProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  // Fetch progress data for enrolled courses
  const fetchProgressData = async (courses) => {
    try {
      const token = localStorage.getItem('token');
      const progressPromises = courses.map(course => 
        fetch(`http://localhost:5000/api/progress/course/${course._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      );
      
      const progressResults = await Promise.all(progressPromises);
      
      // Update courses with progress data
      const coursesWithProgress = courses.map((course, index) => ({
        ...course,
        progress: progressResults[index].success ? progressResults[index].progress.progress : 0,
        quiz: progressResults[index].success && progressResults[index].progress.quizResults.length > 0 
          ? progressResults[index].progress.quizResults[progressResults[index].progress.quizResults.length - 1]
          : null
      }));
      
      setEnrolledCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching progress data:', error);
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

  // Navigate to course details
  const viewCourseDetails = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Generate quiz for a course
  const generateQuiz = async (courseId) => {
    try {
      setIsGeneratingQuiz(prev => ({ ...prev, [courseId]: true }));
      console.log('Generating quiz for course:', courseId);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Quiz generation response:', result);
        
        if (result.success && result.quiz) {
          setQuizData(prev => ({ ...prev, [courseId]: result.quiz }));
          setShowQuiz(prev => ({ ...prev, [courseId]: true }));
          console.log('Quiz data set for course:', courseId, result.quiz);
        } else {
          console.error('Invalid quiz response:', result);
          alert('Failed to generate quiz - invalid response');
        }
      } else {
        const errorData = await response.json();
        console.error('Quiz generation failed:', errorData);
        alert(`Failed to generate quiz: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Submit quiz answers
  const submitQuiz = async (courseId, answers) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ai/submit-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          courseId, 
          answers,
          quizData: quizData[courseId] // Pass the quiz data for proper scoring
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Save quiz result to progress database
        try {
          const progressResponse = await fetch('http://localhost:5000/api/progress/quiz-result', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              courseId,
              quizData: {
                quizId: quizData[courseId]?.id || Date.now().toString(),
                score: result.score,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                feedback: result.feedback
              }
            })
          });
          
          if (progressResponse.ok) {
            console.log('Quiz result saved to progress database');
          }
        } catch (progressError) {
          console.error('Error saving quiz progress:', progressError);
        }
        
        // Update course progress and quiz results
        setEnrolledCourses(prev => 
          prev.map(course => 
            course._id === courseId 
              ? { 
                  ...course, 
                  progress: result.progress,
                  quiz: { score: result.score, feedback: result.feedback }
                }
              : course
          )
        );
        setShowQuiz(prev => ({ ...prev, [courseId]: false }));
        alert(`Quiz completed! Score: ${result.score}%`);
      } else {
        alert('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
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

        {activeTab === 'all-courses' && (
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

                  {/* Course Content Preview - Only show images for non-enrolled courses */}
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
                            {!isEnrolled(course._id) && course.courseContents[0].video && (
                              <div className="video-locked-overlay">
                                <div className="lock-icon">🔒</div>
                                <p>Enroll to access video content</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Only show video for enrolled students */}
                        {course.courseContents[0].video && isEnrolled(course._id) && (
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
                    <button 
                      className="view-btn"
                      onClick={() => viewCourseDetails(course._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>No courses available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrolled' && (
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
                    <span><strong>Progress:</strong> {course.progress || 0}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress || 0}% Complete</span>
                  </div>
                  
                  {/* Quiz Section */}
                  <div className="quiz-section">
                    <h4>📝 Course Quiz</h4>
                    {!showQuiz[course._id] ? (
                      <>
                        <button 
                          className="quiz-btn"
                          onClick={() => generateQuiz(course._id)}
                          disabled={isGeneratingQuiz[course._id]}
                        >
                          {isGeneratingQuiz[course._id] ? 'Generating Quiz...' : 'Generate Quiz'}
                        </button>
                        {course.quiz && (
                          <div className="quiz-results">
                            <p>Last Quiz Score: {course.quiz.score || 0}%</p>
                            <p>Feedback: {course.quiz.feedback || 'Complete a quiz to get feedback'}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <QuizComponent 
                        quiz={quizData[course._id]} 
                        onSubmit={(answers) => submitQuiz(course._id, answers)}
                        onCancel={() => setShowQuiz(prev => ({ ...prev, [course._id]: false }))}
                      />
                    )}
                  </div>
                  
                  <div className="course-actions">
                    <button className="continue-btn">Continue Learning</button>
                    <button 
                      className="view-btn"
                      onClick={() => viewCourseDetails(course._id)}
                    >
                      View Details
                    </button>
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
        )}

        {activeTab === 'by-educator' && (
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
                    <button 
                      className="view-btn"
                      onClick={() => viewCourseDetails(course._id)}
                    >
                      View Details
                    </button>
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
        )}
      </main>
    </div>
  );
}
