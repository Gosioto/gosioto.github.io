import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

type Props = {
  sidebar: ReactNode;
  children: ReactNode;
  bottomNav?: ReactNode;
};

export default function AppShell({ sidebar, children, bottomNav }: Props) {
  return (
    <div className={styles.wrap}>
      {sidebar}
      <main className={styles.main}>{children}</main>
      {bottomNav}
    </div>
  );
}
