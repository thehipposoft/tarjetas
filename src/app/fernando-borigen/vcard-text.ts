import { absoluteUrl } from "@/lib/site";
import { fullName, type ProfileConfig } from "./profile-config";

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/** vCard 3.0 for the "Guardar contacto" action. Empty contact fields are omitted. */
export function buildVCard(config: ProfileConfig): string {
  const whatsappDigits = config.whatsapp.replace(/\D/g, "");
  const phone = config.phone || (whatsappDigits ? `+${whatsappDigits}` : "");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeValue(config.lastName)};${escapeValue(config.firstName)};;;`,
    `FN:${escapeValue(fullName)}`,
    `ORG:${escapeValue(config.organization)}`,
    `TITLE:${escapeValue(config.position)}`,
    phone && `TEL;TYPE=CELL:${escapeValue(phone)}`,
    config.email && `EMAIL;TYPE=WORK:${escapeValue(config.email)}`,
    `URL:${absoluteUrl(`/${config.slug}`)}`,
    ...config.websites.map((site) => `URL;TYPE=WORK:${site.url}`),
    "END:VCARD",
  ].filter((line): line is string => Boolean(line));

  return lines.join("\r\n");
}
