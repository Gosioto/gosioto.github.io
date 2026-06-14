/** Display name with masked email fallback (never show full email in UI). */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return email.slice(0, 3) + '…';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const domainPart = domain.split('.')[0] ?? domain;
  const maskedLocal = local.length <= 2 ? local + '***' : local.slice(0, 2) + '***';
  return `${maskedLocal}@${domainPart.slice(0, 1)}…`;
}

export function formatDisplayName(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return maskEmail(email);
}
