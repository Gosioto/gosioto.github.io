'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { profileMeta, gameStats } from '@/data/gamesData';

const STORAGE_KEY = 'gp-steam-dock-pos';
const LINKS = [
  { href: '#favorites', label: 'Топ-5' },
  { href: '#recent', label: 'Recent' },
  { href: '#screenshots', label: 'Скрины' },
  { href: '#library', label: 'Библиотека' }
];

type Pos = { x: number; y: number };

export default function SteamDock() {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState<Pos>({ x: 24, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Pos;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPos(parsed);
        }
      } else {
        setPos({ x: Math.max(16, window.innerWidth - 300), y: 120 });
      }
    } catch {
      /* ignore */
    }

    return () => mq.removeEventListener('change', apply);
  }, []);

  const clamp = useCallback((next: Pos): Pos => {
    const w = panelRef.current?.offsetWidth ?? 260;
    const h = panelRef.current?.offsetHeight ?? 320;
    return {
      x: Math.min(Math.max(8, next.x), window.innerWidth - w - 8),
      y: Math.min(Math.max(8, next.y), window.innerHeight - h - 8)
    };
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      setPos(clamp({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }));
    };
    const onUp = () => {
      setDragging(false);
      setPos((current) => {
        const next = clamp(current);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, clamp]);

  const onDragStart = (e: React.PointerEvent) => {
    if (isMobile) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.gp-dock-handle')) return;
    e.preventDefault();
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(true);
  };

  const panel = (
    <div
      ref={panelRef}
      className={`gp-dock${dragging ? ' is-dragging' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}
      style={isMobile ? undefined : { left: pos.x, top: pos.y }}
      onPointerDown={onDragStart}
    >
      <div className="gp-dock-handle" aria-label="Перетащить панель">
        <span className="gp-dock-grip" />
        <strong>Steam</strong>
        {isMobile && (
          <button
            type="button"
            className="gp-dock-close"
            aria-label="Закрыть"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        )}
      </div>

      <div className="gp-dock-profile">
        <img src={profileMeta.avatarUrl} alt="" className="gp-dock-avatar" width={56} height={56} />
        <div>
          <p className="gp-dock-name">{profileMeta.personaName}</p>
          <p className="gp-dock-level">Уровень {profileMeta.level}</p>
          <p className="gp-dock-meta">
            {profileMeta.location} · с {profileMeta.memberSince}
          </p>
        </div>
      </div>

      <ul className="gp-dock-stats">
        <li>
          <span>{gameStats.totalHours.toLocaleString('ru-RU')}+</span>
          <small>часов</small>
        </li>
        <li>
          <span>{gameStats.totalGames}</span>
          <small>игр</small>
        </li>
        <li>
          <span>{gameStats.perfectAchievements.toLocaleString('ru-RU')}</span>
          <small>perfect</small>
        </li>
      </ul>

      <nav className="gp-dock-links">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>

      <a
        className="gp-btn gp-btn-primary gp-dock-cta"
        href={profileMeta.steamUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Открыть профиль
      </a>
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className="gp-dock-fab"
          aria-label="Steam панель"
          onClick={() => setMobileOpen(true)}
        >
          S
        </button>
      )}
      {isMobile && mobileOpen && (
        <button
          type="button"
          className="gp-dock-backdrop"
          aria-label="Закрыть панель"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {(!isMobile || mobileOpen) && panel}
    </>
  );
}
