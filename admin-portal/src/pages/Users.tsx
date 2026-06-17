import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import AvatarLightbox from '../components/AvatarLightbox';
import AvatarCropper from '../ui/AvatarCropper/AvatarCropper';
import { PasswordStrength, Button, Select, useToast, IconPlus, IconEdit, IconTrash, IconUpload } from '../ui';
import styles from './Users.module.css';

const POLL_MS = 30_000;

export default function Users() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const canWriteUsers = Boolean(me?.permissions?.includes('users.write'));
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<RoleFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
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
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropUserId, setCropUserId] = useState<string | null>(null);
  const avatarReplaceUserIdRef = useRef<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const blockedRole = useMemo(() => roles.find((r) => r.slug === 'blocked'), [roles]);

  const roleOptions = useMemo(
    () => [
      { value: '', label: '— Без роли —' },
      ...roles.map((r) => ({ value: r.id, label: r.name })),
    ],
    [roles],
  );

  const refreshLists = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([getUsers(), getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch {
      // ignore background refresh errors
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([getUsers(), getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
    const id = window.setInterval(() => void refreshLists(), POLL_MS);
    return () => window.clearInterval(id);
  }, [loadInitial, refreshLists]);

  const showSuccess = (msg: string) => {
    showToast('Готово', msg, 'success');
    setError('');
  };

  function openCreateModal() {
    setCreateEmail('');
    setCreateName('');
    setCreatePassword('');
    setError('');
    setCreateModalOpen(true);
  }

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
      .then(async () => {
        setCreateModalOpen(false);
        setCreateEmail('');
        setCreateName('');
        setCreatePassword('');
        showSuccess('Пользователь создан');
        await refreshLists();
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
      .then(async () => {
        setEditNameUserId(null);
        showSuccess('Имя обновлено');
        await refreshLists();
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
      .then(async () => {
        setResetPasswordUserId(null);
        setResetPasswordNew('');
        setResetPasswordConfirm('');
        showSuccess('Пароль изменён');
        await refreshLists();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingPassword(false));
  }

  function handleAssign(userId: string, roleId: string | null) {
    setAssigning(userId);
    setError('');
    const promise = roleId ? assignUserRole(userId, roleId) : removeUserRole(userId);
    promise
      .then(async () => {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u;
            if (!roleId) return { ...u, role: null };
            const role = roles.find((r) => r.id === roleId);
            return role
              ? {
                  ...u,
                  role: {
                    id: role.id,
                    name: role.name,
                    slug: role.slug,
                    is_system: role.is_system,
                    permission_codes: role.permission_codes,
                  },
                }
              : u;
          }),
        );
        showSuccess(roleId ? 'Роль назначена' : 'Роль снята');
        await refreshLists();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setAssigning(null));
  }

  function handleBlockUser(userId: string) {
    if (!blockedRole) return;
    handleAssign(userId, blockedRole.id);
  }

  function handleAvatarFileChange(userId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Выберите изображение');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Размер файла не более 4 МБ');
      return;
    }
    setError('');
    setCropUserId(userId);
    setCropFile(file);
    avatarReplaceUserIdRef.current = null;
    if (avatarFileRef.current) avatarFileRef.current.value = '';
  }

  function uploadCroppedAvatar(dataUrl: string) {
    const userId = cropUserId;
    setCropFile(null);
    setCropUserId(null);
    if (!userId) return;
    setError('');
    updateUserAvatar(userId, dataUrl)
      .then(async () => {
        dispatchAvatarUpdated(userId);
        showSuccess('Аватар обновлён');
        await refreshLists();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function handleDeleteUserAvatar(userId: string) {
    if (!confirm('Удалить аватар этого пользователя?')) return;
    setError('');
    deleteUserAvatar(userId)
      .then(async () => {
        setAvatarViewUserId(null);
        dispatchAvatarUpdated(userId);
        showSuccess('Аватар удалён');
        await refreshLists();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'));
  }

  function triggerAvatarReplace(userId: string) {
    avatarReplaceUserIdRef.current = userId;
    avatarFileRef.current?.click();
  }

  function renderUserAvatar(user: UserWithRole, size: number) {
    const fallback = user.name?.[0] || user.email[0];
    return (
      <div className={styles.avatarContainer} style={{ width: size, height: size }}>
        <button
          type="button"
          className={styles.avatarClick}
          onClick={() => setAvatarViewUserId(user.id)}
          title="Просмотр аватара"
        >
          <Avatar
            userId={user.id}
            fallbackLetter={fallback}
            size={size}
            className={styles.userAvatar}
          />
        </button>
        {canWriteUsers && (
          <>
            <button
              type="button"
              className={`${styles.avatarOverlayBtn} ${styles.avatarOverlayReplace}`}
              onClick={() => triggerAvatarReplace(user.id)}
              title="Заменить аватар"
            >
              <IconUpload size={12} />
            </button>
            {user.has_avatar && (
              <button
                type="button"
                className={`${styles.avatarOverlayBtn} ${styles.avatarOverlayDelete}`}
                onClick={() => handleDeleteUserAvatar(user.id)}
                title="Удалить аватар"
              >
                <IconTrash size={12} />
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  function renderUserName(user: UserWithRole) {
    return (
      <div className={styles.userNameRow}>
        {user.name ? <span className={styles.userName}>{user.name}</span> : null}
        {canWriteUsers && (
          <button
            type="button"
            className={styles.nameEditBtn}
            onClick={() => openEditName(user)}
            title="Изменить имя"
          >
            <IconEdit size={14} />
          </button>
        )}
      </div>
    );
  }

  function renderRoleControls(user: UserWithRole) {
    return (
      <div className={styles.roleControls}>
        <Select
          value={user.role?.id ?? ''}
          onChange={(e) => handleAssign(user.id, e.target.value || null)}
          disabled={assigning === user.id}
          className={styles.roleSelect}
          options={roleOptions}
        />
        {blockedRole && (
          <button
            type="button"
            className={styles.roleTrashBtn}
            onClick={() => handleBlockUser(user.id)}
            disabled={assigning === user.id || user.role?.id === blockedRole.id}
            title="Заблокировать"
          >
            <IconTrash size={16} />
          </button>
        )}
        {assigning === user.id && <span className={styles.loadingHint}>…</span>}
      </div>
    );
  }

  function renderUserActions(user: UserWithRole) {
    if (!canWriteUsers) return null;
    return (
      <div className={styles.userActions}>
        <Button
          type="button"
          variant="ghost"
          className={styles.buttonCompact}
          onClick={() => openResetPassword(user)}
          title="Сбросить пароль"
        >
          Пароль
        </Button>
      </div>
    );
  }

  if (loading) return <p className={styles.muted}>Загрузка…</p>;

  const userEditName = editNameUserId ? users.find((u) => u.id === editNameUserId) : null;
  const userResetPassword = resetPasswordUserId ? users.find((u) => u.id === resetPasswordUserId) : null;
  const avatarViewUser = avatarViewUserId ? users.find((u) => u.id === avatarViewUserId) : null;

  return (
    <div className={styles.usersPage}>
      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>Пользователи</h1>
        {canWriteUsers && (
          <Button
            type="button"
            variant="primary"
            className={styles.addBtn}
            onClick={openCreateModal}
            title="Создать пользователя"
          >
            <IconPlus size={20} />
          </Button>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Список пользователей</h2>
        {users.length === 0 ? (
          <div className={styles.empty}>Пользователей пока нет</div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Роль</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.tableUserCell}>
                          {renderUserAvatar(user, 40)}
                          <div className={styles.userInfo}>
                            <span className={styles.userEmail}>{user.email}</span>
                            {renderUserName(user)}
                          </div>
                        </div>
                      </td>
                      <td>{renderRoleControls(user)}</td>
                      <td>
                        <div className={styles.tableActionsCell}>{renderUserActions(user)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {users.map((user) => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userCardMain}>
                    {renderUserAvatar(user, 40)}
                    <div className={styles.userInfo}>
                      <span className={styles.userEmail}>{user.email}</span>
                      {renderUserName(user)}
                      <div className={styles.userMeta}>
                        {user.role ? `Роль: ${user.role.name}` : 'Роль не назначена'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.userCardActions}>
                    <div className={styles.cardActions}>
                      <span className={styles.roleLabel}>Роль:</span>
                      {renderRoleControls(user)}
                      {renderUserActions(user)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

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

      {createModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !creating && setCreateModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Создать пользователя</h3>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={styles.input}
                  autoFocus
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
              <div className={styles.modalActions}>
                <Button type="submit" variant="primary" disabled={creating}>
                  Создать
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={creating}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  autoFocus
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="submit" variant="primary" disabled={savingName}>
                  Сохранить
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditNameUserId(null)} disabled={savingName}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {avatarViewUser && (
        <AvatarLightbox
          userId={avatarViewUser.id}
          fallbackLetter={avatarViewUser.name?.[0] || avatarViewUser.email[0]}
          onClose={() => setAvatarViewUserId(null)}
        />
      )}

      {cropFile && (
        <AvatarCropper
          file={cropFile}
          onCancel={() => {
            setCropFile(null);
            setCropUserId(null);
          }}
          onConfirm={uploadCroppedAvatar}
        />
      )}

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
                <Button type="submit" variant="primary" disabled={savingPassword}>
                  Сменить пароль
                </Button>
                <Button type="button" variant="ghost" onClick={() => setResetPasswordUserId(null)} disabled={savingPassword}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
