import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { getChats, createChat, getChatAvailableUsers, type Chat, type ChatAvailableUser } from '../api';
import { CHAT_UNREAD_EVENT, useChatUnread } from '../context/ChatUnreadContext';
import { formatDisplayName } from '../utils/displayName';
import Avatar from '../components/Avatar';
import ChatAvatar from '../components/ChatAvatar';
import UserSettingsModal from '../components/UserSettingsModal';
import { Badge, Button, UserSearchCombobox, IconUsers } from '../ui';
import styles from './Chats.module.css';

const POLL_MS = 20_000;

export default function Chats() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { refresh: refreshUnread } = useChatUnread();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [userSettingsUser, setUserSettingsUser] = useState<{ id: string; name: string | null; email: string } | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const list = await getChats();
      setChats(list);
    } catch {
      setError('Не удалось загрузить чаты');
    }
  }, []);

  useEffect(() => {
    loadChats().finally(() => setLoading(false));
    const intervalId = window.setInterval(() => void loadChats(), POLL_MS);
    const onUnread = () => void loadChats();
    window.addEventListener(CHAT_UNREAD_EVENT, onUnread);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(CHAT_UNREAD_EVENT, onUnread);
    };
  }, [loadChats]);

  useEffect(() => {
    if (newChatOpen) {
      getChatAvailableUsers()
        .then(setUsers)
        .catch(() => {});
    }
  }, [newChatOpen]);

  function openNewChat() {
    setNewChatOpen(true);
    setSelectedUserId('');
    setError('');
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
        setNewChatOpen(false);
        void refreshUnread();
        navigate(`/dashboard/chats/${chat.id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setCreating(false));
  }

  function chatDisplayName(chat: Chat): string {
    if (chat.type === 'group' && chat.name) return chat.name;
    const other = chat.participants.find((p) => p.user_id !== me?.id);
    return other ? formatDisplayName(other.name, other.email) : 'Чат';
  }

  function otherParticipant(chat: Chat) {
    return chat.participants.find((p) => p.user_id !== me?.id);
  }

  function formatLastMessage(preview: Chat['last_message']): string {
    if (!preview) return '';
    const name = formatDisplayName(preview.sender_name, preview.sender_email);
    const maxMsgLen = 25;
    const msg = preview.content_preview.length > maxMsgLen
      ? preview.content_preview.slice(0, maxMsgLen - 3) + '...'
      : preview.content_preview;
    return `${name}: ${msg}`;
  }

  const comboboxUsers = users.filter((u) => u.id !== me?.id);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Загрузка…</p>;

  return (
    <>
      <h1 className={styles.pageTitle}>Чатик*с</h1>
      {error && !newChatOpen && <p className={styles.error}>{error}</p>}

      <div className={styles.toolbar}>
        <Button type="button" onClick={openNewChat}>
          Личный чат
        </Button>
      </div>

      {chats.length === 0 ? (
        <div className={styles.empty}>
          Нет чатов. Создайте личный чат через поиск пользователя.
        </div>
      ) : (
        <div className={styles.chatList}>
          {chats.map((chat) => {
            const other = otherParticipant(chat);
            const unread = chat.unread_count ?? 0;
            return (
              <Link
                key={chat.id}
                to={`/dashboard/chats/${chat.id}`}
                className={`${styles.chatItem} ${unread > 0 ? styles.chatItemUnread : ''}`}
              >
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
                  ) : chat.has_avatar ? (
                    <ChatAvatar
                      chatId={chat.id}
                      fallbackLetter={chatDisplayName(chat)[0]}
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
                  <div className={styles.chatNameRow}>
                    {chat.type === 'group' ? (
                      <IconUsers size={16} className={styles.chatGroupIcon} aria-hidden />
                    ) : null}
                    <span className={styles.chatName}>{chatDisplayName(chat)}</span>
                    <Badge count={unread} />
                  </div>
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

      {newChatOpen && (
        <div className={styles.modalOverlay} onClick={() => setNewChatOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Новый личный чат</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleCreatePersonal}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Пользователь</label>
                <UserSearchCombobox
                  users={comboboxUsers}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  disabled={creating}
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="submit" disabled={creating}>
                  Создать
                </Button>
                <Button type="button" variant="ghost" onClick={() => setNewChatOpen(false)}>
                  Отмена
                </Button>
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
    </>
  );
}
