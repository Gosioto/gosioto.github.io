import { patchChatTransfer } from '../api';
import type { FileTransferStatus } from './fileOfferTypes';

const PATCH_INTERVAL_MS = 2000;
const PATCH_MIN_BYTES_DELTA = 256 * 1024;

type Entry = {
  lastAt: number;
  lastBytes: number;
  lastStatus: FileTransferStatus | null;
};

const inflight = new Map<string, Entry>();

function key(chatId: string, transferId: string): string {
  return `${chatId}:${transferId}`;
}

/** Throttled server status sync — avoids thousands of PATCH per file. */
export function syncTransferStatus(
  chatId: string,
  transferId: string,
  status: FileTransferStatus,
  bytesTransferred: number,
): void {
  const k = key(chatId, transferId);
  const now = Date.now();
  const prev = inflight.get(k) ?? { lastAt: 0, lastBytes: -1, lastStatus: null };

  const statusChanged = prev.lastStatus !== status;
  const terminal = status === 'completed' || status === 'failed' || status === 'cancelled';
  const timeOk = now - prev.lastAt >= PATCH_INTERVAL_MS;
  const bytesOk = bytesTransferred - prev.lastBytes >= PATCH_MIN_BYTES_DELTA;

  if (!statusChanged && !terminal && !timeOk && !bytesOk) {
    return;
  }

  inflight.set(k, { lastAt: now, lastBytes: bytesTransferred, lastStatus: status });

  void patchChatTransfer(chatId, transferId, {
    status,
    bytes_transferred: bytesTransferred,
  }).catch(() => {});
}

export function clearTransferStatusSync(chatId: string, transferId: string): void {
  inflight.delete(key(chatId, transferId));
}

export function userIdEq(a: string, b: string): boolean {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

export function isUserOnline(userId: string, onlineUserIds: string[]): boolean {
  const u = String(userId).toLowerCase();
  return onlineUserIds.some((id) => String(id).toLowerCase() === u);
}
