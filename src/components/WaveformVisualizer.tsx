import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';

interface WaveformVisualizerProps {
  peaks: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  accentColor?: string;
  height?: number; // e.g. 36 or 64
  mode?: 'full' | 'compact' | 'mini';
  interactive?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  peaks,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  accentColor = '#1db954',
  height = 48,
  mode = 'full',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [liveFrequencies, setLiveFrequencies] = useState<number[]>([]);
  const freqBufferRef = useRef<Uint8Array>(new Uint8Array(64));

  // Determine bar count based on mode
  const targetBarCount = mode === 'full' ? 56 : mode === 'compact' ? 32 : 18;
  const barWidth = mode === 'full' ? 3 : mode === 'compact' ? 2.5 : 2;
  const gap = mode === 'full' ? 2 : 1.5;

  // Sample or interpolate peaks to match targetBarCount
  const bars = React.useMemo(() => {
    if (!peaks || peaks.length === 0) return Array(targetBarCount).fill(0.3);
    const step = (peaks.length - 1) / (targetBarCount - 1);
    const sampled: number[] = [];
    for (let i = 0; i < targetBarCount; i++) {
      const idx = Math.min(peaks.length - 1, Math.floor(i * step));
      sampled.push(peaks[idx]);
    }
    return sampled;
  }, [peaks, targetBarCount]);

  // Real-time animation loop when playing
  useEffect(() => {
    if (!isPlaying) {
      setLiveFrequencies([]);
      return;
    }

    let rafId: number;
    const update = () => {
      audioEngine.getFrequencyData(freqBufferRef.current);
      const buffer = freqBufferRef.current;
      // Extract smoothed values
      const freqSample: number[] = [];
      const step = Math.floor(buffer.length / targetBarCount);
      for (let i = 0; i < targetBarCount; i++) {
        const val = buffer[Math.min(buffer.length - 1, i * step)] || 0;
        freqSample.push(val / 255);
      }
      setLiveFrequencies(freqSample);
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, targetBarCount]);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    setHoverTime(ratio * duration);
    setHoverX(x);
  }, [interactive, duration]);

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSeek || !containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative flex items-center justify-between select-none ${
        interactive ? 'cursor-pointer group' : ''
      }`}
      style={{ height: `${height}px`, width: '100%' }}
    >
      {/* Tooltip on hover */}
      {interactive && hoverTime !== null && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 px-1.5 py-0.5 bg-neutral-900 border border-neutral-700/80 rounded text-[11px] font-mono text-neutral-200 pointer-events-none z-20 shadow-lg tabular-nums"
          style={{ left: `${hoverX}px` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      {/* Waveform Bars */}
      <div className="flex items-center justify-between w-full h-full">
        {bars.map((rawPeak, i) => {
          const barFraction = i / bars.length;
          const isPlayed = barFraction <= progressRatio;

          // When playing, add live subtle frequency bounce
          const liveMod = isPlaying && liveFrequencies[i] !== undefined
            ? liveFrequencies[i] * 0.45
            : 0;

          // Compute clamped height percentage
          const dynamicHeight = Math.max(
            12,
            Math.min(96, (rawPeak * 0.75 + liveMod) * 100)
          );

          return (
            <div
              key={i}
              className="relative transition-all duration-75 flex items-center justify-center rounded-full"
              style={{
                width: `${barWidth}px`,
                marginRight: i === bars.length - 1 ? 0 : `${gap}px`,
                height: `${dynamicHeight}%`,
                backgroundColor: isPlayed
                  ? accentColor
                  : 'rgba(255, 255, 255, 0.22)',
                boxShadow: isPlayed && isPlaying
                  ? `0 0 6px ${accentColor}40`
                  : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Progress needle / scrubber head */}
      {interactive && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm"
          style={{
            left: `${progressRatio * 100}%`,
          }}
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full -ml-1 -top-1 absolute shadow-md" />
        </div>
      )}
    </div>
  );
};
