import styles from '../pages/Chats.module.css';

type Props = {
  online: boolean;
  size?: 'md' | 'sm';
  className?: string;
};

export default function PresenceDot({ online, size = 'md', className }: Props) {
  const sizeClass = size === 'sm' ? styles.presenceDotSm : styles.presenceDot;
  return (
    <span
      className={`${sizeClass} ${online ? styles.presenceDotOnline : styles.presenceDotOffline} ${className ?? ''}`}
      title={online ? 'В сети' : 'Не в сети'}
      aria-hidden
    />
  );
}
