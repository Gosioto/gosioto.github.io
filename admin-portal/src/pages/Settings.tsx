import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth';
import { dispatchAvatarUpdated } from '../avatarEvents';
import { updateMe, updateMyAvatar, deleteMyAvatar } from '../api';
import { Button, useToast } from '../ui';
import AvatarCropper from '../ui/AvatarCropper/AvatarCropper';
import Avatar from '../components/Avatar';
import styles from './Settings.module.css';

const MESSAGE_COLOR_PRESETS = [
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
] as const;

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
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
      setError('Выберите изображение (PNG, JPG, WebP…)');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Размер файла не более 4 МБ');
      return;
    }
    setError('');
    setCropFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function uploadCropped(dataUrl: string) {
    setCropFile(null);
    setLoading(true);
    updateMyAvatar(dataUrl)
      .then(() => {
        refreshUser();
        if (user?.id) dispatchAvatarUpdated(user.id);
        showSuccess('Аватар обновлён');
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

  function handleColorSelect(color: string) {
    if (color === (user?.message_color ?? '#ffffff')) return;
    setError('');
    setSavingColor(true);
    updateMe({ message_color: color })
      .then(() => {
        refreshUser();
        showSuccess('Цвет сообщений обновлён');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingColor(false));
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
          <Button type="submit" variant="primary" disabled={savingName}>
            Сохранить
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Цвет сообщений</h2>
        <p className={styles.sectionDesc}>Цвет вашего имени в чатах</p>
        <div className={styles.colorGrid}>
          {MESSAGE_COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.colorSwatch} ${(user.message_color ?? '#ffffff') === color ? styles.colorSwatchSelected : ''}`}
              style={{ backgroundColor: color }}
              title={color}
              disabled={savingColor}
              onClick={() => handleColorSelect(color)}
              aria-label={`Цвет ${color}`}
            />
          ))}
        </div>
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
            <Button type="button" variant="primary" onClick={() => inputRef.current?.click()} disabled={loading}>
              {user.has_avatar ? 'Заменить' : 'Загрузить'}
            </Button>
            {user.has_avatar && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                Удалить
              </Button>
            )}
          </div>
        </div>
      </section>

      {cropFile ? (
        <AvatarCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={uploadCropped}
        />
      ) : null}
    </>
  );
}
