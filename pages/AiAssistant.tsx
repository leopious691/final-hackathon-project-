import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';
import Input from '../components/Input';
import Button from '../components/Button';

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hi! I am your Campus Blood Assistant. Ask me anything about donating blood, eligibility, or how the app works.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const botResponse = await chatWithAssistant(userMsg);
    
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2 text-2xl">🤖</span> AI Helper
        </h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-red-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex space-x-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-black focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all"
            placeholder="Type your question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="w-auto px-4 !rounded-xl" 
            isLoading={loading}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;