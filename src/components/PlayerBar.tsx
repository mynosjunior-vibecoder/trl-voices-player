import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  FileText,
  ListMusic,
  Maximize2,
  Gauge,
} from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface PlayerBarProps {
  currentVoice: Voice | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFavorite: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isScriptOpen: boolean;
  isQueueOpen: boolean;
  queueCount: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleScript: () => void;
  onToggleQueue: () => void;
  onToggleFullScreen: () => void;
  onOpenDetails: (voice: Voice) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentVoice,
  isPlaying,
  currentTime,
  duration,
  isFavorite,
  volume,
  isMuted,
  playbackRate,
  shuffle,
  repeatMode,
  isScriptOpen,
  isQueueOpen,
  queueCount,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  onToggleFavorite,
  onToggleScript,
  onToggleQueue,
  onToggleFullScreen,
  onOpenDetails,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentVoice) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d0e14]/95 backdrop-blur-md border-t border-neutral-800/80 px-6 flex items-center justify-between text-neutral-500 z-40 select-none">
        <div className="text-xs">Select any TRL Voice above to begin studio audition</div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-neutral-600" />
          <span>AUDIO ENGINE READY</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-22 bg-[#0c0d13]/98 backdrop-blur-xl border-t border-neutral-800/90 px-4 md:px-8 flex items-center justify-between z-40 select-none shadow-2xl">
      {/* 1. Left Zone: Current Voice & Persona */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px] max-w-sm">
        <div
          onClick={() => onOpenDetails(currentVoice)}
          className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${currentVoice.avatarColor} shrink-0 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md cursor-pointer relative group overflow-hidden border border-white/10`}
        >
          {currentVoice.name.split(' ').map(n => n[0]).join('')}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              onClick={() => onOpenDetails(currentVoice)}
              className="font-bold text-sm text-white hover:underline cursor-pointer truncate"
            >
              {currentVoice.name}
            </span>
            <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded shrink-0">
              {currentVoice.trlLevel}
            </span>
          </div>
          <p className="text-xs text-neutral-400 truncate">{currentVoice.persona}</p>
        </div>

        <button
          onClick={() => onToggleFavorite(currentVoice.id)}
          className={`p-1.5 rounded-md hover:bg-neutral-800/80 transition-colors shrink-0 ${
            isFavorite ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* 2. Center Zone: Playback Controls & Progress */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-xl px-4">
        {/* Upper buttons */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 transition-colors relative ${
              shuffle ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Shuffle ${shuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
            {shuffle && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={onPrev}
            className="p-1.5 text-neutral-300 hover:text-white transition-colors"
            title="Previous Voice"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Central Play/Pause (Spotify signature emerald circle) */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-1.5 text-neutral-300 hover:text-white transition-colors"
            title="Next Voice"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={onToggleRepeat}
            className={`p-1.5 transition-colors relative ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Lower Progress Bar with Elapsed & Total */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono tabular-nums text-neutral-400 w-9 text-right">
            {formatTime(currentTime)}
          </span>

          {/* Scrubbable track line */}
          <div className="relative flex-1 group py-2 cursor-pointer flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={e => onSeek(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-800 group-hover:h-1.5 rounded-full appearance-none transition-all relative z-10"
              style={{
                background: `linear-gradient(to right, #1db954 0%, #1db954 ${progressPercent}%, #2e2f3b ${progressPercent}%, #2e2f3b 100%)`,
              }}
            />
          </div>

          <span className="text-[11px] font-mono tabular-nums text-neutral-400 w-9 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right Zone: Audio Tools, Script, Queue, Speed, Volume */}
      <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[200px] max-w-sm">
        {/* Real-time mini audio waveform visualizer */}
        <div className="hidden xl:block w-20 px-1 opacity-75">
          <WaveformVisualizer
            peaks={currentVoice.waveformPeaks}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            accentColor="#1db954"
            height={20}
            mode="mini"
            interactive={false}
          />
        </div>

        {/* Script / Transcript Toggle */}
        <button
          onClick={onToggleScript}
          className={`p-2 rounded-lg transition-colors ${
            isScriptOpen
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Voice Script / Teleprompter"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Playback Queue Toggle */}
        <button
          onClick={onToggleQueue}
          className={`p-2 rounded-lg transition-colors relative ${
            isQueueOpen
              ? 'bg-neutral-800 text-emerald-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Audition Queue"
        >
          <ListMusic className="w-4 h-4" />
          {queueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">
              {queueCount}
            </span>
          )}
        </button>

        {/* Speed Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            title="Playback Speed"
          >
            <Gauge className="w-3 h-3 text-neutral-400" />
            <span>{playbackRate}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-9 right-0 bg-[#161722] border border-neutral-800 rounded-lg shadow-xl p-1 z-50 flex flex-col min-w-[72px]">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    onRateChange(rate);
                    setShowSpeedMenu(false);
                  }}
                  className={`px-2.5 py-1 text-xs text-left rounded font-mono ${
                    playbackRate === rate
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume & Mute */}
        <div className="hidden sm:flex items-center gap-2 group">
          <button
            onClick={onToggleMute}
            className="text-neutral-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 lg:w-20 h-1 bg-neutral-800 group-hover:h-1.5 rounded-full appearance-none transition-all"
            style={{
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${
                (isMuted ? 0 : volume) * 100
              }%, #2e2f3b ${(isMuted ? 0 : volume) * 100}%, #2e2f3b 100%)`,
            }}
          />
        </div>

        {/* Immersive Fullscreen Mode */}
        <button
          onClick={onToggleFullScreen}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900/60 rounded-lg transition-colors"
          title="Fullscreen Player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
