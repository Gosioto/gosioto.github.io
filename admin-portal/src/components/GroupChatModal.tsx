import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addChatParticipant,
  createChatTopic,
  deleteChatAvatar,
  deleteChatTopic,
  deleteGroupChat,
  getChat,
  getChatAvailableUsers,
  removeChatParticipant,
  setChatParticipantRole,
  updateChat,
  updateChatAvatar,
  type Chat,
  type ChatAvailableUser,
  type ChatTopic,
} from '../api';
import Avatar from './Avatar';
import ChatAvatar from './ChatAvatar';
import { Button, Modal } from '../ui';
import { formatDisplayName } from '../utils/displayName';
import styles from '../pages/Chats.module.css';

type ParticipantFilter = 'all' | 'in_group' | 'not_in_group';

type Props = {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  chatId: string;
  meId: string | undefined;
  topics: ChatTopic[];
  onTopicsChange: (topics: ChatTopic[]) => void;
  onChatUpdated: (chat: Chat) => void;
  onDeleted: () => void;
  onError: (message: string) => void;
  onOpenUserSettings: (userId: string) => void;
};

export default function GroupChatModal({
  open,
  onClose,
  chat,
  chatId,
  meId,
  topics,
  onTopicsChange,
  onChatUpdated,
  onDeleted,
  onError,
  onOpenUserSettings,
}: Props) {
  const isAdmin = chat.participants.find((p) => p.user_id === meId)?.role === 'admin';
  const isImported = Boolean(chat.ruscord_server_id);
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [groupName, setGroupName] = useState(chat.name ?? '');
  const [newTopicName, setNewTopicName] = useState('');
  const [participantQuery, setParticipantQuery] = useState('');
  const [participantFilter, setParticipantFilter] = useState<ParticipantFilter>('all');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setGroupName(chat.name ?? '');
    getChatAvailableUsers().then(setUsers).catch(() => {});
  }, [open, chat.name]);

  const participantIds = useMemo(
    () => new Set(chat.participants.map((p) => p.user_id)),
    [chat.participants],
  );

  const filteredCandidates = useMemo(() => {
    const q = participantQuery.trim().toLowerCase();
    return users
      .filter((u) => u.id !== meId)
      .filter((u) => {
        const inGroup = participantIds.has(u.id);
        if (participantFilter === 'in_group') return inGroup;
        if (participantFilter === 'not_in_group') return !inGroup;
        return true;
      })
      .filter((u) => !q || formatDisplayName(u.name, u.email).toLowerCase().includes(q))
      .slice(0, 20);
  }, [users, meId, participantIds, participantFilter, participantQuery]);

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setSavingName(true);
    updateChat(chatId, { name: groupName.trim() })
      .then((c) => onChatUpdated(c))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingName(false));
  }

  function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === 'string' ? reader.result : '';
      if (!image) return;
      updateChatAvatar(chatId, image)
        .then(() => getChat(chatId).then(onChatUpdated))
        .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
    };
    reader.readAsDataURL(file);
  }

  function handleAddParticipant(userId: string) {
    setAddingUserId(userId);
    addChatParticipant(chatId, userId)
      .then(() => getChat(chatId).then(onChatUpdated))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setAddingUserId(null));
  }

  function handleRemoveParticipant(userId: string) {
    removeChatParticipant(chatId, userId)
      .then(() => getChat(chatId).then(onChatUpdated))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleSetRole(userId: string, role: string) {
    setChatParticipantRole(chatId, userId, role)
      .then(() => getChat(chatId).then(onChatUpdated))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    createChatTopic(chatId, newTopicName.trim())
      .then((t) => {
        onTopicsChange([...topics, t]);
        setNewTopicName('');
      })
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleDeleteTopic(topicId: string) {
    if (!confirm('Удалить тему?')) return;
    deleteChatTopic(chatId, topicId)
      .then(() => onTopicsChange(topics.filter((t) => t.id !== topicId)))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleDeleteGroup() {
    if (!confirm('Удалить группу безвозвратно?')) return;
    setDeleting(true);
    deleteGroupChat(chatId)
      .then(() => {
        onClose();
        onDeleted();
      })
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setDeleting(false));
  }

  return (
    <Modal open={open} onClose={onClose} title={chat.name || 'Группа'} overflowVisible>
      <div className={styles.groupModalBody}>
        <div className={styles.manageSection}>
          <p className={styles.sectionTitle}>Информация</p>
          <p className={styles.muted}>
            Тип: {isImported ? 'Импортированная' : 'Созданная'}
          </p>
          <div className={styles.groupModalAvatarRow}>
            <ChatAvatar
              chatId={chatId}
              fallbackLetter={(chat.name ?? 'G')[0]}
              size={64}
            />
            {isAdmin ? (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenFileInput}
                  onChange={handleAvatarSelected}
                />
                <Button type="button" variant="ghost" onClick={() => avatarInputRef.current?.click()}>
                  Изменить аватар
                </Button>
                {chat.has_avatar && !isImported ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      deleteChatAvatar(chatId)
                        .then(() => getChat(chatId).then(onChatUpdated))
                        .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
                    }
                  >
                    Удалить аватар
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
          {isAdmin ? (
            <form onSubmit={handleSaveName}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Название</label>
                <input
                  type="text"
                  className={styles.input}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={savingName}>
                Сохранить название
              </Button>
            </form>
          ) : (
            <p className={styles.groupModalName}>{chat.name}</p>
          )}
        </div>

        <div className={styles.manageSection}>
          <p className={styles.sectionTitle}>Участники ({chat.participants.length})</p>
          {isAdmin ? (
            <>
              <input
                type="search"
                className={styles.input}
                placeholder="Поиск пользователей…"
                value={participantQuery}
                onChange={(e) => setParticipantQuery(e.target.value)}
              />
              <div className={styles.groupModalFilterRow}>
                {(['all', 'in_group', 'not_in_group'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`${styles.buttonSecondary} ${participantFilter === f ? styles.groupFilterActive : ''}`}
                    onClick={() => setParticipantFilter(f)}
                  >
                    {f === 'all' ? 'Все' : f === 'in_group' ? 'В группе' : 'Нет'}
                  </button>
                ))}
              </div>
              {participantQuery.trim() && filteredCandidates.length > 0 ? (
                <ul className={styles.groupCandidateList}>
                  {filteredCandidates.map((u) => {
                    const inGroup = participantIds.has(u.id);
                    return (
                      <li key={u.id} className={styles.groupCandidateRow}>
                        <span>{formatDisplayName(u.name, u.email)}</span>
                        {!inGroup ? (
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={addingUserId === u.id}
                            onClick={() => handleAddParticipant(u.id)}
                          >
                            Добавить
                          </Button>
                        ) : (
                          <span className={styles.muted}>в группе</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </>
          ) : null}
          <div className={styles.participantsList}>
            {chat.participants.map((p) => {
              const isOwn = p.user_id === meId;
              const isMuted = p.muted_until && new Date(p.muted_until) > new Date();
              return (
                <div key={p.user_id} className={styles.participantRow}>
                  {isOwn ? (
                    <div className={styles.participantAvatarPlaceholder} aria-hidden>—</div>
                  ) : (
                    <button
                      type="button"
                      className={styles.participantAvatarBtn}
                      onClick={() => onOpenUserSettings(p.user_id)}
                      title="Профиль"
                    >
                      <Avatar
                        userId={p.user_id}
                        fallbackLetter={p.name?.[0] || p.email[0]}
                        size={36}
                        className={styles.participantAvatar}
                      />
                    </button>
                  )}
                  <div className={styles.participantInfo}>
                    <span className={styles.participantEmail}>
                      {isOwn ? 'Вы' : formatDisplayName(p.name, p.email)}
                    </span>
                    <span className={styles.participantRole}> · {p.role}</span>
                    {isMuted ? (
                      <span className={styles.muted}> · замьючен</span>
                    ) : null}
                  </div>
                  {isAdmin && !isOwn ? (
                    <div className={styles.participantActions}>
                      <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => handleSetRole(p.user_id, p.role === 'admin' ? 'member' : 'admin')}
                      >
                        {p.role === 'admin' ? 'Снять админа' : 'Админ'}
                      </button>
                      <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => handleRemoveParticipant(p.user_id)}
                      >
                        Удалить
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.manageSection}>
          <p className={styles.sectionTitle}>Темы</p>
          <div className={styles.participantsList}>
            {topics.map((t) => (
              <div key={t.id} className={styles.topicRow}>
                <span>{t.name}</span>
                {isAdmin ? (
                  <button
                    type="button"
                    className={styles.buttonSecondary}
                    onClick={() => handleDeleteTopic(t.id)}
                  >
                    Удалить
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {isAdmin ? (
            <form onSubmit={handleAddTopic}>
              <div className={styles.field}>
                <input
                  type="text"
                  className={styles.input}
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Название новой темы"
                />
              </div>
              <Button type="submit" disabled={!newTopicName.trim()}>
                Создать тему
              </Button>
            </form>
          ) : null}
        </div>

        {isAdmin && !isImported ? (
          <div className={styles.manageSection}>
            <Button type="button" variant="ghost" disabled={deleting} onClick={handleDeleteGroup}>
              Удалить группу
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
