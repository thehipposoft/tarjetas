import Link from "next/link";
import { getAllCompanies } from "@/lib/data";

export default function Home() {
  const companies = getAllCompanies();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Hippo Tarjetas</h1>
      <p className="text-neutral-500">
        Digital business card platform — The Hipposoft
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {companies.map((company) => (
          <li key={company.slug}>
            <Link href={`/${company.slug}`} className="underline text-sm">
              {company.name} demo profile →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
