import React, { useEffect } from 'react';
import {
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  voice: Voice | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFavorite: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (id: string) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  voice,
  isPlaying,
  currentTime,
  duration,
  isFavorite,
  volume,
  isMuted,
  shuffle,
  repeatMode,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onVolumeChange,
  onToggleMute,
}) => {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !voice) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSentence =
    voice.timedScript.slice().reverse().find(s => currentTime >= s.time)?.text ||
    voice.sampleScript;

  return (
    <div className="fixed inset-0 z-50 bg-[#08080d] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic ambient backdrop */}
      <div
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 bg-gradient-to-tr ${voice.avatarColor} pointer-events-none`}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-emerald-500 pointer-events-none"
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            TRL STUDIO NOW AUDITIONING
          </span>
          <span className="text-xs text-neutral-400 hidden sm:inline">
            · {voice.sampleRate}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
          title="Exit Fullscreen (Esc)"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Center Showcase Area */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 my-auto max-w-5xl mx-auto w-full">
        {/* Giant Art */}
        <div
          className={`w-56 h-56 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-tr ${voice.avatarColor} shrink-0 flex items-center justify-center text-white font-mono font-extrabold text-5xl sm:text-6xl shadow-2xl border border-white/10 relative overflow-hidden`}
        >
          {voice.name.split(' ').map(n => n[0]).join('')}
          {isPlaying && (
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Info & Spoken Transcript */}
        <div className="flex-1 space-y-4 text-center lg:text-left max-w-xl">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400">{voice.code}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">{voice.trlLevel}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">{voice.accent}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {voice.name}
            </h1>
            <p className="text-base text-emerald-400/90 font-medium mt-1">
              {voice.persona}
            </p>
          </div>

          {/* Active Spoken Sentence / Karaoke Bar */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-md">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Live Voice Transcript
            </span>
            <p className="text-base sm:text-lg text-white font-medium italic transition-all duration-150">
              "{currentSentence}"
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls & Waveform */}
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-4">
        {/* Full-width Responsive Waveform */}
        <div className="bg-[#12131d]/90 p-3.5 rounded-2xl border border-neutral-800 shadow-xl">
          <WaveformVisualizer
            peaks={voice.waveformPeaks}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onSeek={onSeek}
            accentColor="#10b981"
            height={52}
            mode="full"
          />
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback Button Cluster */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(voice.id)}
            className={`p-2.5 rounded-full hover:bg-neutral-900 transition-colors ${
              isFavorite ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={onToggleShuffle}
              className={`p-2 ${shuffle ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={onPrev}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black" />
              ) : (
                <Play className="w-7 h-7 fill-black ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-2 ${repeatMode !== 'off' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-neutral-800 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
