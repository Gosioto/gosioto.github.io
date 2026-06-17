export const FRIEND_PRESENCE_EVENT = 'friend-presence';

export type FriendPresenceDetail = {
  user_id: string;
  presence: 'online' | 'away' | 'offline' | string;
};

export function dispatchFriendPresence(detail: FriendPresenceDetail): void {
  window.dispatchEvent(new CustomEvent(FRIEND_PRESENCE_EVENT, { detail }));
}
