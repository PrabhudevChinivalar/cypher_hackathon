import React, { useState } from 'react';
import './QuizComponent.css';

export default function QuizComponent({ quiz, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  if (!quiz || !quiz.questions) {
    return (
      <div className="quiz-error">
        <p>No quiz data available</p>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>Course Quiz</h3>
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>

      <div className="quiz-question">
        <h4>{currentQ.question}</h4>
        <div className="quiz-options">
          {currentQ.options.map((option, index) => (
            <label key={index} className="quiz-option">
              <input
                type="radio"
                name={`question-${currentQ.id}`}
                value={option}
                checked={answers[currentQ.id] === option}
                onChange={() => handleAnswerChange(currentQ.id, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          Previous
        </button>
        
        <div className="quiz-actions">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="submit-btn"
              disabled={Object.keys(answers).length !== quiz.questions.length}
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="nav-btn next-btn"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="quiz-footer">
        <button onClick={onCancel} className="cancel-btn">
          Cancel Quiz
        </button>
        <div className="quiz-stats">
          Answered: {Object.keys(answers).length} / {quiz.questions.length}
        </div>
      </div>
    </div>
  );
}
