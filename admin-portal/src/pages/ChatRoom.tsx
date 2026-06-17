import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  getChat,
  getChatMessages,
  sendChatMessage,
  sendChatFileOffer,
  uploadChatImage,
  getChatPresence,
  acceptChatFileOffer,
  listChatFileTransfers,
  leaveChat,
  markChatBlock,
  markChatUnblock,
  patchChatNotificationsMute,
  markChatRead,
  editChatMessage,
  deleteChatMessage,
  markMessageDelivered,
  type Chat,
  type Message,
  type ChatTopic,
  type FileOfferPayload,
  type ChatFileTransfer,
} from '../api';
import Avatar from '../components/Avatar';
import AvatarLightbox from '../components/AvatarLightbox';
import MessageStatus from '../components/MessageStatus';
import UserSettingsModal from '../components/UserSettingsModal';
import ChatFileOfferCard from '../components/ChatFileOfferCard';
import ChatImageMessage from '../components/ChatImageMessage';
import PresenceDot from '../components/PresenceDot';
import PeerContextMenu from '../components/PeerContextMenu';
import GroupChatModal from '../components/GroupChatModal';
import FriendNicknameModal from '../components/FriendNicknameModal';
import { chatP2pManager } from '../p2p/chatP2pManager';
import { CHAT_FILE_MAX_BYTES, type TransferProgress } from '../p2p/fileOfferTypes';
import { listHostBinds } from '../p2p/fileTransfer';
import { isUserOnline, syncTransferStatus, userIdEq } from '../p2p/transferStatusSync';
import { wsUrl } from '../apiConfig';
import { notifyChatUnreadChanged } from '../context/ChatUnreadContext';
import { FRIEND_PRESENCE_EVENT, type FriendPresenceDetail } from '../presenceEvents';
import { formatDisplayName } from '../utils/displayName';
import { formatFriendDisplayName } from '../utils/friendDisplayName';
import { usePeerContextMenu } from '../hooks/usePeerContextMenu';
import type { PeerMenuChatContext } from '../utils/peerMenu';
import { formatMessageTime, groupMessagesByDate } from '../utils/formatMessageTimestamp';
import { enrichMessagesForDisplay } from '../utils/messageGrouping';
import PeerActionsMenu from '../components/PeerActionsMenu';
import { dispatchChatParticipantSettingsChanged } from '../utils/chatParticipantSettings';
import { getGroupMessageDeliveryStatus } from '../utils/messageStatus';
import { canEditPersonalMessage, canDeleteMessage, showMessageEditMeta } from '../utils/messageEdit';
import { ScrollArea, IconBan, IconClock, IconBellOff, Badge, IconSend, IconPaperclip, Button, ContextMenu } from '../ui';
import type { ContextMenuItem } from '../ui';
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
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [nicknamePeerId, setNicknamePeerId] = useState<string | null>(null);
  const [userSettingsUserId, setUserSettingsUserId] = useState<string | null>(null);
  const [avatarLightboxUser, setAvatarLightboxUser] = useState<{
    userId: string;
    fallbackLetter: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showOriginalByMessageId, setShowOriginalByMessageId] = useState<Record<string, boolean>>({});
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [transferProgress, setTransferProgress] = useState<Record<string, TransferProgress>>({});
  const [transfersByMessage, setTransfersByMessage] = useState<Record<string, ChatFileTransfer[]>>({});
  const [fileSending, setFileSending] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [peerBlocked, setPeerBlocked] = useState(false);
  const [notificationsMutedUntil, setNotificationsMutedUntil] = useState<string | null>(null);
  const [muteMenuOpen, setMuteMenuOpen] = useState(false);
  const muteMenuRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<ScrollAreaHandle>(null);
  const hostFilesRef = useRef<Map<string, File>>(new Map());
  const selectedTopicIdRef = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const chatTypeRef = useRef<string | null>(null);
  chatTypeRef.current = chat?.type ?? null;
  messagesRef.current = messages;

  useEffect(() => {
    if (!chatId) return;
    localStorage.setItem('chats:lastChatId', chatId);
    if (selectedTopicId) {
      localStorage.setItem(`chats:lastTopic:${chatId}`, selectedTopicId);
    } else {
      localStorage.removeItem(`chats:lastTopic:${chatId}`);
    }
  }, [chatId, selectedTopicId]);

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

  const peerId = chat?.participants.find((p) => p.user_id !== me?.id)?.user_id ?? null;

  const openPeerProfile = useCallback((userId: string) => {
    setUserSettingsUserId(userId);
  }, []);

  const getPeerChatContext = useCallback(
    (userId: string): PeerMenuChatContext | null => {
      if (!chatId || !isPersonal || userId !== peerId) return null;
      return {
        chatId,
        peerBlocked,
        notificationsMutedUntil,
      };
    },
    [chatId, isPersonal, peerId, peerBlocked, notificationsMutedUntil],
  );

  const peerMenu = usePeerContextMenu({
    meId: me?.id,
    onOpenProfile: openPeerProfile,
    onError: (message) => setError(message),
    getChatContext: getPeerChatContext,
    onBlockChange: (blocked) => {
      setPeerBlocked(blocked);
      if (chatId) {
        dispatchChatParticipantSettingsChanged({ chatId, peerBlocked: blocked });
        getChat(chatId).then(setChat).catch(() => {});
      }
    },
    onMuteChange: (until) => {
      setNotificationsMutedUntil(until);
      if (chatId) {
        dispatchChatParticipantSettingsChanged({ chatId, notificationsMutedUntil: until });
      }
    },
    onEditNickname: (userId) => setNicknamePeerId(userId),
    onNicknameUpdated: () => {
      if (chatId) getChat(chatId).then(setChat).catch(() => {});
    },
  });

  useEffect(() => {
    if (!peerId || chat?.type !== 'personal') return;
    function onPresence(e: Event) {
      const detail = (e as CustomEvent<FriendPresenceDetail>).detail;
      if (detail.user_id !== peerId) return;
      if (detail.presence === 'online') {
        setOnlineUserIds((prev) => (prev.includes(peerId) ? prev : [...prev, peerId]));
      } else {
        setOnlineUserIds((prev) => prev.filter((id) => id !== peerId));
      }
    }
    window.addEventListener(FRIEND_PRESENCE_EVENT, onPresence);
    return () => window.removeEventListener(FRIEND_PRESENCE_EVENT, onPresence);
  }, [peerId, chat?.type]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (
        contextMenu ||
        peerMenu.target ||
        userSettingsUserId ||
        groupModalOpen ||
        nicknamePeerId ||
        avatarLightboxUser ||
        muteMenuOpen
      ) {
        return;
      }
      if (editingMessageId) {
        setEditingMessageId(null);
        setInput('');
        return;
      }
      if (chatId) navigate('/dashboard/chats');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    chatId,
    navigate,
    contextMenu,
    peerMenu.target,
    userSettingsUserId,
    groupModalOpen,
    nicknamePeerId,
    avatarLightboxUser,
    muteMenuOpen,
    editingMessageId,
  ]);

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
      .then((msgs) => {
        setMessages(msgs);
        if (chatTypeRef.current === 'personal' && !selectedTopicId) {
          for (const m of msgs) {
            if (!userIdEq(m.sender_id, me?.id ?? '')) {
              void markMessageDelivered(chatId, m.id).catch(() => {});
            }
          }
        }
      })
      .catch(() => {});
  }, [chatId, selectedTopicId, me?.id]);

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
          if (raw.kind === 'message_updated' && String(raw.chat_id) === chatId && raw.message) {
            const updated = raw.message as Message;
            const tab = selectedTopicIdRef.current;
            const msgTopic = updated.topic_id != null ? String(updated.topic_id) : null;
            if (tab === null && msgTopic !== null) return;
            if (tab !== null && msgTopic !== String(tab)) return;
            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            return;
          }
          if (raw.kind === 'message_deleted' && String(raw.chat_id) === chatId && raw.message_id != null) {
            const messageId = String(raw.message_id);
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            return;
          }
          if (raw.kind === 'delivery_update' && String(raw.chat_id) === chatId && raw.message_id != null) {
            const messageId = String(raw.message_id);
            const deliveredAt = String(raw.delivered_at ?? '');
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId ? { ...m, peer_delivered_at: deliveredAt || m.peer_delivered_at } : m,
              ),
            );
            return;
          }
          if (raw.kind === 'read_receipt' && String(raw.chat_id) === chatId && raw.user_id != null) {
            const userId = String(raw.user_id);
            const readAt = String(raw.read_at ?? '');
            setChat((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                participants: prev.participants.map((p) =>
                  p.user_id === userId ? { ...p, last_read_at: readAt } : p,
                ),
              };
            });
            return;
          }
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
        if (!isOwn) {
          void markChatRead(chatId, tab)
            .then(() => notifyChatUnreadChanged())
            .catch(() => {});
          if (chatTypeRef.current === 'personal' && msgTopic === null) {
            void markMessageDelivered(chatId, msg.id).catch(() => {});
          }
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

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId || !me?.id) return;
    if (selectedTopicId) {
      setError('Изображения можно отправлять только в общий поток чата');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Можно прикрепить только изображение');
      return;
    }
    setImageSending(true);
    setError('');
    try {
      const msg = await uploadChatImage(chatId, file);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setError(formatSendMessageError(err instanceof Error ? err.message : 'Не удалось отправить изображение'));
    } finally {
      setImageSending(false);
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
    const trimmed = input.trim();
    const editId = editingMessageId;
    const request = editId
      ? editChatMessage(chatId, editId, trimmed)
      : sendChatMessage(chatId, trimmed, selectedTopicId || undefined);
    request
      .then((msg) => {
        if (editId) {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
          setEditingMessageId(null);
        } else {
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
        setInput('');
        scrollAreaRef.current?.scrollToBottom(true);
        inputRef.current?.focus();
      })
      .catch((err) =>
        setError(formatSendMessageError(err instanceof Error ? err.message : 'Ошибка')),
      )
      .finally(() => {
        setSending(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      });
  }

  function handleComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  function startEditingMessage(msg: Message) {
    setEditingMessageId(msg.id);
    setInput(msg.content);
    inputRef.current?.focus();
  }

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setInput('');
  }

  function handleDeleteMessage(messageId: string) {
    if (!chatId) return;
    if (!confirm('Удалить сообщение?')) return;
    deleteChatMessage(chatId, messageId)
      .then(() => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (editingMessageId === messageId) cancelEditingMessage();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function buildContextMenuItems(msg: Message): ContextMenuItem[] {
    const items: ContextMenuItem[] = [];
    if (isPersonal && canEditPersonalMessage(msg, me?.id ?? '')) {
      items.push({
        id: 'edit',
        label: 'Редактировать',
        onClick: () => startEditingMessage(msg),
      });
    }
    if (canDeleteMessage(msg, me?.id ?? '', isPersonal, isAdmin)) {
      items.push({
        id: 'delete',
        label: 'Удалить',
        danger: true,
        onClick: () => handleDeleteMessage(msg.id),
      });
    }
    return items;
  }

  function handleLeave() {
    if (!chatId) return;
    if (!confirm('Покинуть чат?')) return;
    leaveChat(chatId)
      .then(() => navigate('/dashboard/chats'))
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

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

  useEffect(() => {
    if (!attachMenuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setAttachMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [attachMenuOpen]);

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
        const next = !peerBlocked;
        setPeerBlocked(next);
        dispatchChatParticipantSettingsChanged({ chatId, peerBlocked: next });
        getChat(chatId).then(setChat).catch(() => {});
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleNotificationsMute(mutedUntil: string | null) {
    if (!chatId) return;
    patchChatNotificationsMute(chatId, mutedUntil)
      .then(() => {
        setNotificationsMutedUntil(mutedUntil);
        dispatchChatParticipantSettingsChanged({ chatId, notificationsMutedUntil: mutedUntil });
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
  const peerLastReadAt = otherParticipant?.last_read_at ?? null;
  const peerOnline = otherParticipant ? isUserOnline(otherParticipant.user_id, onlineUserIds) : false;
  const chatTitle = isGroup && chat.name
    ? chat.name
    : otherParticipant
      ? formatFriendDisplayName(
          otherParticipant.name,
          otherParticipant.email,
          chat.peer_nickname,
        )
      : 'Чат';
  const messageGroups = groupMessagesByDate(messages);

  return (
    <>
      <div className={styles.chatRoomPage}>
      <Link to="/dashboard/chats" className={styles.backLink}>
        ← К списку чатов
      </Link>
      <div className={styles.chatRoomShell}>
      <div className={styles.chatRoomBody}>
      <div className={styles.roomHeader}>
        {isPersonal && otherParticipant ? (
          <div
            className={`${styles.roomTitleRow} ${styles.roomTitleRowClickable}`}
            onContextMenu={(e) => peerMenu.open(otherParticipant.user_id, e)}
          >
            <button
              type="button"
              className={styles.roomHeaderAvatarBtn}
              onClick={() => openPeerProfile(otherParticipant.user_id)}
              title="Профиль пользователя"
            >
              <span className={styles.roomHeaderAvatarWrap}>
                <Avatar
                  userId={otherParticipant.user_id}
                  fallbackLetter={otherParticipant.name?.[0] || otherParticipant.email[0]}
                  size={40}
                />
                <PresenceDot online={peerOnline} />
              </span>
            </button>
            <button
              type="button"
              className={styles.roomTitleBtn}
              onClick={() => openPeerProfile(otherParticipant.user_id)}
              onContextMenu={(e) => peerMenu.open(otherParticipant.user_id, e)}
              title="Профиль пользователя"
            >
              <h2 className={styles.roomTitle}>{chatTitle}</h2>
            </button>
          </div>
        ) : isGroup ? (
          <button
            type="button"
            className={styles.roomTitleGroupBtn}
            onClick={() => setGroupModalOpen(true)}
            title="Информация о группе"
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
              {otherParticipant ? (
                <PeerActionsMenu
                  peerUserId={otherParticipant.user_id}
                  meId={me?.id}
                  chatContext={{
                    chatId: chatId!,
                    peerBlocked,
                    notificationsMutedUntil,
                  }}
                  onOpenProfile={openPeerProfile}
                  onError={(message) => setError(message)}
                  onBlockChange={(blocked) => {
                    setPeerBlocked(blocked);
                    if (chatId) {
                      dispatchChatParticipantSettingsChanged({ chatId, peerBlocked: blocked });
                      getChat(chatId).then(setChat).catch(() => {});
                    }
                  }}
                  onMuteChange={(until) => {
                    setNotificationsMutedUntil(until);
                    if (chatId) {
                      dispatchChatParticipantSettingsChanged({ chatId, notificationsMutedUntil: until });
                    }
                  }}
                  onEditNickname={(userId) => setNicknamePeerId(userId)}
                  onNicknameUpdated={() => {
                    if (chatId) getChat(chatId).then(setChat).catch(() => {});
                  }}
                />
              ) : null}
            </div>
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
        stickToBottom={isPersonal}
      >
        <div className={styles.messagesInner}>
        {messages.length === 0 && <p className={styles.muted}>Нет сообщений. Напишите первым.</p>}
        {messageGroups.map((group) => (
          <div key={group.dateKey} className={styles.messageDateGroup}>
            <div className={styles.dateDivider}>
              <span className={styles.dateDividerLabel}>{group.dateLabel}</span>
            </div>
            {enrichMessagesForDisplay(group.messages).map(({ msg, isGrouped, showSender }) => {
          const isOwn = userIdEq(msg.sender_id, me?.id ?? '');
          const isFileOffer = msg.message_type === 'file_offer';
          const isImage = msg.message_type === 'image';
          const isAttachment = isFileOffer || isImage;
          const senderColor = msg.sender_message_color || '#ffffff';
          const showMessageAvatar = !isOwn && !isGrouped;
          const editMetaVisible = showMessageEditMeta(msg);
          const displayContent =
            editMetaVisible && showOriginalByMessageId[msg.id] && msg.original_content
              ? msg.original_content
              : msg.content;
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isOwn ? styles.messageRowOwn : ''} ${isGrouped ? styles.messageRowGrouped : ''}`}
              onContextMenu={(e) => {
                if (isAttachment) return;
                e.preventDefault();
                const items = buildContextMenuItems(msg);
                if (items.length === 0) return;
                setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
              }}
            >
              {showMessageAvatar ? (
                <div
                  className={styles.messageAvatar}
                  onContextMenu={(e) => peerMenu.open(msg.sender_id, e)}
                >
                  <Avatar
                    userId={msg.sender_id}
                    fallbackLetter={msg.sender_name?.[0] || msg.sender_email[0]}
                    size={36}
                    className={styles.messageAvatarImg}
                  />
                </div>
              ) : (
                <div className={styles.messageAvatarPlaceholder} />
              )}
              <div className={`${styles.message} ${isOwn ? styles.messageOwn : ''}`}>
                {showSender ? (
                  <div
                    className={styles.messageSender}
                    style={{ color: senderColor }}
                    onContextMenu={(e) => peerMenu.open(msg.sender_id, e)}
                  >
                    {formatDisplayName(msg.sender_name, msg.sender_email)}
                  </div>
                ) : null}
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
                ) : isImage && chatId ? (
                  <ChatImageMessage
                    chatId={chatId}
                    messageId={msg.id}
                    payload={
                      msg.payload && typeof msg.payload === 'object'
                        ? (msg.payload as { width?: number; height?: number; size?: number })
                        : null
                    }
                  />
                ) : (
                  <div className={styles.messageContent}>{displayContent}</div>
                )}
                <div className={`${styles.messageTime} ${styles.messageTimeMeta}`}>
                  <span>{formatMessageTime(msg.created_at)}</span>
                  {isPersonal && isOwn && !isAttachment ? (
                    <MessageStatus
                      createdAt={msg.created_at}
                      peerLastReadAt={peerLastReadAt}
                      peerDeliveredAt={msg.peer_delivered_at}
                    />
                  ) : null}
                  {isGroup && isOwn && !isAttachment ? (
                    <MessageStatus
                      createdAt={msg.created_at}
                      status={getGroupMessageDeliveryStatus(msg.created_at, chat.participants, me?.id ?? '')}
                    />
                  ) : null}
                  {editMetaVisible ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>ред. {formatMessageTime(msg.edited_at!)}</span>
                    </>
                  ) : null}
                  {editMetaVisible ? (
                    <button
                      type="button"
                      className={styles.messageOriginalToggle}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOriginalByMessageId((prev) => ({
                          ...prev,
                          [msg.id]: !prev[msg.id],
                        }));
                      }}
                    >
                      {showOriginalByMessageId[msg.id] ? 'показать сообщение' : 'показать оригинал'}
                    </button>
                  ) : null}
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
      {editingMessageId ? (
        <div className={styles.messageEditBar}>
          <span className={styles.messageEditBarHint}>Редактирование сообщения</span>
          <Button type="button" variant="ghost" onClick={cancelEditingMessage}>
            Отмена
          </Button>
        </div>
      ) : null}
      <form onSubmit={handleSend} className={styles.sendForm}>
        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenFileInput}
          onChange={handleFileSelected}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={handleImageSelected}
        />
        <div className={styles.attachWrap} ref={attachMenuRef}>
          <button
            type="button"
            className={styles.composerIconBtn}
            disabled={fileSending || imageSending || imMuted || Boolean(selectedTopicId)}
            title="Прикрепить"
            aria-expanded={attachMenuOpen}
            onClick={() => setAttachMenuOpen((v) => !v)}
          >
            <IconPaperclip size={20} />
          </button>
          {attachMenuOpen ? (
            <div className={styles.attachMenu} role="menu">
              <button
                type="button"
                className={styles.attachMenuItem}
                role="menuitem"
                onClick={() => {
                  setAttachMenuOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                Файл по P2P
              </button>
              <button
                type="button"
                className={styles.attachMenuItem}
                role="menuitem"
                onClick={() => {
                  setAttachMenuOpen(false);
                  imageInputRef.current?.click();
                }}
              >
                Изображение в чат
              </button>
            </div>
          ) : null}
        </div>
        <textarea
          ref={inputRef}
          rows={1}
          className={styles.sendInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={
            imMuted ? 'Нет доступа к отправке' : editingMessageId ? 'Редактирование…' : 'Сообщение...'
          }
          disabled={sending || imMuted}
        />
        <button
          type="submit"
          className={`${styles.composerIconBtn} ${styles.composerSendBtn}`}
          disabled={sending || !input.trim() || imMuted}
          title={editingMessageId ? 'Сохранить' : 'Отправить'}
        >
          <IconSend size={20} />
        </button>
      </form>
      </div>
      </div>
      </div>

      {isGroup && chatId ? (
        <GroupChatModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          chat={chat}
          chatId={chatId}
          meId={me?.id}
          topics={topics}
          onTopicsChange={setTopics}
          onChatUpdated={setChat}
          onDeleted={() => navigate('/dashboard/chats')}
          onError={(message) => setError(message)}
          onOpenUserSettings={setUserSettingsUserId}
        />
      ) : null}

      {nicknamePeerId ? (
        <FriendNicknameModal
          peerUserId={nicknamePeerId}
          onClose={() => setNicknamePeerId(null)}
          onSaved={() => {
            if (chatId) getChat(chatId).then(setChat).catch(() => {});
          }}
          onError={(message) => setError(message)}
        />
      ) : null}

      {contextMenu ? (
        <ContextMenu
          open
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextMenuItems(contextMenu.message)}
          onClose={() => setContextMenu(null)}
        />
      ) : null}

      {peerMenu.target ? (
        <PeerContextMenu
          x={peerMenu.target.x}
          y={peerMenu.target.y}
          items={peerMenu.items}
          onClose={peerMenu.close}
        />
      ) : null}

      {avatarLightboxUser ? (
        <AvatarLightbox
          userId={avatarLightboxUser.userId}
          fallbackLetter={avatarLightboxUser.fallbackLetter}
          onClose={() => setAvatarLightboxUser(null)}
        />
      ) : null}

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
            onClose={() => setUserSettingsUserId(null)}
            onAvatarClick={() =>
              setAvatarLightboxUser({
                userId: p.user_id,
                fallbackLetter: p.name?.[0] || p.email[0],
              })
            }
            onMuted={() => chatId && getChat(chatId).then(setChat)}
            onRoleChanged={() => chatId && getChat(chatId).then(setChat)}
          />
        );
      })()}
    </>
  );
}
