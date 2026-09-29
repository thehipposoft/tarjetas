import type { Company, Person } from "@/types/card";

/**
 * Best-effort phone number for a person: their own `phone`/`mobile` if set,
 * else parsed from their WhatsApp link (`wa.me/<digits>`) — people on this
 * platform so far only ever have a WhatsApp number on file.
 */
export function personPhone(person: Person): string | undefined {
  if (person.phone) return person.phone;
  if (person.mobile) return person.mobile;
  const digits = person.social?.whatsapp?.match(/wa\.me\/(\d+)/)?.[1];
  return digits ? `+${digits}` : undefined;
}

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/** vCard 3.0 text for a person, for the universal (non-Android-intent) "add contact" fallback. */
export function vCardFor(person: Person, company: Company): string {
  const org = company.name || company.slug;
  const phone = personPhone(person);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(person.lastName)};${escapeVCardValue(person.firstName)};;;`,
    `FN:${escapeVCardValue(`${person.firstName} ${person.lastName}`)}`,
    org && `ORG:${escapeVCardValue(org)}`,
    person.jobTitle && `TITLE:${escapeVCardValue(person.jobTitle)}`,
    phone && `TEL;TYPE=CELL:${escapeVCardValue(phone)}`,
    person.email && `EMAIL:${escapeVCardValue(person.email)}`,
    "END:VCARD",
  ].filter((line): line is string => Boolean(line));
  return lines.join("\r\n");
}
