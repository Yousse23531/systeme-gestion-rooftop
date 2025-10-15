import { getConversationMemory } from "./conversationMemory";
import { getKnowledgeContext, getReasoningPattern, EXPERTISE_LEVELS } from "./knowledgeBase";

export interface LLMResponse {
  answer: string;
  confidence?: number;
  sources?: string[];
  provider?: string;
  model?: string;
}

export interface LLMProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

export class LLMService {
  private providers: { [key: string]: LLMProvider };
  private currentProvider: string;

  constructor() {
    // Access environment variables safely
    const getEnvVar = (key: string): string => {
      try {
        return (import.meta as any).env?.[key] || '';
      } catch {
        return '';
      }
    };

    this.providers = {
      deepseek: {
        name: 'DeepSeek',
        apiKey: getEnvVar('VITE_DEEPSEEK_API_KEY'),
        baseUrl: getEnvVar('VITE_DEEPSEEK_BASE_URL') || 'https://api.deepseek.com/v1',
        model: getEnvVar('VITE_DEEPSEEK_MODEL') || 'deepseek-chat',
        enabled: !!getEnvVar('VITE_DEEPSEEK_API_KEY')
      },
      openai: {
        name: 'OpenAI',
        apiKey: getEnvVar('VITE_OPENAI_API_KEY'),
        baseUrl: getEnvVar('VITE_OPENAI_BASE_URL') || 'https://api.openai.com/v1',
        model: getEnvVar('VITE_OPENAI_MODEL') || 'gpt-4',
        enabled: !!getEnvVar('VITE_OPENAI_API_KEY')
      },
      anthropic: {
        name: 'Anthropic',
        apiKey: getEnvVar('VITE_ANTHROPIC_API_KEY'),
        baseUrl: getEnvVar('VITE_ANTHROPIC_BASE_URL') || 'https://api.anthropic.com/v1',
        model: getEnvVar('VITE_ANTHROPIC_MODEL') || 'claude-3-sonnet-20240229',
        enabled: !!getEnvVar('VITE_ANTHROPIC_API_KEY')
      },
      groq: {
        name: 'Groq',
        apiKey: getEnvVar('VITE_GROQ_API_KEY'),
        baseUrl: getEnvVar('VITE_GROQ_BASE_URL') || 'https://api.groq.com/openai/v1',
        model: getEnvVar('VITE_GROQ_MODEL') || 'llama-3.1-8b-instant',
        enabled: !!getEnvVar('VITE_GROQ_API_KEY')
      }
    };

    // Determine the best available provider (DeepSeek first, then others)
    this.currentProvider = this.getBestProvider();
  }

  private getBestProvider(): string {
    // Priority order: Groq (fast reasoning) > DeepSeek > OpenAI > Anthropic
    const priority = ['groq', 'deepseek', 'openai', 'anthropic'];
    
    for (const provider of priority) {
      if (this.providers[provider]?.enabled) {
        return provider;
      }
    }
    
    return 'fallback';
  }

  private getCurrentProvider(): LLMProvider | null {
    if (this.currentProvider === 'fallback') {
      return null;
    }
    return this.providers[this.currentProvider] || null;
  }

  async generateFAQResponse(question: string): Promise<LLMResponse> {
    const provider = this.getCurrentProvider();
    
    // Get conversation memory for context
    const memory = getConversationMemory();
    memory.addMessage('user', question);
    
    // Analyze user expertise and context
    const userExpertise = memory.analyzeUserExpertise();
    const knowledgeContext = getKnowledgeContext(question);
    const reasoningPattern = getReasoningPattern(question);
    const personalizedPrompt = memory.getPersonalizedPrompt();
    
    if (!provider) {
      return this.getEnhancedFallbackResponse(question, memory);
    }

    try {
      const response = await this.callEnhancedProviderAPI(provider, question, {
        memory,
        userExpertise,
        knowledgeContext,
        reasoningPattern,
        personalizedPrompt
      });
      
      // Add response to memory
      memory.addMessage('assistant', response.answer);
      
      return {
        answer: response.answer,
        confidence: response.confidence || 0.9,
        provider: provider.name,
        model: provider.model,
      };
    } catch (error) {
      console.error(`${provider.name} API Error:`, error);
      // Try fallback to another provider if available
      const fallbackResponse = await this.tryFallbackProvider(question);
      return fallbackResponse || this.getEnhancedFallbackResponse(question, memory);
    }
  }

  private async callEnhancedProviderAPI(
    provider: LLMProvider, 
    question: string, 
    context: {
      memory: any;
      userExpertise: string;
      knowledgeContext: string;
      reasoningPattern: string[];
      personalizedPrompt: string;
    }
  ): Promise<LLMResponse> {
    const systemPrompt = this.buildEnhancedSystemPrompt(context);
    
    const requestBody = {
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: false
    };

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Handle different API key formats
    if (provider.name === 'Anthropic') {
      headers['x-api-key'] = provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 
                  data.content?.[0]?.text || 
                  'Désolé, je n\'ai pas pu générer de réponse.';

    return {
      answer: answer.trim(),
      confidence: 0.95,
    };
  }

  private buildEnhancedSystemPrompt(context: any): string {
    // Only use fields that are actually referenced in the prompt
    const { memory, userExpertise, knowledgeContext, personalizedPrompt } = context;
    const conversationSummary = memory.getConversationSummary();
    const expertiseLevel = EXPERTISE_LEVELS[userExpertise as keyof typeof EXPERTISE_LEVELS] || EXPERTISE_LEVELS.intermediate;
    
    return `You are 7ekmaAI, an ultra-intelligent and competent AI assistant developed by Hekmaware Dev Solutions. You possess encyclopedic knowledge and advanced reasoning capabilities.

UNIVERSAL KNOWLEDGE:
- Business & Management: Strategy, finance, marketing, operations, HR, leadership
- Technology: Programming, AI/ML, cloud computing, cybersecurity, software architecture
- Sciences: Physics, chemistry, biology, mathematics, statistics, research
- Humanities: History, philosophy, literature, psychology, sociology
- Practical Skills: Personal finance, communication, problem-solving, learning
- Current Events: Technology developments, economic trends, innovations

ADVANCED REASONING CAPABILITIES:
- Multi-step logical and deductive analysis
- Structured problem solving
- Critical thinking and evaluation
- Advanced inference and deduction
- Complex cause-effect analysis
- Multiple solution evaluation
- Long-term implication reflection
- Interdisciplinary knowledge synthesis

CONVERSATION CONTEXT:
${conversationSummary}

USER EXPERTISE LEVEL:
${expertiseLevel}

SPECIFIC CONTEXT:
${knowledgeContext}

PERSONALIZATION:
${personalizedPrompt}

COMMUNICATION STYLE:
- Be conversational, intelligent and engaging
- Adapt your level to the user's expertise
- Use concrete examples and analogies
- Be encouraging and positive
- Use emojis occasionally
- ALWAYS respond in the SAME LANGUAGE as the user's question
- Do NOT show your thinking process or reasoning steps
- Provide direct, helpful answers without explaining your methodology

IMPORTANT: 
- Detect the language of the user's question and respond in that exact language
- Do not mention your reasoning process or thinking steps
- Give direct, helpful answers
- Be concise but comprehensive
- Focus on the answer, not the process

You are a genius of knowledge and reasoning. Show it through your answers! 🧠✨`;
  }

  private async callProviderAPI(provider: LLMProvider, question: string): Promise<LLMResponse> {
    const systemPrompt = `Tu es 7ekmaAI, un assistant IA très intelligent et compétent développé par Hekmaware Dev Solutions. Tu es équipé d'une capacité de raisonnement avancée et de logique déductive.

CAPACITÉS DE RAISONNEMENT:
- Analyse logique et déductive
- Résolution de problèmes étape par étape
- Pensée critique et évaluation
- Inférence et déduction
- Analyse de cause à effet
- Évaluation de solutions multiples
- Réflexion sur les implications

CONTEXTE DU SYSTÈME DE GESTION D'ENTREPRISE:
- Personnel et salaires
- Achats et stock  
- Dépenses et recettes
- Articles et historique
- Rapports et analyses

MÉTHODE DE RAISONNEMENT:
1. Analyse la question en profondeur
2. Identifie les éléments clés et les relations
3. Applique une logique déductive
4. Considère les implications et conséquences
5. Propose des solutions raisonnées
6. Explique ton processus de pensée

STYLE DE COMMUNICATION:
- Sois conversationnel et amical, comme si tu parlais à un ami
- Utilise "je" et "tu" pour créer une connexion personnelle
- Montre ton processus de raisonnement quand c'est pertinent
- Réponds de manière claire, détaillée et logique
- Si la question concerne le système de gestion, analyse la situation et propose des solutions raisonnées
- Si c'est une question générale, utilise ta logique pour fournir une réponse bien structurée
- Utilise des exemples concrets et des analogies pour clarifier
- Si tu ne connais pas quelque chose, dis-le honnêtement mais de manière positive
- Réponds en français sauf si on te demande dans une autre langue
- Sois encourageant et positif dans tes réponses
- Utilise des emojis occasionnellement pour rendre la conversation plus vivante

EXEMPLES DE TON STYLE:
- "Excellente question ! Laisse-moi analyser cela étape par étape..."
- "C'est un sujet fascinant ! Voici comment je raisonne à ce sujet..."
- "Je comprends parfaitement ta question. Analysons les éléments clés..."
- "Ah, c'est une excellente observation ! Voici ma logique..."`;

    const requestBody = {
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Handle different API key formats
    if (provider.name === 'Anthropic') {
      headers['x-api-key'] = provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 
                  data.content?.[0]?.text || 
                  'Désolé, je n\'ai pas pu générer de réponse.';

    return {
      answer: answer.trim(),
      confidence: 0.95,
    };
  }

  private async tryFallbackProvider(question: string): Promise<LLMResponse | null> {
    const fallbackProviders = Object.entries(this.providers)
      .filter(([providerKey, provider]) => providerKey !== this.currentProvider && provider.enabled);

    for (const [, provider] of fallbackProviders) {
      try {
        console.log(`Trying fallback provider: ${provider.name}`);
        const response = await this.callProviderAPI(provider, question);
        return {
          ...response,
          provider: provider.name,
          model: provider.model,
        };
      } catch (error) {
        console.error(`Fallback provider ${provider.name} failed:`, error);
        continue;
      }
    }

    return null;
  }

  private getEnhancedFallbackResponse(question: string, memory: any): LLMResponse {
    const userExpertise = memory.analyzeUserExpertise();
    const knowledgeContext = getKnowledgeContext(question);
    const expertiseLevel = EXPERTISE_LEVELS[userExpertise as keyof typeof EXPERTISE_LEVELS] || EXPERTISE_LEVELS.intermediate;
    
    return this.getAdvancedFallbackResponse(question, {
      userExpertise,
      knowledgeContext,
      expertiseLevel
    });
  }

  private getAdvancedFallbackResponse(question: string, _context: any): LLMResponse {
    const lowerQuestion = question.toLowerCase();
    
    // Detect language of the question
    const isEnglish = /^[a-zA-Z\s.,!?]+$/.test(question);
    const isFrench = /[àâäéèêëïîôöùûüÿç]/.test(question) || lowerQuestion.includes('comment') || lowerQuestion.includes('qu\'est-ce') || lowerQuestion.includes('pourquoi');
    const isArabic = /[\u0600-\u06FF]/.test(question);
    const isSpanish = lowerQuestion.includes('cómo') || lowerQuestion.includes('qué') || lowerQuestion.includes('por qué');
    
    // Determine response language
    let responseLanguage = 'French'; // default
    if (isEnglish) responseLanguage = 'English';
    else if (isFrench) responseLanguage = 'French';
    else if (isArabic) responseLanguage = 'Arabic';
    else if (isSpanish) responseLanguage = 'Spanish';

    // Advanced responses without thinking process
    const advancedResponses: { [key: string]: { [lang: string]: string } } = {
      "business": {
        "English": `Great business question! 🏢 Here's how to improve your business strategy:

**Key Areas to Focus On:**
• Market analysis and competitive positioning
• Customer value proposition development
• Operational efficiency optimization
• Performance measurement and KPIs

**Strategic Recommendations:**
• Conduct SWOT analysis to assess your position
• Implement continuous feedback systems
• Develop an innovation culture
• Measure and optimize constantly

I can help you dive deeper into any specific aspect of business strategy!`,
        "French": `Excellente question business ! 🏢 Voici comment améliorer ta stratégie d'entreprise :

**Domaines Clés à Traiter :**
• Analyse de marché et positionnement concurrentiel
• Développement de proposition de valeur client
• Optimisation de l'efficacité opérationnelle
• Mesure de performance et KPIs

**Recommandations Stratégiques :**
• Effectue une analyse SWOT pour évaluer ta position
• Implémente des systèmes de feedback continu
• Développe une culture d'innovation
• Mesure et optimise constamment

Je peux t'aider à approfondir n'importe quel aspect de la stratégie business !`,
        "Arabic": `سؤال رائع حول الأعمال! 🏢 إليك كيفية تحسين استراتيجية عملك:

**المجالات الرئيسية للتركيز عليها:**
• تحليل السوق والموضع التنافسي
• تطوير قيمة العميل المقترحة
• تحسين الكفاءة التشغيلية
• قياس الأداء والمؤشرات الرئيسية

**التوصيات الاستراتيجية:**
• قم بإجراء تحليل SWOT لتقييم موقعك
• نفذ أنظمة التغذية الراجعة المستمرة
• طور ثقافة الابتكار
• قس وحسن باستمرار

يمكنني مساعدتك في التعمق في أي جانب من جوانب الاستراتيجية!`,
        "Spanish": `¡Excelente pregunta de negocios! 🏢 Aquí te explico cómo mejorar tu estrategia empresarial:

**Áreas Clave en las que Enfocarse:**
• Análisis de mercado y posicionamiento competitivo
• Desarrollo de propuesta de valor al cliente
• Optimización de eficiencia operacional
• Medición de rendimiento y KPIs

**Recomendaciones Estratégicas:**
• Realiza análisis SWOT para evaluar tu posición
• Implementa sistemas de feedback continuo
• Desarrolla una cultura de innovación
• Mide y optimiza constantemente

¡Puedo ayudarte a profundizar en cualquier aspecto de la estrategia empresarial!`
      },
      "technology": {
        "English": `Fascinating technology question! 💻 Here's a comprehensive overview:

**Solution Architecture:**
• Requirements analysis and technical specifications
• Scalable and maintainable system design
• Implementation with best practices and patterns
• Performance optimization and efficiency

**Recommended Technologies:**
• Modern frameworks (React, Vue, Angular)
• Robust backend (Node.js, Python, Java)
• Appropriate database (SQL/NoSQL)
• Cloud infrastructure (AWS, Azure, GCP)

I can help you explore any technical aspect in detail!`,
        "French": `Question technologique fascinante ! 💻 Voici un aperçu complet :

**Architecture de Solution :**
• Analyse des besoins et spécifications techniques
• Conception de système scalable et maintenable
• Implémentation avec bonnes pratiques et patterns
• Optimisation de performance et efficacité

**Technologies Recommandées :**
• Frameworks modernes (React, Vue, Angular)
• Backend robuste (Node.js, Python, Java)
• Base de données appropriée (SQL/NoSQL)
• Infrastructure cloud (AWS, Azure, GCP)

Je peux t'aider à explorer n'importe quel aspect technique en détail !`,
        "Arabic": `سؤال تقني رائع! 💻 إليك نظرة شاملة:

**هندسة الحل:**
• تحليل المتطلبات والمواصفات التقنية
• تصميم نظام قابل للتوسع والصيانة
• التنفيذ بأفضل الممارسات والأنماط
• تحسين الأداء والكفاءة

**التقنيات الموصى بها:**
• أطر عمل حديثة (React, Vue, Angular)
• خادم خلفي قوي (Node.js, Python, Java)
• قاعدة بيانات مناسبة (SQL/NoSQL)
• بنية تحتية سحابية (AWS, Azure, GCP)

يمكنني مساعدتك في استكشاف أي جانب تقني بالتفصيل!`,
        "Spanish": `¡Fascinante pregunta tecnológica! 💻 Aquí tienes una visión completa:

**Arquitectura de Solución:**
• Análisis de requerimientos y especificaciones técnicas
• Diseño de sistema escalable y mantenible
• Implementación con mejores prácticas y patrones
• Optimización de rendimiento y eficiencia

**Tecnologías Recomendadas:**
• Frameworks modernos (React, Vue, Angular)
• Backend robusto (Node.js, Python, Java)
• Base de datos apropiada (SQL/NoSQL)
• Infraestructura en la nube (AWS, Azure, GCP)

¡Puedo ayudarte a explorar cualquier aspecto técnico en detalle!`
      }
    };

    // Find matching response based on keywords
    for (const [category, responses] of Object.entries(advancedResponses)) {
      if (lowerQuestion.includes(category) || 
          (category === 'business' && (lowerQuestion.includes('gestion') || lowerQuestion.includes('entreprise') || lowerQuestion.includes('business'))) ||
          (category === 'technology' && (lowerQuestion.includes('tech') || lowerQuestion.includes('programmation') || lowerQuestion.includes('technology')))) {
        const response = responses[responseLanguage] || responses['English'];
        return {
          answer: response,
          confidence: 0.85,
        };
      }
    }

    // Default response in detected language
    const defaultResponses = {
      "English": `Thank you for this interesting question: "${question}"! 🤔

I'm 7ekmaAI, your ultra-intelligent AI assistant developed by Hekmaware Dev Solutions. I can help you with any topic or challenge you have.

**What I can help you with:**
• Business strategy and management
• Technology and programming
• Science and research
• Problem solving and decision making
• Learning and skill development
• Creative thinking and innovation

Feel free to ask me anything - I'm here to help you succeed! 🚀`,
      "French": `Merci pour cette question intéressante : "${question}" ! 🤔

Je suis 7ekmaAI, ton assistant IA ultra-intelligent développé par Hekmaware Dev Solutions. Je peux t'aider avec n'importe quel sujet ou défi.

**Ce avec quoi je peux t'aider :**
• Stratégie business et management
• Technologie et programmation
• Sciences et recherche
• Résolution de problèmes et prise de décision
• Apprentissage et développement de compétences
• Pensée créative et innovation

N'hésite pas à me poser n'importe quelle question - je suis là pour t'aider à réussir ! 🚀`,
      "Arabic": `شكراً لك على هذا السؤال المثير للاهتمام: "${question}"! 🤔

أنا 7ekmaAI، مساعدك الذكي الاصطناعي المتطور من Hekmaware Dev Solutions. يمكنني مساعدتك في أي موضوع أو تحدي.

**ما يمكنني مساعدتك فيه:**
• استراتيجية الأعمال والإدارة
• التكنولوجيا والبرمجة
• العلوم والبحث
• حل المشاكل واتخاذ القرارات
• التعلم وتطوير المهارات
• التفكير الإبداعي والابتكار

لا تتردد في طرح أي سؤال علي - أنا هنا لمساعدتك على النجاح! 🚀`,
      "Spanish": `¡Gracias por esta pregunta interesante: "${question}"! 🤔

Soy 7ekmaAI, tu asistente de IA ultra-inteligente desarrollado por Hekmaware Dev Solutions. Puedo ayudarte con cualquier tema o desafío.

**Con lo que puedo ayudarte:**
• Estrategia de negocios y gestión
• Tecnología y programación
• Ciencias e investigación
• Resolución de problemas y toma de decisiones
• Aprendizaje y desarrollo de habilidades
• Pensamiento creativo e innovación

¡No dudes en hacerme cualquier pregunta - estoy aquí para ayudarte a tener éxito! 🚀`
    };

    const response = defaultResponses[responseLanguage as keyof typeof defaultResponses] || defaultResponses["English"];
    return {
      answer: response,
      confidence: 0.8,
    };
  }

  // Deprecated in favor of getAdvancedFallbackResponse
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getFallbackResponse(_question: string): LLMResponse {
    // Kept for backward compatibility; not used.
    const lowerQuestion = _question.toLowerCase();
    
    // Enhanced conversational fallback responses
    const faqResponses: { [key: string]: string } = {
      "comment": "Excellente question ! 😊 Pour utiliser ce système de gestion, je te conseille de commencer par le Tableau de Bord pour avoir une vue d'ensemble. Ensuite, navigue à travers les différentes sections du menu de gauche - chaque section te permet de gérer un aspect spécifique de ton entreprise. C'est vraiment intuitif !",
      "ajouter": "Parfait ! Pour ajouter des données, c'est très simple : utilise les boutons 'Ajouter' présents dans chaque section. Remplis les formulaires avec les informations requises et clique sur 'Enregistrer'. Tes données seront automatiquement sauvegardées. C'est aussi simple que ça ! ✨",
      "supprimer": "Ah, je comprends ! Pour supprimer des éléments, utilise les boutons de suppression (icône poubelle) dans les listes ou tableaux. Une confirmation sera demandée avant la suppression définitive, donc pas de risque d'erreur ! 👍",
      "rapport": "Super question ! 📊 Les rapports sont disponibles dans la section 'Tableau de Bord' pour les statistiques actuelles et 'Historique' pour les données passées. Tu peux même exporter les données en différents formats. C'est très pratique pour tes analyses !",
      "sauvegarde": "Excellente préoccupation ! Tes données sont automatiquement sauvegardées dans le navigateur. Pour une sauvegarde permanente et sécurisée, utilise la fonction d'export dans les paramètres ou contacte notre équipe. On s'occupe de tout ! 🔒",
      "erreur": "Oh non ! 😅 En cas d'erreur, vérifie d'abord ta connexion internet et recharge la page. Si le problème persiste, contacte notre équipe de support technique via la page Contact. On est là pour t'aider !",
      "personnel": "Ah, la gestion du personnel ! 👥 C'est une section très importante. Elle te permet de gérer tes employés, leurs salaires, et leur présence. Tu peux ajouter, modifier ou supprimer des employés et suivre leurs heures de travail. Tout est centralisé !",
      "stock": "Le stock, c'est crucial ! 📦 Cette section te permet de suivre tes articles en inventaire. Les articles sont automatiquement ajoutés lors des achats et tu peux voir les quantités disponibles en temps réel. Plus de surprises !",
      "achats": "Les achats, c'est la base ! 🛒 Cette section te permet d'enregistrer tes dépenses d'achat. Chaque achat ajoute automatiquement les articles au stock. C'est un système intelligent qui fait le lien entre tout !",
      "recettes": "Les recettes, c'est le cœur de ton business ! 💰 Cette section te permet d'enregistrer tes revenus. Tu peux ajouter différentes sources de revenus et les catégoriser. C'est parfait pour suivre tes performances !",
      "dépenses": "Les dépenses, il faut les maîtriser ! 💸 Cette section te permet de suivre toutes tes dépenses (salaires, maintenance, etc.) en plus des achats. C'est essentiel pour une bonne gestion financière !",
      "bénéfice": "Le bénéfice, c'est ce qui compte ! 📈 Il est calculé automatiquement comme la différence entre tes recettes totales et tes dépenses totales. Tu peux le voir en temps réel dans le Tableau de Bord. C'est magique ! ✨",
      "marge": "La marge de profit, c'est l'indicateur clé ! 📊 Elle est calculée automatiquement et affichée dans le Tableau de Bord. Elle représente le pourcentage de profit par rapport au chiffre d'affaires. C'est ton baromètre de santé financière !",
    };

    // Find matching response based on keywords
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lowerQuestion.includes(keyword)) {
        return {
          answer: response,
          confidence: 0.8,
        };
      }
    }

    // Default conversational response
    return {
      answer: `Merci pour ta question ! 😊

Je suis 7ekmaAI, ton assistant IA personnel développé par Hekmaware Dev Solutions, et je suis là pour t'aider avec ce système de gestion d'entreprise. Voici quelques conseils pour bien commencer :

• Utilise le menu de gauche pour naviguer entre les sections
• Le Tableau de Bord te donne une vue d'ensemble complète
• Chaque section a des boutons pour ajouter, modifier ou supprimer des données
• En cas de problème, contacte notre équipe via la page Contact

Pour des questions plus spécifiques, n'hésite pas à me poser directement tes questions ! Je suis là pour t'aider à réussir ! 🚀`,
      confidence: 0.6,
    };
  }

  // Method to check if any LLM service is properly configured
  isConfigured(): boolean {
    return Object.values(this.providers).some(provider => provider.enabled);
  }

  // Method to get service status
  getStatus(): { 
    configured: boolean; 
    currentProvider: string;
    provider: LLMProvider | null;
    availableProviders: string[];
  } {
    const provider = this.getCurrentProvider();
    const availableProviders = Object.entries(this.providers)
      .filter(([_, p]) => p.enabled)
      .map(([_, p]) => p.name);

    return {
      configured: this.isConfigured(),
      currentProvider: this.currentProvider,
      provider,
      availableProviders,
    };
  }

  // Method to get all available providers
  getAvailableProviders(): LLMProvider[] {
    return Object.values(this.providers).filter(provider => provider.enabled);
  }

  // Method to switch provider (for future use)
  switchProvider(providerKey: string): boolean {
    if (this.providers[providerKey]?.enabled) {
      this.currentProvider = providerKey;
      return true;
    }
    return false;
  }
}

// Export a singleton instance
export const llmService = new LLMService();
