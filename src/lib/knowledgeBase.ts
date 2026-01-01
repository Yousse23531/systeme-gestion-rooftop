// Comprehensive Knowledge Base for 7ekmaAI
// This provides extensive knowledge across all domains

export interface KnowledgeCategory {
  name: string;
  description: string;
  topics: string[];
  examples: string[];
}

export const KNOWLEDGE_BASE: { [key: string]: KnowledgeCategory } = {
  business: {
    name: "Business & Management",
    description: "Comprehensive business knowledge and management strategies",
    topics: [
      "Strategic Planning", "Financial Management", "Marketing", "Operations",
      "Human Resources", "Project Management", "Leadership", "Entrepreneurship",
      "Business Analysis", "Risk Management", "Supply Chain", "Customer Service"
    ],
    examples: [
      "How to create a business plan?",
      "What are the key performance indicators?",
      "How to manage cash flow?",
      "What is the difference between marketing and sales?"
    ]
  },
  technology: {
    name: "Technology & Programming",
    description: "Advanced technology knowledge and programming expertise",
    topics: [
      "Programming Languages", "Web Development", "Mobile Development", "AI/ML",
      "Cloud Computing", "Cybersecurity", "Data Science", "DevOps",
      "Software Architecture", "Database Design", "API Development", "System Design"
    ],
    examples: [
      "How to optimize React performance?",
      "What is the difference between SQL and NoSQL?",
      "How to implement microservices?",
      "What are the best practices for API security?"
    ]
  },
  science: {
    name: "Science & Mathematics",
    description: "Scientific knowledge and mathematical concepts",
    topics: [
      "Physics", "Chemistry", "Biology", "Mathematics", "Statistics",
      "Astronomy", "Geology", "Environmental Science", "Medicine",
      "Psychology", "Neuroscience", "Computer Science", "Engineering"
    ],
    examples: [
      "Explain quantum mechanics",
      "What is the theory of relativity?",
      "How does photosynthesis work?",
      "What is the difference between correlation and causation?"
    ]
  },
  humanities: {
    name: "Humanities & Social Sciences",
    description: "Human knowledge, culture, and social understanding",
    topics: [
      "History", "Philosophy", "Literature", "Art", "Music", "Languages",
      "Psychology", "Sociology", "Anthropology", "Political Science",
      "Economics", "Geography", "Religion", "Cultural Studies"
    ],
    examples: [
      "What is existentialism?",
      "Explain the Renaissance period",
      "What are the principles of democracy?",
      "How does culture influence behavior?"
    ]
  },
  practical: {
    name: "Practical Life Skills",
    description: "Everyday practical knowledge and life skills",
    topics: [
      "Cooking", "Home Improvement", "Gardening", "Health & Fitness",
      "Personal Finance", "Time Management", "Communication", "Problem Solving",
      "Critical Thinking", "Creativity", "Learning", "Self-Development"
    ],
    examples: [
      "How to manage personal finances?",
      "What are effective study techniques?",
      "How to improve communication skills?",
      "What are the basics of home maintenance?"
    ]
  },
  current_events: {
    name: "Current Events & News",
    description: "Knowledge of current events and recent developments",
    topics: [
      "Technology News", "Business Updates", "Scientific Discoveries",
      "Political Developments", "Environmental Issues", "Health News",
      "Economic Trends", "Social Issues", "International Relations",
      "Innovation", "Research", "Global Events"
    ],
    examples: [
      "What are the latest AI developments?",
      "How is climate change affecting the world?",
      "What are the current economic trends?",
      "What are the latest scientific breakthroughs?"
    ]
  }
};

export const EXPERTISE_LEVELS = {
  beginner: "I'll explain this in simple terms with clear examples",
  intermediate: "I'll provide a balanced explanation with practical applications",
  advanced: "I'll give you a comprehensive, technical explanation with deep insights",
  expert: "I'll provide cutting-edge knowledge with advanced analysis"
};

export const RESPONSE_STYLES = {
  educational: "Let me teach you this step by step...",
  analytical: "Let me analyze this from multiple perspectives...",
  practical: "Here's how you can apply this in practice...",
  creative: "Let me think about this creatively...",
  critical: "Let me evaluate this critically...",
  collaborative: "Let's work through this together..."
};

export const CONVERSATION_CONTEXT = {
  business_management: "I understand you're working with a business management system. Let me help you with that context in mind.",
  technical_support: "I'm here to help you with technical questions and problem-solving.",
  learning: "I'm here to help you learn and understand new concepts.",
  problem_solving: "Let me help you solve this problem systematically.",
  creative_thinking: "Let me help you think creatively about this challenge.",
  decision_making: "Let me help you make an informed decision."
};

// Advanced reasoning patterns
export const REASONING_PATTERNS = {
  problem_solving: [
    "1. Define the problem clearly",
    "2. Gather relevant information",
    "3. Generate possible solutions",
    "4. Evaluate each solution",
    "5. Choose the best solution",
    "6. Implement and monitor"
  ],
  decision_making: [
    "1. Identify the decision to be made",
    "2. Gather relevant information",
    "3. Identify alternatives",
    "4. Weigh the evidence",
    "5. Choose among alternatives",
    "6. Take action and review"
  ],
  critical_thinking: [
    "1. Identify the issue or problem",
    "2. Gather and analyze information",
    "3. Consider different perspectives",
    "4. Evaluate evidence and arguments",
    "5. Draw logical conclusions",
    "6. Reflect on the process"
  ],
  creative_thinking: [
    "1. Define the challenge",
    "2. Brainstorm without judgment",
    "3. Explore different angles",
    "4. Combine and modify ideas",
    "5. Evaluate creative solutions",
    "6. Refine and implement"
  ]
};

export function getKnowledgeContext(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  // Business context
  if (lowerQuestion.includes('business') || lowerQuestion.includes('management') || 
      lowerQuestion.includes('company') || lowerQuestion.includes('profit') ||
      lowerQuestion.includes('strategy') || lowerQuestion.includes('marketing')) {
    return CONVERSATION_CONTEXT.business_management;
  }
  
  // Technical context
  if (lowerQuestion.includes('code') || lowerQuestion.includes('programming') ||
      lowerQuestion.includes('software') || lowerQuestion.includes('technical') ||
      lowerQuestion.includes('api') || lowerQuestion.includes('database')) {
    return CONVERSATION_CONTEXT.technical_support;
  }
  
  // Learning context
  if (lowerQuestion.includes('learn') || lowerQuestion.includes('understand') ||
      lowerQuestion.includes('explain') || lowerQuestion.includes('teach') ||
      lowerQuestion.includes('how') || lowerQuestion.includes('what')) {
    return CONVERSATION_CONTEXT.learning;
  }
  
  // Problem solving context
  if (lowerQuestion.includes('problem') || lowerQuestion.includes('issue') ||
      lowerQuestion.includes('solve') || lowerQuestion.includes('fix') ||
      lowerQuestion.includes('trouble') || lowerQuestion.includes('error')) {
    return CONVERSATION_CONTEXT.problem_solving;
  }
  
  return CONVERSATION_CONTEXT.learning;
}

export function getReasoningPattern(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('problem') || lowerQuestion.includes('solve') ||
      lowerQuestion.includes('fix') || lowerQuestion.includes('issue')) {
    return REASONING_PATTERNS.problem_solving;
  }
  
  if (lowerQuestion.includes('decide') || lowerQuestion.includes('choose') ||
      lowerQuestion.includes('option') || lowerQuestion.includes('alternative')) {
    return REASONING_PATTERNS.decision_making;
  }
  
  if (lowerQuestion.includes('think') || lowerQuestion.includes('analyze') ||
      lowerQuestion.includes('evaluate') || lowerQuestion.includes('critique')) {
    return REASONING_PATTERNS.critical_thinking;
  }
  
  if (lowerQuestion.includes('creative') || lowerQuestion.includes('innovative') ||
      lowerQuestion.includes('new') || lowerQuestion.includes('different')) {
    return REASONING_PATTERNS.creative_thinking;
  }
  
  return REASONING_PATTERNS.problem_solving;
}
