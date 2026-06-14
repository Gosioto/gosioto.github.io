/** Событие для инвалидации кэша аватара после загрузки/удаления. */
export const AVATAR_UPDATED_EVENT = 'gosloto-avatar-updated';

export type AvatarUpdatedDetail = { userId: string };

export function dispatchAvatarUpdated(userId: string) {
  window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { userId } satisfies AvatarUpdatedDetail }));
}
