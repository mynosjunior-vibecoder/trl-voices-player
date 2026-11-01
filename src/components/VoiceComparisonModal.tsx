import React, { useState } from 'react';
import { X, Play, Pause, GitCompare, ArrowRightLeft, ShieldCheck, Zap } from 'lucide-react';
import { Voice } from '../types/voice';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVoices: Voice[];
  currentPlayingVoice: Voice | null;
  isPlaying: boolean;
  currentTime: number;
  onPlayVoice: (voice: Voice) => void;
  onPauseVoice: () => void;
  onSeek: (seconds: number) => void;
}

export const VoiceComparisonModal: React.FC<VoiceComparisonModalProps> = ({
  isOpen,
  onClose,
  allVoices,
  currentPlayingVoice,
  isPlaying,
  currentTime,
  onPlayVoice,
  onPauseVoice,
  onSeek,
}) => {
  const [voiceAId, setVoiceAId] = useState<string>(allVoices[0]?.id || '');
  const [voiceBId, setVoiceBId] = useState<string>(allVoices[1]?.id || '');

  if (!isOpen) return null;

  const voiceA = allVoices.find(v => v.id === voiceAId) || allVoices[0];
  const voiceB = allVoices.find(v => v.id === voiceBId) || allVoices[1];

  const isAPlaying = currentPlayingVoice?.id === voiceA.id && isPlaying;
  const isBPlaying = currentPlayingVoice?.id === voiceB.id && isPlaying;

  const handleToggleA = () => {
    if (isAPlaying) {
      onPauseVoice();
    } else {
      onPlayVoice(voiceA);
    }
  };

  const handleToggleB = () => {
    if (isBPlaying) {
      onPauseVoice();
    } else {
      onPlayVoice(voiceB);
    }
  };

  const handleSwap = () => {
    const temp = voiceAId;
    setVoiceAId(voiceBId);
    setVoiceBId(temp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#101118] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                A/B Voice Comparison Lab
              </h2>
              <p className="text-xs text-neutral-400">
                Direct acoustic and architectural comparison of two TRL voices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              title="Swap Voice A and Voice B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
              <span>Swap</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice A Selector */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Voice A (Left)
                </span>
                <span className="text-xs font-mono text-neutral-400">{voiceA.trlLevel}</span>
              </div>
              <select
                value={voiceAId}
                onChange={e => setVoiceAId(e.target.value)}
                className="w-full bg-[#181924] border border-neutral-700/80 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {allVoices.map(v => (
                  <option key={v.id} value={v.id} className="bg-neutral-900">
                    {v.name} ({v.category} · {v.accent.split('/')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice B Selector */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Voice B (Right)
                </span>
                <span className="text-xs font-mono text-neutral-400">{voiceB.trlLevel}</span>
              </div>
              <select
                value={voiceBId}
                onChange={e => setVoiceBId(e.target.value)}
                className="w-full bg-[#181924] border border-neutral-700/80 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {allVoices.map(v => (
                  <option key={v.id} value={v.id} className="bg-neutral-900">
                    {v.name} ({v.category} · {v.accent.split('/')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive A/B Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isAPlaying
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                  : 'bg-[#14151f] border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${voiceA.avatarColor} flex items-center justify-center text-white font-mono font-bold text-sm shadow-md`}
                  >
                    {voiceA.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{voiceA.name}</h3>
                    <p className="text-xs text-neutral-400">{voiceA.persona}</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleA}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                    isAPlaying
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-neutral-800 text-white hover:bg-emerald-500 hover:text-black'
                  }`}
                >
                  {isAPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Waveform A */}
              <div className="p-2 bg-black/40 rounded-xl border border-neutral-800 mb-4">
                <WaveformVisualizer
                  peaks={voiceA.waveformPeaks}
                  currentTime={currentPlayingVoice?.id === voiceA.id ? currentTime : 0}
                  duration={voiceA.duration}
                  isPlaying={isAPlaying}
                  onSeek={onSeek}
                  accentColor="#10b981"
                  height={36}
                  mode="compact"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-neutral-300 italic bg-black/20 p-2.5 rounded-lg border border-neutral-800/60">
                  "{voiceA.sampleScript}"
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block">Fundamental Pitch</span>
                    <span className="font-mono text-emerald-400 font-bold">{voiceA.basePitchHz} Hz</span>
                  </div>
                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block">Synthesis Latency</span>
                    <span className="font-mono text-neutral-200 font-bold">{voiceA.latencyMs} ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isBPlaying
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-xl shadow-cyan-500/5'
                  : 'bg-[#14151f] border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${voiceB.avatarColor} flex items-center justify-center text-white font-mono font-bold text-sm shadow-md`}
                  >
                    {voiceB.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{voiceB.name}</h3>
                    <p className="text-xs text-neutral-400">{voiceB.persona}</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleB}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                    isBPlaying
                      ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                      : 'bg-neutral-800 text-white hover:bg-cyan-400 hover:text-black'
                  }`}
                >
                  {isBPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Waveform B */}
              <div className="p-2 bg-black/40 rounded-xl border border-neutral-800 mb-4">
                <WaveformVisualizer
                  peaks={voiceB.waveformPeaks}
                  currentTime={currentPlayingVoice?.id === voiceB.id ? currentTime : 0}
                  duration={voiceB.duration}
                  isPlaying={isBPlaying}
                  onSeek={onSeek}
                  accentColor="#06b6d4"
                  height={36}
                  mode="compact"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-neutral-300 italic bg-black/20 p-2.5 rounded-lg border border-neutral-800/60">
                  "{voiceB.sampleScript}"
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block">Fundamental Pitch</span>
                    <span className="font-mono text-cyan-400 font-bold">{voiceB.basePitchHz} Hz</span>
                  </div>
                  <div className="p-2 bg-neutral-900/60 rounded border border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400 block">Synthesis Latency</span>
                    <span className="font-mono text-neutral-200 font-bold">{voiceB.latencyMs} ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Spec Matrix */}
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <div className="bg-neutral-900/80 px-4 py-2.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Spec Comparison</span>
            </div>
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-neutral-800/60">
                <tr className="bg-neutral-950/40">
                  <td className="px-4 py-2.5 text-neutral-400 w-1/3">Target Persona</td>
                  <td className="px-4 py-2.5 text-neutral-200 font-medium w-1/3">{voiceA.persona}</td>
                  <td className="px-4 py-2.5 text-neutral-200 font-medium w-1/3">{voiceB.persona}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-400">Accent / Dialect</td>
                  <td className="px-4 py-2.5 text-neutral-200">{voiceA.accent}</td>
                  <td className="px-4 py-2.5 text-neutral-200">{voiceB.accent}</td>
                </tr>
                <tr className="bg-neutral-950/40">
                  <td className="px-4 py-2.5 text-neutral-400">Readiness Tier</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-mono font-semibold">{voiceA.trlLevel}</td>
                  <td className="px-4 py-2.5 text-cyan-400 font-mono font-semibold">{voiceB.trlLevel}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-neutral-400">Audio Fidelity</td>
                  <td className="px-4 py-2.5 text-neutral-200 font-mono">{voiceA.sampleRate}</td>
                  <td className="px-4 py-2.5 text-neutral-200 font-mono">{voiceB.sampleRate}</td>
                </tr>
                <tr className="bg-neutral-950/40">
                  <td className="px-4 py-2.5 text-neutral-400">Vocal Formant</td>
                  <td className="px-4 py-2.5 text-neutral-200 capitalize">{voiceA.formantVowel} resonance</td>
                  <td className="px-4 py-2.5 text-neutral-200 capitalize">{voiceB.formantVowel} resonance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
