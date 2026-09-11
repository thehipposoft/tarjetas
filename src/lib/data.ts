import type { Company, Person, Card } from "@/types/card";

/**
 * Phase 1 (MVP): hardcoded data.
 * Phase 2: replace the bodies of these functions with WPGraphQL queries
 * against WordPress — the rest of the app only depends on this file's
 * exported function signatures and the Company/Person/Card types, so the
 * swap should not require touching any page or route.
 */

const companies: Company[] = [
  {
    slug: "rada",
    name: "RADA Rent a Car",
    description: "Alquiler de autos en Argentina.",
    branding: {
      primaryColor: "#E41D30",
    },
    social: {
      website: "https://www.rada.com.ar",
      whatsapp: "https://wa.me/5490000000000",
      instagram: "https://instagram.com/rada",
    },
  },
];

const people: Person[] = [
  {
    slug: "tomas-borigen",
    companySlug: "rada",
    firstName: "Tomas",
    lastName: "Borigen",
    jobTitle: "Sales Manager",
    email: "tomas@rada.com.ar",
    social: {
      linkedin: "https://linkedin.com/in/tomasborigen",
    },
  },
];

const cards: Card[] = [
  {
    id: "ABC123",
    code: "RADA001",
    personSlug: "tomas-borigen",
    companySlug: "rada",
    status: "active",
    createdAt: "2026-09-01",
  },
];

export function getAllCompanies(): Company[] {
  return companies;
}

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getCompanyPeople(companySlug: string): Person[] {
  return people.filter((p) => p.companySlug === companySlug);
}

export function getPerson(
  companySlug: string,
  personSlug: string
): Person | undefined {
  return people.find(
    (p) => p.companySlug === companySlug && p.slug === personSlug
  );
}

export function getCardById(cardId: string): Card | undefined {
  return cards.find((c) => c.id === cardId);
}
