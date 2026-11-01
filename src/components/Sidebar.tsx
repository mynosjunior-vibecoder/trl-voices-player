import React from 'react';
import {
  Mic2,
  Compass,
  Heart,
  GitCompare,
  Sliders,
  Sparkles,
  Layers,
  Radio,
  BookOpen,
  MessageSquare,
  Film,
  ShoppingBag,
  Gamepad2,
  Moon,
  Cpu,
  Globe,
} from 'lucide-react';
import { VoiceCategory } from '../types/voice';
import { CURATED_PACKS, VOICE_CATEGORIES } from '../data/voices';

interface SidebarProps {
  activeCategory: VoiceCategory;
  onSelectCategory: (cat: VoiceCategory) => void;
  currentTab: 'all' | 'favorites' | 'featured';
  setCurrentTab: (tab: 'all' | 'favorites' | 'featured') => void;
  favoritesCount: number;
  onOpenCompare: () => void;
  onSelectPack: (packId: string) => void;
  selectedPackId: string | null;
}

const CATEGORY_ICONS: Record<VoiceCategory, React.ElementType> = {
  All: Radio,
  Narration: BookOpen,
  Conversational: MessageSquare,
  Cinematic: Film,
  Commercial: ShoppingBag,
  Character: Gamepad2,
  Meditation: Moon,
  Technical: Cpu,
  Documentary: Globe,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  currentTab,
  setCurrentTab,
  favoritesCount,
  onOpenCompare,
  onSelectPack,
  selectedPackId,
}) => {
  return (
    <aside className="w-64 bg-[#0a0a0d] border-r border-neutral-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1db954] to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Mic2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">TRL VOICES</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Studio Vocal Platform</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => {
            setCurrentTab('all');
            onSelectPack('');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'all' && !selectedPackId
              ? 'bg-neutral-800/90 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Discover Voices</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('featured');
            onSelectPack('');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'featured'
              ? 'bg-neutral-800/90 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Spotlight Selection</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('favorites');
            onSelectPack('');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentTab === 'favorites'
              ? 'bg-neutral-800/90 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Saved Voices</span>
          </div>
          {favoritesCount > 0 && (
            <span className="text-xs font-mono text-neutral-400 px-1.5 py-0.2 bg-neutral-800 rounded">
              {favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenCompare}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors"
        >
          <GitCompare className="w-4 h-4 text-cyan-400" />
          <span>A/B Comparison Lab</span>
        </button>
      </div>

      <div className="my-2 mx-4 border-t border-neutral-800/60" />

      {/* Voice Categories Filter */}
      <div className="px-4 py-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Categories
          </span>
          <Sliders className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
          {VOICE_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = activeCategory === cat && !selectedPackId;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onSelectPack('');
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-2 mx-4 border-t border-neutral-800/60" />

      {/* Curated Voice Packs */}
      <div className="px-4 py-1 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Curated Packs
          </span>
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="space-y-1">
          {CURATED_PACKS.map(pack => {
            const isSelected = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                onClick={() => onSelectPack(pack.id)}
                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-neutral-800 text-white ring-1 ring-emerald-500/30'
                    : 'text-neutral-300 hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">{pack.title}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{pack.count}</span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{pack.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Studio Specs Footer */}
      <div className="p-4 border-t border-neutral-800/80 bg-[#08080a]">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span className="font-mono text-neutral-400">ENGINE TRL-X</span>
          <span className="text-emerald-400 font-mono">48kHz / 24-bit</span>
        </div>
        <div className="w-full bg-neutral-800/80 rounded-full h-1 mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1 w-full animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
