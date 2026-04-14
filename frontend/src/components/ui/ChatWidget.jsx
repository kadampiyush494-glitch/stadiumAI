import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from 'lucide-react';
import { callAssistant } from '../../lib/aiService';
import VoiceInput from './VoiceInput';

export default function ChatWidget({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am OmniFlow, your stadium navigation assistant. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Keyboard shortcut (Ctrl+/)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleSend = async (query = input) => {
    if (!query.trim() || isLoading) return;

    const userMessage = { role: 'user', content: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const reply = await callAssistant(query, context);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (text) => {
    setInput(text);
    handleSend(text);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant (Ctrl+/)"}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 p-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-colors z-50 focus:outline-none focus:ring-4 focus:ring-cyan-300"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Slide-up Panel */}
      <div
        ref={panelRef}
        aria-hidden={!isOpen}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(120%)', opacity: isOpen ? 1 : 0 }}
        className="fixed bottom-24 right-6 w-80 lg:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 overflow-hidden"
      >
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-cyan-400 font-semibold text-lg flex items-center">
            <MessageSquare size={18} className="mr-2" /> OmniFlow AI
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close panel">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-slate-900" aria-live="polite">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex justify-start" aria-busy="true">
              <div className="p-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-tl-sm flex space-x-2 items-center">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 <span className="sr-only">AI is evaluating...</span>
              </div>
            </div>
          )}
          {error && <div className="text-red-400 text-xs text-center mt-2 mb-2" role="alert">{error}</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-slate-700 bg-slate-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-2"
          >
            <VoiceInput onSpeechResult={handleVoiceInput} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask OmniFlow..."
              aria-label="Ask OmniFlow"
              className="flex-1 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-full px-4 py-2 focus:outline-none focus:border-cyan-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
