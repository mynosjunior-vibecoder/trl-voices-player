import React from 'react';
import { X, Copy, Check, Sparkles, Volume2 } from 'lucide-react';
import { Voice } from '../types/voice';

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  voice: Voice | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const ScriptDrawer: React.FC<ScriptDrawerProps> = ({
  isOpen,
  onClose,
  voice,
  currentTime,
  onSeek,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !voice) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(voice.sampleScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0e0f17]/98 backdrop-blur-2xl border-l border-neutral-800/90 shadow-2xl z-50 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Studio Script & Lyrics
            </h2>
            <p className="text-xs text-neutral-400">{voice.name} · {voice.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Copy script to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Vocal Delivery Context Notes */}
      <div className="p-4 bg-neutral-900/40 border-b border-neutral-800/60">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Delivery Parameters</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
          <span>Tempo: {voice.tempoBpm} BPM</span>
          <span aria-hidden="true">·</span>
          <span>Pitch: {voice.basePitchHz} Hz</span>
          <span aria-hidden="true">·</span>
          <span>Formant: {voice.formantVowel}</span>
        </div>
      </div>

      {/* Synchronized Script Lines (Spotify Karaoke style) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {voice.timedScript.map((line, index) => {
          const nextLine = voice.timedScript[index + 1];
          const isCurrentLine =
            currentTime >= line.time &&
            (nextLine ? currentTime < nextLine.time : true);

          return (
            <div
              key={index}
              onClick={() => onSeek(line.time)}
              className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                isCurrentLine
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-neutral-400">
                  0:{line.time.toString().padStart(2, '0')}
                </span>
                {isCurrentLine && (
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold animate-pulse">
                    Speaking
                  </span>
                )}
              </div>
              <p
                className={`text-base leading-relaxed font-medium ${
                  isCurrentLine ? 'text-emerald-300 font-semibold text-lg' : ''
                }`}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="p-4 border-t border-neutral-800/80 bg-[#0a0a0f] text-center text-xs text-neutral-400">
        Click any line above to jump timestamp directly
      </div>
    </div>
  );
};
