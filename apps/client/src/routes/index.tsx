import { createFileRoute, redirect } from '@tanstack/react-router';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/')({
  beforeLoad: authGuard,
  loader: () => {
    // ルートページにアクセスした場合はタイムラインにリダイレクト
    throw redirect({
      to: '/timeline',
    });
  },
});
