export type VoiceCategory =
  | 'All'
  | 'Narration'
  | 'Conversational'
  | 'Cinematic'
  | 'Commercial'
  | 'Character'
  | 'Meditation'
  | 'Technical'
  | 'Documentary';

export type TRLTier = 'TRL 9' | 'TRL 8' | 'TRL 7';

export interface ScriptLine {
  time: number; // in seconds
  text: string;
}

export interface Voice {
  id: string;
  code: string; // e.g. TRL-V01
  name: string;
  persona: string;
  category: VoiceCategory;
  trlLevel: TRLTier;
  gender: 'Female' | 'Male' | 'Neutral';
  accent: string;
  tone: string[];
  basePitchHz: number; // For audio synthesis (e.g. 110Hz for deep male, 220Hz for female)
  formantVowel: 'warm' | 'bright' | 'resonant' | 'airy' | 'crisp';
  tempoBpm: number;
  duration: number; // in seconds
  sampleScript: string;
  timedScript: ScriptLine[];
  description: string;
  avatarColor: string; // CSS gradient or hex
  accentColor: string;
  featured?: boolean;
  waveformPeaks: number[]; // 50 normalized values 0.1 - 1.0
  sampleRate: string; // e.g. "48 kHz · 24-bit"
  latencyMs: number; // e.g. 85ms
  playsCount: number;
}
