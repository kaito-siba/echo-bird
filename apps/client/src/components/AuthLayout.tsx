import { type ReactNode } from 'react';
import * as styles from '../styles/layout.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.appContainer}>
        {children}
    </div>
  );
}