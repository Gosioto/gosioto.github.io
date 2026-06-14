import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth';
import { dispatchAvatarUpdated } from '../avatarEvents';
import { updateMe, updateMyAvatar, deleteMyAvatar } from '../api';
import { useToast } from '../ui';
import Avatar from '../components/Avatar';
import styles from './Settings.module.css';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setNameValue(user.name ?? '');
  }, [user]);

  const showSuccess = (msg: string) => {
    showToast('Готово', msg, 'success');
    setError('');
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение (PNG, JPG и т.д.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Размер файла не более 2 МБ');
      return;
    }
    setError('');
    setLoading(true);
    fileToBase64(file)
      .then((base64) => updateMyAvatar(base64))
      .then(() => {
        refreshUser();
        if (user?.id) dispatchAvatarUpdated(user.id);
        showSuccess('Аватар обновлён');
        if (inputRef.current) inputRef.current.value = '';
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }

  function handleDelete() {
    if (!confirm('Удалить аватар?')) return;
    setError('');
    setLoading(true);
    deleteMyAvatar()
      .then(() => {
        refreshUser();
        if (user?.id) dispatchAvatarUpdated(user.id);
        showSuccess('Аватар удалён');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setLoading(false));
  }

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSavingName(true);
    updateMe({ name: nameValue.trim() || undefined })
      .then((updated) => {
        refreshUser();
        setNameValue(updated.name ?? '');
        showSuccess('Имя обновлено');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingName(false));
  }

  if (!user) return null;

  return (
    <>
      <h1 className={styles.pageTitle}>Настройки</h1>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Имя</h2>
        <p className={styles.sectionDesc}>Отображаемое имя (в чатах и профиле)</p>
        <form onSubmit={handleSaveName} className={styles.nameForm}>
          <input
            type="text"
            className={styles.input}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Имя"
            disabled={savingName}
          />
          <button type="submit" className={styles.button} disabled={savingName}>
            Сохранить
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Аватар</h2>
        <div className={styles.avatarBlock}>
          <Avatar
            userId={user.id}
            fallbackLetter={user.name?.[0] || user.email[0]}
            size={96}
            className={styles.avatar}
          />
          <div className={styles.avatarActions}>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.button}
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              {user.has_avatar ? 'Заменить' : 'Загрузить'}
            </button>
            {user.has_avatar && (
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={handleDelete}
                disabled={loading}
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
