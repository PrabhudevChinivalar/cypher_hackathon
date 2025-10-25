import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AIChat from "../Components/AIChat";
import QuizComponent from "../Components/QuizComponent";
import PendulumAnimation from "../Components/PendulumAnimation";
import BeakerAnimation from "../Components/BeakerAnimation";
import CalculusAnimation from "../Components/CalculusAnimation";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState('checking');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Fetch course details with progress data
  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        
        // Fetch progress data for this course
        await fetchCourseProgress(data);
      } else {
        console.error('Failed to fetch course details');
        navigate('/student');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      navigate('/student');
    }
  };

  // Fetch progress data for the course
  const fetchCourseProgress = async (courseData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/progress/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const progressData = result.progress;
          setCourse(prev => ({
            ...prev,
            progress: progressData.progress,
            quiz: progressData.quizResults.length > 0 
              ? progressData.quizResults[progressData.quizResults.length - 1]
              : null
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  // Check enrollment status
  const checkEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses/student/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const enrolledCourses = await response.json();
        const enrolled = enrolledCourses.some(course => course._id === courseId);
        setIsEnrolled(enrolled);
        setEnrollmentStatus(enrolled ? 'enrolled' : 'not-enrolled');
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setEnrollmentStatus('error');
    }
  };

  // Enroll in course
  const enrollInCourse = async () => {
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
        setIsEnrolled(true);
        setEnrollmentStatus('enrolled');
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

  // Unenroll from course
  const unenrollFromCourse = async () => {
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
        setIsEnrolled(false);
        setEnrollmentStatus('not-enrolled');
        alert('Successfully unenrolled from course!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to unenroll from course');
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      alert('Failed to unenroll from course');
    }
  };

  // Generate quiz for a course
  const generateQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);
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
          setQuizData(result.quiz);
          setShowQuiz(true);
          console.log('Quiz data set:', result.quiz);
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
      setIsGeneratingQuiz(false);
    }
  };

  // Submit quiz answers
  const submitQuiz = async (answers) => {
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
          quizData: quizData // Pass the quiz data for proper scoring
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
                quizId: quizData?.id || Date.now().toString(),
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
        
        // Update course progress
        setCourse(prev => ({ 
          ...prev, 
          progress: result.progress,
          quiz: { score: result.score, feedback: result.feedback }
        }));
        setShowQuiz(false);
        alert(`Quiz completed! Score: ${result.score}%`);
      } else {
        alert('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourseDetails(), checkEnrollmentStatus()]);
      setLoading(false);
    };
    loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <h2>Course not found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/student')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      {/* Scientific Background */}
      <div className="scientific-background">
        <div className="floating-animations">
          <PendulumAnimation size="medium" color="#007bff" />
          <BeakerAnimation size="medium" liquidColor="#4CAF50" bubbles={true} />
          <CalculusAnimation type="equation" size="medium" equation="f(x) = x²" />
        </div>
      </div>

      {/* Header with back button */}
      <div className="course-detail-header">
        <button onClick={() => navigate('/student')} className="back-btn">
          ← Back to Dashboard
        </button>
        <div className="course-breadcrumb">
          <span>Courses</span> / <span>{course.courseName}</span>
        </div>
      </div>

      {/* Main course content */}
      <div className="course-detail-content">
        {/* Course header section */}
        <div className="course-header-section">
          <div className="course-title-section">
            <h1 className="course-title">{course.courseName}</h1>
            <div className="course-badges">
              <span className={`difficulty-badge ${course.difficulty}`}>
                {course.difficulty}
              </span>
              {course.category && (
                <span className="category-badge">{course.category}</span>
              )}
              {isEnrolled && (
                <span className="enrolled-badge">✅ Enrolled</span>
              )}
            </div>
          </div>
          
          <div className="course-educator-info">
            <div className="educator-avatar">
              <span>{course.educator?.name?.charAt(0)?.toUpperCase() || 'E'}</span>
            </div>
            <div className="educator-details">
              <h3>Instructor</h3>
              <p>{course.educator?.name || 'Unknown Educator'}</p>
              <p className="educator-email">{course.educator?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Course video section */}
        {course.courseContents && course.courseContents.length > 0 && (
          <div className="course-video-section">
            <h2>Course Content</h2>
            
            {/* Progress Bar for Enrolled Students */}
            {isEnrolled && (
              <div className="course-progress-section">
                <h3>Your Progress</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">{course.progress || 0}% Complete</span>
              </div>
            )}
            
            {course.courseContents.map((content, index) => (
              <div key={index} className="content-item">
                <div className="content-header">
                  <h3>Lesson {index + 1}</h3>
                  {content.title && <h4>{content.title}</h4>}
                </div>
                
                {content.description && (
                  <p className="content-description">{content.description}</p>
                )}

                {/* Show video only for enrolled students */}
                {content.video && isEnrolled ? (
                  <div className="video-container">
                    <video 
                      src={content.video} 
                      controls 
                      className="course-video"
                      poster={content.image}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : content.image ? (
                  <div className="image-container">
                    <img 
                      src={content.image} 
                      alt={`Lesson ${index + 1}`}
                      className="course-image"
                    />
                    {content.video && !isEnrolled && (
                      <div className="video-locked-overlay">
                        <div className="lock-icon">🔒</div>
                        <p>Enroll to access video content</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Course information section */}
        <div className="course-info-section">
          <div className="course-meta-grid">
            <div className="meta-item">
              <h4>Duration</h4>
              <p>{course.duration} weeks</p>
            </div>
            <div className="meta-item">
              <h4>Rating</h4>
              <p>⭐ {course.rating || 'N/A'}</p>
            </div>
            <div className="meta-item">
              <h4>Difficulty</h4>
              <p className={`difficulty-text ${course.difficulty}`}>
                {course.difficulty}
              </p>
            </div>
            <div className="meta-item">
              <h4>Category</h4>
              <p>{course.category || 'General'}</p>
            </div>
          </div>

          {/* Course description */}
          {course.description && (
            <div className="course-description-section">
              <h3>About This Course</h3>
              <p>{course.description}</p>
            </div>
          )}

          {/* Learning objectives */}
          {course.learningObjectives && course.learningObjectives.length > 0 && (
            <div className="learning-objectives">
              <h3>What You'll Learn</h3>
              <ul>
                {course.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="prerequisites">
              <h3>Prerequisites</h3>
              <ul>
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quiz Section for Enrolled Students */}
        {isEnrolled && (
          <div className="quiz-section">
            <h3>📝 Course Quiz</h3>
            <p>Test your knowledge and track your progress with AI-generated quizzes.</p>
            {!showQuiz ? (
              <>
                <button 
                  className="quiz-btn"
                  onClick={generateQuiz}
                  disabled={isGeneratingQuiz}
                >
                  {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
                {course.quiz && (
                  <div className="quiz-results">
                    <p><strong>Last Quiz Score:</strong> {course.quiz.score || 0}%</p>
                    <p><strong>Feedback:</strong> {course.quiz.feedback || 'Complete a quiz to get feedback'}</p>
                  </div>
                )}
              </>
            ) : (
              <QuizComponent 
                quiz={quizData} 
                onSubmit={submitQuiz}
                onCancel={() => setShowQuiz(false)}
              />
            )}
          </div>
        )}

        {/* AI Assistant Section */}
        <div className="ai-assistant-section">
          <h3>🤖 AI Course Assistant</h3>
          <p>Get instant answers to your questions about this course content, videos, and concepts.</p>
          <button 
            className="ai-chat-btn"
            onClick={() => setIsAIChatOpen(true)}
          >
            💬 Ask AI Assistant
          </button>
        </div>

        {/* Action buttons */}
        <div className="course-actions-section">
          {enrollmentStatus === 'enrolled' ? (
            <div className="enrolled-actions">
              <button className="continue-learning-btn">
                Continue Learning
              </button>
              <button 
                className="unenroll-btn"
                onClick={unenrollFromCourse}
              >
                Unenroll
              </button>
            </div>
          ) : enrollmentStatus === 'not-enrolled' ? (
            <button 
              className="enroll-btn"
              onClick={enrollInCourse}
            >
              Enroll Now
            </button>
          ) : (
            <div className="loading-enrollment">
              <p>Checking enrollment status...</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Component */}
      <AIChat 
        courseData={course}
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
