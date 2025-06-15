import { type ReactNode, useState } from 'react';
import * as styles from '../styles/layout.css';
import { CollapsibleSidebar } from './CollapsibleSidebar';

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
        <main
          className={
            isSidebarCollapsed
              ? styles.mainContentCollapsed
              : styles.mainContent
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
