// src/types/game.ts
export interface Game {
  name: string;
  hours: number;
  lastLaunch: string;
  achievements: string;
  image: string;
  appId: number;
  gameId: string;
  description?: string;
}

export interface TopGame extends Game {
  rank: number;
  coverLocal?: string;
}

export interface RecentGame extends Game {
  hours2Weeks?: number;
}

/** @deprecated use RecentGame */
export interface CurrentGame extends Game {
  progress: number;
}

export interface SteamProfileMeta {
  personaName: string;
  level: number;
  steamId64: string;
  steamUrl: string;
  screenshotsUrl: string;
  avatarUrl: string;
  tagline: string;
  heroImage: string;
  memberSince: string;
  location: string;
}

export interface Achievement {
  id: string;
  game: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface GameStats {
  totalHours: number;
  totalGames: number;
  achievementPercentage: number;
  perfectGames: number;
  perfectAchievements: number;
  screenshotsCount: number;
}

export const steamHeader = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

export const steamCapsule = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`;

export const steamLibrary = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
