import { useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { removeAuthToken } from '../integrations/tanstack-query/queries/auth';
import * as styles from '../styles/layout.css';

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CollapsibleSidebar({
  isCollapsed,
  onToggle,
}: CollapsibleSidebarProps) {
  // 現在のパスを取得してアクティブ状態を管理
  const location = useLocation();
  const navigate = useNavigate();

  // ログアウト処理
  const handleLogout = () => {
    // 確認ダイアログを表示
    if (window.confirm('ログアウトしますか？')) {
      // 認証トークンを削除
      removeAuthToken();
      // ログインページにリダイレクト
      navigate({ to: '/login' });
    }
  };

  const navItems = [
    {
      id: 'timeline',
      label: 'タイムライン',
      path: '/timeline',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
    },
    {
      id: 'bookmarks',
      label: 'ブックマーク',
      path: '/bookmarks',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'accounts',
      label: 'アカウント管理',
      path: '/target-accounts',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: '設定',
      path: '/settings',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
        </svg>
      ),
    },
  ];

  const stats = [
    { label: '総ツイート数', value: '1,234' },
    { label: '今日の取得数', value: '56' },
    { label: 'ブックマーク', value: '89' },
    { label: 'アカウント数', value: '3' },
  ];

  return (
    <aside className={isCollapsed ? styles.sidebarCollapsed : styles.sidebar}>
      {/* ヘッダー */}
      <div className={styles.sidebarHeader}>
        <h2
          className={
            isCollapsed ? styles.sidebarTitleHidden : styles.sidebarTitle
          }
        >
          Echo Bird
        </h2>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={
            isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* ナビゲーション */}
      <div
        className={
          isCollapsed ? styles.sidebarContentHidden : styles.sidebarContent
        }
      >
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            // 現在のパスと一致するかチェックしてアクティブ状態を決定
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={isActive ? styles.navItemActive : styles.navItem}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span
                  className={isCollapsed ? styles.navTextHidden : styles.navText}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 統計情報 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsTitle}>統計</h3>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ログアウトボタン */}
        <div className={styles.logoutSection}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <span className={styles.navIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span
              className={isCollapsed ? styles.navTextHidden : styles.navText}
            >
              ログアウト
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
