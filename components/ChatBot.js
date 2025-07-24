"use client";
import React, { useState, useEffect } from 'react';
import { MessageCircleIcon, X, Send, Loader2 } from 'lucide-react';
import { BorderBeam } from './ui/border-beam';

const PollutionChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello!", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setIsLoading(false);
      return data.response || "I couldn't find specific information about that pollution topic.";
    } catch (error) {
      setIsLoading(false);
      return "I'm having trouble processing your query about pollution.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiResponseText = await generateResponse(input);
    const aiMessage = { text: aiResponseText, sender: 'ai' };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="fixed bottom-4 right-20 z-50">
      {!isOpen && (
        <div className="relative group">
      <button
      onClick={()=>{setIsOpen(true)}}
      className="w-12 h-12 rounded-full border-none bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:animate-[jello_0.7s]">
      <MessageCircleIcon size={24} />
<BorderBeam size={250} duration={2} />

      </button>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400 to-red-500 text-white text-xs px-2 py-1 rounded-md transition-all duration-300">
        Chat
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-red-500 rotate-45"></span>
      </span>
    </div>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-20 w-80 h-[500px] bg-white rounded-lg shadow-xl border border-black flex flex-col">
          <div className="bg-purple-500 text-black p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-bold">Chatbot</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === 'user' 
                  ? 'bg-green-100 text-purple-800 ml-auto' 
                  : 'bg-gray-100 text-gray-800 mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="p-2 bg-gray-100 text-gray-800 rounded-lg flex items-center">
                <Loader2 className="mr-2 animate-spin" size={20} />
                Generating response...
              </div>
            )}
          </div>

          <div className="p-3 border-t flex">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Anything..."
              className="flex-grow p-2 border rounded-l-lg text-black"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="bg-purple-500 text-black px-3 rounded-r-lg"
              disabled={isLoading}
            >
              <Send  size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionChatbot;
