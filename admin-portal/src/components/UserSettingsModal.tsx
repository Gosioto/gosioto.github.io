import { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import {
  setChatParticipantMute,
  getFriendStatus,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getRoles,
  getUser,
  assignUserRole,
  removeUserRole,
  deleteChatMessage,
  type FriendStatus as FriendStatusType,
  type RoleFull,
  type UserWithRole,
} from '../api';
import Avatar from './Avatar';
import AvatarLightbox from './AvatarLightbox';
import styles from './UserSettingsModal.module.css';

type Props = {
  userId: string;
  userName: string | null;
  userEmail: string;
  chatId?: string | null;
  isGroupAdmin?: boolean;
  /** ID выбранного сообщения в чате — показываем кнопку «Удалить сообщение» в Модерации */
  selectedMessageId?: string | null;
  onClose: () => void;
  onMuted?: () => void;
  onMessageDeleted?: () => void;
  onRoleChanged?: () => void;
  onAvatarClick?: () => void;
};

function muteUntilMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export default function UserSettingsModal({
  userId,
  userName,
  userEmail,
  chatId,
  isGroupAdmin,
  selectedMessageId,
  onClose,
  onMuted,
  onMessageDeleted,
  onRoleChanged,
  onAvatarClick,
}: Props) {
  const { user: me } = useAuth();
  const [muteError, setMuteError] = useState('');
  const [friendStatus, setFriendStatus] = useState<FriendStatusType | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [roles, setRoles] = useState<RoleFull[]>([]);
  const [targetUser, setTargetUser] = useState<UserWithRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteMsgLoading, setDeleteMsgLoading] = useState(false);
  const [avatarLightboxOpen, setAvatarLightboxOpen] = useState(false);

  const isOwn = userId === me?.id;
  const canMute = Boolean(chatId && isGroupAdmin && !isOwn);
  const canModerate = Boolean(me?.permissions?.includes('roles.assign'));

  useEffect(() => {
    if (isOwn) return;
    getFriendStatus(userId)
      .then(setFriendStatus)
      .catch(() => setFriendStatus({ status: 'none' }));
  }, [userId, isOwn]);

  useEffect(() => {
    if (!canModerate) return;
    getRoles().then(setRoles).catch(() => {});
    getUser(userId)
      .then(setTargetUser)
      .catch(() => setTargetUser(null));
  }, [userId, canModerate]);

  function handleMute(mutedUntil: string | null) {
    if (!chatId) return;
    setMuteError('');
    setChatParticipantMute(chatId, userId, mutedUntil)
      .then(() => onMuted?.())
      .catch((err) => setMuteError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleAddFriend() {
    setFriendLoading(true);
    sendFriendRequest(userId)
      .then(() => getFriendStatus(userId).then(setFriendStatus))
      .catch(() => {})
      .finally(() => setFriendLoading(false));
  }

  function handleAcceptFriend() {
    if (!friendStatus?.from_user_id || !me?.id) return;
    setFriendLoading(true);
    acceptFriendRequest(friendStatus.from_user_id, me.id)
      .then(() => getFriendStatus(userId).then(setFriendStatus))
      .catch(() => {})
      .finally(() => setFriendLoading(false));
  }

  function handleRejectFriend() {
    if (!friendStatus?.from_user_id || !me?.id) return;
    setFriendLoading(true);
    rejectFriendRequest(friendStatus.from_user_id, me.id)
      .then(() => getFriendStatus(userId).then(setFriendStatus))
      .catch(() => {})
      .finally(() => setFriendLoading(false));
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const roleId = e.target.value;
    setRoleLoading(true);
    const promise = roleId ? assignUserRole(userId, roleId) : removeUserRole(userId);
    promise
      .then(() => {
        getUser(userId).then(setTargetUser);
        onRoleChanged?.();
      })
      .catch(() => {})
      .finally(() => setRoleLoading(false));
  }

  function handleDeleteMessage() {
    if (!chatId || !selectedMessageId) return;
    setDeleteMsgLoading(true);
    deleteChatMessage(chatId, selectedMessageId)
      .then(() => {
        onMessageDeleted?.();
        onClose();
      })
      .catch(() => {})
      .finally(() => setDeleteMsgLoading(false));
  }

  function handleAvatarClick() {
    setAvatarLightboxOpen(true);
    onAvatarClick?.();
  }

  return (
    <>
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 1. Профиль */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Профиль</h3>
          <div className={styles.header}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={handleAvatarClick}
              title="Просмотр аватара"
            >
              <Avatar
                userId={userId}
                fallbackLetter={userName?.[0] || userEmail[0]}
                size={72}
                className={styles.avatar}
              />
            </button>
            <div className={styles.nameLine}>
              {userName ? <span className={styles.displayName}>{userName}</span> : null}
              <span className={styles.email}>{userEmail}</span>
            </div>
          </div>
        </section>

        {/* 2. Добавить в друзья */}
        {!isOwn && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Друзья</h3>
            <p className={styles.hint}>В будущем сделаем зависимость. Пока — заявка в друзья.</p>
            {friendStatus?.status === 'none' && (
              <button type="button" className={styles.primaryBtn} onClick={handleAddFriend} disabled={friendLoading}>
                Добавить в друзья
              </button>
            )}
            {friendStatus?.status === 'pending_sent' && (
              <span className={styles.statusText}>Заявка отправлена</span>
            )}
            {friendStatus?.status === 'pending_received' && (
              <div className={styles.friendActions}>
                <button type="button" className={styles.primaryBtn} onClick={handleAcceptFriend} disabled={friendLoading}>
                  Принять
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={handleRejectFriend} disabled={friendLoading}>
                  Отклонить
                </button>
              </div>
            )}
            {friendStatus?.status === 'friends' && (
              <span className={styles.statusText}>В друзьях</span>
            )}
          </section>
        )}

        {/* 3. Мьют в чате */}
        {canMute && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Модерация в чате</h3>
            <p className={styles.hint}>Временный мьют / мьют участника в этом чате.</p>
            {muteError && <p className={styles.muteError}>{muteError}</p>}
            <div className={styles.muteButtons}>
              <button type="button" className={styles.muteBtn} onClick={() => handleMute(muteUntilMinutes(60))} title="1 час">
                1 ч
              </button>
              <button type="button" className={styles.muteBtn} onClick={() => handleMute(muteUntilMinutes(60 * 24))} title="24 часа">
                24 ч
              </button>
              <button type="button" className={styles.muteBtn} onClick={() => handleMute(muteUntilMinutes(60 * 24 * 7))} title="7 дней">
                7 д
              </button>
              <button type="button" className={styles.muteBtn} onClick={() => handleMute(muteUntilMinutes(60 * 24 * 365 * 10))} title="Мьют">
                Мьют
              </button>
              <button type="button" className={styles.muteBtnUnmute} onClick={() => handleMute(null)}>
                Размьютить
              </button>
            </div>
          </section>
        )}

        {/* 4. Модерация (для админов) */}
        {canModerate && !isOwn && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Модерация</h3>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Выдать роль</label>
              <select
                className={styles.select}
                value={targetUser?.role?.id ?? ''}
                onChange={handleRoleChange}
                disabled={roleLoading}
              >
                <option value="">— Без роли —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedMessageId && chatId && (
              <div className={styles.field}>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDeleteMessage}
                  disabled={deleteMsgLoading}
                >
                  {deleteMsgLoading ? '…' : 'Удалить выбранное сообщение'}
                </button>
              </div>
            )}
          </section>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
    {avatarLightboxOpen ? (
      <AvatarLightbox
        userId={userId}
        fallbackLetter={userName?.[0] || userEmail[0]}
        onClose={() => setAvatarLightboxOpen(false)}
      />
    ) : null}
    </>
  );
}
