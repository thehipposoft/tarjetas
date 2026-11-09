import { fullName, type ProfileConfig } from "./profile-config";
import styles from "./obsidian.module.css";

export function IdentitySection({ config }: { config: ProfileConfig }) {
  return (
    <header className={styles.identity}>
      <h1 className={styles.name}>{fullName}</h1>
      <p className={styles.position}>{config.position}</p>
      <span className={styles.rule} aria-hidden="true" />
      <p className={styles.organization}>{config.organization}</p>
    </header>
  );
}
