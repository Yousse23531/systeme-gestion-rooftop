# Advanced AI Integration Setup

## 🚀 Powerful AI Models Available

Your FAQ system now supports multiple advanced AI providers, including **DeepSeek** - one of the most powerful and cost-effective AI models available!

### Supported AI Providers

1. **DeepSeek** (Recommended) - Best balance of performance and cost
2. **OpenAI GPT-4** - Most reliable and feature-rich
3. **Anthropic Claude** - Excellent for complex reasoning
4. **Groq** - Fastest responses

## 🔧 Quick Setup

### Option 1: DeepSeek (Recommended)

1. **Get API Key**: Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. **Create Account**: Sign up for free
3. **Get API Key**: Generate your API key
4. **Configure**: Add to your `.env` file:
   ```
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
5. **Restart**: Restart your development server

### Option 2: Multiple Providers (Best Experience)

Add multiple API keys for redundancy and best performance:

```env
# DeepSeek (Primary - Best value)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# OpenAI (Backup - Most reliable)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (Backup - Best reasoning)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Groq (Backup - Fastest)
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## 🎯 Why DeepSeek?

- **Powerful**: Comparable to GPT-4 in performance
- **Cost-effective**: Much cheaper than OpenAI
- **Fast**: Quick response times
- **Reliable**: Stable API with good uptime
- **Multilingual**: Excellent support for multiple languages

## 🔄 Automatic Fallback System

The system automatically:
1. **Tries DeepSeek first** (if configured)
2. **Falls back to other providers** if DeepSeek fails
3. **Uses intelligent fallback responses** if no APIs are available

## 📊 Features

### Enhanced AI Capabilities
- **General Knowledge**: Can answer any question, not just about the system
- **Context Awareness**: Understands your business management system
- **Multilingual Support**: Responds in French, English, or other languages
- **Detailed Responses**: Provides comprehensive, helpful answers
- **Examples and Explanations**: Gives practical examples when appropriate

### UI Enhancements
- **Provider Indicators**: Shows which AI model answered
- **Confidence Scores**: Displays confidence levels
- **Multiple Provider Support**: Shows when multiple providers are available
- **Real-time Status**: Indicates online/offline mode

## 🛠️ Advanced Configuration

### Custom Models
You can specify different models for each provider:

```env
# Use specific models
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_OPENAI_MODEL=gpt-4
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229
VITE_GROQ_MODEL=llama3-70b-8192
```

### Custom Endpoints
For self-hosted or custom endpoints:

```env
VITE_DEEPSEEK_BASE_URL=https://your-custom-endpoint.com/v1
VITE_OPENAI_BASE_URL=https://your-openai-proxy.com/v1
```

## 💡 Usage Examples

### System Questions
- "Comment ajouter un nouvel employé?"
- "Comment calculer les bénéfices?"
- "Comment exporter les données?"

### General Questions
- "Qu'est-ce que l'intelligence artificielle?"
- "Comment fonctionne le machine learning?"
- "Explique-moi la blockchain"
- "Quels sont les meilleures pratiques de gestion?"

### Technical Questions
- "Comment optimiser les performances d'une application React?"
- "Quelle est la différence entre SQL et NoSQL?"
- "Comment sécuriser une API REST?"

## 🔒 Security Notes

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development
- **Rate Limiting**: The system handles rate limits automatically
- **Error Handling**: Graceful fallbacks prevent system crashes

## 📈 Performance

### Response Times
- **DeepSeek**: ~2-3 seconds
- **OpenAI**: ~3-5 seconds
- **Anthropic**: ~4-6 seconds
- **Groq**: ~1-2 seconds (fastest)

### Cost Comparison
- **DeepSeek**: ~$0.14 per 1M tokens (very cheap)
- **OpenAI GPT-4**: ~$30 per 1M tokens
- **Anthropic Claude**: ~$15 per 1M tokens
- **Groq**: Free tier available

## 🚨 Troubleshooting

### Common Issues

1. **"Mode hors ligne"**: No API keys configured
   - **Solution**: Add at least one API key to `.env`

2. **API Error**: Invalid or expired API key
   - **Solution**: Check your API key and regenerate if needed

3. **Slow Responses**: Network or API issues
   - **Solution**: The system will automatically try other providers

4. **Rate Limiting**: Too many requests
   - **Solution**: Wait a moment or add more providers

### Debug Mode
Check the browser console for detailed error messages and provider switching logs.

## 🎉 Result

With this setup, your FAQ system becomes a **powerful AI assistant** that can:
- Answer any question about your business system
- Provide general knowledge and explanations
- Help with technical questions
- Offer detailed, contextual responses
- Work reliably with automatic fallbacks

The AI will be as capable as DeepSeek, GPT-4, or Claude - providing intelligent, helpful responses to any question your users might have!
