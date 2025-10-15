/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_DEEPSEEK_BASE_URL: string
  readonly VITE_DEEPSEEK_MODEL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_BASE_URL: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_ANTHROPIC_BASE_URL: string
  readonly VITE_ANTHROPIC_MODEL: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_GROQ_BASE_URL: string
  readonly VITE_GROQ_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
