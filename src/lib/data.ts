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
    tagline: "Rent a Car\nArgentina",
    footerTagline: "Tu destino\nnos mueve",
    // No street-address text on hand yet — the embed still pins the exact
    // spot via the coordinates in this URL (see src/lib/maps.ts).
    googleMapsUrl:
      "https://www.google.com/maps/place/RADA/@-24.7909873,-65.4123871,17z/data=!3m1!4b1!4m6!3m5!1s0x941bc3cac8453337:0x413a0c41627d35a2!8m2!3d-24.7909922!4d-65.4098122!16s%2Fg%2F11h2qtkpxv?entry=ttu&g_ep=EgoyMDI2MDkyMC4wIKXMDSoASAFQAw%3D%3D",
    branding: {
      primaryColor: "#ed2b3d",
      // RADA's own SVG has an opaque colored badge shape, so no backdrop is needed.
      logoBackground: false,
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
      // Dycar's PNG has a transparent background with white text, needs the backdrop.
      logoBackground: true,
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
    firstName: "Tomás",
    lastName: "Borigen",
    jobTitle: "Sales Manager",
    photoUrl: "/rada/foto-tomy-red.jpeg",
    social: {
      whatsapp: "https://wa.me/5493874730332",
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
