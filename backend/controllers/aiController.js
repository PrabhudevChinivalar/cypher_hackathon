import Course from '../model/Courses.js';
import { generateAIResponse, analyzeVideoContent, generateStudyQuestions } from '../services/openaiService.js';
import { generateOllamaResponse, analyzeVideoContentOllama, generateStudyQuestionsOllama, generalKnowledgeAssistant } from '../services/ollamaService.js';
import { generateGroqResponse, analyzeVideoContentGroq, generateStudyQuestionsGroq, generalKnowledgeAssistantGroq } from '../services/groqService.js';

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

export {
  chatWithAI,
  analyzeVideo,
  generateQuestions,
  generalChat
};
