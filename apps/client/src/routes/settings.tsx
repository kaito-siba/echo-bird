import { createFileRoute } from '@tanstack/react-router';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  beforeLoad: authGuard,
});

function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
        設定
      </h1>
      <p style={{ color: '#666' }}>アプリケーション の設定を管理できます。</p>
    </div>
  );
}
