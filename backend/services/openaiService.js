import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate AI response using OpenAI GPT-4
export const generateAIResponse = async (message, courseData, conversationHistory) => {
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

Course Information:
${courseContext}

${conversationContext ? `Previous Conversation Context:\n${conversationContext}` : ''}

Guidelines:
- Be helpful, accurate, and encouraging
- Provide specific, actionable advice
- Reference specific course content when relevant
- Ask clarifying questions if needed
- Maintain a professional yet friendly tone
- Focus on educational value and learning outcomes`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback to basic response if OpenAI fails
    return generateFallbackResponse(message, courseData);
  }
};

// Create detailed course context for OpenAI
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
    context += `COURSE CONTENT STRUCTURE:\n`;
    courseData.courseContents.forEach((content, index) => {
      context += `Lesson ${index + 1}:\n`;
      if (content.title) context += `  Title: ${content.title}\n`;
      if (content.description) context += `  Description: ${content.description}\n`;
      if (content.video) context += `  Video: Available (${content.video})\n`;
      if (content.image) context += `  Image: Available (${content.image})\n`;
      context += `\n`;
    });
  }
  
  return context;
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

// Fallback response generator (if OpenAI fails)
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
  
  // Default response
  return `I understand you're asking about "${message}". I'm here to help you with any questions about this course, including the video content, learning objectives, study strategies, and course materials. Could you be more specific about what you'd like to know?`;
};

// Analyze video content (for future enhancement)
export const analyzeVideoContent = async (videoUrl, courseContext) => {
  try {
    // This would be enhanced with video transcription and analysis
    // For now, we'll use the course context to provide relevant responses
    const prompt = `Analyze the following course video content and provide insights about what students should focus on while watching:

Course Context: ${courseContext}
Video URL: ${videoUrl}

Provide:
1. Key concepts to watch for
2. Important points to note
3. Questions to think about while watching
4. How this video relates to the overall course objectives`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      max_tokens: 800,
      temperature: 0.7
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Video analysis error:', error);
    return "I can help you understand the video content. What specific aspects would you like to know more about?";
  }
};

// Generate study questions based on course content
export const generateStudyQuestions = async (courseData) => {
  try {
    const courseContext = createDetailedCourseContext(courseData);
    
    const prompt = `Based on the following course information, generate 5-7 thoughtful study questions that will help students test their understanding and prepare for assessments:

${courseContext}

Generate questions that:
- Test understanding of key concepts
- Encourage critical thinking
- Relate to real-world applications
- Cover different difficulty levels
- Are specific to the course content`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      max_tokens: 600,
      temperature: 0.8
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('Study questions generation error:', error);
    return "I can help you create study questions for this course. What specific topics would you like to focus on?";
  }
};
