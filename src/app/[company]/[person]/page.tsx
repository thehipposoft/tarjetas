import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCompany, getPerson } from "@/lib/data";
import { brandBackground, logoBackgroundStyle } from "@/lib/branding";
import { CtaButton } from "@/components/cta-button";

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
  const displayCompanyName = company.name || company.slug;
  // Reuse the company's own CTA links verbatim (label + url) so "Seguinos"
  // and "Conocé {company}" always match the company page exactly.
  const instagramLink = company.links?.find((l) => l.icon === "instagram");
  const websiteLink = company.links?.find((l) => l.icon === "web");
  const hasCompanyLinks = Boolean(
    person.social?.whatsapp || instagramLink || websiteLink
  );

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-neutral-100 p-4">
      <main
        className="relative mx-auto flex h-full max-h-184 w-full max-w-107.5 flex-col items-center overflow-hidden rounded-4xl border-2 bg-white p-4 text-center shadow-xl"
        style={{ borderColor: company.branding.primaryColor }}
      >
        {/* Company logo, top-left — links this card back to its company
            visually without repeating the name in text. */}
        {company.logoUrl && (
          <div
            className="absolute top-4 left-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={logoBackgroundStyle(company.branding, true)}
          >
            <Image
              src={company.logoUrl}
              alt={displayCompanyName}
              width={60}
              height={60}
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {/* Everything lives in one scrollable region: content is normally
            short enough to just look centered, but if it doesn't fit, this
            area scrolls internally — the page itself never does (same
            pattern as the company page). */}
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 overflow-y-auto">
          <div
            className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={brandStyle}
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
              <span className="text-xl font-bold text-white">
                {getInitials(person.firstName, person.lastName)}
              </span>
            )}
          </div>
          <h1 className="shrink-0 text-2xl font-bold">
            {person.firstName} {person.lastName}
          </h1>
          {person.jobTitle && (
            <p className="shrink-0 text-neutral-500">{person.jobTitle}</p>
          )}

          <div className="mt-2 flex shrink-0 flex-wrap justify-center gap-3">
            {person.phone && (
              <a
                href={`tel:${person.phone}`}
                className="rounded-full border px-4 py-2 text-sm"
              >
                Call
              </a>
            )}
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="rounded-full border px-4 py-2 text-sm"
              >
                Email
              </a>
            )}
            {person.social?.linkedin && (
              <a
                href={person.social.linkedin}
                className="rounded-full border px-4 py-2 text-sm"
              >
                LinkedIn
              </a>
            )}
          </div>

          {/* CTAs tied to the company profile: this person's own WhatsApp
              number, plus the company's own Instagram/website links. */}
          {hasCompanyLinks && (
            <div className="mt-2 flex w-full shrink-0 flex-col gap-3">
              {person.social?.whatsapp && (
                <CtaButton
                  href={person.social.whatsapp}
                  label="WhatsApp"
                  icon="whatsapp"
                  style={brandStyle}
                />
              )}
              {instagramLink && (
                <CtaButton
                  href={instagramLink.url}
                  label={instagramLink.label}
                  icon="instagram"
                  style={brandStyle}
                />
              )}
              {websiteLink && (
                <CtaButton
                  href={websiteLink.url}
                  label={websiteLink.label}
                  icon="web"
                  style={brandStyle}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
