import type { CSSProperties } from "react";
import { ChevronRightIcon } from "@/components/icons";
import type { BusinessWebsite } from "./profile-config";
import styles from "./obsidian.module.css";

export function BusinessLinks({ websites }: { websites: BusinessWebsite[] }) {
  return (
    <ul className={styles.links} aria-label="Empresas del grupo">
      {websites.map((site) => (
        <li key={site.url}>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <span className={styles.mark} aria-hidden="true">
              {site.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimisation needed
                <img
                  src={site.logo}
                  alt=""
                  className={styles.markLogo}
                  style={
                    site.logoHeight
                      ? ({ "--logo-h": `${site.logoHeight}px` } as CSSProperties)
                      : undefined
                  }
                />
              ) : (
                site.mark.map((line) => <span key={line}>{line}</span>)
              )}
            </span>
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.linkName}>{site.name}</span>
            <ChevronRightIcon className={styles.arrow} />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
