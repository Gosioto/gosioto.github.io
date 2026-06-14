import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ruscordCreateGuildChannel,
  ruscordCreateInvite,
  ruscordDeleteServerIcon,
  ruscordListInvites,
  ruscordPatchServer,
  ruscordPatchServerIcon,
  ruscordRevokeInvite,
  type RuscordGuildChannel,
  type RuscordInvite,
  type RuscordServer,
} from '../api';
import AvatarCropper from '../ui/AvatarCropper/AvatarCropper';
import { Button } from '../ui';
import RuscordServerIcon from './RuscordServerIcon';
import styles from './ServerSettingsModal.module.css';

type TabId = 'general' | 'invites' | 'channels' | 'edit';

type Props = {
  server: RuscordServer;
  canManage: boolean;
  editMode: boolean;
  categoryChannels: RuscordGuildChannel[];
  onClose: () => void;
  onServerUpdated: (server: RuscordServer) => void;
  onEditModeChange: (value: boolean) => void;
  onChannelCreated: () => void;
};

export default function ServerSettingsModal({
  server,
  canManage,
  editMode,
  categoryChannels,
  onClose,
  onServerUpdated,
  onEditModeChange,
  onChannelCreated,
}: Props) {
  const [tab, setTab] = useState<TabId>('general');
  const [name, setName] = useState(server.name);
  const [iconCacheKey, setIconCacheKey] = useState(0);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [invites, setInvites] = useState<RuscordInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice' | 'category'>('text');
  const [newChannelParentId, setNewChannelParentId] = useState('');

  async function loadInvites() {
    setInvitesLoading(true);
    setError('');
    try {
      const list = await ruscordListInvites(server.id);
      setInvites(list);
    } catch (e) {
      setInvites([]);
      setError(e instanceof Error ? e.message : 'Не удалось загрузить приглашения');
    } finally {
      setInvitesLoading(false);
    }
  }

  function selectTab(next: TabId) {
    setTab(next);
    if (next === 'invites' && invites.length === 0 && !invitesLoading) void loadInvites();
  }

  async function saveGeneral() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError('');
    try {
      const updated = await ruscordPatchServer(server.id, { name: trimmed });
      onServerUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  }

  function onIconFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setCropFile(file);
  }

  async function uploadCroppedIcon(dataUrl: string) {
    setCropFile(null);
    setSaving(true);
    setError('');
    try {
      const updated = await ruscordPatchServerIcon(server.id, dataUrl);
      onServerUpdated(updated);
      setIconCacheKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить иконку');
    } finally {
      setSaving(false);
    }
  }

  async function removeIcon() {
    if (!server.has_icon) return;
    setSaving(true);
    setError('');
    try {
      const updated = await ruscordDeleteServerIcon(server.id);
      onServerUpdated(updated);
      setIconCacheKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить иконку');
    } finally {
      setSaving(false);
    }
  }

  async function createInvite() {
    setError('');
    try {
      const inv = await ruscordCreateInvite(server.id);
      setInviteCode(inv.code);
      await loadInvites();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать приглашение');
    }
  }

  async function revokeInvite(code: string) {
    setError('');
    try {
      await ruscordRevokeInvite(server.id, code);
      setInvites((prev) => prev.filter((i) => i.code !== code));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отозвать');
    }
  }

  async function createChannel() {
    const chName = newChannelName.trim();
    if (!chName) return;
    setError('');
    try {
      await ruscordCreateGuildChannel(server.id, {
        name: chName,
        channel_type: newChannelType,
        parent_id: newChannelParentId || null,
      });
      setNewChannelName('');
      setNewChannelType('text');
      setNewChannelParentId('');
      onChannelCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать канал');
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div className={styles.card} role="dialog" aria-labelledby="server-settings-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="server-settings-title" className={styles.title}>
          Настройки сервера
        </h2>
        <nav className={styles.tabs} aria-label="Разделы настроек">
          <button type="button" className={tab === 'general' ? styles.tabActive : styles.tab} onClick={() => selectTab('general')}>
            Имя и иконка
          </button>
          <button type="button" className={tab === 'invites' ? styles.tabActive : styles.tab} onClick={() => selectTab('invites')}>
            Приглашения
          </button>
          {canManage ? (
            <button type="button" className={tab === 'channels' ? styles.tabActive : styles.tab} onClick={() => selectTab('channels')}>
              Добавить канал
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className={tab === 'edit' ? styles.tabActive : styles.tab} onClick={() => selectTab('edit')}>
              Редактирование
            </button>
          ) : null}
        </nav>

        {error ? <p className={styles.error}>{error}</p> : null}

        {tab === 'general' ? (
          <div className={styles.panel}>
            <label className={styles.label}>
              Название
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} />
            </label>
            <div className={styles.label}>
              Иконка сервера
              <div className={styles.iconRow}>
                <div className={styles.iconPreview} aria-hidden>
                  <RuscordServerIcon
                    serverId={server.id}
                    hasIcon={server.has_icon}
                    fallbackLetter={server.name[0]}
                    className={styles.iconPreviewImg}
                    cacheKey={iconCacheKey}
                  />
                </div>
                {canManage ? (
                  <div className={styles.iconActions}>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenFile}
                      onChange={onIconFileChange}
                    />
                    <Button type="button" onClick={() => iconInputRef.current?.click()} disabled={saving}>
                      Загрузить
                    </Button>
                    {server.has_icon ? (
                      <Button type="button" variant="ghost" onClick={() => void removeIcon()} disabled={saving}>
                        Удалить
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            {canManage ? (
              <div className={styles.actions}>
                <Button onClick={() => void saveGeneral()} disabled={saving}>
                  Сохранить
                </Button>
              </div>
            ) : null}
            {server.chat_id ? (
              <p className={styles.groupChatLink}>
                <Link to={`/dashboard/chats/${server.chat_id}`}>Открыть групповой чат</Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === 'invites' ? (
          <div className={styles.panel}>
            {canManage ? (
              <div className={styles.actions}>
                <Button onClick={() => void createInvite()}>Создать код</Button>
              </div>
            ) : null}
            {inviteCode ? (
              <p className={styles.hint}>
                Код: <code className={styles.code}>{inviteCode}</code>
              </p>
            ) : null}
            {invitesLoading ? (
              <p className={styles.hint}>Загрузка…</p>
            ) : invites.length === 0 ? (
              <p className={styles.hint}>Нет активных приглашений</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Код</th>
                      <th>Исп.</th>
                      <th>Истекает</th>
                      {canManage ? <th /> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.code}>
                        <td>
                          <code className={styles.code}>{inv.code}</code>
                        </td>
                        <td>
                          {inv.uses}
                          {inv.max_uses != null ? ` / ${inv.max_uses}` : ''}
                        </td>
                        <td>{inv.expires_at ? new Date(inv.expires_at).toLocaleString() : '—'}</td>
                        {canManage ? (
                          <td>
                            <Button variant="danger" onClick={() => void revokeInvite(inv.code)}>
                              Отозвать
                            </Button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'channels' && canManage ? (
          <div className={styles.panel}>
            <label className={styles.label}>
              Название
              <input className={styles.input} value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="general" />
            </label>
            <label className={styles.label}>
              Тип
              <select className={styles.input} value={newChannelType} onChange={(e) => setNewChannelType(e.target.value as 'text' | 'voice' | 'category')}>
                <option value="text">Текстовый</option>
                <option value="voice">Голосовой</option>
                <option value="category">Категория</option>
              </select>
            </label>
            {newChannelType !== 'category' ? (
              <label className={styles.label}>
                Категория
                <select className={styles.input} value={newChannelParentId} onChange={(e) => setNewChannelParentId(e.target.value)}>
                  <option value="">Без категории</option>
                  {categoryChannels.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className={styles.actions}>
              <Button onClick={() => void createChannel()}>Создать канал</Button>
            </div>
          </div>
        ) : null}

        {tab === 'edit' && canManage ? (
          <div className={styles.panel}>
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={editMode} onChange={(e) => onEditModeChange(e.target.checked)} />
              <span>Режим редактирования каналов</span>
            </label>
            <p className={styles.hint}>
              Включите, чтобы переименовывать, удалять и перетаскивать каналы в списке слева.
            </p>
          </div>
        ) : null}

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>

      {cropFile ? (
        <AvatarCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={(dataUrl) => void uploadCroppedIcon(dataUrl)}
        />
      ) : null}
    </div>
  );
}
