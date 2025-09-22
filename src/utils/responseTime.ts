// src/utils/responseTime.ts

export interface ResponseStatus {
  timeText: string;
  timeTextHighlight?: string; // Выделяемая часть текста
  status: 'fast' | 'slow' | 'sleeping';
  warning?: string;
  timeUntilChange?: string;
  changeDescription?: string;
}

/**
 * Определяет статус ответа на основе текущего времени по Москве
 */
export function getResponseStatus(): ResponseStatus {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  
  const hour = moscowTime.getHours();
  const minute = moscowTime.getMinutes();
  const dayOfWeek = moscowTime.getDay(); // 0 = воскресенье, 6 = суббота
  
  // Проверяем выходные дни (суббота и воскресенье)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Функция для расчета времени до следующего изменения
  const getTimeUntilChange = (nextHour: number): string => {
    const currentMinutes = hour * 60 + minute;
    const nextMinutes = nextHour * 60;
    
    let diffMinutes = nextMinutes - currentMinutes;
    if (diffMinutes <= 0) {
      diffMinutes += 24 * 60; // Следующий день
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    } else {
      return `${mins}м`;
    }
  };
  
  if (isWeekend) {
    // Выходные: 0-6 сплю, 6-12 быстрый, 12-17 медленный, 17-21 быстрый, 21-0 сплю
    if (hour >= 0 && hour < 6) {
      return {
        timeText: 'Могу не ответить до утра',
        status: 'sleeping',
        warning: 'Сплю и могу не ответить до утра',
        timeUntilChange: getTimeUntilChange(6),
        changeDescription: 'До начала рабочего дня'
      };
    } else if (hour >= 6 && hour < 12) {
      return {
        timeText: 'Отвечаю за 5-7 мин',
        timeTextHighlight: '5-7 мин',
        status: 'fast',
        timeUntilChange: getTimeUntilChange(12),
        changeDescription: 'До начала частичной занятости'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        timeText: 'Отвечаю в течение 40-50 мин',
        status: 'slow',
        warning: 'Выходной день - провожу время с семьей или друзьями',
        timeUntilChange: getTimeUntilChange(17),
        changeDescription: 'До начала рабочего дня'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        timeText: 'Отвечаю за 5-7 мин',
        timeTextHighlight: '5-7 мин',
        status: 'fast',
        timeUntilChange: getTimeUntilChange(21),
        changeDescription: 'До сна'
      };
    } else {
      // 21-0
      return {
        timeText: 'Могу не ответить до утра',
        status: 'sleeping',
        warning: 'Сплю и могу не ответить до утра',
        timeUntilChange: getTimeUntilChange(0),
        changeDescription: 'До начала рабочего дня'
      };
    }
  }
  
  // Будние дни - быстрый ответ с 6:00 до 22:00
  if (hour >= 6 && hour < 22) {
    return {
      timeText: 'Отвечаю за 5-7 мин',
      timeTextHighlight: '5-7 мин',
      status: 'fast',
      timeUntilChange: getTimeUntilChange(22),
      changeDescription: 'До сна'
    };
  } else {
    // Ночью с 22:00 до 6:00 - сплю
    return {
      timeText: 'Могу не ответить до утра',
      status: 'sleeping',
      warning: 'Сплю и могу не ответить до утра',
      timeUntilChange: getTimeUntilChange(6),
      changeDescription: 'До начала рабочего дня'
    };
  }
}

/**
 * Получает текущее время по Москве в формате HH:MM:SS
 */
export function getMoscowTime(): string {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  
  return moscowTime.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
