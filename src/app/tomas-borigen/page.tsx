import type { ComponentType, SVGProps } from "react";
import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import type { CtaLink } from "@/types/card";
import { getPersonalCard } from "@/lib/data";
import { createQrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/site";
import { FlipCard } from "@/components/flip-card";
import { PersonalCardBack } from "./personal-card-back";
import {
  ChevronRightIcon,
  GlobeIcon,
  InstagramIcon,
  UserPlusIcon,
  WhatsAppIcon,
} from "@/components/icons";

/**
 * Standalone personal card: deep navy & gold, deliberately unlike the
 * company/person cards (no `CtaButton`, no `Company.branding`). It does
 * reuse `FlipCard` for the swipe-to-QR gesture, via that component's `back`
 * prop — FlipCard's own default back face is a plain white card with a
 * brand-color border, which would clash badly here, so this page supplies
 * its own navy/gold back face instead: `PersonalCardBack`
 * (./personal-card-back.tsx), a separate Client Component because it needs
 * FlipCard's `useFlipCard()`/`useCopyLink()` hooks — this (Server Component)
 * page can pass it JSX as a prop, just not a function.
 * Colors come from the `onyx`/`gold*` tokens in globals.css.
 */

// The one hardcoded hex in this file: FlipCard needs a single CSS color
// (not a gradient) for its drag/flip mechanics, unrelated to the `gold`
// Tailwind token used everywhere else in this page's own markup.
const GOLD = "#c9a45c";

const SLUG = "tomas-borigen";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const ICONS: Record<
  NonNullable<CtaLink["icon"]>,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  web: GlobeIcon,
  form: UserPlusIcon,
};

// Very faint grain, like the leather-ish texture of the reference.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

export const viewport: Viewport = {
  themeColor: "#030711",
};

export function generateMetadata(): Metadata {
  const card = getPersonalCard(SLUG);
  if (!card) return { title: "Perfil no encontrado" };

  const title = `${card.firstName} ${card.lastName}`;
  const description = card.jobTitle ?? `Tarjeta personal de ${title}.`;
  const path = `/${card.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Hippo Tarjetas",
      images: card.photoUrl ? [{ url: card.photoUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: card.photoUrl ? [card.photoUrl] : undefined,
    },
  };
}

export default async function TomasBorigenPage() {
  const card = getPersonalCard(SLUG);
  if (!card) notFound();

  const fullName = `${card.firstName} ${card.lastName}`;
  const initials = `${card.firstName[0] ?? ""}${card.lastName[0] ?? ""}`;
  const shareUrl = absoluteUrl(`/${card.slug}`);
  const qrSvg = await createQrSvg(shareUrl);

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-[#030711] bg-[radial-gradient(ellipse_at_top,#16233c_0%,#030711_65%)] p-4">
      <FlipCard
        qrSvg={qrSvg}
        url={shareUrl}
        title={fullName}
        primaryColor={GOLD}
        back={
          <PersonalCardBack
            fullName={fullName}
            qrSvg={qrSvg}
            url={shareUrl}
            serifClassName={serif.className}
          />
        }
      >
        <main className="relative flex h-full w-full flex-col overflow-hidden rounded-4xl border border-gold/35 bg-onyx text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.6)]">
          {/* Background pattern: grain, soft diagonal satin bands, gold side
              hairlines and corner brackets. All decoration, never tappable. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
              style={{ backgroundImage: NOISE }}
            />
            <div className="absolute top-[6%] -left-1/2 h-32 w-[200%] -rotate-35 bg-linear-to-b from-white/7 to-transparent" />
            <div className="absolute top-[22%] -left-1/2 h-20 w-[200%] -rotate-35 bg-linear-to-b from-white/4 to-transparent" />
            <div className="absolute bottom-[4%] -left-1/2 h-40 w-[200%] -rotate-35 bg-linear-to-t from-white/6 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(201,164,92,0.10),transparent_60%)]" />

            <span className="absolute inset-y-16 left-3 w-px bg-linear-to-b from-transparent via-gold/50 to-transparent" />
            <span className="absolute inset-y-16 right-3 w-px bg-linear-to-b from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Monogram, top-left, balancing the top-right bracket. */}
          <div
            className={`${serif.className} absolute top-5 left-7 text-lg tracking-[0.25em] text-gold/80`}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-8 py-8">
            <div className="animate-fade-up shrink-0 rounded-full bg-linear-to-br from-gold-light via-gold-dark to-gold p-0.75 shadow-[0_0_40px_-8px_rgba(201,164,92,0.45)]">
              <div className="rounded-full bg-onyx p-1">
                <div className="relative h-32 w-32 overflow-hidden rounded-full">
                  {card.photoUrl ? (
                    <Image
                      src={card.photoUrl}
                      alt={fullName}
                      fill
                      unoptimized
                      className="object-cover object-[50%_18%] grayscale-[15%]"
                    />
                  ) : (
                    <span
                      className={`${serif.className} flex h-full w-full items-center justify-center text-4xl text-gold`}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className="animate-fade-up shrink-0"
              style={{ animationDelay: "80ms" }}
            >
              <h1
                className={`${serif.className} bg-linear-to-r from-gold-dark via-gold-light to-gold bg-clip-text text-4xl leading-tight font-semibold text-transparent`}
              >
                {fullName}
              </h1>
              {card.jobTitle && (
                <p className="mt-1 text-[11px] font-medium tracking-[0.35em] text-neutral-400 uppercase">
                  {card.jobTitle}
                </p>
              )}
            </div>

            {/* Ornamental divider: hairline — diamond — hairline. */}
            <div
              aria-hidden="true"
              className="animate-fade-up flex w-40 shrink-0 items-center gap-3"
              style={{ animationDelay: "140ms" }}
            >
              <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/70" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/70" />
            </div>

            <ul className="mt-1 flex w-full shrink-0 flex-col gap-2.5">
              {card.links.map((link, i) => {
                const Icon = link.icon ? ICONS[link.icon] : null;
                return (
                  <li
                    key={`${link.label}-${link.url}`}
                    className="animate-fade-up"
                    style={{ animationDelay: `${200 + i * 60}ms` }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-full items-center gap-4 rounded-xl border border-gold/30 bg-onyx/85 px-4 py-3 text-left transition hover:border-gold/70 hover:bg-[#101d33] active:scale-[0.99]"
                    >
                      {Icon && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-neutral-100">
                          {link.label}
                        </span>
                        {link.caption && (
                          <span className="text-[10px] tracking-[0.25em] text-gold/80 uppercase">
                            {link.caption}
                          </span>
                        )}
                      </span>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gold/60 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </main>
      </FlipCard>
    </div>
  );
}
