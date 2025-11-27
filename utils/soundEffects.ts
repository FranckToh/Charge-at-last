
// Utility to generate UI sounds using Web Audio API (No external assets needed)

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

export const playClickSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio errors
  }
};

export const playSuccessSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = ctx.currentTime + (i * 0.1);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (e) {
    console.error(e);
  }
};

export const playMessageSound = () => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

// Ringtone Loop Management
let ringtoneOscillators: any[] = [];
let isRinging = false;

export const playIncomingCallSound = () => {
  if (isRinging) return;
  isRinging = true;
  
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const playTone = () => {
      if (!isRinging) return;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Classic phone warble
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);
      
      // Modulate
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 20; // 20Hz ringing modulation
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 500;
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain); // Modulate volume

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      // Ring pattern: 2s on, 4s off
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.1, now);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 2);
      osc2.stop(now + 2);
      
      ringtoneOscillators.push(osc1, osc2);
      
      // Loop
      setTimeout(() => {
        if (isRinging) playTone();
      }, 4000);
    };
    
    playTone();
    
  } catch (e) {
    console.error("Ringtone error", e);
  }
};

export const stopIncomingCallSound = () => {
  isRinging = false;
  ringtoneOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  ringtoneOscillators = [];
};
