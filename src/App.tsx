import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VOICES_DATA, CURATED_PACKS } from './data/voices';
import { Voice, VoiceCategory } from './types/voice';
import { audioEngine } from './services/audioEngine';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HeroFeatured } from './components/HeroFeatured';
import { VoiceCard } from './components/VoiceCard';
import { VoiceRow } from './components/VoiceRow';
import { PlayerBar } from './components/PlayerBar';
import { ScriptDrawer } from './components/ScriptDrawer';
import { QueueDrawer } from './components/QueueDrawer';
import { VoiceDetailModal } from './components/VoiceDetailModal';
import { VoiceComparisonModal } from './components/VoiceComparisonModal';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { Sparkles, Heart, Search } from 'lucide-react';

export default function App() {
  // Voice list & playback state
  const [currentVoice, setCurrentVoice] = useState<Voice | null>(VOICES_DATA[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(VOICES_DATA[0].duration);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Filters, search, views
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<VoiceCategory>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'duration' | 'pitch' | 'name'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState<'all' | 'favorites' | 'featured'>('all');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  // User state
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('trl_voice_favs');
      return saved ? new Set(JSON.parse(saved)) : new Set(['aria-vance', 'sora-lin']);
    } catch {
      return new Set(['aria-vance', 'sora-lin']);
    }
  });

  const [queue, setQueue] = useState<Voice[]>([]);

  // Drawers and modals
  const [isScriptOpen, setIsScriptOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [detailVoice, setDetailVoice] = useState<Voice | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Featured voice for spotlight banner
  const featuredVoice = useMemo(() => {
    return VOICES_DATA.find(v => v.featured) || VOICES_DATA[0];
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trl_voice_favs', JSON.stringify(Array.from(favorites)));
    } catch {
      // Ignore
    }
  }, [favorites]);

  // Audio Engine Observers
  useEffect(() => {
    const unsubTime = audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    const unsubState = audioEngine.onStateChange(playing => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  // Filter and sort voices
  const filteredVoices = useMemo(() => {
    let result = [...VOICES_DATA];

    // Filter by Tab
    if (currentTab === 'favorites') {
      result = result.filter(v => favorites.has(v.id));
    } else if (currentTab === 'featured') {
      result = result.filter(v => v.featured || v.trlLevel === 'TRL 9');
    }

    // Filter by Curated Pack
    if (selectedPackId) {
      if (selectedPackId === 'cinematic-titans') {
        result = result.filter(v => v.category === 'Cinematic' || v.tone.includes('Epic') || v.category === 'Documentary');
      } else if (selectedPackId === 'smart-agents') {
        result = result.filter(v => v.category === 'Conversational' || v.category === 'Technical');
      } else if (selectedPackId === 'audiobook-masters') {
        result = result.filter(v => v.category === 'Narration' || v.category === 'Meditation');
      } else if (selectedPackId === 'commercial-prime') {
        result = result.filter(v => v.category === 'Commercial');
      }
    } else if (activeCategory !== 'All') {
      // Filter by Category
      result = result.filter(v => v.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        v =>
          v.name.toLowerCase().includes(q) ||
          v.persona.toLowerCase().includes(q) ||
          v.code.toLowerCase().includes(q) ||
          v.accent.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.tone.some(t => t.toLowerCase().includes(q)) ||
          v.sampleScript.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'popular') return b.playsCount - a.playsCount;
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'pitch') return a.basePitchHz - b.basePitchHz;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [currentTab, selectedPackId, activeCategory, searchQuery, sortBy, favorites]);

  // Audio Playback Handlers
  const handleTogglePlay = useCallback(
    (voice?: Voice) => {
      const targetVoice = voice || currentVoice || VOICES_DATA[0];
      if (currentVoice?.id !== targetVoice.id) {
        setCurrentVoice(targetVoice);
        setDuration(targetVoice.duration);
        setCurrentTime(0);
        audioEngine.play(targetVoice, 0);
      } else {
        audioEngine.togglePlay(targetVoice);
      }
    },
    [currentVoice]
  );

  const handleSeek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const handleNext = useCallback(() => {
    // 1. Pop from queue if available
    if (queue.length > 0) {
      const [nextVoice, ...remainingQueue] = queue;
      setQueue(remainingQueue);
      setCurrentVoice(nextVoice);
      setDuration(nextVoice.duration);
      setCurrentTime(0);
      audioEngine.play(nextVoice, 0);
      return;
    }

    // 2. Play next in list or shuffle
    if (filteredVoices.length === 0) return;
    if (shuffle) {
      const randomIdx = Math.floor(Math.random() * filteredVoices.length);
      const nextVoice = filteredVoices[randomIdx];
      setCurrentVoice(nextVoice);
      setDuration(nextVoice.duration);
      setCurrentTime(0);
      audioEngine.play(nextVoice, 0);
      return;
    }

    const currentIdx = filteredVoices.findIndex(v => v.id === currentVoice?.id);
    const nextIdx = (currentIdx + 1) % filteredVoices.length;
    const nextVoice = filteredVoices[nextIdx];
    setCurrentVoice(nextVoice);
    setDuration(nextVoice.duration);
    setCurrentTime(0);
    audioEngine.play(nextVoice, 0);
  }, [queue, filteredVoices, shuffle, currentVoice]);

  const handlePrev = useCallback(() => {
    // If playback > 3s, restart current voice
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }

    if (filteredVoices.length === 0) return;
    const currentIdx = filteredVoices.findIndex(v => v.id === currentVoice?.id);
    const prevIdx = (currentIdx - 1 + filteredVoices.length) % filteredVoices.length;
    const prevVoice = filteredVoices[prevIdx];
    setCurrentVoice(prevVoice);
    setDuration(prevVoice.duration);
    setCurrentTime(0);
    audioEngine.play(prevVoice, 0);
  }, [currentTime, handleSeek, filteredVoices, currentVoice]);

  // Handle track end event
  useEffect(() => {
    const unsub = audioEngine.onTrackEnd(() => {
      if (repeatMode === 'one' && currentVoice) {
        audioEngine.play(currentVoice, 0);
      } else if (repeatMode === 'all' || queue.length > 0) {
        handleNext();
      }
    });
    return () => unsub();
  }, [repeatMode, currentVoice, queue, handleNext]);

  // Volume & Speed Handlers
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    audioEngine.setPlaybackRate(rate);
  };

  // Favorites & Queue
  const handleToggleFavorite = (voiceId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(voiceId)) {
        next.delete(voiceId);
      } else {
        next.add(voiceId);
      }
      return next;
    });
  };

  const handleAddToQueue = (voice: Voice) => {
    setQueue(prev => {
      if (prev.some(v => v.id === voice.id)) {
        return prev.filter(v => v.id !== voice.id);
      }
      return [...prev, voice];
    });
  };

  const handlePlayFromQueue = (voice: Voice) => {
    setQueue(prev => prev.filter(v => v.id !== voice.id));
    setCurrentVoice(voice);
    setDuration(voice.duration);
    setCurrentTime(0);
    audioEngine.play(voice, 0);
  };

  const handleMoveQueueItem = (fromIdx: number, toIdx: number) => {
    setQueue(prev => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  // Keyboard navigation & playback controls
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [handleTogglePlay, handleSeek, currentTime, duration]);

  // Test custom speech in detail modal
  const handleTestCustomSpeech = (text: string, voice: Voice) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = Math.max(0.6, Math.min(1.6, voice.basePitchHz / 180));
      utterance.rate = Math.max(0.7, Math.min(1.4, (voice.tempoBpm / 85) * playbackRate));

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matched = voices.find(v => {
          const vName = v.name.toLowerCase();
          const vLang = v.lang.toLowerCase();
          if (voice.accent.includes('British') && (vLang.includes('en-gb') || vName.includes('uk'))) return true;
          if (voice.gender === 'Female' && (vName.includes('female') || vName.includes('samantha'))) return true;
          if (voice.gender === 'Male' && (vName.includes('male') || vName.includes('david'))) return true;
          return vLang.startsWith('en');
        });
        if (matched) utterance.voice = matched;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0d] text-[#f1f3f5] font-sans antialiased">
      {/* 1. Spotify Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        onSelectCategory={cat => {
          setActiveCategory(cat);
          setCurrentTab('all');
        }}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        favoritesCount={favorites.size}
        onOpenCompare={() => setIsCompareOpen(true)}
        onSelectPack={id => {
          setSelectedPackId(id);
          if (id) setCurrentTab('all');
        }}
        selectedPackId={selectedPackId}
      />

      {/* 2. Main Scrollable Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e0f16]">
        {/* Top Navbar */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredVoices.length}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 pb-28">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Spotlight Banner: only shown when exploring All or Featured without active search query */}
            {!searchQuery && (currentTab === 'all' || currentTab === 'featured') && !selectedPackId && (
              <HeroFeatured
                voice={featuredVoice}
                isPlaying={isPlaying}
                isCurrent={currentVoice?.id === featuredVoice.id}
                currentTime={currentTime}
                onTogglePlay={handleTogglePlay}
                onSeek={handleSeek}
                onAddToQueue={handleAddToQueue}
                isInQueue={queue.some(v => v.id === featuredVoice.id)}
                onOpenDetails={setDetailVoice}
              />
            )}

            {/* Active Section Header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {currentTab === 'favorites' ? (
                    <>
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <span>Saved Voices Library</span>
                    </>
                  ) : currentTab === 'featured' ? (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span>Spotlight TRL 9 Models</span>
                    </>
                  ) : selectedPackId ? (
                    <>
                      <span>{CURATED_PACKS.find(p => p.id === selectedPackId)?.title}</span>
                    </>
                  ) : activeCategory === 'All' ? (
                    <span>All Voice Models</span>
                  ) : (
                    <span>{activeCategory} Category</span>
                  )}
                </h2>

                <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                  {filteredVoices.length} {filteredVoices.length === 1 ? 'Voice' : 'Voices'}
                </span>
              </div>

              {/* Reset filter quick button if searching */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Empty state when no voices match query */}
            {filteredVoices.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/30">
                <Search className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-neutral-200">No matching voice models found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                  {searchQuery
                    ? `No voices match "${searchQuery}". Try searching by accent, persona, or tone keyword.`
                    : 'Your saved favorites list is currently empty. Tap the heart icon on any voice to bookmark it.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                    setCurrentTab('all');
                    setSelectedPackId(null);
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVoices.map(voice => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isPlaying={isPlaying}
                    isCurrent={currentVoice?.id === voice.id}
                    currentTime={currentTime}
                    isFavorite={favorites.has(voice.id)}
                    isInQueue={queue.some(v => v.id === voice.id)}
                    onTogglePlay={handleTogglePlay}
                    onSeek={handleSeek}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToQueue={handleAddToQueue}
                    onOpenDetails={setDetailVoice}
                  />
                ))}
              </div>
            ) : (
              /* Spotify List View */
              <div className="space-y-1">
                {/* List Header */}
                <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
                    <span className="w-6 text-center">#</span>
                    <span>Title & Persona</span>
                  </div>
                  <span className="hidden lg:block w-52">Category & Accent</span>
                  <span className="hidden md:block w-48 lg:w-64 px-2">Waveform Preview</span>
                  <span className="w-12 text-right">Duration</span>
                </div>

                {/* List Rows */}
                {filteredVoices.map((voice, idx) => (
                  <VoiceRow
                    key={voice.id}
                    voice={voice}
                    index={idx}
                    isPlaying={isPlaying}
                    isCurrent={currentVoice?.id === voice.id}
                    currentTime={currentTime}
                    isFavorite={favorites.has(voice.id)}
                    isInQueue={queue.some(v => v.id === voice.id)}
                    onTogglePlay={handleTogglePlay}
                    onSeek={handleSeek}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToQueue={handleAddToQueue}
                    onOpenDetails={setDetailVoice}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Sticky Bottom Player Bar */}
      <PlayerBar
        currentVoice={currentVoice}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isFavorite={currentVoice ? favorites.has(currentVoice.id) : false}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        shuffle={shuffle}
        repeatMode={repeatMode}
        isScriptOpen={isScriptOpen}
        isQueueOpen={isQueueOpen}
        queueCount={queue.length}
        onTogglePlay={() => handleTogglePlay()}
        onSeek={handleSeek}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleShuffle={() => setShuffle(!shuffle)}
        onToggleRepeat={() => {
          if (repeatMode === 'off') setRepeatMode('all');
          else if (repeatMode === 'all') setRepeatMode('one');
          else setRepeatMode('off');
        }}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onRateChange={handleRateChange}
        onToggleFavorite={handleToggleFavorite}
        onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        onToggleFullScreen={() => setIsFullScreen(true)}
        onOpenDetails={setDetailVoice}
      />

      {/* 4. Teleprompter / Script Drawer */}
      <ScriptDrawer
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
        voice={currentVoice}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      {/* 5. Audition Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentVoice={currentVoice}
        queue={queue}
        onPlayFromQueue={handlePlayFromQueue}
        onRemoveFromQueue={id => setQueue(q => q.filter(v => v.id !== id))}
        onMoveQueueItem={handleMoveQueueItem}
        onClearQueue={() => setQueue([])}
      />

      {/* 6. Voice Detail & Custom Script Modal */}
      <VoiceDetailModal
        voice={detailVoice}
        isOpen={detailVoice !== null}
        onClose={() => setDetailVoice(null)}
        isPlaying={isPlaying && currentVoice?.id === detailVoice?.id}
        currentTime={currentVoice?.id === detailVoice?.id ? currentTime : 0}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onTestCustomSpeech={handleTestCustomSpeech}
      />

      {/* 7. A/B Voice Comparison Lab Modal */}
      <VoiceComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        allVoices={VOICES_DATA}
        currentPlayingVoice={currentVoice}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlayVoice={handleTogglePlay}
        onPauseVoice={() => audioEngine.pause()}
        onSeek={handleSeek}
      />

      {/* 8. Immersive Full-Screen Player Mode */}
      <FullScreenPlayer
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        voice={currentVoice}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isFavorite={currentVoice ? favorites.has(currentVoice.id) : false}
        volume={volume}
        isMuted={isMuted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        onTogglePlay={() => handleTogglePlay()}
        onSeek={handleSeek}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleShuffle={() => setShuffle(!shuffle)}
        onToggleRepeat={() => {
          if (repeatMode === 'off') setRepeatMode('all');
          else if (repeatMode === 'all') setRepeatMode('one');
          else setRepeatMode('off');
        }}
        onToggleFavorite={handleToggleFavorite}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}
