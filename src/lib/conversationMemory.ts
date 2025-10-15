// Conversation Memory System for 7ekmaAI
// Provides context awareness and conversation continuity

export interface ConversationContext {
  sessionId: string;
  messages: ConversationMessage[];
  userProfile: UserProfile;
  currentTopic: string;
  expertiseLevel: string;
  conversationStyle: string;
  timestamp: Date;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  topic?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface UserProfile {
  name?: string;
  expertiseAreas: string[];
  preferredStyle: string;
  learningGoals: string[];
  communicationLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
}

export class ConversationMemory {
  private context: ConversationContext;
  private maxMessages: number = 50;

  constructor(sessionId: string) {
    this.context = {
      sessionId,
      messages: [],
      userProfile: {
        expertiseAreas: [],
        preferredStyle: 'educational',
        learningGoals: [],
        communicationLevel: 'intermediate',
        interests: []
      },
      currentTopic: '',
      expertiseLevel: 'intermediate',
      conversationStyle: 'educational',
      timestamp: new Date()
    };
  }

  addMessage(role: 'user' | 'assistant', content: string, metadata?: any): void {
    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      ...metadata
    };

    this.context.messages.push(message);

    // Keep only the last N messages to manage memory
    if (this.context.messages.length > this.maxMessages) {
      this.context.messages = this.context.messages.slice(-this.maxMessages);
    }

    // Update current topic based on recent messages
    this.updateCurrentTopic();
  }

  getContext(): ConversationContext {
    return this.context;
  }

  getRecentMessages(count: number = 10): ConversationMessage[] {
    return this.context.messages.slice(-count);
  }

  getConversationSummary(): string {
    const recentMessages = this.getRecentMessages(5);
    const topics = this.extractTopics();
    const userInterests = this.context.userProfile.interests;

    return `Conversation Context:
- Recent Topics: ${topics.join(', ')}
- User Interests: ${userInterests.join(', ')}
- Communication Level: ${this.context.userProfile.communicationLevel}
- Current Topic: ${this.context.currentTopic}
- Recent Messages: ${recentMessages.length} messages`;
  }

  updateUserProfile(updates: Partial<UserProfile>): void {
    this.context.userProfile = { ...this.context.userProfile, ...updates };
  }

  private updateCurrentTopic(): void {
    const recentMessages = this.getRecentMessages(3);
    const topics = this.extractTopics();
    this.context.currentTopic = topics[0] || 'general';
  }

  private extractTopics(): string[] {
    const topics: string[] = [];
    const recentMessages = this.getRecentMessages(5);

    recentMessages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Business topics
      if (content.includes('business') || content.includes('management')) topics.push('business');
      if (content.includes('finance') || content.includes('money')) topics.push('finance');
      if (content.includes('marketing') || content.includes('sales')) topics.push('marketing');
      
      // Technology topics
      if (content.includes('programming') || content.includes('code')) topics.push('programming');
      if (content.includes('ai') || content.includes('artificial intelligence')) topics.push('ai');
      if (content.includes('data') || content.includes('analysis')) topics.push('data science');
      
      // Science topics
      if (content.includes('science') || content.includes('research')) topics.push('science');
      if (content.includes('math') || content.includes('mathematics')) topics.push('mathematics');
      if (content.includes('physics') || content.includes('chemistry')) topics.push('physics');
      
      // General topics
      if (content.includes('learn') || content.includes('education')) topics.push('learning');
      if (content.includes('problem') || content.includes('solve')) topics.push('problem solving');
      if (content.includes('creative') || content.includes('innovation')) topics.push('creativity');
    });

    return [...new Set(topics)]; // Remove duplicates
  }

  getPersonalizedPrompt(): string {
    const profile = this.context.userProfile;
    const topics = this.extractTopics();
    const recentContext = this.getConversationSummary();

    return `Based on our conversation history, I understand that:
- You're interested in: ${profile.interests.join(', ') || 'various topics'}
- Your expertise level: ${profile.communicationLevel}
- Recent topics: ${topics.join(', ') || 'general discussion'}
- Preferred style: ${profile.preferredStyle}

Please tailor your response accordingly.`;
  }

  analyzeUserExpertise(): string {
    const messages = this.getRecentMessages(10);
    const userMessages = messages.filter(m => m.role === 'user');
    
    let complexityScore = 0;
    let technicalTerms = 0;
    let questionDepth = 0;

    userMessages.forEach(message => {
      const content = message.content;
      
      // Analyze complexity indicators
      if (content.includes('advanced') || content.includes('complex')) complexityScore += 2;
      if (content.includes('basic') || content.includes('simple')) complexityScore -= 1;
      
      // Count technical terms
      const techTerms = ['algorithm', 'architecture', 'optimization', 'implementation', 'framework'];
      technicalTerms += techTerms.filter(term => content.includes(term)).length;
      
      // Analyze question depth
      if (content.includes('?')) questionDepth += 1;
      if (content.includes('how') || content.includes('why')) questionDepth += 2;
    });

    // Determine expertise level
    if (complexityScore > 5 && technicalTerms > 3) return 'expert';
    if (complexityScore > 2 && technicalTerms > 1) return 'advanced';
    if (complexityScore > 0 || questionDepth > 2) return 'intermediate';
    return 'beginner';
  }

  getContextualSuggestions(): string[] {
    const topics = this.extractTopics();
    const suggestions: string[] = [];

    if (topics.includes('business')) {
      suggestions.push("How can I improve my business strategy?");
      suggestions.push("What are the key performance indicators I should track?");
    }
    
    if (topics.includes('programming')) {
      suggestions.push("How can I optimize my code performance?");
      suggestions.push("What are the best practices for software architecture?");
    }
    
    if (topics.includes('ai')) {
      suggestions.push("How is AI changing the business landscape?");
      suggestions.push("What are the ethical considerations of AI?");
    }
    
    if (topics.includes('learning')) {
      suggestions.push("What are effective learning strategies?");
      suggestions.push("How can I improve my critical thinking skills?");
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }
}

// Global conversation memory instance
let globalConversationMemory: ConversationMemory | null = null;

export function getConversationMemory(sessionId?: string): ConversationMemory {
  if (!globalConversationMemory || (sessionId && globalConversationMemory.getContext().sessionId !== sessionId)) {
    globalConversationMemory = new ConversationMemory(sessionId || `session_${Date.now()}`);
  }
  return globalConversationMemory;
}

export function resetConversationMemory(sessionId?: string): ConversationMemory {
  globalConversationMemory = new ConversationMemory(sessionId || `session_${Date.now()}`);
  return globalConversationMemory;
}
