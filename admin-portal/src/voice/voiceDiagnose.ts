/**
 * Стабильные коды и текст для отладки без реального WebRTC в тестах.
 * См. documentation/voice-test-errors.md
 */
export type VoiceDiagnosis = {
  code: string;
  where: string;
  likelyCause: string;
  suggestedFix: string;
  /** Исходное сообщение / имя исключения для детализации */
  rawName?: string;
  rawMessage?: string;
};

const WHERE_SCREEN = 'Dashboard.tsx → setScreenShareEnabled → getDisplayMedia';

export function diagnoseDisplayMediaUnavailable(): VoiceDiagnosis {
  return {
    code: 'DISPLAY_MEDIA_API_MISSING',
    where: WHERE_SCREEN,
    likelyCause:
      'В этом контексте нет navigator.mediaDevices.getDisplayMedia (часто: не HTTPS и не localhost, урезанный WebView, старый браузер).',
    suggestedFix:
      'Открыть приложение по https:// или http://localhost; использовать поддерживаемый браузер; для встроенных окружений — проверить доступность Screen Capture API.',
  };
}

function pickKnownDomException(err: DOMException): VoiceDiagnosis | null {
  switch (err.name) {
    case 'NotAllowedError':
      return {
        code: 'DISPLAY_MEDIA_NOT_ALLOWED',
        where: WHERE_SCREEN,
        likelyCause: 'Пользователь отменил выбор экрана/окна или браузер/ОС запретили захват.',
        suggestedFix:
          'Вызывать getDisplayMedia только по прямому клику; проверить настройки конфиденциальности ОС (разрешение на запись экрана); при MDM — политики организации.',
        rawName: err.name,
        rawMessage: err.message,
      };
    case 'NotFoundError':
      return {
        code: 'DISPLAY_MEDIA_NOT_FOUND',
        where: WHERE_SCREEN,
        likelyCause: 'Браузер не нашёл подходящего источника захвата.',
        suggestedFix: 'Проверить, что в системе доступен захват экрана; обновить браузер и драйверы.',
        rawName: err.name,
        rawMessage: err.message,
      };
    case 'InvalidStateError':
      return {
        code: 'DISPLAY_MEDIA_INVALID_STATE',
        where: WHERE_SCREEN,
        likelyCause: 'Некорректное состояние (повторный вызов, навигация во время диалога, внутренняя гонка).',
        suggestedFix: 'Обновить страницу; не запускать второй захват, пока первый не завершён.',
        rawName: err.name,
        rawMessage: err.message,
      };
    case 'AbortError':
      return {
        code: 'DISPLAY_MEDIA_ABORT',
        where: WHERE_SCREEN,
        likelyCause: 'Операция прервана до выбора источника.',
        suggestedFix: 'Повторить попытку; убедиться, что вкладка активна и не уходит в фон в момент вызова.',
        rawName: err.name,
        rawMessage: err.message,
      };
    default:
      return null;
  }
}

export function diagnoseDisplayMediaFailure(err: unknown): VoiceDiagnosis {
  if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
    const known = pickKnownDomException(err);
    if (known) return known;
    return {
      code: 'DISPLAY_MEDIA_UNKNOWN',
      where: WHERE_SCREEN,
      likelyCause: `Исключение DOM: ${err.name || 'unknown'}.`,
      suggestedFix: 'Сверить rawMessage с документацией браузера; проверить консоль на сопутствующие ошибки расширений.',
      rawName: err.name,
      rawMessage: err.message,
    };
  }
  if (err instanceof Error) {
    return {
      code: 'DISPLAY_MEDIA_UNKNOWN',
      where: WHERE_SCREEN,
      likelyCause: 'Ошибка JavaScript (не DOMException), см. rawMessage.',
      suggestedFix: 'Проверить стек в консоли; убедиться, что reject приходит из getDisplayMedia, а не из другого кода.',
      rawMessage: err.message,
    };
  }
  return {
    code: 'DISPLAY_MEDIA_UNKNOWN',
    where: WHERE_SCREEN,
    likelyCause: 'Отклонение Promise не Error/DOMException.',
    suggestedFix: 'Проверить поле rawMessage и контекст вызова.',
    rawMessage: String(err),
  };
}
