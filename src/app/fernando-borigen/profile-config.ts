/**
 * Single source of truth for Fernando Borigen's card: every contact detail
 * and external URL on the page, in the vCard and in the metadata comes from
 * here. Leave a contact field as "" until the real value is confirmed — the
 * matching action renders as unavailable instead of linking somewhere wrong.
 */

export interface BusinessWebsite {
  name: string;
  url: string;
  /**
   * Path under /public to an OFFICIAL logo asset (SVG preferred, light on
   * transparent). Leave undefined until one is supplied: the row then shows
   * `mark` as a plain text treatment rather than an improvised logo.
   */
  logo?: string;
  /** Max rendered height of `logo` in px (default 34) — evens out marks of different proportions. */
  logoHeight?: number;
  /** Text shown in the logo slot when there's no `logo`; one entry per line. */
  mark: string[];
}

export interface ProfileConfig {
  slug: string;
  firstName: string;
  lastName: string;
  position: string;
  organization: string;
  since: string;
  /** International format, e.g. "+54 9 387 000 0000". */
  phone: string;
  email: string;
  /** Digits only, international, no "+" — e.g. "5493870000000". */
  whatsapp: string;
  websites: BusinessWebsite[];
}

export const profileConfig: ProfileConfig = {
  slug: "fernando-borigen",
  firstName: "Fernando",
  lastName: "Borigen",
  position: "Director",
  organization: "Grupo Borigen Betzel",
  since: "1990",
  phone: "+54 9 3876 84-3735",
  email: "fernando.borigen@eurodycar.com.ar",
  whatsapp: "5493876843735",
  websites: [
    {
      name: "Chevrolet Dycar",
      url: "https://www.chevroletdycar.com.ar/",
      logo: "/logos/fernando-borigen/chevrolet-dycar.png",
      logoHeight: 26,
      mark: ["Chevrolet"],
    },
    {
      name: "Eurodycar",
      url: "https://eurodycar.com.ar/",
      logo: "/logos/fernando-borigen/eurodycar.png",
      logoHeight: 38,
      mark: ["Peugeot", "Citroën"],
    },
    {
      name: "Grupo Borigen Betzel",
      url: "https://www.borigenbetzel.com.ar/",
      logo: "/logos/fernando-borigen/borigen-betzel.png",
      logoHeight: 21,
      mark: ["Grupo"],
    },
  ],
};

export const fullName = `${profileConfig.firstName} ${profileConfig.lastName}`;

export function whatsappHref(config: ProfileConfig): string | undefined {
  const digits = config.whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

export function emailHref(config: ProfileConfig): string | undefined {
  return config.email ? `mailto:${config.email}` : undefined;
}
