import type { CSSProperties } from "react";
import type { Branding } from "@/types/card";

export function brandBackground(branding: Branding): CSSProperties {
  return branding.secondaryColor
    ? {
        backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})`,
      }
    : { backgroundColor: branding.primaryColor };
}
