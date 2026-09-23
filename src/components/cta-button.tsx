import type { ComponentType, CSSProperties, SVGProps } from "react";
import type { CtaLink } from "@/types/card";
import {
  GlobeIcon,
  InstagramIcon,
  UserPlusIcon,
  WhatsAppIcon,
} from "@/components/icons";

const CTA_ICONS: Record<
  NonNullable<CtaLink["icon"]>,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  web: GlobeIcon,
  form: UserPlusIcon,
};

/**
 * The brand-colored, icon + label pill used for link-in-bio style CTAs.
 * Shared by the company page's own link list and the person page's
 * company-linked actions (WhatsApp/Instagram/website) so both stay visually
 * identical without duplicating the markup.
 */
export function CtaButton({
  href,
  label,
  icon,
  style,
  className = "",
}: {
  href: string;
  label: string;
  icon?: CtaLink["icon"];
  style?: CSSProperties;
  className?: string;
}) {
  const Icon = icon ? CTA_ICONS[icon] : null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98] ${className}`}
      style={style}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span>{label}</span>
    </a>
  );
}
