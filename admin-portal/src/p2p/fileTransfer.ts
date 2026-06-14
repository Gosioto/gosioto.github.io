import { buildVoiceRtcConfiguration } from '../voice/rtcConfig';
import { drainPendingIce, enqueuePendingIce, type PendingIceStore } from '../voice/iceQueue';
import { isPolitePeer } from '../voice/meshNegotiation';
import { sendChatP2pSignal, type SignalPayload } from './chatSignaling';
import { DATA_CHANNEL_LABEL, type TransferProgress } from './fileOfferTypes';

const CHUNK_SIZE = 32 * 1024;
const BUFFER_LOW = 256 * 1024;
const NEGOTIATION_MS = 60_000;
const IDLE_MS = 10 * 60 * 1000;

type ControlMeta = {
  v: number;
  op: 'meta';
  transfer_id: string;
  name: string;
  size: number;
  mime: string;
  sha256?: string;
};

type ControlDone = { v: number; op: 'done' };
type ControlError = { v: number; op: 'error'; code: string };

export type FileTransferCallbacks = {
  onProgress?: (p: TransferProgress) => void;
  onComplete?: () => void;
  onError?: (message: string) => void;
};

export class ChatFileTransferSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private icePending: PendingIceStore = {};
  private cancelled = false;
  private negotiationTimer: number | null = null;
  private idleTimer: number | null = null;
  private hostOffset = 0;
  private recvChunks: Uint8Array[] = [];
  private recvTotal = 0;
  private meta: ControlMeta | null = null;

  constructor(
    private readonly params: {
      chatId: string;
      transferId: string;
      messageId: string;
      localUserId: string;
      remoteUserId: string;
      role: 'host' | 'receiver';
      ws: WebSocket;
      file?: File;
      fileName: string;
      fileSize: number;
      mime: string;
    },
    private readonly callbacks: FileTransferCallbacks = {},
  ) {}

  async startAsHost(): Promise<void> {
    if (!this.params.file) throw new Error('File required for host');
    this.report('negotiating', 0);
    this.pc = new RTCPeerConnection(buildVoiceRtcConfiguration());
    this.armPc(this.pc);
    this.dc = this.pc.createDataChannel(DATA_CHANNEL_LABEL, { ordered: true });
    this.armDataChannel(this.dc, true);
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.sendSignal({ type: 'offer', sdp: offer });
    this.armNegotiationTimeout();
  }

  async handleSignal(payload: SignalPayload): Promise<void> {
    if (this.cancelled) return;
    if (!this.pc) {
      if (payload.type !== 'offer' || !payload.sdp) return;
      this.report('negotiating', 0);
      this.pc = new RTCPeerConnection(buildVoiceRtcConfiguration());
      this.armPc(this.pc);
      this.pc.ondatachannel = (ev) => {
        this.dc = ev.channel;
        this.armDataChannel(this.dc, false);
      };
      const polite = isPolitePeer(this.params.localUserId, this.params.remoteUserId);
      if (this.pc.signalingState === 'have-local-offer' && !polite) {
        return;
      }
      if (this.pc.signalingState === 'have-local-offer' && polite) {
        await this.pc.setLocalDescription({ type: 'rollback' } as RTCSessionDescriptionInit);
      }
      await this.pc.setRemoteDescription(payload.sdp);
      drainPendingIce(this.icePending, this.params.remoteUserId, (c) => {
        this.pc?.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      });
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.sendSignal({ type: 'answer', sdp: answer });
      this.armNegotiationTimeout();
      return;
    }

    if (payload.type === 'offer' && payload.sdp) {
      const polite = isPolitePeer(this.params.localUserId, this.params.remoteUserId);
      if (this.pc.signalingState === 'have-local-offer' && !polite) return;
      if (this.pc.signalingState === 'have-local-offer' && polite) {
        await this.pc.setLocalDescription({ type: 'rollback' } as RTCSessionDescriptionInit);
      }
      await this.pc.setRemoteDescription(payload.sdp);
      drainPendingIce(this.icePending, this.params.remoteUserId, (c) => {
        this.pc?.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      });
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.sendSignal({ type: 'answer', sdp: answer });
    } else if (payload.type === 'answer' && payload.sdp) {
      await this.pc.setRemoteDescription(payload.sdp);
      drainPendingIce(this.icePending, this.params.remoteUserId, (c) => {
        this.pc?.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      });
    } else if (payload.type === 'ice' && payload.candidate) {
      if (this.pc.remoteDescription) {
        await this.pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } else {
        enqueuePendingIce(this.icePending, this.params.remoteUserId, payload.candidate);
      }
    } else if (payload.type === 'transfer_abort') {
      this.fail('Передача отменена');
    }
  }

  cancel(): void {
    this.cancelled = true;
    this.sendSignal({ type: 'transfer_abort' });
    this.cleanup();
    this.report('cancelled', this.recvTotal || this.hostOffset);
  }

  private armPc(pc: RTCPeerConnection): void {
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        this.sendSignal({
          type: 'ice',
          candidate: ev.candidate.toJSON(),
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        this.fail('Соединение P2P не установлено (проверьте TURN / сеть)');
      }
    };
  }

  private armDataChannel(dc: RTCDataChannel, isHost: boolean): void {
    dc.binaryType = 'arraybuffer';
    dc.onopen = () => {
      this.clearNegotiationTimeout();
      if (isHost && this.params.file) {
        void this.sendFileAsHost(dc);
      }
    };
    dc.onmessage = (ev) => {
      this.touchIdle();
      if (typeof ev.data === 'string') {
        this.onControlJson(ev.data, isHost);
      } else if (ev.data instanceof ArrayBuffer) {
        this.onBinaryChunk(new Uint8Array(ev.data), isHost);
      }
    };
    dc.onerror = () => this.fail('Ошибка канала данных');
  }

  private async sendFileAsHost(dc: RTCDataChannel): Promise<void> {
    const file = this.params.file!;
    const meta: ControlMeta = {
      v: 1,
      op: 'meta',
      transfer_id: this.params.transferId,
      name: this.params.fileName,
      size: file.size,
      mime: this.params.mime,
    };
    dc.send(JSON.stringify(meta));
    this.report('transferring', 0);
    let offset = 0;
    while (offset < file.size && !this.cancelled) {
      while (dc.bufferedAmount > BUFFER_LOW && !this.cancelled) {
        await sleep(20);
      }
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buf = await slice.arrayBuffer();
      dc.send(buf);
      offset += buf.byteLength;
      this.hostOffset = offset;
      this.report('transferring', offset);
    }
    if (this.cancelled) return;
    dc.send(JSON.stringify({ v: 1, op: 'done' } satisfies ControlDone));
    this.report('completed', file.size);
    this.callbacks.onComplete?.();
    this.cleanup();
  }

  private onControlJson(raw: string, isHost: boolean): void {
    try {
      const j = JSON.parse(raw) as ControlMeta | ControlDone | ControlError;
      if (j.op === 'meta' && !isHost) {
        this.meta = j as ControlMeta;
        this.recvTotal = 0;
        this.recvChunks = [];
        this.report('transferring', 0);
      } else if (j.op === 'done' && !isHost) {
        void this.finishReceive();
      } else if (j.op === 'error') {
        this.fail((j as ControlError).code || 'Ошибка передачи');
      }
    } catch {
      // ignore
    }
  }

  private onBinaryChunk(chunk: Uint8Array, isHost: boolean): void {
    if (isHost) return;
    this.recvChunks.push(chunk);
    this.recvTotal += chunk.length;
    const total = this.meta?.size ?? this.params.fileSize;
    this.report('transferring', this.recvTotal);
    if (total > 0 && this.recvTotal >= total) {
      // wait for done control
    }
  }

  private async finishReceive(): Promise<void> {
    const meta = this.meta;
    if (!meta) {
      this.fail('Нет метаданных файла');
      return;
    }
    const blob = new Blob(this.recvChunks, { type: meta.mime || 'application/octet-stream' });
    const name = meta.name || this.params.fileName;
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (
          window as unknown as {
            showSaveFilePicker: (o: { suggestedName: string }) => Promise<FileSystemFileHandle>;
          }
        ).showSaveFilePicker({ suggestedName: name });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
      }
      this.report('completed', meta.size);
      this.callbacks.onComplete?.();
      this.cleanup();
    } catch (e) {
      this.fail(e instanceof Error ? e.message : 'Не удалось сохранить файл');
    }
  }

  private sendSignal(payload: SignalPayload): void {
    sendChatP2pSignal(this.params.ws, {
      chatId: this.params.chatId,
      transferId: this.params.transferId,
      toUserId: this.params.remoteUserId,
      payload,
    });
  }

  private report(status: TransferProgress['status'], bytesDone: number): void {
    const total = this.meta?.size ?? this.params.fileSize;
    this.callbacks.onProgress?.({
      transferId: this.params.transferId,
      messageId: this.params.messageId,
      role: this.params.role,
      status,
      bytesDone,
      bytesTotal: total,
      fileName: this.params.fileName,
    });
  }

  private fail(message: string): void {
    if (this.cancelled) return;
    this.callbacks.onProgress?.({
      transferId: this.params.transferId,
      messageId: this.params.messageId,
      role: this.params.role,
      status: 'failed',
      bytesDone: this.recvTotal || this.hostOffset,
      bytesTotal: this.params.fileSize,
      fileName: this.params.fileName,
      error: message,
    });
    this.callbacks.onError?.(message);
    this.cleanup();
  }

  private cleanup(): void {
    this.clearNegotiationTimeout();
    this.clearIdleTimeout();
    this.dc?.close();
    this.pc?.close();
    this.dc = null;
    this.pc = null;
  }

  private armNegotiationTimeout(): void {
    this.clearNegotiationTimeout();
    this.negotiationTimer = window.setTimeout(() => {
      this.fail('Таймаут установки P2P-соединения');
    }, NEGOTIATION_MS);
  }

  private clearNegotiationTimeout(): void {
    if (this.negotiationTimer != null) {
      clearTimeout(this.negotiationTimer);
      this.negotiationTimer = null;
    }
  }

  private touchIdle(): void {
    this.clearIdleTimeout();
    this.idleTimer = window.setTimeout(() => {
      this.fail('Таймаут передачи (нет активности)');
    }, IDLE_MS);
  }

  private clearIdleTimeout(): void {
    if (this.idleTimer != null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const HOST_BIND_KEY = 'chat_p2p_host_bind';

export type HostBindEntry = {
  messageId: string;
  name: string;
  size: number;
  mime: string;
  sha256?: string;
};

export function saveHostBind(entry: HostBindEntry): void {
  try {
    const raw = sessionStorage.getItem(HOST_BIND_KEY);
    const list: HostBindEntry[] = raw ? (JSON.parse(raw) as HostBindEntry[]) : [];
    const next = list.filter((e) => e.messageId !== entry.messageId);
    next.push(entry);
    sessionStorage.setItem(HOST_BIND_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function listHostBinds(): HostBindEntry[] {
  try {
    const raw = sessionStorage.getItem(HOST_BIND_KEY);
    return raw ? (JSON.parse(raw) as HostBindEntry[]) : [];
  } catch {
    return [];
  }
}

export function removeHostBind(messageId: string): void {
  try {
    const list = listHostBinds().filter((e) => e.messageId !== messageId);
    sessionStorage.setItem(HOST_BIND_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
