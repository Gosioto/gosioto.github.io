// src/data/screenshotsData.ts — curated local + Steam-generated screenshots

import { generatedScreenshots } from './screenshotsData.generated';

export interface Screenshot {
  id: string;
  filename: string;
  game: string;
  gameId: string;
  appId?: number;
  date: string;
  timestamp: number;
  path: string;
  thumbnail: string;
  steamUrl?: string;
}

const shot = (
  id: string,
  game: string,
  gameId: string,
  folder: string,
  filename: string,
  date: string,
  timestamp: number,
  appId?: number
): Screenshot => ({
  id,
  filename,
  game,
  gameId,
  appId,
  date,
  timestamp,
  path: `/img/screenshot/${folder}/${filename}`,
  thumbnail: `/img/screenshot/${folder}/${filename}`
});

/** Курируемый локальный набор (всегда в репо) */
export const localScreenshots: Screenshot[] = [
  shot('witcher_1', 'The Witcher 3: Wild Hunt', 'witcher3', '1witcher', '20250501133823_1.jpg', '2025-05-01', 1746112703000, 292030),
  shot('witcher_2', 'The Witcher 3: Wild Hunt', 'witcher3', '1witcher', '20250430212304_1.jpg', '2025-04-30', 1746055384000, 292030),
  shot('witcher_3', 'The Witcher 3: Wild Hunt', 'witcher3', '1witcher', '20250426212557_1.jpg', '2025-04-26', 1745709957000, 292030),
  shot('witcher_4', 'The Witcher 3: Wild Hunt', 'witcher3', '1witcher', '20250320192512_1.jpg', '2025-03-20', 1742498712000, 292030),

  shot('tradesman_1', 'TRADESMAN: Deal to Dealer', 'tradesman', '2tradesman', '20250211081544_1.jpg', '2025-02-11', 1739261744000, 2555430),
  shot('tradesman_2', 'TRADESMAN: Deal to Dealer', 'tradesman', '2tradesman', '20250211082325_1.jpg', '2025-02-11', 1739262205000, 2555430),
  shot('tradesman_3', 'TRADESMAN: Deal to Dealer', 'tradesman', '2tradesman', '20250211204052_1.jpg', '2025-02-11', 1739306452000, 2555430),
  shot('tradesman_4', 'TRADESMAN: Deal to Dealer', 'tradesman', '2tradesman', '20250723142150_1.jpg', '2025-07-23', 1753278110000, 2555430),

  shot('expeditions_1', 'Expeditions: A MudRunner Game', 'expeditions', '3expeditions', '20250716193006_1.jpg', '2025-07-16', 1752691806000, 2477340),
  shot('expeditions_2', 'Expeditions: A MudRunner Game', 'expeditions', '3expeditions', '20250726111045_1.jpg', '2025-07-26', 1753525845000, 2477340),
  shot('expeditions_3', 'Expeditions: A MudRunner Game', 'expeditions', '3expeditions', '20250727183719_1.jpg', '2025-07-27', 1753639039000, 2477340),

  shot('eve_1', 'EVE Online', 'eve', '4eve', '2025-07-01_11-17-01.png', '2025-07-01', 1751368621000, 8500),
  shot('eve_2', 'EVE Online', 'eve', '4eve', '20250222113245_1.jpg', '2025-02-22', 1740223965000, 8500),
  shot('eve_3', 'EVE Online', 'eve', '4eve', '20250128131348_1.jpg', '2025-01-28', 1738067628000, 8500),

  shot('warframe_1', 'Warframe', 'warframe', '4warframe', '20241123122517_1.jpg', '2024-11-23', 1732362317000, 230410),
  shot('warframe_2', 'Warframe', 'warframe', '4warframe', '20241219163829_1.jpg', '2024-12-19', 1734626309000, 230410),
  shot('warframe_3', 'Warframe', 'warframe', '4warframe', '20250111072530_1.jpg', '2025-01-11', 1736577930000, 230410),

  shot('gtfo_1', 'GTFO', 'gtfo', '5gtfo', '20241117135908_1.jpg', '2024-11-17', 1731849548000, 493520),
  shot('gtfo_2', 'GTFO', 'gtfo', '5gtfo', '20241117164849_1.jpg', '2024-11-17', 1731860929000, 493520),
  shot('gtfo_3', 'GTFO', 'gtfo', '5gtfo', '20241122185732_1.jpg', '2024-11-22', 1732301852000, 493520),

  shot('skyrim_1', 'The Elder Scrolls V: Skyrim', 'skyrim', '6skyrim', '20250504202851_1.jpg', '2025-05-04', 1746388131000, 72850),
  shot('skyrim_2', 'The Elder Scrolls V: Skyrim', 'skyrim', '6skyrim', '20250511132636_1.jpg', '2025-05-11', 1746969996000, 72850),
  shot('skyrim_3', 'The Elder Scrolls V: Skyrim', 'skyrim', '6skyrim', '20250513185051_1.jpg', '2025-05-13', 1747162251000, 72850),

  shot('dbd_1', 'Dead by Daylight', 'dbd', '7dbd', '2025-07-26_16-01-01.png', '2025-07-26', 1753545661000, 381210),
  shot('dbd_2', 'Dead by Daylight', 'dbd', '7dbd', '20250330133314_1.jpg', '2025-03-30', 1743339194000, 381210),
  shot('dbd_3', 'Dead by Daylight', 'dbd', '7dbd', '20250406175326_1.jpg', '2025-04-06', 1743959606000, 381210)
];

const byId = new Map<string, Screenshot>();
for (const s of [...localScreenshots, ...generatedScreenshots]) {
  byId.set(s.id, s);
}

export const screenshotsData: Screenshot[] = Array.from(byId.values()).sort(
  (a, b) => b.timestamp - a.timestamp
);

export const getUniqueGames = () => {
  const games = screenshotsData.map((screenshot) => ({
    id: screenshot.gameId,
    name: screenshot.game
  }));

  return games.filter(
    (game, index, self) => index === self.findIndex((g) => g.id === game.id)
  );
};

export const filterScreenshots = (
  gameId?: string,
  dateRange?: { from: Date; to: Date },
  appId?: number
) => {
  let filtered = screenshotsData;

  if (gameId || appId) {
    filtered = filtered.filter(
      (screenshot) =>
        (gameId ? screenshot.gameId === gameId : false) ||
        (typeof appId === 'number' ? screenshot.appId === appId : false)
    );
  }

  if (dateRange) {
    filtered = filtered.filter((screenshot) => {
      const screenshotDate = new Date(screenshot.timestamp);
      return screenshotDate >= dateRange.from && screenshotDate <= dateRange.to;
    });
  }

  return filtered;
};
