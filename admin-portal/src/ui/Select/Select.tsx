import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

type Option = { value: string; label: string; disabled?: boolean };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  options: Option[];
};

export default function Select({ label, options, className, id, ...rest }: Props) {
  const selectId = id ?? (label ? `select-${label.replace(/\s+/g, '-')}` : undefined);
  return (
    <div className={`${styles.wrap} ${className ?? ''}`}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select id={selectId} className={styles.select} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
