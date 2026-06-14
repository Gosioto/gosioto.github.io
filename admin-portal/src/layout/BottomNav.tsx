import { Link, useLocation } from 'react-router-dom';
import Badge from '../ui/Badge/Badge';
import type { NavItemConfig } from './navConfig';
import styles from './BottomNav.module.css';

type Props = {
  items: NavItemConfig[];
  unreadByPath?: Record<string, number>;
};

function isNavActive(path: string, pathname: string): boolean {
  if (path === '/dashboard') return pathname === '/dashboard';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function BottomNav({ items, unreadByPath = {} }: Props) {
  const location = useLocation();

  return (
    <nav className={styles.bottomNav} aria-label="Мобильная навигация">
      {items.map(({ path, name, Icon }) => {
        const active = isNavActive(path, location.pathname);
        const unread = unreadByPath[path] ?? 0;
        return (
          <Link
            key={path}
            to={path}
            className={`${styles.item} ${active ? styles.itemActive : ''}`}
            aria-current={active ? 'page' : undefined}
            title={name}
          >
            <span className={styles.iconWrap}>
              <Icon size={22} aria-hidden />
              <Badge count={unread} className={styles.badge} />
            </span>
            <span className={styles.label}>{name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
