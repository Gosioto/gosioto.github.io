/**
 * Mesh WebRTC: два клиента одновременно вызывают createOffer → glare (оба have-local-offer).
 * Polite peer (лексикографически меньший user id) откатывает локальный offer и принимает чужой.
 * Impolite peer при коллизии игнорирует входящий offer.
 */
export function isPolitePeer(localUserId: string, remoteUserId: string): boolean {
  return localUserId < remoteUserId;
}
