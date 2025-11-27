import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

interface UseLiveAPIProps {
  systemInstruction?: string;
  onClose?: () => void;
}

export const useLiveAPI = ({ systemInstruction, onClose }: UseLiveAPIProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [volume, setVolume] = useState(0); // For visualizer
  const [error, setError] = useState<string | null>(null);

  // Refs for audio management
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Store onClose in ref to avoid re-triggering effect when parent re-renders
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const disconnect = useCallback(() => {
    console.log("Disconnecting Live API...");
    
    // Close session
    if (sessionRef.current) {
      sessionRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all queued audio
    audioQueueRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioQueueRef.current = [];

    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  const connect = useCallback(async (customInstruction?: string) => {
    try {
      console.log("Connecting to Gemini Live...");
      setError(null);
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });

      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 }); // Model output rate
      await audioCtx.resume(); // Ensure context is active
      audioContextRef.current = audioCtx;
      
      // 2. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        sampleRate: 16000, // Model input rate preference
        channelCount: 1,
        echoCancellation: true,
        autoGainControl: true,
        noiseSuppression: true
      }});
      streamRef.current = stream;

      // 3. Setup Input Processing (Microphone -> Model)
      // Use standard context for input to avoid sample rate issues on some devices
      const inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
      await inputAudioCtx.resume(); // Ensure input context is active

      const source = inputAudioCtx.createMediaStreamSource(stream);
      // REDUCED BUFFER SIZE: 4096 -> 1024 for lower latency (~64ms vs ~250ms)
      const processor = inputAudioCtx.createScriptProcessor(1024, 1, 1);
      
      inputSourceRef.current = source;
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      // 4. Connect to Gemini Live
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setIsConnected(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            
            if (base64Audio) {
              setIsSpeaking(true);
              const audioData = base64ToUint8Array(base64Audio);
              
              // Decode
              const audioBuffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
              
              // Schedule Playback
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              
              // Update start time to ensure gapless playback
              const currentTime = audioCtx.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              audioQueueRef.current.push(source);
              
              source.onended = () => {
                // A rough heuristic for "stopped speaking"
                setIsSpeaking(false);
              };
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              console.log("Model interrupted");
              audioQueueRef.current.forEach(s => {
                 try { s.stop(); } catch(e) {}
              });
              audioQueueRef.current = [];
              nextStartTimeRef.current = audioCtx.currentTime;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Gemini Live Session Closed");
            disconnect();
            if (onCloseRef.current) onCloseRef.current();
          },
          onerror: (err: any) => {
            console.error("Gemini Live Error", err);
            setError("Connection failed. Please try again.");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: customInstruction || systemInstruction || "You are a helpful assistant.",
        }
      };

      const sessionPromise = ai.live.connect(config);
      
      // 5. Start Streaming Input
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setVolume(Math.min(1, rms * 5)); 

        const pcmBlob = createPcmBlob(inputData);
        
        sessionPromise.then(session => {
          sessionRef.current = session;
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

    } catch (err) {
      console.error("Failed to start Live API", err);
      setError("Microphone access denied or connection failed.");
      setIsConnected(false);
    }
  }, [systemInstruction, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    volume,
    error
  };
};