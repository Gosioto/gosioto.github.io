import { ChatFileTransferSession, type FileTransferCallbacks, listHostBinds, removeHostBind, saveHostBind } from './fileTransfer';
import { parseIncomingChatP2pSignal } from './chatSignaling';
import type { FileOfferPayload, TransferProgress } from './fileOfferTypes';
import { HOST_MAX_PARALLEL } from './fileOfferTypes';

type ActiveSession = {
  session: ChatFileTransferSession;
  hostFile?: File;
};

export class ChatP2pManager {
  private sessions = new Map<string, ActiveSession>();
  private hostQueue: Array<() => void> = [];
  private hostRunning = 0;
  private ws: WebSocket | null = null;
  private chatId: string | null = null;
  private localUserId: string | null = null;
  private onProgressGlobal?: (p: TransferProgress) => void;

  setContext(ws: WebSocket, chatId: string, localUserId: string): void {
    this.ws = ws;
    this.chatId = chatId;
    this.localUserId = localUserId;
  }

  clearContext(): void {
    for (const [, s] of this.sessions) {
      s.session.cancel();
    }
    this.sessions.clear();
    this.ws = null;
    this.chatId = null;
  }

  setProgressHandler(fn: (p: TransferProgress) => void): void {
    this.onProgressGlobal = fn;
  }

  handleWsMessage(data: unknown): void {
    const sig = parseIncomingChatP2pSignal(data);
    if (!sig || !this.chatId || sig.chat_id !== this.chatId) return;
    const tid = sig.transfer_id ?? '';
    const session = this.sessions.get(tid);
    if (session) {
      void session.session.handleSignal(sig.payload);
      return;
    }
    // Receiver: host started before we registered — create session for incoming offer
    if (sig.payload.type === 'offer' && tid && this.localUserId && this.ws) {
      const callbacks = this.makeCallbacks(tid, '', 'receiver');
      const s = new ChatFileTransferSession(
        {
          chatId: this.chatId,
          transferId: tid,
          messageId: '',
          localUserId: this.localUserId,
          remoteUserId: sig.from_user_id,
          role: 'receiver',
          ws: this.ws,
          fileName: 'file',
          fileSize: 0,
          mime: 'application/octet-stream',
        },
        callbacks,
      );
      this.sessions.set(tid, { session: s });
      void s.handleSignal(sig.payload);
    }
  }

  async startHostTransfer(opts: {
    transferId: string;
    messageId: string;
    file: File;
    remoteUserId: string;
    payload: FileOfferPayload;
  }): Promise<void> {
    if (!this.ws || !this.chatId || !this.localUserId) {
      throw new Error('P2P не готов (нет WebSocket)');
    }
    saveHostBind({
      messageId: opts.messageId,
      name: opts.payload.name,
      size: opts.payload.size,
      mime: opts.payload.mime,
      sha256: opts.payload.sha256 ?? undefined,
    });
    return new Promise((resolve, reject) => {
      const run = () => {
        this.hostRunning += 1;
        const callbacks = this.makeCallbacks(opts.transferId, opts.messageId, 'host', () => {
          this.hostRunning -= 1;
          removeHostBind(opts.messageId);
          this.drainHostQueue();
          resolve();
        }, (err) => {
          this.hostRunning -= 1;
          this.drainHostQueue();
          reject(new Error(err));
        });
        const session = new ChatFileTransferSession(
          {
            chatId: this.chatId!,
            transferId: opts.transferId,
            messageId: opts.messageId,
            localUserId: this.localUserId!,
            remoteUserId: opts.remoteUserId,
            role: 'host',
            ws: this.ws!,
            file: opts.file,
            fileName: opts.payload.name,
            fileSize: opts.payload.size,
            mime: opts.payload.mime,
          },
          callbacks,
        );
        this.sessions.set(opts.transferId, { session, hostFile: opts.file });
        void session.startAsHost().catch((e) => {
          this.hostRunning -= 1;
          this.drainHostQueue();
          reject(e);
        });
      };
      if (this.hostRunning >= HOST_MAX_PARALLEL) {
        this.hostQueue.push(run);
      } else {
        run();
      }
    });
  }

  async startReceiverTransfer(opts: {
    transferId: string;
    messageId: string;
    remoteUserId: string;
    fileName: string;
    fileSize: number;
    mime: string;
  }): Promise<void> {
    if (!this.ws || !this.chatId || !this.localUserId) {
      throw new Error('P2P не готов');
    }
    const callbacks = this.makeCallbacks(opts.transferId, opts.messageId, 'receiver');
    const session = new ChatFileTransferSession(
      {
        chatId: this.chatId,
        transferId: opts.transferId,
        messageId: opts.messageId,
        localUserId: this.localUserId,
        remoteUserId: opts.remoteUserId,
        role: 'receiver',
        ws: this.ws,
        fileName: opts.fileName,
        fileSize: opts.fileSize,
        mime: opts.mime,
      },
      callbacks,
    );
    this.sessions.set(opts.transferId, { session });
  }

  tryRebindHostFile(messageId: string, file: File): boolean {
    const bind = listHostBinds().find((e) => e.messageId === messageId);
    if (!bind) return false;
    if (file.size !== bind.size || file.name !== bind.name) return false;
    saveHostBind({
      messageId,
      name: file.name,
      size: file.size,
      mime: file.type || bind.mime,
    });
    return true;
  }

  cancelTransfer(transferId: string): void {
    this.sessions.get(transferId)?.session.cancel();
    this.sessions.delete(transferId);
  }

  private drainHostQueue(): void {
    if (this.hostRunning >= HOST_MAX_PARALLEL) return;
    const next = this.hostQueue.shift();
    next?.();
  }

  private makeCallbacks(
    transferId: string,
    messageId: string,
    role: 'host' | 'receiver',
    onDone?: () => void,
    onFail?: (msg: string) => void,
  ): FileTransferCallbacks {
    return {
      onProgress: (p) => {
        this.onProgressGlobal?.({ ...p, transferId, messageId, role });
      },
      onComplete: () => {
        this.sessions.delete(transferId);
        onDone?.();
      },
      onError: (msg) => {
        this.sessions.delete(transferId);
        onFail?.(msg);
      },
    };
  }
}

export const chatP2pManager = new ChatP2pManager();
