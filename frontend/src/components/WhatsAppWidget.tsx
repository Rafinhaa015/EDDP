import { whatsappLink } from '@/lib/site';

export function WhatsAppIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16.004 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.26.6 4.46 1.72 6.4L3.2 28.8l6.57-1.7A12.74 12.74 0 0 0 16 28.8c7.06 0 12.8-5.74 12.8-12.8S23.07 3.2 16.004 3.2Zm0 23.4c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.9 1.01 1.04-3.8-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.85 4.76-10.6 10.6-10.6 5.85 0 10.6 4.75 10.6 10.6 0 5.85-4.75 10.6-10.6 10.6Zm5.82-7.94c-.32-.16-1.89-.93-2.18-1.04-.29-.1-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.14 3.09 1.3 3.3c.16.21 2.25 3.43 5.45 4.81.76.33 1.35.52 1.82.67.76.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** Botão flutuante de suporte via WhatsApp com badge de "mensagem não lida". */
export function WhatsAppWidget() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte pelo WhatsApp"
      className="group fixed right-5 bottom-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40 transition hover:scale-110 focus-visible:scale-110 sm:right-6 sm:bottom-6 sm:h-16 sm:w-16"
    >
      <WhatsAppIcon className="h-8 w-8 sm:h-9 sm:w-9" />
      <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold ring-2 ring-ink-950">
          1
        </span>
      </span>
      <span className="pointer-events-none absolute right-full mr-3 hidden rounded-lg bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap text-ink-950 opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
        Precisa de ajuda? Fale conosco
      </span>
    </a>
  );
}
