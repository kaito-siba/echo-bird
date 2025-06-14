import { createFileRoute } from '@tanstack/react-router';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/bookmarks')({
  component: BookmarksPage,
  beforeLoad: authGuard,
});

function BookmarksPage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
        ブックマーク
      </h1>
      <p style={{ color: '#666' }}>
        ブックマークした ツイート が表示されます。
      </p>
    </div>
  );
}