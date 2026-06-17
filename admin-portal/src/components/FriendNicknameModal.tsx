import { useEffect, useState } from 'react';
import { patchFriendNickname } from '../api';
import { Button, Modal } from '../ui';
import styles from '../pages/Chats.module.css';

type Props = {
  peerUserId: string;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
};

export default function FriendNicknameModal({ peerUserId, onClose, onSaved, onError }: Props) {
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname('');
  }, [peerUserId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const value = nickname.trim() || null;
    patchFriendNickname(peerUserId, value)
      .then(() => {
        onSaved();
        onClose();
      })
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSaving(false));
  }

  return (
    <Modal open onClose={onClose} title="Никнейм друга">
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="friend-nickname">
            Никнейм (пусто — сбросить)
          </label>
          <input
            id="friend-nickname"
            type="text"
            className={styles.input}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoFocus
            disabled={saving}
          />
        </div>
        <div className={styles.modalActions}>
          <Button type="submit" disabled={saving}>
            Сохранить
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
        </div>
      </form>
    </Modal>
  );
}
