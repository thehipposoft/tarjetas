import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyPeople } from "@/lib/data";
import { brandBackground, logoBackgroundStyle } from "@/lib/branding";
import { mapEmbedSrc } from "@/lib/maps";
import { CtaButton } from "@/components/cta-button";
import { MapPinIcon } from "@/components/icons";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/**
 * Hands out increasing animation-delays so page sections cascade in one
 * after another, in render order, regardless of how many links/sections a
 * given company has.
 */
function createStagger(stepMs = 70) {
  let step = 0;
  return (extra?: CSSProperties): CSSProperties => ({
    ...extra,
    animationDelay: `${step++ * stepMs}ms`,
  });
}

type CompanyPageParams = { params: Promise<{ company: string }> };

export async function generateMetadata({
  params,
}: CompanyPageParams): Promise<Metadata> {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) return { title: "Perfil no encontrado" };

  const displayName = company.name || company.slug;
  const description =
    company.description || `Perfil digital de ${displayName}.`;
  const path = `/${company.slug}`;

  return {
    title: displayName,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: displayName,
      description,
      url: path,
      siteName: "Hippo Tarjetas",
      images: company.logoUrl ? [{ url: company.logoUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title: displayName,
      description,
      images: company.logoUrl ? [company.logoUrl] : undefined,
    },
  };
}

export default async function CompanyPage({ params }: CompanyPageParams) {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const people = getCompanyPeople(companySlug);
  const brandStyle = brandBackground(company.branding);
  const stagger = createStagger();
  const mapSrc = mapEmbedSrc(company);

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-neutral-100 p-4">
      <main
        className="mx-auto flex h-full max-h-184 w-full max-w-107.5 flex-col items-center overflow-hidden rounded-4xl border-2 bg-white px-4 py-4 shadow-xl"
        style={{ borderColor: company.branding.primaryColor }}
      >
        {/* Logo / avatar */}
        <div
          className="animate-fade-up relative flex h-30 w-30 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={stagger(
            logoBackgroundStyle(company.branding, Boolean(company.logoUrl))
          )}
        >
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={company.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-white">
              {getInitials(company.name)}
            </span>
          )}
        </div>

        {company.description && (
          <p
            className="animate-fade-up mt-1 shrink-0 text-center text-sm text-neutral-500"
            style={stagger()}
          >
            {company.description}
          </p>
        )}

        {/* Scrollable content: only this area scrolls if a company has enough
            links/team members to overflow — the page itself never does. */}
        <div className="mt-2 flex min-h-0 w-full flex-1 flex-col items-center gap-6 overflow-y-auto pb-2">
          {/* Link-in-bio CTA buttons */}
          {company.links && company.links.length > 0 && (
            <div className="flex w-full flex-col gap-3">
              {company.links.map((link) => (
                <CtaButton
                  key={link.url}
                  href={link.url}
                  label={link.label}
                  icon={link.icon}
                  className="animate-fade-up"
                  style={stagger(brandStyle)}
                />
              ))}
            </div>
          )}

          {/* Location */}
          {mapSrc && (
            <section className="animate-fade-up w-full" style={stagger()}>
              {company.address && (
                <p className="mt-2 text-center text-sm text-neutral-600">
                  {company.address}
                </p>
              )}
              <iframe
                title={`Mapa de ${company.name}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="mt-3 h-46 w-full rounded-2xl border-0"
              />
              {company.googleMapsUrl && (
                <a
                  href={company.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-center text-sm text-neutral-700"
                >
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  <span>Ver en Google Maps</span>
                </a>
              )}
            </section>
          )}

          {/* Team */}
          {people.length > 0 && (
            <section
              className="hidden animate-fade-up w-full"
              style={stagger()}
            >
              <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Nuestro equipo
              </h2>
              <ul className="mt-3 flex flex-col items-center gap-2">
                {people.map((person) => (
                  <li key={person.slug}>
                    <Link
                      href={`/${company.slug}/${person.slug}`}
                      className="text-sm text-neutral-600 underline underline-offset-2"
                    >
                      {person.firstName} {person.lastName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
