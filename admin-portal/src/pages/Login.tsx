import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { login, health } from '../api';
import { Button, useToast } from '../ui';
import styles from './Login.module.css';

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ready'; dbOk: boolean; overallOk: boolean }
  | { kind: 'error'; message: string };

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState<HealthState>({ kind: 'loading' });
  const { showToast } = useToast();

  const checkHealth = useCallback(async () => {
    try {
      const data = await health();
      const db = typeof data.database === 'string' ? data.database : 'unknown';
      const dbOk = db === 'ok';
      const overallOk = data.status === 'ok' && dbOk;
      setApiHealth({ kind: 'ready', dbOk, overallOk });
    } catch {
      setApiHealth({ kind: 'error', message: 'Нет соединения' });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = window.setInterval(checkHealth, 20000);
    return () => window.clearInterval(id);
  }, [checkHealth]);

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    login(email, password)
      .then(({ token, user }) => {
        setAuth(token, user);
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Ошибка входа';
        setError(msg);
        showToast('Ошибка входа', msg, 'error');
        setLoading(false);
      });
  }

  return (
    <div className={styles.wrap}>
      <div
        className={
          apiHealth.kind === 'loading'
            ? styles.statusBanner
            : apiHealth.kind === 'error'
              ? styles.statusBannerError
              : apiHealth.kind === 'ready' && apiHealth.overallOk
                ? styles.statusBannerOk
                : styles.statusBannerWarn
        }
        role="status"
      >
        {apiHealth.kind === 'loading' && <span>API: проверка…</span>}
        {apiHealth.kind === 'error' && (
          <span>API: недоступен ({apiHealth.message}). Запустите бэкенд и PostgreSQL.</span>
        )}
        {apiHealth.kind === 'ready' && apiHealth.overallOk && (
          <span>API и база данных: в порядке</span>
        )}
        {apiHealth.kind === 'ready' && !apiHealth.overallOk && (
          <span>
            {apiHealth.dbOk
              ? 'Сервис работает с ограничениями (проверьте ответ /health).'
              : 'База данных недоступна — поднимите PostgreSQL и выполните миграции.'}
          </span>
        )}
      </div>
      <div className={styles.card}>
        {step === 1 ? (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setStep(2);
            }}
          >
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Логин</span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="username"
                autoFocus
              />
            </label>
            <Button type="submit" className={styles.button}>
              Далее
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Пароль</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
                autoFocus
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.row}>
              <button
                type="button"
                className={styles.back}
                onClick={() => { setStep(1); setError(''); }}
              >
                Назад
              </button>
              <Button type="submit" disabled={loading}>
                {loading ? '…' : 'Вход'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
