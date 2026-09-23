import type { CSSProperties } from "react";
import type { Branding } from "@/types/card";

export function brandBackground(branding: Branding): CSSProperties {
  return branding.secondaryColor
    ? {
        backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})`,
      }
    : { backgroundColor: branding.primaryColor };
}

/**
 * Same as brandBackground, but respects Branding.logoBackground — use this
 * behind the logo specifically (not CTA buttons, which should always keep
 * the brand color regardless of this per-logo setting). The flag only ever
 * suppresses the background when there's an actual logo image to sit on
 * top of it — the initials fallback (no logo) always needs the colored
 * backdrop to stay legible, so `logoBackground: false` can't blank that out.
 */
export function logoBackgroundStyle(
  branding: Branding,
  hasLogo: boolean
): CSSProperties | undefined {
  if (hasLogo && branding.logoBackground === false) return undefined;
  return brandBackground(branding);
}
