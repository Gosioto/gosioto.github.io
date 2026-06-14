import { useState, useEffect, useRef } from 'react';
import { dispatchAvatarUpdated } from '../avatarEvents';
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  assignUserRole,
  removeUserRole,
  updateUserAvatar,
  deleteUserAvatar,
  type UserWithRole,
  type RoleFull,
} from '../api';
import { useAuth } from '../auth';
import Avatar from '../components/Avatar';
import { PasswordStrength } from '../ui';
import styles from './Users.module.css';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

export default function Users() {
  const { user: me } = useAuth();
  const canWriteUsers = Boolean(me?.permissions?.includes('users.write'));
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<RoleFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);

  const [editNameUserId, setEditNameUserId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordNew, setResetPasswordNew] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarViewUserId, setAvatarViewUserId] = useState<string | null>(null);
  const avatarReplaceUserIdRef = useRef<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getUsers(), getRoles()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const email = createEmail.trim().toLowerCase();
    if (!email) {
      setError('Введите email');
      return;
    }
    if (createPassword.length < 6) {
      setError('Пароль не менее 6 символов');
      return;
    }
    setCreating(true);
    createUser({ email, name: createName.trim() || undefined, password: createPassword })
      .then((user) => {
        setUsers((prev) => [user, ...prev]);
        setCreateEmail('');
        setCreateName('');
        setCreatePassword('');
        showSuccess('Пользователь создан');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка создания'))
      .finally(() => setCreating(false));
  }

  function openEditName(user: UserWithRole) {
    setEditNameUserId(user.id);
    setEditNameValue(user.name || '');
    setError('');
  }

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!editNameUserId) return;
    setSavingName(true);
    setError('');
    updateUser(editNameUserId, { name: editNameValue.trim() || undefined })
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setEditNameUserId(null);
        showSuccess('Имя обновлено');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingName(false));
  }

  function openResetPassword(user: UserWithRole) {
    setResetPasswordUserId(user.id);
    setResetPasswordNew('');
    setResetPasswordConfirm('');
    setError('');
  }

  function saveResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetPasswordUserId) return;
    if (resetPasswordNew.length < 6) {
      setError('Пароль не менее 6 символов');
      return;
    }
    if (resetPasswordNew !== resetPasswordConfirm) {
      setError('Пароли не совпадают');
      return;
    }
    setSavingPassword(true);
    setError('');
    updateUser(resetPasswordUserId, { new_password: resetPasswordNew })
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setResetPasswordUserId(null);
        setResetPasswordNew('');
        setResetPasswordConfirm('');
        showSuccess('Пароль изменён');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingPassword(false));
  }

  function handleAssign(userId: string, roleId: string | null) {
    setAssigning(userId);
    setError('');
    const promise = roleId ? assignUserRole(userId, roleId) : removeUserRole(userId);
    promise
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u;
            const role = roleId ? roles.find((r) => r.id === roleId) ?? null : null;
            return { ...u, role };
          })
        );
        showSuccess(roleId ? 'Роль назначена' : 'Роль снята');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setAssigning(null));
  }

  function handleAvatarFileChange(userId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Выберите изображение');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Размер файла не более 2 МБ');
      return;
    }
    setError('');
    fileToBase64(file)
      .then((base64) => updateUserAvatar(userId, base64))
      .then(() => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, has_avatar: true } : u)));
        avatarReplaceUserIdRef.current = null;
        dispatchAvatarUpdated(userId);
        showSuccess('Аватар обновлён');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
    if (avatarFileRef.current) avatarFileRef.current.value = '';
  }

  function handleDeleteUserAvatar(userId: string) {
    if (!confirm('Удалить аватар этого пользователя?')) return;
    setError('');
    deleteUserAvatar(userId)
      .then(() => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, has_avatar: false } : u)));
        setAvatarViewUserId(null);
        dispatchAvatarUpdated(userId);
        showSuccess('Аватар удалён');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  if (loading) return <p className={styles.muted}>Загрузка…</p>;

  const userEditName = editNameUserId ? users.find((u) => u.id === editNameUserId) : null;
  const userResetPassword = resetPasswordUserId ? users.find((u) => u.id === resetPasswordUserId) : null;

  return (
    <div className={styles.usersPage}>
      <h1 className={styles.pageTitle}>Пользователи</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <section className={`${styles.section} ${styles.createSection}`}>
        <h2 className={styles.sectionTitle}>Создать пользователя</h2>
        <form onSubmit={handleCreate} className={styles.createForm} aria-label="Создание пользователя">
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="user@example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Имя</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Необязательно"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Пароль</label>
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Не менее 6 символов"
              className={styles.input}
            />
            <PasswordStrength password={createPassword} />
          </div>
          <button type="submit" className={styles.buttonPrimary} disabled={creating}>
            Создать
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Список пользователей</h2>
        {users.length === 0 ? (
          <div className={styles.empty}>Пользователей пока нет</div>
        ) : (
          <div className={styles.userList}>
            {users.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userCardMain}>
                  <div className={styles.userAvatarWrap}>
                    <Avatar
                      userId={user.id}
                      fallbackLetter={user.name?.[0] || user.email[0]}
                      size={40}
                      className={styles.userAvatar}
                    />
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userEmail}>{user.email}</span>
                    {user.name ? <span className={styles.userName}>{user.name}</span> : null}
                    <div className={styles.userMeta}>
                      {user.role ? `Роль: ${user.role.name}` : 'Роль не назначена'}
                    </div>
                  </div>
                </div>
                <div className={styles.userCardActions}>
                  {canWriteUsers && (
                    <div className={styles.avatarActions}>
                      <button
                        type="button"
                        className={styles.buttonSmall}
                        onClick={() => setAvatarViewUserId(avatarViewUserId === user.id ? null : user.id)}
                        title="Просмотр аватара"
                      >
                        Просмотр
                      </button>
                      <button
                        type="button"
                        className={styles.buttonSmall}
                        onClick={() => {
                          avatarReplaceUserIdRef.current = user.id;
                          avatarFileRef.current?.click();
                        }}
                        title="Заменить аватар"
                      >
                        Заменить
                      </button>
                      {user.has_avatar && (
                        <button
                          type="button"
                          className={`${styles.buttonSmall} ${styles.buttonDanger}`}
                          onClick={() => handleDeleteUserAvatar(user.id)}
                          title="Удалить аватар"
                        >
                          Удалить
                        </button>
                      )}
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const uid = avatarReplaceUserIdRef.current;
                          if (uid) {
                            handleAvatarFileChange(uid, e);
                            avatarReplaceUserIdRef.current = null;
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className={styles.cardActions}>
                    <span className={styles.roleLabel}>Роль:</span>
                    <select
                      value={user.role?.id ?? ''}
                      onChange={(e) => handleAssign(user.id, e.target.value || null)}
                      disabled={assigning === user.id}
                      className={styles.roleSelect}
                    >
                      <option value="">— Без роли —</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {user.role && (
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => handleAssign(user.id, null)}
                        disabled={assigning === user.id}
                        title="Снять роль"
                      >
                        Снять роль
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => openEditName(user)}
                      title="Изменить имя"
                    >
                      Имя
                    </button>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => openResetPassword(user)}
                      title="Сбросить пароль"
                    >
                      Пароль
                    </button>
                  </div>
                  {assigning === user.id && <span className={styles.loadingHint}>…</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Edit name */}
      {editNameUserId && userEditName && (
        <div className={styles.modalOverlay} onClick={() => setEditNameUserId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Изменить имя</h3>
            <p className={styles.muted} style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
              {userEditName.email}
            </p>
            <form onSubmit={saveName} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Имя</label>
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  placeholder="Имя пользователя"
                  className={styles.input}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.buttonPrimary} disabled={savingName}>
                  Сохранить
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setEditNameUserId(null)}
                  disabled={savingName}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View avatar */}
      {avatarViewUserId && (() => {
        const u = users.find((x) => x.id === avatarViewUserId);
        if (!u) return null;
        return (
          <div className={styles.modalOverlay} onClick={() => setAvatarViewUserId(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
              <h3 className={styles.modalTitle}>Аватар: {u.email}</h3>
              <div style={{ margin: '1rem 0' }}>
                <Avatar
                  userId={u.id}
                  fallbackLetter={u.name?.[0] || u.email[0]}
                  size={160}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setAvatarViewUserId(null)}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Reset password */}
      {resetPasswordUserId && userResetPassword && (
        <div className={styles.modalOverlay} onClick={() => setResetPasswordUserId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Сброс пароля</h3>
            <p className={styles.muted} style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
              {userResetPassword.email}
            </p>
            <form onSubmit={saveResetPassword} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Новый пароль</label>
                <input
                  type="password"
                  value={resetPasswordNew}
                  onChange={(e) => setResetPasswordNew(e.target.value)}
                  placeholder="Не менее 6 символов"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Повторите пароль</label>
                <input
                  type="password"
                  value={resetPasswordConfirm}
                  onChange={(e) => setResetPasswordConfirm(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className={styles.input}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.buttonPrimary} disabled={savingPassword}>
                  Сменить пароль
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setResetPasswordUserId(null)}
                  disabled={savingPassword}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
