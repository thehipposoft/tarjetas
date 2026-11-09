import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { FlipCard } from "@/components/flip-card";
import { createQrSvg } from "@/lib/qr";
import { absoluteUrl } from "@/lib/site";
import { fullName, profileConfig } from "./profile-config";
import { buildVCard } from "./vcard-text";
import {
  FlipToQrButton,
  LightingRoot,
  ObsidianFace,
} from "./obsidian-surface";
import { CardBack } from "./card-back";
import { IdentitySection } from "./identity-section";
import { ContactActions } from "./contact-actions";
import { BusinessLinks } from "./business-links";
import { CardFooter } from "./card-footer";
import styles from "./obsidian.module.css";

/**
 * Standalone executive card for Fernando Borigen — "Obsidian": near-black
 * graphite bands, sparing red accents, tilt-driven lighting
 * (./obsidian-surface.tsx). Self-contained like /tomas-borigen: its own
 * palette (./obsidian.module.css) and content (./profile-config.ts). Like the
 * other cards it flips (swipe, or the QR corner button) via FlipCard; its
 * back face (./card-back.tsx) shows a QR that encodes the contact itself.
 */

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-obsidian-serif",
  display: "swap",
});

const PATH = `/${profileConfig.slug}`;
const TITLE = `${fullName} | ${profileConfig.organization}`;
const DESCRIPTION = `${fullName}, ${profileConfig.position} de ${profileConfig.organization}, grupo automotor que reúne Chevrolet Dycar y Eurodycar (Peugeot y Citroën). Contacto directo y empresas del grupo.`;

export const viewport: Viewport = {
  themeColor: "#080808",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "profile",
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    siteName: profileConfig.organization,
    locale: "es_AR",
    firstName: profileConfig.firstName,
    lastName: profileConfig.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function FernandoBorigenPage() {
  const contactQrSvg = await createQrSvg(
    buildVCard(profileConfig, { compact: true })
  );

  return (
    <div className={`${styles.page} ${serif.variable}`}>
      <LightingRoot>
        <FlipCard
          qrSvg={contactQrSvg}
          url={absoluteUrl(PATH)}
          title={fullName}
          primaryColor="#c62828"
          sizeClassName="max-h-235 max-w-110"
          back={
            <CardBack
              fullName={fullName}
              organization={profileConfig.organization}
              qrSvg={contactQrSvg}
            />
          }
        >
          <ObsidianFace>
            <FlipToQrButton />
            <main className={styles.content} lang="es">
              <IdentitySection config={profileConfig} />
              <ContactActions config={profileConfig} />
              <BusinessLinks websites={profileConfig.websites} />
              <CardFooter since={profileConfig.since} />
            </main>
          </ObsidianFace>
        </FlipCard>
      </LightingRoot>
    </div>
  );
}
