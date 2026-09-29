'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import { site } from '@/lib/site';

/** Vídeo curto de apresentação. Configure NEXT_PUBLIC_INTRO_VIDEO_URL (MP4 ou URL de embed). */
export function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const url = site.introVideoUrl;
  const isEmbed = /youtube|vimeo|mediadelivery|iframe/.test(url);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
      {playing && url ? (
        isEmbed ? (
          <iframe src={url} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen title="Apresentação do curso" />
        ) : (
          <video src={url} className="h-full w-full" autoPlay controls controlsList="nodownload" />
        )
      ) : (
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[url(/covers/mentalidade.svg)] bg-cover bg-center" aria-label="Assistir apresentação">
          <span className="absolute inset-0 bg-ink-950/50" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-ink-950 shadow-xl shadow-brand-500/40 transition group-hover:scale-110">
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </span>
          <span className="relative text-sm font-medium text-white">{playing ? 'Vídeo de apresentação em breve' : 'Assista à apresentação (2 min)'}</span>
        </button>
      )}
    </div>
  );
}
