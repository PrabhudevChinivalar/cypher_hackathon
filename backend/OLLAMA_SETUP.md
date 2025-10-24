# Ollama Setup Guide

This guide will help you set up Ollama for local AI responses in your course platform.

## Prerequisites

1. **Install Ollama**: Download and install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. **Choose a Model**: We recommend using `llama3.2` or `llama3.1` for best performance

## Setup Steps

### 1. Install Ollama

**Windows:**
- Download the installer from [https://ollama.ai/download](https://ollama.ai/download)
- Run the installer and follow the setup wizard

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service

After installation, start the Ollama service:

```bash
ollama serve
```

This will start the Ollama server on `http://localhost:11434`

### 3. Pull a Model

Choose and download a model (we recommend llama3.2):

```bash
# For general use (good balance of speed and quality)
ollama pull llama3.2

# For better quality (slower)
ollama pull llama3.1

# For faster responses (lower quality)
ollama pull llama3.2:3b
```

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Optional: OpenAI as fallback
OPENAI_API_KEY=your-openai-api-key-here
```

### 5. Test the Setup

You can test if Ollama is working by running:

```bash
ollama run llama3.2 "Hello, how are you?"
```

## Available Models

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama3.2:3b | ~2GB | Fast | Good | Quick responses |
| llama3.2 | ~4GB | Medium | Better | Balanced |
| llama3.1 | ~4GB | Medium | Best | High quality |
| llama3.1:70b | ~40GB | Slow | Excellent | Best quality |

## Troubleshooting

### Ollama Not Starting
- Make sure Ollama is installed correctly
- Check if port 11434 is available
- Try restarting the Ollama service

### Model Not Found
- Make sure you've pulled the model: `ollama pull llama3.2`
- Check available models: `ollama list`

### Slow Responses
- Try a smaller model like `llama3.2:3b`
- Ensure you have enough RAM (4GB+ recommended)
- Close other applications to free up memory

### Connection Errors
- Verify Ollama is running: `ollama list`
- Check the OLLAMA_HOST in your .env file
- Ensure the backend can reach `http://localhost:11434`

## Performance Tips

1. **RAM Requirements**: 
   - llama3.2:3b needs ~4GB RAM
   - llama3.2 needs ~8GB RAM
   - llama3.1 needs ~8GB RAM

2. **GPU Acceleration** (Optional):
   - Install CUDA for NVIDIA GPUs
   - Install ROCm for AMD GPUs
   - This will significantly speed up responses

3. **Model Caching**:
   - Ollama automatically caches models
   - First request may be slower
   - Subsequent requests will be faster

## Fallback System

The system is designed with a fallback hierarchy:

1. **Primary**: Ollama (local, free, private)
2. **Secondary**: OpenAI (cloud, paid, requires API key)
3. **Fallback**: Basic responses (always works)

This ensures the AI assistant always responds, even if Ollama is not available.

## Benefits of Using Ollama

- ✅ **Free**: No API costs
- ✅ **Private**: Data stays on your machine
- ✅ **Fast**: No network latency
- ✅ **Reliable**: Works offline
- ✅ **Customizable**: Use any compatible model
- ✅ **Secure**: No data sent to external services

## Next Steps

1. Start Ollama: `ollama serve`
2. Pull a model: `ollama pull llama3.2`
3. Set environment variables in `.env`
4. Restart your backend server
5. Test the AI chat functionality

Your AI assistant will now use Ollama for intelligent, local responses to any question!
