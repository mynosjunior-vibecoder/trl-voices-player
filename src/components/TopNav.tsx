import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
} from 'lucide-react';
import { VoiceCategory } from '../types/voice';
import { VOICE_CATEGORIES } from '../data/voices';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: VoiceCategory;
  onSelectCategory: (cat: VoiceCategory) => void;
  sortBy: 'popular' | 'duration' | 'pitch' | 'name';
  onSortChange: (sort: 'popular' | 'duration' | 'pitch' | 'name') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filteredCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredCount,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  return (
    <header className="sticky top-0 z-30 bg-[#0c0d12]/95 backdrop-blur-md border-b border-neutral-800/80 px-8 py-3.5 flex flex-col gap-3">
      {/* Top Row: History nav, Search bar, Sort & View toggles */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* History Nav */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => window.history.back()}
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              title="Go forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search voices, personas, accents, tags..."
              className="w-full bg-[#16171f] hover:bg-[#1c1d27] focus:bg-[#1a1b24] text-sm text-neutral-100 placeholder-neutral-500 pl-10 pr-16 py-2 rounded-full border border-neutral-800 focus:border-neutral-600 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 px-1.5 py-0.5 rounded border border-neutral-700/60 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Right Controls: Sort Dropdown, View Toggle, Count */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="font-mono tabular-nums text-neutral-300 font-semibold">{filteredCount}</span>
            <span>{filteredCount === 1 ? 'voice' : 'voices'}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#16171f] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as 'popular' | 'duration' | 'pitch' | 'name')}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-neutral-900 text-neutral-200">Most Popular</option>
              <option value="name" className="bg-neutral-900 text-neutral-200">Name (A-Z)</option>
              <option value="duration" className="bg-neutral-900 text-neutral-200">Duration (Longest)</option>
              <option value="pitch" className="bg-neutral-900 text-neutral-200">Pitch (Low to High)</option>
            </select>
          </div>

          {/* Grid / List view switcher */}
          <div className="flex items-center bg-[#16171f] border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category Pill Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {VOICE_CATEGORIES.map(category => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </header>
  );
};
