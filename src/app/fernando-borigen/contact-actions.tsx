import type { ComponentType, SVGProps } from "react";
import { WhatsAppIcon } from "@/components/icons";
import {
  emailHref,
  whatsappHref,
  type ProfileConfig,
} from "./profile-config";
import styles from "./obsidian.module.css";

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-4.2-6 4.2v-16a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

interface Action {
  label: string;
  href?: string;
  external?: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function ContactActions({ config }: { config: ProfileConfig }) {
  const actions: Action[] = [
    {
      label: "WhatsApp",
      href: whatsappHref(config),
      external: true,
      icon: WhatsAppIcon,
    },
    { label: "Email", href: emailHref(config), icon: MailIcon },
    {
      label: "Guardar contacto",
      href: `/${config.slug}/vcard`,
      icon: BookmarkIcon,
    },
  ];

  return (
    <ul className={styles.actions} aria-label="Contacto">
      {actions.map(({ label, href, external, icon: Icon }) => {
        const content = (
          <>
            <span className={styles.orb}>
              <Icon />
            </span>
            <span>{label}</span>
          </>
        );

        return (
          <li key={label}>
            {href ? (
              <a
                href={href}
                className={styles.action}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {content}
              </a>
            ) : (
              // Contact detail not configured yet (see profile-config.ts).
              <span
                className={`${styles.action} ${styles.actionUnavailable}`}
                aria-disabled="true"
                title="Dato pendiente"
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
