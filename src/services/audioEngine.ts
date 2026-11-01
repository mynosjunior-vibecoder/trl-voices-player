import { Voice } from '../types/voice';

type TimeUpdateCallback = (currentTime: number, duration: number) => void;
type StateCallback = (isPlaying: boolean) => void;
type EndCallback = () => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private currentVoice: Voice | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private playbackRate: number = 1.0;
  private volume: number = 0.85;
  private isMuted: boolean = false;

  private timeCallbacks: Set<TimeUpdateCallback> = new Set();
  private stateCallbacks: Set<StateCallback> = new Set();
  private endCallbacks: Set<EndCallback> = new Set();
  private rafId: number | null = null;

  // Active synthesizer nodes
  private oscillators: OscillatorNode[] = [];
  private formantFilters: BiquadFilterNode[] = [];
  private ambientGain: GainNode | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private synthInterval: number | null = null;

  constructor() {
    // Lazy init audio context on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(0);
    }
  }

  public play(voice: Voice, startFrom?: number): void {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    // If changing voice
    if (!this.currentVoice || this.currentVoice.id !== voice.id) {
      this.stopCurrentSynth();
      this.currentVoice = voice;
      this.pauseOffset = startFrom !== undefined ? startFrom : 0;
    } else if (startFrom !== undefined) {
      this.stopCurrentSynth();
      this.pauseOffset = startFrom;
    }

    this.isPlaying = true;
    this.startTime = this.ctx.currentTime - (this.pauseOffset / this.playbackRate);

    this.startVoiceSynthesis(voice);
    this.startClock();
    this.notifyState();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    if (this.ctx) {
      this.pauseOffset = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    }
    this.isPlaying = false;
    this.stopCurrentSynth();
    this.stopClock();
    this.notifyState();
  }

  public togglePlay(voice: Voice): void {
    if (this.isPlaying && this.currentVoice?.id === voice.id) {
      this.pause();
    } else {
      this.play(voice);
    }
  }

  public seek(seconds: number): void {
    if (!this.currentVoice) return;
    const clamped = Math.max(0, Math.min(seconds, this.currentVoice.duration));
    this.pauseOffset = clamped;

    if (this.isPlaying && this.ctx) {
      this.startTime = this.ctx.currentTime - (clamped / this.playbackRate);
      this.stopCurrentSynth();
      this.startVoiceSynthesis(this.currentVoice);
    }
    this.notifyTime(clamped, this.currentVoice.duration);
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(val, 1));
    if (this.gainNode && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setPlaybackRate(rate: number): void {
    const prevRate = this.playbackRate;
    this.playbackRate = rate;
    if (this.isPlaying && this.ctx) {
      const currentPos = (this.ctx.currentTime - this.startTime) * prevRate;
      this.startTime = this.ctx.currentTime - (currentPos / rate);
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getCurrentTime(): number {
    if (!this.currentVoice) return 0;
    if (!this.isPlaying || !this.ctx) return this.pauseOffset;
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    return Math.min(elapsed, this.currentVoice.duration);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentVoice(): Voice | null {
    return this.currentVoice;
  }

  // Synthesis engine: creates formant acoustic resonant vocal tone + ambient studio warmth
  private startVoiceSynthesis(voice: Voice): void {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;

    // 1. Ambient Harmonic Vocal Bed (Vocal Tract Simulation)
    // Primary fundamental pitch oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = voice.gender === 'Male' ? 'sawtooth' : 'triangle';
    osc1.frequency.setValueAtTime(voice.basePitchHz * this.playbackRate, now);

    // Secondary sub/harmonic oscillator for rich chest resonance
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime((voice.basePitchHz * 0.5) * this.playbackRate, now);

    // Formant 1 (Vocal vowel filter - e.g. 500-800Hz)
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(voice.formantVowel === 'warm' ? 450 : voice.formantVowel === 'bright' ? 750 : 600, now);
    f1.Q.setValueAtTime(4.5, now);

    // Formant 2 (Oral cavity resonance - 1200-2400Hz)
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'peaking';
    f2.frequency.setValueAtTime(voice.formantVowel === 'crisp' ? 2400 : 1700, now);
    f2.gain.setValueAtTime(8, now);
    f2.Q.setValueAtTime(3.0, now);

    // Studio warm master filter
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(4200, now);

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.exponentialRampToValueAtTime(0.35, now + 0.15);

    // Subtle gentle vibrato LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.8, now);
    lfoGain.gain.setValueAtTime(voice.gender === 'Female' ? 3.5 : 2.0, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    // Connect node chain
    osc1.connect(f1);
    osc2.connect(f1);
    f1.connect(f2);
    f2.connect(lowpass);
    lowpass.connect(voiceGain);
    voiceGain.connect(this.gainNode);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    this.oscillators = [osc1, osc2, lfo];
    this.formantFilters = [f1, f2, lowpass];
    this.ambientGain = voiceGain;

    // Modulation loop to emulate speech cadence rhythm & intonation waves
    const startTimeOffset = this.pauseOffset;
    let step = 0;
    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      step++;
      // Intonation contour: rises and falls naturally like human inflection
      const pitchMod = Math.sin(step * 0.4) * 8 + Math.cos(step * 0.15) * 12;
      osc1.frequency.setTargetAtTime((voice.basePitchHz + pitchMod) * this.playbackRate, t, 0.1);

      // Volume envelope pulsing to simulate syllables
      const syllable = (Math.sin(step * 0.8) + 1.2) * 0.18;
      voiceGain.gain.setTargetAtTime(Math.max(0.08, syllable), t, 0.08);
    }, 180);

    // 2. Speech synthesis utterance integration if supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Calculate remaining script from current timestamp
      const allSentences = voice.timedScript;
      const remainingScript = allSentences
        .filter(s => s.time >= startTimeOffset - 1)
        .map(s => s.text)
        .join(' ');

      const textToSpeak = remainingScript.trim() || voice.sampleScript;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      utterance.rate = Math.max(0.7, Math.min(1.4, (voice.tempoBpm / 85) * this.playbackRate));
      utterance.pitch = Math.max(0.6, Math.min(1.6, voice.basePitchHz / 180));

      // Attempt to pick matching gender/accent voice if installed in browser
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matched = voices.find(v => {
          const vName = v.name.toLowerCase();
          const vLang = v.lang.toLowerCase();
          if (voice.accent.includes('British') && (vLang.includes('en-gb') || vName.includes('uk') || vName.includes('british'))) return true;
          if (voice.gender === 'Female' && (vName.includes('female') || vName.includes('samantha') || vName.includes('zira') || vName.includes('victoria'))) return true;
          if (voice.gender === 'Male' && (vName.includes('male') || vName.includes('david') || vName.includes('george') || vName.includes('daniel'))) return true;
          return vLang.startsWith('en');
        });
        if (matched) utterance.voice = matched;
      }

      utterance.onend = () => {
        // Continue synth tone until track duration completes
      };

      utterance.onerror = () => {
        // Fallback to pure audio synth smoothly
      };

      try {
        window.speechSynthesis.speak(utterance);
        this.currentUtterance = utterance;
      } catch {
        // Ignore speech error, web audio handles it
      }
    }
  }

  private stopCurrentSynth(): void {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      } catch {
        // Node might be disconnected
      }
    }

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore
        }
      });
      this.oscillators = [];
      this.formantFilters.forEach(f => {
        try {
          f.disconnect();
        } catch {
          // Ignore
        }
      });
      this.formantFilters = [];
      this.ambientGain = null;
    }, 60);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  private startClock(): void {
    const loop = () => {
      if (!this.isPlaying || !this.currentVoice || !this.ctx) return;
      const current = this.getCurrentTime();

      this.notifyTime(current, this.currentVoice.duration);

      if (current >= this.currentVoice.duration) {
        this.handleTrackEnd();
        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(loop);
  }

  private stopClock(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handleTrackEnd(): void {
    this.stopCurrentSynth();
    this.isPlaying = false;
    this.pauseOffset = 0;
    this.stopClock();
    this.notifyState();
    this.endCallbacks.forEach(cb => cb());
  }

  // Observer subscriptions
  public onTimeUpdate(cb: TimeUpdateCallback): () => void {
    this.timeCallbacks.add(cb);
    return () => this.timeCallbacks.delete(cb);
  }

  public onStateChange(cb: StateCallback): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  public onTrackEnd(cb: EndCallback): () => void {
    this.endCallbacks.add(cb);
    return () => this.endCallbacks.delete(cb);
  }

  private notifyTime(time: number, duration: number): void {
    this.timeCallbacks.forEach(cb => cb(time, duration));
  }

  private notifyState(): void {
    this.stateCallbacks.forEach(cb => cb(this.isPlaying));
  }
}

export const audioEngine = new AudioEngine();
