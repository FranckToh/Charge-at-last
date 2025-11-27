import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Music, Mic, Phone, Grid, Battery, Wifi, 
  X, Zap, Play, Pause, SkipForward, SkipBack, Bell, Home, Settings,
  MessageSquare, Sparkles, Volume2, Loader2, Send
} from 'lucide-react';
import { LiveTracking } from './LiveTracking';
import { Job, Technician, DashboardNotification } from '../types';
import { summarizeMessage, generateSmartReplies, generateSpeech } from '../services/geminiService';
import { playMessageSound, playSuccessSound } from '../utils/soundEffects';

interface CarDashboardProps {
  activeJob: Job;
  activeTech: Technician;
  onExit: () => void;
  onVoiceAssistant: () => void;
}

export const CarDashboard: React.FC<CarDashboardProps> = ({ 
  activeJob, 
  activeTech, 
  onExit,
  onVoiceAssistant 
}) => {
  const [view, setView] = useState<'home' | 'apps' | 'maps'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notification / Gemini State
  const [notification, setNotification] = useState<DashboardNotification | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate an incoming long message after 5 seconds to demonstrate Gemini capabilities
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification({
        id: 'msg-1',
        sender: 'Dispatch (Sarah)',
        text: "Hey, slight change of plans. The client at 123 Battery St just called. They want a full 80% charge instead of the original 40% requested. Also, can you please check their tire pressure while you wait? Let me know if you have the gauge.",
        timestamp: new Date()
      });
      playMessageSound();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSummarize = async () => {
    if (!notification) return;
    setIsProcessingAI(true);
    
    // 1. Get Summary
    const summary = await summarizeMessage(notification.text);
    
    // 2. Get Smart Replies
    const replies = await generateSmartReplies(notification.text);

    setNotification(prev => prev ? { ...prev, summary, smartReplies: replies } : null);
    setIsProcessingAI(false);

    // 3. Auto-play the summary
    handlePlayTTS(summary);
  };

  const handlePlayTTS = async (text: string) => {
    if (isPlayingTTS) return;
    setIsPlayingTTS(true);
    const audioBuffer = await generateSpeech(text);
    if (audioBuffer) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.onended = () => setIsPlayingTTS(false);
    } else {
      setIsPlayingTTS(false);
    }
  };

  const handleReply = (reply: string) => {
    playSuccessSound();
    // Clear notification after "sending"
    setTimeout(() => {
      setNotification(null);
    }, 500);
  };

  const SidebarIcon = ({ icon: Icon, active, onClick, notification: hasDot }: any) => (
    <button 
      onClick={onClick}
      className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
        active 
          ? 'bg-gray-700 text-brand-orange shadow-lg shadow-orange-900/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6 md:w-7 md:h-7" />
      {hasDot && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
      )}
    </button>
  );

  const AppIcon = ({ icon: Icon, label, color, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center space-y-2 group"
    >
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95 ${color}`}>
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
      <span className="text-white font-medium text-sm md:text-base tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row text-white overflow-hidden selection:bg-brand-orange">
      
      {/* SIDEBAR / BOTTOM BAR (Navigation) */}
      <div className="order-2 md:order-1 h-20 md:h-full w-full md:w-24 bg-gray-900 flex md:flex-col items-center justify-between px-6 md:px-0 md:py-8 border-t md:border-t-0 md:border-r border-gray-800 z-50">
        <div className="flex md:flex-col items-center space-x-8 md:space-x-0 md:space-y-8 w-full md:w-auto justify-center md:justify-start">
          <SidebarIcon 
            icon={Grid} 
            active={view === 'apps'} 
            onClick={() => setView(view === 'apps' ? 'home' : 'apps')} 
          />
          <SidebarIcon 
            icon={Home} 
            active={view === 'home'} 
            onClick={() => setView('home')} 
          />
          <SidebarIcon 
            icon={MapPin} 
            active={view === 'maps'} 
            onClick={() => setView('maps')} 
          />
          <SidebarIcon 
            icon={Bell} 
            notification={!!notification}
            onClick={() => {}} 
          />
        </div>
        
        <div className="hidden md:flex flex-col items-center space-y-6">
          <button onClick={onVoiceAssistant} className="w-14 h-14 bg-gradient-to-tr from-brand-orange to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
            <Mic className="w-6 h-6 text-white" />
          </button>
          <div className="flex flex-col items-center space-y-1">
             <Battery className="w-5 h-5 text-green-500" />
             <span className="text-xs font-mono">82%</span>
          </div>
          <button onClick={onExit} className="text-gray-500 hover:text-white">
             <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile-only Extra Controls */}
        <div className="md:hidden flex items-center space-x-4">
           <button onClick={onVoiceAssistant} className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center">
             <Mic className="w-5 h-5 text-white" />
           </button>
           <button onClick={onExit} className="text-gray-500">
             <X className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="order-1 md:order-2 flex-1 relative bg-black p-4 md:p-6 overflow-hidden flex flex-col">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-6 px-2">
           <div className="flex items-center space-x-4">
              <span className="text-4xl font-light tracking-tight">{formatTime(currentTime)}</span>
              <div className="flex items-center space-x-2 text-gray-400 text-sm border-l border-gray-700 pl-4">
                 <Wifi className="w-4 h-4" />
                 <span>5G</span>
                 <span>•</span>
                 <span>72°F</span>
              </div>
           </div>
           <div className="flex items-center space-x-2">
              <div className="bg-gray-800 px-4 py-1.5 rounded-full flex items-center space-x-2">
                 <Zap className="w-4 h-4 text-brand-orange" fill="currentColor" />
                 <span className="text-sm font-semibold">Ready to Charge</span>
              </div>
           </div>
        </div>

        {/* VIEW: HOME (Split Screen) */}
        {view === 'home' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-20 md:pb-0">
            {/* Primary Map Tile (2/3 width) */}
            <div className="md:col-span-2 bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800 group">
               <LiveTracking job={activeJob} technician={activeTech} className="h-full w-full opacity-90 group-hover:opacity-100 transition-opacity" />
               
               {/* Overlay Controls */}
               <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-3">
                  <Navigation className="w-5 h-5 text-brand-orange" />
                  <div>
                     <p className="text-xs text-gray-400">Heading to</p>
                     <p className="font-bold text-sm">123 Battery St</p>
                  </div>
               </div>
            </div>

            {/* Secondary Column (1/3 width) */}
            <div className="flex flex-col gap-6">
               
               {/* Media Card */}
               <div className="flex-1 bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  {/* Album Art Background */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/400/400')] bg-cover bg-center mix-blend-overlay"></div>
                  
                  <div className="relative z-10 flex items-start space-x-4">
                     <div className="w-16 h-16 bg-gray-700 rounded-xl shadow-lg bg-[url('https://picsum.photos/200')] bg-cover"></div>
                     <div>
                        <h3 className="font-bold text-lg leading-tight">Bohemian Rhapsody</h3>
                        <p className="text-gray-400 text-sm">Queen</p>
                        <div className="flex items-center mt-2 space-x-1">
                           <div className="w-1 h-3 bg-brand-orange animate-pulse"></div>
                           <div className="w-1 h-5 bg-brand-orange animate-pulse delay-75"></div>
                           <div className="w-1 h-4 bg-brand-orange animate-pulse delay-150"></div>
                        </div>
                     </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between mt-6">
                     <button className="text-gray-400 hover:text-white"><SkipBack className="w-8 h-8" /></button>
                     <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                     >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                     </button>
                     <button className="text-gray-400 hover:text-white"><SkipForward className="w-8 h-8" /></button>
                  </div>
               </div>

               {/* GEMINI INTELLIGENCE CARD (DYNAMIC) */}
               {notification ? (
                 <div className="h-auto min-h-[160px] bg-gray-800 rounded-3xl p-6 border border-white/10 flex flex-col justify-between animate-slideInRight relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange opacity-10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-brand-orange p-1 rounded-md">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-400">{notification.sender}</span>
                        <span className="text-xs text-gray-500">• Now</span>
                      </div>
                      
                      {notification.summary ? (
                        <div className="mb-4">
                          <p className="text-lg font-medium leading-snug text-white">"{notification.summary}"</p>
                          <div className="flex items-center space-x-2 mt-2">
                             <Sparkles className="w-3 h-3 text-brand-orange" />
                             <span className="text-xs text-brand-orange">Summarized by Gemini</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm line-clamp-2">"{notification.text}"</p>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                      {isProcessingAI ? (
                        <div className="flex items-center space-x-2 text-brand-orange">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-medium">Gemini Thinking...</span>
                        </div>
                      ) : notification.summary ? (
                        <div className="flex flex-col space-y-2">
                           <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                             {notification.smartReplies?.map((reply, i) => (
                               <button 
                                 key={i}
                                 onClick={() => handleReply(reply)}
                                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1"
                               >
                                 <span>{reply}</span>
                                 <Send className="w-3 h-3 ml-1 opacity-50" />
                               </button>
                             ))}
                           </div>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleSummarize}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-brand-orange rounded-xl py-3 px-4 flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                          >
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold text-sm">Summarize</span>
                          </button>
                          <button 
                            onClick={() => handlePlayTTS(notification.text)}
                            className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 transition-colors"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                 </div>
               ) : (
                 // DEFAULT ASSISTANT CARD
                 <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/5 flex items-center space-x-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={onVoiceAssistant}>
                    <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center">
                       <Mic className="w-6 h-6 text-brand-green" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-white">"Find a charger"</h3>
                       <p className="text-gray-400 text-sm">Tap to speak to Charge AI</p>
                    </div>
                 </div>
               )}

            </div>
          </div>
        )}

        {/* VIEW: APPS GRID */}
        {view === 'apps' && (
          <div className="flex-1 overflow-y-auto animate-popIn">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 p-8">
                <AppIcon icon={MapPin} label="Maps" color="bg-blue-500" onClick={() => setView('maps')} />
                <AppIcon icon={Zap} label="Request" color="bg-brand-orange" onClick={() => {}} />
                <AppIcon icon={Music} label="Spotify" color="bg-green-500" onClick={() => setView('home')} />
                <AppIcon icon={Phone} label="Phone" color="bg-green-600" onClick={onVoiceAssistant} />
                <AppIcon icon={Settings} label="Settings" color="bg-gray-600" onClick={() => {}} />
                <AppIcon icon={Navigation} label="Waze" color="bg-cyan-500" onClick={() => setView('maps')} />
             </div>
          </div>
        )}

        {/* VIEW: FULL MAP */}
        {view === 'maps' && (
           <div className="flex-1 rounded-3xl overflow-hidden border border-gray-800 relative animate-fadeIn">
              <LiveTracking job={activeJob} technician={activeTech} className="h-full w-full" />
              <button 
                onClick={() => setView('home')} 
                className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg z-10 border border-gray-700 flex items-center"
              >
                <Home className="w-4 h-4 mr-2" /> Dashboard
              </button>
           </div>
        )}

      </div>
    </div>
  );
};