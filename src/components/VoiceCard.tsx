import React from 'react';
import { Play, Pause, Heart, Plus, Check, Info } from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceCardProps {
  voice: Voice;
  isPlaying: boolean;
  isCurrent: boolean;
  currentTime: number;
  isFavorite: boolean;
  isInQueue: boolean;
  onTogglePlay: (voice: Voice) => void;
  onSeek: (time: number) => void;
  onToggleFavorite: (voiceId: string) => void;
  onAddToQueue: (voice: Voice) => void;
  onOpenDetails: (voice: Voice) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isPlaying,
  isCurrent,
  currentTime,
  isFavorite,
  isInQueue,
  onTogglePlay,
  onSeek,
  onToggleFavorite,
  onAddToQueue,
  onOpenDetails,
}) => {
  const activeIsPlaying = isCurrent && isPlaying;
  const activeCurrentTime = isCurrent ? currentTime : 0;

  return (
    <div className="group relative bg-[#13141c] hover:bg-[#1a1b26] border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl">
      {/* Top Cover / Visual area */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center">
        {/* Dynamic Art Gradient */}
        <div
          className={`w-full h-full bg-gradient-to-tr ${voice.avatarColor} opacity-85 group-hover:opacity-100 transition-opacity flex items-center justify-center relative`}
        >
          {/* Subtle soundwave graphic behind text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-3/4 h-3/4 rounded-full border border-white/30 animate-ping" />
          </div>

          <span className="text-3xl font-extrabold text-white/95 font-mono select-none drop-shadow">
            {voice.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>

        {/* TRL Level Tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
          {voice.trlLevel}
        </div>

        {/* Duration badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300">
          {voice.duration}s
        </div>

        {/* Floating Play Button (Spotify style) */}
        <button
          onClick={e => {
            e.stopPropagation();
            onTogglePlay(voice);
          }}
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl shadow-black/60 transform transition-all duration-200 cursor-pointer ${
            activeIsPlaying
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
          }`}
          title={activeIsPlaying ? 'Pause' : 'Play'}
        >
          {activeIsPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3
              onClick={() => onOpenDetails(voice)}
              className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate cursor-pointer"
            >
              {voice.name}
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 shrink-0">
              {voice.code}
            </span>
          </div>

          <p className="text-xs text-neutral-400 truncate mt-0.5">{voice.persona}</p>

          {/* Unboxed Metadata (Rule 1.A Zero-Pill compliant) */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-2 truncate">
            <span>{voice.category}</span>
            <span aria-hidden="true">·</span>
            <span>{voice.accent.split('/')[0].trim()}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{voice.basePitchHz}Hz</span>
          </div>
        </div>

        {/* Mini Waveform on Card */}
        <div className="my-3 py-1 px-1 bg-black/40 rounded-lg border border-neutral-800/60">
          <WaveformVisualizer
            peaks={voice.waveformPeaks}
            currentTime={activeCurrentTime}
            duration={voice.duration}
            isPlaying={activeIsPlaying}
            onSeek={time => {
              if (!isCurrent) onTogglePlay(voice);
              onSeek(time);
            }}
            accentColor="#1db954"
            height={28}
            mode="compact"
          />
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(voice.id)}
              className={`p-1.5 rounded-md hover:bg-neutral-800 transition-colors ${
                isFavorite ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onAddToQueue(voice)}
              className={`p-1.5 rounded-md hover:bg-neutral-800 transition-colors ${
                isInQueue ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
              }`}
              title={isInQueue ? 'In Queue' : 'Add to Queue'}
            >
              {isInQueue ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={() => onOpenDetails(voice)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
