import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Crown
} from 'lucide-react';

export default function PalaceMemoryVideo({
  videoSrc = '/intro.mp4',
  posterSrc = '/hero_arabian_palace.jpg'
}) {
  const { language } = useTranslation();
  const { isDark } = useTheme();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const translations = {
    en: {
      tag: 'THE ARCHITECTURE OF MEMORY',
      title: 'Scent as Living Memory',
      definition: 'The olfactory sense is directly tethered to the human limbic system—the ancient cerebral sanctuary of memory and raw emotion. A single inhalation of golden amber or smoked agarwood does not merely recall a moment; it resurrects sovereign palaces, bygone eras, and feelings words can never hold.',
      provenance: 'AL-ANDALUS • 14TH CENTURY ROYAL DISTILLATION ARCHIVE'
    },
    es: {
      tag: 'LA ARQUITECTURA DE LA MEMORIA',
      title: 'El Aroma como Memoria Viva',
      definition: 'El sentido del olfato está conectado directamente con el sistema límbico—el santuario cerebral de la memoria y la emoción. Una sola inhalación de ámbar dorado o madera de agar ahumada no sólo evoca un recuerdo; resucita palacios soberanos, épocas perdidas y emociones eternas.',
      provenance: 'AL-ÁNDALUS • ARCHIVO REAL DE DESTILACIÓN DEL SIGLO XIV'
    },
    bg: {
      tag: 'АРХИТЕКТУРА НА ПАМЕТТА',
      title: 'Ароматът като Жив Спомен',
      definition: 'Обонянието е свързано директно с лимбичната система на човека—древния храм на паметта и емоциите. Едно-единствено вдишване на златен кехлибар или опушен уд не просто припомня момент; то възкресява дворци, изгубени епохи и вечни преживявания.',
      provenance: 'АЛ-АНДАЛУС • КРАЛСКИ ДЕСТИЛАЦИОНЕН АРХИВ'
    }
  };

  const copy = translations[language] || translations.en;

  return (
    <section className={`relative py-20 lg:py-28 border-y transition-colors duration-500 overflow-hidden ${
      isDark ? 'bg-[#0B0A08] border-[#D4AF37]/20 text-[#F3E6D0]' : 'bg-[#CBB198]/90 border-[#D4AF37]/30 text-[#120B06]'
    }`}>
      
      {/* Ambient background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] blur-3xl pointer-events-none ${
        isDark
          ? 'bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,rgba(140,109,55,0.03)_50%,transparent_75%)]'
          : 'bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,rgba(240,230,210,0.4)_50%,transparent_75%)]'
      }`} />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 space-y-12">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs uppercase tracking-[0.28em] font-cin font-bold shadow-md ${
            isDark
              ? 'border-[#D4AF37]/40 bg-[#21130D]/90 text-[#F2D675]'
              : 'border-[#D4AF37]/40 bg-white text-[#8C6239]'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{copy.tag}</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-cinzel font-bold tracking-[0.04em] leading-tight drop-shadow-sm ${
            isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
          }`}>
            {copy.title}
          </h2>

          <p className={`text-sm sm:text-base font-sans font-medium leading-relaxed max-w-2xl mx-auto ${
            isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
          }`}>
            {copy.definition}
          </p>
        </div>

        {/* High-Definition Luxury Video Player Container */}
        <div className={`relative max-w-5xl mx-auto rounded-2xl border overflow-hidden group ${
          isDark
            ? 'border-[#D4AF37]/30 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
            : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
        }`}>
          {/* HTML5 Video */}
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onLoadedData={() => setIsLoaded(true)}
            />

            {/* Subtle luxury vignette over video */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70 pointer-events-none" />

            {/* Provenance Watermark badge */}
            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#F2D675] text-[10px] font-mono tracking-widest uppercase">
              <Crown className="w-3 h-3 text-[#D4AF37]" />
              <span>{copy.provenance}</span>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className={`p-4 sm:p-6 border-t space-y-4 transition-colors ${
            isDark ? 'bg-[#140D07] border-[#D4AF37]/20 text-[#F3E6D0]' : 'bg-[#FAF1DF]/90 border-[#D4AF37]/30 text-[#120B06]'
          }`}>
            
            {/* Scrubber */}
            <div
              onClick={handleSeek}
              className="group/scrub relative w-full h-2 bg-black/20 dark:bg-white/10 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
            >
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between text-xs font-cinzel">
              <div className="flex items-center gap-4">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2.5 px-4 bg-[#D4AF37] hover:bg-[#F2D675] text-black rounded-full transition-colors cursor-pointer flex items-center gap-1.5 font-bold shadow-sm"
                  aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="uppercase tracking-wider text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {/* Mute / Unmute */}
                <button
                  onClick={toggleMute}
                  className={`p-2.5 px-4 border rounded-full transition-colors cursor-pointer flex items-center gap-1.5 font-bold ${
                    isDark
                      ? 'bg-black/60 hover:bg-white/10 text-[#F3E6D0] border-[#D4AF37]/40'
                      : 'bg-[#FAF1DF] hover:bg-white text-[#120B06] border-[#D4AF37]/40'
                  }`}
                  aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span className="uppercase tracking-wider text-xs">{isMuted ? 'Unmute Sound' : 'Mute'}</span>
                </button>
              </div>

              {/* Fullscreen & Quality */}
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
                  isDark
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F2D675]'
                    : 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#8C6239]'
                }`}>
                  4K Master Cut
                </span>
                <button
                  onClick={toggleFullScreen}
                  className={`p-2 border rounded-full transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-[#F3E6D0] border-white/20'
                      : 'bg-black/5 hover:bg-black/10 text-[#120B06] border-black/10'
                  }`}
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Pillars of Memory with High Legibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
          <div className={`p-6 border space-y-2 rounded-2xl transition-colors ${
            isDark
              ? 'bg-[#21130D] border-[#D4AF37]/25 text-[#F3E6D0] shadow-lg'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
          }`}>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
            }`}>Pillar I</span>
            <h4 className={`font-cinzel text-base font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
              The Assamese Agarwood Resonance
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
              Matured over 18 years in crystal vessels, evoking the nocturnal tranquility of Andalusian palace gardens.
            </p>
          </div>

          <div className={`p-6 border space-y-2 rounded-2xl transition-colors ${
            isDark
              ? 'bg-[#21130D] border-[#D4AF37]/25 text-[#F3E6D0] shadow-lg'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
          }`}>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
            }`}>Pillar II</span>
            <h4 className={`font-cinzel text-base font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
              Fossilized Golden Amber
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
              A sacred resin that anchors fleeting moments in eternity, creating an indelible warm olfactory silhouette.
            </p>
          </div>

          <div className={`p-6 border space-y-2 rounded-2xl transition-colors ${
            isDark
              ? 'bg-[#21130D] border-[#D4AF37]/25 text-[#F3E6D0] shadow-lg'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
          }`}>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${
              isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
            }`}>Pillar III</span>
            <h4 className={`font-cinzel text-base font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
              Damascene Rose & Spiced Saffron
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
              Hand-harvested petals at dawn, immortalizing royal ceremonies and the regal warmth of the Sultan’s court.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
