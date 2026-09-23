export type CardStatus =
  | "active"
  | "inactive"
  | "lost"
  | "replaced"
  | "suspended";

export interface SocialLinks {
  website?: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
}

export interface Branding {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  /**
   * Whether to paint primaryColor/secondaryColor behind the logo circle.
   * Turn off when the logo image already has its own opaque background
   * (e.g. a badge-style SVG) — leave on (or omit; defaults to true) when
   * the logo has a transparent background and needs a backdrop for
   * contrast (e.g. a wordmark PNG with white text).
   */
  logoBackground?: boolean;
}

export interface CtaLink {
  label: string;
  url: string;
  icon?: "whatsapp" | "instagram" | "web" | "form";
}

export interface Company {
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  googleMapsUrl?: string;
  branding: Branding;
  social?: SocialLinks;
  /** Curated call-to-action buttons for the company's link-in-bio style landing (e.g. the NFC card destination). */
  links?: CtaLink[];
}

export interface Person {
  slug: string;
  companySlug: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  social?: SocialLinks;
}

export interface Card {
  /** Internal identifier used in the /c/{id} routing layer, written to the NFC chip / QR code. */
  id: string;
  /** Human-readable code, e.g. "RADA001". */
  code: string;
  personSlug: string;
  companySlug: string;
  status: CardStatus;
  createdAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
  replacementCardId?: string;
}
