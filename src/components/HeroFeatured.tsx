import React from 'react';
import { Play, Pause, Plus, Check, Sparkles, Volume2, ShieldCheck, Clock, Radio } from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface HeroFeaturedProps {
  voice: Voice;
  isPlaying: boolean;
  isCurrent: boolean;
  currentTime: number;
  onTogglePlay: (voice: Voice) => void;
  onSeek: (time: number) => void;
  onAddToQueue: (voice: Voice) => void;
  isInQueue: boolean;
  onOpenDetails: (voice: Voice) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  voice,
  isPlaying,
  isCurrent,
  currentTime,
  onTogglePlay,
  onSeek,
  onAddToQueue,
  isInQueue,
  onOpenDetails,
}) => {
  const activeIsPlaying = isCurrent && isPlaying;
  const activeCurrentTime = isCurrent ? currentTime : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#12131a] to-[#0d0e14] border border-emerald-900/40 p-6 md:p-8 shadow-2xl">
      {/* Background ambient glow effect */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Speaker Identity & Details */}
        <div className="flex items-start sm:items-center gap-5 max-w-2xl">
          {/* Avatar / Acoustic Icon Box */}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${voice.avatarColor} shrink-0 flex items-center justify-center shadow-2xl border border-white/10 relative group overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <span className="text-3xl font-extrabold text-white/90 drop-shadow-md select-none font-mono">
              {voice.name.split(' ').map(n => n[0]).join('')}
            </span>
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
              {voice.code}
            </div>
          </div>

          <div className="space-y-1.5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-black shadow-sm">
                <Sparkles className="w-3 h-3" />
                Featured Voice of the Month
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {voice.trlLevel} Certified
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">{voice.accent}</span>
            </div>

            {/* Title & Persona */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {voice.name}
            </h1>
            <p className="text-sm font-medium text-emerald-400/90">{voice.persona}</p>
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {voice.description}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {voice.duration}s sample
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-neutral-400">
                <Radio className="w-3.5 h-3.5 text-neutral-400" />
                {voice.sampleRate}
              </span>
              <span>·</span>
              <span className="text-neutral-400 font-mono">{(voice.playsCount / 1000).toFixed(0)}k plays</span>
            </div>
          </div>
        </div>

        {/* Right: Waveform and Instant Listen Actions */}
        <div className="w-full lg:w-96 bg-[#0f1017]/80 border border-neutral-800/90 rounded-xl p-4 flex flex-col gap-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Live Acoustic Waveform
            </span>
            <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
              {isCurrent
                ? `${Math.floor(currentTime)}s / ${voice.duration}s`
                : `0s / ${voice.duration}s`}
            </span>
          </div>

          {/* Interactive Hero Waveform */}
          <div className="py-1">
            <WaveformVisualizer
              peaks={voice.waveformPeaks}
              currentTime={activeCurrentTime}
              duration={voice.duration}
              isPlaying={activeIsPlaying}
              onSeek={time => {
                if (!isCurrent) onTogglePlay(voice);
                onSeek(time);
              }}
              accentColor="#10b981"
              height={44}
              mode="full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onTogglePlay(voice)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              {activeIsPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Listen Voice</span>
                </>
              )}
            </button>

            <button
              onClick={() => onAddToQueue(voice)}
              className={`p-2.5 rounded-full border transition-colors ${
                isInQueue
                  ? 'bg-neutral-800 border-emerald-500/50 text-emerald-400'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
              }`}
              title={isInQueue ? 'In Queue' : 'Add to Queue'}
            >
              {isInQueue ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onOpenDetails(voice)}
              className="px-3 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold hover:border-neutral-500 transition-colors"
            >
              Specs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
