import { NextRequest, NextResponse } from "next/server";
import { getCardById } from "@/lib/data";

/**
 * The NFC chip and QR code on every physical card point here:
 *   https://tarjeta.thehipposoft.com/c/{cardId}
 *
 * This resolves the card to its current person profile, so re-assigning,
 * deactivating or replacing a card never requires reprogramming the chip.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const card = getCardById(cardId);

  if (!card) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // TODO(phase 2): record the scan (NFC vs QR, timestamp, device) once
  // analytics storage is in place, before redirecting.
  return NextResponse.redirect(
    new URL(`/${card.companySlug}/${card.personSlug}`, request.url)
  );
}
