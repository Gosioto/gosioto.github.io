import { useMemo } from 'react';
import styles from './PasswordStrength.module.css';

const LEVELS = [
  { label: '', color: '#ef4444', width: '0%' },
  { label: 'Слабый', color: '#ef4444', width: '25%' },
  { label: 'Средний', color: '#f97316', width: '55%' },
  { label: 'Хороший', color: '#eab308', width: '75%' },
  { label: 'Сильный', color: '#22c55e', width: '100%' },
];

function scorePassword(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

type Props = {
  password: string;
  className?: string;
};

/** FRM-05 — password strength indicator. */
export default function PasswordStrength({ password, className }: Props) {
  const level = useMemo(() => LEVELS[scorePassword(password)], [password]);

  if (!password) return null;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <div className={styles.track}>
        <div
          className={styles.bar}
          style={{ width: level.width, background: level.color }}
        />
      </div>
      {level.label && (
        <span className={styles.label} style={{ color: level.color }}>
          {level.label}
        </span>
      )}
    </div>
  );
}
