import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { getChats, createChat, getChatAvailableUsers, type Chat, type ChatAvailableUser } from '../api';
import Avatar from '../components/Avatar';
import UserSettingsModal from '../components/UserSettingsModal';
import styles from './Chats.module.css';

export default function Chats() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'personal' | 'group' | null>(null);
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [userSettingsUser, setUserSettingsUser] = useState<{ id: string; name: string | null; email: string } | null>(null);

  useEffect(() => {
    getChats()
      .then(setChats)
      .catch(() => setError('Не удалось загрузить чаты'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (modal === 'personal' || modal === 'group') {
      getChatAvailableUsers()
        .then(setUsers)
        .catch(() => {});
    }
  }, [modal]);

  function openPersonal() {
    setModal('personal');
    setSelectedUserId('');
    setError('');
  }

  function openGroup() {
    setModal('group');
    setGroupName('');
    setSelectedUserIds(new Set());
    setError('');
  }

  function toggleGroupUser(id: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreatePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Выберите пользователя');
      return;
    }
    setCreating(true);
    setError('');
    createChat({ type: 'personal', user_id: selectedUserId })
      .then((chat) => {
        setChats((prev) => [chat, ...prev]);
        setModal(null);
        navigate(`/dashboard/chats/${chat.id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setCreating(false));
  }

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    const name = groupName.trim() || 'Без названия';
    setCreating(true);
    setError('');
    createChat({
      type: 'group',
      name,
      participant_ids: Array.from(selectedUserIds),
    })
      .then((chat) => {
        setChats((prev) => [chat, ...prev]);
        setModal(null);
        navigate(`/dashboard/chats/${chat.id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setCreating(false));
  }

  function chatDisplayName(chat: Chat): string {
    if (chat.type === 'group' && chat.name) return chat.name;
    const other = chat.participants.find((p) => p.user_id !== me?.id);
    return other ? other.email : 'Чат';
  }

  function otherParticipant(chat: Chat) {
    return chat.participants.find((p) => p.user_id !== me?.id);
  }

  function formatLastMessage(preview: Chat['last_message']): string {
    if (!preview) return '';
    const name = preview.sender_name || preview.sender_email;
    const maxMsgLen = 25;
    const msg = preview.content_preview.length > maxMsgLen
      ? preview.content_preview.slice(0, maxMsgLen - 3) + '...'
      : preview.content_preview;
    return `${name}: ${msg}`;
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Загрузка…</p>;

  return (
    <>
      <h1 className={styles.pageTitle}>Чатик*с</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={openPersonal}>
          Личный чат
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={openGroup}>
          Групповой чат
        </button>
      </div>

      {chats.length === 0 ? (
        <div className={styles.empty}>
          Нет чатов. Создайте личный или групповой чат.
        </div>
      ) : (
        <div className={styles.chatList}>
          {chats.map((chat) => {
            const other = otherParticipant(chat);
            return (
              <Link key={chat.id} to={`/dashboard/chats/${chat.id}`} className={styles.chatItem}>
                <div
                  className={styles.chatItemAvatar}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (chat.type === 'personal' && other) {
                      setUserSettingsUser({ id: other.user_id, name: other.name, email: other.email });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (chat.type === 'personal' && other) {
                        setUserSettingsUser({ id: other.user_id, name: other.name, email: other.email });
                      }
                    }
                  }}
                >
                  {chat.type === 'personal' && other ? (
                    <Avatar
                      userId={other.user_id}
                      fallbackLetter={other.name?.[0] || other.email[0]}
                      size={44}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarStack}>
                      {chat.participants
                        .filter((p) => p.user_id !== me?.id)
                        .slice(0, 4)
                        .map((p, i) => (
                          <button
                            key={p.user_id}
                            type="button"
                            className={styles.avatarStackItem}
                            style={{ zIndex: 4 - i }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUserSettingsUser({ id: p.user_id, name: p.name, email: p.email });
                            }}
                          >
                            <Avatar
                              userId={p.user_id}
                              fallbackLetter={p.name?.[0] || p.email[0]}
                              size={28}
                              className={styles.avatar}
                            />
                          </button>
                        ))}
                      {chat.participants.filter((p) => p.user_id !== me?.id).length === 0 && (
                        <div className={styles.avatarGroup} style={{ width: 44, height: 44, fontSize: '1rem' }} aria-hidden>G</div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.chatItemBody}>
                  <div className={styles.chatName}>{chatDisplayName(chat)}</div>
                  {chat.type === 'group' && (
                    <div className={styles.chatMeta}>
                      Группа · {chat.participants.length} участн.
                    </div>
                  )}
                  {chat.last_message && (
                    <div className={styles.chatLast} title={formatLastMessage(chat.last_message)}>
                      {formatLastMessage(chat.last_message)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {modal === 'personal' && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Новый личный чат</h2>
            <form onSubmit={handleCreatePersonal}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Пользователь</label>
                <select
                  className={styles.input}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">— Выберите —</option>
                  {users.filter((u) => u.id !== me?.id).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} {u.name ? `(${u.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button} disabled={creating}>
                  Создать
                </button>
                <button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userSettingsUser && (
        <UserSettingsModal
          userId={userSettingsUser.id}
          userName={userSettingsUser.name}
          userEmail={userSettingsUser.email}
          onClose={() => setUserSettingsUser(null)}
        />
      )}

      {modal === 'group' && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Новый групповой чат</h2>
            <form onSubmit={handleCreateGroup}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Название группы</label>
                <input
                  type="text"
                  className={styles.input}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Без названия"
                />
              </div>
              <div className={styles.field}>
                <span className={styles.sectionTitle}>Добавить участников</span>
                <div className={styles.userList}>
                  {users.filter((u) => u.id !== me?.id).map((u) => (
                    <label key={u.id} className={styles.userOption}>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(u.id)}
                        onChange={() => toggleGroupUser(u.id)}
                      />
                      {u.email} {u.name ? `(${u.name})` : ''}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button} disabled={creating}>
                  Создать
                </button>
                <button type="button" className={styles.buttonSecondary} onClick={() => setModal(null)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
