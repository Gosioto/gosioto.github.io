// src/utils/responseTime.ts

export interface ResponseStatus {
  timeText: string;
  timeTextHighlight?: string;
  status: 'fast' | 'slow' | 'sleeping';
  warning?: string;
  timeUntilChange?: string;
  changeDescription?: string;
}

/** Детерминированный псевдо-рандом по строке (дата) — один и тот же день даёт одни и те же числа */
function seededByDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return h % 1000;
}

/** Возвращает число в [0, max) по seed от даты и сдвига */
function randomFromSeed(seed: number, offset: number, max: number): number {
  return ((seed + offset * 17) % 1000) % max;
}

/**
 * Определяет статус ответа на основе текущего времени по Москве.
 * Четверг и пятница: 6 часов сна (3+3) в ночное время. Остальные дни — слегка рандомный график по seed от даты.
 */
export function getResponseStatus(): ResponseStatus {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));

  const hour = moscowTime.getHours();
  const minute = moscowTime.getMinutes();
  const dayOfWeek = moscowTime.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 4 = четверг, 5 = пятница, 6 = суббота

  const dateStr =
    moscowTime.getFullYear() +
    '-' +
    String(moscowTime.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(moscowTime.getDate()).padStart(2, '0');
  const seed = seededByDate(dateStr);

  const getTimeUntilChange = (nextHour: number): string => {
    const currentMinutes = hour * 60 + minute;
    const nextMinutes = nextHour * 60;
    let diffMinutes = nextMinutes - currentMinutes;
    if (diffMinutes <= 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  };

  const sleeping = (timeUntil: number, changeDesc: string): ResponseStatus => ({
    timeText: 'Могу не ответить до утра',
    status: 'sleeping',
    warning: 'Сплю и могу не ответить до утра',
    timeUntilChange: getTimeUntilChange(timeUntil),
    changeDescription: changeDesc,
  });

  const fast = (timeUntil: number, changeDesc: string): ResponseStatus => ({
    timeText: 'Отвечаю за 5-7 мин',
    timeTextHighlight: '5-7 мин',
    status: 'fast',
    timeUntilChange: getTimeUntilChange(timeUntil),
    changeDescription: changeDesc,
  });

  const slow = (timeUntil: number, changeDesc: string, warning: string): ResponseStatus => ({
    timeText: 'Отвечаю в течение 40-50 мин',
    status: 'slow',
    warning,
    timeUntilChange: getTimeUntilChange(timeUntil),
    changeDescription: changeDesc,
  });

  // Четверг (4) и Пятница (5): 6 часов сна в день — два блока по 3 часа в ночное время
  // Блок 1: 23:00–02:00, блок 2: 05:00–08:00. Остальное время — быстрый ответ.
  if (dayOfWeek === 4 || dayOfWeek === 5) {
    if (hour >= 23 || hour < 2) {
      return sleeping(2, 'До конца первого сна');
    }
    if (hour >= 2 && hour < 5) {
      return fast(5, 'До второго сна');
    }
    if (hour >= 5 && hour < 8) {
      return sleeping(8, 'До пробуждения');
    }
    // 08:00–23:00 — быстрый ответ
    return fast(23, 'До сна');
  }

  // Остальные дни: слегка рандомный график по seed от даты (одно и то же на весь день)
  // Случайное окно сна: начало 21–23, конец 5–7
  const sleepStart = 21 + randomFromSeed(seed, dayOfWeek, 3);   // 21, 22 или 23
  const sleepEnd = 5 + randomFromSeed(seed, dayOfWeek + 7, 3);  // 5, 6 или 7

  const isInSleepWindow = hour >= sleepStart || hour < sleepEnd;

  if (isInSleepWindow) {
    return sleeping(sleepEnd, 'До пробуждения');
  }

  // День (между sleepEnd и sleepStart): быстрый ответ, в выходные — возможен «медленный» блок
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    const slowStart = 12 + randomFromSeed(seed, dayOfWeek + 1, 3); // 12–14
    const slowEnd = slowStart + 3;
    if (hour >= slowStart && hour < slowEnd) {
      return slow(slowEnd, 'До конца занятости', 'Выходной — могу быть занят');
    }
  }

  // Всё остальное время дня — быстрый ответ до сна
  return fast(sleepStart, 'До сна');
}

/**
 * Получает текущее время по Москве в формате HH:MM:SS
 */
export function getMoscowTime(): string {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));

  return moscowTime.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
