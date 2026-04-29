'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Bot, User, Loader2, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  sources?: { id: string; title: string }[];
}

export function AIAssistant({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hola, soy tu asistente de inteligencia documental. Puedo ayudarte a encontrar información en tus contratos, normativas ISO y reportes técnicos. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [providerStatus, setProviderStatus] = useState<'openrouter' | 'deepseek' | 'unknown'>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkAIHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/health');
      const data = await response.json();
      setProviderStatus(data.providers.openrouter ? 'openrouter' : 'deepseek');
    } catch (error) {
      setProviderStatus('unknown');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        checkAIHealth();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkAIHealth]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: currentInput, 
          orgId: orgId 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al procesar la consulta');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, asegúrate de estar conectado o intenta de nuevo en unos momentos.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all z-50 group"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
            AI
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Asistente IA
                </h3>
                {providerStatus !== 'unknown' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border border-white/20 capitalize ${
                    providerStatus === 'openrouter' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {providerStatus === 'openrouter' ? 'Online' : 'Fallback'}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2",
                  msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                  msg.type === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-white text-gray-500 border border-gray-100"
                )}>
                  {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                  msg.type === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                )}>
                  <p className="leading-relaxed">{msg.content}</p>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fuentes Consultadas</p>
                      {msg.sources.map(source => (
                        <a 
                          key={source.id} 
                          href={`/documents/${source.id}`}
                          className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium group"
                        >
                          <FileText size={12} className="shrink-0" />
                          <span className="truncate group-hover:underline">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  
                  <p className={cn(
                    "text-[10px] mt-1 opacity-50",
                    msg.type === 'user' ? "text-right" : "text-left"
                  )}>
                    {mounted && msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-gray-500 font-medium">Analizando documentos...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Pregunta sobre tus contratos o normativas..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              DeepSeek AI puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
