export function isChatNotificationsMuted(until: string | null | undefined): boolean {
  return Boolean(until && new Date(until) > new Date());
}
