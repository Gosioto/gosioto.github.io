import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { login, health, HealthCheckError } from '../api';
import { Button, useToast } from '../ui';
import styles from './Login.module.css';

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ready' }
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
      await health();
      setApiHealth({ kind: 'ready' });
    } catch (err) {
      const message =
        err instanceof HealthCheckError ? err.code : 'Нет соединения';
      setApiHealth({ kind: 'error', message });
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
    login(email, password, '/dashboard')
      .then(({ token, user, session_id }) => {
        setAuth(token, user, session_id);
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
      {apiHealth.kind === 'error' && (
        <div className={styles.statusBannerError} role="status">
          API: недоступен, ошибка ({apiHealth.message})
        </div>
      )}
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
              <span className={styles.labelRow}>
                <span className={styles.fieldLabel}>Логин</span>
                {apiHealth.kind === 'ready' && (
                  <span
                    className={styles.apiOk}
                    title="API доступен"
                    aria-label="API доступен"
                  />
                )}
              </span>
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
