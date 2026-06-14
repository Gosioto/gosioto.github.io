import { useRef, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './SpotlightCard.module.css';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  to?: string;
  className?: string;
  onClick?: () => void;
};

export default function SpotlightCard({ title, description, icon, to, className, onClick }: Props) {
  const spotRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const spot = spotRef.current;
    if (!spot) return;
    const rect = card.getBoundingClientRect();
    spot.style.left = `${e.clientX - rect.left}px`;
    spot.style.top = `${e.clientY - rect.top}px`;
  };

  const inner = (
    <>
      <span ref={spotRef} className={styles.spot} aria-hidden />
      {icon && <div className={styles.icon}>{icon}</div>}
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.desc}>{description}</span>}
    </>
  );

  const cls = [styles.card, className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={cls} onMouseMove={onMove}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onMouseMove={onMove} onClick={onClick}>
      {inner}
    </button>
  );
}
