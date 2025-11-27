import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Image as ImageIcon, Volume2, Loader2 } from 'lucide-react';
import { sendMessageToGemini, generateSpeech } from '../services/geminiService';
import { playClickSound, playSuccessSound, playMessageSound } from '../utils/soundEffects';
import { ChatMessage } from '../types';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm your Charge@Last assistant. I can help with quotes, EV questions, or analyze photos of your charger!", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Attempt to get location for maps grounding
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Location acquired for AI context");
        }, 
        (err) => console.log("Location permission denied")
      );
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    playClickSound();
    const userMsg: ChatMessage = { 
      role: 'user', 
      text: inputValue, 
      image: selectedImage || undefined,
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    // Get location for potential maps query
    let location;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => 
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      location = { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch (e) {
      // Ignore location error
    }

    const responseText = await sendMessageToGemini(messages, inputValue, userMsg.image, location);
    
    const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
    playMessageSound();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayText = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    const audioBuffer = await generateSpeech(text);
    if (audioBuffer) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.onended = () => setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => { setIsOpen(true); playClickSound(); }}
        className={`fixed bottom-24 right-4 z-40 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'bg-brand-orange text-white'
        }`}
      >
        <Sparkles className="w-6 h-6 animate-pulse-slow" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto md:w-96 z-50 flex flex-col bg-white shadow-2xl md:rounded-2xl overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'h-[85vh] md:h-[650px] translate-y-0' : 'h-0 translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <div className="bg-brand-green p-1 rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Charge AI</h3>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-400">Gemini 2.5 + 3.0 Pro</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Display Image if present */}
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="Upload" 
                  className="max-w-[200px] rounded-lg mb-2 border border-gray-200 shadow-sm"
                />
              )}

              <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-orange text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                
                {/* Read Aloud Button for Model Messages */}
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handlePlayText(msg.text)}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-brand-orange transition-colors"
                    title="Read Aloud"
                    disabled={isPlayingAudio}
                  >
                     {isPlayingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 flex space-x-1 shadow-sm">
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview before send */}
        {selectedImage && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <img src={selectedImage} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-300" />
               <span className="text-xs text-gray-500">Image attached</span>
             </div>
             <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-red-500">
               <X className="w-4 h-4" />
             </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-2">
            
            {/* Image Upload Button */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-brand-dark transition-colors"
              title="Upload Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about chargers or send a photo..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={(!inputValue.trim() && !selectedImage) || isTyping}
              className="text-brand-orange hover:text-orange-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};