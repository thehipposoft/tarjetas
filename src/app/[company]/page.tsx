import type { ComponentType, SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyPeople } from "@/lib/data";
import type { CtaLink } from "@/types/card";
import {
  GlobeIcon,
  InstagramIcon,
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

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const people = getCompanyPeople(companySlug);
  const brand = company.branding.primaryColor;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-6 py-14">
      {/* Logo / avatar */}
      <div
        className="relative flex h-30 w-30 items-center justify-center overflow-hidden rounded-full"
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

      <h1 className="mt-4 text-center text-2xl font-bold text-neutral-900">
        {company.name}
      </h1>
      {company.description && (
        <p className="mt-1 text-center text-sm text-neutral-500">
          {company.description}
        </p>
      )}

      {/* Link-in-bio CTA buttons */}
      {company.links && company.links.length > 0 && (
        <div className="mt-8 flex w-full flex-col gap-3">
          {company.links.map((link) => {
            const Icon = link.icon ? CTA_ICONS[link.icon] : null;
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
                style={{ backgroundColor: brand }}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Team */}
      {people.length > 0 && (
        <section className="mt-10 w-full">
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
    </main>
  );
}
