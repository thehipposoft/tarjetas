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
