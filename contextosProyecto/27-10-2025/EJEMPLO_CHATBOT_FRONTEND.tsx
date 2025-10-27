// components/ChatbotWidget.tsx
// Componente de chatbot flotante para React/Next.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggested_actions?: Array<{
    label: string;
    url: string;
    type: string;
    icon?: string;
  }>;
  related_resources?: Array<{
    title: string;
    description: string;
    url: string;
    type: string;
  }>;
  created_at: string;
}

interface ChatbotWidgetProps {
  userRole: 'admin' | 'employee' | 'manager' | 'customer';
  apiBaseUrl?: string;
}

export default function ChatbotWidget({ 
  userRole, 
  apiBaseUrl = 'http://localhost:8000/api' 
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar sugerencias y acciones rápidas al abrir
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
      loadQuickActions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiBaseUrl}/assistant/suggestions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadQuickActions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiBaseUrl}/assistant/quick-actions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuickActions(response.data.quick_actions);
    } catch (error) {
      console.error('Error loading quick actions:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${apiBaseUrl}/assistant/chat/`,
        {
          message: text,
          conversation_id: conversationId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { conversation_id, message } = response.data;
      setConversationId(conversation_id);
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Mostrar mensaje de error
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    sendMessage(suggestion);
  };

  const getRoleBadge = () => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-purple-500' },
      employee: { label: 'Cajero', color: 'bg-blue-500' },
      manager: { label: 'Gerente', color: 'bg-green-500' },
      customer: { label: 'Cliente', color: 'bg-gray-500' }
    };
    const badge = badges[userRole];
    return (
      <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </span>
    );
  };

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50"
          title="Abrir Asistente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {/* Badge de notificación */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            ?
          </span>
        </button>
      )}

      {/* Widget de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">Asistente Virtual</h3>
                <p className="text-xs opacity-90">Siempre listo para ayudar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getRoleBadge()}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Acciones Rápidas */}
          {quickActions.length > 0 && messages.length === 0 && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Acciones Rápidas:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.slice(0, 4).map((action, idx) => (
                  <a
                    key={idx}
                    href={action.url}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <span>{action.label.split(' ')[0]}</span>
                    <span className="truncate">{action.label.split(' ').slice(1).join(' ')}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-lg font-semibold">¡Hola! ¿En qué puedo ayudarte?</p>
                <p className="text-sm mt-2">Pregunta cualquier cosa sobre el sistema</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {/* Contenido del mensaje */}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Acciones Sugeridas */}
                    {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.suggested_actions.map((action, idx) => (
                          <a
                            key={idx}
                            href={action.url}
                            className="block bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-xs font-medium transition"
                          >
                            {action.label}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Recursos Relacionados */}
                    {msg.related_resources && msg.related_resources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                        <p className="text-xs font-semibold opacity-70">Recursos:</p>
                        {msg.related_resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            className="block bg-white/50 hover:bg-white px-2 py-2 rounded text-xs transition"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs opacity-70">{resource.description}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias */}
          {suggestions.length > 0 && messages.length === 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Sugerencias:</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Pulsa Enter para enviar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
