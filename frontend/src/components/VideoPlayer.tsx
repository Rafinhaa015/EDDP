'use client';

import type Hls from 'hls.js';
import { Loader2, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatClock } from '@/lib/format';

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

interface Props {
  src: string;
  startAt?: number;
  watermark?: string | null;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  onStreamError?: () => void;
  children?: React.ReactNode; // overlay (ex.: tela de fim de aula)
}

export function VideoPlayer({ src, startAt = 0, watermark, onProgress, onEnded, onStreamError, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastReport = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState('');
  const [wmPos, setWmPos] = useState({ top: 12, left: 10 });

  // Carrega a mídia (HLS nativo no Safari/iOS, hls.js nos demais navegadores).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    setError('');
    setWaiting(true);

    const seekToStart = () => {
      if (startAt > 5 && video.duration && startAt < video.duration - 10) video.currentTime = startAt;
    };
    video.addEventListener('loadedmetadata', seekToStart, { once: true });

    const isHls = /\.m3u8(\?|$)/.test(src) || src.includes('.m3u8');
    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: HlsCtor }) => {
        if (cancelled) return;
        if (!HlsCtor.isSupported()) {
          setError('Seu navegador não suporta este vídeo.');
          return;
        }
        const hls = new HlsCtor({ enableWorker: true, lowLatencyMode: false });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          if (data.type === HlsCtor.ErrorTypes.NETWORK_ERROR) {
            setError('Falha ao carregar o vídeo. Verifique sua conexão.');
            onStreamError?.();
          } else if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('Não foi possível reproduzir este vídeo.');
          }
        });
      });
    } else {
      video.src = src;
    }

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', seekToStart);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute('src');
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Marca d'água muda de posição periodicamente para dificultar recortes.
  useEffect(() => {
    if (!watermark) return;
    const id = setInterval(() => setWmPos({ top: 8 + Math.random() * 75, left: 5 + Math.random() * 60 }), 20_000);
    return () => clearInterval(id);
  }, [watermark]);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) v.play().catch(() => undefined);
    else v.pause();
  }, []);

  const seek = useCallback((delta: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el?.requestFullscreen) el.requestFullscreen();
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else video?.webkitEnterFullscreen?.(); // iOS
  }, []);

  const changeSpeed = (s: number) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
    setSpeedOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type !== 'range') return;
    const keys: Record<string, () => void> = {
      ' ': togglePlay,
      k: togglePlay,
      ArrowRight: () => seek(10),
      ArrowLeft: () => seek(-10),
      f: toggleFullscreen,
      m: () => videoRef.current && (videoRef.current.muted = !videoRef.current.muted),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const report = (t: number, force = false) => {
    if (force || Math.abs(t - lastReport.current) >= 15) {
      lastReport.current = t;
      onProgress?.(Math.floor(t));
    }
  };

  const pct = duration ? (time / duration) * 100 : 0;
  const btn = 'flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/15';

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`group/player relative aspect-video w-full overflow-hidden bg-black select-none ${fullscreen ? '' : 'rounded-2xl'} ${controlsVisible ? '' : 'cursor-none'}`}
      aria-label="Player de vídeo. Espaço: reproduzir/pausar, setas: avançar/voltar 10s, F: tela cheia."
    >
      <video
        ref={videoRef}
        className="h-full w-full"
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => { setPlaying(true); showControls(); }}
        onPause={() => { setPlaying(false); setControlsVisible(true); report(videoRef.current?.currentTime ?? 0, true); }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = speed; }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => { setTime(e.currentTarget.currentTime); report(e.currentTarget.currentTime); }}
        onProgress={(e) => {
          const b = e.currentTarget.buffered;
          if (b.length && e.currentTarget.duration) setBuffered((b.end(b.length - 1) / e.currentTarget.duration) * 100);
        }}
        onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume); }}
        onEnded={() => { setPlaying(false); report(duration, true); onEnded?.(); }}
      />

      {watermark && (
        <span
          className="pointer-events-none absolute z-10 text-xs font-medium whitespace-nowrap text-white/25 transition-all duration-[2000ms] sm:text-sm"
          style={{ top: `${wmPos.top}%`, left: `${wmPos.left}%` }}
          aria-hidden
        >
          {watermark}
        </span>
      )}

      {waiting && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      )}

      {!playing && !waiting && !error && !children && (
        <button onClick={togglePlay} className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-ink-950 shadow-2xl shadow-brand-500/30 transition hover:scale-105" aria-label="Reproduzir">
          <Play className="ml-1 h-9 w-9" fill="currentColor" />
        </button>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-sm text-slate-200">
          <p>{error}</p>
        </div>
      )}

      {children}

      {/* Controles */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-10 pb-2 transition-opacity duration-300 sm:px-4 ${
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="relative mb-2 flex items-center">
          <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/30" style={{ width: `${buffered}%` }} />
          </div>
          <div className="pointer-events-none absolute h-1 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          <input
            type="range"
            className="player-range relative bg-transparent"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = t;
              setTime(t);
            }}
            aria-label="Barra de tempo"
            aria-valuetext={`${formatClock(time)} de ${formatClock(duration)}`}
            style={{ background: 'transparent' }}
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className={btn} onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproduzir'}>
            {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </button>
          <button className={`${btn} hidden sm:flex`} onClick={() => seek(-10)} aria-label="Voltar 10 segundos"><RotateCcw className="h-4 w-4" /></button>
          <button className={`${btn} hidden sm:flex`} onClick={() => seek(10)} aria-label="Avançar 10 segundos"><RotateCw className="h-4 w-4" /></button>
          <div className="group/vol flex items-center">
            <button className={btn} onClick={() => videoRef.current && (videoRef.current.muted = !muted)} aria-label={muted ? 'Ativar som' : 'Silenciar'}>
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              className="player-range hidden w-0 transition-all group-hover/vol:w-20 focus:w-20 sm:block"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = videoRef.current;
                if (!v) return;
                v.volume = Number(e.target.value);
                v.muted = v.volume === 0;
              }}
              aria-label="Volume"
            />
          </div>
          <span className="ml-1 text-xs text-white tabular-nums sm:text-sm">
            {formatClock(time)} <span className="text-white/50">/ {formatClock(duration)}</span>
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <button
                className="h-9 rounded-lg px-2.5 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => setSpeedOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={speedOpen}
                aria-label={`Velocidade: ${speed}x`}
              >
                {speed}x
              </button>
              {speedOpen && (
                <div role="menu" className="absolute right-0 bottom-11 w-28 overflow-hidden rounded-xl border border-white/10 bg-ink-850/95 py-1 shadow-2xl backdrop-blur">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      role="menuitemradio"
                      aria-checked={speed === s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${speed === s ? 'font-bold text-brand-400' : 'text-white'}`}
                    >
                      {s === 1 ? 'Normal' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className={btn} onClick={toggleFullscreen} aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
