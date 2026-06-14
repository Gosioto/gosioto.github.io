import type { ChatFileTransfer, FileOfferPayload } from '../api';
import type { TransferProgress } from '../p2p/fileOfferTypes';
import styles from './ChatFileOfferCard.module.css';

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

type Props = {
  isHost: boolean;
  hostOnline: boolean;
  payload: FileOfferPayload;
  transfers: ChatFileTransfer[];
  progress?: TransferProgress | null;
  onAccept?: () => void;
  onCancel?: () => void;
  onRebind?: () => void;
  needsRebind?: boolean;
};

export default function ChatFileOfferCard({
  isHost,
  hostOnline,
  payload,
  transfers,
  progress,
  onAccept,
  onCancel,
  onRebind,
  needsRebind,
}: Props) {
  const pct =
    progress && progress.bytesTotal > 0
      ? Math.min(100, Math.round((progress.bytesDone / progress.bytesTotal) * 100))
      : 0;

  const canAccept =
    !isHost && (!progress || progress.status === 'failed' || progress.status === 'cancelled');

  return (
    <div className={styles.card} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <span className={styles.icon} aria-hidden>
        📎
      </span>
      <div className={styles.body}>
        <div className={styles.name}>{payload.name}</div>
        <div className={styles.meta}>
          {formatSize(payload.size)} · {payload.mime}
        </div>
        {progress ? (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${pct}%` }} />
            <span className={styles.progressLabel}>
              {progress.status === 'completed'
                ? 'Готово'
                : progress.status === 'failed'
                  ? progress.error ?? 'Ошибка'
                  : `${pct}%`}
            </span>
          </div>
        ) : null}
        {canAccept && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.();
              }}
              title={hostOnline ? 'Скачать напрямую с отправителя (P2P)' : 'Отправитель может быть offline — можно попробовать'}
            >
              Принять и скачать
            </button>
            {!hostOnline && (
              <span className={styles.offlineHint}>Отправитель не в сети — передача может не начаться</span>
            )}
          </div>
        )}
        {isHost && needsRebind && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={(e) => {
                e.stopPropagation();
                onRebind?.();
              }}
            >
              Подтвердить файл с ПК
            </button>
          </div>
        )}
        {isHost && progress && progress.status !== 'completed' && progress.status !== 'failed' && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >
              Отменить
            </button>
          </div>
        )}
        {isHost && transfers.length > 0 && (
          <ul className={styles.recvList}>
            {transfers.map((t) => (
              <li key={t.id} className={styles.recvItem}>
                {t.status}: {formatSize(t.bytes_transferred)} / {formatSize(payload.size)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
