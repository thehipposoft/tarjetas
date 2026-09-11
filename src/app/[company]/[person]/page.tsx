import { notFound } from "next/navigation";
import { getCompany, getPerson } from "@/lib/data";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ company: string; person: string }>;
}) {
  const { company: companySlug, person: personSlug } = await params;
  const company = getCompany(companySlug);
  const person = getPerson(companySlug, personSlug);
  if (!company || !person) notFound();

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center">
      <div
        className="h-24 w-24 rounded-full"
        style={{ backgroundColor: company.branding.primaryColor }}
      />
      <h1 className="text-2xl font-bold">
        {person.firstName} {person.lastName}
      </h1>
      {person.jobTitle && <p className="text-neutral-500">{person.jobTitle}</p>}
      <p className="text-sm text-neutral-400">{company.name}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
        {person.social?.whatsapp && (
          <a
            href={person.social.whatsapp}
            className="rounded-full border px-4 py-2 text-sm"
          >
            WhatsApp
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
    </main>
  );
}
