import { IconCheck, IconChecks } from '../ui';
import {
  getMessageDeliveryStatus,
  type MessageDeliveryStatus,
} from '../utils/messageStatus';
import styles from '../pages/Chats.module.css';

type Props = {
  createdAt: string;
  peerLastReadAt?: string | null | undefined;
  peerDeliveredAt?: string | null | undefined;
  status?: MessageDeliveryStatus;
};

const STATUS_COLOR: Record<MessageDeliveryStatus, string> = {
  sent: '#8a8a8a',
  delivered: '#6fc5f7',
  read: '#6fc5f7',
};

export default function MessageStatus({
  createdAt,
  peerLastReadAt,
  peerDeliveredAt,
  status: statusOverride,
}: Props) {
  const status =
    statusOverride ?? getMessageDeliveryStatus(createdAt, peerLastReadAt, peerDeliveredAt);
  const color = STATUS_COLOR[status];

  if (status === 'read') {
    return (
      <span className={styles.messageStatus} style={{ color }} aria-label="Прочитано">
        <IconChecks size={14} />
      </span>
    );
  }

  return (
    <span className={styles.messageStatus} style={{ color }} aria-label={status === 'delivered' ? 'Доставлено' : 'Отправлено'}>
      <IconCheck size={14} />
    </span>
  );
}
