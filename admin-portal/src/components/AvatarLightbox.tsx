import Avatar from './Avatar';
import styles from './AvatarLightbox.module.css';

type Props = {
  userId: string;
  email: string;
  name?: string | null;
  fallbackLetter: string;
  onClose: () => void;
};

export default function AvatarLightbox({ userId, email, name, fallbackLetter, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.avatarWrap}>
          <Avatar
            userId={userId}
            fallbackLetter={fallbackLetter}
            size={256}
            className={styles.avatar}
          />
        </div>
        <p className={styles.caption}>{name || email}</p>
      </div>
    </div>
  );
}
