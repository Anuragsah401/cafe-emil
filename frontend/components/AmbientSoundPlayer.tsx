'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Play, Pause, Coffee, Music2, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface SoundTrack {
  id: string;
  name: string;
  desc: string;
  icon: string;
  src: string;
}

const TRACKS: SoundTrack[] = [
  {
    id: 'paris-jazz',
    name: 'Fransk Lounge Jazz',
    desc: 'Afslappende café loungemusik',
    icon: '🎹',
    src: '/audio/cafe-jazz.mp3',
  },
  {
    id: 'soft-jazz',
    name: 'Rolig Café Jazz',
    desc: 'Blød vibrafon & dæmpet jazzklaver',
    icon: '🎷',
    src: '/audio/cafe-soft-jazz.mp3',
  },
  {
    id: 'bossa-jazz',
    name: 'Mellow Bossa Nova',
    desc: 'Varm akustisk jazzguitar & blide rytmer',
    icon: '☕',
    src: '/audio/cafe-bossa-jazz.mp3',
  },
];

export default function AmbientSoundPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.35); // Gentle, comfortable 35% default
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  // Initialize on client and automatically play default track (Fransk Lounge Jazz)
  useEffect(() => {
    const savedVol = localStorage.getItem('cafeemil_sound_vol');
    const savedTrack = localStorage.getItem('cafeemil_sound_track');

    if (savedVol) {
      const volNum = parseFloat(savedVol);
      if (!isNaN(volNum) && volNum > 0) {
        setVolume(volNum);
      }
    }
    // Always start unmuted for default autoplay
    setIsMuted(false);

    if (savedTrack) {
      const idx = TRACKS.findIndex((t) => t.id === savedTrack);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      } else {
        setCurrentTrackIndex(0);
      }
    } else {
      setCurrentTrackIndex(0);
    }

    let isSubscribed = true;

    // Function to initiate automatic playback
    const startPlayback = () => {
      if (!audioRef.current || !isSubscribed) return;
      const targetVol = savedVol ? Math.max(0.2, parseFloat(savedVol)) : 0.35;
      audioRef.current.volume = targetVol;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isSubscribed) {
              setIsPlaying(true);
              setShowInvitation(false);
            }
          })
          .catch(() => {
            // Browser autoplay policy prevented unprompted sound without prior user gesture.
            // Attach capture-phase gesture listeners across document to start playing on very first user interaction
            const unlockAudio = () => {
              if (!audioRef.current) return;
              audioRef.current.volume = targetVol;
              const p = audioRef.current.play();
              if (p !== undefined) {
                p.then(() => {
                  if (isSubscribed) {
                    setIsPlaying(true);
                    setShowInvitation(false);
                  }
                  removeUnlockListeners();
                }).catch(() => {
                  // Keep listeners active if not yet unlocked
                });
              }
            };

            const removeUnlockListeners = () => {
              document.removeEventListener('pointerdown', unlockAudio, true);
              document.removeEventListener('mousedown', unlockAudio, true);
              document.removeEventListener('click', unlockAudio, true);
              document.removeEventListener('touchstart', unlockAudio, true);
              document.removeEventListener('touchend', unlockAudio, true);
              document.removeEventListener('keydown', unlockAudio, true);
            };

            document.addEventListener('pointerdown', unlockAudio, { capture: true });
            document.addEventListener('mousedown', unlockAudio, { capture: true });
            document.addEventListener('click', unlockAudio, { capture: true });
            document.addEventListener('touchstart', unlockAudio, { capture: true });
            document.addEventListener('touchend', unlockAudio, { capture: true });
            document.addEventListener('keydown', unlockAudio, { capture: true });
          });
      }
    };

    // Attempt autoplay immediately and after a short tick
    startPlayback();
    const timer = setTimeout(startPlayback, 200);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, []);

  // Update volume on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Play with target volume
  const playAudio = () => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const targetVol = isMuted ? 0 : (volume > 0 ? volume : 0.35);
    const audio = audioRef.current;
    audio.volume = targetVol;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowInvitation(false);
          localStorage.setItem('cafeemil_sound_dismissed', 'true');
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
        });
    }
  };

  // Audio Pause
  const pauseAudio = () => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  // Switch track and automatically play immediately
  const switchTrack = (index: number) => {
    setCurrentTrackIndex(index);
    localStorage.setItem('cafeemil_sound_track', TRACKS[index].id);

    const targetTrack = TRACKS[index];
    if (!targetTrack || !audioRef.current) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const audio = audioRef.current;
    const targetVol = isMuted ? 0 : (volume > 0 ? volume : 0.35);

    // Pause previous sound, update source and volume
    audio.pause();
    audio.src = targetTrack.src;
    audio.currentTime = 0;
    audio.volume = targetVol;

    // Immediately trigger playback since user clicked a track
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowInvitation(false);
        })
        .catch(() => {
          // If the audio buffer needs a moment to load, play on canplay event
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio
              .play()
              .then(() => {
                setIsPlaying(true);
                setShowInvitation(false);
              })
              .catch(() => {});
          };
          audio.addEventListener('canplay', handleCanPlay, { once: true });
        });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    localStorage.setItem('cafeemil_sound_vol', newVol.toString());
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('cafeemil_sound_muted', nextMuted.toString());
  };

  const dismissInvitation = () => {
    setShowInvitation(false);
    localStorage.setItem('cafeemil_sound_dismissed', 'true');
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        autoPlay
        playsInline
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Widget Container (Bottom Left) */}
      <aside 
        aria-label="Baggrundslyd og stemning"
        className="fixed bottom-20 md:bottom-6 left-3 md:left-6 z-40 flex flex-col items-start gap-2 select-none"
      >
        {/* Soft Initial Invitation Toast */}
        {showInvitation && !isPlaying && (
          <div className="fade-up bg-[#141011]/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl max-w-xs text-xs space-y-2.5 animate-bounce-subtle">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hyggelig cafélyd?</span>
              </div>
              <button
                onClick={dismissInvitation}
                className="text-zinc-400 hover:text-white p-0.5 rounded"
                aria-label="Luk"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Oplev Café Emil med autentisk dæmpet baggrundslyd fra caféen.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={playAudio}
                className="px-3.5 py-1.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-md shadow-red-600/30"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Tænd cafélyd</span>
              </button>
              <button
                onClick={dismissInvitation}
                className="px-3 py-1.5 rounded-full text-zinc-400 hover:text-white font-medium text-[11px]"
              >
                Nej tak
              </button>
            </div>
          </div>
        )}

        {/* Expanded Controls Drawer */}
        {isExpanded && (
          <div className="bg-[#141011]/95 backdrop-blur-2xl border border-white/15 p-4 rounded-3xl shadow-2xl w-64 space-y-3.5 animate-page-enter">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Vælg Baggrundslyd</span>
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-full"
                aria-label="Luk panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Track Selector Buttons */}
            <div className="space-y-1.5">
              {TRACKS.map((track, idx) => {
                const isSelected = currentTrackIndex === idx;
                return (
                  <button
                    key={track.id}
                    onClick={() => switchTrack(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/20 text-white font-bold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-lg shrink-0">{track.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold">{track.name}</div>
                      <div className="text-[10px] text-zinc-400 font-normal truncate">
                        {track.desc}
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-amber-400 h-full animate-pulse" />
                        <span className="w-0.5 bg-amber-400 h-2 animate-pulse delay-75" />
                        <span className="w-0.5 bg-amber-400 h-3 animate-pulse delay-150" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Slider Row */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <button
                  onClick={toggleMute}
                  className="flex items-center gap-1 hover:text-white font-medium"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Lydstyrke</span>
                </button>
                <span className="font-mono text-zinc-400 text-[10px]">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emil-red"
                aria-label="Lydstyrke"
              />
            </div>
          </div>
        )}

        {/* Floating Pill Main Trigger */}
        <div className="group bg-[#141011]/90 hover:bg-[#181315] backdrop-blur-xl border border-white/15 hover:border-white/25 rounded-full p-1.5 pr-3.5 shadow-2xl flex items-center gap-2.5 transition-all">
          {/* Play / Pause Circular Button */}
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emil-red text-white shadow-lg shadow-red-600/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label={isPlaying ? 'Pause baggrundslyd' : 'Afspil baggrundslyd'}
            title={isPlaying ? 'Pause hyggelyd' : 'Tænd hyggelyd'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Equalizer Visualizer & Track Info */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer flex items-center gap-2 text-left"
            title="Klik for at justere lyd eller skifte spor"
          >
            {/* Animated Equalizer Wave Bars when playing */}
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0">
              <span
                className={`w-0.5 bg-amber-400 rounded-full transition-all duration-300 ${
                  isPlaying ? 'h-3.5 animate-pulse' : 'h-1 bg-zinc-500'
                }`}
              />
              <span
                className={`w-0.5 bg-amber-400 rounded-full transition-all duration-300 ${
                  isPlaying ? 'h-2 animate-pulse delay-100' : 'h-1.5 bg-zinc-500'
                }`}
              />
              <span
                className={`w-0.5 bg-amber-400 rounded-full transition-all duration-300 ${
                  isPlaying ? 'h-3 animate-pulse delay-200' : 'h-1 bg-zinc-500'
                }`}
              />
            </div>

            <div className="text-[11px] leading-none">
              <div className="font-bold text-white flex items-center gap-1">
                <span>{currentTrack.name}</span>
                <span className="text-[9px] text-amber-400 font-mono">
                  {isPlaying ? '• LIVE' : ''}
                </span>
              </div>
              <div className="text-[9px] text-zinc-400 mt-1 font-medium">
                {isPlaying ? 'Afspiller i baggrunden' : 'Klik for at tænde'}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-zinc-400 hover:text-white ml-1 p-0.5"
              aria-label="Fold lydpanel ud"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

