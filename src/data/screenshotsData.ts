// src/data/screenshotsData.ts

export interface Screenshot {
  id: string;
  filename: string;
  game: string;
  gameId: string;
  date: string;
  timestamp: number;
  path: string;
  thumbnail: string;
}

export const screenshotsData: Screenshot[] = [
  // Witcher 3 скриншоты (выборочно из 646 файлов)
  {
    id: 'witcher_1',
    filename: 'witcher_menu.jpg',
    game: 'The Witcher 3: Wild Hunt',
    gameId: 'witcher3',
    date: '2025-01-15',
    timestamp: 1736956800000,
    path: '/img/screenshot/1witcher/witcher_menu.jpg',
    thumbnail: '/img/screenshot/1witcher/witcher_menu.jpg'
  },
  {
    id: 'witcher_2',
    filename: 'witcher_combat.jpg',
    game: 'The Witcher 3: Wild Hunt',
    gameId: 'witcher3',
    date: '2025-01-14',
    timestamp: 1736870400000,
    path: '/img/screenshot/1witcher/witcher_combat.jpg',
    thumbnail: '/img/screenshot/1witcher/witcher_combat.jpg'
  },
  {
    id: 'witcher_3',
    filename: 'witcher_landscape.jpg',
    game: 'The Witcher 3: Wild Hunt',
    gameId: 'witcher3',
    date: '2025-01-13',
    timestamp: 1736784000000,
    path: '/img/screenshot/1witcher/witcher_landscape.jpg',
    thumbnail: '/img/screenshot/1witcher/witcher_landscape.jpg'
  },

  // Tradesman скриншоты
  {
    id: 'tradesman_1',
    filename: '20250211081544_1.jpg',
    game: 'TRADESMAN: Deal to Dealer',
    gameId: 'tradesman',
    date: '2025-02-11',
    timestamp: 1739289600000,
    path: '/img/screenshot/2tradesman/20250211081544_1.jpg',
    thumbnail: '/img/screenshot/2tradesman/20250211081544_1.jpg'
  },
  {
    id: 'tradesman_2',
    filename: '20250211082325_1.jpg',
    game: 'TRADESMAN: Deal to Dealer',
    gameId: 'tradesman',
    date: '2025-02-11',
    timestamp: 1739292000000,
    path: '/img/screenshot/2tradesman/20250211082325_1.jpg',
    thumbnail: '/img/screenshot/2tradesman/20250211082325_1.jpg'
  },
  {
    id: 'tradesman_3',
    filename: '20250211204052_1.jpg',
    game: 'TRADESMAN: Deal to Dealer',
    gameId: 'tradesman',
    date: '2025-02-11',
    timestamp: 1739352000000,
    path: '/img/screenshot/2tradesman/20250211204052_1.jpg',
    thumbnail: '/img/screenshot/2tradesman/20250211204052_1.jpg'
  },
  {
    id: 'tradesman_4',
    filename: '20250212082654_1.jpg',
    game: 'TRADESMAN: Deal to Dealer',
    gameId: 'tradesman',
    date: '2025-02-12',
    timestamp: 1739376000000,
    path: '/img/screenshot/2tradesman/20250212082654_1.jpg',
    thumbnail: '/img/screenshot/2tradesman/20250212082654_1.jpg'
  },
  {
    id: 'tradesman_5',
    filename: '20250212215039_1.jpg',
    game: 'TRADESMAN: Deal to Dealer',
    gameId: 'tradesman',
    date: '2025-02-12',
    timestamp: 1739448000000,
    path: '/img/screenshot/2tradesman/20250212215039_1.jpg',
    thumbnail: '/img/screenshot/2tradesman/20250212215039_1.jpg'
  },

  // Expeditions скриншоты
  {
    id: 'expeditions_1',
    filename: '20250716193006_1.jpg',
    game: 'Expeditions: A MudRunner Game',
    gameId: 'expeditions',
    date: '2025-07-16',
    timestamp: 1752624000000,
    path: '/img/screenshot/3expeditions/20250716193006_1.jpg',
    thumbnail: '/img/screenshot/3expeditions/20250716193006_1.jpg'
  },
  {
    id: 'expeditions_2',
    filename: '20250726111045_1.jpg',
    game: 'Expeditions: A MudRunner Game',
    gameId: 'expeditions',
    date: '2025-07-26',
    timestamp: 1753401600000,
    path: '/img/screenshot/3expeditions/20250726111045_1.jpg',
    thumbnail: '/img/screenshot/3expeditions/20250726111045_1.jpg'
  },
  {
    id: 'expeditions_3',
    filename: '20250727183719_1.jpg',
    game: 'Expeditions: A MudRunner Game',
    gameId: 'expeditions',
    date: '2025-07-27',
    timestamp: 1753488000000,
    path: '/img/screenshot/3expeditions/20250727183719_1.jpg',
    thumbnail: '/img/screenshot/3expeditions/20250727183719_1.jpg'
  },

  // EVE Online скриншоты
  {
    id: 'eve_1',
    filename: '2025-07-01_11-17-01.png',
    game: 'EVE Online',
    gameId: 'eve',
    date: '2025-07-01',
    timestamp: 1751587200000,
    path: '/img/screenshot/4eve/2025-07-01_11-17-01.png',
    thumbnail: '/img/screenshot/4eve/2025-07-01_11-17-01.png'
  },
  {
    id: 'eve_2',
    filename: '20250128131348_1.jpg',
    game: 'EVE Online',
    gameId: 'eve',
    date: '2025-01-28',
    timestamp: 1738080000000,
    path: '/img/screenshot/4eve/20250128131348_1.jpg',
    thumbnail: '/img/screenshot/4eve/20250128131348_1.jpg'
  },
  {
    id: 'eve_3',
    filename: '20250222113245_1.jpg',
    game: 'EVE Online',
    gameId: 'eve',
    date: '2025-02-22',
    timestamp: 1739635200000,
    path: '/img/screenshot/4eve/20250222113245_1.jpg',
    thumbnail: '/img/screenshot/4eve/20250222113245_1.jpg'
  },

  // Warframe скриншоты
  {
    id: 'warframe_1',
    filename: '20241123122517_1.jpg',
    game: 'Warframe',
    gameId: 'warframe',
    date: '2024-11-23',
    timestamp: 1732291200000,
    path: '/img/screenshot/4warframe/20241123122517_1.jpg',
    thumbnail: '/img/screenshot/4warframe/20241123122517_1.jpg'
  },
  {
    id: 'warframe_2',
    filename: '20241219163829_1.jpg',
    game: 'Warframe',
    gameId: 'warframe',
    date: '2024-12-19',
    timestamp: 1734566400000,
    path: '/img/screenshot/4warframe/20241219163829_1.jpg',
    thumbnail: '/img/screenshot/4warframe/20241219163829_1.jpg'
  },
  {
    id: 'warframe_3',
    filename: '20250111072530_1.jpg',
    game: 'Warframe',
    gameId: 'warframe',
    date: '2025-01-11',
    timestamp: 1736611200000,
    path: '/img/screenshot/4warframe/20250111072530_1.jpg',
    thumbnail: '/img/screenshot/4warframe/20250111072530_1.jpg'
  },

  // GTFO скриншоты
  {
    id: 'gtfo_1',
    filename: '20241117135908_1.jpg',
    game: 'GTFO',
    gameId: 'gtfo',
    date: '2024-11-17',
    timestamp: 1731859200000,
    path: '/img/screenshot/5gtfo/20241117135908_1.jpg',
    thumbnail: '/img/screenshot/5gtfo/20241117135908_1.jpg'
  },
  {
    id: 'gtfo_2',
    filename: '20241117164849_1.jpg',
    game: 'GTFO',
    gameId: 'gtfo',
    date: '2024-11-17',
    timestamp: 1731873600000,
    path: '/img/screenshot/5gtfo/20241117164849_1.jpg',
    thumbnail: '/img/screenshot/5gtfo/20241117164849_1.jpg'
  },
  {
    id: 'gtfo_3',
    filename: '20241122185732_1.jpg',
    game: 'GTFO',
    gameId: 'gtfo',
    date: '2024-11-22',
    timestamp: 1732291200000,
    path: '/img/screenshot/5gtfo/20241122185732_1.jpg',
    thumbnail: '/img/screenshot/5gtfo/20241122185732_1.jpg'
  },

  // Skyrim скриншоты
  {
    id: 'skyrim_1',
    filename: '20250504202851_1.jpg',
    game: 'The Elder Scrolls V: Skyrim',
    gameId: 'skyrim',
    date: '2025-05-04',
    timestamp: 1746316800000,
    path: '/img/screenshot/6skyrim/20250504202851_1.jpg',
    thumbnail: '/img/screenshot/6skyrim/20250504202851_1.jpg'
  },
  {
    id: 'skyrim_2',
    filename: '20250511132636_1.jpg',
    game: 'The Elder Scrolls V: Skyrim',
    gameId: 'skyrim',
    date: '2025-05-11',
    timestamp: 1746921600000,
    path: '/img/screenshot/6skyrim/20250511132636_1.jpg',
    thumbnail: '/img/screenshot/6skyrim/20250511132636_1.jpg'
  },
  {
    id: 'skyrim_3',
    filename: '20250513185051_1.jpg',
    game: 'The Elder Scrolls V: Skyrim',
    gameId: 'skyrim',
    date: '2025-05-13',
    timestamp: 1747094400000,
    path: '/img/screenshot/6skyrim/20250513185051_1.jpg',
    thumbnail: '/img/screenshot/6skyrim/20250513185051_1.jpg'
  },

  // Dead by Daylight скриншоты
  {
    id: 'dbd_1',
    filename: '2025-07-26_16-01-01.png',
    game: 'Dead by Daylight',
    gameId: 'dbd',
    date: '2025-07-26',
    timestamp: 1753401600000,
    path: '/img/screenshot/7dbd/2025-07-26_16-01-01.png',
    thumbnail: '/img/screenshot/7dbd/2025-07-26_16-01-01.png'
  },
  {
    id: 'dbd_2',
    filename: '20250330133314_1.jpg',
    game: 'Dead by Daylight',
    gameId: 'dbd',
    date: '2025-03-30',
    timestamp: 1711929600000,
    path: '/img/screenshot/7dbd/20250330133314_1.jpg',
    thumbnail: '/img/screenshot/7dbd/20250330133314_1.jpg'
  },
  {
    id: 'dbd_3',
    filename: '20250406175326_1.jpg',
    game: 'Dead by Daylight',
    gameId: 'dbd',
    date: '2025-04-06',
    timestamp: 1712448000000,
    path: '/img/screenshot/7dbd/20250406175326_1.jpg',
    thumbnail: '/img/screenshot/7dbd/20250406175326_1.jpg'
  },

  // Everyone скриншоты
  {
    id: 'everyone_1',
    filename: '20241214134647_1.jpg',
    game: 'Among Us',
    gameId: 'everyone',
    date: '2024-12-14',
    timestamp: 1734134400000,
    path: '/img/screenshot/8everyone/20241214134647_1.jpg',
    thumbnail: '/img/screenshot/8everyone/20241214134647_1.jpg'
  },
  {
    id: 'everyone_2',
    filename: '20241222162339_1.jpg',
    game: 'Among Us',
    gameId: 'everyone',
    date: '2024-12-22',
    timestamp: 1734825600000,
    path: '/img/screenshot/8everyone/20241222162339_1.jpg',
    thumbnail: '/img/screenshot/8everyone/20241222162339_1.jpg'
  },
  {
    id: 'everyone_3',
    filename: '20250121192156_1.jpg',
    game: 'Among Us',
    gameId: 'everyone',
    date: '2025-01-21',
    timestamp: 1737504000000,
    path: '/img/screenshot/8everyone/20250121192156_1.jpg',
    thumbnail: '/img/screenshot/8everyone/20250121192156_1.jpg'
  }
];

// Функция для получения уникальных игр
export const getUniqueGames = () => {
  const games = screenshotsData.map(screenshot => ({
    id: screenshot.gameId,
    name: screenshot.game
  }));
  
  return games.filter((game, index, self) => 
    index === self.findIndex(g => g.id === game.id)
  );
};

// Функция для фильтрации скриншотов
export const filterScreenshots = (gameId?: string, dateRange?: { from: Date; to: Date }) => {
  let filtered = screenshotsData;
  
  if (gameId) {
    filtered = filtered.filter(screenshot => screenshot.gameId === gameId);
  }
  
  if (dateRange) {
    filtered = filtered.filter(screenshot => {
      const screenshotDate = new Date(screenshot.timestamp);
      return screenshotDate >= dateRange.from && screenshotDate <= dateRange.to;
    });
  }
  
  return filtered.sort((a, b) => b.timestamp - a.timestamp); // Сортировка по дате (новые сначала)
};
