# Environment Variables Setup

## Quick Start

1. **Create a `.env` file** in your project root directory
2. **Add at least one API key** from the options below
3. **Restart your development server**

## API Key Options

### Option 1: DeepSeek (Recommended)
```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Option 2: OpenAI
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Option 3: Multiple Providers (Best Experience)
```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## Where to Get API Keys

- **DeepSeek**: https://platform.deepseek.com/
- **OpenAI**: https://platform.openai.com/
- **Anthropic**: https://console.anthropic.com/
- **Groq**: https://console.groq.com/

## Important Notes

- Never commit your `.env` file to version control
- The `.env` file should be in the root directory (same level as package.json)
- Restart your development server after adding API keys
- You only need ONE API key to get started
- Multiple providers provide redundancy and better performance
