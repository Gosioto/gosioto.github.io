import { API_BASE, healthUrl } from './apiConfig';

export { API_BASE } from './apiConfig';

export type Role = {
  id: string;
  name: string;
  slug: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  has_avatar?: boolean;
  message_color?: string;
  role?: Role | null;
  permissions?: string[] | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ModuleInfo = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type DashboardStats = {
  users_count: number;
  modules_count: number;
};

function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, password }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error('Аккаунт заблокирован');
    const err = await res.json().catch(() => ({}));
    const detail = typeof err.detail === 'string' ? err.detail.toLowerCase() : '';
    const apiErr = typeof err.error === 'string' ? err.error.toLowerCase() : '';
    if (res.status === 401 && (detail === 'unauthorized' || apiErr === 'unauthorized')) {
      throw new Error('Неверный логин или пароль');
    }
    throw new Error(err.detail || err.error || 'Неверный логин или пароль');
  }
  return res.json();
}

/** Thrown by {@link me}; use {@link MeRequestError.kind} to tell invalid session from network/server errors. */
export type MeErrorKind = 'unauthorized' | 'forbidden' | 'server' | 'client' | 'network' | 'unknown';

export class MeRequestError extends Error {
  readonly name = 'MeRequestError';
  constructor(
    message: string,
    public readonly kind: MeErrorKind,
    public readonly status?: number
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function me(): Promise<User> {
  const token = getToken();
  if (!token) throw new MeRequestError('Not authenticated', 'unknown');
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new MeRequestError('Network error', 'network');
  }
  if (!res.ok) {
    if (res.status === 401) throw new MeRequestError('Session expired', 'unauthorized', 401);
    if (res.status === 403) throw new MeRequestError('Account blocked', 'forbidden', 403);
    if (res.status >= 500) throw new MeRequestError(`Server error (${res.status})`, 'server', res.status);
    throw new MeRequestError(`Request failed (${res.status})`, 'client', res.status);
  }
  return res.json();
}

export async function updateMe(data: { name?: string; message_color?: string }): Promise<User> {
  const res = await authFetch('/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function getModules(): Promise<ModuleInfo[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/modules/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load modules');
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/modules/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export class HealthCheckError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'HealthCheckError';
    this.code = code;
  }
}

export async function health(): Promise<{ status: string; database?: string }> {
  let res: Response;
  try {
    res = await fetch(healthUrl());
  } catch {
    throw new HealthCheckError('Нет соединения');
  }
  if (!res.ok) throw new HealthCheckError(String(res.status));
  return res.json();
}

// --- Roles & permissions ---

export type PermissionGroup = [string, string[]]; // [groupName, codes]

export type RoleFull = {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
  permission_codes: string[];
};

export type UserWithRole = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  has_avatar: boolean;
  role: RoleFull | null;
};

function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, ...(init?.headers as Record<string, string>) };
  if (init?.body && !(init.headers as Record<string, string>)?.['Content-Type']) headers['Content-Type'] = 'application/json';
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/** URL аватара пользователя (требует авторизации при запросе). */
export function avatarUrl(userId: string): string {
  return `${API_BASE}/avatars/${userId}`;
}

/** Заголовки для запроса аватара (Bearer) — для <img> через fetch или прокидывание token в src не подходит; используйте компонент с fetch + blob URL или бэкенд с cookie. */
export function avatarHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function updateMyAvatar(imageBase64: string): Promise<void> {
  const res = await authFetch('/me/avatar', {
    method: 'PATCH',
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function deleteMyAvatar(): Promise<void> {
  const res = await authFetch('/me/avatar', { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function updateUserAvatar(userId: string, imageBase64: string): Promise<void> {
  const res = await authFetch(`/users/${userId}/avatar`, {
    method: 'PATCH',
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function deleteUserAvatar(userId: string): Promise<void> {
  const res = await authFetch(`/users/${userId}/avatar`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function getPermissions(): Promise<PermissionGroup[]> {
  const res = await authFetch('/permissions');
  if (!res.ok) throw new Error('Failed to load permissions');
  return res.json();
}

export async function getRoles(): Promise<RoleFull[]> {
  const res = await authFetch('/roles');
  if (!res.ok) throw new Error('Failed to load roles');
  return res.json();
}

export async function createRole(name: string, slug: string): Promise<RoleFull> {
  const res = await authFetch('/roles', { method: 'POST', body: JSON.stringify({ name, slug }) });
  if (!res.ok) throw new Error('Failed to create role');
  return res.json();
}

export async function updateRole(roleId: string, data: { name?: string; slug?: string }): Promise<RoleFull> {
  const res = await authFetch(`/roles/${roleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function updateRolePermissions(roleId: string, permission_codes: string[]): Promise<RoleFull> {
  const res = await authFetch(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permission_codes }),
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
}

export async function deleteRole(roleId: string): Promise<void> {
  const res = await authFetch(`/roles/${roleId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete role');
}

export async function getUsers(): Promise<UserWithRole[]> {
  const res = await authFetch('/users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function getUser(userId: string): Promise<UserWithRole> {
  const res = await authFetch(`/users/${userId}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { detail?: string; error?: string };
    return j.detail || j.error || text || 'Ошибка';
  } catch {
    return text || 'Ошибка';
  }
}

export async function createUser(data: { email: string; name?: string; password: string }): Promise<UserWithRole> {
  const res = await authFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ email: data.email.trim().toLowerCase(), name: data.name?.trim() || null, password: data.password }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function updateUser(
  userId: string,
  data: { name?: string; new_password?: string }
): Promise<UserWithRole> {
  const res = await authFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function assignUserRole(userId: string, roleId: string): Promise<void> {
  const res = await authFetch(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role_id: roleId }),
  });
  if (!res.ok) throw new Error('Failed to assign role');
}

export async function removeUserRole(userId: string): Promise<void> {
  const res = await authFetch(`/users/${userId}/role`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove role');
}

// --- Друзья (заявки в друзья) ---

export type FriendStatus = {
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'self';
  from_user_id?: string;
};

export async function getFriendStatus(userId: string): Promise<FriendStatus> {
  const res = await authFetch(`/friends/status/${userId}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function sendFriendRequest(toUserId: string): Promise<void> {
  const res = await authFetch('/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ to_user_id: toUserId }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function acceptFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  const res = await authFetch('/friends/requests/accept', {
    method: 'POST',
    body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function rejectFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  const res = await authFetch('/friends/requests/reject', {
    method: 'POST',
    body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export type Friend = {
  user_id: string;
  email: string;
  name: string | null;
  has_avatar: boolean;
  online: boolean;
  personal_chat_id?: string | null;
  peer_blocked_by_me: boolean;
  peer_blocked_me: boolean;
  notifications_muted_until?: string | null;
  muted_until?: string | null;
};

export async function getFriends(): Promise<Friend[]> {
  const res = await authFetch('/friends');
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function removeFriend(userId: string): Promise<void> {
  const res = await authFetch(`/friends/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

// --- RUscord ---

export type RuscordServer = {
  id: string;
  name: string;
  owner_id: string | null;
  description: string | null;
  icon_url: string | null;
  has_icon?: boolean;
  visibility: string;
  chat_id?: string | null;
};
export type RuscordVoiceChannel = { id: string; server_id: string; name: string; sort_order: number };
export type RuscordGuildChannel = {
  id: string;
  server_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  channel_type: string;
  topic: string | null;
  unread_count?: number;
  chat_topic_id?: string | null;
};
export type RuscordInvite = {
  code: string;
  server_id: string;
  channel_id: string | null;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
};
export type RuscordGuildMessage = {
  id: string;
  channel_id: string;
  author_id: string;
  author_email: string;
  author_name: string | null;
  author_message_color?: string;
  content: string;
  created_at: string;
};
export type RuscordVoiceMember = {
  user_id: string;
  email: string;
  name: string | null;
  joined_at: string;
  mute_mic?: boolean;
  video_enabled?: boolean;
  screen_share_enabled?: boolean;
};

export type RuscordChannelWithMembers = {
  channel: RuscordVoiceChannel;
  members: RuscordVoiceMember[];
};

export async function ruscordMe(): Promise<{
  channel_id: string | null;
  channel_name?: string | null;
  members?: RuscordVoiceMember[];
}> {
  const res = await authFetch('/ruscord/me');
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = await res.json();
  return {
    channel_id: data.channel_id ?? null,
    channel_name: data.channel_name ?? null,
    members: Array.isArray(data.members) ? data.members : undefined,
  };
}

export async function ruscordListServers(): Promise<RuscordServer[]> {
  const res = await authFetch('/ruscord/servers');
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordListChannels(serverId: string): Promise<RuscordVoiceChannel[]> {
  const res = await authFetch(`/ruscord/servers/${serverId}/channels`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordChannelsWithMembers(serverId: string): Promise<RuscordChannelWithMembers[]> {
  const res = await authFetch(`/ruscord/servers/${serverId}/channels-with-members`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordListServerChannelsFull(serverId: string): Promise<RuscordGuildChannel[]> {
  const res = await authFetch(`/ruscord/servers/${serverId}/channels-full`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordCreateServer(name: string): Promise<RuscordServer> {
  const res = await authFetch('/ruscord/servers', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export type RuscordServerMember = {
  user_id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  joined_at: string;
  is_online?: boolean;
};

export async function ruscordListServerMembers(serverId: string): Promise<RuscordServerMember[]> {
  const res = await authFetch(`/ruscord/servers/${serverId}/members`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordListInvites(serverId: string): Promise<RuscordInvite[]> {
  const res = await authFetch(`/ruscord/servers/${serverId}/invites`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordRevokeInvite(serverId: string, code: string): Promise<void> {
  const res = await authFetch(`/ruscord/servers/${serverId}/invites/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function ruscordCreateGuildChannel(
  serverId: string,
  body: { name: string; channel_type: 'text' | 'voice' | 'category'; parent_id?: string | null }
): Promise<RuscordGuildChannel> {
  const res = await authFetch(`/ruscord/servers/${serverId}/channels-full`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordCreateInvite(
  serverId: string,
  body?: { channel_id?: string | null; max_uses?: number | null; expires_in_hours?: number | null }
): Promise<RuscordInvite> {
  const res = await authFetch(`/ruscord/servers/${serverId}/invites`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordAcceptInvite(code: string): Promise<RuscordServer> {
  const res = await authFetch('/ruscord/invites/accept', {
    method: 'POST',
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordListChannelMessages(channelId: string, limit = 50): Promise<RuscordGuildMessage[]> {
  const q = new URLSearchParams({ limit: String(Math.min(limit, 100)) });
  const res = await authFetch(`/ruscord/channels/${channelId}/messages?${q}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordPostChannelMessage(channelId: string, content: string): Promise<RuscordGuildMessage> {
  const res = await authFetch(`/ruscord/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordChannelMembers(channelId: string): Promise<RuscordVoiceMember[]> {
  const res = await authFetch(`/ruscord/channels/${channelId}/members`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordJoinChannel(channelId: string): Promise<void> {
  const res = await authFetch(`/ruscord/channels/${channelId}/join`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function ruscordLeaveChannel(channelId: string): Promise<void> {
  const res = await authFetch(`/ruscord/channels/${channelId}/leave`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** SFU POC (LiveKit): требует LIVEKIT_* на API; комната = UUID голосового канала. */
export async function ruscordLivekitToken(channelId: string): Promise<{
  url: string;
  token: string;
  room_name: string;
}> {
  const res = await authFetch(`/ruscord/livekit/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel_id: channelId }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export type VoiceStatePatch = {
  mute_mic?: boolean;
  video_enabled?: boolean;
  screen_share_enabled?: boolean;
};

export async function ruscordPatchVoiceState(channelId: string, patch: VoiceStatePatch): Promise<void> {
  const res = await authFetch(`/ruscord/channels/${channelId}/voice-state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export function ruscordIconUrl(serverId: string, cacheKey = 0): string {
  const qs = cacheKey > 0 ? `?v=${cacheKey}` : '';
  return `${API_BASE}/ruscord/icons/${serverId}${qs}`;
}

export async function ruscordPatchServerIcon(serverId: string, imageBase64: string): Promise<RuscordServer> {
  const res = await authFetch(`/ruscord/servers/${serverId}/icon`, {
    method: 'PATCH',
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordDeleteServerIcon(serverId: string): Promise<RuscordServer> {
  const res = await authFetch(`/ruscord/servers/${serverId}/icon`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordPatchServer(
  serverId: string,
  body: { name?: string; icon_url?: string | null; description?: string | null },
): Promise<RuscordServer> {
  const res = await authFetch(`/ruscord/servers/${serverId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordPatchChannel(
  channelId: string,
  body: { name?: string; sort_order?: number; parent_id?: string | null; topic?: string | null },
): Promise<RuscordGuildChannel> {
  const res = await authFetch(`/ruscord/channels/${channelId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function ruscordDeleteChannel(channelId: string): Promise<void> {
  const res = await authFetch(`/ruscord/channels/${channelId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function ruscordReorderChannels(
  serverId: string,
  order: { id: string; sort_order: number; parent_id: string | null }[],
): Promise<void> {
  const res = await authFetch(`/ruscord/servers/${serverId}/channels/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function ruscordMarkChannelRead(channelId: string): Promise<void> {
  const res = await authFetch(`/ruscord/channels/${channelId}/read`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

// --- Чатик*с ---

export type ChatParticipant = {
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  joined_at: string;
  muted_until?: string | null;
  peer_blocked?: boolean;
  notifications_muted_until?: string | null;
};

export type ChatTopic = {
  id: string;
  name: string;
  created_at: string;
  unread_count?: number;
};

export type MessagePreview = {
  id: string;
  content_preview: string;
  sender_email: string;
  sender_name: string | null;
  created_at: string;
};

export type Chat = {
  id: string;
  type: 'personal' | 'group';
  name: string | null;
  created_at: string;
  participants: ChatParticipant[];
  topics: ChatTopic[] | null;
  last_message: MessagePreview | null;
  unread_count?: number;
  main_unread_count?: number;
  ruscord_server_id?: string | null;
  has_avatar?: boolean;
};

export type Message = {
  id: string;
  chat_id: string;
  topic_id: string | null;
  sender_id: string;
  sender_email: string;
  sender_name: string | null;
  sender_message_color?: string;
  content: string;
  message_type?: string;
  payload?: FileOfferPayload | null;
  created_at: string;
};

export type FileOfferPayload = {
  file_id: string;
  name: string;
  size: number;
  mime: string;
  sha256?: string | null;
};

export type ChatFileTransfer = {
  id: string;
  message_id: string;
  host_user_id: string;
  receiver_user_id: string;
  status: string;
  bytes_transferred: number;
  updated_at: string;
};

export type ChatAvailableUser = {
  id: string;
  email: string;
  name: string | null;
};

/** Список пользователей для добавления в чаты (доступен всем авторизованным, без права users.read). */
export async function getChatAvailableUsers(): Promise<ChatAvailableUser[]> {
  const res = await authFetch('/chats/available-users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function getChats(): Promise<Chat[]> {
  const res = await authFetch('/chats');
  if (!res.ok) throw new Error('Failed to load chats');
  return res.json();
}

export async function createChat(params: {
  type: 'personal' | 'group';
  user_id?: string;
  name?: string;
  participant_ids?: string[];
}): Promise<Chat> {
  const res = await authFetch('/chats', {
    method: 'POST',
    body: JSON.stringify({
      type: params.type,
      user_id: params.user_id ?? null,
      name: params.name ?? null,
      participant_ids: params.participant_ids ?? null,
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function getChat(chatId: string): Promise<Chat> {
  const res = await authFetch(`/chats/${chatId}`);
  if (!res.ok) throw new Error('Failed to load chat');
  return res.json();
}

export async function markChatRead(chatId: string, topicId?: string | null): Promise<void> {
  const body =
    topicId != null && topicId !== ''
      ? JSON.stringify({ topic_id: topicId })
      : undefined;
  const res = await authFetch(`/chats/${chatId}/read`, {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function updateChat(chatId: string, data: { name?: string }): Promise<Chat> {
  const res = await authFetch(`/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function updateChatAvatar(chatId: string, imageBase64: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/avatar`, {
    method: 'PATCH',
    body: JSON.stringify({ image: imageBase64 }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function deleteChatAvatar(chatId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/avatar`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function leaveChat(chatId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** Personal chat: block the other participant (chat-only, for current user). */
export async function markChatBlock(chatId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/block`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** Personal chat: unblock the other participant. */
export async function markChatUnblock(chatId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/unblock`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** Mute chat notifications until ISO8601 datetime, or null to unmute. */
export async function patchChatNotificationsMute(
  chatId: string,
  mutedUntil: string | null,
): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/notifications-mute`, {
    method: 'PATCH',
    body: JSON.stringify({ muted_until: mutedUntil }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function addChatParticipant(chatId: string, userId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function removeChatParticipant(chatId: string, userId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/participants/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function setChatParticipantRole(chatId: string, userId: string, role: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/participants/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** Мьют участника: muted_until — ISO8601 или null (размьют). Только админ чата. */
export async function setChatParticipantMute(
  chatId: string,
  userId: string,
  mutedUntil: string | null
): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/participants/${userId}/mute`, {
    method: 'PATCH',
    body: JSON.stringify({ muted_until: mutedUntil }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function getChatTopics(chatId: string): Promise<ChatTopic[]> {
  const res = await authFetch(`/chats/${chatId}/topics`);
  if (!res.ok) throw new Error('Failed to load topics');
  return res.json();
}

export async function createChatTopic(chatId: string, name: string): Promise<ChatTopic> {
  const res = await authFetch(`/chats/${chatId}/topics`, {
    method: 'POST',
    body: JSON.stringify({ name: name.trim() }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function updateChatTopic(chatId: string, topicId: string, name: string): Promise<ChatTopic> {
  const res = await authFetch(`/chats/${chatId}/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: name.trim() }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function deleteChatTopic(chatId: string, topicId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/topics/${topicId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

/** Удалить сообщение в чате (только админ чата). */
export async function deleteChatMessage(chatId: string, messageId: string): Promise<void> {
  const res = await authFetch(`/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function getChatMessages(
  chatId: string,
  opts?: { topic_id?: string; limit?: number; before?: string }
): Promise<Message[]> {
  const params = new URLSearchParams();
  if (opts?.topic_id) params.set('topic_id', opts.topic_id);
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.before) params.set('before', opts.before);
  const q = params.toString();
  const res = await authFetch(`/chats/${chatId}/messages${q ? `?${q}` : ''}`);
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function sendChatMessage(chatId: string, content: string, topicId?: string): Promise<Message> {
  const res = await authFetch(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: content.trim(), topic_id: topicId ?? null }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function sendChatFileOffer(
  chatId: string,
  payload: FileOfferPayload,
  content?: string,
): Promise<Message> {
  const res = await authFetch(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message_type: 'file_offer',
      content: content ?? null,
      topic_id: null,
      payload: {
        file_id: payload.file_id,
        name: payload.name,
        size: payload.size,
        mime: payload.mime,
        sha256: payload.sha256 ?? null,
      },
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function getChatPresence(chatId: string): Promise<{ online_user_ids: string[] }> {
  const res = await authFetch(`/chats/${chatId}/presence`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function acceptChatFileOffer(chatId: string, messageId: string): Promise<ChatFileTransfer> {
  const res = await authFetch(`/chats/${chatId}/file-offers/${messageId}/accept`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function patchChatTransfer(
  chatId: string,
  transferId: string,
  body: { status?: string; bytes_transferred?: number },
): Promise<ChatFileTransfer> {
  const res = await authFetch(`/chats/${chatId}/transfers/${transferId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export async function listChatFileTransfers(chatId: string, messageId: string): Promise<ChatFileTransfer[]> {
  const res = await authFetch(`/chats/${chatId}/file-offers/${messageId}/transfers`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}
