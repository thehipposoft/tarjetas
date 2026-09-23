import type { Company } from "@/types/card";

/**
 * Google Maps "share" URLs embed the pin's exact coordinates as `!3d{lat}!4d{lng}`
 * inside the opaque `data=` segment. Parsing them out gives a precise pin
 * without needing a separate lat/lng field in the data model, and without
 * depending on `address` being a well-formed, geocodable string.
 */
function extractLatLng(
  googleMapsUrl: string
): { lat: number; lng: number } | undefined {
  const match = googleMapsUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (!match) return undefined;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

/**
 * Builds a no-API-key embeddable map URL for a company, preferring the exact
 * coordinates parsed from `googleMapsUrl` (most precise) and falling back to
 * a text search on `address` (works even without a Maps link, less exact).
 */
export function mapEmbedSrc(
  company: Pick<Company, "address" | "googleMapsUrl">
): string | undefined {
  const coords = company.googleMapsUrl
    ? extractLatLng(company.googleMapsUrl)
    : undefined;

  const query = coords
    ? `${coords.lat},${coords.lng}`
    : company.address;

  if (!query) return undefined;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
