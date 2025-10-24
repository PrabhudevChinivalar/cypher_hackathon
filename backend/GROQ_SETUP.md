# Groq Setup Guide

This guide will help you set up Groq for super-fast AI responses in your course platform.

## Why Groq?

- ⚡ **10x Faster** than OpenAI
- 🆓 **Free Tier**: 14,400 requests/day
- 🚀 **Easy Setup**: Just API key
- 🎯 **Multiple Models**: Llama 3.1, Mixtral, Gemma
- 💰 **Cost Effective**: Much cheaper than OpenAI

## Setup Steps

### 1. Get Groq API Key

1. **Visit**: https://console.groq.com/
2. **Sign up** for a free account
3. **Go to API Keys** section
4. **Create a new API key**
5. **Copy the key** (starts with `gsk_...`)

### 2. Add to Environment Variables

Add this to your `.env` file:

```env
# Groq Configuration (Primary AI)
GROQ_API_KEY=your-groq-api-key-here

# Optional: OpenAI as fallback
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Ollama for local AI
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 3. Test the Setup

You can test if Groq is working by running:

```bash
# Test the backend
cd backend
npm run dev

# The AI will automatically use Groq as primary
```

## Available Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama3-8b-8192` | ⚡⚡⚡ | ⭐⭐⭐⭐ | General use (default) |
| `llama3-70b-8192` | ⚡⚡ | ⭐⭐⭐⭐⭐ | High quality |
| `mixtral-8x7b-32768` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced |
| `gemma-7b-it` | ⚡⚡⚡⚡ | ⭐⭐⭐ | Fast responses |

## Fallback System

The system uses this priority order:

1. **Groq** (Primary - Fast & Free)
2. **Ollama** (Secondary - Local AI)
3. **OpenAI** (Tertiary - Cloud AI)
4. **Basic Responses** (Fallback - Always works)

## Benefits

### Speed Comparison
- **Groq**: ~200ms response time
- **OpenAI**: ~2-3 seconds
- **Ollama**: ~1-2 seconds (local)

### Cost Comparison
- **Groq**: Free (14,400 requests/day)
- **OpenAI**: $0.01-0.03 per request
- **Ollama**: Free (local)

### Quality
- **Groq**: Excellent (Llama 3.1, Mixtral)
- **OpenAI**: Excellent (GPT-4)
- **Ollama**: Good (Llama 3.2)

## Troubleshooting

### API Key Issues
```bash
# Check if API key is set
echo $GROQ_API_KEY

# Should show: gsk_...
```

### Rate Limits
- **Free Tier**: 14,400 requests/day
- **Paid Tier**: Higher limits available
- **Fallback**: System automatically switches to other providers

### Connection Issues
- Check internet connection
- Verify API key is correct
- Check Groq service status: https://status.groq.com/

## Advanced Configuration

### Custom Model Selection
You can change the model in `backend/services/groqService.js`:

```javascript
// Change this line:
model: "llama3-8b-8192", // Current model

// To any of these:
model: "llama3-70b-8192", // Higher quality
model: "mixtral-8x7b-32768", // Balanced
model: "gemma-7b-it", // Fastest
```

### Performance Tuning
```javascript
// Adjust these parameters for better performance:
temperature: 0.7,    // Creativity (0.0-1.0)
max_tokens: 1000,    // Response length
top_p: 0.9,          // Diversity (0.0-1.0)
```

## Usage Examples

### Course Questions
- "What are the main topics in this course?"
- "Explain the video content"
- "What should I study for this lesson?"

### General Knowledge
- "What is machine learning?"
- "How do I improve my coding skills?"
- "Explain quantum computing"
- "What's the weather like?"

### AI Features
- 🎥 **Video Analysis**: Analyze course videos
- 📚 **Study Questions**: Generate personalized questions
- 💬 **Smart Chat**: Course + general knowledge

## Next Steps

1. **Get API Key**: https://console.groq.com/
2. **Add to .env**: `GROQ_API_KEY=your-key`
3. **Restart Backend**: `npm run dev`
4. **Test AI Chat**: Try asking any question!

Your AI assistant will now be **10x faster** and **completely free** for most usage!
