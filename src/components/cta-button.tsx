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
 * The "row" pill look (filled with `primaryColor` + white text when given,
 * neutral gray otherwise) is shared with non-link row actions — e.g.
 * AddContactButton, which needs a `<button onClick>` instead of an `<a
 * href>` — so the visual never drifts between the two.
 */
export function rowButtonClasses(branded: boolean, className = "") {
  return `flex w-full items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition ${branded ? "text-white active:brightness-90" : "border-neutral-300 bg-neutral-100 text-neutral-800 active:bg-neutral-200"} ${className}`;
}

export function rowButtonStyle(
  primaryColor?: string,
  style?: CSSProperties
): CSSProperties {
  return {
    ...style,
    ...(primaryColor
      ? { borderColor: primaryColor, backgroundColor: primaryColor }
      : {}),
  };
}

export function RowButtonContent({
  icon: Icon,
  label,
  branded,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>> | null;
  label: string;
  branded: boolean;
}) {
  return (
    <>
      {Icon && (
        <Icon
          className={`h-5 w-5 shrink-0 ${branded ? "" : "text-neutral-700"}`}
        />
      )}
      <span className="flex-1 text-left font-bold">{label}</span>
      <ChevronRightIcon
        className={`h-4 w-4 shrink-0 ${branded ? "opacity-80" : "text-neutral-400"}`}
      />
    </>
  );
}

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
  // Site-internal paths (e.g. "/rada") open in the same tab; everything else
  // is an external destination.
  const linkProps = href.startsWith("/")
    ? {}
    : { target: "_blank", rel: "noopener noreferrer" };
  const mergedStyle: CSSProperties = {
    ...style,
    ...(primaryColor ? { borderColor: primaryColor } : {}),
  };

  if (variant === "row") {
    const branded = Boolean(primaryColor);
    return (
      <a
        href={href}
        {...linkProps}
        className={rowButtonClasses(branded, className)}
        style={rowButtonStyle(primaryColor, style)}
      >
        <RowButtonContent icon={Icon} label={label} branded={branded} />
      </a>
    );
  }

  return (
    <a
      href={href}
      {...linkProps}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98] ${primaryColor ? "" : "border-transparent"} ${className}`}
      style={mergedStyle}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      <span>{label}</span>
    </a>
  );
}
