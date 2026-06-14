import styles from './Badge.module.css';

type Props = {
  count?: number;
  dot?: boolean;
  className?: string;
};

export default function Badge({ count = 0, dot, className }: Props) {
  if (dot) return <span className={`${styles.badge} ${styles.dot} ${className ?? ''}`} aria-hidden />;
  if (!count || count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <span className={`${styles.badge} ${className ?? ''}`} aria-label={`${count} новых`}>
      {label}
    </span>
  );
}
