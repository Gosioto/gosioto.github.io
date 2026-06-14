import type { ComponentType, SVGProps } from 'react';
import {
  IconDashboard,
  IconUsers,
  IconShield,
  IconMessage,
  IconHeadset,
  IconSettings,
} from '../ui/Icon/Icon';

export type NavIconProps = SVGProps<SVGSVGElement> & { size?: number };

export type NavItemConfig = {
  path: string;
  name: string;
  short: string;
  permission?: string;
  Icon: ComponentType<NavIconProps>;
};

export const ADMIN_NAV_ITEMS: NavItemConfig[] = [
  { path: '/dashboard', name: 'Сводка', short: 'С', permission: 'modules.dashboard', Icon: IconDashboard },
  { path: '/dashboard/users', name: 'Пользователи', short: 'П', permission: 'users.read', Icon: IconUsers },
  { path: '/dashboard/roles', name: 'Роли', short: 'Р', permission: 'roles.read', Icon: IconShield },
];

export const SERVICE_NAV_ITEMS: NavItemConfig[] = [
  { path: '/dashboard/chats', name: 'Чатик*с', short: 'Ч', Icon: IconMessage },
  { path: '/dashboard/friends', name: 'Друзья', short: 'Д', Icon: IconUsers },
  { path: '/dashboard/ruscord', name: 'RUscord', short: 'R', Icon: IconHeadset },
  { path: '/dashboard/settings', name: 'Настройки', short: 'Н', Icon: IconSettings },
];

export const BOTTOM_NAV_ITEMS: NavItemConfig[] = [
  { path: '/dashboard', name: 'Сводка', short: 'С', permission: 'modules.dashboard', Icon: IconDashboard },
  { path: '/dashboard/chats', name: 'Чаты', short: 'Ч', Icon: IconMessage },
  { path: '/dashboard/ruscord', name: 'RUscord', short: 'R', Icon: IconHeadset },
  { path: '/dashboard/settings', name: 'Настройки', short: 'Н', Icon: IconSettings },
];
