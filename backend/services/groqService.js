import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate AI response using Groq (super fast)
export const generateGroqResponse = async (message, courseData, conversationHistory) => {
  try {
    // Create comprehensive context from course data
    const courseContext = createDetailedCourseContext(courseData);
    
    // Create conversation context
    const conversationContext = createConversationContext(conversationHistory);
    
    // Create system prompt for the AI
    const systemPrompt = `You are an intelligent AI assistant specialized in educational content analysis and student support. You have access to detailed course information and can provide expert guidance on course content, videos, and learning materials.

Your role:
- Analyze course content and provide detailed explanations
- Answer questions about video content and course materials
- Provide study guidance and learning strategies
- Explain complex concepts in simple terms
- Offer practical examples and real-world applications
- Help students understand course objectives and prerequisites
- Respond to ANY question the student asks, whether related to the course or not

Course Information:
${courseContext}

${conversationContext ? `Previous Conversation Context:\n${conversationContext}` : ''}

Guidelines:
- Be helpful, accurate, and encouraging
- Provide specific, actionable advice
- Reference specific course content when relevant
- Ask clarifying questions if needed
- Maintain a professional yet friendly tone
- Focus on educational value and learning outcomes
- If asked about topics outside the course, provide helpful general knowledge
- Always be supportive and educational`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast and efficient model
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      stream: false
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Groq API Error:', error);
    
    // Fallback to basic response if Groq fails
    return generateFallbackResponse(message, courseData);
  }
};

// Analyze video content using Groq
export const analyzeVideoContentGroq = async (videoUrl, courseData) => {
  try {
    const courseContext = createDetailedCourseContext(courseData);
    
    const prompt = `Analyze the following course video content and provide insights about what students should focus on while watching:

Course Context: ${courseContext}
Video URL: ${videoUrl}

Provide:
1. Key concepts to watch for
2. Important points to note
3. Questions to think about while watching
4. How this video relates to the overall course objectives
5. Study tips for this specific video content`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an educational content analyst. Analyze video content and provide learning guidance for students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Groq video analysis error:', error);
    return "I can help you understand the video content. What specific aspects would you like to know more about?";
  }
};

// Generate study questions using Groq
export const generateStudyQuestionsGroq = async (courseData) => {
  try {
    const courseContext = createDetailedCourseContext(courseData);
    
    const prompt = `Based on the following course information, generate 5-7 thoughtful study questions that will help students test their understanding and prepare for assessments:

${courseContext}

Generate questions that:
- Test understanding of key concepts
- Encourage critical thinking
- Relate to real-world applications
- Cover different difficulty levels
- Are specific to the course content
- Include both theoretical and practical questions`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an educational assessment specialist. Create thoughtful study questions that help students learn effectively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 600,
      top_p: 0.9
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Groq study questions generation error:', error);
    return "I can help you create study questions for this course. What specific topics would you like to focus on?";
  }
};

// Generate AI-powered quiz questions using Groq
export const generateQuizQuestionsGroq = async (courseData) => {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
      console.log('Groq API key not configured, using fallback quiz generation');
      throw new Error('GROQ_API_KEY not configured');
    }

    const courseContext = createDetailedCourseContext(courseData);
    
    const prompt = `Based on the following course information, generate a comprehensive quiz with 5 multiple-choice questions that test students' understanding of the ACTUAL COURSE CONTENT and PHYSICS CONCEPTS.

${courseContext}

IMPORTANT: Focus ONLY on educational content, NOT course metadata. Generate questions about:

1. PHYSICS CONCEPTS and PRINCIPLES covered in the course
2. VIDEO CONTENT and LESSON MATERIALS described
3. LEARNING OBJECTIVES and EDUCATIONAL TOPICS
4. PRACTICAL APPLICATIONS and PROBLEM-SOLVING
5. SCIENTIFIC THEORIES and FORMULAS mentioned

DO NOT include questions about:
- Course duration, difficulty level, or instructor name
- Course category or basic course information
- Administrative details

Focus on questions that test:
- Understanding of physics concepts from video descriptions
- Application of scientific principles
- Problem-solving skills related to course content
- Knowledge of formulas, theories, and practical examples
- Critical thinking about physics phenomena

Format your response as a JSON object with this exact structure:
{
  "id": "quiz_[timestamp]",
  "title": "[Course Name] Physics Quiz",
  "questions": [
    {
      "id": 1,
      "question": "Physics concept question based on course content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Correct answer text"
    }
  ]
}

Make sure each question has exactly 4 options and the correct answer matches one of the options exactly.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an educational assessment specialist. Create comprehensive quiz questions based on course content. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.9
    });

    const responseText = response.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const quizData = JSON.parse(responseText);
      
      // Validate the quiz structure
      if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
        return quizData;
      } else {
        throw new Error('Invalid quiz structure');
      }
    } catch (parseError) {
      console.error('Failed to parse Groq quiz response:', parseError);
      // Fallback to generating a structured quiz manually
      return generateFallbackQuiz(courseData);
    }

  } catch (error) {
    console.error('Groq quiz generation error:', error);
    return generateFallbackQuiz(courseData);
  }
};

// Fallback quiz generator (if Groq fails) - Focus on physics content
const generateFallbackQuiz = (courseData) => {
  // Extract physics-related content from course data
  const courseDescription = courseData.description || '';
  const learningObjectives = courseData.learningObjectives || [];
  const courseContents = courseData.courseContents || [];
  
  // Generate physics-focused questions based on available content
  const questions = [];
  
  // Question 1: Based on course description
  if (courseDescription.toLowerCase().includes('physics') || courseDescription.toLowerCase().includes('mechanics')) {
    questions.push({
      id: 1,
      question: "Which fundamental physics principle is primarily discussed in this course?",
      options: [
        "Newton's Laws of Motion",
        "Thermodynamics",
        "Quantum Mechanics", 
        "Electromagnetic Theory"
      ],
      correct: "Newton's Laws of Motion"
    });
  } else if (courseDescription.toLowerCase().includes('energy') || courseDescription.toLowerCase().includes('work')) {
    questions.push({
      id: 1,
      question: "What is the primary focus of this physics course?",
      options: [
        "Energy and Work",
        "Wave Properties",
        "Atomic Structure",
        "Optics"
      ],
      correct: "Energy and Work"
    });
  } else {
    questions.push({
      id: 1,
      question: "What type of physics concepts are covered in this course?",
      options: [
        "Classical Mechanics",
        "Modern Physics",
        "Thermal Physics",
        "All of the above"
      ],
      correct: "Classical Mechanics"
    });
  }
  
  // Question 2: Based on learning objectives
  if (learningObjectives.length > 0) {
    const firstObjective = learningObjectives[0];
    questions.push({
      id: 2,
      question: "According to the learning objectives, what should students be able to do after completing this course?",
      options: [
        firstObjective,
        "Solve complex mathematical equations",
        "Design physics experiments",
        "Teach physics to others"
      ],
      correct: firstObjective
    });
  } else {
    questions.push({
      id: 2,
      question: "What is the main learning goal of this physics course?",
      options: [
        "Understand fundamental physics principles",
        "Memorize physics formulas",
        "Pass physics exams",
        "Become a physics teacher"
      ],
      correct: "Understand fundamental physics principles"
    });
  }
  
  // Question 3: Based on video content
  if (courseContents.length > 0 && courseContents[0].description) {
    const videoDesc = courseContents[0].description;
    questions.push({
      id: 3,
      question: "What physics concept is demonstrated in the course videos?",
      options: [
        videoDesc.includes('motion') ? "Motion and Forces" : "Physics Principles",
        "Mathematical Calculations",
        "Laboratory Procedures",
        "Historical Physics"
      ],
      correct: videoDesc.includes('motion') ? "Motion and Forces" : "Physics Principles"
    });
  } else {
    questions.push({
      id: 3,
      question: "What type of physics demonstrations are shown in the course videos?",
      options: [
        "Practical physics experiments",
        "Theoretical discussions",
        "Mathematical derivations",
        "Historical physics discoveries"
      ],
      correct: "Practical physics experiments"
    });
  }
  
  // Question 4: General physics concept
  questions.push({
    id: 4,
    question: "Which physics law states that 'for every action, there is an equal and opposite reaction'?",
    options: [
      "Newton's Third Law",
      "Newton's First Law",
      "Newton's Second Law",
      "Law of Conservation of Energy"
    ],
    correct: "Newton's Third Law"
  });
  
  // Question 5: Application question
  questions.push({
    id: 5,
    question: "In physics problem-solving, what is the first step you should take?",
    options: [
      "Identify the given information and what you need to find",
      "Start calculating immediately",
      "Look up formulas in the textbook",
      "Ask your instructor for help"
    ],
    correct: "Identify the given information and what you need to find"
  });
  
  return {
    id: `quiz_${Date.now()}`,
    title: `${courseData.courseName} Physics Quiz`,
    questions: questions
  };
};

// General knowledge assistant using Groq
export const generalKnowledgeAssistantGroq = async (message) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant that can answer any question on any topic. You are knowledgeable, friendly, and always try to provide accurate and helpful information. 

Guidelines:
- Be helpful and informative
- Provide accurate information
- If you're unsure about something, say so
- Be encouraging and supportive
- Explain complex topics in simple terms
- Ask clarifying questions if needed
- Always maintain a professional yet friendly tone`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Groq general knowledge error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};

// Create detailed course context for AI
const createDetailedCourseContext = (courseData) => {
  let context = `COURSE DETAILS:\n`;
  context += `Title: ${courseData.courseName}\n`;
  context += `Instructor: ${courseData.educator?.name || 'Unknown'}\n`;
  context += `Duration: ${courseData.duration} weeks\n`;
  context += `Difficulty Level: ${courseData.difficulty}\n`;
  context += `Category: ${courseData.category || 'General'}\n`;
  context += `Rating: ${courseData.rating || 'Not rated'}\n\n`;
  
  if (courseData.description) {
    context += `COURSE DESCRIPTION:\n${courseData.description}\n\n`;
  }
  
  if (courseData.learningObjectives && courseData.learningObjectives.length > 0) {
    context += `LEARNING OBJECTIVES:\n`;
    courseData.learningObjectives.forEach((objective, index) => {
      context += `${index + 1}. ${objective}\n`;
    });
    context += `\n`;
  }
  
  if (courseData.prerequisites && courseData.prerequisites.length > 0) {
    context += `PREREQUISITES:\n`;
    courseData.prerequisites.forEach((prereq, index) => {
      context += `${index + 1}. ${prereq}\n`;
    });
    context += `\n`;
  }
  
  if (courseData.courseContents && courseData.courseContents.length > 0) {
    context += `PHYSICS CONTENT AND VIDEO MATERIALS:\n`;
    courseData.courseContents.forEach((content, index) => {
      context += `Lesson ${index + 1}:\n`;
      if (content.title) context += `  Physics Topic: ${content.title}\n`;
      if (content.description) {
        context += `  Physics Concepts Covered: ${content.description}\n`;
        // Extract physics keywords for better AI understanding
        const physicsKeywords = extractPhysicsKeywords(content.description);
        if (physicsKeywords.length > 0) {
          context += `  Key Physics Terms: ${physicsKeywords.join(', ')}\n`;
        }
      }
      if (content.video) context += `  Video Demonstration: Available\n`;
      if (content.image) context += `  Visual Aid: Available\n`;
      context += `\n`;
    });
  }
  
  return context;
};

// Extract physics keywords from course content
const extractPhysicsKeywords = (text) => {
  const physicsTerms = [
    'force', 'motion', 'velocity', 'acceleration', 'momentum', 'energy', 'work', 'power',
    'newton', 'law', 'gravity', 'friction', 'tension', 'normal', 'weight', 'mass',
    'kinetic', 'potential', 'mechanical', 'thermal', 'electrical', 'magnetic',
    'wave', 'frequency', 'amplitude', 'wavelength', 'oscillation', 'vibration',
    'pressure', 'density', 'volume', 'temperature', 'heat', 'thermodynamics',
    'electricity', 'current', 'voltage', 'resistance', 'circuit', 'magnetic field',
    'optics', 'light', 'reflection', 'refraction', 'lens', 'mirror',
    'quantum', 'atom', 'electron', 'proton', 'neutron', 'nucleus',
    'relativity', 'space', 'time', 'dimension', 'universe', 'cosmos',
    'formula', 'equation', 'calculation', 'problem', 'solution', 'method'
  ];
  
  const foundTerms = [];
  const lowerText = text.toLowerCase();
  
  physicsTerms.forEach(term => {
    if (lowerText.includes(term)) {
      foundTerms.push(term);
    }
  });
  
  return foundTerms;
};

// Create conversation context
const createConversationContext = (conversationHistory) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }
  
  let context = 'RECENT CONVERSATION:\n';
  conversationHistory.forEach(msg => {
    context += `${msg.type === 'user' ? 'Student' : 'AI'}: ${msg.content}\n`;
  });
  context += '\n';
  
  return context;
};

// Fallback response generator (if Groq fails)
const generateFallbackResponse = (message, courseData) => {
  const lowerMessage = message.toLowerCase();
  
  // Course overview questions
  if (lowerMessage.includes('overview') || lowerMessage.includes('about') || lowerMessage.includes('what is')) {
    return `Based on the course information, "${courseData.courseName}" is a ${courseData.difficulty} level course that runs for ${courseData.duration} weeks. ${courseData.description || 'This course covers important topics in the field.'} The course is designed to provide you with both theoretical knowledge and practical skills.`;
  }
  
  // Learning objectives questions
  if (lowerMessage.includes('learn') || lowerMessage.includes('objectives') || lowerMessage.includes('goals')) {
    if (courseData.learningObjectives && courseData.learningObjectives.length > 0) {
      return `In this course, you will learn:\n${courseData.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\nThese objectives are designed to give you practical skills and knowledge that you can apply in real-world scenarios.`;
    }
    return `This course will help you develop important skills and knowledge in the subject area. The specific learning objectives are designed to provide you with both theoretical understanding and practical application.`;
  }
  
  // Video content questions
  if (lowerMessage.includes('video') || lowerMessage.includes('watch') || lowerMessage.includes('content')) {
    if (courseData.courseContents && courseData.courseContents.length > 0) {
      const videoCount = courseData.courseContents.filter(content => content.video).length;
      return `This course includes ${videoCount} video lesson${videoCount !== 1 ? 's' : ''} with detailed explanations and demonstrations. The videos are designed to help you understand complex concepts through visual learning. You can watch them at your own pace and revisit them as needed.`;
    }
    return `This course includes video content designed to enhance your learning experience. The videos provide visual explanations and demonstrations to help you understand the concepts better.`;
  }
  
  // Study tips
  if (lowerMessage.includes('study') || lowerMessage.includes('tips') || lowerMessage.includes('how to')) {
    return `Here are some study tips for this course:\n\n1. Watch the videos actively - take notes and pause when needed\n2. Practice the concepts regularly\n3. Ask questions when you're unsure\n4. Review previous lessons before moving to new ones\n5. Apply what you learn in practical scenarios\n\nRemember, learning is a process - take your time and don't hesitate to ask for help!`;
  }
  
  // General questions
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI assistant for "${courseData.courseName}". I can help you with questions about this course, study guidance, or any other topic you'd like to discuss. What would you like to know?`;
  }
  
  // Default response
  return `I understand you're asking about "${message}". I'm here to help you with any questions about this course, including the video content, learning objectives, study strategies, and course materials. I can also help with general knowledge questions. Could you be more specific about what you'd like to know?`;
};
