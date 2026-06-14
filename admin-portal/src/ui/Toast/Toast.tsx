import styles from './Toast.module.css';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  title: string;
  message?: string;
  kind: ToastKind;
  onClick?: () => void;
};

type Props = {
  item: ToastItem;
  onDismiss: () => void;
};

export default function ToastView({ item, onDismiss }: Props) {
  return (
    <div
      className={`${styles.toast} ${styles[item.kind]} ${item.onClick ? styles.clickable : ''}`}
      role="alert"
      onClick={item.onClick ? () => { item.onClick?.(); onDismiss(); } : undefined}
    >
      <div className={styles.content}>
        <span className={styles.title}>{item.title}</span>
        {item.message && <span className={styles.message}>{item.message}</span>}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Закрыть"
      >
        <span aria-hidden>×</span>
      </button>
      <div className={styles.progress} />
    </div>
  );
}
