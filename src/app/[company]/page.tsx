import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getCompanyPeople } from "@/lib/data";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const people = getCompanyPeople(companySlug);

  return (
    <main
      className="min-h-screen p-8"
      style={{ "--brand": company.branding.primaryColor } as CSSProperties}
    >
      <h1
        className="text-3xl font-bold"
        style={{ color: company.branding.primaryColor }}
      >
        {company.name}
      </h1>
      {company.description && (
        <p className="mt-2 text-neutral-600">{company.description}</p>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Our team
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {people.map((person) => (
            <li key={person.slug}>
              <Link href={`/${company.slug}/${person.slug}`} className="underline">
                {person.firstName} {person.lastName}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
