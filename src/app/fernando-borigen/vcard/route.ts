import { profileConfig } from "../profile-config";
import { buildVCard } from "../vcard-text";

export const dynamic = "force-static";

/**
 * Fernando's vCard. `inline` (not `attachment`) so iOS Safari opens its
 * native "Add Contact" preview; Android browsers download the .vcf and hand
 * it to Contacts. Same approach as /api/vcard for company people.
 */
export function GET() {
  const fileName = `${profileConfig.firstName}-${profileConfig.lastName}.vcf`;
  return new Response(buildVCard(profileConfig), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
