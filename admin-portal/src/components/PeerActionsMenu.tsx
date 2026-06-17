import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFriendStatus, type FriendStatus } from '../api';
import { ContextMenu, IconMoreHorizontal } from '../ui';
import type { ContextMenuItem } from '../ui';
import {
  buildPeerMenuItems,
  type PeerMenuChatContext,
} from '../utils/peerMenu';
import styles from '../pages/Chats.module.css';

type Props = {
  peerUserId: string;
  meId: string | undefined;
  chatContext: PeerMenuChatContext | null;
  onOpenProfile: (userId: string) => void;
  onError: (message: string) => void;
  onBlockChange?: (blocked: boolean) => void;
  onMuteChange?: (until: string | null) => void;
  onNicknameUpdated?: () => void;
  onEditNickname?: (peerUserId: string) => void;
};

export default function PeerActionsMenu({
  peerUserId,
  meId,
  chatContext,
  onOpenProfile,
  onError,
  onBlockChange,
  onMuteChange,
  onNicknameUpdated,
  onEditNickname,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [friendStatus, setFriendStatus] = useState<FriendStatus | null>(null);

  useEffect(() => {
    if (!open) {
      setFriendStatus(null);
      return;
    }
    getFriendStatus(peerUserId)
      .then(setFriendStatus)
      .catch(() => setFriendStatus({ status: 'none' }));
  }, [open, peerUserId]);

  const refreshFriendStatus = useCallback(() => {
    getFriendStatus(peerUserId)
      .then(setFriendStatus)
      .catch(() => setFriendStatus({ status: 'none' }));
  }, [peerUserId]);

  const items: ContextMenuItem[] = useMemo(
    () =>
      buildPeerMenuItems({
        peerUserId,
        meId,
        friendStatus,
        chatContext,
        onOpenProfile,
        onError,
        onFriendStatusChange: refreshFriendStatus,
        onBlockChange: (blocked) => {
          onBlockChange?.(blocked);
        },
        onMuteChange,
        onNicknameUpdated,
        onEditNickname,
      }),
    [
      peerUserId,
      meId,
      friendStatus,
      chatContext,
      onOpenProfile,
      onError,
      refreshFriendStatus,
      onBlockChange,
      onMuteChange,
      onNicknameUpdated,
      onEditNickname,
    ],
  );

  return (
    <>
      <button
        type="button"
        className={styles.iconToolBtn}
        title="Дополнительно"
        aria-label="Дополнительно"
        aria-expanded={open}
        onClick={(e) => {
          setAnchor({ x: e.clientX, y: e.clientY });
          setOpen(true);
        }}
      >
        <IconMoreHorizontal size={18} />
      </button>
      {open ? (
        <ContextMenu
          open
          x={anchor.x}
          y={anchor.y}
          items={items}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
