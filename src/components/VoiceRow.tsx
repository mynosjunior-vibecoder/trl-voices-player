import React from 'react';
import { Play, Pause, Heart, Plus, Check, Info } from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceRowProps {
  voice: Voice;
  index: number;
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

export const VoiceRow: React.FC<VoiceRowProps> = ({
  voice,
  index,
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`group flex items-center justify-between px-4 py-2.5 rounded-lg border border-transparent transition-all ${
        isCurrent
          ? 'bg-[#181a24] border-neutral-800'
          : 'hover:bg-[#14151f] hover:border-neutral-800/60'
      }`}
    >
      {/* Col 1: Index / Play Button & Title */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
        {/* Index / Play Button */}
        <div className="w-6 flex items-center justify-center shrink-0">
          <span
            className={`text-xs font-mono tabular-nums text-neutral-400 group-hover:hidden ${
              isCurrent ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            {activeIsPlaying ? '▶' : index + 1}
          </span>
          <button
            onClick={() => onTogglePlay(voice)}
            className="hidden group-hover:flex w-6 h-6 rounded-full items-center justify-center text-white hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {activeIsPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${voice.avatarColor} shrink-0 flex items-center justify-center text-white font-mono text-xs font-bold border border-white/10`}
        >
          {voice.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Title & Persona */}
        <div className="min-w-0 truncate">
          <div className="flex items-center gap-2">
            <span
              onClick={() => onOpenDetails(voice)}
              className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                isCurrent ? 'text-emerald-400' : 'text-neutral-100'
              }`}
            >
              {voice.name}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800/80 px-1 py-0.2 rounded shrink-0">
              {voice.trlLevel}
            </span>
          </div>
          <p className="text-xs text-neutral-400 truncate">{voice.persona}</p>
        </div>
      </div>

      {/* Col 2: Category & Accent (unboxed metadata) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-400 w-52 shrink-0 truncate">
        <span>{voice.category}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{voice.accent}</span>
      </div>

      {/* Col 3: Interactive Waveform */}
      <div className="hidden md:block w-48 lg:w-64 px-2 shrink-0">
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
          height={24}
          mode="compact"
        />
      </div>

      {/* Col 4: Duration & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono text-neutral-400 tabular-nums w-12 text-right">
          {formatTime(voice.duration)}
        </span>

        <button
          onClick={() => onToggleFavorite(voice.id)}
          className={`p-1.5 rounded-md hover:bg-neutral-800 transition-colors ${
            isFavorite ? 'text-rose-500' : 'text-neutral-500 hover:text-white'
          }`}
          title={isFavorite ? 'Saved' : 'Save'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={() => onAddToQueue(voice)}
          className={`p-1.5 rounded-md hover:bg-neutral-800 transition-colors ${
            isInQueue ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'
          }`}
          title={isInQueue ? 'In Queue' : 'Add to Queue'}
        >
          {isInQueue ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onOpenDetails(voice)}
          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
          title="Voice details"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
