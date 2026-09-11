import type { ComponentType, CSSProperties, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyPeople } from "@/lib/data";
import type { Branding, CtaLink } from "@/types/card";
import {
  GlobeIcon,
  InstagramIcon,
  MapPinIcon,
  UserPlusIcon,
  WhatsAppIcon,
} from "@/components/icons";

const CTA_ICONS: Record<
  NonNullable<CtaLink["icon"]>,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  web: GlobeIcon,
  form: UserPlusIcon,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function brandBackground(branding: Branding): CSSProperties {
  return branding.secondaryColor
    ? {
        backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})`,
      }
    : { backgroundColor: branding.primaryColor };
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

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const people = getCompanyPeople(companySlug);
  const brandStyle = brandBackground(company.branding);
  const stagger = createStagger();

  return (
    <main className="mx-auto flex h-dvh w-full max-w-107.5 flex-col items-center overflow-hidden px-6 py-4 bg-white">
      {/* Logo / avatar */}
      <div
        className="animate-fade-up relative flex h-30 w-30 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={stagger(brandStyle)}
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

      <h1
        className="animate-fade-up mt-4 shrink-0 text-center text-2xl font-bold text-neutral-900"
        style={stagger()}
      >
        {company.name}
      </h1>
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
            {company.links.map((link) => {
              const Icon = link.icon ? CTA_ICONS[link.icon] : null;
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="animate-fade-up flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
                  style={stagger(brandStyle)}
                >
                  {Icon && <Icon className="h-5 w-5 shrink-0" />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Location */}
        {company.address && (
          <section className="animate-fade-up w-full" style={stagger()}>
            <p className="mt-2 text-center text-sm text-neutral-600">
              {company.address}
            </p>
            <iframe
              title={`Mapa de ${company.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                company.address
              )}&output=embed`}
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
          <section className="animate-fade-up w-full" style={stagger()}>
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
  );
}
