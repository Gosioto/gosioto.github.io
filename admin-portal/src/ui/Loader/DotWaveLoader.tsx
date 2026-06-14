import styles from './DotWaveLoader.module.css';

type Props = {
  className?: string;
  label?: string;
};

export default function DotWaveLoader({ className, label }: Props) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} role="status" aria-label={label ?? 'Загрузка'}>
      <div className={styles.loader}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
