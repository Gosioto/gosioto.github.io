import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ContextMenu.module.css';

type ContextMenuActionItem = {
  id: string;
  type?: 'item';
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

type ContextMenuSeparator = {
  id: string;
  type: 'separator';
};

type ContextMenuLabel = {
  id: string;
  type: 'label';
  label: string;
};

export type ContextMenuItem = ContextMenuActionItem | ContextMenuSeparator | ContextMenuLabel;

type Props = {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
};

function itemHeight(item: ContextMenuItem): number {
  if (item.type === 'separator') return 9;
  if (item.type === 'label') return 28;
  return 40;
}

export default function ContextMenu({ open, x, y, items, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || items.length === 0) return null;

  const menuWidth = 220;
  const menuHeight = items.reduce((sum, item) => sum + itemHeight(item), 0) + 16;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} onContextMenu={(e) => e.preventDefault()} role="presentation">
      <ul
        className={styles.menu}
        style={{ left, top, minWidth: menuWidth }}
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item) => {
          if (item.type === 'separator') {
            return <li key={item.id} className={styles.separator} role="separator" />;
          }
          if (item.type === 'label') {
            return (
              <li key={item.id} className={styles.label} role="presentation">
                {item.label}
              </li>
            );
          }
          return (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`${styles.item} ${item.danger ? styles.itemDanger : ''}`}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick();
                  onClose();
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body,
  );
}
