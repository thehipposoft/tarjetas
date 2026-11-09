import styles from "./obsidian.module.css";

export function CardFooter({ since }: { since: string }) {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerText}>Desde {since}</span>
    </footer>
  );
}
