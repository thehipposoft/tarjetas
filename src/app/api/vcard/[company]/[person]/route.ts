import { getCompany, getPerson } from "@/lib/data";
import { vCardFor } from "@/lib/contact";

type VCardParams = {
  params: Promise<{ company: string; person: string }>;
};

/**
 * Serves a person's vCard for the "Agregar contacto" button's fallback path
 * (anything that isn't a bare Android browser, which uses a direct
 * `android.intent.action.INSERT` intent instead — see AddContactButton).
 * `inline` (not `attachment`) so iOS Safari opens its native "Add Contact"
 * preview instead of just downloading a file.
 */
export async function GET(_request: Request, { params }: VCardParams) {
  const { company: companySlug, person: personSlug } = await params;
  const company = getCompany(companySlug);
  const person = getPerson(companySlug, personSlug);
  if (!company || !person) {
    return new Response("Not found", { status: 404 });
  }

  // `filename` (quoted, no diacritics) is the fallback for parsers that
  // ignore filename*; the RFC 5987 filename* carries the real, accented
  // name for everything else.
  const asciiName = `${person.firstName}-${person.lastName}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const utf8Name = encodeURIComponent(`${person.firstName}-${person.lastName}`);

  return new Response(vCardFor(person, company), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `inline; filename="${asciiName}.vcf"; filename*=UTF-8''${utf8Name}.vcf`,
    },
  });
}
