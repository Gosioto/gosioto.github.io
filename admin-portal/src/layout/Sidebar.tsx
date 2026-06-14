import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { PermissionGroup, User } from '../api';
import Avatar from '../components/Avatar';
import { Badge } from '../ui';
import { IconChevronDown, IconChevronLeft, IconChevronRight } from '../ui/Icon/Icon';
import { SERVICE_NAV_ITEMS, type NavItemConfig } from './navConfig';
import { formatDisplayName } from '../utils/displayName';
import styles from './Sidebar.module.css';

function groupPermissionsByGroup(perms: string[] | null | undefined, groups: PermissionGroup[]): [string, string[]][] {
  if (!perms?.length) return [];
  const codeToGroup = new Map<string, string>();
  for (const [groupName, codes] of groups) {
    for (const code of codes) codeToGroup.set(code, groupName);
  }
  const byGroup = new Map<string, string[]>();
  for (const code of perms) {
    const g = codeToGroup.get(code) ?? 'Прочее';
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(code);
  }
  return Array.from(byGroup.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function isNavActive(path: string, pathname: string): boolean {
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
}

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  adminSections: NavItemConfig[];
  adminOpen: boolean;
  onToggleAdmin: () => void;
  servicesOpen: boolean;
  onToggleServices: () => void;
  totalUnread: number;
  user: User | null;
  permissionGroups: PermissionGroup[];
  roleMenuOpen: boolean;
  onToggleRoleMenu: () => void;
  onLogout: () => void;
  voiceBar?: ReactNode;
};

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  adminSections,
  adminOpen,
  onToggleAdmin,
  servicesOpen,
  onToggleServices,
  totalUnread,
  user,
  permissionGroups,
  roleMenuOpen,
  onToggleRoleMenu,
  onLogout,
  voiceBar,
}: Props) {
  const location = useLocation();
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleMenuOpen) return;
    function close(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) onToggleRoleMenu();
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [roleMenuOpen, onToggleRoleMenu]);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed ? (
          <Link to="/dashboard" className={styles.logo}>
            <span className={styles.sidebarLogoText}>GOSLOTO.XYZ</span>
          </Link>
        ) : null}
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={onToggleCollapsed}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </button>
      </div>
      <div className={styles.sectionsBlock}>
        <h2 className={styles.sectionsTitle}>Разделы</h2>
      </div>
      <nav className={styles.nav}>
        {adminSections.length > 0 && (
          <div className={styles.navBlock}>
            <button
              type="button"
              className={styles.navBlockToggle}
              onClick={onToggleAdmin}
              aria-expanded={adminOpen}
            >
              <span
                className={`${styles.navBlockToggleIcon} ${adminOpen ? '' : styles.navBlockToggleIconClosed}`}
                aria-hidden
              >
                <IconChevronDown size={14} />
              </span>
              <span className={styles.navBlockTitle}>Админка</span>
            </button>
            {adminOpen && (
              <div className={styles.navBlockContent}>
                {adminSections.map(({ path, name, Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    title={name}
                    className={`${styles.navItem} ${isNavActive(path, location.pathname) ? styles.navItemActive : ''}`}
                  >
                    <span className={styles.navItemIconWrap}>
                      <span className={styles.navItemIcon} aria-hidden>
                        <Icon size={18} />
                      </span>
                    </span>
                    <span className={styles.navItemText}>{name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={styles.navBlock}>
          <button
            type="button"
            className={styles.navBlockToggle}
            onClick={onToggleServices}
            aria-expanded={servicesOpen}
          >
            <span
              className={`${styles.navBlockToggleIcon} ${servicesOpen ? '' : styles.navBlockToggleIconClosed}`}
              aria-hidden
            >
              <IconChevronDown size={14} />
            </span>
            <span className={styles.navBlockTitle}>Сервисы</span>
          </button>
          {servicesOpen && (
            <div className={styles.navBlockContent}>
              {SERVICE_NAV_ITEMS.map(({ path, name, Icon }) => (
                <Link
                  key={path}
                  to={path}
                  title={name}
                  className={`${styles.navItem} ${isNavActive(path, location.pathname) ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navItemIconWrap}>
                    <span className={styles.navItemIcon} aria-hidden>
                      <Icon size={18} />
                    </span>
                    {path === '/dashboard/chats' && totalUnread > 0 ? (
                      <span className={styles.navItemBadgeDot} aria-label={`${totalUnread} непрочитанных`} />
                    ) : null}
                  </span>
                  <span className={styles.navItemText}>{name}</span>
                  {path === '/dashboard/chats' && totalUnread > 0 ? (
                    <Badge count={totalUnread} className={styles.navItemBadge} />
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
      {voiceBar}
      <div className={`${styles.user} ${styles.sidebarFooter}`}>
        <div className={styles.userRow}>
          <Avatar
            userId={user?.id ?? ''}
            fallbackLetter={user?.name?.[0] || user?.email?.[0]}
            size={36}
            className={styles.userAvatar}
          />
          <div className={styles.roleBadgeWrap} ref={roleMenuRef}>
            <button
              type="button"
              className={styles.userNameRoleBtn}
              onClick={onToggleRoleMenu}
              title="Разрешённые действия"
            >
              <span className={styles.userNameRoleText}>
                {formatDisplayName(user?.name, user?.email ?? '')} · {user?.role ? user.role.name : 'Без роли'}
              </span>
            </button>
            {roleMenuOpen && (
              <div className={styles.roleMenu}>
                <div className={styles.roleMenuTitle}>Разрешённые действия</div>
                {groupPermissionsByGroup(user?.permissions ?? null, permissionGroups).length === 0 ? (
                  <div className={styles.roleMenuEmpty}>
                    {user?.role ? 'Нет назначенных прав' : 'Роль не назначена'}
                  </div>
                ) : (
                  groupPermissionsByGroup(user?.permissions ?? null, permissionGroups).map(([groupName, codes]) => (
                    <div key={groupName} className={styles.roleMenuGroup}>
                      <div className={styles.roleMenuGroupName}>{groupName}</div>
                      <ul className={styles.roleMenuList}>
                        {codes.map((code) => (
                          <li key={code}>{code}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <button type="button" onClick={onLogout} className={styles.logout}>
          <span className={styles.logoutText}>Выход</span>
        </button>
      </div>
    </aside>
  );
}
