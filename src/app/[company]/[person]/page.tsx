import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCompany, getPerson } from "@/lib/data";
import { brandBackground } from "@/lib/branding";
import { createQrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/site";
import { CtaButton } from "@/components/cta-button";
import { FlipCard } from "@/components/flip-card";

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

type PersonPageParams = {
  params: Promise<{ company: string; person: string }>;
};

export async function generateMetadata({
  params,
}: PersonPageParams): Promise<Metadata> {
  const { company: companySlug, person: personSlug } = await params;
  const company = getCompany(companySlug);
  const person = getPerson(companySlug, personSlug);
  if (!company || !person) return { title: "Perfil no encontrado" };

  const fullName = `${person.firstName} ${person.lastName}`;
  const title = company.name ? `${fullName} — ${company.name}` : fullName;
  const description = person.jobTitle
    ? `${person.jobTitle}${company.name ? ` en ${company.name}` : ""}`
    : `Perfil digital de ${fullName}.`;
  const path = `/${company.slug}/${person.slug}`;
  const image = person.photoUrl ?? company.logoUrl;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Hippo Tarjetas",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PersonPage({ params }: PersonPageParams) {
  const { company: companySlug, person: personSlug } = await params;
  const company = getCompany(companySlug);
  const person = getPerson(companySlug, personSlug);
  if (!company || !person) notFound();

  const brandStyle = brandBackground(company.branding);
  const shareUrl = absoluteUrl(`/${company.slug}/${person.slug}`);
  const qrSvg = await createQrSvg(shareUrl);
  const displayCompanyName = company.name || company.slug;
  // Reuse the company's own CTA links verbatim (label + url) so "Seguinos"
  // and "Conocé {company}" always match the company page exactly.
  const instagramLink = company.links?.find((l) => l.icon === "instagram");
  const websiteLink = company.links?.find((l) => l.icon === "web");

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-neutral-100 p-4">
      <FlipCard
        qrSvg={qrSvg}
        url={shareUrl}
        title={`${person.firstName} ${person.lastName}`}
        primaryColor={company.branding.primaryColor}
      >
        <main
          className="relative flex h-full w-full flex-col overflow-hidden rounded-4xl border-2 bg-white text-center shadow-xl"
          style={{ borderColor: company.branding.primaryColor }}
        >
          {/* Company logo, bled off the top-left corner — the rounded card
              edge (overflow-hidden on this <main>) naturally clips it into a
              corner "sticker", so no separate circular mask is needed here. */}
          {company.logoUrl && (
            <div className="absolute top-1 left-1 h-24 w-24 shrink-0">
              <Image
                src={company.logoUrl}
                alt={displayCompanyName}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}

          {/* Tagline, top-right — reserves no space on the left so it never
              collides with the bled logo regardless of that logo's size. */}
          {company.tagline && (
            <div className="flex shrink-0 justify-end px-6 pt-6">
              <div>
                {company.tagline.split("\n").map((line) => (
                  <p
                    key={line}
                    className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase"
                  >
                    {line}
                  </p>
                ))}
                <span
                  className="mt-1.5 inline-block h-0.5 w-8"
                  style={{ backgroundColor: company.branding.primaryColor }}
                />
              </div>
            </div>
          )}

          {/* Everything lives in one scrollable region: content is normally
              short enough to just look centered, but if it doesn't fit, this
              area scrolls internally — the page itself never does (same
              pattern as the company page). */}
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-6 pb-4">
            <div
              className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 bg-white"
              style={{ borderColor: company.branding.primaryColor }}
            >
              {person.photoUrl ? (
                <Image
                  src={person.photoUrl}
                  alt={`${person.firstName} ${person.lastName}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={brandStyle}
                >
                  <span className="text-xl font-bold text-white">
                    {getInitials(person.firstName, person.lastName)}
                  </span>
                </div>
              )}
            </div>
            <h1 className="shrink-0 text-2xl font-bold text-black">
              {person.firstName} {person.lastName}
            </h1>
            {person.jobTitle && (
              <p className="shrink-0 text-neutral-500">{person.jobTitle}</p>
            )}

            {/* Quick contact rows, list-style with a trailing chevron:
                WhatsApp is this person's own number; Instagram/website reuse
                the company's own CTA links verbatim so they stay in sync. */}
            <div className="mt-2 flex w-full shrink-0 flex-col gap-2">
              {person.phone && (
                <a
                  href={`tel:${person.phone}`}
                  className="flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-800"
                >
                  Llamar
                </a>
              )}
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-800"
                >
                  Email
                </a>
              )}
              {person.social?.linkedin && (
                <a
                  href={person.social.linkedin}
                  className="flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-800"
                >
                  LinkedIn
                </a>
              )}
              {person.social?.whatsapp && (
                <CtaButton
                  href={person.social.whatsapp}
                  label="WhatsApp"
                  icon="whatsapp"
                  variant="row"
                  primaryColor={company.branding.primaryColor}
                />
              )}
              {instagramLink && (
                <CtaButton
                  href={instagramLink.url}
                  label={instagramLink.label}
                  icon="instagram"
                  variant="row"
                  primaryColor={company.branding.primaryColor}
                />
              )}
              {websiteLink && (
                <CtaButton
                  href={websiteLink.url}
                  label={websiteLink.label}
                  icon="web"
                  variant="row"
                  primaryColor={company.branding.primaryColor}
                />
              )}
            </div>
          </div>

          {/* Accent shape + tagline anchoring the bottom of the card. The
              shape is placed first so it paints below the (relatively
              positioned) tagline text that follows it — see BrandGlow's old
              note on why `position: relative` on the later element, not a
              negative z-index, is what makes that ordering reliable. */}
          {company.footerTagline && (
            <div className="relative h-16 shrink-0">
              <svg
                className="pointer-events-none absolute -bottom-8 -left-12 h-32 w-48"
                viewBox="0 150 320 240"
                aria-hidden="true"
              >
                <path
                  d="M 0 165 L 285 375 L 45 375 C 20 375 0 355 0 330 Z"
                  fill={company.branding.primaryColor}
                />
                <path
                  d="M 110 225 L 305 375"
                  fill="none"
                  stroke={company.branding.primaryColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative flex h-full items-center justify-end px-6">
                <div className="text-right">
                  <span
                    className="mb-1.5 inline-block h-0.5 w-8"
                    style={{ backgroundColor: company.branding.primaryColor }}
                  />
                  {company.footerTagline.split("\n").map((line) => (
                    <p
                      key={line}
                      className="text-[10px] leading-tight font-semibold tracking-widest text-neutral-400 uppercase"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </FlipCard>
    </div>
  );
}
