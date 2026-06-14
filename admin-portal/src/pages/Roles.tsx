import { useState, useEffect, useMemo } from 'react';
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  updateRolePermissions,
  deleteRole,
  type RoleFull,
  type PermissionGroup,
} from '../api';
import styles from './Roles.module.css';

const SLUG_REGEX = /^[a-z0-9_-]+$/;

function slugValid(s: string): boolean {
  return s.length > 0 && SLUG_REGEX.test(s);
}

export default function Roles() {
  const [roles, setRoles] = useState<RoleFull[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(null);
  const [editCodes, setEditCodes] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getRoles(), getPermissions()])
      .then(([r, g]) => {
        setRoles(r);
        setGroups(g);
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
    const name = newName.trim();
    const slug = newSlug.trim().toLowerCase();
    if (!name) {
      setError('Введите название роли');
      return;
    }
    if (!slug) {
      setError('Введите код (slug) роли');
      return;
    }
    if (!slugValid(slug)) {
      setError('Код роли: только латиница в нижнем регистре, цифры, дефис и подчёркивание');
      return;
    }
    setCreating(true);
    createRole(name, slug)
      .then((role) => {
        setRoles((prev) => [...prev, role]);
        setNewName('');
        setNewSlug('');
        showSuccess('Роль создана');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка создания'))
      .finally(() => setCreating(false));
  }

  function openPermissions(role: RoleFull) {
    setPermissionsRoleId(role.id);
    setEditCodes([...role.permission_codes]);
    setPermissionSearch('');
  }

  function togglePermission(code: string) {
    setEditCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function setGroupSelection(groupCodes: string[], selected: boolean) {
    setEditCodes((prev) => {
      const set = new Set(prev);
      groupCodes.forEach((c) => (selected ? set.add(c) : set.delete(c)));
      return Array.from(set);
    });
  }

  const filteredGroups = useMemo((): PermissionGroup[] => {
    if (!permissionSearch.trim()) return groups;
    const q = permissionSearch.trim().toLowerCase();
    return groups
      .map(
        ([groupName, codes]): PermissionGroup => [
          groupName,
          codes.filter((c) => c.toLowerCase().includes(q) || groupName.toLowerCase().includes(q)),
        ],
      )
      .filter(([, codes]) => codes.length > 0);
  }, [groups, permissionSearch]);

  function savePermissions() {
    if (!permissionsRoleId) return;
    setError('');
    updateRolePermissions(permissionsRoleId, editCodes)
      .then((updated) => {
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setPermissionsRoleId(null);
        showSuccess('Права сохранены');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка сохранения'));
  }

  function openEdit(role: RoleFull) {
    if (role.is_system) return;
    setEditRoleId(role.id);
    setEditName(role.name);
    setEditSlug(role.slug);
    setError('');
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editRoleId) return;
    const name = editName.trim();
    const slug = editSlug.trim().toLowerCase();
    if (!name || !slug) {
      setError('Название и код не могут быть пустыми');
      return;
    }
    if (!slugValid(slug)) {
      setError('Код роли: только латиница в нижнем регистре, цифры, дефис и подчёркивание');
      return;
    }
    setSavingEdit(true);
    setError('');
    updateRole(editRoleId, { name, slug })
      .then((updated) => {
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setEditRoleId(null);
        showSuccess('Роль обновлена');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setSavingEdit(false));
  }

  function openDelete(role: RoleFull) {
    if (role.is_system) return;
    setDeleteRoleId(role.id);
    setError('');
  }

  function confirmDelete() {
    if (!deleteRoleId) return;
    setDeleting(true);
    setError('');
    deleteRole(deleteRoleId)
      .then(() => {
        setRoles((prev) => prev.filter((r) => r.id !== deleteRoleId));
        setDeleteRoleId(null);
        showSuccess('Роль удалена');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка удаления'))
      .finally(() => setDeleting(false));
  }

  if (loading) return <p className={styles.muted}>Загрузка…</p>;

  const roleToDelete = deleteRoleId ? roles.find((r) => r.id === deleteRoleId) : null;

  return (
    <>
      <h1 className={styles.pageTitle}>Роли</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Создать роль</h2>
        <form onSubmit={handleCreate} className={styles.createForm}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Название</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например: Модератор"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Код (slug)</span>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
              placeholder="moderator"
              className={styles.input + (newSlug && !slugValid(newSlug.trim().toLowerCase()) ? ' ' + styles.inputInvalid : '')}
            />
          </div>
          <button type="submit" className={styles.button} disabled={creating}>
            Создать
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Список ролей</h2>
        <div className={styles.roleList}>
          {roles.map((role) => (
            <div key={role.id} className={styles.roleCard}>
              <div className={styles.roleInfo}>
                <div className={styles.roleNameRow}>
                  <span className={styles.roleName}>{role.name}</span>
                  <span className={styles.roleSlug}>{role.slug}</span>
                  <span className={role.is_system ? styles.badgeSystem : styles.badgeCustom}>
                    {role.is_system ? 'системная' : 'пользовательская'}
                  </span>
                </div>
                <div className={styles.roleMeta}>
                  Права: {role.permission_codes.length}
                </div>
              </div>
              <div className={styles.roleActions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => openPermissions(role)}
                >
                  Настроить права
                </button>
                {!role.is_system && (
                  <>
                    <button
                      type="button"
                      className={styles.button + ' ' + styles.buttonSecondary}
                      onClick={() => openEdit(role)}
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      className={styles.button + ' ' + styles.buttonDanger}
                      onClick={() => openDelete(role)}
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal: Permissions */}
      {permissionsRoleId && (
        <div className={styles.modalOverlay} onClick={() => setPermissionsRoleId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3 className={styles.modalTitle}>Права роли</h3>
            <div className={styles.permissionSearch}>
              <input
                type="text"
                placeholder="Поиск по правам..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
              />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.permissionList}>
                {filteredGroups.map(([groupName, codes]) => (
                    <div key={groupName} className={styles.permissionGroup}>
                      <div className={styles.groupHeader}>
                        <span className={styles.groupName}>{groupName}</span>
                        <div className={styles.groupActions}>
                          <button
                            type="button"
                            className={styles.groupAction}
                            onClick={() => setGroupSelection(codes, true)}
                          >
                            Выбрать все
                          </button>
                          <button
                            type="button"
                            className={styles.groupAction}
                            onClick={() => setGroupSelection(codes, false)}
                          >
                            Снять все
                          </button>
                        </div>
                      </div>
                      <ul className={styles.permissionItems}>
                        {codes.map((code) => (
                          <li key={code} className={styles.permissionItem}>
                            <label>
                              <input
                                type="checkbox"
                                checked={editCodes.includes(code)}
                                onChange={() => togglePermission(code)}
                              />
                              <span>{code}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.button} onClick={savePermissions}>
                Сохранить
              </button>
              <button
                type="button"
                className={styles.button + ' ' + styles.buttonSecondary}
                onClick={() => setPermissionsRoleId(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit role */}
      {editRoleId && (
        <div className={styles.modalOverlay} onClick={() => setEditRoleId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Изменить роль</h3>
            <form onSubmit={saveEdit} className={styles.editForm}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Название</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Код (slug)</span>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                  className={styles.input + (editSlug && !slugValid(editSlug) ? ' ' + styles.inputInvalid : '')}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button} disabled={savingEdit}>
                  Сохранить
                </button>
                <button
                  type="button"
                  className={styles.button + ' ' + styles.buttonSecondary}
                  onClick={() => setEditRoleId(null)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete confirm */}
      {deleteRoleId && roleToDelete && (
        <div className={styles.modalOverlay} onClick={() => setDeleteRoleId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Удалить роль</h3>
            <p className={styles.deleteConfirmText}>
              Вы уверены, что хотите удалить роль{' '}
              <span className={styles.deleteConfirmName}>{roleToDelete.name}</span>? Назначения этой
              роли пользователям будут сняты.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.button + ' ' + styles.buttonDanger}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Удаление…' : 'Удалить'}
              </button>
              <button
                type="button"
                className={styles.button + ' ' + styles.buttonSecondary}
                onClick={() => setDeleteRoleId(null)}
                disabled={deleting}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
