import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFriends,
  removeFriend,
  createChat,
  markChatBlock,
  markChatUnblock,
  patchChatNotificationsMute,
  type Friend,
} from '../api';
import Avatar from '../components/Avatar';
import UserSettingsModal from '../components/UserSettingsModal';
import { IconBan, IconBellOff, IconClock, useToast } from '../ui';
import { formatDisplayName } from '../utils/displayName';
import styles from './Friends.module.css';

const POLL_MS = 20_000;

function muteUntilHours(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function isActiveUntil(until: string | null | undefined): boolean {
  return Boolean(until && new Date(until) > new Date());
}

export default function Friends() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<Friend | null>(null);
  const [muteMenuFor, setMuteMenuFor] = useState<string | null>(null);
  const muteMenuRef = useRef<HTMLDivElement>(null);

  const loadFriends = useCallback(async () => {
    try {
      const list = await getFriends();
      setFriends(list);
      setError('');
    } catch {
      setError('Не удалось загрузить список друзей');
    }
  }, []);

  useEffect(() => {
    void loadFriends().finally(() => setLoading(false));
    const id = window.setInterval(() => void loadFriends(), POLL_MS);
    return () => window.clearInterval(id);
  }, [loadFriends]);

  useEffect(() => {
    if (!muteMenuFor) return;
    function onDocClick(e: MouseEvent) {
      if (muteMenuRef.current && !muteMenuRef.current.contains(e.target as Node)) {
        setMuteMenuFor(null);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [muteMenuFor]);

  function patchFriend(userId: string, patch: Partial<Friend>) {
    setFriends((prev) => prev.map((f) => (f.user_id === userId ? { ...f, ...patch } : f)));
  }

  async function ensurePersonalChatId(friend: Friend): Promise<string> {
    if (friend.personal_chat_id) return friend.personal_chat_id;
    const chat = await createChat({ type: 'personal', user_id: friend.user_id });
    patchFriend(friend.user_id, { personal_chat_id: chat.id });
    return chat.id;
  }

  async function handleMessage(friend: Friend) {
    setBusyId(friend.user_id);
    try {
      const chatId = await ensurePersonalChatId(friend);
      navigate(`/dashboard/chats/${chatId}`);
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось открыть чат', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(friend: Friend) {
    const name = formatDisplayName(friend.name, friend.email);
    if (!confirm(`Удалить ${name} из друзей?`)) return;
    setBusyId(friend.user_id);
    try {
      await removeFriend(friend.user_id);
      setFriends((prev) => prev.filter((f) => f.user_id !== friend.user_id));
      showToast('Готово', 'Пользователь удалён из друзей', 'success');
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось удалить', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleBlock(friend: Friend) {
    setBusyId(friend.user_id);
    try {
      const chatId = await ensurePersonalChatId(friend);
      if (friend.peer_blocked_by_me) {
        await markChatUnblock(chatId);
        patchFriend(friend.user_id, { peer_blocked_by_me: false });
      } else {
        await markChatBlock(chatId);
        patchFriend(friend.user_id, { peer_blocked_by_me: true });
      }
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось изменить блокировку', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleNotificationsMute(friend: Friend, mutedUntil: string | null) {
    setBusyId(friend.user_id);
    setMuteMenuFor(null);
    try {
      const chatId = await ensurePersonalChatId(friend);
      await patchChatNotificationsMute(chatId, mutedUntil);
      patchFriend(friend.user_id, { notifications_muted_until: mutedUntil });
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось изменить уведомления', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Загрузка…</p>;

  return (
    <>
      <h1 className={styles.pageTitle}>Друзья</h1>
      {error && <p className={styles.error}>{error}</p>}

      {friends.length === 0 ? (
        <div className={styles.empty}>Пока нет друзей. Добавляйте пользователей через профиль в чате или RUscord.</div>
      ) : (
        <div className={styles.friendList}>
          {friends.map((friend) => {
            const displayName = formatDisplayName(friend.name, friend.email);
            const notificationsMuted = isActiveUntil(friend.notifications_muted_until);
            const chatMuted = isActiveUntil(friend.muted_until);
            const blocked = friend.peer_blocked_by_me || friend.peer_blocked_me;
            const busy = busyId === friend.user_id;

            return (
              <div key={friend.user_id} className={styles.friendItem}>
                <button
                  type="button"
                  className={styles.avatarWrap}
                  onClick={() => setProfileUser(friend)}
                  title="Профиль"
                >
                  <Avatar
                    userId={friend.user_id}
                    fallbackLetter={friend.name?.[0] || friend.email[0]}
                    size={44}
                    className={styles.avatar}
                  />
                  {friend.online ? <span className={styles.onlineDot} title="В сети" /> : null}
                </button>

                <div className={styles.friendBody}>
                  <div className={styles.nameRow}>
                    <span className={styles.friendName}>{displayName}</span>
                    <span className={styles.statusIcons} aria-label="Статус">
                      {blocked ? (
                        <span title={friend.peer_blocked_by_me ? 'Вы заблокировали' : 'Вас заблокировали'}>
                          <IconBan size={16} className={styles.statusIconBlocked} />
                        </span>
                      ) : null}
                      {chatMuted ? (
                        <span title="Ограничение на отправку сообщений">
                          <IconClock size={16} className={styles.statusIconMuted} />
                        </span>
                      ) : null}
                      {notificationsMuted ? (
                        <span title="Уведомления отключены">
                          <IconBellOff size={16} className={styles.statusIconMuted} />
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className={styles.friendEmail}>{friend.email}</div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={busy}
                    onClick={() => setProfileUser(friend)}
                  >
                    Профиль
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={busy}
                    onClick={() => void handleMessage(friend)}
                  >
                    Сообщение
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${friend.peer_blocked_by_me ? styles.actionBtnActive : ''}`}
                    disabled={busy}
                    onClick={() => void handleToggleBlock(friend)}
                  >
                    {friend.peer_blocked_by_me ? 'Разблок.' : 'Блок'}
                  </button>
                  <div className={styles.muteMenuWrap} ref={muteMenuFor === friend.user_id ? muteMenuRef : undefined}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${notificationsMuted ? styles.actionBtnActive : ''}`}
                      disabled={busy}
                      onClick={() => setMuteMenuFor((id) => (id === friend.user_id ? null : friend.user_id))}
                    >
                      {notificationsMuted ? 'Звук вкл.' : 'Без звука'}
                    </button>
                    {muteMenuFor === friend.user_id && (
                      <div className={styles.muteMenu}>
                        <button type="button" onClick={() => void handleNotificationsMute(friend, muteUntilHours(1))}>
                          1 час
                        </button>
                        <button type="button" onClick={() => void handleNotificationsMute(friend, muteUntilHours(24))}>
                          24 часа
                        </button>
                        <button type="button" onClick={() => void handleNotificationsMute(friend, muteUntilHours(24 * 7))}>
                          7 дней
                        </button>
                        {notificationsMuted && (
                          <button type="button" onClick={() => void handleNotificationsMute(friend, null)}>
                            Включить уведомления
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    disabled={busy}
                    onClick={() => void handleRemove(friend)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {profileUser && (
        <UserSettingsModal
          userId={profileUser.user_id}
          userName={profileUser.name}
          userEmail={profileUser.email}
          chatId={profileUser.personal_chat_id ?? null}
          onClose={() => setProfileUser(null)}
        />
      )}
    </>
  );
}
