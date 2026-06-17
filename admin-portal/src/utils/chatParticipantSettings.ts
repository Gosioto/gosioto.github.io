export const CHAT_PARTICIPANT_SETTINGS_EVENT = 'chat-participant-settings-changed';

export type ChatParticipantSettingsDetail = {
  chatId: string;
  peerBlocked?: boolean;
  notificationsMutedUntil?: string | null;
};

export function dispatchChatParticipantSettingsChanged(detail: ChatParticipantSettingsDetail): void {
  window.dispatchEvent(new CustomEvent(CHAT_PARTICIPANT_SETTINGS_EVENT, { detail }));
}
