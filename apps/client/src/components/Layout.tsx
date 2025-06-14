import { useState, type ReactNode } from 'react';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import * as styles from '../styles/layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.appLayout}>
        <CollapsibleSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
