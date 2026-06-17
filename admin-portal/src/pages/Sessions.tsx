import { useCallback, useEffect, useState } from 'react';
import {
  getSessionSummaries,
  getUserSessions,
  getSessionHistory,
  revokeSession,
  purgeSessionStorage,
  type UserSessionSummary,
  type UserSessionRow,
} from '../api';
import { useAuth } from '../auth';
import { useToast } from '../ui';
import styles from './Sessions.module.css';

function presenceDotClass(presence: string) {
  if (presence === 'online') return styles.dotOnline;
  if (presence === 'away') return styles.dotAway;
  return styles.dotOffline;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Sessions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canRevoke = user?.permissions?.includes('sessions.revoke');
  const canStorage = user?.permissions?.includes('sessions.storage');

  const [summaries, setSummaries] = useState<UserSessionSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<UserSessionRow[]>([]);
  const [history, setHistory] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purgeDay, setPurgeDay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });

  const loadSummaries = useCallback(async () => {
    const list = await getSessionSummaries();
    setSummaries(list);
  }, []);

  useEffect(() => {
    loadSummaries()
      .catch(() => setError('Не удалось загрузить сессии'))
      .finally(() => setLoading(false));
  }, [loadSummaries]);

  useEffect(() => {
    if (!selectedUserId) {
      setSessions([]);
      setHistory(null);
      return;
    }
    void Promise.all([
      getUserSessions(selectedUserId),
      getSessionHistory(selectedUserId, todayIso()).catch(() => null),
    ])
      .then(([sess, hist]) => {
        setSessions(sess);
        setHistory(hist);
      })
      .catch(() => showToast('Ошибка', 'Не удалось загрузить детали', 'error'));
  }, [selectedUserId, showToast]);

  async function handleRevoke(sessionId: string) {
    if (!canRevoke) return;
    if (!confirm('Завершить эту сессию?')) return;
    try {
      await revokeSession(sessionId);
      showToast('Готово', 'Сессия завершена', 'success');
      await loadSummaries();
      if (selectedUserId) {
        setSessions(await getUserSessions(selectedUserId));
      }
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось', 'error');
    }
  }

  async function handlePurge() {
    if (!canStorage) return;
    if (!confirm(`Очистить данные GOSLOTO в ClickHouse до ${purgeDay}?`)) return;
    try {
      const result = await purgeSessionStorage(purgeDay);
      showToast('Готово', 'Запрос на очистку отправлен', 'success');
      console.info('purge result', result);
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось', 'error');
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Загрузка…</p>;

  return (
    <>
      <h1 className={styles.pageTitle}>Сессии пользователей</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Активные пользователи</div>
          <div className={styles.list}>
            {summaries.length === 0 ? (
              <div className={styles.empty}>Нет активных сессий</div>
            ) : (
              summaries.map((s) => (
                <button
                  key={s.user_id}
                  type="button"
                  className={`${styles.row} ${selectedUserId === s.user_id ? styles.rowActive : ''}`}
                  onClick={() => setSelectedUserId(s.user_id)}
                >
                  <span className={`${styles.dot} ${presenceDotClass(s.presence)}`} />
                  <div className={styles.rowBody}>
                    <div className={styles.rowName}>{s.name || s.email}</div>
                    <div className={styles.rowMeta}>
                      {s.session_count} вкл. · {s.presence}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Детали</div>
          <div className={styles.detail}>
            {!selectedUserId ? (
              <div className={styles.empty}>Выберите пользователя слева</div>
            ) : (
              <>
                {sessions.map((sess) => (
                  <div key={sess.id} className={styles.sessionCard}>
                    <div className={styles.sessionCardHeader}>
                      <span>
                        <span className={`${styles.dot} ${presenceDotClass(sess.status)}`} /> {sess.status}
                      </span>
                      {canRevoke && (
                        <button type="button" className={styles.revokeBtn} onClick={() => void handleRevoke(sess.id)}>
                          Завершить
                        </button>
                      )}
                    </div>
                    <div className={styles.rowMeta}>Путь: {sess.current_path || '—'}</div>
                    <div className={styles.rowMeta}>IP: {sess.client_ip || '—'}</div>
                    <div className={styles.rowMeta}>
                      Активность: {new Date(sess.last_seen_at).toLocaleString()}
                    </div>
                    <div className={styles.rowMeta}>Сессия: {sess.id.slice(0, 8)}…</div>
                  </div>
                ))}
                {history != null && (
                  <pre className={styles.historyPre}>{JSON.stringify(history, null, 2)}</pre>
                )}
              </>
            )}

            {canStorage && (
              <div className={styles.storageBlock}>
                <div className={styles.panelHeader} style={{ padding: 0, border: 'none' }}>
                  Хранилище ClickHouse
                </div>
                <label className={styles.rowMeta}>
                  Удалить события GOSLOTO до даты:{' '}
                  <input type="date" value={purgeDay} onChange={(e) => setPurgeDay(e.target.value)} />
                </label>
                <button type="button" className={styles.purgeBtn} onClick={() => void handlePurge()}>
                  Очистить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
