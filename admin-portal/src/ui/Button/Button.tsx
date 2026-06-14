import { useCallback, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
};

export default function Button({ children, variant = 'primary', className, onClick, type = 'button', ...rest }: Props) {
  const [spring, setSpring] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setSpring(true);
      window.setTimeout(() => setSpring(false), 300);
      onClick?.(e);
    },
    [onClick]
  );

  const cls = [
    styles.button,
    variant === 'ghost' ? styles.ghost : variant === 'danger' ? styles.danger : styles.primary,
    spring ? styles.spring : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={cls} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}
