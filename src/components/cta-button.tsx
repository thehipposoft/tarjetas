import type { ComponentType, CSSProperties, SVGProps } from "react";
import type { CtaLink } from "@/types/card";
import {
  ChevronRightIcon,
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
 * Icon + label CTA used for link-in-bio style actions, in two looks:
 * - "solid" (default): bold brand-colored pill — the company page's own
 *   `links` list.
 * - "row": a list row with a trailing chevron. Filled with `primaryColor`
 *   (white icon/text) when given, neutral gray otherwise.
 * Both share this component so icon/label handling never drifts apart.
 */
export function CtaButton({
  href,
  label,
  icon,
  style,
  className = "",
  variant = "solid",
  primaryColor,
}: {
  href: string;
  label: string;
  icon?: CtaLink["icon"];
  style?: CSSProperties;
  className?: string;
  variant?: "solid" | "row";
  /** Brand primary color, rendered as this button's border — ties every CTA to the company's card-frame color, not just the solid variant's background. Falls back to a neutral border when omitted. */
  primaryColor?: string;
}) {
  const Icon = icon ? CTA_ICONS[icon] : null;
  const mergedStyle: CSSProperties = {
    ...style,
    ...(primaryColor ? { borderColor: primaryColor } : {}),
  };

  if (variant === "row") {
    const branded = Boolean(primaryColor);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex w-full items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition ${branded ? "text-white active:brightness-90" : "border-neutral-300 bg-neutral-100 text-neutral-800 active:bg-neutral-200"} ${className}`}
        style={{
          ...mergedStyle,
          ...(primaryColor ? { backgroundColor: primaryColor } : {}),
        }}
      >
        {Icon && (
          <Icon
            className={`h-5 w-5 shrink-0 ${branded ? "" : "text-neutral-700"}`}
          />
        )}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRightIcon
          className={`h-4 w-4 shrink-0 ${branded ? "opacity-80" : "text-neutral-400"}`}
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98] ${primaryColor ? "" : "border-transparent"} ${className}`}
      style={mergedStyle}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span>{label}</span>
    </a>
  );
}
