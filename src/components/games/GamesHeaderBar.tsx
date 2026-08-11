'use client';

import { useEffect, useState } from 'react';
import { profileMeta } from '@/data/gamesData';

const NAV = [
  { href: '#favorites', label: 'Любимые' },
  { href: '#recent', label: 'Недавние' },
  { href: '#screenshots', label: 'Скриншоты' },
  { href: '#library', label: 'Библиотека' }
];

export default function GamesHeaderBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`gp-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="gp-header-inner">
        <a href="/hobbies/" className="gp-header-back">
          ← Хобби
        </a>
        <a href="#top" className="gp-header-brand">
          Gosloto <span>Games</span>
        </a>

        <button
          type="button"
          className={`gp-header-toggle${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <nav className={`gp-header-nav${open ? ' is-open' : ''}`}>
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a
            className="gp-header-steam"
            href={profileMeta.steamUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Steam
          </a>
        </nav>
      </div>
    </header>
  );
}
