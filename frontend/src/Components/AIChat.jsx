import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

export default function AIChat({ courseData, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your AI assistant for "${courseData?.courseName || 'this course'}". I can help you understand the course content, answer questions about the videos, explain concepts, and provide additional resources. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Determine if this is a course-related question or general question
      const isCourseRelated = isCourseQuestion(inputMessage);
      const endpoint = isCourseRelated ? '/api/ai/chat' : '/api/ai/general-chat';
      
      const requestBody = isCourseRelated ? {
        message: inputMessage,
        courseData: courseData,
        conversationHistory: messages.slice(-5)
      } : {
        message: inputMessage
      };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine if a question is course-related
  const isCourseQuestion = (message) => {
    const courseKeywords = [
      'course', 'lesson', 'video', 'instructor', 'educator', 'learn', 'study',
      'assignment', 'homework', 'quiz', 'exam', 'test', 'grade', 'score',
      'curriculum', 'syllabus', 'prerequisite', 'objective', 'goal'
    ];
    
    const lowerMessage = message.toLowerCase();
    return courseKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleVideoAnalysis = async () => {
    if (!courseData?.courseContents || courseData.courseContents.length === 0) {
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: "No video content available for analysis in this course.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const videoContent = courseData.courseContents.find(content => content.video);
    if (!videoContent) {
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: "No video content found in this course.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          videoUrl: videoContent.video,
          courseData: courseData
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: `🎥 **Video Analysis:**\n\n${data.analysis}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to analyze video');
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: "I'm sorry, I couldn't analyze the video content right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseData: courseData
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: `📚 **Study Questions for ${courseData.courseName}:**\n\n${data.questions}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: "I'm sorry, I couldn't generate study questions right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>AI Course Assistant</h3>
              <p>Ask questions about the course content</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ai-chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the course..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
          <div className="suggestions">
            <span>Try asking:</span>
            <button 
              onClick={() => setInputMessage("What are the main topics covered in this course?")}
              className="suggestion-btn"
            >
              Main topics
            </button>
            <button 
              onClick={() => setInputMessage("Can you explain the key concepts from the video?")}
              className="suggestion-btn"
            >
              Key concepts
            </button>
            <button 
              onClick={() => setInputMessage("What should I focus on for this lesson?")}
              className="suggestion-btn"
            >
              Study focus
            </button>
            <button 
              onClick={() => setInputMessage("What is machine learning?")}
              className="suggestion-btn general"
            >
              General knowledge
            </button>
            <button 
              onClick={() => setInputMessage("How do I improve my coding skills?")}
              className="suggestion-btn general"
            >
              Learning tips
            </button>
          </div>
          
          <div className="ai-features">
            <span>AI Features:</span>
            <button 
              onClick={handleVideoAnalysis}
              className="feature-btn video-analysis"
              disabled={isLoading}
            >
              🎥 Analyze Video
            </button>
            <button 
              onClick={handleGenerateQuestions}
              className="feature-btn study-questions"
              disabled={isLoading}
            >
              📚 Study Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
