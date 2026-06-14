export type FileOfferPayload = {
  file_id: string;
  name: string;
  size: number;
  mime: string;
  sha256?: string | null;
};

export type FileTransferStatus =
  | 'pending'
  | 'negotiating'
  | 'transferring'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ChatFileTransfer = {
  id: string;
  message_id: string;
  host_user_id: string;
  receiver_user_id: string;
  status: FileTransferStatus;
  bytes_transferred: number;
  updated_at: string;
};

export type TransferProgress = {
  transferId: string;
  messageId: string;
  role: 'host' | 'receiver';
  status: FileTransferStatus;
  bytesDone: number;
  bytesTotal: number;
  fileName: string;
  error?: string;
};

export const CHAT_FILE_MAX_BYTES = 500 * 1024 * 1024;
export const HOST_MAX_PARALLEL = 5;
export const DATA_CHANNEL_LABEL = 'chat-file-v1';
