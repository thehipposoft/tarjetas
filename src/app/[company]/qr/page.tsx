import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getCompany } from "@/lib/data";
import { brandBackground } from "@/lib/branding";
import { absoluteUrl } from "@/lib/site";
import Image from "next/image";

/**
 * Standalone, print-friendly page: just a QR code for a company's landing
 * page (`/{company}`), meant for flyers/posters/table cards rather than the
 * NFC-chip flow (that's /c/{cardId}, which resolves per physical card).
 * Kept black-on-white regardless of branding — colorizing the code itself
 * risks scan reliability, so brand color is limited to a small accent.
 */
export default async function CompanyQrPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const targetUrl = absoluteUrl(`/${company.slug}`);

  // Generated server-side from a URL we build ourselves (company.slug is
  // trusted, admin-controlled data, not public input) — safe to inject.
  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#171717", light: "#ffffff" },
  });

  return (
    <main className="mx-auto flex h-dvh w-full max-w-107.5 flex-col items-center justify-center gap-6 overflow-hidden bg-white px-6 py-10 text-center">
      <div className="flex flex-col items-center gap-3">
        {
          company.logoUrl && (
            <Image
              src={company.logoUrl}
              alt={company.name}
              width={150}
              height={150}
              unoptimized
              className="object-cover rounded-full"
              style={brandBackground(company.branding)}
            />
          )
        }
        {/* Removed redundant Image component as the conditional rendering above handles it */}
      </div>

      <div
        className="flex aspect-square w-64 max-w-full items-center justify-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-neutral-500">Escaneá para ver el perfil</p>
      </div>
    </main>
  );
}
