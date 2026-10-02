"use client";

import { useFlipCard, useCopyLink } from "@/components/flip-card";

// Mirrors the front face's own decorative background (see page.tsx) so the
// flip doesn't jump between two unrelated-looking surfaces.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

/**
 * The navy/gold card's own FlipCard `back` face. A client component (not
 * inline JSX in the server-rendered page) because it needs `useFlipCard()`
 * (for "Volver") and `useCopyLink()` (for "Copiar enlace") — both client-only
 * hooks, and a Server Component page can't pass functions as props to
 * FlipCard to get the same behavior another way.
 */
export function PersonalCardBack({
  fullName,
  qrSvg,
  url,
  serifClassName,
}: {
  fullName: string;
  qrSvg: string;
  url: string;
  serifClassName: string;
}) {
  const { toggleFlip } = useFlipCard();
  const { copied, copyLink } = useCopyLink(url);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-4xl border border-gold/35 bg-onyx px-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.6)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(201,164,92,0.10),transparent_60%)]" />
      </div>

      <div className="relative">
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          Compartí esta tarjeta
        </p>
        <h2
          className={`${serifClassName} mt-1 bg-linear-to-r from-gold-dark via-gold-light to-gold bg-clip-text text-2xl font-semibold text-transparent`}
        >
          {fullName}
        </h2>
      </div>

      {/* Ornamental divider, matching the front face. */}
      <div
        aria-hidden="true"
        className="relative flex w-32 shrink-0 items-center gap-3"
      >
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/70" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/70" />
      </div>

      <div
        className="relative aspect-square w-56 max-w-full rounded-3xl border border-gold/40 bg-[#fdfbf6] p-4 shadow-[0_0_40px_-8px_rgba(201,164,92,0.35)] [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />

      <div className="relative flex flex-col items-center gap-1">
        <p className="text-sm text-neutral-400">Escaneá el código para abrirla</p>
        <button
          type="button"
          onClick={copyLink}
          aria-live="polite"
          className="text-sm text-gold underline underline-offset-2"
        >
          {copied ? "¡Enlace copiado!" : "Copiar enlace"}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleFlip}
        className="relative rounded-full border border-gold/40 px-5 py-2 text-sm font-medium text-neutral-100 transition-colors active:bg-[#101d33]"
      >
        Volver
      </button>
    </div>
  );
}
