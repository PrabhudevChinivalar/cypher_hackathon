import Course from '../model/Courses.js';
import StudentProgress from '../model/StudentProgress.js';
import { generateAIResponse, analyzeVideoContent, generateStudyQuestions } from '../services/openaiService.js';
import { generateOllamaResponse, analyzeVideoContentOllama, generateStudyQuestionsOllama, generalKnowledgeAssistant } from '../services/ollamaService.js';
import { generateGroqResponse, analyzeVideoContentGroq, generateStudyQuestionsGroq, generalKnowledgeAssistantGroq, generateQuizQuestionsGroq } from '../services/groqService.js';

// AI Chat endpoint
const chatWithAI = async (req, res) => {
  try {
    const { message, courseData, conversationHistory } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let aiResponse;

    // Try Groq first (fast and free)
    try {
      if (courseData) {
        aiResponse = await generateGroqResponse(message, courseData, conversationHistory);
      } else {
        // If no course data, use general knowledge assistant
        aiResponse = await generalKnowledgeAssistantGroq(message);
      }
    } catch (groqError) {
      console.log('Groq not available, trying Ollama...', groqError.message);
      
      // Fallback to Ollama
      try {
        if (courseData) {
          aiResponse = await generateOllamaResponse(message, courseData, conversationHistory);
        } else {
          aiResponse = await generalKnowledgeAssistant(message);
        }
      } catch (ollamaError) {
        console.log('Ollama not available, trying OpenAI...', ollamaError.message);
        
        // Fallback to OpenAI
        try {
          if (courseData) {
            aiResponse = await generateAIResponse(message, courseData, conversationHistory);
          } else {
            // Basic fallback response
            aiResponse = `I understand you're asking about "${message}". I'm here to help with any questions you might have. Could you provide more context about what you'd like to know?`;
          }
        } catch (openaiError) {
          console.log('OpenAI also failed, using basic fallback');
          aiResponse = `I understand you're asking about "${message}". I'm here to help with any questions you might have. Could you provide more context about what you'd like to know?`;
        }
      }
    }

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI request',
      error: error.message
    });
  }
};

// Video analysis endpoint
const analyzeVideo = async (req, res) => {
  try {
    const { videoUrl, courseData } = req.body;
    const userId = req.user.id;

    if (!videoUrl || !courseData) {
      return res.status(400).json({
        success: false,
        message: 'Video URL and course data are required'
      });
    }

    let analysis;

    // Try Groq first
    try {
      analysis = await analyzeVideoContentGroq(videoUrl, courseData);
    } catch (groqError) {
      console.log('Groq video analysis failed, trying Ollama...');
      
      // Fallback to Ollama
      try {
        analysis = await analyzeVideoContentOllama(videoUrl, courseData);
      } catch (ollamaError) {
        console.log('Ollama video analysis failed, trying OpenAI...');
        
        // Fallback to OpenAI
        try {
          analysis = await analyzeVideoContent(videoUrl, courseData);
        } catch (openaiError) {
          console.log('OpenAI video analysis also failed');
          analysis = "I can help you understand the video content. What specific aspects would you like to know more about?";
        }
      }
    }

    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze video content',
      error: error.message
    });
  }
};

// Generate study questions endpoint
const generateQuestions = async (req, res) => {
  try {
    const { courseData } = req.body;
    const userId = req.user.id;

    if (!courseData) {
      return res.status(400).json({
        success: false,
        message: 'Course data is required'
      });
    }

    let questions;

    // Try Groq first
    try {
      questions = await generateStudyQuestionsGroq(courseData);
    } catch (groqError) {
      console.log('Groq study questions failed, trying Ollama...');
      
      // Fallback to Ollama
      try {
        questions = await generateStudyQuestionsOllama(courseData);
      } catch (ollamaError) {
        console.log('Ollama study questions failed, trying OpenAI...');
        
        // Fallback to OpenAI
        try {
          questions = await generateStudyQuestions(courseData);
        } catch (openaiError) {
          console.log('OpenAI study questions also failed');
          questions = "I can help you create study questions for this course. What specific topics would you like to focus on?";
        }
      }
    }

    res.json({
      success: true,
      questions: questions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Study Questions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate study questions',
      error: error.message
    });
  }
};

// General knowledge endpoint (for any question)
const generalChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    let aiResponse;

    // Try Groq first for general knowledge
    try {
      aiResponse = await generalKnowledgeAssistantGroq(message);
    } catch (groqError) {
      console.log('Groq general chat failed, trying Ollama...');
      
      // Fallback to Ollama
      try {
        aiResponse = await generalKnowledgeAssistant(message);
      } catch (ollamaError) {
        console.log('Ollama general chat failed, using fallback...');
        aiResponse = `I understand you're asking about "${message}". I'm here to help with any questions you might have. Could you provide more context about what you'd like to know?`;
      }
    }

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('General Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process general chat request',
      error: error.message
    });
  }
};

// Generate quiz endpoint
const generateQuiz = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Fetch course data
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let quiz;

    // Try Groq first for AI-powered quiz generation
    try {
      console.log('Generating quiz with Groq API...');
      quiz = await generateQuizQuestionsGroq(course);
      console.log('Groq quiz generation successful');
    } catch (groqError) {
      console.log('Groq quiz generation failed, using fallback:', groqError.message);
      
      // Fallback to physics-focused quiz generation
      quiz = {
        id: `quiz_${Date.now()}`,
        title: `${course.courseName} Physics Quiz`,
        questions: [
          {
            id: 1,
            question: "What fundamental physics principle is Newton's First Law?",
            options: [
              "An object at rest stays at rest, an object in motion stays in motion",
              "Force equals mass times acceleration",
              "For every action there is an equal and opposite reaction",
              "Energy cannot be created or destroyed"
            ],
            correct: "An object at rest stays at rest, an object in motion stays in motion"
          },
          {
            id: 2,
            question: "What is the formula for kinetic energy?",
            options: [
              "KE = ½mv²",
              "KE = mv",
              "KE = mgh",
              "KE = Fd"
            ],
            correct: "KE = ½mv²"
          },
          {
            id: 3,
            question: "What type of force opposes motion between surfaces?",
            options: [
              "Friction",
              "Gravity",
              "Tension",
              "Normal force"
            ],
            correct: "Friction"
          },
          {
            id: 4,
            question: "What is the SI unit of force?",
            options: [
              "Newton (N)",
              "Joule (J)",
              "Watt (W)",
              "Pascal (Pa)"
            ],
            correct: "Newton (N)"
          },
          {
            id: 5,
            question: "What does the law of conservation of energy state?",
            options: [
              "Energy cannot be created or destroyed, only transformed",
              "Energy increases over time",
              "Energy decreases over time",
              "Energy is always constant"
            ],
            correct: "Energy cannot be created or destroyed, only transformed"
          }
        ]
      };
    }

    res.json({
      success: true,
      quiz: quiz,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
};

// Submit quiz endpoint
const submitQuiz = async (req, res) => {
  try {
    const { courseId, answers, quizData } = req.body;
    const userId = req.user.id;

    if (!courseId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and answers are required'
      });
    }

    // Fetch course data
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate score based on quiz data
    let totalQuestions = 0;
    let correctAnswers = 0;

    if (quizData && quizData.questions) {
      // Use AI-generated quiz data for scoring
      totalQuestions = quizData.questions.length;
      
      quizData.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer === question.correct) {
          correctAnswers++;
        }
      });
    } else {
      // Fallback to physics quiz scoring
      totalQuestions = 5;
      const correctAnswersList = [
        "An object at rest stays at rest, an object in motion stays in motion",
        "KE = ½mv²",
        "Friction",
        "Newton (N)",
        "Energy cannot be created or destroyed, only transformed"
      ];

      Object.values(answers).forEach((answer, index) => {
        if (answer === correctAnswersList[index]) {
          correctAnswers++;
        }
      });
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Generate AI-powered feedback using Groq
    let feedback;
    try {
      // Check if Groq API key is configured
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
        throw new Error('GROQ_API_KEY not configured');
      }

      const feedbackPrompt = `A student just completed a quiz for the course "${course.courseName}" and scored ${score}% (${correctAnswers} out of ${totalQuestions} questions correct). 

Course Details:
- Title: ${course.courseName}
- Instructor: ${course.educator?.name || 'Unknown'}
- Duration: ${course.duration} weeks
- Difficulty: ${course.difficulty}
- Category: ${course.category || 'General'}

Generate encouraging and constructive feedback for this student. The feedback should:
- Be encouraging and supportive
- Provide specific guidance based on the score
- Suggest next steps for learning
- Be personalized to the course content
- Maintain a positive, educational tone

Keep the feedback concise but meaningful (2-3 sentences).`;

      const feedbackResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an encouraging educational mentor. Provide constructive feedback to help students learn and improve."
          },
          {
            role: "user",
            content: feedbackPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.9
      });

      feedback = feedbackResponse.choices[0].message.content;
    } catch (feedbackError) {
      console.log('AI feedback generation failed, using fallback:', feedbackError.message);
      
      // Fallback feedback based on score
      if (score >= 80) {
        feedback = "Excellent! You have a strong understanding of this course. Keep up the great work!";
      } else if (score >= 60) {
        feedback = "Good job! You understand most of the course content. Consider reviewing some areas for improvement.";
      } else if (score >= 40) {
        feedback = "You're making progress! Focus on reviewing the course materials and understanding the key concepts.";
      } else {
        feedback = "Don't worry! Learning takes time. Review the course content and try the quiz again.";
      }
    }

    // Calculate progress (simple progress calculation)
    const progress = Math.min(score, 100);

    // Save quiz result to student progress
    try {
      const studentProgress = await StudentProgress.getOrCreateProgress(userId, courseId);
      await studentProgress.addQuizResult({
        quizId: quizData?.id || Date.now().toString(),
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        feedback: feedback
      });
      await studentProgress.updateLastActivity();
      console.log('Quiz result saved to student progress');
    } catch (progressError) {
      console.error('Error saving quiz progress:', progressError);
      // Continue with response even if progress saving fails
    }

    res.json({
      success: true,
      score: score,
      feedback: feedback,
      progress: progress,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quiz Submission Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

export {
  chatWithAI,
  analyzeVideo,
  generateQuestions,
  generalChat,
  generateQuiz,
  submitQuiz
};
