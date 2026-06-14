import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  getChat,
  getChatMessages,
  sendChatMessage,
  sendChatFileOffer,
  getChatPresence,
  acceptChatFileOffer,
  listChatFileTransfers,
  createChatTopic,
  deleteChatTopic,
  updateChat,
  addChatParticipant,
  removeChatParticipant,
  setChatParticipantRole,
  leaveChat,
  markChatBlock,
  markChatUnblock,
  patchChatNotificationsMute,
  getChatAvailableUsers,
  markChatRead,
  type Chat,
  type Message,
  type ChatTopic,
  type ChatAvailableUser,
  type FileOfferPayload,
  type ChatFileTransfer,
} from '../api';
import Avatar from '../components/Avatar';
import UserSettingsModal from '../components/UserSettingsModal';
import ChatFileOfferCard from '../components/ChatFileOfferCard';
import { chatP2pManager } from '../p2p/chatP2pManager';
import { CHAT_FILE_MAX_BYTES, type TransferProgress } from '../p2p/fileOfferTypes';
import { listHostBinds } from '../p2p/fileTransfer';
import { isUserOnline, syncTransferStatus, userIdEq } from '../p2p/transferStatusSync';
import { wsUrl } from '../apiConfig';
import { notifyChatUnreadChanged } from '../context/ChatUnreadContext';
import { formatDisplayName } from '../utils/displayName';
import { formatMessageTime, groupMessagesByDate } from '../utils/formatMessageTimestamp';
import { ScrollArea, IconBan, IconClock, IconBellOff, Badge, IconSend, IconPaperclip } from '../ui';
import type { ScrollAreaHandle } from '../ui';
import styles from './Chats.module.css';

export default function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicFromUrl = searchParams.get('topic');
  const { user: me, token } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<ChatTopic[]>([]);
  const [mainUnreadCount, setMainUnreadCount] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [manageOpen, setManageOpen] = useState(false);
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [addUserId, setAddUserId] = useState('');
  const [userSettingsUserId, setUserSettingsUserId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState<Record<string, TransferProgress>>({});
  const [transfersByMessage, setTransfersByMessage] = useState<Record<string, ChatFileTransfer[]>>({});
  const [fileSending, setFileSending] = useState(false);
  const [peerBlocked, setPeerBlocked] = useState(false);
  const [notificationsMutedUntil, setNotificationsMutedUntil] = useState<string | null>(null);
  const [muteMenuOpen, setMuteMenuOpen] = useState(false);
  const muteMenuRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<ScrollAreaHandle>(null);
  const hostFilesRef = useRef<Map<string, File>>(new Map());
  const selectedTopicIdRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const chatTypeRef = useRef<string | null>(null);
  chatTypeRef.current = chat?.type ?? null;
  messagesRef.current = messages;

  const refreshPresence = useCallback(() => {
    if (!chatId) return;
    getChatPresence(chatId)
      .then((p) => setOnlineUserIds(p.online_user_ids.map(String)))
      .catch(() => {});
  }, [chatId]);

  const transferRefreshTimersRef = useRef<Map<string, number>>(new Map());

  const refreshTransfersForMessage = useCallback(
    (messageId: string) => {
      if (!chatId) return;
      const timers = transferRefreshTimersRef.current;
      const existing = timers.get(messageId);
      if (existing) window.clearTimeout(existing);
      const handle = window.setTimeout(() => {
        timers.delete(messageId);
        listChatFileTransfers(chatId, messageId)
          .then((list) => setTransfersByMessage((prev) => ({ ...prev, [messageId]: list })))
          .catch(() => {});
      }, 400);
      timers.set(messageId, handle);
    },
    [chatId],
  );

  const isGroup = chat?.type === 'group';
  const isPersonal = chat?.type === 'personal';
  const isAdmin = chat?.participants.find((p) => p.user_id === me?.id)?.role === 'admin';
  const myParticipant = chat?.participants.find((p) => p.user_id === me?.id);
  const imMuted = Boolean(
    myParticipant?.muted_until && new Date(myParticipant.muted_until) > new Date(),
  );

  useEffect(() => {
    if (!chatId) return;
    getChat(chatId)
      .then((c) => {
        setChat(c);
        if (c.type === 'group') {
          setTopics(c.topics ?? []);
          setMainUnreadCount(c.main_unread_count ?? 0);
        } else {
          setTopics([]);
          setMainUnreadCount(0);
        }
        const urlTopic = topicFromUrl && c.topics?.some((t) => t.id === topicFromUrl) ? topicFromUrl : null;
        setSelectedTopicId(urlTopic);
        const mePart = c.participants.find((p) => p.user_id === me?.id);
        setPeerBlocked(Boolean(mePart?.peer_blocked));
        setNotificationsMutedUntil(mePart?.notifications_muted_until ?? null);
      })
      .catch(() => setError('Чат не найден'))
      .finally(() => setLoading(false));
  }, [chatId, me?.id, topicFromUrl]);

  useEffect(() => {
    if (!loading && chatId) {
      inputRef.current?.focus();
    }
  }, [loading, chatId]);

  useEffect(() => {
    if (!chatId) return;
    markChatRead(chatId, selectedTopicId)
      .then(() => notifyChatUnreadChanged())
      .catch(() => {});
    if (isGroup) {
      if (selectedTopicId === null) {
        setMainUnreadCount(0);
      } else {
        setTopics((prev) =>
          prev.map((t) => (t.id === selectedTopicId ? { ...t, unread_count: 0 } : t)),
        );
      }
    }
  }, [chatId, selectedTopicId, isGroup]);

  useEffect(() => {
    if (!chatId) return;
    getChatMessages(chatId, {
      topic_id: selectedTopicId || undefined,
      limit: 50,
    })
      .then(setMessages)
      .catch(() => {});
  }, [chatId, selectedTopicId]);

  useEffect(() => {
    if (!chatId || !me?.id) return;
    refreshPresence();
    const id = window.setInterval(refreshPresence, 12_000);
    return () => clearInterval(id);
  }, [chatId, me?.id, refreshPresence]);

  useEffect(() => {
    if (!chatId) return;
    chatP2pManager.setProgressHandler((p) => {
      const key = p.messageId || p.transferId;
      setTransferProgress((prev) => ({ ...prev, [key]: p }));
      if (
        p.status === 'negotiating' ||
        p.status === 'transferring' ||
        p.status === 'completed' ||
        p.status === 'failed' ||
        p.status === 'cancelled'
      ) {
        syncTransferStatus(chatId, p.transferId, p.status, p.bytesDone);
      }
    });
    return () => chatP2pManager.setProgressHandler(() => {});
  }, [chatId]);

  // Мгновенная доставка сообщений через WebSocket
  useEffect(() => {
    if (!chatId || !token || !me?.id) return;
    let cancelled = false;
    const wsUrlStr = wsUrl(`token=${encodeURIComponent(token)}`);
    const ws = new WebSocket(wsUrlStr);
    wsRef.current = ws;
    ws.onopen = () => {
      if (cancelled) return;
      ws.send(JSON.stringify({ type: 'subscribe', chat_id: chatId }));
      chatP2pManager.setContext(ws, chatId, me.id);
    };
    ws.onmessage = (event) => {
      if (cancelled) return;
      try {
        const raw = JSON.parse(event.data) as Record<string, unknown>;
        if (raw.type === 'chat_p2p_signal') {
          chatP2pManager.handleWsMessage(raw);
          return;
        }
        if (typeof raw.kind === 'string') {
          if (raw.kind === 'file_transfer_update' && String(raw.chat_id) === chatId && raw.transfer) {
            const tr = raw.transfer as ChatFileTransfer;
            refreshTransfersForMessage(tr.message_id);
            if (userIdEq(tr.host_user_id, me.id) && tr.status === 'pending') {
              const file = hostFilesRef.current.get(tr.message_id);
              if (file) {
                const msg = messagesRef.current.find((m) => m.id === tr.message_id);
                const payload = msg ? parseFilePayload(msg) : null;
                if (payload) {
                  void startHostTransferForMessage(tr.message_id, file, payload);
                }
              }
            }
            return;
          }
          if (raw.kind === 'topic_created' && String(raw.chat_id) === chatId && raw.topic && typeof raw.topic === 'object') {
            const topic = raw.topic as ChatTopic;
            setTopics((prev) => (prev.some((t) => t.id === topic.id) ? prev : [...prev, topic]));
          } else if (raw.kind === 'topic_deleted' && String(raw.chat_id) === chatId && raw.topic_id != null) {
            const tid = String(raw.topic_id);
            setTopics((prev) => prev.filter((t) => t.id !== tid));
            if (selectedTopicIdRef.current === tid) {
              setSelectedTopicId(null);
            }
          }
          return;
        }
        if (
          typeof raw.id !== 'string' ||
          typeof raw.chat_id !== 'string' ||
          String(raw.chat_id) !== chatId ||
          typeof raw.sender_id !== 'string' ||
          typeof raw.content !== 'string'
        ) {
          return;
        }
        const msg = raw as Message;
        const tab = selectedTopicIdRef.current;
        const msgTopic = msg.topic_id != null ? String(msg.topic_id) : null;
        const isOwn = userIdEq(msg.sender_id, me?.id ?? '');
        if (!isOwn) {
          if (msgTopic === null) {
            if (tab !== null) setMainUnreadCount((n) => n + 1);
          } else if (msgTopic !== tab) {
            setTopics((prev) =>
              prev.map((t) =>
                t.id === msgTopic ? { ...t, unread_count: (t.unread_count ?? 0) + 1 } : t,
              ),
            );
          }
        }
        if (tab === null && msgTopic !== null) return;
        if (tab !== null && msgTopic !== String(tab)) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (chatTypeRef.current === 'personal' && !isOwn) {
          scrollAreaRef.current?.scrollToBottom(true);
        }
        if (msg.message_type === 'file_offer') {
          refreshTransfersForMessage(msg.id);
        }
      } catch {
        // ignore non-JSON
      }
    };
    ws.onerror = () => {};
    return () => {
      cancelled = true;
      chatP2pManager.clearContext();
      wsRef.current = null;
      ws.close();
    };
  }, [chatId, token, me?.id, refreshTransfersForMessage]);

  useEffect(() => {
    for (const m of messages) {
      if (m.message_type === 'file_offer' && transfersByMessage[m.id] === undefined) {
        refreshTransfersForMessage(m.id);
      }
    }
  }, [messages, refreshTransfersForMessage, transfersByMessage]);

  async function startHostTransferForMessage(messageId: string, file: File, payload: FileOfferPayload) {
    if (!chatId || !me?.id) return;
    const transfers = await listChatFileTransfers(chatId, messageId);
    const pending = transfers.filter((t) => t.status === 'pending' || t.status === 'negotiating');
    for (const t of pending) {
      if (!userIdEq(t.host_user_id, me.id)) continue;
      const remoteId = t.receiver_user_id;
      if (!isUserOnline(remoteId, onlineUserIds)) continue;
      try {
        await chatP2pManager.startHostTransfer({
          transferId: t.id,
          messageId,
          file,
          remoteUserId: remoteId,
          payload,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка передачи');
      }
    }
    if (chat?.type === 'personal') {
      const peer = otherParticipantId();
      const t = transfers.find((x) => peer && x.receiver_user_id === peer);
      if (t && peer && onlineUserIds.includes(peer)) {
        await chatP2pManager.startHostTransfer({
          transferId: t.id,
          messageId,
          file,
          remoteUserId: peer,
          payload,
        });
      }
    }
  }

  function otherParticipantId(): string | undefined {
    if (!chat || chat.type !== 'personal') return undefined;
    return chat.participants.find((p) => p.user_id !== me?.id)?.user_id;
  }

  function parseFilePayload(msg: Message): FileOfferPayload | null {
    const p = msg.payload;
    if (!p || typeof p !== 'object') return null;
    const o = p as FileOfferPayload;
    if (!o.name || o.size == null) return null;
    return {
      file_id: String(o.file_id ?? msg.id),
      name: String(o.name),
      size: Number(o.size),
      mime: String(o.mime ?? 'application/octet-stream'),
      sha256: o.sha256 ?? null,
    };
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId || !me?.id) return;
    if (selectedTopicId) {
      setError('Файлы можно отправлять только в общий поток чата');
      return;
    }
    if (file.size > CHAT_FILE_MAX_BYTES) {
      setError(`Файл слишком большой (макс. ${Math.round(CHAT_FILE_MAX_BYTES / (1024 * 1024))} МБ)`);
      return;
    }
    if (!window.confirm(`Отправить «${file.name}» (${file.size} байт) по P2P?`)) return;
    setFileSending(true);
    setError('');
    const fileId = crypto.randomUUID();
    const payload: FileOfferPayload = {
      file_id: fileId,
      name: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream',
    };
    try {
      const msg = await sendChatFileOffer(chatId, payload);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      hostFilesRef.current.set(msg.id, file);
      refreshTransfersForMessage(msg.id);
      if (chat?.type === 'personal') {
        await startHostTransferForMessage(msg.id, file, payload);
      }
    } catch (err) {
      setError(formatSendMessageError(err instanceof Error ? err.message : 'Не удалось создать предложение файла'));
    } finally {
      setFileSending(false);
    }
  }

  async function handleAcceptFile(message: Message) {
    if (!chatId || !me?.id) return;
    const payload = parseFilePayload(message);
    if (!payload) return;
    setError('');
    setTransferProgress((prev) => {
      const next = { ...prev };
      delete next[message.id];
      return next;
    });
    try {
      const t = await acceptChatFileOffer(chatId, message.id);
      refreshTransfersForMessage(message.id);
      await chatP2pManager.startReceiverTransfer({
        transferId: t.id,
        messageId: message.id,
        remoteUserId: message.sender_id,
        fileName: payload.name,
        fileSize: payload.size,
        mime: payload.mime,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось принять файл');
    }
  }

  function handleRebindHostFile(messageId: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const msg = messages.find((m) => m.id === messageId);
      const payload = msg ? parseFilePayload(msg) : null;
      if (!payload || !chatP2pManager.tryRebindHostFile(messageId, file)) {
        setError('Выберите тот же файл (имя и размер должны совпадать)');
        return;
      }
      hostFilesRef.current.set(messageId, file);
      await startHostTransferForMessage(messageId, file, payload);
    };
    input.click();
  }

  function formatSendMessageError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('forbidden') || lower === 'запрещено') {
      if (imMuted) {
        const until = myParticipant?.muted_until;
        return until
          ? `Вы не можете отправлять сообщения — вы замьючены до ${new Date(until).toLocaleString('ru')}`
          : 'Вы не можете отправлять сообщения — действует ограничение на отправку';
      }
      if (peerBlocked) {
        return 'Вы заблокировали этого пользователя. Разблокируйте, чтобы отправить сообщение.';
      }
      const other = chat?.participants.find((p) => p.user_id !== me?.id);
      if (other?.peer_blocked) {
        return 'Этот пользователь заблокировал вас — отправка сообщений недоступна.';
      }
      return 'Отправка сообщений недоступна из‑за блокировки или ограничения.';
    }
    return raw;
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId || !input.trim() || sending) return;
    setSending(true);
    setError('');
    sendChatMessage(chatId, input.trim(), selectedTopicId || undefined)
      .then((msg) => {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        setInput('');
        scrollAreaRef.current?.scrollToBottom(true);
        inputRef.current?.focus();
      })
      .catch((err) =>
        setError(formatSendMessageError(err instanceof Error ? err.message : 'Ошибка')),
      )
      .finally(() => setSending(false));
  }

  function handleLeave() {
    if (!chatId) return;
    if (!confirm('Покинуть чат?')) return;
    leaveChat(chatId)
      .then(() => navigate('/dashboard/chats'))
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId || !newTopicName.trim()) return;
    createChatTopic(chatId, newTopicName.trim())
      .then((t) => {
        setTopics((prev) => [...prev, t]);
        setNewTopicName('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId || !addUserId) return;
    addChatParticipant(chatId, addUserId)
      .then(() => getChat(chatId).then(setChat))
      .then(() => setAddUserId(''))
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleRemoveParticipant(uid: string) {
    if (!chatId) return;
    removeChatParticipant(chatId, uid)
      .then(() => getChat(chatId).then(setChat))
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleSetRole(uid: string, role: string) {
    if (!chatId) return;
    setChatParticipantRole(chatId, uid, role)
      .then(() => getChat(chatId).then(setChat))
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleUpdateGroupName(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId || !newGroupName.trim()) return;
    updateChat(chatId, { name: newGroupName.trim() })
      .then((c) => {
        setChat(c);
        setNewGroupName('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  useEffect(() => {
    if (manageOpen) getChatAvailableUsers().then(setUsers).catch(() => {});
  }, [manageOpen]);

  useEffect(() => {
    if (!muteMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (muteMenuRef.current && !muteMenuRef.current.contains(e.target as Node)) {
        setMuteMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [muteMenuOpen]);

  function muteUntilHours(hours: number): string {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  const notificationsMuted = Boolean(
    notificationsMutedUntil && new Date(notificationsMutedUntil) > new Date(),
  );

  function handleToggleBlock() {
    if (!chatId) return;
    const action = peerBlocked ? markChatUnblock : markChatBlock;
    action(chatId)
      .then(() => {
        setPeerBlocked(!peerBlocked);
        if (chatId) getChat(chatId).then(setChat).catch(() => {});
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleNotificationsMute(mutedUntil: string | null) {
    if (!chatId) return;
    patchChatNotificationsMute(chatId, mutedUntil)
      .then(() => {
        setNotificationsMutedUntil(mutedUntil);
        setMuteMenuOpen(false);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleToggleNotificationsMute() {
    handleNotificationsMute(notificationsMuted ? null : muteUntilHours(24 * 365));
  }

  if (loading || !chat) {
    return (
      <>
        <Link to="/dashboard/chats" className={styles.backLink}>
          ← К списку чатов
        </Link>
        <p style={{ color: 'var(--text-muted)' }}>{loading ? 'Загрузка…' : 'Чат не найден'}</p>
      </>
    );
  }

  const otherParticipant = chat.participants.find((p) => p.user_id !== me?.id);
  const chatTitle = isGroup && chat.name
    ? chat.name
    : otherParticipant
      ? formatDisplayName(otherParticipant.name, otherParticipant.email)
      : 'Чат';
  const messageGroups = groupMessagesByDate(messages);

  return (
    <>
      <Link to="/dashboard/chats" className={styles.backLink}>
        ← К списку чатов
      </Link>
      <div className={styles.roomHeader}>
        {isPersonal && otherParticipant ? (
          <button
            type="button"
            className={styles.roomTitleBtn}
            onClick={() => setUserSettingsUserId(otherParticipant.user_id)}
            title="Настройки пользователя"
          >
            <h2 className={styles.roomTitle}>{chatTitle}</h2>
          </button>
        ) : (
          <h2 className={styles.roomTitle}>{chatTitle}</h2>
        )}
        <div className={styles.roomHeaderActions}>
          {isPersonal && (
            <div className={styles.personalToolbar}>
              <button
                type="button"
                className={`${styles.iconToolBtn} ${peerBlocked ? styles.iconToolBtnActive : ''}`}
                onClick={handleToggleBlock}
                title={peerBlocked ? 'Разблокировать' : 'Заблокировать'}
              >
                <IconBan size={18} />
              </button>
              <div className={styles.muteMenuWrap} ref={muteMenuRef}>
                <button
                  type="button"
                  className={`${styles.iconToolBtn} ${notificationsMuted ? styles.iconToolBtnActive : ''}`}
                  onClick={() => setMuteMenuOpen((v) => !v)}
                  title="Отключить уведомления на время"
                >
                  <IconClock size={18} />
                </button>
                {muteMenuOpen && (
                  <div className={styles.muteMenu}>
                    <button type="button" onClick={() => handleNotificationsMute(muteUntilHours(1))}>
                      1 час
                    </button>
                    <button type="button" onClick={() => handleNotificationsMute(muteUntilHours(24))}>
                      24 часа
                    </button>
                    <button type="button" onClick={() => handleNotificationsMute(muteUntilHours(24 * 7))}>
                      7 дней
                    </button>
                    {notificationsMuted && (
                      <button type="button" onClick={() => handleNotificationsMute(null)}>
                        Включить уведомления
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`${styles.iconToolBtn} ${notificationsMuted ? styles.iconToolBtnActive : ''}`}
                onClick={handleToggleNotificationsMute}
                title={notificationsMuted ? 'Включить уведомления' : 'Отключить уведомления'}
              >
                <IconBellOff size={18} />
              </button>
            </div>
          )}
          {isGroup && isAdmin && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => {
                setNewGroupName(chat.name || '');
                setManageOpen(true);
              }}
            >
              Управление
            </button>
          )}
          {isGroup && (
            <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleLeave}>
              Выйти из чата
            </button>
          )}
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      {isGroup && (
        <div className={styles.topicTabs}>
          <button
            type="button"
            className={`${styles.topicTab} ${selectedTopicId === null ? styles.topicTabActive : ''}`}
            onClick={() => setSelectedTopicId(null)}
          >
            <span>Общее</span>
            {mainUnreadCount > 0 ? <Badge count={mainUnreadCount} className={styles.topicTabBadge} /> : null}
          </button>
          {topics.map((t) => {
            const unread = t.unread_count ?? 0;
            return (
            <button
              key={t.id}
              type="button"
              className={`${styles.topicTab} ${selectedTopicId === t.id ? styles.topicTabActive : ''}`}
              onClick={() => setSelectedTopicId(t.id)}
            >
              <span>{t.name}</span>
              {unread > 0 ? <Badge count={unread} className={styles.topicTabBadge} /> : null}
            </button>
            );
          })}
        </div>
      )}

      <ScrollArea
        ref={scrollAreaRef}
        className={styles.messagesWrap}
        initialScrollToBottom
        initialScrollKey={`${chatId}-${selectedTopicId ?? 'main'}`}
        stickToBottom={false}
      >
        <div className={styles.messagesInner}>
        {messages.length === 0 && <p className={styles.muted}>Нет сообщений. Напишите первым.</p>}
        {messageGroups.map((group) => (
          <div key={group.dateKey} className={styles.messageDateGroup}>
            <div className={styles.dateDivider}>
              <span className={styles.dateDividerLabel}>{group.dateLabel}</span>
            </div>
            {group.messages.map((msg) => {
          const isOwn = userIdEq(msg.sender_id, me?.id ?? '');
          const isFileOffer = msg.message_type === 'file_offer';
          const isSelected = selectedMessageId === msg.id;
          const senderColor = msg.sender_message_color || '#ffffff';
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isOwn ? styles.messageRowOwn : ''} ${isSelected ? styles.messageRowSelected : ''}`}
              onClick={
                isFileOffer
                  ? undefined
                  : () => setSelectedMessageId((id) => (id === msg.id ? null : msg.id))
              }
              role={isFileOffer ? undefined : 'button'}
              tabIndex={isFileOffer ? undefined : 0}
              onKeyDown={
                isFileOffer
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMessageId((id) => (id === msg.id ? null : msg.id));
                      }
                    }
              }
            >
              {!isOwn ? (
                <button
                  type="button"
                  className={styles.messageAvatar}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserSettingsUserId(msg.sender_id);
                  }}
                  title="Настройки пользователя"
                >
                  <Avatar
                    userId={msg.sender_id}
                    fallbackLetter={msg.sender_name?.[0] || msg.sender_email[0]}
                    size={36}
                    className={styles.messageAvatarImg}
                  />
                </button>
              ) : (
                <div className={styles.messageAvatarPlaceholder} />
              )}
              <div className={`${styles.message} ${isOwn ? styles.messageOwn : ''}`}>
                <div className={styles.messageSender} style={{ color: senderColor }}>
                  {formatDisplayName(msg.sender_name, msg.sender_email)}
                </div>
                {msg.message_type === 'file_offer' && parseFilePayload(msg) ? (
                  <ChatFileOfferCard
                    isHost={userIdEq(msg.sender_id, me?.id ?? '')}
                    hostOnline={isUserOnline(msg.sender_id, onlineUserIds)}
                    payload={parseFilePayload(msg)!}
                    transfers={transfersByMessage[msg.id] ?? []}
                    progress={transferProgress[msg.id] ?? null}
                    needsRebind={
                      userIdEq(msg.sender_id, me?.id ?? '') &&
                      !hostFilesRef.current.has(msg.id) &&
                      listHostBinds().some((b) => b.messageId === msg.id)
                    }
                    onAccept={() => void handleAcceptFile(msg)}
                    onCancel={() => {
                      const tr = (transfersByMessage[msg.id] ?? [])[0];
                      if (tr) chatP2pManager.cancelTransfer(tr.id);
                    }}
                    onRebind={() => handleRebindHostFile(msg.id)}
                  />
                ) : (
                  <div className={styles.messageContent}>{msg.content}</div>
                )}
                <div className={styles.messageTime}>
                  {formatMessageTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
          </div>
        ))}
        </div>
      </ScrollArea>

      {imMuted && (
        <p className={styles.error} style={{ marginTop: '0.5rem' }}>
          Вы замьючены до {myParticipant?.muted_until ? new Date(myParticipant.muted_until).toLocaleString('ru') : ''}
        </p>
      )}
      <form onSubmit={handleSend} className={styles.sendForm}>
        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenFileInput}
          onChange={handleFileSelected}
        />
        <button
          type="button"
          className={`${styles.composerIconBtn}`}
          disabled={fileSending || imMuted || Boolean(selectedTopicId)}
          title="Прикрепить файл"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconPaperclip size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          className={styles.sendInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={imMuted ? 'Нет доступа к отправке' : 'Сообщение...'}
          disabled={sending || imMuted}
        />
        <button
          type="submit"
          className={`${styles.composerIconBtn} ${styles.composerSendBtn}`}
          disabled={sending || !input.trim() || imMuted}
          title="Отправить"
        >
          <IconSend size={20} />
        </button>
      </form>

      {manageOpen && isGroup && (
        <div className={styles.modalOverlay} onClick={() => setManageOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 className={styles.modalTitle}>Управление группой</h3>

            {isAdmin && (
              <>
                <div className={styles.manageSection}>
                  <form onSubmit={handleUpdateGroupName}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Название группы</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Название группы"
                      />
                    </div>
                    <button type="submit" className={styles.button}>Сохранить</button>
                  </form>
                </div>

                <div className={styles.manageSection}>
                  <p className={styles.sectionTitle}>Участники</p>
                  <div className={styles.participantsList}>
                    {chat.participants.map((p) => {
                      const isMuted = p.muted_until && new Date(p.muted_until) > new Date();
                      const isOwn = p.user_id === me?.id;
                      return (
                        <div key={p.user_id} className={styles.participantRow}>
                          {isOwn ? (
                            <div className={styles.participantAvatarPlaceholder} aria-hidden>—</div>
                          ) : (
                            <button
                              type="button"
                              className={styles.participantAvatarBtn}
                              onClick={() => setUserSettingsUserId(p.user_id)}
                              title="Настройки пользователя"
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
                            {isMuted && (
                              <span className={styles.mutedBadge} title={p.muted_until ?? ''}>
                                замьючен до {p.muted_until ? new Date(p.muted_until).toLocaleString('ru') : ''}
                              </span>
                            )}
                          </div>
                          {isAdmin && p.user_id !== me?.id && (
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.manageSection}>
                  <p className={styles.sectionTitle}>Добавить участника</p>
                  <form onSubmit={handleAddParticipant}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Пользователь</label>
                    <select className={styles.input} value={addUserId} onChange={(e) => setAddUserId(e.target.value)}>
                      <option value="">— Выберите —</option>
                      {users
                        .filter((u) => !chat.participants.some((p) => p.user_id === u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>{formatDisplayName(u.name, u.email)}</option>
                        ))}
                    </select>
                  </div>
                  <button type="submit" className={styles.button} disabled={!addUserId}>Добавить</button>
                </form>
                </div>

                <div className={styles.manageSection}>
                <p className={styles.sectionTitle}>Темы</p>
                <div className={styles.participantsList}>
                  {topics.map((t) => (
                    <div key={t.id} className={styles.topicRow}>
                      <span>{t.name}</span>
                      <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => {
                          if (confirm('Удалить тему?')) {
                            deleteChatTopic(chatId!, t.id)
                              .then(() => {
                                setTopics((prev) => prev.filter((x) => x.id !== t.id));
                                if (selectedTopicId === t.id) setSelectedTopicId(null);
                              })
                              .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
                          }
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
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
                  <button type="submit" className={styles.button} disabled={!newTopicName.trim()}>
                    Создать тему
                  </button>
                </form>
                </div>
              </>
            )}

            <div className={styles.modalActions} style={{ marginTop: '1rem' }}>
              <button type="button" className={styles.buttonSecondary} onClick={() => setManageOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {userSettingsUserId && chat && (() => {
        const p = chat.participants.find((x) => x.user_id === userSettingsUserId);
        if (!p) return null;
        return (
          <UserSettingsModal
            userId={p.user_id}
            userName={p.name}
            userEmail={p.email}
            chatId={chatId ?? null}
            isGroupAdmin={isAdmin}
            selectedMessageId={selectedMessageId}
            onClose={() => setUserSettingsUserId(null)}
            onMuted={() => chatId && getChat(chatId).then(setChat)}
            onMessageDeleted={() => {
              if (chatId) {
                getChatMessages(chatId, { topic_id: selectedTopicId || undefined, limit: 50 }).then(setMessages);
                setSelectedMessageId(null);
              }
            }}
            onRoleChanged={() => chatId && getChat(chatId).then(setChat)}
          />
        );
      })()}
    </>
  );
}
