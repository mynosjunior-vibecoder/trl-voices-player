import React from 'react';
import { X, Play, Trash2, ListMusic, ArrowUp, ArrowDown } from 'lucide-react';
import { Voice } from '../types/voice';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: Voice | null;
  queue: Voice[];
  onPlayFromQueue: (voice: Voice) => void;
  onRemoveFromQueue: (voiceId: string) => void;
  onMoveQueueItem: (fromIdx: number, toIdx: number) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentVoice,
  queue,
  onPlayFromQueue,
  onRemoveFromQueue,
  onMoveQueueItem,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0e0f17]/98 backdrop-blur-2xl border-l border-neutral-800/90 shadow-2xl z-50 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Audition Queue</h2>
            <p className="text-xs text-neutral-400">
              {queue.length} {queue.length === 1 ? 'voice' : 'voices'} in queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-neutral-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Now Playing */}
        {currentVoice && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5 block">
              Now Playing
            </span>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${currentVoice.avatarColor} shrink-0 flex items-center justify-center text-white font-mono text-xs font-bold`}
                >
                  {currentVoice.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="truncate">
                  <div className="text-sm font-bold text-white truncate">{currentVoice.name}</div>
                  <div className="text-xs text-emerald-400 truncate">{currentVoice.persona}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-400 tabular-nums">
                {currentVoice.duration}s
              </span>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5 block">
            Next in Queue
          </span>

          {queue.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-neutral-800 text-neutral-500 text-xs">
              <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-neutral-400">Queue is empty</p>
              <p className="mt-1">Click the + icon on any voice to queue it for sequential playback.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.map((voice, idx) => (
                <div
                  key={`${voice.id}-${idx}`}
                  className="group flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/60 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onPlayFromQueue(voice)}
                      className="w-7 h-7 rounded-full bg-neutral-800 group-hover:bg-emerald-500 text-neutral-300 group-hover:text-black flex items-center justify-center shrink-0 transition-colors"
                      title="Play now"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-neutral-200 truncate">
                        {voice.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {voice.category} · {voice.duration}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move up / down */}
                    {idx > 0 && (
                      <button
                        onClick={() => onMoveQueueItem(idx, idx - 1)}
                        className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < queue.length - 1 && (
                      <button
                        onClick={() => onMoveQueueItem(idx, idx + 1)}
                        className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveFromQueue(voice.id)}
                      className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
