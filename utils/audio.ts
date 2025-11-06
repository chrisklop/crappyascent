// A simple audio manager to generate sound effects programmatically
// using the Web Audio API. This avoids needing any external asset files.

export default class AudioManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    // The constructor is now safe to call in any environment.
    // AudioContext creation is deferred until a sound is actually played.
  }

  private initAudioContext() {
    if (this.audioContext || typeof window === 'undefined') {
      return;
    }
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
      this.audioContext = null;
    }
  }

  private playSound(buffer: AudioBuffer, volume: number = 1.0) {
    this.initAudioContext();
    if (!this.audioContext) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }
  
  private createNoiseBuffer(duration: number): AudioBuffer | null {
      this.initAudioContext();
      if (!this.audioContext) return null;
      const sampleRate = this.audioContext.sampleRate;
      const frameCount = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  }

  public playThrustSound() {
    this.initAudioContext();
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Create a short, wet, "splat" sound for thrust
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCollisionSound() {
    this.initAudioContext();
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Create a louder, more impactful "splat"
    const noiseBuffer = this.createNoiseBuffer(0.2);
    if (!noiseBuffer) return;
    
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(now);
    source.stop(now + 0.2);
  }

  public playGameOverSound() {
    this.initAudioContext();
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Simulate a toilet flush sound with filtered noise
    const noiseBuffer = this.createNoiseBuffer(3.0);
    if (!noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 5;
    
    // The "whoosh" down
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.5);

    // The "gurgle" at the end
    filter.frequency.setValueAtTime(300, now + 1.5);
    filter.frequency.linearRampToValueAtTime(400, now + 1.7);
    filter.frequency.linearRampToValueAtTime(250, now + 2.0);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.2); // Start flush
    gain.gain.linearRampToValueAtTime(0.1, now + 1.8); // Fade out
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // Final fade

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + 3.0);
  }
}
