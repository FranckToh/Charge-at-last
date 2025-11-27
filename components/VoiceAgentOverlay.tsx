
import React, { useEffect, useState } from 'react';
import { Phone, Mic, MicOff, PhoneOff, Volume2, Activity, Zap, Grid } from 'lucide-react';
import { useLiveAPI } from '../hooks/useLiveAPI';
import { playIncomingCallSound, stopIncomingCallSound } from '../utils/soundEffects';

interface VoiceAgentOverlayProps {
  isOpen: boolean;
  isIncoming: boolean; // True if the agent is calling the user (e.g. after a request)
  onClose: () => void;
  context?: string; // Context to pass to the system instruction
}

export const VoiceAgentOverlay: React.FC<VoiceAgentOverlayProps> = ({ 
  isOpen, 
  isIncoming, 
  onClose,
  context 
}) => {
  const [callState, setCallState] = useState<'incoming' | 'active' | 'ended'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  
  // Determine system instruction based on call direction
  const systemInstruction = isIncoming
    ? `You are a dispatcher for Charge@Last. You are calling a customer who just requested an EV charging service. 
       Start by saying "Hello, this is Charge At Last dispatch calling about your service request." 
       Confirm their vehicle location and tell them a technician is being assigned. Be professional, brief, and helpful. 
       ${context || ''}`
    : `You are the voice support agent for Charge@Last. 
       Greet the user enthusiastically. Help them with questions about EV charging, pricing ($0.45/kWh), or fleet services. 
       We cover Charleston, Raleigh, and Atlanta.`;

  const { connect, disconnect, isConnected, isSpeaking, volume, error } = useLiveAPI({
    systemInstruction,
    onClose: () => {
      setCallState('ended');
      setTimeout(onClose, 2000);
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isIncoming) {
        setCallState('incoming');
        playIncomingCallSound();
      } else {
        setCallState('active');
        // Only connect if we aren't already connected or connecting
        if (!isConnected) {
            connect();
        }
      }
    } else {
      // Reset when closed
      stopIncomingCallSound();
      disconnect();
      setCallState('ended');
    }
    
    return () => {
      stopIncomingCallSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isIncoming]); 

  const handleAcceptCall = () => {
    stopIncomingCallSound();
    setCallState('active');
    connect();
  };

  const handleEndCall = () => {
    stopIncomingCallSound();
    setCallState('ended');
    disconnect();
    setTimeout(onClose, 2000); // Give a moment to show "Call Ended"
  };

  const toggleMute = () => {
    // In a real app, this would toggle the media stream track enabled state
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-between text-white overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-orange rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-green rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full p-6 flex justify-between items-start">
         <div className="flex items-center space-x-2 opacity-80">
            <Zap className="w-5 h-5 text-brand-orange" fill="currentColor" />
            <span className="font-bold tracking-wider text-sm">CHARGE@LAST VOICE</span>
         </div>
         {/* Signal Strength Mock */}
         <div className="flex space-x-1 items-end h-4">
            <div className="w-1 h-2 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-4 bg-white rounded-sm"></div>
            <div className="w-1 h-2 bg-gray-600 rounded-sm"></div>
         </div>
      </div>

      {/* Main Visual Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        
        {callState === 'incoming' && (
          <div className="text-center animate-pulse">
            <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-orange shadow-[0_0_40px_rgba(255,107,0,0.3)]">
              <Zap className="w-16 h-16 text-brand-orange" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Charge@Last Dispatch</h2>
            <p className="text-gray-400">Incoming Call...</p>
          </div>
        )}

        {callState === 'active' && (
          <div className="text-center w-full max-w-md px-4">
             <div className="mb-8 relative h-48 flex items-center justify-center">
                {/* Visualizer */}
                <div className="absolute inset-0 flex items-center justify-center space-x-1">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 bg-brand-green rounded-full transition-all duration-150 ease-out"
                        style={{ 
                          height: `${Math.min(100, Math.max(10, volume * 400 * (Math.random() * 0.5 + 0.5) + (isSpeaking ? 20 : 5)))}%`,
                          opacity: Math.max(0.3, volume + 0.2)
                        }}
                      />
                   ))}
                </div>
                {/* Center Status */}
                <div className="z-10 bg-gray-900/80 backdrop-blur px-6 py-3 rounded-full border border-white/10 flex items-center space-x-3">
                   {isSpeaking ? (
                      <Activity className="w-5 h-5 text-brand-green animate-pulse" />
                   ) : (
                      <Mic className="w-5 h-5 text-white" />
                   )}
                   <span className="font-mono text-sm">
                     {isConnected ? (isSpeaking ? "Agent Speaking..." : "Listening...") : "Connecting..."}
                   </span>
                </div>
             </div>
             
             {error && (
               <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-4 mx-4">
                 {error}
               </div>
             )}

             <h2 className="text-2xl font-bold">{isIncoming ? 'Dispatch Agent' : 'Support Agent'}</h2>
             <p className="text-gray-500 text-sm mt-2">Live Call</p>
          </div>
        )}

        {callState === 'ended' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-400">Call Ended</h2>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 w-full p-8 pb-12">
        {callState === 'incoming' ? (
          <div className="flex justify-around items-center max-w-sm mx-auto">
             <button 
               onClick={handleEndCall}
               className="flex flex-col items-center space-y-2 group"
             >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-600 transition-colors">
                   <PhoneOff className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium">Decline</span>
             </button>

             <button 
               onClick={handleAcceptCall}
               className="flex flex-col items-center space-y-2 group"
             >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-green-600 transition-colors animate-bounce">
                   <Phone className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium">Accept</span>
             </button>
          </div>
        ) : callState === 'active' ? (
          <div className="max-w-sm mx-auto">
             <div className="grid grid-cols-3 gap-8 mb-8">
                <button 
                   onClick={toggleMute}
                   className={`flex flex-col items-center space-y-2 ${isMuted ? 'text-white' : 'text-gray-400'}`}
                >
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${isMuted ? 'bg-white text-gray-900 border-white' : 'border-gray-600 hover:bg-gray-800'}`}>
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                   </div>
                   <span className="text-xs">Mute</span>
                </button>
                
                <button className="flex flex-col items-center space-y-2 text-gray-400">
                   <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-600 hover:bg-gray-800 transition-colors">
                      <Grid className="w-6 h-6" />
                   </div>
                   <span className="text-xs">Keypad</span>
                </button>

                <button className="flex flex-col items-center space-y-2 text-gray-400">
                   <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-600 hover:bg-gray-800 transition-colors">
                      <Volume2 className="w-6 h-6" />
                   </div>
                   <span className="text-xs">Speaker</span>
                </button>
             </div>

             <div className="flex justify-center">
                <button 
                  onClick={handleEndCall}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                   <PhoneOff className="w-8 h-8 text-white" />
                </button>
             </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
