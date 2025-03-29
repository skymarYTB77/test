import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import '../styles/GeminiChat.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Gemini with API key
  const genAI = new GoogleGenerativeAI('AIzaSyCQ04jOofo0N5Mk_uyds3uGB7lH9so1bE8');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Start a chat session
      const chat = model.startChat();

      // Send message and get response
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Error communicating with Gemini:', error);
      let errorMessage = "Je suis désolé, mais j'ai rencontré une erreur lors du traitement de votre demande. ";
      
      if (error instanceof Error) {
        if (error.message.includes('Empty response')) {
          errorMessage += "Je n'ai pas pu générer une réponse appropriée. ";
        } else if (error.message.includes('quota')) {
          errorMessage += "Le quota d'utilisation de l'API a été atteint. ";
        } else if (error.message.includes('network')) {
          errorMessage += "Il y a eu un problème de connexion. ";
        }
      }
      
      errorMessage += "Veuillez réessayer ou reformuler votre question différemment.";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <>
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat avec Gemini"
      >
        <MessageSquare size={20} />
      </button>

      {isOpen && (
        <div className="chat-overlay">
          <div className="chat-container">
            <div className="chat-header">
              <h2>Chat avec Gemini</h2>
              <button 
                className="close-chat"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
                >
                  <div className="message-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Gemini réfléchit...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="chat-input-container">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyPress}
                placeholder="Posez votre question à Gemini..."
                rows={1}
                className="chat-input"
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}