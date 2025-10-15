// Advanced LLM Configuration
// Supports multiple AI providers including DeepSeek, OpenAI, Anthropic, Groq, etc.

export const LLM_CONFIG = {
  // DeepSeek Configuration (Recommended - Very powerful and cost-effective)
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  DEEPSEEK_BASE_URL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
  
  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
  
  // Anthropic Configuration
  ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  ANTHROPIC_BASE_URL: import.meta.env.VITE_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
  ANTHROPIC_MODEL: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
  
  // Groq Configuration (Fast reasoning)
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
  GROQ_BASE_URL: import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  GROQ_MODEL: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant',
  
  // Fallback settings
  USE_FALLBACK: !import.meta.env.VITE_DEEPSEEK_API_KEY && 
                !import.meta.env.VITE_OPENAI_API_KEY && 
                !import.meta.env.VITE_ANTHROPIC_API_KEY && 
                !import.meta.env.VITE_GROQ_API_KEY,
  FALLBACK_DELAY: 1000, // Simulate API delay for fallback responses
};

// Provider Priority (in order of preference)
export const PROVIDER_PRIORITY = [
  'groq',        // Fastest reasoning with llama-3.1-8b-instant
  'deepseek',    // Best balance of performance and cost
  'openai',      // Most reliable and feature-rich
  'anthropic',   // Excellent for complex reasoning
];

// Instructions for setup:
/*
To enable powerful AI integration:

1. Create a .env file in the root directory

2. For DeepSeek (Recommended - Best value):
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

3. For OpenAI (Most popular):
   VITE_OPENAI_API_KEY=your_openai_api_key_here

4. For Anthropic Claude:
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

5. For Groq (Fast Reasoning - Recommended):
   VITE_GROQ_API_KEY=your_groq_api_key_here

6. You can configure multiple providers for redundancy

7. Restart the development server

The system will automatically use the best available provider.
Without any API keys, the FAQ will use intelligent fallback responses.

API Key Sources:
- DeepSeek: https://platform.deepseek.com/
- OpenAI: https://platform.openai.com/
- Anthropic: https://console.anthropic.com/
- Groq: https://console.groq.com/
*/
