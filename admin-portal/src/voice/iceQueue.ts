/**
 * Буфер ICE-кандидатов до установки remote description (offer/answer).
 * См. documentation/testing-voice-media-plan.md и documentation/voice-and-streaming.md.
 */

export type PendingIceStore = Record<string, RTCIceCandidateInit[]>;

export function enqueuePendingIce(
  store: PendingIceStore,
  peerUserId: string,
  candidate: RTCIceCandidateInit,
): void {
  if (!store[peerUserId]) store[peerUserId] = [];
  store[peerUserId].push(candidate);
}

/** Снимает очередь для пира и вызывает addCandidate для каждого элемента (например pc.addIceCandidate). */
export function drainPendingIce(
  store: PendingIceStore,
  peerUserId: string,
  addCandidate: (c: RTCIceCandidateInit) => void,
): void {
  const list = store[peerUserId];
  if (!list?.length) return;
  delete store[peerUserId];
  for (const c of list) {
    addCandidate(c);
  }
}

export function clearPendingIceStore(store: PendingIceStore): void {
  for (const k of Object.keys(store)) {
    delete store[k];
  }
}
