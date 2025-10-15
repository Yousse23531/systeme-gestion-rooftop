import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, Send, Bot, AlertCircle, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { llmService } from "../lib/llmService";

interface FAQMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  confidence?: number;
  provider?: string;
  model?: string;
}

export function FAQ() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<FAQMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [llmStatus] = useState(llmService.getStatus());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion("");
    setIsLoading(true);
    setIsTyping(true);

    // Add user message immediately
    const userMessage: FAQMessage = {
      id: `user-${Date.now()}`,
      question: userQuestion,
      answer: "",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

        try {
          // Simulate realistic AI thinking delay like Cursor AI
          const thinkingDelay = Math.random() * 2000 + 1500; // 1.5-3.5 seconds
          await new Promise(resolve => setTimeout(resolve, thinkingDelay));

          // Use the LLM service to generate response
          const response = await llmService.generateFAQResponse(userQuestion);
      
      const aiMessage: FAQMessage = {
        id: `ai-${Date.now()}`,
        question: "",
        answer: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        provider: response.provider,
        model: response.model,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Erreur lors de la génération de la réponse");
      console.error("FAQ Error:", error);
      
      // Add error message
      const errorMessage: FAQMessage = {
        id: `error-${Date.now()}`,
        question: "",
        answer: "Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?",
        timestamp: new Date(),
        confidence: 0.1,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Focus back on input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden">
              <img src="./logo.png" alt="7ekmaAI" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            7ekmaAI
            {llmStatus.configured && (
              <Sparkles className="h-4 w-4 text-yellow-500" />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {llmStatus.configured ? (
              <>
                {llmStatus.provider?.name} - {llmStatus.provider?.model}
                {llmStatus.availableProviders.length > 1 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    +{llmStatus.availableProviders.length - 1} autres disponibles
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                Mode hors ligne
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h3 className="text-xl font-semibold mb-2">Bonjour ! Je suis 7ekmaAI 🧠✨</h3>
                <p className="text-muted-foreground mb-4 max-w-lg">
                  Je suis votre assistant IA ultra-intelligent avec des capacités de raisonnement avancées, développé par Hekmaware Dev Solutions. Je peux répondre à toutes vos questions avec une logique sophistiquée !
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-2xl">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">🧠 Raisonnement Avancé</h4>
                    <p className="text-xs text-muted-foreground">Analyse logique, résolution de problèmes, pensée critique</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">📚 Connaissance Universelle</h4>
                    <p className="text-xs text-muted-foreground">Business, technologie, sciences, sciences humaines</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">🎯 Personnalisation</h4>
                    <p className="text-xs text-muted-foreground">Adaptation à votre niveau et contexte</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-sm mb-2">💡 Créativité</h4>
                    <p className="text-xs text-muted-foreground">Solutions innovantes et approches créatives</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Posez-moi n'importe quelle question dans la langue de votre choix !
                </p>
              </div>
            )}

        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            {message.question ? (
              // User message
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%] ml-auto">
                    <p className="text-sm">{message.question}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </>
            ) : (
              // AI message
              <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                      <img src="./logo.png" alt="7ekmaAI" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">7ekmaAI</span>
                  {message.provider && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {message.provider}
                    </span>
                  )}
                  {message.confidence && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      message.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(message.confidence * 100)}%
                    </span>
                  )}
                </div>
                    <p className="text-sm whitespace-pre-line">{message.answer}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                  <img src="./logo.png" alt="7ekmaAI" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">7ekmaAI</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question à 7ekmaAI..."
            disabled={isLoading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !question.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </div>
    </div>
  );
}
