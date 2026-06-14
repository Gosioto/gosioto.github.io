import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDisplayName } from '../../utils/displayName';
import { IconSearch } from '../Icon/Icon';
import styles from './UserSearchCombobox.module.css';

export type UserSearchOption = {
  id: string;
  email: string;
  name: string | null;
};

type Props = {
  users: UserSearchOption[];
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function UserSearchCombobox({
  users,
  value,
  onChange,
  placeholder = 'Поиск пользователя…',
  disabled,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = users.find((u) => u.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 20);
    return users
      .filter((u) => formatDisplayName(u.name, u.email).toLowerCase().includes(q))
      .slice(0, 20);
  }, [users, query]);

  useEffect(() => {
    if (selected) setQuery(formatDisplayName(selected.name, selected.email));
  }, [selected]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.inputWrap}>
        <IconSearch size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.input}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange('');
          }}
        />
      </div>
      {open && filtered.length > 0 ? (
        <ul className={styles.list} role="listbox">
          {filtered.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className={`${styles.option} ${value === u.id ? styles.optionActive : ''}`}
                onClick={() => {
                  onChange(u.id);
                  setQuery(formatDisplayName(u.name, u.email));
                  setOpen(false);
                }}
              >
                {formatDisplayName(u.name, u.email)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
