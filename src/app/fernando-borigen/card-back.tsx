"use client";

import { useFlipCard } from "@/components/flip-card";
import { ObsidianFace } from "./obsidian-surface";
import styles from "./obsidian.module.css";

/**
 * Back face: a QR that IS the contact (vCard data encoded in the code), so
 * scanning it with any phone camera offers "Add contact" directly — no
 * network round trip. A client component for `useFlipCard()` ("Volver").
 */
export function CardBack({
  fullName,
  organization,
  qrSvg,
}: {
  fullName: string;
  organization: string;
  qrSvg: string;
}) {
  const { toggleFlip } = useFlipCard();

  return (
    <ObsidianFace>
      <div className={styles.back} lang="es">
        <p className={styles.backEyebrow}>Guardar contacto</p>
        <h2 className={styles.backName}>{fullName}</h2>
        <span className={styles.rule} aria-hidden="true" />

        <div
          className={styles.qr}
          role="img"
          aria-label={`Código QR con el contacto de ${fullName}`}
          // Built server-side by createQrSvg from our own config, not user input.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />

        <p className={styles.backHint}>
          Escaneá el código con la cámara para guardar el contacto
        </p>

        <div className={styles.backActions}>
          <button type="button" onClick={toggleFlip} className={styles.pill}>
            Volver
          </button>
        </div>

        <p className={styles.backOrg}>{organization}</p>
      </div>
    </ObsidianFace>
  );
}
