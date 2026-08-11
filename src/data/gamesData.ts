// src/data/gamesData.ts — static Steam snapshot for GitHub Pages (no live API)
import {
  Game,
  TopGame,
  RecentGame,
  CurrentGame,
  SteamProfileMeta,
  GameStats,
  steamHeader
} from '@/types/game';

const g = (
  appId: number,
  gameId: string,
  name: string,
  hours: number,
  lastLaunch: string,
  achievements: string
): Game => ({
  appId,
  gameId,
  name,
  hours,
  lastLaunch,
  achievements,
  image: steamHeader(appId)
});

export const profileMeta: SteamProfileMeta = {
  personaName: '(S)Gosloto',
  level: 40,
  steamId64: '76561199001573821',
  steamUrl: 'https://steamcommunity.com/id/Gosloto/',
  screenshotsUrl: 'https://steamcommunity.com/id/Gosloto/screenshots/',
  avatarUrl:
    'https://avatars.akamai.steamstatic.com/a1c7e8248dca28e09ce7a355d394ada8ef05517b_full.jpg',
  tagline: 'Открытые миры, кооп и долгие кампании — скриншоты с моего Steam.',
  heroImage: '/img/screenshot/1witcher/20250501133823_1.jpg',
  memberSince: 'Ноябрь 2019',
  location: 'Russian Federation'
};

export const gamesData: Game[] = [
  g(292030, 'witcher3', 'The Witcher 3: Wild Hunt', 6966, 'Недавно', '78/78'),
  g(230410, 'warframe', 'Warframe', 5509, 'Недавно', '193/193'),
  g(8500, 'eve', 'EVE Online', 4847, 'Недавно', '-'),
  g(582660, 'blackdesert', 'Black Desert', 1950, '28 авг. 2023', '-'),
  g(730, 'cs2', 'Counter-Strike 2', 1923, '18 нояб. 2023', '1/1'),
  g(1172470, 'apex', 'Apex Legends', 1884, '19 мая 2024', '2/12'),
  g(381210, 'dbd', 'Dead by Daylight', 1701, '26 мая', '227/279'),
  g(1085660, 'destiny2', 'Destiny 2', 1598, '6 мая 2023', '23/23'),
  g(386180, 'crossout', 'Crossout', 1361, '29 мая', '193/193'),
  g(594650, 'hunt', 'Hunt: Showdown 1896', 1357, '1 февр.', '36/36'),
  g(493520, 'gtfo', 'GTFO', 989, 'Недавно', '56/57'),
  g(1769170, 'spd', 'Shattered Pixel Dungeon', 876, '3 апр.', '83/97'),
  g(1827680, 'zhijiang', '枝江畔之梦', 871, '15 сент. 2024', '20/20'),
  g(218620, 'payday2', 'PAYDAY 2', 836, '15 мар. 2024', '1302/1328'),
  g(9450, 'soulstorm', 'Dawn of War - Soulstorm', 794, '29 нояб. 2024', ''),
  g(704270, 'genzero', 'Generation Zero®', 632, '28 июн. 2024', '72/72'),
  g(2707930, 'palia', 'Palia', 628, '5 апр.', '52/52'),
  g(3416070, 'ropuka', "Ropuka's Idle Island", 620, '14 июл.', '30/31'),
  g(2555430, 'tradesman', 'TRADESMAN: Deal to Dealer', 573, 'Недавно', '33/33'),
  g(323190, 'frostpunk', 'Frostpunk', 576, '6 нояб. 2023', '0/115'),
  g(346110, 'ark', 'ARK: Survival Evolved', 545, '12 февр. 2023', '32/32'),
  g(700330, 'scpsl', 'SCP: Secret Laboratory', 493, '6 мая 2023', '35/52'),
  g(761890, 'albion', 'Albion Online', 485, '27 апр. 2023', '0/154'),
  g(466560, 'northgard', 'Northgard', 474, '11 янв.', '0/289'),
  g(872200, 'roguecompany', 'Rogue Company', 409, '6 мая 2023', '20/20'),
  g(294100, 'rimworld', 'RimWorld', 314, '19 дек. 2023', '-'),
  g(1815780, 'asphalt', 'Asphalt Legends Unite', 262, '25 июн.', '39/42'),
  g(489630, 'gladius', 'Warhammer 40,000: Gladius', 254, '23 апр. 2024', '97/166'),
  g(1850570, 'deathstranding', "DEATH STRANDING DIRECTOR'S CUT", 251, '16 июн. 2024', '31/63'),
  g(2074920, 'tfd', 'The First Descendant', 198, '17 мая', '24/24'),
  g(951440, 'volcanoids', 'Volcanoids', 198, '10 мая 2024', '21/40'),
  g(602960, 'barotrauma', 'Barotrauma', 164, 'Недавно', '-'),
  g(262060, 'darkestdungeon', 'Darkest Dungeon®', 169, '23 сент. 2023', '120/120'),
  g(548430, 'drg', 'Deep Rock Galactic', 155, '18 мая', '53/69'),
  g(444090, 'paladins', 'Paladins', 152, '16 дек. 2022', '58/58'),
  g(1604030, 'vrising', 'V Rising', 147, '10 мая 2024', '0/49'),
  g(475550, 'beholder', 'Beholder', 143, '2 мар. 2023', '60/60'),
  g(1782380, 'scpcbm', 'SCP: Containment Breach Multiplayer', 124, '23 нояб. 2022', '41/41'),
  g(203770, 'ck2', 'Crusader Kings II', 90, '9 дек. 2023', '161/161'),
  g(285190, 'dow3', 'Warhammer 40,000: Dawn of War III', 88, '15 июн.', '84/84'),
  g(675010, 'mudrunner', 'MudRunner', 82, '14 июн.', '60/62'),
  g(2181930, 'livesey', 'DR LIVESEY ROM AND DEATH EDITION', 78, '15 сент. 2024', '96/130'),
  g(714010, 'aimlabs', 'Aimlabs', 74, '15 янв. 2024', '100/100'),
  g(2477340, 'expeditions', 'Expeditions: A MudRunner Game', 72, 'Недавно', '13/20'),
  g(322170, 'geometrydash', 'Geometry Dash', 62, '22 июн.', '31/120'),
  g(945360, 'amongus', 'Among Us', 57, '9 авг. 2023', '33/33'),
  g(1827680, 'evefrontier', 'EVE Frontier', 52, 'Недавно', '-'),
  g(3678970, 'tbh', 'TBH: Task Bar Hero', 48, 'Сейчас', '23/56'),
  g(1424910, 'keo', 'KEO', 41, '16 июн. 2022', '-'),
  g(2198150, 'tinyglade', 'Tiny Glade', 39, '6 окт. 2024', '-'),
  g(505460, 'foxhole', 'Foxhole', 37, '21 июн. 2024', '-'),
  g(2139460, 'oncehuman', 'Once Human', 37, '27 июл. 2024', '-'),
  g(707010, 'wtl', 'Will To Live Online', 34, '9 мая 2023', '-'),
  g(383270, 'hue', 'Hue', 33, '30 авг. 2023', '10/13'),
  g(1966720, 'lethal', 'Lethal Company', 32, '27 янв. 2024', '-'),
  g(387990, 'scrap', 'Scrap Mechanic', 26, '2 мар. 2024', '-'),
  g(588430, 'falloutshelter', 'Fallout Shelter', 23, '20 июл. 2023', '35/35'),
  g(2605790, 'drgrougecore', 'Deep Rock Galactic: Rogue Core', 20, 'Недавно', '-'),
  g(2141770, 'urbo', 'URBO', 17, '17 мая', '24/29'),
  g(1558830, 'ripout', 'RIPOUT', 13, '12 янв.', '36/69'),
  g(361420, 'astroneer', 'ASTRONEER', 10, '10 мая 2024', '19/56'),
  g(4570, 'dow1', 'Warhammer 40,000: Dawn of War - Anniversary Edition', 10, '25 сент. 2024', '-'),
  g(2684660, 'redkit', 'REDkit для игры «Ведьмак 3»', 10, '16 июл. 2024', '-'),
  g(2828860, 'foreverwinter', 'The Forever Winter', 10, '31 окт. 2024', '-'),
  g(242760, 'forest', 'The Forest', 9, '25 нояб. 2023', '10/45'),
  g(621830, 'wrc7', 'WRC 7', 8, '25 июл. 2024', '7/41'),
  g(1644500, 'masterplan', 'Masterplan Tycoon', 7, '8 июл. 2024', '8/16'),
  g(1608700, 'soundfall', 'Soundfall', 6, '27 окт. 2024', '19/45'),
  g(2950790, 'ironnest', 'IRON NEST: Heavy Turret Simulator', 4, 'Недавно', '5/33')
];

export const topGames: TopGame[] = [
  {
    ...g(292030, 'witcher3', 'The Witcher 3: Wild Hunt', 6966, 'Недавно', '78/78'),
    image: '/img/The-Witcher-3.jpg',
    coverLocal: '/img/screenshot/1witcher/20250501133823_1.jpg',
    rank: 1,
    description: 'Любимая RPG: полный комплект достижений и тысячи часов в Континенте.'
  },
  {
    ...g(493520, 'gtfo', 'GTFO', 989, 'Недавно', '56/57'),
    image: '/img/gtfo.png',
    coverLocal: '/img/screenshot/5gtfo/20241117135908_1.jpg',
    rank: 2,
    description: 'Хардкорный кооп — напряжение, координация и почти платина.'
  },
  {
    ...g(2555430, 'tradesman', 'TRADESMAN: Deal to Dealer', 573, 'Недавно', '33/33'),
    image: '/img/tradesman-deal-to-dealer.png',
    coverLocal: '/img/screenshot/2tradesman/20250211081544_1.jpg',
    rank: 3,
    description: 'Showcase на профиле: торговля, атмосфера и 100% ачивок.'
  },
  {
    ...g(230410, 'warframe', 'Warframe', 5509, 'Недавно', '193/193'),
    coverLocal: '/img/screenshot/4warframe/20241123122517_1.jpg',
    rank: 4,
    description: 'Долгая MMO-сессия: фарм, билды и полный сет достижений.'
  },
  {
    ...g(8500, 'eve', 'EVE Online', 4847, 'Недавно', '-'),
    coverLocal: '/img/screenshot/4eve/20250222113245_1.jpg',
    rank: 5,
    description: 'Нью-Эден: политика, логистика и бесконечный космос.'
  }
];

export const recentGames: RecentGame[] = [
  { ...g(602960, 'barotrauma', 'Barotrauma', 164, 'Недавно', '-'), hours2Weeks: 60 },
  { ...g(3678970, 'tbh', 'TBH: Task Bar Hero', 48, 'Сейчас', '23/56'), hours2Weeks: 48 },
  { ...g(8500, 'eve', 'EVE Online', 4847, 'Недавно', '-'), hours2Weeks: 41 },
  {
    ...g(2605790, 'drgrougecore', 'Deep Rock Galactic: Rogue Core', 20, 'Недавно', '-'),
    hours2Weeks: 20
  },
  {
    ...g(2950790, 'ironnest', 'IRON NEST: Heavy Turret Simulator', 4, 'Недавно', '5/33'),
    hours2Weeks: 4
  }
];

export const currentGames: CurrentGame[] = recentGames.slice(0, 2).map((game, i) => ({
  ...game,
  progress: i === 0 ? 55 : 40
}));

export const gameStats: GameStats = {
  totalHours: 52000,
  totalGames: gamesData.length,
  achievementPercentage: 77,
  perfectGames: 22,
  perfectAchievements: 7860,
  screenshotsCount: 199
};
