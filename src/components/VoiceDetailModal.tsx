import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Radio,
  Clock,
  Send,
} from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceDetailModalProps {
  voice: Voice | null;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  currentTime: number;
  onTogglePlay: (voice: Voice) => void;
  onSeek: (seconds: number) => void;
  onTestCustomSpeech: (text: string, voice: Voice) => void;
}

export const VoiceDetailModal: React.FC<VoiceDetailModalProps> = ({
  voice,
  isOpen,
  onClose,
  isPlaying,
  currentTime,
  onTogglePlay,
  onSeek,
  onTestCustomSpeech,
}) => {
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !voice) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voice.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onTestCustomSpeech(customText.trim(), voice);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#12131c] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-neutral-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-tr ${voice.avatarColor} shrink-0 flex items-center justify-center text-white font-mono font-bold text-xl shadow-lg border border-white/10`}
            >
              {voice.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{voice.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {voice.trlLevel}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">{voice.persona}</p>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                <span>{voice.category}</span>
                <span aria-hidden="true">·</span>
                <span>{voice.accent}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors"
              title="Copy Model Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-mono">{voice.code}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Waveform & Play Section */}
          <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Audition Master Waveform
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {Math.floor(currentTime)}s / {voice.duration}s
              </span>
            </div>
            <WaveformVisualizer
              peaks={voice.waveformPeaks}
              currentTime={currentTime}
              duration={voice.duration}
              isPlaying={isPlaying}
              onSeek={onSeek}
              accentColor="#10b981"
              height={44}
              mode="full"
            />
            <button
              onClick={() => onTogglePlay(voice)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause Audition</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play Audition</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Acoustic Profile
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/50 p-3.5 rounded-xl border border-neutral-800/80">
              {voice.description}
            </p>
          </div>

          {/* Tone Tags (clean typography, anti-pill) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Vocal Descriptors
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
              {voice.tone.map((t, idx) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-emerald-400">#</span>
                  <span>{t}</span>
                  {idx < voice.tone.length - 1 && <span className="text-neutral-600">·</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Architecture & Engine Specs
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Sample Rate</span>
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  {voice.sampleRate}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Fundamental Pitch</span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {voice.basePitchHz} Hz
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Inference Latency</span>
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  {voice.latencyMs} ms
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Tempo Cadence</span>
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  {voice.tempoBpm} BPM
                </span>
              </div>
            </div>
          </div>

          {/* Test Custom Text Simulation */}
          <div className="p-4 rounded-xl bg-[#161724] border border-neutral-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Audition Custom Script
              </h4>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Type custom copy to test how this voice models your text in real time:
            </p>
            <form onSubmit={handleTestSubmit} className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. Welcome aboard the orbital transfer shuttle..."
                className="flex-1 bg-black/40 border border-neutral-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
