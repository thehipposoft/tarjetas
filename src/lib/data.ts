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
    description: "",
    logoUrl: "/logos/rada.svg",
    branding: {
      primaryColor: "#e41d2e",
    },
    social: {
      website: "https://www.radarentacar.com.ar/",
      whatsapp: "https://wa.me/5493872245587",
      instagram: "https://www.instagram.com/radarentacarok/",
    },
    links: [
      {
        label: "Sumate a RADA Partners",
        url: "https://forms.gle/k1Xf1H39EZy44H557",
        icon: "form",
      },
      {
        label: "¡Alquilá por WhatsApp!",
        url: "https://wa.me/5493872245587",
        icon: "whatsapp",
      },
      {
        label: "Seguinos",
        url: "https://www.instagram.com/radarentacarok/",
        icon: "instagram",
      },
      {
        label: "Conocé RADA",
        url: "https://www.radarentacar.com.ar/",
        icon: "web",
      },
    ],
  },
  {
    slug: "dycar-trucks",
    name: "",
    logoUrl: "/logos/dycar-trucks.png",
    address: "Av. Uruguay 1200, A4406 Salta",
    googleMapsUrl:
      "https://www.google.com/maps/place/Dycar+Salta+(Av.+Uruguay)+Concesionario+Oficial+Chevrolet/@-24.7752793,-65.4395655,14z/data=!4m10!1m2!2m1!1sDycar!3m6!1s0x941bc39433bd08d7:0xa9e1102615c0b474!8m2!3d-24.7752932!4d-65.4009614!15sCgVEeWNhciIDiAEBkgEQY2hldnJvbGV0X2RlYWxlcuABAA!16s%2Fg%2F11bbrp2nc6?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D",
    branding: {
      primaryColor: "#3458a2",
      secondaryColor: "#1d2a4d",
    },
    social: {
      website: "https://www.kamacamiones.com.ar/",
      whatsapp: "https://wa.me/5493875197808",
      instagram: "https://www.instagram.com/dycartrucks/",
    },
    links: [
      {
        label: "Formulario de pedido",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSfdkNhDXsfWIeplhpU_QvMR5a8nckfHwd0mdNXlmNvESj9FdQ/viewform",
        icon: "form",
      },
      {
        label: "Escribinos por WhatsApp",
        url: "https://wa.me/5493875197808",
        icon: "whatsapp",
      },
      {
        label: "Seguinos",
        url: "https://www.instagram.com/dycartrucks/",
        icon: "instagram",
      },
      {
        label: "Conocé Dycar Trucks",
        url: "https://www.kamacamiones.com.ar/",
        icon: "web",
      },
    ],
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
