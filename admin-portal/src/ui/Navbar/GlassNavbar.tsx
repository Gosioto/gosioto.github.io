import styles from './GlassNavbar.module.css';

export type GlassNavItem = {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
};

type Props = {
  items: GlassNavItem[];
  className?: string;
};

/** NAV-01 — glass nav strip (icons optional text labels). */
export default function GlassNavbar({ items, className }: Props) {
  return (
    <nav className={[styles.navbar, className].filter(Boolean).join(' ')} aria-label="Навигация">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${styles.navItem} ${item.active ? styles.active : ''}`}
          onClick={item.onClick}
        >
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
