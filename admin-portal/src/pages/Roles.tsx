import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Button, useToast } from '../ui';
import { IconPlus } from '../ui/Icon/Icon';
import styles from './Roles.module.css';

const POLL_MS = 30_000;
const SLUG_REGEX = /^[a-z0-9_-]+$/;

function slugValid(s: string): boolean {
  return s.length > 0 && SLUG_REGEX.test(s);
}

export default function Roles() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleFull[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [error, setError] = useState('');

  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(null);
  const [editCodes, setEditCodes] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshRoles = useCallback(async () => {
    try {
      const r = await getRoles();
      setRoles(r);
    } catch {
      // ignore background refresh errors
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [r, g] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(r);
      setGroups(g);
    } catch {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
    const id = window.setInterval(() => void refreshRoles(), POLL_MS);
    return () => window.clearInterval(id);
  }, [loadInitial, refreshRoles]);

  const showSuccess = (msg: string) => {
    showToast('Готово', msg, 'success');
    setError('');
  };

  function openCreate() {
    setNewName('');
    setNewSlug('');
    setError('');
    setCreateOpen(true);
  }

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
      .then(async () => {
        setCreateOpen(false);
        setNewName('');
        setNewSlug('');
        showSuccess('Роль создана');
        await refreshRoles();
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
      .then(async () => {
        setPermissionsRoleId(null);
        showSuccess('Права сохранены');
        await refreshRoles();
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
      .then(async () => {
        setEditRoleId(null);
        showSuccess('Роль обновлена');
        await refreshRoles();
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
      .then(async () => {
        setDeleteRoleId(null);
        showSuccess('Роль удалена');
        await refreshRoles();
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка удаления'))
      .finally(() => setDeleting(false));
  }

  function renderRoleActions(role: RoleFull) {
    return (
      <div className={styles.roleActions}>
        <Button type="button" variant="primary" className={styles.buttonCompact} onClick={() => openPermissions(role)}>
          Настроить права
        </Button>
        {!role.is_system && (
          <>
            <Button type="button" variant="ghost" className={styles.buttonCompact} onClick={() => openEdit(role)}>
              Изменить
            </Button>
            <Button type="button" variant="danger" className={styles.buttonCompact} onClick={() => openDelete(role)}>
              Удалить
            </Button>
          </>
        )}
      </div>
    );
  }

  function renderRoleBadge(role: RoleFull) {
    return (
      <span className={role.is_system ? styles.badgeSystem : styles.badgeCustom}>
        {role.is_system ? 'системная' : 'пользовательская'}
      </span>
    );
  }

  if (loading) return <p className={styles.muted}>Загрузка…</p>;

  const roleToDelete = deleteRoleId ? roles.find((r) => r.id === deleteRoleId) : null;

  return (
    <>
      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>Роли</h1>
        <Button type="button" variant="primary" onClick={openCreate} title="Создать роль">
          <IconPlus size={18} />
        </Button>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Список ролей</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Код</th>
                <th>Тип</th>
                <th>Права</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className={styles.roleName}>{role.name}</td>
                  <td className={styles.roleSlug}>{role.slug}</td>
                  <td>{renderRoleBadge(role)}</td>
                  <td className={styles.roleMeta}>{role.permission_codes.length}</td>
                  <td>{renderRoleActions(role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.mobileCards}>
          {roles.map((role) => (
            <div key={role.id} className={styles.roleCard}>
              <div className={styles.roleInfo}>
                <div className={styles.roleNameRow}>
                  <span className={styles.roleName}>{role.name}</span>
                  <span className={styles.roleSlug}>{role.slug}</span>
                  {renderRoleBadge(role)}
                </div>
                <div className={styles.roleMeta}>Права: {role.permission_codes.length}</div>
              </div>
              {renderRoleActions(role)}
            </div>
          ))}
        </div>
      </section>

      {createOpen && (
        <div className={styles.modalOverlay} onClick={() => setCreateOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Создать роль</h3>
            <form onSubmit={handleCreate} className={styles.editForm}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Название</span>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например: Модератор"
                  className={styles.input}
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Код (slug)</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                  placeholder="moderator"
                  className={
                    styles.input +
                    (newSlug && !slugValid(newSlug.trim().toLowerCase()) ? ' ' + styles.inputInvalid : '')
                  }
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'Создание…' : 'Создать'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <Button type="button" variant="primary" onClick={savePermissions}>
                Сохранить
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPermissionsRoleId(null)}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

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
                <Button type="submit" variant="primary" disabled={savingEdit}>
                  Сохранить
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditRoleId(null)}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Удаление…' : 'Удалить'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDeleteRoleId(null)} disabled={deleting}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
