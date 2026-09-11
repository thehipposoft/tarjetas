/**
 * Production domain the physical cards' NFC chips and any printed QR codes
 * point at (see src/app/c/[cardId]/route.ts). Override with
 * NEXT_PUBLIC_SITE_URL for a staging/preview deployment so generated QR
 * codes there don't point at production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarjeta.thehipposoft.com";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
